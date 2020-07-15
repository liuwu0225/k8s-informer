import _ from "lodash";
import PQueue from "p-queue";
export interface QueueItem {
  key: string;
  func: () => unknown;
}
export default class Queue {
  private items: QueueItem[] = [];
  private deduplicate: boolean = true;
  private queue: PQueue;
  constructor(deduplicate: boolean = true) {
    this.deduplicate = deduplicate;
    this.queue = new PQueue({ concurrency: 1 });
  }
  start(): void {
    this.queue.start();
  }
  add(item: QueueItem): void {
    if (this.deduplicate) {
      if (
        _.find(this.items, (data) => {
          return data.key === item.key;
        })
      )
        return;
    }

    this.items.push(item);
    this.queue.add(item.func);
  }
  get(): QueueItem {
    return this.items[0];
  }
  done(key: string): void {
    _.remove(this.items, (item) => {
      return item.key === key;
    });
  }
}
