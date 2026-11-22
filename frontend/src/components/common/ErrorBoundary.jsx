import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portfolio ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0d1117',
          color: '#f0f6fc',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#f59e0b' }}>
            Something went wrong loading this view
          </h2>
          <p style={{ color: '#8b949e', maxWidth: '500px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            An unexpected error occurred while rendering. You can reload the page or reset the local cache.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.65rem 1.4rem',
              backgroundColor: '#f59e0b',
              color: '#0d1117',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

