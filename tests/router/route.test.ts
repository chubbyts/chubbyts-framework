import { describe, expect, test } from '@jest/globals';
import { Method } from '@chubbyts/chubbyts-http-types/dist/message';
import { createFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import {
  createRoute,
  createDeleteRoute,
  isRoute,
  createGetRoute,
  createHeadRoute,
  createOptionsRoute,
  createPatchRoute,
  createPostRoute,
  createPutRoute,
} from '../../src/router/route';

describe('route', () => {
  describe('isRoute', () => {
    [
      { name: 'route', value: { _route: 'Route' }, toBe: true },
      { name: 'error', value: new Error(), toBe: false },
      { name: 'object', value: {}, toBe: false },
      { name: 'string', value: 'example', toBe: false },
      { name: 'undefined', value: undefined, toBe: false },
      { name: 'null', value: null, toBe: false },
    ].forEach(({ name, value, toBe }) => {
      test('type is ' + name, () => {
        expect(isRoute(value)).toBe(toBe);
      });
    });
  });

  describe('createRoute', () => {
    test('minimal', () => {
      expect(
        createRoute({
          method: Method.GET,
          path: '/api/pet/{id}',
          name: 'pet_read',
          handler: createFunctionMock<Handler>([]),
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [Function],
          "method": "GET",
          "middlewares": [],
          "name": "pet_read",
          "path": "/api/pet/{id}",
          "pathOptions": {},
        }
      `);
    });

    test('maximal', () => {
      expect(
        createRoute({
          method: Method.GET,
          path: '/api/pet/{id}',
          name: 'pet_read',
          handler: createFunctionMock<Handler>([]),
          middlewares: [createFunctionMock<Middleware>([])],
          pathOptions: { name: 'read' },
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [Function],
          "method": "GET",
          "middlewares": [
            [Function],
          ],
          "name": "pet_read",
          "path": "/api/pet/{id}",
          "pathOptions": {
            "name": "read",
          },
        }
      `);
    });
  });

  test('createDeleteRoute', () => {
    expect(
      createDeleteRoute({
        path: '/api/pet/{id}',
        name: 'pet_delete',
        handler: createFunctionMock<Handler>([]),
        middlewares: [createFunctionMock<Middleware>([])],
        pathOptions: { name: 'delete' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "_route": "Route",
        "attributes": {},
        "handler": [Function],
        "method": "DELETE",
        "middlewares": [
          [Function],
        ],
        "name": "pet_delete",
        "path": "/api/pet/{id}",
        "pathOptions": {
          "name": "delete",
        },
      }
    `);
  });

  test('createGetRoute', () => {
    expect(
      createGetRoute({
        path: '/api/pet/{id}',
        name: 'pet_read',
        handler: createFunctionMock<Handler>([]),
        middlewares: [createFunctionMock<Middleware>([])],
        pathOptions: { name: 'read' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "_route": "Route",
        "attributes": {},
        "handler": [Function],
        "method": "GET",
        "middlewares": [
          [Function],
        ],
        "name": "pet_read",
        "path": "/api/pet/{id}",
        "pathOptions": {
          "name": "read",
        },
      }
    `);
  });

  test('createHeadRoute', () => {
    expect(
      createHeadRoute({
        path: '/api/pet/{id}',
        name: 'pet_head',
        handler: createFunctionMock<Handler>([]),
        middlewares: [createFunctionMock<Middleware>([])],
        pathOptions: { name: 'head' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "_route": "Route",
        "attributes": {},
        "handler": [Function],
        "method": "HEAD",
        "middlewares": [
          [Function],
        ],
        "name": "pet_head",
        "path": "/api/pet/{id}",
        "pathOptions": {
          "name": "head",
        },
      }
    `);
  });

  test('createOptionsRoute', () => {
    expect(
      createOptionsRoute({
        path: '/api/pet/{id}',
        name: 'pet_options',
        handler: createFunctionMock<Handler>([]),
        middlewares: [createFunctionMock<Middleware>([])],
        pathOptions: { name: 'options' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "_route": "Route",
        "attributes": {},
        "handler": [Function],
        "method": "OPTIONS",
        "middlewares": [
          [Function],
        ],
        "name": "pet_options",
        "path": "/api/pet/{id}",
        "pathOptions": {
          "name": "options",
        },
      }
    `);
  });

  test('createPatchRoute', () => {
    expect(
      createPatchRoute({
        path: '/api/pet/{id}',
        name: 'pet_patch',
        handler: createFunctionMock<Handler>([]),
        middlewares: [createFunctionMock<Middleware>([])],
        pathOptions: { name: 'patch' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "_route": "Route",
        "attributes": {},
        "handler": [Function],
        "method": "PATCH",
        "middlewares": [
          [Function],
        ],
        "name": "pet_patch",
        "path": "/api/pet/{id}",
        "pathOptions": {
          "name": "patch",
        },
      }
    `);
  });

  test('createPostRoute', () => {
    expect(
      createPostRoute({
        path: '/api/pet/{id}',
        name: 'pet_post',
        handler: createFunctionMock<Handler>([]),
        middlewares: [createFunctionMock<Middleware>([])],
        pathOptions: { name: 'post' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "_route": "Route",
        "attributes": {},
        "handler": [Function],
        "method": "POST",
        "middlewares": [
          [Function],
        ],
        "name": "pet_post",
        "path": "/api/pet/{id}",
        "pathOptions": {
          "name": "post",
        },
      }
    `);
  });

  test('createPutRoute', () => {
    expect(
      createPutRoute({
        path: '/api/pet/{id}',
        name: 'pet_put',
        handler: createFunctionMock<Handler>([]),
        middlewares: [createFunctionMock<Middleware>([])],
        pathOptions: { name: 'put' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "_route": "Route",
        "attributes": {},
        "handler": [Function],
        "method": "PUT",
        "middlewares": [
          [Function],
        ],
        "name": "pet_put",
        "path": "/api/pet/{id}",
        "pathOptions": {
          "name": "put",
        },
      }
    `);
  });

  describe('createRoute with trying to override method', () => {
    test('createDeleteRoute', () => {
      expect(
        createDeleteRoute({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          method: 'SOMETHING',
          path: '/api/pet/{id}',
          name: 'pet_delete',
          handler: createFunctionMock<Handler>([]),
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [Function],
          "method": "DELETE",
          "middlewares": [],
          "name": "pet_delete",
          "path": "/api/pet/{id}",
          "pathOptions": {},
        }
      `);
    });

    test('createGetRoute', () => {
      expect(
        createGetRoute({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          method: 'SOMETHING',
          path: '/api/pet/{id}',
          name: 'pet_read',
          handler: createFunctionMock<Handler>([]),
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [Function],
          "method": "GET",
          "middlewares": [],
          "name": "pet_read",
          "path": "/api/pet/{id}",
          "pathOptions": {},
        }
      `);
    });

    test('createHeadRoute', () => {
      expect(
        createHeadRoute({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          method: 'SOMETHING',
          path: '/api/pet/{id}',
          name: 'pet_head',
          handler: createFunctionMock<Handler>([]),
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [Function],
          "method": "HEAD",
          "middlewares": [],
          "name": "pet_head",
          "path": "/api/pet/{id}",
          "pathOptions": {},
        }
      `);
    });

    test('createOptionsRoute', () => {
      expect(
        createOptionsRoute({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          method: 'SOMETHING',
          path: '/api/pet/{id}',
          name: 'pet_options',
          handler: createFunctionMock<Handler>([]),
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [Function],
          "method": "OPTIONS",
          "middlewares": [],
          "name": "pet_options",
          "path": "/api/pet/{id}",
          "pathOptions": {},
        }
      `);
    });

    test('createPatchRoute', () => {
      expect(
        createPatchRoute({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          method: 'SOMETHING',
          path: '/api/pet/{id}',
          name: 'pet_patch',
          handler: createFunctionMock<Handler>([]),
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [Function],
          "method": "PATCH",
          "middlewares": [],
          "name": "pet_patch",
          "path": "/api/pet/{id}",
          "pathOptions": {},
        }
      `);
    });

    test('createPostRoute', () => {
      expect(
        createPostRoute({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          method: 'SOMETHING',
          path: '/api/pet/{id}',
          name: 'pet_post',
          handler: createFunctionMock<Handler>([]),
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [Function],
          "method": "POST",
          "middlewares": [],
          "name": "pet_post",
          "path": "/api/pet/{id}",
          "pathOptions": {},
        }
      `);
    });

    test('createPutRoute', () => {
      expect(
        createPutRoute({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          method: 'SOMETHING',
          path: '/api/pet/{id}',
          name: 'pet_put',
          handler: createFunctionMock<Handler>([]),
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [Function],
          "method": "PUT",
          "middlewares": [],
          "name": "pet_put",
          "path": "/api/pet/{id}",
          "pathOptions": {},
        }
      `);
    });
  });
});
