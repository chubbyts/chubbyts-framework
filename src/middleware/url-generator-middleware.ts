import { ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { Handler, Middleware, Response } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { GeneratePath, GenerateUrl } from '../router/url-generator.js';

export type UrlGeneratorMiddlewareOptions = {
  generatePath?: GeneratePath;
  generateUrl?: GenerateUrl;
};

/**
 * Adds the given `generatePath` and / or `generateUrl` as request attributes, so they become available within
 * following middlewares and handlers:
 * `(serverRequest.attributes.generatePath as GeneratePath)('pet_read', { id: '1' })`.
 *
 * ```ts
 * import type { Middleware } from '@chubbyts/chubbyts-undici-server/dist/server';
 * import type { GeneratePath, GenerateUrl } from '@chubbyts/chubbyts-framework/dist/router/url-generator';
 * import { createUrlGeneratorMiddleware } from '@chubbyts/chubbyts-framework/dist/middleware/url-generator-middleware';
 *
 * const generatePath: GeneratePath = ...;
 * const generateUrl: GenerateUrl = ...;
 *
 * const urlGeneratorMiddleware: Middleware = createUrlGeneratorMiddleware({ generatePath, generateUrl });
 * ```
 */
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
