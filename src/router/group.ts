import type { Middleware } from '../vendor/chubbyts-types/middleware';
import type { PathOptions, Route } from './route';
import { createRoute } from './route';

export type Group = {
  path: string;
  children: Array<Group | Route>;
  middlewares: Array<Middleware>;
  pathOptions: PathOptions;
  _group: string;
};

export const isGroup = (group: unknown): group is Group => {
  return typeof group === 'object' && null !== group && typeof (group as Group)._group === 'string';
};

type GroupArgument = {
  path: string;
  children: Array<Group | Route>;
  middlewares?: Array<Middleware>;
  pathOptions?: PathOptions;
};

export const createGroup = ({ path, children, middlewares, pathOptions }: GroupArgument): Group => {
  return {
    path,
    children,
    middlewares: middlewares ?? [],
    pathOptions: pathOptions ?? {},
    _group: 'Group',
  };
};

export const getRoutes = (group: Group): Array<Route> => {
  const routes: Array<Route> = [];
  group.children.forEach((child) => {
    if (isGroup(child)) {
      routes.push(
        ...getRoutes(
          createGroup({
            path: group.path + child.path,
            children: child.children,
            middlewares: [...group.middlewares, ...child.middlewares],
            pathOptions: { ...group.pathOptions, ...child.pathOptions },
          }),
        ),
      );
    } else {
      routes.push(
        createRoute({
          method: child.method,
          path: group.path + child.path,
          name: child.name,
          handler: child.handler,
          middlewares: [...group.middlewares, ...child.middlewares],
          pathOptions: { ...group.pathOptions, ...child.pathOptions },
        }),
      );
    }
  });

  return routes;
};
