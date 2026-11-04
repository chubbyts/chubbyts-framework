import { describe, expect, test } from 'vitest';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/middleware';
import {
  createResponseFactory,
  createServerRequestFactory,
  createStreamFactory,
} from '@chubbyts/chubbyts-http/message-factory';
import { createRouteHandler } from '../../src/handler/route-handler.js';
import type { Route } from '../../src/router/route.js';

const bodyFactory = createStreamFactory();
const responseFactory = createResponseFactory(bodyFactory);
const serverRequestFactory = createServerRequestFactory();

describe('route-handler', () => {
  describe('createRouteHandler', () => {
    test('without route', async () => {
      const request = serverRequestFactory('GET', 'https://example.com');

      const routeHandler = createRouteHandler();

      try {
        await routeHandler(request);
        throw new Error('Missing error');
      } catch (e) {
        expect(e).toEqual(
          new Error(
            'Request attribute "route" missing or wrong type "undefined", please add the "createRouteMatcherMiddleware" middleware.',
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
          callback: (middlewareRequest, middlewareHandler) => middlewareHandler(middlewareRequest),
        },
      ]);

      const middlewares = [middleware];

      const route = { handler, middlewares, _route: 'Route' } as unknown as Route;

      const request = { ...serverRequestFactory('GET', 'https://example.com'), attributes: { route } };
      const response = responseFactory(200);

      const routeHandler = createRouteHandler();

      expect(await routeHandler(request)).toBe(response);

      expect(handlerMocks).toHaveLength(0);
      expect(middlewareMocks).toHaveLength(0);
    });
  });
});
