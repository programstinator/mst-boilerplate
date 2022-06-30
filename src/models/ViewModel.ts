import { types, flow, getRoot, Instance } from 'mobx-state-tree';
import { RootType, RouterType, PageRoutes, PageModel } from '../internal';

export interface IQueryParams {
  [key: string]: any;
}

export const ViewModel = types
  .model('View', {
    component: types.frozen(),
    id: types.identifier,
    path: '',
    name: '',
    isAuthenticationRequired: types.optional(
      types.union(types.string, types.boolean),
      true
    ),
    hooks: types.optional(types.frozen(), {}),
    queryParams: types.maybe(types.map(types.frozen({}))),
    sidenavName: '',
  })
  .views((self) => ({
    get root() {
      return getRoot(self);
    },
    get router(): RouterType {
      return (getRoot(self) as RootType).router;
    },
    get queryParamsArray() {
      if (self.queryParams) {
        return Array.from(self.queryParams.values());
      } else {
        return [];
      }
    },
  }))
  .actions((self) => ({
    afterCreate() {
      const root: RootType = getRoot(self);

      if (PageRoutes[self.id]) {
        const page = PageRoutes[self.id].extension
          ? PageRoutes[self.id].extension.create({ id: self.id })
          : PageModel.create({ id: self.id });
        root.addPage(page);
      }
    },
    formatUrl: (params: any, queryParams: IQueryParams = {}) => {
      if (!params && !queryParams) return self.path;

      let url = self.path;

      for (const k in params) {
        url = url.replace(`:${k}`, params[k]);
      }
      Object.keys(queryParams).forEach((q, index) => {
        url += `${index ? '&' : '?'}${q}=${queryParams[q]}`;
      });
      return url;
    },
    beforeEnter: flow(function* (
      params,
      queryParams
    ): Generator<any, any, any> {
      if (self.hooks.beforeEnter) {
        try {
          yield Promise.resolve(
            self.hooks.beforeEnter(self, params, queryParams)
          );
        } catch (e) {
          if (process.env.JEST_WORKER_ID === undefined) {
            console.error(e);
          }
          throw e;
        }
      }
    }),
    onEnter: flow(function* (params, queryParams): Generator<any, any, any> {
      if (self.hooks.onEnter) {
        try {
          yield Promise.resolve(self.hooks.onEnter(self, params, queryParams));
        } catch (e) {
          if (process.env.JEST_WORKER_ID === undefined) {
            console.error(e);
          }
          throw e;
        }
      }
    }),
    beforeExit: flow(function* (params, queryParams): Generator<any, any, any> {
      if (self.hooks.beforeExit) {
        try {
          yield Promise.resolve(
            self.hooks.beforeExit(self, params, queryParams)
          );
        } catch (e) {
          if (process.env.JEST_WORKER_ID === undefined) {
            console.error(e);
          }
          throw e;
        }
      }
    }),
    onExit: flow(function* (params, queryParams): Generator<any, any, any> {
      if (self.hooks.onExit) {
        try {
          yield Promise.resolve(self.hooks.onExit(self, params, queryParams));
        } catch (e) {
          if (process.env.JEST_WORKER_ID === undefined) {
            console.error(e);
          }
          throw e;
        }
      }
    }),
  }));
export type ViewType = Instance<typeof ViewModel>;
