import type { Route } from './route';

export type Routes = () => Map<string, Route>;

/** @deprecated use createRoutesByName from routes-by-name */
export const createRoutesByName = (routes: Array<Route>): Routes => {
  const routesByName = new Map(routes.map((route) => [route.name, route]));
  return () => routesByName;
};
