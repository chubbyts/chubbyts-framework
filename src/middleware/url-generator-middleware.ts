import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Attributes, Response, ServerRequest } from '@chubbyts/chubbyts-http-types/message';
import type { Middleware } from '@chubbyts/chubbyts-http-types/middleware';
import type { GeneratePath, GenerateUrl } from '../router/url-generator.js';

export type UrlGeneratorMiddlewareOptions = {
  generatePath?: GeneratePath;
  generateUrl?: GenerateUrl;
};

export type UrlGeneratorAttributes = Attributes & UrlGeneratorMiddlewareOptions;

export const createUrlGeneratorMiddleware = ({
  generatePath,
  generateUrl,
}: UrlGeneratorMiddlewareOptions): Middleware<Attributes, UrlGeneratorAttributes> => {
  return async (serverRequest: ServerRequest, handler: Handler<UrlGeneratorAttributes>): Promise<Response> => {
    return handler({
      ...serverRequest,
      attributes: {
        ...serverRequest.attributes,
        ...(generatePath ? { generatePath } : {}),
        ...(generateUrl ? { generateUrl } : {}),
      },
    });
  };
};
