import Link from 'next/link';

export default function DatasetsPage() {
  const datasets = [
    { id: 1, name: 'Stanovništvo Srbije 2023', description: 'Demografski podaci o stanovništvu Srbije', status: 'Aktivan', updated: '2024-01-15' },
    { id: 2, name: 'Ekonomski indikatori', description: 'GDP, inflacija, nezaposlenost', status: 'Aktivan', updated: '2024-01-14' },
    { id: 3, name: 'Obrazovni sistem', description: 'Podaci o školama i studentima', status: 'U obradi', updated: '2024-01-13' },
    { id: 4, name: 'Zdravstveni podaci', description: 'Bolnice, pacijenti, tretmani', status: 'Aktivan', updated: '2024-01-12' },
    { id: 5, name: 'Infrastruktura', description: 'Putevi, mostovi, saobraćaj', status: 'Planiran', updated: '2024-01-10' },
    { id: 6, name: 'Poljoprivreda', description: 'Usevi, žetva, zemljište', status: 'Aktivan', updated: '2024-01-08' },
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Upravljanje Dataset-ima</h1>
      <p>Data Management - Управљање подацима</p>

      <div style={{ marginTop: '30px', marginBottom: '20px' }}>
        <button style={{ padding: '10px 20px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          + Novi Dataset
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Naziv</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Opis</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Ažuriran</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((dataset) => (
              <tr key={dataset.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{dataset.id}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{dataset.name}</td>
                <td style={{ padding: '12px', color: '#666' }}>{dataset.description}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '3px',
                    fontSize: '12px',
                    backgroundColor: dataset.status === 'Aktivan' ? '#d4edda' : dataset.status === 'U obradi' ? '#fff3cd' : '#f8d7da',
                    color: dataset.status === 'Aktivan' ? '#155724' : dataset.status === 'U obradi' ? '#856404' : '#721c24'
                  }}>
                    {dataset.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{dataset.updated}</td>
                <td style={{ padding: '12px' }}>
                  <button style={{ padding: '5px 10px', marginRight: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                        Визуелиза
                      </button>
                  <button style={{ padding: '5px 10px', marginRight: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                        Измени
                      </button>
                  <button style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                        Обриши
                      </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Statistika</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
          <div style={{ padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
            <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>6</p>
            <p style={{ margin: '0', color: '#666' }}>Ukupno dataset-a</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#d4edda', borderRadius: '5px' }}>
            <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>4</p>
            <p style={{ margin: '0', color: '#666' }}>Aktivnih</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
            <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>1</p>
            <p style={{ margin: '0', color: '#666' }}>U obradi</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f8d7da', borderRadius: '5px' }}>
            <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>1</p>
            <p style={{ margin: '0', color: '#666' }}>Planiranih</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Link href="/dashboard" style={{ color: '#0066cc', textDecoration: 'underline', marginRight: '20px' }}>
          ← Nazad na dashboard
        </Link>
        <Link href="/" style={{ color: '#0066cc', textDecoration: 'underline' }}>
          Nazad na početnu
        </Link>
      </div>
    </div>
  );
}