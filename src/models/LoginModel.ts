import { types } from 'mobx-state-tree';
import { PageModel } from '../internal';

export const LoginModel = types
  .compose(PageModel, types.model({ isLoggedIn: false, isLoginLoading: false }))
  .named('LoginModel');
