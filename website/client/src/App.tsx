import React from 'react';
import './App.css';
import { Switch, Route } from 'react-router-dom';
import { MenuPage, DashboardPage } from './pages';

/*function funky() {
  fetch("/api/discord")
}*/

function App() {
  return (
    <Switch>
      <Route path="/menu" exact={false} component={ MenuPage } />
      <Route path="/dash/:id" exact={ true } component={ DashboardPage } />
    </Switch>
  );
}

export default App;
