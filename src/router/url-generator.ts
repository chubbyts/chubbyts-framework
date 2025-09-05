import type { ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';

export type GenerateUrl = (
  serverRequest: ServerRequest,
  name: string,
  attributes?: Record<string, string>,
  query?: string,
) => string;

export type GeneratePath = (name: string, attributes?: Record<string, string>, query?: string) => string;
