import _ from "lodash";

export interface QueueInterface {
  add(key: string): void;
  get(): string;
  done(key): void;
}
export default class Queue implements QueueInterface {
  private queue: string[] = [];
  private deduplicate: boolean = true;
  constructor(deduplicate: boolean = true) {
    this.deduplicate = deduplicate;
  }
  add(key: string): void {
    if (this.deduplicate) {
      if (_.indexOf(this.queue, key) > -1) return;
    }
    this.queue.push(key);
  }
  get(): string {
    return this.queue[0];
  }
  done(key: string): void {
    _.remove(this.queue, (k) => {
      return k === key;
    });
  }
}
