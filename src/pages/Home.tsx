import { observer } from 'mobx-react';
import { useMst } from '../internal';
import Chart from '@chartiq/react-components';
export const HomePage = observer(() => {
  const {
    router: { currentView },
  } = useMst();
  return <Chart config={{ initialSymbol: 'FB' }} />;
});
