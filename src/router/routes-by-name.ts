import type { Route } from './route';

/**
 * ```ts
 * import type { Route } from '@chubbyts/chubbyts-framework/dist/router/route';
 * import type { RoutesByName } from '@chubbyts/chubbyts-framework/dist/router/routes-by-name';
 *
 * const route: Route = ...;
 *
 * const routesByName: RoutesByName = new Map([
 *   ['routeName', route],
 * ])
 * ```
 */
export type RoutesByName = Map<string, Route>;

/**
 * ```ts
 * import type { Route } from '@chubbyts/chubbyts-framework/dist/router/route';
 * import type { RoutesByName } from '@chubbyts/chubbyts-framework/dist/router/routes-by-name';
 * import { createRoutesByName } from '@chubbyts/chubbyts-framework/dist/router/routes-by-name';
 *
 * const routes: Array<Route> = [];
 *
 * const routesByName: RoutesByName = createRoutesByName(routes);
 * ```
 */
export const createRoutesByName = (routes: Array<Route>): RoutesByName =>
  new Map(routes.map((route) => [route.name, route]));
