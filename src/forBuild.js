import "@babel/polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

export const init = (id) => { ReactDOM.render(<App />, document.getElementById(id)); };
