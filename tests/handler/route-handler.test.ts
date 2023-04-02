import { describe, expect, test } from '@jest/globals';
import type { ServerRequest, Response } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { createRouteHandler } from '../../src/handler/route-handler';
import type { Route } from '../../src/router/route';
import type { MiddlewareDispatcher } from '../../src/middleware/middleware-dispatcher';

describe('createRouteHandler', () => {
  test('without route', async () => {
    const request = { attributes: {} } as ServerRequest;
    const response = {} as Response;

    const middlewareDispatcher: MiddlewareDispatcher = jest.fn(async (): Promise<Response> => {
      return response;
    });

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

    expect(middlewareDispatcher).toHaveBeenCalledTimes(0);
  });

  test('with route', async () => {
    const handler = jest.fn();
    const middleware = jest.fn();

    const middlewares = [middleware];

    const route = { handler, middlewares, _route: 'Route' } as unknown as Route;
    const request = { attributes: { route } } as unknown as ServerRequest;
    const response = {} as Response;

    const middlewareDispatcher: MiddlewareDispatcher = jest.fn(
      async (
        givenMiddlewares: Array<Middleware>,
        givenHandler: Handler,
        givenRequest: ServerRequest,
      ): Promise<Response> => {
        expect(givenMiddlewares).toBe(middlewares);
        expect(givenHandler).toBe(handler);
        expect(givenRequest).toBe(request);

        return response;
      },
    );

    const routeHandler = createRouteHandler(middlewareDispatcher);

    expect(await routeHandler(request)).toBe(response);

    expect(handler).toHaveBeenCalledTimes(0);
    expect(middleware).toHaveBeenCalledTimes(0);
    expect(middlewareDispatcher).toHaveBeenCalledTimes(1);
  });
});
