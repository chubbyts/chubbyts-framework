import { expect, test } from '@jest/globals';
import type { ServerRequest, Response } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { FunctionMocks } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import type { ObjectMocks } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import { createObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import { createFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { createLazyHandler } from '../../src/handler/lazy-handler';

test('createLazyHandler', async () => {
  const request = {} as ServerRequest;
  const response = {} as Response;

  const handlerMocks: FunctionMocks<Handler> = [{ parameters: [request], return: Promise.resolve(response) }];

  const handler = createFunctionMock(handlerMocks);

  const containerMocks: ObjectMocks<Container> = [{ name: 'get', parameters: ['id'], return: handler }];

  const container = createObjectMock(containerMocks);

  const lazyHandler = createLazyHandler(container, 'id');

  expect(await lazyHandler(request)).toBe(response);

  expect(handlerMocks.length).toBe(0);
  expect(containerMocks.length).toBe(0);
});
