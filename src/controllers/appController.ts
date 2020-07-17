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
  private k8sService: KubernetesService;
  public queue: Queue;
  constructor(kc: k8s.KubeConfig) {
    super();
    this.kc = kc;
    this.k8sService = new KubernetesService();
    this.queue = new Queue();
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
    const children: Component[] = app.spec.components;
    await this.syncChildren(children, app.metadata.namespace);
  }
  async syncChildren(children: Component[], namespace: string) {
    for (const child of children) {
      await this.applyChild(child, namespace);
    }
  }
  async applyChild(child: Component, namespace: string) {
    if (child.type === "lockmanager") {
      const deployment = new k8s.V1Deployment();
      const container = new k8s.V1Container();

      container.image = child.image;
      container.imagePullPolicy = "IfNotPresent";

      _.set(deployment, "spec.template.spec.containers", [container]);
      _.set(deployment, "metadata.name", "k8s-informer-test-deployment");

      await this.k8sService.applyDeployment(namespace, deployment);
    }
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
