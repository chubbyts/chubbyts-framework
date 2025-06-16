import type { ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Route } from './route.js';

export type Match = (request: ServerRequest) => Route;
