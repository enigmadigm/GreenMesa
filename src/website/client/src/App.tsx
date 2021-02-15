import React from 'react';
import './App.css';
import { Switch, Route, Redirect } from 'react-router-dom';
import { MenuPage, DashboardPage, DashboardUnauthorized } from './pages';
//import 'rsuite/dist/styles/rsuite-default.css';

/*function funky() {
  fetch("/api/discord")
}*/

function App() {
  return (
    <Switch>
      <Route path="/menu" exact={false} component={MenuPage} />
      <Route path="/dash/unauthorized" exact component={DashboardUnauthorized} />
      <Redirect from="/dash/unauthorized" to="/dash/unauthorized" />
      <Route path="/dash/:id/:page" exact={true} component={ DashboardPage } />
      <Redirect exact from="/dash/:id" to="/dash/:id/home" />
      <Redirect from="/dash" to="/menu" />
    </Switch>
  );
}

export default App;
