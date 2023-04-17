import { describe, expect, test } from '@jest/globals';
import type { ServerRequest, Response } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { useObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import { createMiddlewareHandler } from '../../src/handler/middleware-handler';

describe('middleware-handler', () => {
  test('createMiddlewareHandler', async () => {
    const [request, requestMocks] = useObjectMock<ServerRequest>([]);
    const [response, responseMocks] = useObjectMock<Response>([]);

    const [handler, handlerMocks] = useFunctionMock<Handler>([]);

    const [middleware, middlewareMocks] = useFunctionMock<Middleware>([
      { parameters: [request, handler], return: Promise.resolve(response) },
    ]);

    const middlewareRequestHandler = createMiddlewareHandler(middleware, handler);

    expect(await middlewareRequestHandler(request)).toBe(response);

    expect(requestMocks.length).toBe(0);
    expect(responseMocks.length).toBe(0);
    expect(handlerMocks.length).toBe(0);
    expect(middlewareMocks.length).toBe(0);
  });
});
