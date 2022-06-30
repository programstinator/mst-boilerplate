import { types } from 'mobx-state-tree';
import { PageModel } from '../internal';

export const LoginModel = types
  .compose(
    PageModel,
    types.model({ isLoggedIn: false, isLoginLoading: false, myNumber: 0 })
  )
  .actions((self) => {
    return {
      increase() {
        self.myNumber += 1;
      },
    };
  })
  .views((self) => {
    return {
      get squared() {
        return self.myNumber * self.myNumber;
      },
    };
  })
  .named('LoginModel');
