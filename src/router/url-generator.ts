import type { ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { RoutesByName } from './routes-by-name.js';

export type GeneratePath = (name: string, attributes?: Record<string, string>, query?: string) => string;

export type CreateGeneratePath = (routesByName: RoutesByName) => GeneratePath;

export type GenerateUrl = (
  serverRequest: ServerRequest,
  name: string,
  attributes?: Record<string, string>,
  query?: string,
) => string;

export type CreateGenerateUrl = (routesByName: RoutesByName) => GenerateUrl;
