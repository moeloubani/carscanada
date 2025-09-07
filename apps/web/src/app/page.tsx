export default function HomePage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>CarsCanada</h1>
      <p style={{ fontSize: '20px', marginBottom: '40px' }}>
        Your trusted marketplace for buying and selling cars across Canada.
      </p>
      
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Search for Cars</h2>
        <form style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', maxWidth: '600px' }}>
          <input 
            type="text" 
            placeholder="Make" 
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', flex: '1' }}
          />
          <input 
            type="text" 
            placeholder="Model" 
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', flex: '1' }}
          />
          <input 
            type="text" 
            placeholder="Location" 
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', flex: '1' }}
          />
          <button 
            type="button" 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </form>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Featured Listings</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
              <div style={{ backgroundColor: '#f3f4f6', height: '200px', borderRadius: '4px', marginBottom: '15px' }}></div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>2023 Honda Civic</h3>
              <p style={{ fontSize: '24px', color: '#2563eb', fontWeight: 'bold', marginBottom: '10px' }}>$32,500</p>
              <p style={{ color: '#6b7280' }}>Toronto, ON • 15,000 km</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Quick Links</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <a href="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>Login</a>
          <a href="/register" style={{ color: '#2563eb', textDecoration: 'none' }}>Register</a>
          <a href="/listings" style={{ color: '#2563eb', textDecoration: 'none' }}>Browse Cars</a>
          <a href="/dealers" style={{ color: '#2563eb', textDecoration: 'none' }}>Find Dealers</a>
        </div>
      </div>
    </div>
  );
}