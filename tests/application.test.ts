import { describe, expect, test } from 'vitest';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/middleware';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/message';
import {
  createResponseFactory,
  createServerRequestFactory,
  createStreamFactory,
} from '@chubbyts/chubbyts-http/message-factory';
import type { Route } from '../src/router/route.js';
import { createApplication } from '../src/application.js';

const bodyFactory = createStreamFactory();
const responseFactory = createResponseFactory(bodyFactory);
const serverRequestFactory = createServerRequestFactory();

describe('createApplication', () => {
  test('without middlewares', async () => {
    const request = serverRequestFactory('GET', 'https://example.com');

    const application = createApplication([]);

    try {
      await application(request);
      throw new Error('Missing error');
    } catch (e) {
      expect(e).toEqual(
        new Error(
          'Request attribute "route" missing or wrong type "undefined", please add the "createRouteMatcherMiddleware" middleware.',
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

    const request = { ...serverRequestFactory('GET', 'https://example.com'), attributes: { route } };

    const response = responseFactory(200);

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

    expect(handlerMocks).toHaveLength(0);
    expect(middlewareMocks).toHaveLength(0);
  });
});
