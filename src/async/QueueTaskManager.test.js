import { jest } from '@jest/globals';
import delay from 'delay';
import QueueTaskManager from './QueueTaskManager';

const task = jest.fn();

describe('addTask()', () => {
  describe('When adding a new task', () => {
    test('It should show up in queue', async () => {
      const tm = new QueueTaskManager();
      tm.addTask(task);
      expect(tm.queue.pending).toStrictEqual(1);
    });
  });

  describe('When context exists', () => {
    test('It should be passed to the task', async () => {
      task.mockImplementationOnce(async ({ contextValue }) => {
        return { value: 100 + contextValue };
      });
      const tm = new QueueTaskManager();
      const uid = tm.addTask(task, { context: { contextValue: 100 } });

      while (!tm.isDone(uid)) {
        await delay(500);
      }
      const result = await tm.getResult(uid);
      expect(result).toStrictEqual({ value: 200 });
    });
  });
});

describe('isDone()', () => {
  describe('When task is running', () => {
    test('Complete status should be false', () => {
      const tm = new QueueTaskManager();
      const uid = tm.addTask(task);
      expect(tm.isDone(uid)).toBe(false);
    });
  });

  describe('When task is complete', () => {
    test('Complete status should be true', async () => {
      const tm = new QueueTaskManager();
      const uid = tm.addTask(task);

      while (!tm.isDone(uid)) {
        await delay(500);
      }
      expect(tm.isDone(uid)).toBe(true);
    });
  });
});

describe('getResult', () => {
  describe('When task is completed successfully', () => {
    test('Queue should return task result', async () => {
      task.mockImplementationOnce(async () => ({
        value: 100
      }));
      const tm = new QueueTaskManager();
      const uid = tm.addTask(task);

      while (!tm.isDone(uid)) {
        await delay(500);
      }
      const result = await tm.getResult(uid);
      expect(result).toStrictEqual({ value: 100 });
    });
  });

  describe('When task is completed with error', () => {
    test('Queue should return exception', async () => {
      task.mockImplementationOnce(async () => {
        throw new Error();
      });
      const tm = new QueueTaskManager();
      const uid = tm.addTask(task);

      while (!tm.isDone(uid)) {
        await delay(500);
      }
      const result = await tm.getResult(uid);
      expect(result).toBeInstanceOf(Error);
    });
  });
});
