import { describe, expectTypeOf, test } from 'vitest';
import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/message';
import type { Middleware } from '@chubbyts/chubbyts-http-types/middleware';
import type { CreateMatch } from '../src/router/route-matcher';
import { createApplicationBuilder } from '../src/facade';

type Attributes = { name: string };

const response = {} as Response;
const middleware = {} as Middleware;

const incompatibleHandler = async (_serverRequest: ServerRequest<{ name: number }>) => response;

const handler = async (serverRequest: ServerRequest<Attributes>) => {
  expectTypeOf(serverRequest).toEqualTypeOf<ServerRequest<Attributes>>();

  return response;
};

const inferredHandler = async (serverRequest: ServerRequest<Attributes>) => {
  expectTypeOf(serverRequest.attributes.name).toEqualTypeOf<string>();

  return response;
};

describe('facade generics', () => {
  const builder = createApplicationBuilder({
    createMatch: {} as CreateMatch,
    responseFactory: () => response,
    bodyFactory: () => ({}) as Response['body'],
  });

  test('route', () => {
    builder.route<Attributes>('GET', '/hello/:name', 'hello', async (serverRequest) => {
      expectTypeOf(serverRequest).toEqualTypeOf<ServerRequest<Attributes>>();

      return response;
    });

    builder.route<Attributes>('GET', '/hello/:name', 'hello', [middleware], async (serverRequest) => {
      expectTypeOf(serverRequest).toEqualTypeOf<ServerRequest<Attributes>>();

      return response;
    });

    builder.route('GET', '/hello/:name', 'hello', handler);
  });

  (['delete', 'get', 'head', 'options', 'patch', 'post', 'put'] as const).forEach((method) => {
    test(method, () => {
      builder[method]<Attributes>('/hello/:name', 'hello', async (serverRequest) => {
        expectTypeOf(serverRequest).toEqualTypeOf<ServerRequest<Attributes>>();

        return response;
      });

      builder[method]<Attributes>('/hello/:name', 'hello', [middleware], async (serverRequest) => {
        expectTypeOf(serverRequest).toEqualTypeOf<ServerRequest<Attributes>>();

        return response;
      });

      builder[method]('/hello/:name', 'hello', inferredHandler);
    });
  });

  test('group', () => {
    builder.group('/api', (group) =>
      group.get<Attributes>('/hello/:name', 'hello', async (serverRequest) => {
        expectTypeOf(serverRequest).toEqualTypeOf<ServerRequest<Attributes>>();

        return response;
      }),
    );
  });

  test('generic rejects a handler with incompatible attributes', () => {
    expectTypeOf(incompatibleHandler).not.toExtend<Handler<Attributes>>();

    // @ts-expect-error name is a string, not a number
    builder.get<Attributes>('/hello/:name', 'hello', incompatibleHandler);
  });
});
