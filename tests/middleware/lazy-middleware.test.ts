import { describe, expect, test } from 'vitest';
import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { useObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import type { Handler, Middleware } from '@chubbyts/chubbyts-undici-server/dist/server';
import { ServerRequest, Response } from '@chubbyts/chubbyts-undici-server/dist/server';
import { createLazyMiddleware } from '../../src/middleware/lazy-middleware';

describe('lazy-middleware', () => {
  test('createLazyMiddleware', async () => {
    const request = new ServerRequest('https://example.com');
    const response = new Response();

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
