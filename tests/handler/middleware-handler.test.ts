import { expect, test } from '@jest/globals';
import type { ServerRequest, Response } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import type { FunctionMocks } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { createFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { createMiddlewareHandler } from '../../src/handler/middleware-handler';

test('createMiddlewareHandler', async () => {
  const request = {} as ServerRequest;
  const response = {} as Response;

  const handler = createFunctionMock<Handler>([]);

  const middlewareMocks: FunctionMocks<Middleware> = [
    { parameters: [request, handler], return: Promise.resolve(response) },
  ];

  const middleware = createFunctionMock(middlewareMocks);

  const middlewareRequestHandler = createMiddlewareHandler(middleware, handler);

  expect(await middlewareRequestHandler(request)).toBe(response);

  expect(middlewareMocks.length).toBe(0);
});
