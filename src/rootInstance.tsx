import { RootModel, PageRoutes, startRouter } from './internal';
import { createContext, useContext } from 'react';
import { Instance } from 'mobx-state-tree';

export const rootInstance = RootModel.create({
  router: {
    views: PageRoutes,
  },
});
startRouter(rootInstance.router);

type RootInstance = Instance<typeof RootModel>;
const RootStoreContext = createContext<null | RootInstance>(rootInstance);

export const Provider = RootStoreContext.Provider;
export function useMst(): RootInstance {
  const store = useContext(RootStoreContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store as RootInstance;
}

export const ProviderWrapper = ({ children }: { children: any }): any => {
  return <Provider value={rootInstance}>{children}</Provider>;
};
