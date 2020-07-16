import BaseController from "./baseController";
import { makeInformer, Informer } from "../k8s/informer";
import * as k8s from "@kubernetes/client-node";
import Queue from "../utils/queue";
import StringHelper from "../utils/stringHelper";
import _ from "lodash";

export default class AppController extends BaseController {
  private kc: k8s.KubeConfig;
  private informer: Informer<unknown>;
  public queue: Queue;
  constructor(kc: k8s.KubeConfig) {
    super();
    this.kc = kc;
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
    this.informer.start();
    this.queue.start();
  }
  sync() {}
  attachEventHandlers() {
    this.informer.on("add", this.add.bind(this));
    this.informer.on("update", this.update.bind(this));
    this.informer.on("delete", this.delete.bind(this));
    this.informer.on("error", this.error.bind(this));
  }
  add(obj: object) {
    this.queue.add({
      key: StringHelper.generateKey(obj),
      func: this.enqueueParentObject.bind({ obj }),
    });
  }
  update() {}
  delete() {}
  error(err) {
    console.error(err);
    // Restart informer after 5sec
    setTimeout(() => {
      this.informer.start();
    }, 5000);
  }
  enqueueParentObject() {
    const obj = _.get(this, "obj");
    console.log(obj);
  }
}
