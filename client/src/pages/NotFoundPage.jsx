import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '520px' }}>
        {/* Logo */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--primary)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'white' }}>✚</div>
          <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--gray-900)' }}>MedNova</span>
        </div>

        {/* 404 Display */}
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <div style={{ fontSize: '8rem', fontWeight: '900', color: 'var(--gray-100)', lineHeight: 1, userSelect: 'none' }}>404</div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🏥</div>
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--gray-900)', marginBottom: '12px' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '36px' }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back to MedNova.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ padding: '11px 22px' }}>
            ← Go Back
          </button>
          <Link to="/dashboard" className="btn btn-primary" style={{ padding: '11px 22px' }}>
            🏠 Dashboard
          </Link>
        </div>

        <div style={{ marginTop: '48px', padding: '20px', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Links</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {[['📅 Appointments', '/appointments'], ['👨‍⚕️ Doctors', '/doctors'], ['💊 Prescriptions', '/prescriptions'], ['👤 Profile', '/profile']].map(([label, path]) => (
              <Link key={path} to={path} style={{ padding: '6px 14px', background: 'var(--gray-50)', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--primary)', textDecoration: 'none', border: '1px solid var(--gray-200)', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--gray-50)'}
              >{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
