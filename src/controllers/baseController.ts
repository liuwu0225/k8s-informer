import Informer from "../informers/informer";

interface BaseControllerInterface {
  initInformer(): void;
  start(): void;
  sync(): void;
}
export default class BaseController implements BaseControllerInterface {
  protected informer: Informer;
  constructor() {
    this.initInformer();
  }
  initInformer(): void {}
  start(): void {}
  sync(): void {}
}
