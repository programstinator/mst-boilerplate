import { IAnyModelType, Instance, types } from 'mobx-state-tree';
import { PageModel, PageType, RouterModel } from '../internal';

export const RootModel: IAnyModelType = types
  .model('Root', {
    router: RouterModel,
    pages: types.map(PageModel),
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
  });
export type RootType = Instance<typeof RootModel>;
