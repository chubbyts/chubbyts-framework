import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import { RequiredProperties } from '../types';
import type { PathOptions, Route } from './route';
import { createRoute } from './route';

type GroupArgument = {
  path: string;
  children: Array<Group | Route>;
  middlewares?: Array<Middleware>;
  pathOptions?: PathOptions;
};

export type Group = RequiredProperties<GroupArgument, 'middlewares' | 'pathOptions'> & {
  _group: string;
};

export const isGroup = (group: unknown): group is Group => {
  return typeof group === 'object' && null !== group && typeof (group as Group)._group === 'string';
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
    const childPath = group.path + child.path;
    const childMiddlewares = [...group.middlewares, ...child.middlewares];
    const childPathOptions = { ...group.pathOptions, ...child.pathOptions };

    if (isGroup(child)) {
      routes.push(
        ...getRoutes(
          createGroup({
            path: childPath,
            children: child.children,
            middlewares: childMiddlewares,
            pathOptions: childPathOptions,
          }),
        ),
      );
    } else {
      routes.push(
        createRoute({
          method: child.method,
          path: childPath,
          name: child.name,
          handler: child.handler,
          middlewares: childMiddlewares,
          pathOptions: childPathOptions,
        }),
      );
    }
  });

  return routes;
};
