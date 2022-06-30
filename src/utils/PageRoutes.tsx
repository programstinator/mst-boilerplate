import { ViewType, LoginModel } from '../internal';
import { LoginPage } from '../pages/Login';
import { HomePage } from '../pages/Home';

type HookType = (
  view: ViewType,
  params: any,
  queryParams: Queries
) => Promise<boolean | void>;

interface IHooksInterface {
  beforeEnter?: HookType;
  onEnter?: HookType;
  beforeExit?: HookType;
  onExit?: HookType;
  queryParams?: Queries;
}

export type Query = {
  name: string;
  required: boolean;
};

export type Queries = {
  [key: string]: Query | boolean | string;
};

interface IPageRoute {
  component: React.ComponentElement<any, any>;
  name: string;
  path: string;
  isAuthenticationRequired: true | false | 'both';
  hooks?: IHooksInterface;
  id: string;
  queryParams?: Queries;
  functionality?: string;
  extension?: any;
  sidenavName?: string;
}

interface IPageRoutes {
  [key: string]: IPageRoute;
}

export enum PageIds {
  NotFound = 'NotFound',
  Login = 'Login',
  Home = 'Home',
}
export const PageRoutes: IPageRoutes = {
  Login: {
    name: 'Login',
    id: PageIds.Login,
    path: '/login',
    component: <LoginPage />,
    isAuthenticationRequired: 'both',
    extension: LoginModel,
  },
  Home: {
    name: 'Home',
    id: PageIds.Home,
    path: '/',
    component: <HomePage />,
    isAuthenticationRequired: 'both',
  },
};
