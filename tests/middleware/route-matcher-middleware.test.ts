import { describe, expect, test } from '@jest/globals';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { createNotFound } from '@chubbyts/chubbyts-http-error/dist/http-error';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { useObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import type { Match } from '../../src/router/route-matcher';
import { createRouteMatcherMiddleware } from '../../src/middleware/route-matcher-middleware';
import type { Route } from '../../src/router/route';

describe('route-matcher-middleware', () => {
  describe('createRouteMatcherMiddleware', () => {
    test('match', async () => {
      const route = { attributes: { key: 'value' }, _route: 'Route' } as unknown as Route;

      const [request, requestMocks] = useObjectMock<ServerRequest>([{ name: 'attributes', value: { route } }]);
      const [response, responseMocks] = useObjectMock<Response>([]);

      const [handler, handlerMocks] = useFunctionMock<Handler>([
        {
          callback: async (givenRequest: ServerRequest): Promise<Response> => {
            expect(givenRequest).toEqual({
              ...givenRequest,
              attributes: { ...givenRequest.attributes, route, ...route.attributes },
            });

            return response;
          },
        },
      ]);

      const [match, matchMocks] = useFunctionMock<Match>([{ parameters: [request], return: route }]);

      const routeMatcherMiddleware = createRouteMatcherMiddleware(match);

      expect(await routeMatcherMiddleware(request, handler)).toBe(response);

      expect(requestMocks.length).toBe(0);
      expect(responseMocks.length).toBe(0);
      expect(handlerMocks.length).toBe(0);
      expect(matchMocks.length).toBe(0);
    });

    test('no match', async () => {
      const httpError = createNotFound({
        detail:
          'The page "/" you are looking for could not be found. Check the address bar to ensure your URL is spelled correctly.',
      });

      const [request, requestMocks] = useObjectMock<ServerRequest>([]);

      const [handler, handlerMocks] = useFunctionMock<Handler>([]);

      const [match, matchMocks] = useFunctionMock<Match>([{ parameters: [request], error: httpError }]);

      const routeMatcherMiddleware = createRouteMatcherMiddleware(match);

      try {
        await routeMatcherMiddleware(request, handler);
        fail('Missing error');
      } catch (e) {
        expect(e).toBe(httpError);
      }

      expect(requestMocks.length).toBe(0);
      expect(handlerMocks.length).toBe(0);
      expect(matchMocks.length).toBe(0);
    });
  });
});
