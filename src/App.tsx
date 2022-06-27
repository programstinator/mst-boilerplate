import React from 'react';
import './App.css';
import { observer } from 'mobx-react';
import { PageIds, RootType, useMst } from './internal';
import StateRouter from './utils/StateRouter';

const App = observer(() => {
  const root: RootType = useMst();
  const {
    router: { navigate, isCurrentViewHome, isCurrentViewLogin },
  } = root;
  return (
    <div className="App">
      {!isCurrentViewLogin && (
        <button onClick={() => navigate({ newView: PageIds.Login })}>
          {' '}
          go to login{' '}
        </button>
      )}
      {!isCurrentViewHome && (
        <button onClick={() => navigate({ newView: PageIds.Home })}>
          {' '}
          go to home{' '}
        </button>
      )}
      <StateRouter />
    </div>
  );
});

export default App;
