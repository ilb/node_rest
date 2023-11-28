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
          this.cache.set(uid, 'PENDING');
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
    return this.cache.has(uid);
  }
  isDone(uid) {
    return this.cache.has(uid) && this.cache.get(uid) !== 'PENDING';
  }
  getResult(uid) {
    return this.cache.get(uid);
  }
}
