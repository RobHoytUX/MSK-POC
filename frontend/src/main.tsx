import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App.tsx'
import '../globals.css'

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { message: string | null }
> {
  state: { message: string | null } = { message: null }

  static getDerivedStateFromError(err: Error) {
    return { message: err?.message ?? String(err) }
  }

  componentDidCatch(err: Error) {
    console.error('[msp-root]', err)
  }

  render() {
    if (this.state.message) {
      return (
        <div
          style={{
            boxSizing: 'border-box',
            minHeight: '100vh',
            padding: 24,
            fontFamily: 'system-ui,sans-serif',
            background: '#fef2f2',
            color: '#991b1b',
          }}
        >
          <h1 style={{ fontSize: 18, margin: '0 0 12px' }}>Something went wrong</h1>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, margin: 0 }}>
            {this.state.message}
          </pre>
          <p style={{ fontSize: 13, marginTop: 16, opacity: 0.9 }}>
            Open the browser DevTools Console for details.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  document.body.innerHTML =
    '<p style="font-family:system-ui;padding:16px;color:#991b1b">Missing div#root in index.html.</p>'
} else {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </React.StrictMode>,
  )
}
