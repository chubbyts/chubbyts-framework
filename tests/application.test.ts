import { describe, expect, test } from 'vitest';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import type { Handler, Middleware } from '@chubbyts/chubbyts-undici-server/dist/server';
import { Response, ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { Route } from '../src/router/route';
import { createApplication } from '../src/application';

describe('createApplication', () => {
  test('without middlewares', async () => {
    const request = new ServerRequest('https://example.com');

    const application = createApplication([]);

    try {
      await application(request);
      throw new Error('Missing error');
    } catch (e) {
      expect(e).toEqual(
        new Error(
          'Request attribute "route" missing or wrong type "undefined", please add the "createRouteHandler" middleware.',
        ),
      );
    }
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

    const request = new ServerRequest('https://example.com', { attributes: { route } });

    const response = new Response('');

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
  });
});
