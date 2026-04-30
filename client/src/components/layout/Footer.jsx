import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--gray-100)',
      padding: '18px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--white)', marginTop: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1rem' }}>✚</span>
        <span style={{ fontWeight: '700', color: 'var(--gray-700)', fontSize: '0.875rem' }}>MedNova</span>
        <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>Hospital Management System</span>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>v1.0.0</span>
        <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>© {new Date().getFullYear()} MedNova. All rights reserved.</span>
      </div>
    </footer>
  );
}
