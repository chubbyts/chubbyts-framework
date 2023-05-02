import { describe, expect, test } from '@jest/globals';
import type { ServerRequest, Response } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { useObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import { createLazyMiddleware } from '../../src/middleware/lazy-middleware';

describe('lazy-middleware', () => {
  test('createLazyMiddleware', async () => {
    const request = {} as ServerRequest;
    const response = {} as Response;

    const [handler, handlerMocks] = useFunctionMock<Handler>([]);

    const [middleware, middlewareMocks] = useFunctionMock<Middleware>([
      { parameters: [request, handler], return: Promise.resolve(response) },
    ]);

    const [container, containerMocks] = useObjectMock<Container>([
      { name: 'get', parameters: ['id'], return: middleware },
    ]);

    const lazyMiddleware = createLazyMiddleware(container, 'id');

    expect(await lazyMiddleware(request, handler)).toBe(response);

    expect(handlerMocks.length).toBe(0);
    expect(middlewareMocks.length).toBe(0);
    expect(containerMocks.length).toBe(0);
  });
});
