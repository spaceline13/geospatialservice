import "@babel/polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

export const init = (id) => { ReactDOM.render(<App />, document.getElementById(id)); };
registerServiceWorker();
