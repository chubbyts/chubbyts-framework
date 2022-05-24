import { Query, ServerRequest } from '../vendor/chubbyts-types/message';

export type GenerateUrl = (
  request: ServerRequest,
  name: string,
  attributes?: Record<string, string>,
  query?: Query,
) => string;

export type GeneratePath = (name: string, attributes?: Record<string, string>, query?: Query) => string;
