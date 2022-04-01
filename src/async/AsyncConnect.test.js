import { jest } from '@jest/globals';
import delay from 'delay';
import { testApiHandler } from 'next-test-api-route-handler';
import AsyncConnect from './AsyncConnect';
import QueueTaskManager from './QueueTaskManager';
import Response from './Response';

let task;
let taskManager;
let RouteWithAsyncConnect;

beforeAll(async () => {
  task = jest.fn();
  taskManager = new QueueTaskManager();
  jest.unstable_mockModule(
    'mocks/routeWithAsyncConnect',
    () => ({
      __esModule: true,
      default: AsyncConnect({
        path: '/api/queues/test',
        taskManager,
        task,
        onError: (err, req, res, next) => {
          res.status(err.status || 500).write(err.message);
          next();
        }
      })
    }),
    { virtual: true }
  );

  RouteWithAsyncConnect = await import('mocks/routeWithAsyncConnect');
});

describe('AsyncConnect()', () => {
  describe('When calling AsyncConnect', () => {
    test('API path, task manager and task should be defined', () => {
      expect(() => AsyncConnect()).toThrow();
      expect(() => AsyncConnect({ path: '/api/test' })).toThrow();
      expect(() => AsyncConnect({ path: '/api/test', taskManager: {} })).toThrow();
    });
  });
});

describe('addTask()', () => {
  describe('When adding a new task through helper', () => {
    test('It should return function to execute response', () => {
      const response = {
        redirect: jest.fn()
      };
      const executeResponse = RouteWithAsyncConnect.default.addTask();
      executeResponse(response);
      expect(response.redirect).toBeCalledWith(303, expect.stringMatching('/api/queues/test'));
    });
  });
  describe('When POSTing a new task', () => {
    test('Route should redirect to the getting result route', async () => {
      await testApiHandler({
        url: '/api/queues/test',
        handler: RouteWithAsyncConnect,
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'POST', redirect: 'manual' });
          expect(res.status).toBe(303);
          expect(res.headers.get('location')).toMatch('/api/queues/test');
        }
      });
    });
    test('Route should pass request body to the queue as context', async () => {
      task.mockImplementationOnce(async ({ contextValue }) => {
        return { value: 100 + contextValue };
      });
      await testApiHandler({
        url: '/api/queues/test',
        handler: RouteWithAsyncConnect,
        test: async ({ fetch }) => {
          const res = await fetch({
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify({ contextValue: 100 }),
            headers: {
              'Content-Type': 'application/json'
            }
          });
          const location = res.headers.get('location');
          const uuid = location.split('test/')[1];
          expect(taskManager.getResult(uuid)).toStrictEqual({ value: 200 });
        }
      });
    });
  });
});

describe('getTask()', () => {
  describe('When task with given uuid is not exists', () => {
    test('Route should return status 404', async () => {
      await testApiHandler({
        url: '/api/queues/test/44dc6925-0345-42b3-859e-20b01c9bd619',
        handler: RouteWithAsyncConnect,
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(404);
        }
      });
    });
  });

  describe('When task with given uuid is running', () => {
    test('Route should return status 202 with Refresh header', async () => {
      task.mockImplementationOnce(async () => {
        await delay(100);
      });
      const uuid = taskManager.addTask(task);
      await testApiHandler({
        url: `/api/queues/test/${uuid}`,
        handler: RouteWithAsyncConnect,
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(202);
          expect(res.headers.get('refresh')).toStrictEqual(`3;/api/queues/test/${uuid}`);
        }
      });
    });
  });

  describe('When task with given uuid is complete', () => {
    test('Route should return status 200 and content in json by default', async () => {
      task.mockImplementationOnce(async () => {
        return { value: 100 };
      });
      const uuid = taskManager.addTask(task);
      await testApiHandler({
        url: `/api/queues/test/${uuid}`,
        handler: RouteWithAsyncConnect,
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(200);
          expect(await res.json()).toStrictEqual({ value: 100 });
        }
      });
    });
    test('Route should return content with correct Content-Type if task results to Response object', async () => {
      task.mockImplementationOnce(async () => {
        return new Response({ content: 'Text', headers: { 'Content-Type': 'text/html' } });
      });
      const uuid = taskManager.addTask(task);
      await testApiHandler({
        url: `/api/queues/test/${uuid}`,
        handler: RouteWithAsyncConnect,
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(200);
          expect(await res.text()).toStrictEqual('Text');
          expect(res.headers.get('content-type')).toBe('text/html');
        }
      });
    });
    test('Route should return error status and error body according to onError implementation', async () => {
      task.mockImplementationOnce(async () => {
        throw new Error('testError');
      });
      const uuid = taskManager.addTask(task);
      await testApiHandler({
        url: `/api/queues/test/${uuid}`,
        handler: RouteWithAsyncConnect,
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(500);
          expect(await res.text()).toBe('testError');
        }
      });
    });
  });
});
