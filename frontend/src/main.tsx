import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './approute';
import './index.css'
// import * as dotenv from 'dotenv';

// dotenv.config(); // Load environment variables


ReactDOM.createRoot(document.getElementById('root')!).render(

  <React.StrictMode>

        <AppRouter></AppRouter>

  </React.StrictMode>,
)
