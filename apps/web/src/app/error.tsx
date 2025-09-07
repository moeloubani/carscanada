'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Something went wrong!</h1>
      <p style={{ marginBottom: '30px', color: '#6b7280' }}>
        An unexpected error occurred. Please try again later.
      </p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
        <a href="/" style={{ 
          display: 'inline-block',
          padding: '10px 20px', 
          backgroundColor: '#e5e7eb', 
          color: '#374151', 
          textDecoration: 'none',
          borderRadius: '4px'
        }}>
          Go Home
        </a>
      </div>
    </div>
  );
}