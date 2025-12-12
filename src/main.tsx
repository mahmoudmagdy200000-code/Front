import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

console.log('Starting app render...');
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<div className="p-10 text-center">Loading Translations...</div>}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
)
