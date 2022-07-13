import { describe, expect, test } from '@jest/globals';
import { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import { createMiddlewareDispatcher } from '../../src/middleware/middleware-dispatcher';
import { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';

describe('createMiddlewareDispatcher', () => {
  test('without middleware', async () => {
    const request = {} as ServerRequest;
    const response = {} as Response;

    const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
      expect(givenRequest).toBe(request);

      return response;
    });

    const middlewareDispatcher = createMiddlewareDispatcher();

    expect(await middlewareDispatcher([], handler, request)).toBe(response);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('with middlewares', async () => {
    const request = {} as ServerRequest;
    const response = {} as Response;

    const middleware1: Middleware = jest.fn(
      async (givenRequest: ServerRequest, givenHandler: Handler): Promise<Response> => {
        return givenHandler({
          ...givenRequest,
          attributes: { ...givenRequest.attributes, key: 'value1' },
        });
      },
    );

    const middleware2: Middleware = jest.fn(
      async (givenRequest: ServerRequest, givenHandler: Handler): Promise<Response> => {
        expect(givenRequest).toEqual({ ...givenRequest, attributes: { ...givenRequest.attributes, key: 'value1' } });

        return givenHandler({
          ...givenRequest,
          attributes: { ...givenRequest.attributes, key: 'value2' },
        });
      },
    );

    const middleware3: Middleware = jest.fn(
      async (givenRequest: ServerRequest, givenHandler: Handler): Promise<Response> => {
        expect(givenRequest).toEqual({ ...givenRequest, attributes: { ...givenRequest.attributes, key: 'value2' } });

        return givenHandler({
          ...givenRequest,
          attributes: { ...givenRequest.attributes, key: 'value3' },
        });
      },
    );

    const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
      expect(givenRequest).toEqual({ ...givenRequest, attributes: { ...givenRequest.attributes, key: 'value3' } });

      return response;
    });

    const middlewareDispatcher = createMiddlewareDispatcher();

    const middlewares = [middleware1, middleware2, middleware3];

    expect(await middlewareDispatcher(middlewares, handler, request)).toBe(response);
    expect(await middlewareDispatcher(middlewares, handler, request)).toBe(response);

    expect(handler).toHaveBeenCalledTimes(2);
    expect(middleware1).toHaveBeenCalledTimes(2);
    expect(middleware2).toHaveBeenCalledTimes(2);
    expect(middleware3).toHaveBeenCalledTimes(2);
  });
});
