import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter as Router } from 'react-router-dom'
import { UserProvider } from './context/UserContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <Router>
        <App />
      </Router>
    </UserProvider>
  </StrictMode>,
)
