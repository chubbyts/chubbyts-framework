import { json, text } from 'node:stream/consumers';
import { describe, expect, test } from 'vitest';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { useObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import type { Logger } from '@chubbyts/chubbyts-log-types/dist/log';
import type { MapToHttpError } from '@chubbyts/chubbyts-http-error/dist/http-error';
import { createNotFound } from '@chubbyts/chubbyts-http-error/dist/http-error';
import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/message';
import type { Middleware } from '@chubbyts/chubbyts-http-types/middleware';
import {
  createResponseFactory,
  createServerRequestFactory,
  createStreamFactory,
} from '@chubbyts/chubbyts-http/message-factory';
import type { Route } from '../src/router/route';
import type { RoutesByName } from '../src/router/routes-by-name';
import type { CreateMatch, Match } from '../src/router/route-matcher';
import type { CreateGeneratePath, CreateGenerateUrl, GeneratePath, GenerateUrl } from '../src/router/url-generator';
import { createApplicationBuilder } from '../src/facade';

const bodyFactory = createStreamFactory();
const responseFactory = createResponseFactory(bodyFactory);
const serverRequestFactory = createServerRequestFactory();

const createJsonResponse = (status: number, data: unknown): Response => {
  const response = responseFactory(status);

  return {
    ...response,
    headers: { ...response.headers, 'content-type': ['application/json'] },
    body: bodyFactory(JSON.stringify(data)),
  };
};

const corsMiddleware: Middleware = async (givenRequest, givenHandler) => givenHandler(givenRequest);
const acceptNegotiationMiddleware: Middleware = async (givenRequest, givenHandler) => givenHandler(givenRequest);
const apiErrorMiddleware: Middleware = async (givenRequest, givenHandler) => givenHandler(givenRequest);
const contentTypeNegotiationMiddleware: Middleware = async (givenRequest, givenHandler) => givenHandler(givenRequest);

describe('facade', () => {
  describe('createApplicationBuilder', () => {
    test('usage example', async () => {
      /* oxlint-disable unicorn/consistent-function-scoping */
      const pingHandler: Handler = async () => createJsonResponse(200, { datetime: '2026-08-14T12:00:00.000Z' });

      const openApiHandler: Handler = async () => createJsonResponse(200, {});

      const petListHandler: Handler = async () => createJsonResponse(200, [{ id: '1' }, { id: '2' }]);

      const petCreateHandler: Handler = async () => createJsonResponse(201, { id: '1' });

      const petReadHandler: Handler = async (givenRequest: ServerRequest) =>
        createJsonResponse(200, { id: givenRequest.attributes.id });

      const petUpdateHandler: Handler = async (givenRequest: ServerRequest) =>
        createJsonResponse(200, { id: givenRequest.attributes.id });

      const petDeleteHandler: Handler = async (givenRequest: ServerRequest) => {
        expect(givenRequest.attributes.id).toBe('1');

        return responseFactory(204);
      };
      /* oxlint-enable unicorn/consistent-function-scoping */

      const routeNamesByMethodAndPathname = new Map([
        ['GET /ping', 'ping'],
        ['GET /openapi', 'openapi'],
        ['GET /api/pets', 'pet_list'],
        ['POST /api/pets', 'pet_create'],
        ['GET /api/pets/1', 'pet_read'],
        ['PUT /api/pets/1', 'pet_update'],
        ['DELETE /api/pets/1', 'pet_delete'],
      ]);

      const [createMatch, createMatchMocks] = useFunctionMock<CreateMatch>([
        {
          callback:
            (givenRoutesByName: RoutesByName): Match =>
            (givenRequest: ServerRequest): Route => {
              const routeName = routeNamesByMethodAndPathname.get(
                `${givenRequest.method} ${givenRequest.uri.path}`,
              ) as string;

              const route = givenRoutesByName.get(routeName) as Route;

              return ['pet_read', 'pet_update', 'pet_delete'].includes(routeName)
                ? { ...route, attributes: { id: '1' } }
                : route;
            },
        },
      ]);

      const application = createApplicationBuilder({ createMatch, responseFactory, bodyFactory }, [corsMiddleware])
        .get('/ping', 'ping', pingHandler)
        .get('/openapi', 'openapi', openApiHandler)
        .group('/api/pets', [acceptNegotiationMiddleware, apiErrorMiddleware], (pets) =>
          pets
            .get('', 'pet_list', petListHandler)
            .post('', 'pet_create', [contentTypeNegotiationMiddleware], petCreateHandler)
            .get('/:id', 'pet_read', petReadHandler)
            .put('/:id', 'pet_update', [contentTypeNegotiationMiddleware], petUpdateHandler)
            .delete('/:id', 'pet_delete', petDeleteHandler),
        )
        .build();

      const pingResponse = await application(serverRequestFactory('GET', 'https://example.com/ping'));

      expect(pingResponse.status).toBe(200);
      expect(await json(pingResponse.body)).toEqual({ datetime: '2026-08-14T12:00:00.000Z' });

      const openApiResponse = await application(serverRequestFactory('GET', 'https://example.com/openapi'));

      expect(openApiResponse.status).toBe(200);
      expect(await json(openApiResponse.body)).toEqual({});

      const petListResponse = await application(serverRequestFactory('GET', 'https://example.com/api/pets'));

      expect(petListResponse.status).toBe(200);
      expect(await json(petListResponse.body)).toEqual([{ id: '1' }, { id: '2' }]);

      const petCreateResponse = await application(serverRequestFactory('POST', 'https://example.com/api/pets'));

      expect(petCreateResponse.status).toBe(201);
      expect(await json(petCreateResponse.body)).toEqual({ id: '1' });

      const petReadResponse = await application(serverRequestFactory('GET', 'https://example.com/api/pets/1'));

      expect(petReadResponse.status).toBe(200);
      expect(await json(petReadResponse.body)).toEqual({ id: '1' });

      const petUpdateResponse = await application(serverRequestFactory('PUT', 'https://example.com/api/pets/1'));

      expect(petUpdateResponse.status).toBe(200);
      expect(await json(petUpdateResponse.body)).toEqual({ id: '1' });

      const petDeleteResponse = await application(serverRequestFactory('DELETE', 'https://example.com/api/pets/1'));

      expect(petDeleteResponse.status).toBe(204);
      expect(await text(petDeleteResponse.body)).toBe('');

      expect(createMatchMocks).toHaveLength(0);
    });

    test('routes and groups', () => {
      const handler = useFunctionMock<Handler>([])[0];
      const middleware = useFunctionMock<Middleware>([])[0];

      const [match, matchMocks] = useFunctionMock<Match>([]);

      const [createMatch, createMatchMocks] = useFunctionMock<CreateMatch>([
        {
          callback: (givenRoutesByName: RoutesByName): Match => {
            expect(givenRoutesByName).toMatchInlineSnapshot(`
              Map {
                "pet_delete" => {
                  "_route": "Route",
                  "attributes": {},
                  "handler": [Function],
                  "method": "DELETE",
                  "middlewares": [],
                  "name": "pet_delete",
                  "path": "/api/pets/:id",
                  "pathOptions": {},
                },
                "pet_read" => {
                  "_route": "Route",
                  "attributes": {},
                  "handler": [Function],
                  "method": "GET",
                  "middlewares": [],
                  "name": "pet_read",
                  "path": "/api/pets/:id",
                  "pathOptions": {},
                },
                "pet_head" => {
                  "_route": "Route",
                  "attributes": {},
                  "handler": [Function],
                  "method": "HEAD",
                  "middlewares": [],
                  "name": "pet_head",
                  "path": "/api/pets/:id",
                  "pathOptions": {},
                },
                "pet_options" => {
                  "_route": "Route",
                  "attributes": {},
                  "handler": [Function],
                  "method": "OPTIONS",
                  "middlewares": [],
                  "name": "pet_options",
                  "path": "/api/pets/:id",
                  "pathOptions": {},
                },
                "pet_patch" => {
                  "_route": "Route",
                  "attributes": {},
                  "handler": [Function],
                  "method": "PATCH",
                  "middlewares": [],
                  "name": "pet_patch",
                  "path": "/api/pets/:id",
                  "pathOptions": {},
                },
                "pet_create" => {
                  "_route": "Route",
                  "attributes": {},
                  "handler": [Function],
                  "method": "POST",
                  "middlewares": [
                    [Function],
                  ],
                  "name": "pet_create",
                  "path": "/api/pets",
                  "pathOptions": {
                    "name": "create",
                  },
                },
                "pet_update" => {
                  "_route": "Route",
                  "attributes": {},
                  "handler": [Function],
                  "method": "PUT",
                  "middlewares": [],
                  "name": "pet_update",
                  "path": "/api/pets/:id",
                  "pathOptions": {
                    "name": "update",
                  },
                },
                "pet_trace" => {
                  "_route": "Route",
                  "attributes": {},
                  "handler": [Function],
                  "method": "TRACE",
                  "middlewares": [],
                  "name": "pet_trace",
                  "path": "/api/pets/:id",
                  "pathOptions": {},
                },
                "pet_list" => {
                  "_route": "Route",
                  "attributes": {},
                  "handler": [Function],
                  "method": "GET",
                  "middlewares": [
                    [Function],
                  ],
                  "name": "pet_list",
                  "path": "/api/pets",
                  "pathOptions": {
                    "key": "value",
                  },
                },
                "ping" => {
                  "_route": "Route",
                  "attributes": {},
                  "handler": [Function],
                  "method": "PURGE",
                  "middlewares": [
                    [Function],
                  ],
                  "name": "ping",
                  "path": "/misc/ping",
                  "pathOptions": {},
                },
              }
            `);

            return match;
          },
        },
      ]);

      const application = createApplicationBuilder({ createMatch, responseFactory, bodyFactory }, [])
        .delete('/api/pets/:id', 'pet_delete', handler)
        .get('/api/pets/:id', 'pet_read', handler)
        .head('/api/pets/:id', 'pet_head', handler)
        .options('/api/pets/:id', 'pet_options', [], handler)
        .patch('/api/pets/:id', 'pet_patch', handler)
        .post('/api/pets', 'pet_create', [middleware], handler, { name: 'create' })
        .put('/api/pets/:id', 'pet_update', handler, { name: 'update' })
        .route('TRACE', '/api/pets/:id', 'pet_trace', handler)
        .group('/api/pets', [middleware], (pets) => pets.get('', 'pet_list', handler), { key: 'value' })
        .group('/misc', (misc) => misc.route('PURGE', '/ping', 'ping', [middleware], handler))
        .build();

      expect(application).toBeInstanceOf(Function);

      expect(matchMocks).toHaveLength(0);
      expect(createMatchMocks).toHaveLength(0);
    });

    test('immutability', () => {
      const handler = useFunctionMock<Handler>([])[0];

      const [match, matchMocks] = useFunctionMock<Match>([]);

      const [createMatch, createMatchMocks] = useFunctionMock<CreateMatch>([
        {
          callback: (givenRoutesByName: RoutesByName): Match => {
            expect([...givenRoutesByName.keys()]).toEqual([]);

            return match;
          },
        },
        {
          callback: (givenRoutesByName: RoutesByName): Match => {
            expect([...givenRoutesByName.keys()]).toEqual(['pong']);

            return match;
          },
        },
      ]);

      const applicationBuilder = createApplicationBuilder({ createMatch, responseFactory, bodyFactory }, []);

      applicationBuilder.get('/ping', 'ping', handler);
      applicationBuilder.build();

      applicationBuilder.get('/pong', 'pong', handler).build();

      expect(matchMocks).toHaveLength(0);
      expect(createMatchMocks).toHaveLength(0);
    });

    test('handle without generators', async () => {
      const request = serverRequestFactory('GET', 'https://example.com/hello/name');
      const response = responseFactory(200);

      const [handler, handlerMocks] = useFunctionMock<Handler>([
        {
          callback: async (givenRequest: ServerRequest): Promise<Response> => {
            expect(Object.keys(givenRequest.attributes)).toEqual(['route']);
            expect(givenRequest.attributes.route).toBe(route);

            return response;
          },
        },
      ]);

      const route = { handler, middlewares: [], _route: 'Route' } as unknown as Route;

      const [middleware, middlewareMocks] = useFunctionMock<Middleware>([
        {
          callback: async (givenRequest: ServerRequest, givenHandler: Handler): Promise<Response> => {
            expect(givenRequest).toBe(request);

            return givenHandler(givenRequest);
          },
        },
      ]);

      const [match, matchMocks] = useFunctionMock<Match>([{ parameters: [request], return: route }]);

      const [createMatch, createMatchMocks] = useFunctionMock<CreateMatch>([{ callback: (): Match => match }]);

      const application = createApplicationBuilder({ createMatch, responseFactory, bodyFactory }, [middleware]).build();

      expect(await application(request)).toBe(response);

      expect(handlerMocks).toHaveLength(0);
      expect(middlewareMocks).toHaveLength(0);
      expect(matchMocks).toHaveLength(0);
      expect(createMatchMocks).toHaveLength(0);
    });

    test('handle with createGeneratePath', async () => {
      const request = serverRequestFactory('GET', 'https://example.com/hello/name');
      const response = responseFactory(200);

      const generatePath = useFunctionMock<GeneratePath>([])[0];

      const [handler, handlerMocks] = useFunctionMock<Handler>([
        {
          callback: async (givenRequest: ServerRequest): Promise<Response> => {
            expect(Object.keys(givenRequest.attributes)).toEqual(['generatePath', 'route']);
            expect(givenRequest.attributes.generatePath).toBe(generatePath);
            expect(givenRequest.attributes.generateUrl).toBeUndefined();
            expect(givenRequest.attributes.route).toBe(route);

            return response;
          },
        },
      ]);

      const route = { handler, middlewares: [], _route: 'Route' } as unknown as Route;

      const [match, matchMocks] = useFunctionMock<Match>([
        {
          callback: (givenRequest: ServerRequest): Route => {
            expect(givenRequest.attributes.generatePath).toBe(generatePath);

            return route;
          },
        },
      ]);

      const [createMatch, createMatchMocks] = useFunctionMock<CreateMatch>([{ callback: (): Match => match }]);

      const [createGeneratePath, createGeneratePathMocks] = useFunctionMock<CreateGeneratePath>([
        {
          callback: (givenRoutesByName: RoutesByName): GeneratePath => {
            expect(givenRoutesByName).toBeInstanceOf(Map);

            return generatePath;
          },
        },
      ]);

      const application = createApplicationBuilder(
        { createMatch, responseFactory, bodyFactory, createGeneratePath },
        [],
      ).build();

      expect(await application(request)).toBe(response);

      expect(handlerMocks).toHaveLength(0);
      expect(matchMocks).toHaveLength(0);
      expect(createMatchMocks).toHaveLength(0);
      expect(createGeneratePathMocks).toHaveLength(0);
    });

    test('handle with createGenerateUrl', async () => {
      const request = serverRequestFactory('GET', 'https://example.com/hello/name');
      const response = responseFactory(200);

      const generateUrl = useFunctionMock<GenerateUrl>([])[0];

      const [handler, handlerMocks] = useFunctionMock<Handler>([
        {
          callback: async (givenRequest: ServerRequest): Promise<Response> => {
            expect(Object.keys(givenRequest.attributes)).toEqual(['generateUrl', 'route']);
            expect(givenRequest.attributes.generateUrl).toBe(generateUrl);
            expect(givenRequest.attributes.generatePath).toBeUndefined();
            expect(givenRequest.attributes.route).toBe(route);

            return response;
          },
        },
      ]);

      const route = { handler, middlewares: [], _route: 'Route' } as unknown as Route;

      const [match, matchMocks] = useFunctionMock<Match>([
        {
          callback: (givenRequest: ServerRequest): Route => {
            expect(givenRequest.attributes.generateUrl).toBe(generateUrl);

            return route;
          },
        },
      ]);

      const [createMatch, createMatchMocks] = useFunctionMock<CreateMatch>([{ callback: (): Match => match }]);

      const [createGenerateUrl, createGenerateUrlMocks] = useFunctionMock<CreateGenerateUrl>([
        {
          callback: (givenRoutesByName: RoutesByName): GenerateUrl => {
            expect(givenRoutesByName).toBeInstanceOf(Map);

            return generateUrl;
          },
        },
      ]);

      const application = createApplicationBuilder(
        { createMatch, responseFactory, bodyFactory, createGenerateUrl },
        [],
      ).build();

      expect(await application(request)).toBe(response);

      expect(handlerMocks).toHaveLength(0);
      expect(matchMocks).toHaveLength(0);
      expect(createMatchMocks).toHaveLength(0);
      expect(createGenerateUrlMocks).toHaveLength(0);
    });

    test('handle with error', async () => {
      const error = new Error('something went wrong');
      const httpError = createNotFound({ detail: 'There is no pet with id 1' });

      const request = serverRequestFactory('GET', 'https://example.com/api/pets/1');

      const [match, matchMocks] = useFunctionMock<Match>([{ parameters: [request], error }]);

      const [createMatch, createMatchMocks] = useFunctionMock<CreateMatch>([{ callback: (): Match => match }]);

      const [logger, loggerMocks] = useObjectMock<Logger>([
        {
          name: 'info',
          callback: (message: string, context: Record<string, unknown>) => {
            expect(message).toBe('Http Error');
            expect(context).toHaveProperty('data');
          },
        },
      ]);

      const [mapToHttpError, mapToHttpErrorMocks] = useFunctionMock<MapToHttpError>([
        { parameters: [error], return: httpError },
      ]);

      const application = createApplicationBuilder(
        { createMatch, responseFactory, bodyFactory, debug: true, logger, mapToHttpError },
        [],
      ).build();

      const response = await application(request);

      expect(response.status).toBe(404);
      expect(response.reasonPhrase).toBe('Not Found');

      const body = await text(response.body);

      expect(body).toContain('There is no pet with id 1');
      expect(body).toContain('<strong>stack</strong>');

      expect(matchMocks).toHaveLength(0);
      expect(createMatchMocks).toHaveLength(0);
      expect(loggerMocks).toHaveLength(0);
      expect(mapToHttpErrorMocks).toHaveLength(0);
    });
  });
});
