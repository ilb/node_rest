import PQueue from '@ilb/p-queue';
import NodeCache from 'node-cache';
import { v4 as uuidv4 } from 'uuid';

export default class QueueTaskManager {
  constructor(options) {
    this.cache = new NodeCache();
    this.queue = new PQueue(options);
    this.abortControllers = new Map();
  }

  addTask(task, { priority = 0, context = {} } = {}) {
    const uid = context.uid || uuidv4();
    const abortController = new AbortController();
    this.abortControllers.set(uid, abortController);
    this.queue.add(
      async () => {
        try {
          this.cache.set(uid, 'PENDING');
          const result = await task({
            ...context,
            taskUid: uid,
            signal: abortController.signal // Передаем signal в задачу
          });
          this.cache.set(uid, result, 10000);
        } catch (e) {
          if (e.name === 'AbortError') {
            this.cache.set(uid, { status: 'cancelled' }, 10000);
          } else {
            this.cache.set(uid, e, 10000);
          }
        } finally {
          this.abortControllers.delete(uid);
        }
      },
      { uid, priority }
    );
    return uid;
  }
  removeTask(uid) {
    const controller = this.abortControllers.get(uid);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(uid);
      return true;
    }
    return false;
  }
  getTaskStatus(uid) {
    if (!this.cache.has(uid)) {
      return 'NOT_FOUND';
    }
    const result = this.cache.get(uid);
    if (result === 'PENDING') {
      return 'PENDING';
    }
    if (result?.status === 'cancelled') {
      return 'CANCELLED';
    }
    if (result instanceof Error) {
      return 'ERROR';
    }
    return 'COMPLETED';
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
