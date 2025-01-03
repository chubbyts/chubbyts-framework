import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import type { RequiredProperties } from '../types';
import type { PathOptions, Route } from './route';
import { createRoute } from './route';

export type GroupArgument = {
  path: string;
  children: Array<Group | Route>;
  middlewares?: Array<Middleware>;
  pathOptions?: PathOptions;
};

/**
 * ```ts
 * import type { Group } from '@chubbyts/chubbyts-framework/dist/router/group';
 *
 * const group: Group = {
 *   path: '/api/users',
 *   children: [listRoute, createRoute, readRoute, updateRoute, deleteRoute],
 *   middlewares: [],
 *   pathOptions: {},
 *   _group: 'Group',
 * }
 * ```
 */
export type Group = RequiredProperties<GroupArgument, 'middlewares' | 'pathOptions'> & {
  _group: string;
};

/**
 * ```ts
 * import type { Group } from '@chubbyts/chubbyts-framework/dist/router/group';
 * import type { Route } from '@chubbyts/chubbyts-framework/dist/router/route';
 *
 * const group: Group = { ...,  _group: 'Group' };
 * const route: Route = { ...,  _route: 'Route' };
 *
 * isGroup(group) // true
 * isGroup(route) // false
 * ```
 */
export const isGroup = (group: unknown): group is Group => {
  return typeof group === 'object' && null !== group && '_group' in group;
};

/**
 * ```ts
 * import type { Group } from '@chubbyts/chubbyts-framework/dist/router/group';
 * import { createGroup } from '@chubbyts/chubbyts-framework/dist/router/group';
 * import type { Route } from '@chubbyts/chubbyts-framework/dist/router/route';
 *
 * const listRoute: Route = ...;
 * const createRoute: Route = ...;
 * const readRoute: Route = ...;
 * const updateRoute: Route = ...;
 * const deleteRoute: Route = ...;
 *
 * const group: Group = createGroup({
 *   path: '/api/users',
 *   children: [listRoute, createRoute, readRoute, updateRoute, deleteRoute],
 * });
 * ```
 */
export const createGroup = ({ path, children, middlewares, pathOptions }: GroupArgument): Group => {
  return {
    path,
    children,
    middlewares: middlewares ?? [],
    pathOptions: pathOptions ?? {},
    _group: 'Group',
  };
};

/**
 * ```ts
 * import type { Group } from '@chubbyts/chubbyts-framework/dist/router/group';
 * import { createGroup, getRoutes } from '@chubbyts/chubbyts-framework/dist/router/group';
 * import type { Route } from '@chubbyts/chubbyts-framework/dist/router/route';
 *
 * const group: Group = createGroup({ ... });
 *
 * const routes: Array<Route> = getRoutes(group);
 * ```
 */
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
