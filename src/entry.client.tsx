import 'polyfills'
// import { createRoot } from 'react-dom/client'
// import App from './App'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'
// import "./index.css";

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HydratedRouter />
  </React.StrictMode>
)

// const root = createRoot(document.getElementById('root')!)

// root.render(<App />)
