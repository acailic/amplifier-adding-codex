import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Vizualni-Admin Dashboard</h1>
      <p>Vizuelni Administrativna Panel za Analizu i Vizuelizaciju Srpskih Podataka</p>

      <nav style={{ marginTop: '30px' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>
            <Link
              href="/button-demo"
              style={{ color: '#0066cc', textDecoration: 'underline' }}
            >
              Button Demo (Демонстрација дугмади)
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link
              href="/demos"
              style={{ color: '#0066cc', textDecoration: 'underline' }}
            >
              Demos (Демонстрације)
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link
              href="/dashboard"
              style={{ color: '#0066cc', textDecoration: 'underline' }}
            >
              Dashboard (Контролна табла)
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link
              href="/datasets"
              style={{ color: '#0066cc', textDecoration: 'underline' }}
            >
              Datasets (Скупови података)
            </Link>
          </li>
        </ul>
      </nav>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5' }}>
        <h2>Пројекат је тренутно у развоју</h2>
        <p>Ова апликација приказује визуализације података за Србију.</p>
      </div>
    </div>
  );
}