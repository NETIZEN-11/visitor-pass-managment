import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './utils/axiosConfig'; // Set axios baseURL for production
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
