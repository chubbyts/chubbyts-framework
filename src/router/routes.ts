import type { Route } from './route';

/** @deprecated use RoutesByName from routes-by-name */
export type Routes = () => Map<string, Route>;

/** @deprecated use createRoutesByName from routes-by-name */
export const createRoutesByName = (routes: Array<Route>): Routes => {
  const routesByName = new Map(routes.map((route) => [route.name, route]));
  return () => routesByName;
};
