import { expect, test } from '@jest/globals';
import type { ServerRequest, Response } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { createLazyHandler } from '../../src/handler/lazy-handler';

test('createLazyHandler', async () => {
  const request = {} as ServerRequest;
  const response = {} as Response;

  const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
    expect(givenRequest).toBe(request);
    return response;
  });

  const get = jest.fn((id: string) => {
    expect(id).toBe('id');

    return handler;
  });

  const container = { get } as unknown as Container;

  const lazyHandler = createLazyHandler(container, 'id');

  expect(await lazyHandler(request)).toBe(response);

  expect(get).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledTimes(1);
});
