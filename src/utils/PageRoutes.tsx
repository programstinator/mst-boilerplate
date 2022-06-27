import { ViewType } from '../internal';
import { LoginPage } from '../pages/Login';

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
  },
  Home: {
    name: 'Home',
    id: PageIds.Home,
    path: '/',
    component: <LoginPage />,
    isAuthenticationRequired: 'both',
  },
};
