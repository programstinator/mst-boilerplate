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
      <StateRouter />
    </div>
  );
});

export default App;
