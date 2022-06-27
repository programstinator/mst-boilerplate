import { observer } from 'mobx-react';
import { useMst } from '../internal';

export const LoginPage = observer(() => {
  const {
    router: { currentView },
  } = useMst();
  return <>{currentView.id}</>;
});
