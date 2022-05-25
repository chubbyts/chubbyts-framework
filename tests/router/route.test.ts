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
import { Method } from '../../src/vendor/chubbyts-types/message';

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
        Object {
          "_route": "Route",
          "attributes": Object {},
          "handler": [MockFunction],
          "method": "GET",
          "middlewares": Array [],
          "name": "pet_read",
          "path": "/api/pet/{id}",
          "pathOptions": Object {},
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
        Object {
          "_route": "Route",
          "attributes": Object {},
          "handler": [MockFunction],
          "method": "GET",
          "middlewares": Array [
            [MockFunction],
          ],
          "name": "pet_read",
          "path": "/api/pet/{id}",
          "pathOptions": Object {
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
      Object {
        "_route": "Route",
        "attributes": Object {},
        "handler": [MockFunction],
        "method": "DELETE",
        "middlewares": Array [
          [MockFunction],
        ],
        "name": "pet_delete",
        "path": "/api/pet/{id}",
        "pathOptions": Object {
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
      Object {
        "_route": "Route",
        "attributes": Object {},
        "handler": [MockFunction],
        "method": "GET",
        "middlewares": Array [
          [MockFunction],
        ],
        "name": "pet_read",
        "path": "/api/pet/{id}",
        "pathOptions": Object {
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
      Object {
        "_route": "Route",
        "attributes": Object {},
        "handler": [MockFunction],
        "method": "HEAD",
        "middlewares": Array [
          [MockFunction],
        ],
        "name": "pet_head",
        "path": "/api/pet/{id}",
        "pathOptions": Object {
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
      Object {
        "_route": "Route",
        "attributes": Object {},
        "handler": [MockFunction],
        "method": "OPTIONS",
        "middlewares": Array [
          [MockFunction],
        ],
        "name": "pet_options",
        "path": "/api/pet/{id}",
        "pathOptions": Object {
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
      Object {
        "_route": "Route",
        "attributes": Object {},
        "handler": [MockFunction],
        "method": "PATCH",
        "middlewares": Array [
          [MockFunction],
        ],
        "name": "pet_patch",
        "path": "/api/pet/{id}",
        "pathOptions": Object {
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
      Object {
        "_route": "Route",
        "attributes": Object {},
        "handler": [MockFunction],
        "method": "POST",
        "middlewares": Array [
          [MockFunction],
        ],
        "name": "pet_post",
        "path": "/api/pet/{id}",
        "pathOptions": Object {
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
      Object {
        "_route": "Route",
        "attributes": Object {},
        "handler": [MockFunction],
        "method": "PUT",
        "middlewares": Array [
          [MockFunction],
        ],
        "name": "pet_put",
        "path": "/api/pet/{id}",
        "pathOptions": Object {
          "name": "put",
        },
      }
    `);
  });
});
