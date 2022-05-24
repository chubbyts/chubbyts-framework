import { expect, test } from '@jest/globals';
import { ServerRequest, Response } from '../../src/vendor/chubbyts-types/message';
import { Handler } from '../../src/vendor/chubbyts-types/handler';
import { Middleware } from '../../src/vendor/chubbyts-types/middleware';
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
