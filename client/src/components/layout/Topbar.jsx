import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl, getInitials } from '../../utils/helpers';

const pageNames = {
  '/dashboard': 'Dashboard', '/appointments': 'Appointments', '/doctors': 'Doctors',
  '/opd': 'Outpatient Department', '/ipd': 'Inpatient Department',
  '/prescriptions': 'Prescriptions', '/inventory': 'Inventory',
  '/users': 'User Management', '/profile': 'My Profile',
};

export default function Topbar({ collapsed, onToggle }) {
  const { user } = useAuth();
  const location = useLocation();
  const pageName = pageNames[location.pathname] || 'MedNova';
  const avatarUrl = getAvatarUrl(user?.profilePicture);

  return (
    <header style={{
      position: 'fixed', top: 0, right: 0,
      left: collapsed ? '70px' : 'var(--sidebar-width)',
      height: 'var(--topbar-height)',
      background: 'var(--white)',
      borderBottom: '1px solid var(--gray-100)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', zIndex: 100,
      transition: 'left 0.3s ease',
      boxShadow: '0 1px 0 var(--gray-100)',
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggle}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: 'var(--gray-500)', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}
        >☰</button>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--gray-900)', lineHeight: 1 }}>{pageName}</h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '2px' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Notifications placeholder */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', position: 'relative', color: 'var(--gray-500)' }}>
          🔔
          <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid white' }} />
        </button>

        {/* Profile */}
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', padding: '6px 10px', borderRadius: '10px', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={user?.name} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gray-200)' }} />
          ) : (
            <div className="avatar avatar-sm" style={{ background: 'var(--primary)', color: 'white' }}>{getInitials(user?.name)}</div>
          )}
          <div style={{ display: 'none' }} className="topbar-user-info">
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--gray-800)' }}>{user?.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </Link>
      </div>
    </header>
  );
}
