import { describe, expectTypeOf, test } from 'vitest';
import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/message';
import type { Route } from '../../src/router/route.js';
import {
  createRoute,
  createDeleteRoute,
  createGetRoute,
  createHeadRoute,
  createOptionsRoute,
  createPatchRoute,
  createPostRoute,
  createPutRoute,
} from '../../src/router/route.js';

type Attributes = { name: string };

const response = {} as Response;

const incompatibleHandler = async (_serverRequest: ServerRequest<{ name: number }>) => response;

describe('route generics', () => {
  test('createRoute', () => {
    expectTypeOf(
      createRoute<Attributes>({
        method: 'GET',
        path: '/hello/:name',
        name: 'hello',
        handler: async (serverRequest) => {
          expectTypeOf(serverRequest).toEqualTypeOf<ServerRequest<Attributes>>();
          expectTypeOf(serverRequest.attributes.name).toEqualTypeOf<string>();

          return response;
        },
      }),
    ).toEqualTypeOf<Route>();
  });

  [
    { name: 'createDeleteRoute', createRouteWithGivenMethod: createDeleteRoute },
    { name: 'createGetRoute', createRouteWithGivenMethod: createGetRoute },
    { name: 'createHeadRoute', createRouteWithGivenMethod: createHeadRoute },
    { name: 'createOptionsRoute', createRouteWithGivenMethod: createOptionsRoute },
    { name: 'createPatchRoute', createRouteWithGivenMethod: createPatchRoute },
    { name: 'createPostRoute', createRouteWithGivenMethod: createPostRoute },
    { name: 'createPutRoute', createRouteWithGivenMethod: createPutRoute },
  ].forEach(({ name, createRouteWithGivenMethod }) => {
    test(name, () => {
      expectTypeOf(
        createRouteWithGivenMethod<Attributes>({
          path: '/hello/:name',
          name: 'hello',
          handler: async (serverRequest) => {
            expectTypeOf(serverRequest).toEqualTypeOf<ServerRequest<Attributes>>();
            expectTypeOf(serverRequest.attributes.name).toEqualTypeOf<string>();

            return response;
          },
        }),
      ).toEqualTypeOf<Route>();
    });
  });

  test('without generic falls back to default attributes', () => {
    createGetRoute({
      path: '/hello/:name',
      name: 'hello',
      handler: async (serverRequest) => {
        expectTypeOf(serverRequest).toEqualTypeOf<ServerRequest>();

        return response;
      },
    });
  });

  test('generic rejects a handler with incompatible attributes', () => {
    expectTypeOf(incompatibleHandler).not.toExtend<Handler<Attributes>>();

    createGetRoute<Attributes>({
      path: '/hello/:name',
      name: 'hello',
      // @ts-expect-error name is a string, not a number
      handler: incompatibleHandler,
    });
  });
});
