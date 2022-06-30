import React, { Fragment } from 'react';
import { observer } from 'mobx-react';
import { useMst } from '../internal';

export const StateRouter = observer(() => {
  const { router } = useMst();

  return (
    <Fragment>
      {router.isLoading && <>loading...</>}
      {router.currentView && router.currentView.component
        ? React.cloneElement(router.currentView.component)
        : 'currentView not loaded yet or component is missing'}
    </Fragment>
  );
});

export default StateRouter;
