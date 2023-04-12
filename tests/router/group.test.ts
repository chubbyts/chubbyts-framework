import { describe, expect, test } from '@jest/globals';
import { Method } from '@chubbyts/chubbyts-http-types/dist/message';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { createRoute } from '../../src/router/route';
import { createGroup, getRoutes, isGroup } from '../../src/router/group';

describe('group', () => {
  describe('isGroup', () => {
    [
      { name: 'group', value: { _group: 'Group' }, toBe: true },
      { name: 'error', value: new Error(), toBe: false },
      { name: 'object', value: {}, toBe: false },
      { name: 'string', value: 'example', toBe: false },
      { name: 'undefined', value: undefined, toBe: false },
      { name: 'null', value: null, toBe: false },
    ].forEach(({ name, value, toBe }) => {
      test('type is ' + name, () => {
        expect(isGroup(value)).toBe(toBe);
      });
    });
  });

  describe('createGroup', () => {
    test('minimal', () => {
      expect(
        createGroup({
          path: '/api',
          children: [],
        }),
      ).toMatchInlineSnapshot(`
        {
          "_group": "Group",
          "children": [],
          "middlewares": [],
          "path": "/api",
          "pathOptions": {},
        }
      `);
    });

    test('maximal', () => {
      expect(
        createGroup({
          path: '/api',
          children: [
            createGroup({
              path: '/pet',
              children: [],
            }),
          ],

          middlewares: [useFunctionMock<Middleware>([])[0]],
          pathOptions: { key: 'value' },
        }),
      ).toMatchInlineSnapshot(`
        {
          "_group": "Group",
          "children": [
            {
              "_group": "Group",
              "children": [],
              "middlewares": [],
              "path": "/pet",
              "pathOptions": {},
            },
          ],
          "middlewares": [
            [Function],
          ],
          "path": "/api",
          "pathOptions": {
            "key": "value",
          },
        }
      `);
    });
  });

  test('getRoutes', () => {
    const group = createGroup({
      path: '/api',
      children: [
        createGroup({
          path: '/pet',
          children: [
            createRoute({
              method: Method.GET,
              path: '/',
              name: 'pet_list',
              handler: useFunctionMock<Handler>([])[0],
              middlewares: [useFunctionMock<Middleware>([])[0]],
              pathOptions: { name3: 'list' },
            }),
            createRoute({
              method: Method.POST,
              path: '/',
              name: 'pet_create',
              handler: useFunctionMock<Handler>([])[0],
              middlewares: [useFunctionMock<Middleware>([])[0]],
              pathOptions: { name3: 'create' },
            }),
            createRoute({
              method: Method.GET,
              path: '/{id}',
              name: 'pet_read',
              handler: useFunctionMock<Handler>([])[0],
              middlewares: [useFunctionMock<Middleware>([])[0]],
              pathOptions: { name3: 'read' },
            }),
            createRoute({
              method: Method.PUT,
              path: '/{id}',
              name: 'pet_update',
              handler: useFunctionMock<Handler>([])[0],
              middlewares: [useFunctionMock<Middleware>([])[0]],
              pathOptions: { name3: 'update' },
            }),
            createRoute({
              method: Method.DELETE,
              path: '/{id}',
              name: 'pet_delete',
              handler: useFunctionMock<Handler>([])[0],
              middlewares: [useFunctionMock<Middleware>([])[0]],
              pathOptions: { name3: 'delete' },
            }),
          ],
          middlewares: [useFunctionMock<Middleware>([])[0]],
          pathOptions: { name2: 'pet' },
        }),
      ],
      middlewares: [useFunctionMock<Middleware>([])[0]],
      pathOptions: { name1: 'api' },
    });

    expect(getRoutes(group)).toMatchInlineSnapshot(`
      [
        {
          "_route": "Route",
          "attributes": {},
          "handler": [Function],
          "method": "GET",
          "middlewares": [
            [Function],
            [Function],
            [Function],
          ],
          "name": "pet_list",
          "path": "/api/pet/",
          "pathOptions": {
            "name1": "api",
            "name2": "pet",
            "name3": "list",
          },
        },
        {
          "_route": "Route",
          "attributes": {},
          "handler": [Function],
          "method": "POST",
          "middlewares": [
            [Function],
            [Function],
            [Function],
          ],
          "name": "pet_create",
          "path": "/api/pet/",
          "pathOptions": {
            "name1": "api",
            "name2": "pet",
            "name3": "create",
          },
        },
        {
          "_route": "Route",
          "attributes": {},
          "handler": [Function],
          "method": "GET",
          "middlewares": [
            [Function],
            [Function],
            [Function],
          ],
          "name": "pet_read",
          "path": "/api/pet/{id}",
          "pathOptions": {
            "name1": "api",
            "name2": "pet",
            "name3": "read",
          },
        },
        {
          "_route": "Route",
          "attributes": {},
          "handler": [Function],
          "method": "PUT",
          "middlewares": [
            [Function],
            [Function],
            [Function],
          ],
          "name": "pet_update",
          "path": "/api/pet/{id}",
          "pathOptions": {
            "name1": "api",
            "name2": "pet",
            "name3": "update",
          },
        },
        {
          "_route": "Route",
          "attributes": {},
          "handler": [Function],
          "method": "DELETE",
          "middlewares": [
            [Function],
            [Function],
            [Function],
          ],
          "name": "pet_delete",
          "path": "/api/pet/{id}",
          "pathOptions": {
            "name1": "api",
            "name2": "pet",
            "name3": "delete",
          },
        },
      ]
    `);
  });
});
