import { IAnyModelType, Instance, types } from 'mobx-state-tree';
import { LoginModel, PageModel, PageType, RouterModel } from '../internal';

export const RootModel: IAnyModelType = types
  .model('Root', {
    router: RouterModel,
    pages: types.optional(types.map(types.union(PageModel, LoginModel)), {}),
  })
  .actions((self) => {
    return {
      afterCreate() {
        Object.defineProperty(window, 'root', {
          get() {
            return self;
          },
        });
      },
      addPage(page: PageType) {
        self.pages.put(page);
      },
    };
  })
  .views((self) => {
    return {
      get currentPage() {
        return self.pages.get(self.router.currentView.id);
      },
    };
  });
export type RootType = Instance<typeof RootModel>;
