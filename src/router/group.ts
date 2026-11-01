import type { Middleware } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { RequiredProperties } from '../types.js';
import type { PathOptions, Route } from './route.js';
import { createRoute } from './route.js';

export type GroupArgument = {
  path: string;
  children: Array<Group | Route>;
  middlewares?: Array<Middleware>;
  pathOptions?: PathOptions;
};

export type Group = RequiredProperties<GroupArgument, 'middlewares' | 'pathOptions'> & {
  _group: string;
};

export const isGroup = (group: unknown): group is Group => {
  return typeof group === 'object' && null !== group && '_group' in group;
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
  return group.children.flatMap((child): Array<Route> => {
    const childPath = group.path + child.path;
    const childMiddlewares = [...group.middlewares, ...child.middlewares];
    const childPathOptions = { ...group.pathOptions, ...child.pathOptions };

    if (isGroup(child)) {
      return getRoutes(
        createGroup({
          path: childPath,
          children: child.children,
          middlewares: childMiddlewares,
          pathOptions: childPathOptions,
        }),
      );
    }

    return [
      createRoute({
        method: child.method,
        path: childPath,
        name: child.name,
        handler: child.handler,
        middlewares: childMiddlewares,
        pathOptions: childPathOptions,
      }),
    ];
  });
};
