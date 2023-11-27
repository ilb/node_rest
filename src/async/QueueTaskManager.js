import PQueue from '@ilb/p-queue';
import NodeCache from 'node-cache';
import { v4 as uuidv4 } from 'uuid';

export default class QueueTaskManager {
  constructor(options) {
    this.cache = new NodeCache();
    this.queue = new PQueue(options);
  }

  addTask(task, { priority = 0, context = {} } = {}) {
    const uid = uuidv4();
    this.queue.add(
      async () => {
        try {
          const result = await task({ ...context, taskUid: uid });
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
    return this.queue.sizeBy({ uid }) > 0 || this.queue.pending > 0 || this.cache.has(uid);
  }
  isDone(uid) {
    // const result = this.cache.get(uid);
    return this.cache.has(uid);
  }
  getResult(uid) {
    return this.cache.get(uid);
  }
}
