import TaskManager from './TaskManager';
import PQueue from '@ilb/p-queue';
import NodeCache from 'node-cache';
import { v4 as uuidv4 } from 'uuid';

export default class QueueTaskManager extends TaskManager {
  constructor(options) {
    super();
    this.cache = new NodeCache();
    this.queue = new PQueue(options);
  }

  addTask({ priority = 0, handler }) {
    const uid = uuidv4();
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
    return uid;
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
