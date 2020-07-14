import Informer from "./base";
import * as k8s from "@kubernetes/client-node";
import _ from "lodash";

export default class ApplicationInformer extends Informer {
  init(): void {
    // wrap k8sCustomObjectsApi.listClusterCustomObject, return type match k8s.makeInformer listPromiseFn
    const listFn = async () => {
      const object = await this.k8sCustomObjectsApi.listClusterCustomObject(
        "x4.sap.com",
        "v1",
        "x4apps"
      );
      return {
        response: object.response,
        body: {
          apiVersion: _.get(object.body, "apiVersion"),
          kind: _.get(object.body, "kind"),
          metadata: _.get(object.body, "metadata"),
          items: _.get(object.body, "items"),
        },
      };
    };

    this.informer = k8s.makeInformer(
      this.kc,
      "/apis/x4.sap.com/v1/x4apps",
      listFn
    );

    // add informer envent handler
    this.informer.on("add", this.addFunc.bind(this));
    this.informer.on("update", this.updateFunc.bind(this));
    this.informer.on("delete", this.deleteFunc.bind(this));
    this.informer.on("error", this.errorFunc.bind(this));
  }
  addFunc(obj: object): void {
    // console.log(this.generateKey(obj));
    this.queue.add(() => {
      console.log(`Added: ${this.generateKey(obj)}`);
    });
  }
  updateFunc(obj: object): void {
    this.queue.add(() => {
      console.log(`Updated: ${this.generateKey(obj)}`);
    });
  }
  deleteFunc(obj: object): void {
    this.queue.add(() => {
      console.log(`Deleted: ${this.generateKey(obj)}`);
    });
  }
  errorFunc(err: object): void {
    console.error(err);
    // Restart informer after 5sec
    setTimeout(() => {
      this.informer.start();
    }, 5000);
  }
  generateKey(obj: object): string {
    return `/apis/x4.sap.com/v1/x4apps/${_.get(
      obj,
      "metadata.namespace"
    )}/${_.get(obj, "metadata.name")}`;
  }
}
