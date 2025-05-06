import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import React from 'react'
import './index.css'
import App from './App.jsx'

const root = document.getElementById('root')

if (!root) {
  throw new Error("L'élément root n'a pas été trouvé dans le DOM")
}

const renderApp = () => {
  try {
    createRoot(root).render(
      <StrictMode>
        <Router>
          <App />
        </Router>
      </StrictMode>
    )
  } catch (error) {
    console.error('Erreur lors du rendu de l\'application:', error)
    root.innerHTML = '<div style="color: red; padding: 20px;">Une erreur est survenue lors du chargement de l\'application.</div>'
  }
}

renderApp()
