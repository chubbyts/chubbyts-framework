import type { ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { Route } from './route.js';
import type { RoutesByName } from './routes-by-name.js';

export type Match = (serverRequest: ServerRequest) => Route;

export type CreateMatch = (routesByName: RoutesByName) => Match;
