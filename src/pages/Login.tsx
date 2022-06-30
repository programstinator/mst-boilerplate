import { observer } from 'mobx-react';
import { useMst } from '../internal';

export const LoginPage = observer(() => {
  const {
    currentPage,
    router: { currentView },
  } = useMst();
  return (
    <>
      {currentPage?.myNumber}
      <br />
      {currentPage?.squared}
      <button onClick={currentPage?.increase}> + </button>
    </>
  );
});
