import { detach, getRoot, Instance, types } from 'mobx-state-tree';
import { ComponentModelType, RootType } from '../internal';
import { observable, toJS } from 'mobx';

const comps: any[] = [];

export const PageModel = types
  .model('PageModel', {
    id: types.identifier,
    components: types.optional(types.map(types.union(...comps)), {}),
  })
  .volatile(() => {
    return {
      data: observable({}) as any,
    };
  })
  .views((self) => {
    return {
      get componentsArray() {
        return Array.from(self.components.values());
      },
      get hasData(): boolean {
        return !!Object.keys(toJS(self.data)).length;
      },
      get root(): RootType {
        return getRoot(self);
      },
    };
  })
  .actions((self) => {
    return {
      clearData() {
        self.componentsArray.forEach((component) => {
          detach(component);
        });
        self.components.clear();
      },
      addComponent(component: ComponentModelType) {
        self.components.put(component);
        return self.components.get(component.id);
      },
      removeComponent(id: string) {
        self.components.delete(id);
      },
      clearValidators() {
        self.componentsArray.forEach((component) => {
          component.setCurrentMessage('');
        });
      },
      runValidators(): boolean {
        let result = true;
        self.componentsArray.forEach((component) => {
          component.runValidators();
          if (result && component.currentMessage) {
            result = false;
          }
        });
        return result;
      },
    };
  });
export type PageType = Instance<typeof PageModel>;
