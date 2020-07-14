import Informer from "./base";
import * as k8s from "@kubernetes/client-node";
import _ from "lodash";

export default class ApplicationVersionInformer extends Informer {
  init(): void {
    // wrap k8sCustomObjectsApi.listClusterCustomObject, return type match k8s.makeInformer listPromiseFn
    const listFn = async () => {
      const object = await this.k8sCustomObjectsApi.listClusterCustomObject(
        "x4.sap.com",
        "v1",
        "x4appvers"
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
      "/apis/x4.sap.com/v1/x4appvers",
      listFn
    );

    // add informer envent handler
    this.informer.on("add", this.addFunc);
    this.informer.on("update", this.updateFunc);
    this.informer.on("delete", this.deleteFunc);
    this.informer.on("error", this.errorFunc);
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
