import {
  applySnapshot,
  flow,
  getRoot,
  getSnapshot,
  IAnyModelType,
  Instance,
  SnapshotIn,
  types,
} from 'mobx-state-tree';
import { keys, reaction } from 'mobx';
import { createBrowserHistory } from 'history';
import {
  ViewModel,
  IQueryParams,
  RootType,
  ViewType,
  PageRoutes,
  Query,
  PageIds,
} from '../internal';
import { route } from '../utils/PathMatch';

type RouteDictionary = {
  [key: string]: (params: any) => Promise<any>;
};
type RouteFuncType = (params: any) => Promise<any>;

export type CustomNavigationType = {
  newView: ViewType | string;
  params?: IQueryParams;
  queryParams?: IQueryParams;
  shouldReplace?: boolean;
};

export const RouterModel: IAnyModelType = types
  .model('RouterModel', {
    views: types.optional(types.map(ViewModel), PageRoutes),
    currentView: types.maybe(types.reference(ViewModel)),
    nextView: types.maybeNull(types.reference(ViewModel)),
    params: types.frozen(),
    queryParams: types.frozen(),
    props: types.frozen(),
    history: types.frozen(),
    shouldReplace: false,
    oldView: types.maybe(types.reference(ViewModel)),
    goingBack: false,
    historyLog: types.optional(types.array(types.string), []),
  })
  .views((self) => {
    return {
      get root(): RootType {
        return getRoot(self);
      },
      get viewsArray(): ViewType[] {
        return Array.from(self.views.values());
      },
      get isLoading(): boolean {
        return !!self.nextView;
      },
      get isCurrentViewHome(): boolean {
        return self.currentView?.id === PageIds.Home;
      },
      get isCurrentViewLogin(): boolean {
        return self.currentView?.id === PageIds.Login;
      },
    };
  })
  .actions((self) => {
    return {
      setHistory(history: any) {
        self.history = history;
      },
      rollback(selfSnapshot: SnapshotIn<typeof ViewModel>) {
        if (self.currentView) {
          applySnapshot(self, { ...selfSnapshot, historyLog: self.historyLog });
          this.setNextView(null);
        }
      },
      redirectToLogin() {
        return this.navigate({
          newView: PageRoutes.Login.id,
          shouldReplace: true,
        });
      },
      redirectToHome() {
        return this.navigate({
          newView: PageRoutes.Home.id,
          shouldReplace: true,
        });
      },
      redirectToLinkExpired() {
        return this.navigate({
          newView: PageRoutes.LinkExpired.id,
          shouldReplace: true,
        });
      },
      inferView(newView: string | ViewType): ViewType {
        const root: RootType = getRoot(self);
        if (typeof newView === 'string') {
          return root.router.views.get(newView);
        } else {
          return newView;
        }
      },
      setView(view: ViewType) {
        self.currentView = view;
        self.nextView = null;
      },
      setGoingBack(goingBack: boolean) {
        self.goingBack = goingBack;
      },
      setNextView(view: ViewType | null) {
        self.nextView = view;
      },
      navigate: flow(
        function* inner(this: RouterType, navigation: CustomNavigationType) {
          const { newView, shouldReplace, queryParams, params } = navigation;
          if (!newView) {
            return;
          }
          if (shouldReplace) {
            self.history.replace(this.currentUrl, {});
          }
          const view = this.inferView(newView);
          let isAuth: boolean;
          try {
            isAuth = yield this.asyncCheckAuthentication();
          } catch (e) {
            isAuth = false;
          }
          self.nextView = view;

          // save a snapshot to roll back to if something goes wrong
          const selfSnapshot = getSnapshot(self);

          // before exit old view
          self.oldView = self.currentView;
          const oldParams = self.params;

          if (self.currentView && self.currentView.beforeExit) {
            try {
              self.historyLog.push(`before beforeExit: ${self.currentView.id}`);
              yield self.currentView?.beforeExit(oldParams, queryParams);
              self.historyLog.push(`after beforeExit: ${self.currentView.id}`);
            } catch (e: any) {
              self.nextView = null;
              throw e;
            }
          }

          if (
            !view.queryParamsArray
              .filter((q: Query) => q.required)
              .every((q: Query) => {
                // eslint-disable-next-line no-prototype-builtins
                return queryParams?.hasOwnProperty(q.name);
              })
          ) {
            return this.rollback(selfSnapshot, isAuth);
          }
          // update current url
          self.queryParams = queryParams || {};
          self.params = params || {};
          if (view.isAuthenticationRequired !== 'both') {
            if (view.isAuthenticationRequired) {
              if (isAuth) {
                try {
                  self.historyLog.push(`before beforeEnter: ${view.id}`);
                  yield view.beforeEnter(params, self.queryParams);
                  self.historyLog.push(`after beforeEnter: ${view.id}`);
                } catch (e: any) {
                  this.rollback(selfSnapshot, isAuth);
                  throw e;
                }
              } else {
                localStorage.setItem(
                  'attemptedUrl',
                  this.formatUrl(view.path, params, queryParams)
                );
                return this.redirectToLogin();
              }
            } else {
              if (!isAuth) {
                try {
                  self.historyLog.push(`before beforeEnter: ${view.id}`);
                  yield view.beforeEnter(params, self.queryParams);
                  self.historyLog.push(`after beforeEnter: ${view.id}`);
                } catch (e) {
                  this.rollback(selfSnapshot, isAuth);
                  throw e;
                }
              } else {
                return this.redirectToHome();
              }
            }
          } else {
            try {
              self.historyLog.push(`before beforeEnter: ${view.id}`);
              yield view.beforeEnter(params, self.queryParams);
              self.historyLog.push(`after beforeEnter: ${view.id}`);
            } catch (e) {
              this.rollback(selfSnapshot, isAuth);
              throw e;
            }
          }

          // free up page to render
          self.props = self.props || {};

          this.setView(view);
          self.historyLog.push(`rendering: ${view.id}`);

          // on exit old view
          if (self.oldView && self.oldView.onExit && self.oldView !== view) {
            self.historyLog.push(`before onExit: ${self.oldView.id}`);
            yield self.oldView?.onExit(oldParams, self.queryParams);
            self.historyLog.push(`after onExit: ${self.oldView.id}`);
          }
          // on enter new view
          if (view.onEnter) {
            self.historyLog.push(`before onEnter: ${view.id}`);
            yield view.onEnter(self.params, self.queryParams);
            self.historyLog.push(`after onEnter: ${view.id}`);
          }
          // reset scroll on exit
          if (process.env.JEST_WORKER_ID === undefined) {
            window?.scrollTo(0, 0);
          }
        }.bind(self)
      ),
    };
  })
  .views((self) => ({
    get currentUrl() {
      return self.currentView
        ? self.currentView.formatUrl(self.params, self.queryParams)
        : '';
    },
    get routes() {
      const routes: {
        [key: string]: RouteFuncType;
      } = {};
      const keyList = keys(self.views);
      keyList.forEach((k) => {
        const view = self.views.get(k.toString());
        if (view?.path) {
          routes[view.path] = (params: any) => {
            const urlSearchParams = new URLSearchParams(
              window?.location.search
            );
            const queryParams = Object.fromEntries(urlSearchParams.entries());
            return self.navigate({ newView: view, params, queryParams });
          };
        }
      });
      return routes;
    },
  }))
  .actions((self) => {
    return {
      setShouldReplace(shouldReplace: boolean) {
        self.shouldReplace = shouldReplace;
      },
      addView(view: ViewType) {
        self.views.put(view);
      },
      asyncCheckAuthentication: flow(function* (): Generator<any, any, any> {
        return yield Promise.resolve(true); // implement async check for auth status
      }),
      clearLog() {
        self.historyLog.replace([]);
      },
      findView(path: string): ViewType | undefined {
        return self.viewsArray.find((view: ViewType) => {
          return view.path === path;
        });
      },
      formatUrl: (
        path: string,
        params: any,
        queryParams: IQueryParams = {}
      ) => {
        if (!params && !queryParams) return path;

        let url = path;

        for (const k in params) {
          url = url.replace(`:${k}`, params[k]);
        }
        const length = Object.keys(queryParams).length;
        Object.keys(queryParams).forEach((q, index) => {
          url += `${!index ? '?' : ''}${
            index > 0 && index < length ? '&' : ''
          }${q}=${queryParams[q]}`;
          // url = url.replace(`:${q}`, queryParams[q]);
        });

        return url;
      },
    };
  });

const createRouter = (routes: RouteDictionary, routerStore: RouterType) => {
  const matchers = Object.keys(routes).map((path: string) => {
    return [route()(path), routes[path]];
  });
  return (path: string) => {
    const res = matchers.some(([matcher, f]) => {
      const result = matcher(path.split('?')[0]);
      if (result === false) return false;
      return f(result);
    });
    if (!res) {
      routerStore.setView(PageRoutes.NotFound.id);
      routerStore.history.replace(PageRoutes.NotFound.path, {});
      routerStore.history.replace({
        pathName: routerStore.currentUrl,
      });
    }
  };
};

export const startRouter = (routerStore: RouterType): void => {
  const routes = createRouter(routerStore.routes, routerStore);
  routerStore.setHistory(createBrowserHistory());

  // call router.navigate when url has been changed by back button
  routerStore.history.listen(
    ({
      location,
      action,
    }: {
      location: { pathname: string; search: string };
      action: string;
    }) => {
      switch (action) {
        case 'POP':
          {
            routerStore.setGoingBack(true);
            routes(`${location.pathname}${location.search}`);
          }
          break;
        default:
          break;
      }
    }
  );

  reaction(
    () => routerStore.nextView,
    (nextView) => {
      const newUrl = routerStore.formatUrl(
        routerStore.currentUrl,
        routerStore.params,
        routerStore.queryParams
      );
      if (
        nextView === null &&
        (newUrl !== `${window?.location.pathname}${window?.location.search}` ||
          routerStore.oldView?.id !== routerStore.currentView?.id)
      ) {
        if (!routerStore.goingBack) {
          routerStore.history.push(routerStore.currentUrl, {});
        } else {
          routerStore.setGoingBack(false);
        }
        if (
          !Object.keys(routerStore.queryParams).length &&
          !Object.keys(routerStore.params).length
        ) {
          routerStore.history.replace({
            pathName: routerStore.currentUrl,
          });
        }
      }
      routerStore.length = Math.max(window?.history.length, routerStore.length);
    }
  );
  reaction(
    () => routerStore.currentView,
    (currentView) => {
      document.title = currentView?.name;
    }
  );

  // route to current url
  routes(routerStore.history.location.pathname);
};

export type RouterType = Instance<typeof RouterModel>;
