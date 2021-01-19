import React from 'react';
import './App.css';
import { Switch, Route, Redirect } from 'react-router-dom';
import { MenuPage, DashboardPage } from './pages';
//import 'rsuite/dist/styles/rsuite-default.css';

/*function funky() {
  fetch("/api/discord")
}*/

function App() {
  return (
    <Switch>
      <Route path="/menu" exact={false} component={ MenuPage } />
      <Redirect exact from="/dash" to="/menu" />
      <Redirect exact from="/dash/:id" to="/dash/:id/home" />
      <Route path="/dash/:id/:page" exact={true} component={ DashboardPage } />
    </Switch>
  );
}

export default App;
