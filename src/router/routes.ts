import type { Route } from './route';

export type Routes = () => Record<string, Route>;

export const createRoutesByName = (routes: Array<Route>): Routes => {
  const routesByName = Object.fromEntries(routes.map((route) => [route.name, route]));
  return () => routesByName;
};
