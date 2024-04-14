import React from 'react'
import ReactDOM from 'react-dom/client'
import { Loader } from '@mantine/core';
import AppRouter from './approute';
import './index.css'
// import * as dotenv from 'dotenv';

// dotenv.config(); // Load environment variables



ReactDOM.createRoot(document.getElementById('root')!).render(

  <React.StrictMode>
    <React.Suspense fallback={
      <div className='page-loading'>
        <Loader color="grape" size="xl" />;
      </div>
    }> 
        <AppRouter></AppRouter>
      
    </React.Suspense>
  </React.StrictMode>,
)
