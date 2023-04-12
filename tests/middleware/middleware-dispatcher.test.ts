import { describe, expect, test } from '@jest/globals';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { createMiddlewareDispatcher } from '../../src/middleware/middleware-dispatcher';

describe('createMiddlewareDispatcher', () => {
  test('without middleware', async () => {
    const request = {} as ServerRequest;
    const response = {} as Response;

    const [handler, handlerMocks] = useFunctionMock<Handler>([
      { parameters: [request], return: Promise.resolve(response) },
    ]);

    const middlewareDispatcher = createMiddlewareDispatcher();

    expect(await middlewareDispatcher([], handler, request)).toBe(response);

    expect(handlerMocks.length).toBe(0);
  });

  test('with middlewares', async () => {
    const request = {} as ServerRequest;
    const response = {} as Response;

    const [middleware1, middleware1Mocks] = useFunctionMock<Middleware>([
      {
        callback: async (givenRequest: ServerRequest, givenHandler: Handler): Promise<Response> => {
          return givenHandler({
            ...givenRequest,
            attributes: { ...givenRequest.attributes, key: 'value1' },
          });
        },
      },
      {
        callback: async (givenRequest: ServerRequest, givenHandler: Handler): Promise<Response> => {
          return givenHandler({
            ...givenRequest,
            attributes: { ...givenRequest.attributes, key: 'value1' },
          });
        },
      },
    ]);

    const [middleware2, middleware2Mocks] = useFunctionMock<Middleware>([
      {
        callback: async (givenRequest: ServerRequest, givenHandler: Handler): Promise<Response> => {
          expect(givenRequest).toEqual({ ...givenRequest, attributes: { ...givenRequest.attributes, key: 'value1' } });

          return givenHandler({
            ...givenRequest,
            attributes: { ...givenRequest.attributes, key: 'value2' },
          });
        },
      },
      {
        callback: async (givenRequest: ServerRequest, givenHandler: Handler): Promise<Response> => {
          expect(givenRequest).toEqual({ ...givenRequest, attributes: { ...givenRequest.attributes, key: 'value1' } });

          return givenHandler({
            ...givenRequest,
            attributes: { ...givenRequest.attributes, key: 'value2' },
          });
        },
      },
    ]);

    const [middleware3, middleware3Mocks] = useFunctionMock<Middleware>([
      {
        callback: async (givenRequest: ServerRequest, givenHandler: Handler): Promise<Response> => {
          expect(givenRequest).toEqual({ ...givenRequest, attributes: { ...givenRequest.attributes, key: 'value2' } });

          return givenHandler({
            ...givenRequest,
            attributes: { ...givenRequest.attributes, key: 'value3' },
          });
        },
      },
      {
        callback: async (givenRequest: ServerRequest, givenHandler: Handler): Promise<Response> => {
          expect(givenRequest).toEqual({ ...givenRequest, attributes: { ...givenRequest.attributes, key: 'value2' } });

          return givenHandler({
            ...givenRequest,
            attributes: { ...givenRequest.attributes, key: 'value3' },
          });
        },
      },
    ]);

    const [handler, handlerMocks] = useFunctionMock<Handler>([
      {
        callback: async (givenRequest: ServerRequest): Promise<Response> => {
          expect(givenRequest).toEqual({ ...givenRequest, attributes: { ...givenRequest.attributes, key: 'value3' } });

          return response;
        },
      },
      {
        callback: async (givenRequest: ServerRequest): Promise<Response> => {
          expect(givenRequest).toEqual({ ...givenRequest, attributes: { ...givenRequest.attributes, key: 'value3' } });

          return response;
        },
      },
    ]);

    const middlewareDispatcher = createMiddlewareDispatcher();

    const middlewares = [middleware1, middleware2, middleware3];

    expect(await middlewareDispatcher(middlewares, handler, request)).toBe(response);
    expect(await middlewareDispatcher(middlewares, handler, request)).toBe(response);

    expect(middleware1Mocks.length).toBe(0);
    expect(middleware2Mocks.length).toBe(0);
    expect(middleware3Mocks.length).toBe(0);
    expect(handlerMocks.length).toBe(0);
  });
});
