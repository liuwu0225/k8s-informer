import BaseController from "./baseController";
import { makeInformer, Informer } from "../k8s/informer";
import * as k8s from "@kubernetes/client-node";
import Queue from "../utils/queue";
import StringHelper from "../utils/stringHelper";
import _ from "lodash";
import { Application, Component } from "../k8s/types";
import KubernetesService from "../services/k8sService";

export default class AppController extends BaseController {
  private kc: k8s.KubeConfig;
  private informer: Informer<unknown>;
  private childInformers: { name: string; informer: Informer<unknown> }[];
  private k8sService: KubernetesService;
  private k8sAppsV1Client: k8s.AppsV1Api;
  public queue: Queue;
  public updateQueue: Queue;
  constructor(kc: k8s.KubeConfig) {
    super();
    this.kc = kc;
    this.childInformers = [];
    this.k8sService = new KubernetesService();
    this.k8sAppsV1Client = kc.makeApiClient(k8s.AppsV1Api);
    this.queue = new Queue();
    this.updateQueue = new Queue();
    this.initInformer();
  }
  initInformer() {
    const k8sCustomObjectsApi = this.kc.makeApiClient(k8s.CustomObjectsApi);
    const listFn = () =>
      k8sCustomObjectsApi.listClusterCustomObject("x4.sap.com", "v1", "x4apps");
    this.informer = makeInformer(this.kc, "/apis/x4.sap.com/v1/x4apps", listFn);
    this.attachEventHandlers();
  }
  start() {
    console.log("Start watching x4 application......");
    this.informer.start();
    this.queue.start();
    this.updateQueue.start();
  }
  attachEventHandlers() {
    this.informer.on("add", this.add.bind(this));
    this.informer.on("update", this.update.bind(this));
    this.informer.on("delete", this.delete.bind(this));
    this.informer.on("error", this.error.bind(this));
  }
  add(obj: object) {
    const key = `add/${StringHelper.generateAppKey(obj)}`;
    this.queue.add({
      key,
      func: this.sync.bind({
        context: this,
        key,
        operation: "ADD",
      }),
    });
  }
  update(obj: object) {
    const key = `update/${StringHelper.generateAppKey(obj)}`;
    this.queue.add({
      key,
      func: this.sync.bind({
        context: this,
        key,
        operation: "Update",
      }),
    });
  }
  delete(obj: object) {
    const key = `delete/${StringHelper.generateAppKey(obj)}`;
    // this.queue.add({
    //   key,
    //   func: this.sync.bind({
    //     context: this,
    //     key,
    //     operation: "Delete",
    //   }),
    // });
  }
  error(err) {
    console.error(err);
    // Restart informer after 5sec
    setTimeout(() => {
      this.informer.start();
    }, 5000);
  }
  async sync() {
    const that = _.get(this, "context");
    const key = _.get(this, "key");

    // get latest resource and sync
    const parentCurrent = await that._getParentCurrent(key);
    await that.syncParent(parentCurrent);

    that._dequeue(_.get(that, "queue"), key);
  }
  async syncParent(app: Application) {
    await this.syncChildren(app.spec.components, app.metadata.namespace);
  }
  async syncChildren(children: Component[], namespace: string) {
    for (const child of children) {
      await this.applyChildResource(child, namespace);
    }
  }
  async applyChildResource(child: Component, namespace: string) {
    if (child.type === "lockmanager") {
      const deployment = new k8s.V1Deployment();
      const container = new k8s.V1Container();

      container.image = child.image;
      container.imagePullPolicy = "IfNotPresent";
      container.name = "k8s-informer-test-deployment";

      _.set(deployment, "spec.template.spec.containers", [container]);
      _.set(deployment, "metadata.name", "k8s-informer-test-deployment");
      _.set(deployment, "spec.selector.matchLabels", {
        app: "k8s-informer-test-deployment",
      });
      _.set(deployment, "spec.template.metadata.labels", {
        app: "k8s-informer-test-deployment",
      });

      await this.k8sService.applyDeployment(namespace, deployment);
      this.addChildInformer(child, namespace);
    }
  }

  private addChildInformer(child: Component, namespace: string): void {
    if (!this.childInformerExists(child.name)) {
      const path = "/apis/apps/v1/namespaces/x4-bc-local/deployments";
      const listFn = () =>
        this.k8sAppsV1Client.listNamespacedDeployment(namespace);

      const informer = k8s.makeInformer(this.kc, path, listFn);
      informer.on("add", (obj: k8s.V1Deployment) => {
        console.log(`Added Deployment: ${obj.metadata!.name}`);
      });
      informer.on("update", (obj: k8s.V1Deployment) => {
        console.log(`================update=================`);
        this.updateQueue.add({
          key: child.name,
          func: this.updateApplication.bind({
            key: child.name,
            appName: "x4-bc-local",
            namespace,
            obj,
            updateQueue: this.updateQueue,
          }),
        });
        // this.updateApplication("x4-bc-local", namespace, obj);
      });
      informer.on("delete", (obj: k8s.V1Deployment) => {
        console.log(`Deleted Deployment: ${obj.metadata!.name}`);
      });
      informer.on("error", (err: k8s.V1Deployment) => {
        console.error(err);
        // Restart informer after 5sec
        setTimeout(() => {
          informer.start();
        }, 5000);
      });

      informer.start();

      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      this.childInformers.push({ name: child.name, informer });
    }
  }

  private async updateApplication() {
    const sleep = (milliseconds) => {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };
    await sleep(10000);
    console.log(
      `Deployment ${_.get(this, "obj.metadata.name")} in namespace ${_.get(
        this,
        "namespace"
      )} belongs to app ${_.get(this, "appName")} updated.`
    );

    _.get(this, "updateQueue").done(_.get(this, "key"));
  }

  private childInformerExists(name: string): boolean {
    return (
      _.find(this.childInformers, (ci) => {
        return ci.name === name;
      }) !== undefined
    );
  }

  private async _getParentCurrent(key: string): Promise<Application> {
    const parentObject = StringHelper.parseAppKey(key);
    return this.k8sService.readNamespacedCustomResource(
      parentObject.group,
      parentObject.version,
      parentObject.namespace,
      parentObject.plural,
      parentObject.name
    ) as Application;
  }

  private _dequeue(queue: Queue, key: string) {
    queue.done(key);
  }
}
