import { describe, expect, test } from '@jest/globals';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { useObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import type { Route } from '../src/router/route';
import { createApplication } from '../src/application';

describe('createApplication', () => {
  test('without middlewares', async () => {
    const [request, requestMocks] = useObjectMock<ServerRequest>([{ name: 'attributes', value: {} }]);

    const application = createApplication([]);

    try {
      await application(request);
      fail('Missing error');
    } catch (e) {
      expect(e).toEqual(
        new Error(
          'Request attribute "route" missing or wrong type "undefined", please add the "createRouteHandler" middleware.',
        ),
      );
    }

    expect(requestMocks.length).toBe(0);
  });

  test('with middlewares', async () => {
    const [handler, handlerMocks] = useFunctionMock<Handler>([
      {
        callback: async (givenRequest: ServerRequest): Promise<Response> => {
          expect(givenRequest).toBe(request);

          return response;
        },
      },
    ]);

    const route = { handler, middlewares: [], _route: 'Route' } as unknown as Route;

    const [request, requestMocks] = useObjectMock<ServerRequest>([{ name: 'attributes', value: { route } }]);
    const [response, responseMocks] = useObjectMock<Response>([]);

    const [middleware, middlewareMocks] = useFunctionMock<Middleware>([
      {
        callback: async (givenRequest: ServerRequest, givenHandler: Handler) => {
          expect(givenRequest).toBe(request);
          expect(givenHandler).toBeInstanceOf(Function);

          return givenHandler(givenRequest);
        },
      },
    ]);

    const application = createApplication([middleware]);

    expect(await application(request)).toBe(response);

    expect(handlerMocks.length).toBe(0);
    expect(middlewareMocks.length).toBe(0);
    expect(requestMocks.length).toBe(0);
    expect(responseMocks.length).toBe(0);
  });
});
