import { expect, test } from '@jest/globals';
import { ServerRequest, Response } from '@chubbyts/chubbyts-http-types/dist/message';
import { createLazyMiddleware } from '../../src/middleware/lazy-middleware';
import { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';

test('createLazyMiddleware', async () => {
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

  const get = jest.fn((id: string) => {
    expect(id).toBe('id');

    return middleware;
  });

  const container = { get } as unknown as Container;

  const lazyMiddleware = createLazyMiddleware(container, 'id');

  expect(await lazyMiddleware(request, handler)).toBe(response);

  expect(handler).toHaveBeenCalledTimes(1);
  expect(middleware).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledTimes(1);
});
