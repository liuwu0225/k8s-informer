import { Component } from "../../k8s/types";
import * as k8s from "@kubernetes/client-node";
import _ from "lodash";
import KubernetesService from "../../services/k8sService";
import { makeInformer, Informer } from "../../k8s/informer";

export default class JobManager {
  private kc: k8s.KubeConfig;
  private name: string;
  private namespace: string;
  private deployment: k8s.V1Deployment;
  private informer: Informer<unknown>;
  private k8sService: KubernetesService;
  private k8sAppsV1Client: k8s.AppsV1Api;
  constructor(namespace: string, data: Component) {
    this.name = data.name;
    this.namespace = namespace;

    this.kc = new k8s.KubeConfig();
    this.kc.loadFromDefault();

    this.k8sService = new KubernetesService();
    this.k8sAppsV1Client = this.kc.makeApiClient(k8s.AppsV1Api);

    this.createDeployment(namespace, data);
  }

  public start() {}
  private makeInformer() {
    const listFn = () =>
      this.k8sAppsV1Client.readNamespacedDeployment(
        this.getChildName(),
        this.namespace
      );

    this.informer = makeInformer(this.kc, this.getPath(), listFn);
  }
  private async createDeployment(namespace: string, data: Component) {
    const container = new k8s.V1Container();

    container.name = this.getChildName();
    container.image = data.image;
    container.imagePullPolicy = "IfNotPresent";

    _.set(this.deployment, "spec.template.spec.containers", [container]);
    _.set(this.deployment, "metadata.name", this.getChildName());
    _.set(this.deployment, "spec.selector.matchLabels", {
      app: this.getChildName(),
    });
    _.set(this.deployment, "spec.template.metadata.labels", {
      app: this.getChildName(),
      "x4.sap.com/managed-by": "xman-informer",
    });

    await this.k8sService.applyDeployment(namespace, this.deployment);

    this.makeInformer();
  }
  private getChildName(): string {
    return `${this.namespace}-${this.name}-k8s-informer-deployment`;
  }
  private getPath() {
    return `/apis/apps/v1/namespaces/${
      this.namespace
    }/deployments/${this.getChildName()}`;
  }
}
