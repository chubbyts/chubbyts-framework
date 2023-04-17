import { describe, expect, test } from '@jest/globals';
import type { ServerRequest, Response } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { useObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import { createRouteHandler } from '../../src/handler/route-handler';
import type { Route } from '../../src/router/route';
import type { MiddlewareDispatcher } from '../../src/middleware/middleware-dispatcher';

describe('route-handler', () => {
  describe('createRouteHandler', () => {
    test('without route', async () => {
      const [request, requestMocks] = useObjectMock<ServerRequest>([{ name: 'attributes', value: {} }]);

      const [middlewareDispatcher, middlewareDispatcherMocks] = useFunctionMock<MiddlewareDispatcher>([]);

      const routeHandler = createRouteHandler(middlewareDispatcher);

      try {
        await routeHandler(request);
        fail('Missing error');
      } catch (e) {
        expect(e).toEqual(
          new Error(
            'Request attribute "route" missing or wrong type "undefined", please add the "createRouteHandler" middleware.',
          ),
        );
      }

      expect(requestMocks.length).toBe(0);
      expect(middlewareDispatcherMocks.length).toBe(0);
    });

    test('with route', async () => {
      const [handler, handlerMocks] = useFunctionMock<Handler>([]);

      const [middleware, middlewareMocks] = useFunctionMock<Middleware>([]);

      const middlewares = [middleware];

      const route = { handler, middlewares, _route: 'Route' } as unknown as Route;

      const [request, requestMocks] = useObjectMock<ServerRequest>([{ name: 'attributes', value: { route } }]);
      const [response, responseMocks] = useObjectMock<Response>([]);

      const [middlewareDispatcher, middlewareDispatcherMocks] = useFunctionMock<MiddlewareDispatcher>([
        { parameters: [middlewares, handler, request], return: Promise.resolve(response) },
      ]);

      const routeHandler = createRouteHandler(middlewareDispatcher);

      expect(await routeHandler(request)).toBe(response);

      expect(handlerMocks.length).toBe(0);
      expect(middlewareMocks.length).toBe(0);
      expect(requestMocks.length).toBe(0);
      expect(responseMocks.length).toBe(0);
      expect(middlewareDispatcherMocks.length).toBe(0);
    });
  });
});
