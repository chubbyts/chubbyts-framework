import { describe, expect, test } from 'vitest';
import { createNotFound } from '@chubbyts/chubbyts-http-error/dist/http-error';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import type { Handler } from '@chubbyts/chubbyts-undici-server/dist/server';
import { ServerRequest, Response } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { Match } from '../../src/router/route-matcher';
import { createRouteMatcherMiddleware } from '../../src/middleware/route-matcher-middleware';
import type { Route } from '../../src/router/route';

describe('route-matcher-middleware', () => {
  describe('createRouteMatcherMiddleware', () => {
    test('match', async () => {
      const route = { attributes: { key: 'value' }, _route: 'Route' } as unknown as Route;

      const request = new ServerRequest('https://example.com');
      const response = new Response();

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

      expect(handlerMocks.length).toBe(0);
      expect(matchMocks.length).toBe(0);
    });

    test('no match', async () => {
      const httpError = createNotFound({
        detail:
          'The page "/" you are looking for could not be found. Check the address bar to ensure your URL is spelled correctly.',
      });

      const request = new ServerRequest('https://example.com');

      const [handler, handlerMocks] = useFunctionMock<Handler>([]);

      const [match, matchMocks] = useFunctionMock<Match>([{ parameters: [request], error: httpError }]);

      const routeMatcherMiddleware = createRouteMatcherMiddleware(match);

      try {
        await routeMatcherMiddleware(request, handler);
        throw new Error('Missing error');
      } catch (e) {
        expect(e).toBe(httpError);
      }

      expect(handlerMocks.length).toBe(0);
      expect(matchMocks.length).toBe(0);
    });
  });
});
