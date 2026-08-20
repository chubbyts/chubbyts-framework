import { describe, expect, test } from 'vitest';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { useObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import type { Logger } from '@chubbyts/chubbyts-log-types/dist/log';
import type { MapToHttpError } from '@chubbyts/chubbyts-http-error/dist/http-error';
import { createNotFound } from '@chubbyts/chubbyts-http-error/dist/http-error';
import type { Handler, Middleware } from '@chubbyts/chubbyts-undici-server/dist/server';
import { Response, ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { Route } from '../src/router/route';
import type { RoutesByName } from '../src/router/routes-by-name';
import type { CreateMatch, Match } from '../src/router/route-matcher';
import type { CreateGeneratePath, CreateGenerateUrl, GeneratePath, GenerateUrl } from '../src/router/url-generator';
import { createApplicationBuilder } from '../src/facade';

const corsMiddleware: Middleware = async (givenRequest, givenHandler) => givenHandler(givenRequest);
const acceptNegotiationMiddleware: Middleware = async (givenRequest, givenHandler) => givenHandler(givenRequest);
const apiErrorMiddleware: Middleware = async (givenRequest, givenHandler) => givenHandler(givenRequest);
const contentTypeNegotiationMiddleware: Middleware = async (givenRequest, givenHandler) => givenHandler(givenRequest);

describe('facade', () => {
  describe('createApplicationBuilder', () => {
    test('usage example', async () => {
      /* oxlint-disable unicorn/consistent-function-scoping */
      const pingHandler: Handler = async () =>
        new Response(JSON.stringify({ datetime: '2026-08-14T12:00:00.000Z' }), {
          headers: { 'content-type': 'application/json' },
        });

      const openApiHandler: Handler = async () =>
        new Response(JSON.stringify({}), {
          headers: { 'content-type': 'application/json' },
        });

      const petListHandler: Handler = async () =>
        new Response(JSON.stringify([{ id: '1' }, { id: '2' }]), {
          headers: { 'content-type': 'application/json' },
        });

      const petCreateHandler: Handler = async () =>
        new Response(JSON.stringify({ id: '1' }), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        });

      const petReadHandler: Handler = async (givenRequest: ServerRequest) =>
        new Response(JSON.stringify({ id: givenRequest.attributes.id }), {
          headers: { 'content-type': 'application/json' },
        });

      const petUpdateHandler: Handler = async (givenRequest: ServerRequest) =>
        new Response(JSON.stringify({ id: givenRequest.attributes.id }), {
          headers: { 'content-type': 'application/json' },
        });

      const petDeleteHandler: Handler = async (givenRequest: ServerRequest) => {
        expect(givenRequest.attributes.id).toBe('1');

        return new Response(null, { status: 204 });
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
              const { pathname } = new URL(givenRequest.url);

              const routeName = routeNamesByMethodAndPathname.get(`${givenRequest.method} ${pathname}`) as string;

              const route = givenRoutesByName.get(routeName) as Route;

              return ['pet_read', 'pet_update', 'pet_delete'].includes(routeName)
                ? { ...route, attributes: { id: '1' } }
                : route;
            },
        },
      ]);

      const application = createApplicationBuilder(createMatch, [corsMiddleware])
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

      const pingResponse = await application(new ServerRequest('https://example.com/ping'));

      expect(pingResponse.status).toBe(200);
      expect(await pingResponse.json()).toEqual({ datetime: '2026-08-14T12:00:00.000Z' });

      const openApiResponse = await application(new ServerRequest('https://example.com/openapi'));

      expect(openApiResponse.status).toBe(200);
      expect(await openApiResponse.json()).toEqual({});

      const petListResponse = await application(new ServerRequest('https://example.com/api/pets'));

      expect(petListResponse.status).toBe(200);
      expect(await petListResponse.json()).toEqual([{ id: '1' }, { id: '2' }]);

      const petCreateResponse = await application(
        new ServerRequest('https://example.com/api/pets', { method: 'POST' }),
      );

      expect(petCreateResponse.status).toBe(201);
      expect(await petCreateResponse.json()).toEqual({ id: '1' });

      const petReadResponse = await application(new ServerRequest('https://example.com/api/pets/1'));

      expect(petReadResponse.status).toBe(200);
      expect(await petReadResponse.json()).toEqual({ id: '1' });

      const petUpdateResponse = await application(
        new ServerRequest('https://example.com/api/pets/1', { method: 'PUT' }),
      );

      expect(petUpdateResponse.status).toBe(200);
      expect(await petUpdateResponse.json()).toEqual({ id: '1' });

      const petDeleteResponse = await application(
        new ServerRequest('https://example.com/api/pets/1', { method: 'DELETE' }),
      );

      expect(petDeleteResponse.status).toBe(204);
      expect(await petDeleteResponse.text()).toBe('');

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

      const application = createApplicationBuilder(createMatch)
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

      const applicationBuilder = createApplicationBuilder(createMatch, []);

      applicationBuilder.get('/ping', 'ping', handler);
      applicationBuilder.build();

      applicationBuilder.get('/pong', 'pong', handler).build();

      expect(matchMocks).toHaveLength(0);
      expect(createMatchMocks).toHaveLength(0);
    });

    test('handle without generators', async () => {
      const request = new ServerRequest('https://example.com/hello/name');
      const response = new Response('');

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

      const application = createApplicationBuilder(createMatch, [middleware]).build();

      expect(await application(request)).toBe(response);

      expect(handlerMocks).toHaveLength(0);
      expect(middlewareMocks).toHaveLength(0);
      expect(matchMocks).toHaveLength(0);
      expect(createMatchMocks).toHaveLength(0);
    });

    test('handle with createGeneratePath', async () => {
      const request = new ServerRequest('https://example.com/hello/name');
      const response = new Response('');

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

      const application = createApplicationBuilder(createMatch, { createGeneratePath }).build();

      expect(await application(request)).toBe(response);

      expect(handlerMocks).toHaveLength(0);
      expect(matchMocks).toHaveLength(0);
      expect(createMatchMocks).toHaveLength(0);
      expect(createGeneratePathMocks).toHaveLength(0);
    });

    test('handle with createGenerateUrl', async () => {
      const request = new ServerRequest('https://example.com/hello/name');
      const response = new Response('');

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

      const application = createApplicationBuilder(createMatch, { createGenerateUrl }).build();

      expect(await application(request)).toBe(response);

      expect(handlerMocks).toHaveLength(0);
      expect(matchMocks).toHaveLength(0);
      expect(createMatchMocks).toHaveLength(0);
      expect(createGenerateUrlMocks).toHaveLength(0);
    });

    test('handle with error', async () => {
      const error = new Error('something went wrong');
      const httpError = createNotFound({ detail: 'There is no pet with id 1' });

      const request = new ServerRequest('https://example.com/api/pets/1');

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

      const application = createApplicationBuilder(createMatch, [], {
        debug: true,
        logger,
        mapToHttpError,
      }).build();

      const response = await application(request);

      expect(response.status).toBe(404);
      expect(response.statusText).toBe('Not Found');

      const body = await response.text();

      expect(body).toContain('There is no pet with id 1');
      expect(body).toContain('<strong>stack</strong>');

      expect(matchMocks).toHaveLength(0);
      expect(createMatchMocks).toHaveLength(0);
      expect(loggerMocks).toHaveLength(0);
      expect(mapToHttpErrorMocks).toHaveLength(0);
    });
  });
});
