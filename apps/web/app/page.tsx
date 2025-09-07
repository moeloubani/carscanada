export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #EFF6FF, #FFFFFF)' }}>
      <header style={{ padding: '1rem', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1E40AF' }}>🚗 CarsCanada</h1>
          <nav style={{ display: 'flex', gap: '2rem' }}>
            <a href="/login" style={{ color: '#4B5563', textDecoration: 'none' }}>Login</a>
            <a href="/register" style={{ color: '#4B5563', textDecoration: 'none' }}>Register</a>
            <a href="/listings" style={{ background: '#3B82F6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', textDecoration: 'none' }}>List Your Car</a>
          </nav>
        </div>
      </header>

      <main>
        <section style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Find Your Perfect Car in Canada
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#6B7280', marginBottom: '3rem' }}>
            Browse thousands of cars from trusted sellers across the country
          </p>
          
          <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <input type="text" placeholder="Make" style={{ padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.25rem' }} />
              <input type="text" placeholder="Model" style={{ padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.25rem' }} />
              <input type="text" placeholder="Location" style={{ padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.25rem' }} />
              <input type="text" placeholder="Max Price" style={{ padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '0.25rem' }} />
              <button type="submit" style={{ padding: '0.75rem', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', gridColumn: 'span 2' }}>
                Search Cars
              </button>
            </form>
          </div>
        </section>

        <section style={{ padding: '4rem 1rem', background: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>
              Featured Listings
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} style={{ background: '#F9FAFB', borderRadius: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ height: '200px', background: '#E5E7EB' }}></div>
                  <div style={{ padding: '1rem' }}>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>2022 Honda Civic</h4>
                    <p style={{ color: '#6B7280', marginBottom: '1rem' }}>30,000 km • Toronto, ON</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3B82F6' }}>$28,999</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '4rem 1rem', background: '#F3F4F6' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '3rem' }}>Why Choose CarsCanada?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Secure Transactions</h4>
                <p style={{ color: '#6B7280' }}>Buy and sell with confidence using our secure platform</p>
              </div>
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Verified Sellers</h4>
                <p style={{ color: '#6B7280' }}>All sellers are verified to ensure a safe experience</p>
              </div>
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Direct Messaging</h4>
                <p style={{ color: '#6B7280' }}>Chat directly with sellers to get all your questions answered</p>
              </div>
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Fast & Easy</h4>
                <p style={{ color: '#6B7280' }}>List your car in minutes and reach thousands of buyers</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ background: '#1F2937', color: 'white', padding: '2rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ marginBottom: '1rem' }}>© 2025 CarsCanada. All rights reserved.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <a href="/about" style={{ color: '#9CA3AF', textDecoration: 'none' }}>About</a>
            <a href="/privacy" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Privacy</a>
            <a href="/terms" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Terms</a>
            <a href="/contact" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}