import React from 'react';
import './App.css';
import { Switch, Route, Redirect } from 'react-router-dom';
import { MenuPage, DashboardPage, DashboardUnauthorized, Embark, ErrorPage, Appeal } from './pages';

function App() {
  return (
    <Switch>
      <Route exact={false} path="/menu" component={ MenuPage } />

      <Route exact path="/error" component={ ErrorPage } />
      <Redirect from="/error" to="/error" />

      <Route exact path="/embark" component={ Embark } />
      <Redirect from="/embark" to="/embark" />

      <Route exact path="/appeal/:id" component={ Appeal }  />
      <Redirect from="/appeal" to="/error?err=appealnoguild" />

      <Route exact path="/dash/unauthorized" component={ DashboardUnauthorized } />
      <Redirect from="/dash/unauthorized" to="/dash/unauthorized" />
      <Route exact path="/dash/:id/:page" component={ DashboardPage } />
      <Redirect exact from="/dash/:id" to="/dash/:id/home" />
      <Redirect from="/dash" to="/menu" />
    </Switch>
  );
}

export default App;
