import { describe, expect, test } from 'vitest';
import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { useObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import {
  createResponseFactory,
  createServerRequestFactory,
  createStreamFactory,
} from '@chubbyts/chubbyts-http/message-factory';
import { createLazyHandler } from '../../src/handler/lazy-handler';

const bodyFactory = createStreamFactory();
const responseFactory = createResponseFactory(bodyFactory);
const serverRequestFactory = createServerRequestFactory();

describe('lazy-handler', () => {
  test('createLazyHandler', async () => {
    const request = serverRequestFactory('GET', 'https://example.com');
    const response = responseFactory(200);

    const [handler, handlerMocks] = useFunctionMock<Handler>([
      { parameters: [request], return: Promise.resolve(response) },
    ]);

    const [container, containerMocks] = useObjectMock<Container>([
      { name: 'get', parameters: ['id'], return: handler },
    ]);

    const lazyHandler = createLazyHandler(container, 'id');

    expect(await lazyHandler(request)).toBe(response);

    expect(handlerMocks).toHaveLength(0);
    expect(containerMocks).toHaveLength(0);
  });
});
