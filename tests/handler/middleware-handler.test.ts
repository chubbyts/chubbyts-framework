import { expect, test } from '@jest/globals';
import type { ServerRequest, Response } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import { createMiddlewareHandler } from '../../src/handler/middleware-handler';

test('createMiddlewareHandler', async () => {
  const request = {} as ServerRequest;
  const response = {} as Response;

  const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
    expect(givenRequest).toBe(request);
    return response;
  });

  const middleware: Middleware = jest.fn(
    async (givenRequest: ServerRequest, givenHandler: Handler): Promise<Response> => {
      return givenHandler(givenRequest);
    },
  );

  const middlewareRequestHandler = createMiddlewareHandler(middleware, handler);

  expect(await middlewareRequestHandler(request)).toBe(response);

  expect(handler).toHaveBeenCalledTimes(1);
  expect(middleware).toHaveBeenCalledTimes(1);
});
