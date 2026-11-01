import { ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { Handler, Middleware, Response } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { GeneratePath, GenerateUrl } from '../router/url-generator.js';

export type UrlGeneratorMiddlewareOptions = {
  generatePath?: GeneratePath;
  generateUrl?: GenerateUrl;
};

export const createUrlGeneratorMiddleware = ({
  generatePath,
  generateUrl,
}: UrlGeneratorMiddlewareOptions): Middleware => {
  return async (serverRequest: ServerRequest, handler: Handler): Promise<Response> => {
    return handler(
      new ServerRequest(serverRequest, {
        attributes: {
          ...serverRequest.attributes,
          ...(generatePath ? { generatePath } : {}),
          ...(generateUrl ? { generateUrl } : {}),
        },
      }),
    );
  };
};
