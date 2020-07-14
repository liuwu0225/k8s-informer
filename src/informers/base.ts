import * as k8s from "@kubernetes/client-node";
import _ from "lodash";
import Queue from "../utils/queue";
export interface InformerIntrface {
  init(): void;
  addFunc(obj: object): void;
  updateFunc(obj: object): void;
  deleteFunc(obj: object): void;
  errorFunc(obj: object): void;
  start(): void;
  off(): void;
}

export default class Informer implements InformerIntrface {
  protected kc: k8s.KubeConfig;
  protected k8sCustomObjectsApi: k8s.CustomObjectsApi;
  protected informer: k8s.Informer<unknown>;
  public queue: Queue;
  constructor() {}
  init(): void {}
  start(): void {
    this.informer.start();
  }
  off(): void {
    throw new Error("Method not implemented.");
  }
  addFunc(obj: object): void {
    console.log(
      `Added: ${_.get(obj, "metadata.namespace")}/${_.get(
        obj,
        "metadata.name"
      )}`
    );
  }
  updateFunc(obj: object): void {
    console.log(
      `Updated: ${_.get(obj, "metadata.namespace")}/${_.get(
        obj,
        "metadata.name"
      )}`
    );
  }
  deleteFunc(obj: object): void {
    console.log(
      `Deleted: ${_.get(obj, "metadata.namespace")}/${_.get(
        obj,
        "metadata.name"
      )}`
    );
  }
  errorFunc(err: object): void {
    console.error(err);
    // Restart informer after 5sec
    setTimeout(() => {
      this.informer.start();
    }, 5000);
  }
}
