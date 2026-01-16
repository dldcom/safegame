import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

const root = ReactDOM.createRoot(document.getElementById('ui-root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// We keep main.js to run Phaser side by side
import './main.js';
