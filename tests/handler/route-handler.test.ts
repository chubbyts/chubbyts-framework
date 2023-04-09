import { describe, expect, test } from '@jest/globals';
import type { ServerRequest, Response } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { FunctionMocks } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { createFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { createRouteHandler } from '../../src/handler/route-handler';
import type { Route } from '../../src/router/route';
import type { MiddlewareDispatcher } from '../../src/middleware/middleware-dispatcher';

describe('createRouteHandler', () => {
  test('without route', async () => {
    const request = { attributes: {} } as ServerRequest;

    const middlewareDispatcher = createFunctionMock<MiddlewareDispatcher>([]);

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
  });

  test('with route', async () => {
    const handler = createFunctionMock<Handler>([]);

    const middleware = createFunctionMock<Middleware>([]);

    const middlewares = [middleware];

    const route = { handler, middlewares, _route: 'Route' } as unknown as Route;
    const request = { attributes: { route } } as unknown as ServerRequest;
    const response = {} as Response;

    const middlewareDispatcherMocks: FunctionMocks<MiddlewareDispatcher> = [
      { parameters: [middlewares, handler, request], return: Promise.resolve(response) },
    ];

    const middlewareDispatcher = createFunctionMock(middlewareDispatcherMocks);

    const routeHandler = createRouteHandler(middlewareDispatcher);

    expect(await routeHandler(request)).toBe(response);

    expect(middlewareDispatcherMocks.length).toBe(0);
  });
});
