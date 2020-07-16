import Informer from "../informers/informer";

interface BaseControllerInterface {
  initInformer(): void;
  start(): void;
  sync(): void;
}
export default class BaseController implements BaseControllerInterface {
  constructor() {}
  initInformer(): void {}
  start(): void {}
  sync(): void {}
}
