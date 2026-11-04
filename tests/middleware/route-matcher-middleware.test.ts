import { describe, expect, test } from 'vitest';
import { createNotFound } from '@chubbyts/chubbyts-http-error/dist/http-error';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/message';
import {
  createResponseFactory,
  createServerRequestFactory,
  createStreamFactory,
} from '@chubbyts/chubbyts-http/message-factory';
import type { Match } from '../../src/router/route-matcher.js';
import type { RouteMatcherAttributes } from '../../src/middleware/route-matcher-middleware.js';
import { createRouteMatcherMiddleware } from '../../src/middleware/route-matcher-middleware.js';
import type { Route } from '../../src/router/route.js';

const bodyFactory = createStreamFactory();
const responseFactory = createResponseFactory(bodyFactory);
const serverRequestFactory = createServerRequestFactory();

describe('route-matcher-middleware', () => {
  describe('createRouteMatcherMiddleware', () => {
    test('match', async () => {
      const route = { attributes: { key: 'value' }, _route: 'Route' } as unknown as Route;

      const request = serverRequestFactory('GET', 'https://example.com');
      const response = responseFactory(200);

      const [handler, handlerMocks] = useFunctionMock<Handler>([
        {
          callback: async (givenRequest: ServerRequest): Promise<Response> => {
            expect(givenRequest.attributes).toMatchInlineSnapshot(`
              {
                "key": "value",
                "route": {
                  "_route": "Route",
                  "attributes": {
                    "key": "value",
                  },
                },
              }
            `);

            return response;
          },
        },
      ]);

      const [match, matchMocks] = useFunctionMock<Match>([{ parameters: [request], return: route }]);

      const routeMatcherMiddleware = createRouteMatcherMiddleware(match);

      expect(await routeMatcherMiddleware(request, handler)).toBe(response);

      expect(handlerMocks).toHaveLength(0);
      expect(matchMocks).toHaveLength(0);
    });

    test('match with a path attribute named route', async () => {
      const route = { attributes: { route: 'value' }, _route: 'Route' } as unknown as Route;

      const request = serverRequestFactory('GET', 'https://example.com');
      const response = responseFactory(200);

      const [handler, handlerMocks] = useFunctionMock<Handler<RouteMatcherAttributes>>([
        {
          callback: async (givenRequest: ServerRequest<RouteMatcherAttributes>): Promise<Response> => {
            expect(givenRequest.attributes.route).toBe(route);

            return response;
          },
        },
      ]);

      const [match, matchMocks] = useFunctionMock<Match>([{ parameters: [request], return: route }]);

      const routeMatcherMiddleware = createRouteMatcherMiddleware(match);

      expect(await routeMatcherMiddleware(request, handler)).toBe(response);

      expect(handlerMocks).toHaveLength(0);
      expect(matchMocks).toHaveLength(0);
    });

    test('no match', async () => {
      const httpError = createNotFound({
        detail:
          'The page "/" you are looking for could not be found. Check the address bar to ensure your URL is spelled correctly.',
      });

      const request = serverRequestFactory('GET', 'https://example.com');

      const [handler, handlerMocks] = useFunctionMock<Handler>([]);

      const [match, matchMocks] = useFunctionMock<Match>([{ parameters: [request], error: httpError }]);

      const routeMatcherMiddleware = createRouteMatcherMiddleware(match);

      try {
        await routeMatcherMiddleware(request, handler);
        throw new Error('Missing error');
      } catch (e) {
        expect(e).toBe(httpError);
      }

      expect(handlerMocks).toHaveLength(0);
      expect(matchMocks).toHaveLength(0);
    });
  });
});
