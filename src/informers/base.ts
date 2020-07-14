import * as k8s from "@kubernetes/client-node";
import _ from "lodash";
import Queue from "p-queue";
export interface InformerIntrface {
  init(): void;
  addFunc(obj: object): void;
  updateFunc(obj: object): void;
  deleteFunc(obj: object): void;
  errorFunc(obj: object): void;
  start(): void;
  startWorker(): void;
  off(): void;
  generateKey(obj: object): string;
  parseKey(key): object;
}

export default class Informer implements InformerIntrface {
  protected kc: k8s.KubeConfig;
  protected k8sCustomObjectsApi: k8s.CustomObjectsApi;
  protected informer: k8s.Informer<unknown>;
  public queue: Queue;
  constructor(kc: k8s.KubeConfig) {
    this.kc = kc;
    this.k8sCustomObjectsApi = kc.makeApiClient(k8s.CustomObjectsApi);
    this.queue = new Queue({ concurrency: 1 });
    this.init();
  }
  addFunc(obj: object): void {}
  updateFunc(obj: object): void {}
  deleteFunc(obj: object): void {}
  errorFunc(obj: object): void {}
  generateKey(obj: object): string {
    return "";
  }
  parseKey(key: any): object {
    return undefined;
  }
  init(): void {}
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
}
