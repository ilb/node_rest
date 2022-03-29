import TaskManager from './TaskManager';
import PQueue from '@ilb/p-queue';
import NodeCache from 'node-cache';

export default class QueueTaskManager extends TaskManager {
  constructor(options) {
    super();
    this.cache = new NodeCache();
    this.queue = new PQueue(options);
  }

  addTask({ uid, priority, handler }) {
    this.queue.add(
      async () => {
        try {
          const result = await handler();
          this.cache.set(uid, result, 10000);
        } catch (e) {
          this.cache.set(uid, e, 10000);
        }
      },
      { uid, priority }
    );
  }
  exists(uid) {
    return this.queue.sizeBy({ uid }) > 0;
  }
  isDone(uid) {
    // const result = this.cache.get(uid);
    return this.cache.get(uid) !== undefined;
  }
  getResult(uid) {
    return this.cache.get(uid);
  }
}
