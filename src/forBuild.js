import "@babel/polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

export const init = (id) => { ReactDOM.render(<App showHeader={true}/>, document.getElementById(id)); };
export const initWithoutHeaders = (id) => { ReactDOM.render(<App showHeader={false}/>, document.getElementById(id)); };
