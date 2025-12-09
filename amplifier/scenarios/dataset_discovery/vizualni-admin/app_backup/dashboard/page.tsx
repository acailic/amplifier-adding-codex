import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Admin Dashboard</h1>
      <p>Administracioni panel za upravljanje podacima</p>

      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2>Ukupno Dataset-a</h2>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#0066cc' }}>24</p>
          <p style={{ color: '#666' }}>Aktivnih skupova podataka</p>
        </div>

        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2>Obrade</h2>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#28a745' }}>142</p>
          <p style={{ color: '#666' }}>U poslednjih 30 dana</p>
        </div>

        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2>Korisnici</h2>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffc107' }}>8</p>
          <p style={{ color: '#666' }}>Aktivnih korisnika</p>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Skorašnje aktivnosti</h2>
        <div style={{ marginTop: '20px' }}>
          <div style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
            <p><strong>Novi dataset:</strong> Podaci o stanovništvu Srbije 2023</p>
            <p style={{ fontSize: '14px', color: '#666' }}>Pre 2 sata</p>
          </div>
          <div style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
            <p><strong>Ažuriranje:</strong> Ekonomski indikatori</p>
            <p style={{ fontSize: '14px', color: '#666' }}>Pre 5 sati</p>
          </div>
          <div style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
            <p><strong>Import:</strong> Obrazovni podaci</p>
            <p style={{ fontSize: '14px', color: '#666' }}>Prečer</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Link href="/datasets" style={{ color: '#0066cc', textDecoration: 'underline', marginRight: '20px' }}>
          Upravljaj dataset-ima →
        </Link>
        <Link href="/" style={{ color: '#0066cc', textDecoration: 'underline' }}>
          ← Nazad na početnu
        </Link>
      </div>
    </div>
  );
}