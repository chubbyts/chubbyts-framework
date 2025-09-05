import { describe, expect, test } from 'vitest';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import type { Handler, Middleware } from '@chubbyts/chubbyts-undici-server/dist/server';
import { ServerRequest, Response } from '@chubbyts/chubbyts-undici-server/dist/server';
import { createRouteHandler } from '../../src/handler/route-handler';
import type { Route } from '../../src/router/route';

describe('route-handler', () => {
  describe('createRouteHandler', () => {
    test('without route', async () => {
      const request = new ServerRequest('https://example.com');

      const routeHandler = createRouteHandler();

      try {
        await routeHandler(request);
        throw new Error('Missing error');
      } catch (e) {
        expect(e).toEqual(
          new Error(
            'Request attribute "route" missing or wrong type "undefined", please add the "createRouteHandler" middleware.',
          ),
        );
      }
    });

    test('with route', async () => {
      const [handler, handlerMocks] = useFunctionMock<Handler>([
        {
          callback: async () => response,
        },
      ]);

      const [middleware, middlewareMocks] = useFunctionMock<Middleware>([
        {
          callback: (request, handler) => handler(request),
        },
      ]);

      const middlewares = [middleware];

      const route = { handler, middlewares, _route: 'Route' } as unknown as Route;

      const request = new ServerRequest('https://example.com', { attributes: { route } });
      const response = new Response();

      const routeHandler = createRouteHandler();

      expect(await routeHandler(request)).toBe(response);

      expect(handlerMocks.length).toBe(0);
      expect(middlewareMocks.length).toBe(0);
    });
  });
});
