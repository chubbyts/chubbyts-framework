import type { Route } from './route';

export type Routes = () => Map<string, Route>;

export const createRoutesByName = (routes: Array<Route>): Routes => {
  const routesByName = new Map(routes.map((route) => [route.name, route]));
  return () => routesByName;
};
