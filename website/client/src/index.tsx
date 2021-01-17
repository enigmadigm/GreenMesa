import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, CSSReset, ColorModeScript } from "@chakra-ui/react";
import { BrowserRouter as Router } from 'react-router-dom';
import theme from "./theme";
export const host = window.location.hostname === "localhost" ? "http://localhost:3005" : "https://stratum.hauge.rocks";

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider>
      <CSSReset />
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Router >
        <App />
      </Router>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
