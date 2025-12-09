import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Vizualni-Admin Dashboard</h1>
      <p>Serbian Data Visualization Admin Dashboard</p>
      <p>Визуелна административна панел за управљање подацима</p>

      <nav style={{ marginTop: '30px' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/button-demo" style={{ color: '#0066cc', textDecoration: 'underline' }}>
              Button Demo / Демонстрација дугмади
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/demos" style={{ color: '#0066cc', textDecoration: 'underline' }}>
              Demos / Демонстрације
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/dashboard" style={{ color: '#0066cc', textDecoration: 'underline' }}>
              Dashboard / Контролна табла
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/datasets" style={{ color: '#0066cc', textDecoration: 'underline' }}>
              Datasets / Скупови података
            </Link>
          </li>
        </ul>
      </nav>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>Features / Функције</h2>
        <ul>
          <li>✓ Interactive buttons with magnetic effects</li>
          <li>✓ Serbian language support</li>
          <li>✓ Data visualization components</li>
          <li>✓ Responsive design</li>
          <li>✓ Accessibility features</li>
        </ul>
      </div>
    </div>
  );
}