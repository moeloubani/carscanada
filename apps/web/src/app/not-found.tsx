export default function NotFound() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ fontSize: '72px', fontWeight: 'bold', color: '#e5e7eb' }}>404</h1>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Page Not Found</h2>
      <p style={{ marginBottom: '30px', color: '#6b7280' }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <a href="/" style={{ 
        display: 'inline-block',
        padding: '10px 20px', 
        backgroundColor: '#2563eb', 
        color: 'white', 
        textDecoration: 'none',
        borderRadius: '4px'
      }}>
        Go Back Home
      </a>
    </div>
  );
}