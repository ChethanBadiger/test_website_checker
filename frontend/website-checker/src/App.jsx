import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Dashboard from './components/Dashboard'
import SiteCheckResults from './components/SiteCheckResults'

function App() {
  return (
    <>
    <Dashboard/>
    <SiteCheckResults/>
    </>
  );
}

export default App
