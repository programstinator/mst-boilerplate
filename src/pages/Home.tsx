import { observer } from 'mobx-react';
import { useMst } from '../internal';
import MyChart from './MyChart';
export const HomePage = observer(() => {
  const {
    router: { currentView },
  } = useMst();
  return (
    <>
      <MyChart />
    </>
  );
});
