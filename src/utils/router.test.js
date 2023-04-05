import nextTestApiHandler from 'next-test-api-route-handler';
import { jest } from '@jest/globals';
import router from './router.mjs';
import ApiUsecase from '../usecases/ApiUsecase.mjs';
import FileUsecase from '../usecases/FileUsecase.mjs';
import AccessorUsecase from '../usecases/AccessorUsecase.mjs';
import Errors from '../errors/Errors.mjs';

const { testApiHandler } = nextTestApiHandler;

let RouteWithRouter;

beforeAll(async () => {
  jest.mock('../usecases/ApiUsecase.mjs');
  jest.mock('../usecases/FileUsecase.mjs');
  jest.mock('../usecases/AccessorUsecase.mjs');

  jest.spyOn(ApiUsecase.prototype, 'process').mockImplementation(async () => {
    return { value: 100 };
  });

  jest.spyOn(AccessorUsecase.prototype, 'process').mockImplementation(async () => {
    return null;
  });

  jest.spyOn(FileUsecase.prototype, 'process').mockImplementation(async () => {
    return { file: '{ "value": 100 }', contentType: 'application/json', filename: 'test.json' };
  });

  jest.unstable_mockModule(
    'mocks/routeWithRouter',
    () => ({
      __esModule: true,
      default: (() =>
        router(() => ({ cradle: {} }))
          .setPrefix('/basePath/')
          .get('api', ApiUsecase)
          .post('api', ApiUsecase)
          .put('api', ApiUsecase)
          .delete('api', ApiUsecase)
          .get('file', FileUsecase)
          .get('accessor', AccessorUsecase)
          .build())()
    }),
    { virtual: true }
  );

  RouteWithRouter = await import('mocks/routeWithRouter');
});

describe('Router()', () => {
  describe('When route respond a good status', () => {
    test('GET/POST/PUT/DELETE to route should return status 200', async () => {
      await testApiHandler({
        url: `/basePath/api`,
        handler: RouteWithRouter,
        test: async ({ fetch }) => {
          for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
            const res = await fetch({ method });
            expect(res.status).toBe(200);
          }
        }
      });
    });

    test('route with ApiProcessor should return status 200 and content', async () => {
      await testApiHandler({
        url: `/basePath/api`,
        handler: RouteWithRouter,
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(200);
          expect(await res.json()).toStrictEqual({ value: 100 });
        }
      });
    });

    test('route with AccessorProcessor should return status 202 and refresh header', async () => {
      await testApiHandler({
        url: `/basePath/accessor`,
        handler: RouteWithRouter,
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(202);
          expect(res.headers.get('refresh')).toStrictEqual('3; undefined/basePath/accessor');
        }
      });
    });

    test('route with AccessorProcessor should return status 200 and content after finished', async () => {
      jest.spyOn(AccessorUsecase.prototype, 'process').mockImplementationOnce(async () => {
        return { value: 100 };
      });
      await testApiHandler({
        url: `/basePath/accessor`,
        handler: RouteWithRouter,
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(200);
          expect(await res.json()).toStrictEqual({ value: 100 });
        }
      });
    });

    test('route with FileProcesor should return status 200 and file content', async () => {
      await testApiHandler({
        url: `/basePath/file`,
        handler: RouteWithRouter,
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(200);
          expect(res.headers.get('content-disposition')).toStrictEqual(
            'attachment; filename=test.json'
          );
          expect(res.headers.get('content-type')).toStrictEqual('application/json');
          expect(await res.json()).toStrictEqual({ value: 100 });
        }
      });
    });
  });

  describe('When route respond a bad status', () => {
    test('route should return status 403 when the request is forbidden', async () => {
      jest.spyOn(ApiUsecase.prototype, 'process').mockImplementationOnce(async () => {
        throw Errors.forbidden();
      });
      await testApiHandler({
        url: `/basePath/api`,
        handler: RouteWithRouter,
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(403);
          expect(await res.json()).toStrictEqual({
            error: { type: 'FORBIDDEN', description: 'Отказано в доступе' }
          });
        }
      });
    });

    test('route should return status 400 when the request body is not valid', async () => {
      jest.spyOn(ApiUsecase.prototype, 'process').mockImplementationOnce(async () => {
        throw Errors.invalid('Invalid');
      });
      await testApiHandler({
        url: `/basePath/api`,
        handler: RouteWithRouter,
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(400);
          expect(await res.json()).toStrictEqual({
            error: { type: 'INVALID', description: 'Invalid' }
          });
        }
      });
    });

    test('route should return status 500 when an error is unexpected', async () => {
      jest.spyOn(ApiUsecase.prototype, 'process').mockImplementationOnce(async () => {
        throw new Error('Unexpected');
      });
      await testApiHandler({
        url: `/basePath/api`,
        handler: RouteWithRouter,
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(500);
          expect(await res.json()).toStrictEqual({
            error: { type: 'UNHANDLED_ERROR', description: 'Необработанная ошибка сервера' }
          });
        }
      });
    });

    test('router should return status 405 when no matching routes found', async () => {
      await testApiHandler({
        url: `/basePath/notfound`,
        handler: RouteWithRouter,
        test: async ({ fetch }) => {
          const res = await fetch({ method: 'GET' });
          expect(res.status).toBe(405);
        }
      });
    });
  });
});
