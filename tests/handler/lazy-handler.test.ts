import { describe, expect, test } from '@jest/globals';
import type { ServerRequest, Response } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { useObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import { createLazyHandler } from '../../src/handler/lazy-handler';

describe('lazy-handler', () => {
  test('createLazyHandler', async () => {
    const [request, requestMocks] = useObjectMock<ServerRequest>([]);
    const [response, responseMocks] = useObjectMock<Response>([]);

    const [handler, handlerMocks] = useFunctionMock<Handler>([
      { parameters: [request], return: Promise.resolve(response) },
    ]);

    const [container, containerMocks] = useObjectMock<Container>([
      { name: 'get', parameters: ['id'], return: handler },
    ]);

    const lazyHandler = createLazyHandler(container, 'id');

    expect(await lazyHandler(request)).toBe(response);

    expect(requestMocks.length).toBe(0);
    expect(responseMocks.length).toBe(0);
    expect(handlerMocks.length).toBe(0);
    expect(containerMocks.length).toBe(0);
  });
});
