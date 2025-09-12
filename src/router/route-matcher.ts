import type { ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { Route } from './route.js';

export type Match = (serverRequest: ServerRequest) => Route;
