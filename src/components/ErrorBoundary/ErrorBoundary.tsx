import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '2rem',
  textAlign: 'center',
  fontFamily: 'sans-serif',
};

const headingStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 700,
  marginBottom: '0.75rem',
  color: '#111',
};

const messageStyle: React.CSSProperties = {
  fontSize: '1rem',
  color: '#555',
  marginBottom: '1.5rem',
  maxWidth: '400px',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.6rem 1.4rem',
  fontSize: '1rem',
  fontWeight: 600,
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={containerStyle} role="alert">
          <h1 style={headingStyle}>Something went wrong</h1>
          <p style={messageStyle}>
            An unexpected error occurred. Please refresh the page to continue.
          </p>
          <button
            style={buttonStyle}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
