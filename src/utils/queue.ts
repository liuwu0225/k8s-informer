export interface QueueInterface {
  add(key: string): void;
}
export default class Queue implements QueueInterface {
  constructor() {}
  add(key: string): void {
    throw new Error("Method not implemented.");
  }
}
