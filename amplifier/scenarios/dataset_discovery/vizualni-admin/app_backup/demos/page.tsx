import Link from 'next/link';

export default function DemosPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Component Demos</h1>
      <p>Explore our collection of enhanced UI components</p>

      <div style={{ marginTop: '30px' }}>
        <h2>Available Demos</h2>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>Button Components</h3>
          <p>Interactive buttons with advanced effects and Serbian localization</p>
          <Link href="/button-demo" style={{ color: '#0066cc', textDecoration: 'underline' }}>
            View Button Demo →
          </Link>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>Data Visualization</h3>
          <p>Charts and graphs for displaying dataset insights</p>
          <Link href="/datasets" style={{ color: '#0066cc', textDecoration: 'underline' }}>
            View Data Visualization →
          </Link>
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>Admin Dashboard</h3>
          <p>Complete admin interface with Serbian language support</p>
          <Link href="/dashboard" style={{ color: '#0066cc', textDecoration: 'underline' }}>
            View Dashboard →
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Link href="/" style={{ color: '#0066cc', textDecoration: 'underline' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}