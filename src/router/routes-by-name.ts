import type { Route } from './route';

export type RoutesByName = Map<string, Route>;

export const createRoutesByName = (routes: Array<Route>): RoutesByName =>
  new Map(routes.map((route) => [route.name, route]));
