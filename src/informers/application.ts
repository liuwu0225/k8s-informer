import Informer from "./base";
import * as k8s from "@kubernetes/client-node";
import Queue from "../utils/queue";
import _ from "lodash";

export default class ApplicationInformer extends Informer {
  constructor(kc: k8s.KubeConfig) {
    super();
    this.kc = kc;
    this.k8sCustomObjectsApi = kc.makeApiClient(k8s.CustomObjectsApi);
    this.queue = new Queue();
    this.init();
  }
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
    this.informer.on("add", this.addFunc);
    this.informer.on("update", this.updateFunc);
    this.informer.on("delete", this.deleteFunc);
    this.informer.on("error", this.errorFunc);
  }
}
