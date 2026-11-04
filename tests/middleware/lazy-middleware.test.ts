import { describe, expect, test } from 'vitest';
import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { useObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/middleware';
import {
  createResponseFactory,
  createServerRequestFactory,
  createStreamFactory,
} from '@chubbyts/chubbyts-http/message-factory';
import { createLazyMiddleware } from '../../src/middleware/lazy-middleware.js';

const bodyFactory = createStreamFactory();
const responseFactory = createResponseFactory(bodyFactory);
const serverRequestFactory = createServerRequestFactory();

describe('lazy-middleware', () => {
  test('createLazyMiddleware', async () => {
    const request = serverRequestFactory('GET', 'https://example.com');
    const response = responseFactory(200);

    const [handler, handlerMocks] = useFunctionMock<Handler>([]);

    const [middleware, middlewareMocks] = useFunctionMock<Middleware>([
      { parameters: [request, handler], return: Promise.resolve(response) },
    ]);

    const [container, containerMocks] = useObjectMock<Container>([
      { name: 'get', parameters: ['id'], return: middleware },
    ]);

    const lazyMiddleware = createLazyMiddleware(container, 'id');

    expect(await lazyMiddleware(request, handler)).toBe(response);

    expect(handlerMocks).toHaveLength(0);
    expect(middlewareMocks).toHaveLength(0);
    expect(containerMocks).toHaveLength(0);
  });
});
