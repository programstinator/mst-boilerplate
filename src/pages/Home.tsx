import { observer } from 'mobx-react';
import { useMst } from '../internal';

export const HomePage = observer(() => {
  const {
    router: { currentView },
  } = useMst();
  return <>{currentView.id}</>;
});
