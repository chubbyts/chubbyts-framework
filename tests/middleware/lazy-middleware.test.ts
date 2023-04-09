import { expect, test } from '@jest/globals';
import type { ServerRequest, Response } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import type { FunctionMocks } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { createFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import type { ObjectMocks } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import { createObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import { createLazyMiddleware } from '../../src/middleware/lazy-middleware';

test('createLazyMiddleware', async () => {
  const request = {} as ServerRequest;
  const response = {} as Response;

  const handler = createFunctionMock<Handler>([]);

  const middlewareMocks: FunctionMocks<Middleware> = [
    { parameters: [request, handler], return: Promise.resolve(response) },
  ];

  const middleware = createFunctionMock(middlewareMocks);

  const containerMocks: ObjectMocks<Container> = [{ name: 'get', parameters: ['id'], return: middleware }];

  const container = createObjectMock(containerMocks);

  const lazyMiddleware = createLazyMiddleware(container, 'id');

  expect(await lazyMiddleware(request, handler)).toBe(response);

  expect(middlewareMocks.length).toBe(0);
  expect(containerMocks.length).toBe(0);
});
