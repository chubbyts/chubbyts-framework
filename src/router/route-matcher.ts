import type { ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Route } from './route';

export type Match = (request: ServerRequest) => Route;
