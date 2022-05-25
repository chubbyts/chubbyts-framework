import { describe, expect, test } from '@jest/globals';
import { Handler } from '../../src/vendor/chubbyts-types/handler';
import { Response, ServerRequest } from '../../src/vendor/chubbyts-types/message';
import { createMiddlewareDispatcher } from '../../src/middleware/middleware-dispatcher';
import { Middleware } from '../../src/vendor/chubbyts-types/middleware';

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

    const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
      expect(givenRequest).toEqual({ ...givenRequest, attributes: { ...givenRequest.attributes, key: 'value2' } });

      return response;
    });

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

    const middlewareDispatcher = createMiddlewareDispatcher();

    expect(await middlewareDispatcher([middleware1, middleware2], handler, request)).toBe(response);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(middleware1).toHaveBeenCalledTimes(1);
    expect(middleware2).toHaveBeenCalledTimes(1);
  });
});
