import { describe, expect, test } from 'vitest';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/message';
import {
  createResponseFactory,
  createServerRequestFactory,
  createStreamFactory,
} from '@chubbyts/chubbyts-http/message-factory';
import type { GeneratePath, GenerateUrl } from '../../src/router/url-generator';
import { createUrlGeneratorMiddleware } from '../../src/middleware/url-generator-middleware';

const bodyFactory = createStreamFactory();
const responseFactory = createResponseFactory(bodyFactory);
const serverRequestFactory = createServerRequestFactory();

const generatePath: GeneratePath = () => '/path';
const generateUrl: GenerateUrl = () => 'https://example.com/path';

describe('url-generator-middleware', () => {
  describe('createUrlGeneratorMiddleware', () => {
    test('with generatePath and generateUrl', async () => {
      const request = { ...serverRequestFactory('GET', 'https://example.com'), attributes: { key: 'value' } };
      const response = responseFactory(200);

      const [handler, handlerMocks] = useFunctionMock<Handler>([
        {
          callback: async (givenRequest: ServerRequest): Promise<Response> => {
            expect(givenRequest.attributes).toEqual({ key: 'value', generatePath, generateUrl });

            return response;
          },
        },
      ]);

      const urlGeneratorMiddleware = createUrlGeneratorMiddleware({ generatePath, generateUrl });

      expect(await urlGeneratorMiddleware(request, handler)).toBe(response);

      expect(handlerMocks).toHaveLength(0);
    });

    test('with generatePath only', async () => {
      const request = serverRequestFactory('GET', 'https://example.com');
      const response = responseFactory(200);

      const [handler, handlerMocks] = useFunctionMock<Handler>([
        {
          callback: async (givenRequest: ServerRequest): Promise<Response> => {
            expect(givenRequest.attributes).toEqual({ generatePath });

            return response;
          },
        },
      ]);

      const urlGeneratorMiddleware = createUrlGeneratorMiddleware({ generatePath });

      expect(await urlGeneratorMiddleware(request, handler)).toBe(response);

      expect(handlerMocks).toHaveLength(0);
    });

    test('with generateUrl only', async () => {
      const request = serverRequestFactory('GET', 'https://example.com');
      const response = responseFactory(200);

      const [handler, handlerMocks] = useFunctionMock<Handler>([
        {
          callback: async (givenRequest: ServerRequest): Promise<Response> => {
            expect(givenRequest.attributes).toEqual({ generateUrl });

            return response;
          },
        },
      ]);

      const urlGeneratorMiddleware = createUrlGeneratorMiddleware({ generateUrl });

      expect(await urlGeneratorMiddleware(request, handler)).toBe(response);

      expect(handlerMocks).toHaveLength(0);
    });

    test('without generators', async () => {
      const request = serverRequestFactory('GET', 'https://example.com');
      const response = responseFactory(200);

      const [handler, handlerMocks] = useFunctionMock<Handler>([
        {
          callback: async (givenRequest: ServerRequest): Promise<Response> => {
            expect(givenRequest.attributes).toEqual({});

            return response;
          },
        },
      ]);

      const urlGeneratorMiddleware = createUrlGeneratorMiddleware({});

      expect(await urlGeneratorMiddleware(request, handler)).toBe(response);

      expect(handlerMocks).toHaveLength(0);
    });
  });
});
