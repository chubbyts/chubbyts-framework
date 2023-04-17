import { describe, expect, test } from '@jest/globals';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { useObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import { createMiddlewareDispatcher } from '../../src/middleware/middleware-dispatcher';

describe('route-matcher-middleware', () => {
  describe('createMiddlewareDispatcher', () => {
    test('without middleware', async () => {
      const [request, requestMocks] = useObjectMock<ServerRequest>([]);
      const [response, responseMocks] = useObjectMock<Response>([]);

      const [handler, handlerMocks] = useFunctionMock<Handler>([
        { parameters: [request], return: Promise.resolve(response) },
      ]);

      const middlewareDispatcher = createMiddlewareDispatcher();

      expect(await middlewareDispatcher([], handler, request)).toBe(response);

      expect(requestMocks.length).toBe(0);
      expect(responseMocks.length).toBe(0);
      expect(handlerMocks.length).toBe(0);
    });

    test('with middlewares', async () => {
      const [request, requestMocks] = useObjectMock<ServerRequest>([
        { name: 'attributes', value: {} },
        { name: 'attributes', value: {} },
      ]);

      const [response, responseMocks] = useObjectMock<Response>([]);

      const middleware1Callback = async (givenRequest: ServerRequest, givenHandler: Handler): Promise<Response> => {
        return givenHandler({
          ...givenRequest,
          attributes: { ...givenRequest.attributes, key: 'value1' },
        });
      };

      const [middleware1, middleware1Mocks] = useFunctionMock<Middleware>([
        { callback: middleware1Callback },
        { callback: middleware1Callback },
      ]);

      const middleware2Callback = async (givenRequest: ServerRequest, givenHandler: Handler): Promise<Response> => {
        expect(givenRequest).toEqual({
          ...givenRequest,
          attributes: { ...givenRequest.attributes, key: 'value1' },
        });

        return givenHandler({
          ...givenRequest,
          attributes: { ...givenRequest.attributes, key: 'value2' },
        });
      };

      const [middleware2, middleware2Mocks] = useFunctionMock<Middleware>([
        { callback: middleware2Callback },
        { callback: middleware2Callback },
      ]);

      const middleware3Callback = async (givenRequest: ServerRequest, givenHandler: Handler): Promise<Response> => {
        expect(givenRequest).toEqual({
          ...givenRequest,
          attributes: { ...givenRequest.attributes, key: 'value2' },
        });

        return givenHandler({
          ...givenRequest,
          attributes: { ...givenRequest.attributes, key: 'value3' },
        });
      };

      const [middleware3, middleware3Mocks] = useFunctionMock<Middleware>([
        { callback: middleware3Callback },
        { callback: middleware3Callback },
      ]);

      const handlerCallback = async (givenRequest: ServerRequest): Promise<Response> => {
        expect(givenRequest).toEqual({
          ...givenRequest,
          attributes: { ...givenRequest.attributes, key: 'value3' },
        });

        return response;
      };

      const [handler, handlerMocks] = useFunctionMock<Handler>([
        { callback: handlerCallback },
        { callback: handlerCallback },
      ]);

      const middlewareDispatcher = createMiddlewareDispatcher();

      const middlewares = [middleware1, middleware2, middleware3];

      expect(await middlewareDispatcher(middlewares, handler, request)).toBe(response);
      expect(await middlewareDispatcher(middlewares, handler, request)).toBe(response);

      expect(requestMocks.length).toBe(0);
      expect(responseMocks.length).toBe(0);
      expect(middleware1Mocks.length).toBe(0);
      expect(middleware2Mocks.length).toBe(0);
      expect(middleware3Mocks.length).toBe(0);
      expect(handlerMocks.length).toBe(0);
    });
  });
});
