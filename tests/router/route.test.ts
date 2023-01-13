import { describe, expect, test } from '@jest/globals';
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
import { Method } from '@chubbyts/chubbyts-http-types/dist/message';

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
          handler: jest.fn(),
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [MockFunction],
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
          handler: jest.fn(),
          middlewares: [jest.fn()],
          pathOptions: { name: 'read' },
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [MockFunction],
          "method": "GET",
          "middlewares": [
            [MockFunction],
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
        handler: jest.fn(),
        middlewares: [jest.fn()],
        pathOptions: { name: 'delete' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "_route": "Route",
        "attributes": {},
        "handler": [MockFunction],
        "method": "DELETE",
        "middlewares": [
          [MockFunction],
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
        handler: jest.fn(),
        middlewares: [jest.fn()],
        pathOptions: { name: 'read' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "_route": "Route",
        "attributes": {},
        "handler": [MockFunction],
        "method": "GET",
        "middlewares": [
          [MockFunction],
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
        handler: jest.fn(),
        middlewares: [jest.fn()],
        pathOptions: { name: 'head' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "_route": "Route",
        "attributes": {},
        "handler": [MockFunction],
        "method": "HEAD",
        "middlewares": [
          [MockFunction],
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
        handler: jest.fn(),
        middlewares: [jest.fn()],
        pathOptions: { name: 'options' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "_route": "Route",
        "attributes": {},
        "handler": [MockFunction],
        "method": "OPTIONS",
        "middlewares": [
          [MockFunction],
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
        handler: jest.fn(),
        middlewares: [jest.fn()],
        pathOptions: { name: 'patch' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "_route": "Route",
        "attributes": {},
        "handler": [MockFunction],
        "method": "PATCH",
        "middlewares": [
          [MockFunction],
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
        handler: jest.fn(),
        middlewares: [jest.fn()],
        pathOptions: { name: 'post' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "_route": "Route",
        "attributes": {},
        "handler": [MockFunction],
        "method": "POST",
        "middlewares": [
          [MockFunction],
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
        handler: jest.fn(),
        middlewares: [jest.fn()],
        pathOptions: { name: 'put' },
      }),
    ).toMatchInlineSnapshot(`
      {
        "_route": "Route",
        "attributes": {},
        "handler": [MockFunction],
        "method": "PUT",
        "middlewares": [
          [MockFunction],
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
          // @ts-ignore
          method: 'SOMETHING',
          path: '/api/pet/{id}',
          name: 'pet_delete',
          handler: jest.fn(),
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [MockFunction],
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
          // @ts-ignore
          method: 'SOMETHING',
          path: '/api/pet/{id}',
          name: 'pet_read',
          handler: jest.fn(),
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [MockFunction],
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
          // @ts-ignore
          method: 'SOMETHING',
          path: '/api/pet/{id}',
          name: 'pet_head',
          handler: jest.fn(),
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [MockFunction],
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
          // @ts-ignore
          method: 'SOMETHING',
          path: '/api/pet/{id}',
          name: 'pet_options',
          handler: jest.fn(),
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [MockFunction],
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
          // @ts-ignore
          method: 'SOMETHING',
          path: '/api/pet/{id}',
          name: 'pet_patch',
          handler: jest.fn(),
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [MockFunction],
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
          // @ts-ignore
          method: 'SOMETHING',
          path: '/api/pet/{id}',
          name: 'pet_post',
          handler: jest.fn(),
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [MockFunction],
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
          // @ts-ignore
          method: 'SOMETHING',
          path: '/api/pet/{id}',
          name: 'pet_put',
          handler: jest.fn(),
        }),
      ).toMatchInlineSnapshot(`
        {
          "_route": "Route",
          "attributes": {},
          "handler": [MockFunction],
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
