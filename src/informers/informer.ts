import * as k8s from "@kubernetes/client-node";
import _ from "lodash";
import Queue from "../utils/queue";
export interface EventHandler {
  AddFunc: () => unknown;
  DeleteFunc: () => unknown;
  UpdateFunc: () => unknown;
  ErrorFunc: () => unknown;
}

export default class Informer {
  protected informer: k8s.Informer<unknown>;
  public queue: Queue;
  constructor(
    kc: k8s.KubeConfig,
    path: string,
    listFn: k8s.ListPromise<unknown>,
    eventHandlers: EventHandler
  ) {
    this.queue = new Queue();
    this.informer = k8s.makeInformer(kc, path, listFn);
    this.attachEventHandler(eventHandlers);
  }
  start(): void {
    this.informer.start();
    this.startWorker();
  }
  startWorker(): void {
    this.queue.start();
  }
  off(): void {
    throw new Error("Method not implemented.");
  }
  attachEventHandler(eventHandlers: EventHandler): void {
    this.informer.on("add", eventHandlers.AddFunc);
    this.informer.on("update", eventHandlers.UpdateFunc);
    this.informer.on("delete", eventHandlers.DeleteFunc);
    this.informer.on("error", eventHandlers.ErrorFunc);
  }
}
