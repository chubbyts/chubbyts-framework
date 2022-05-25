import { describe, expect, test } from '@jest/globals';
import { ServerRequest, Response } from '../../src/vendor/chubbyts-types/message';
import { createRouteHandler } from '../../src/handler/route-handler';
import { Middleware } from '../../src/vendor/chubbyts-types/middleware';
import { Handler } from '../../src/vendor/chubbyts-types/handler';
import { Route } from '../../src/router/route';
import { MiddlewareDispatcher } from '../../src/middleware/middleware-dispatcher';

describe('createRouteHandler', () => {
  test('without route', async () => {
    const request = { attributes: {} } as ServerRequest;
    const response = {} as Response;

    const middlewareDispatcher: MiddlewareDispatcher = jest.fn(async (): Promise<Response> => {
      return response;
    });

    const routeHandler = createRouteHandler(middlewareDispatcher);

    await expect(async () => {
      await routeHandler(request);
    }).rejects.toThrow(
      'Request attribute "route" missing or wrong type "undefined", please add the "createRouteHandler" middleware.',
    );

    expect(middlewareDispatcher).toHaveBeenCalledTimes(0);
  });

  test('with route', async () => {
    const handler = () => {};
    const middlewares = [() => {}];

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

    expect(middlewareDispatcher).toHaveBeenCalledTimes(1);
  });
});
