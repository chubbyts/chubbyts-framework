import { describe, expect, test } from 'vitest';
import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { useObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import type { Handler } from '@chubbyts/chubbyts-undici-server/dist/server';
import { Response, ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';
import { createLazyHandler } from '../../src/handler/lazy-handler';

describe('lazy-handler', () => {
  test('createLazyHandler', async () => {
    const request = new ServerRequest('https://example.com');
    const response = new Response();

    const [handler, handlerMocks] = useFunctionMock<Handler>([
      { parameters: [request], return: Promise.resolve(response) },
    ]);

    const [container, containerMocks] = useObjectMock<Container>([
      { name: 'get', parameters: ['id'], return: handler },
    ]);

    const lazyHandler = createLazyHandler(container, 'id');

    expect(await lazyHandler(request)).toBe(response);

    expect(handlerMocks.length).toBe(0);
    expect(containerMocks.length).toBe(0);
  });
});
