import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: '⊞', label: 'Dashboard', roles: ['admin','doctor','nurse','pharmacist','patient','receptionist','worker'] },
  { path: '/appointments', icon: '📅', label: 'Appointments', roles: ['admin','doctor','nurse','patient','receptionist','worker'] },
  { path: '/doctors', icon: '👨‍⚕️', label: 'Doctors', roles: ['admin','doctor','nurse','patient','receptionist','worker','pharmacist'] },
  { path: '/opd', icon: '🏥', label: 'OPD', roles: ['admin','doctor','nurse','pharmacist','receptionist','worker'] },
  { path: '/ipd', icon: '🛏️', label: 'IPD & Beds', roles: ['admin','doctor','nurse','pharmacist','receptionist','worker'] },
  { path: '/prescriptions', icon: '💊', label: 'Prescriptions', roles: ['admin','doctor','nurse','patient','pharmacist','receptionist','worker'] },
  { path: '/inventory', icon: '📦', label: 'Inventory', roles: ['admin','doctor','nurse','pharmacist','receptionist','worker'] },
  { path: '/users', icon: '👥', label: 'User Management', roles: ['admin'] },
  { path: '/profile', icon: '👤', label: 'My Profile', roles: ['admin','doctor','nurse','pharmacist','patient','receptionist','worker'] },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filtered = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside style={{
      width: collapsed ? '70px' : 'var(--sidebar-width)',
      position: 'fixed', top: 0, left: 0, bottom: 0,
      background: 'var(--gray-900)',
      transition: 'width 0.3s ease',
      zIndex: 200, display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px', minHeight: '65px' }}>
        <div style={{ width: '34px', height: '34px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>✚</div>
        {!collapsed && (
          <div>
            <div style={{ color: 'white', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>MedNova</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hospital System</div>
          </div>
        )}
      </div>

      {/* User info */}
      {!collapsed && (
        <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="avatar avatar-sm" style={{ background: 'var(--primary)', color: 'white', width: '34px', height: '34px', fontSize: '0.8rem' }}>
              {user?.name?.charAt(0) || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'white', fontSize: '0.82rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {filtered.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : ''}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 10px', borderRadius: '8px', marginBottom: '2px',
              color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
              background: isActive ? 'var(--primary)' : 'transparent',
              textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap', overflow: 'hidden',
            })}
            onMouseEnter={e => { if (!e.currentTarget.style.background.includes('primary')) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.background = location.pathname === item.path ? 'var(--primary)' : 'transparent'; }}
          >
            <span style={{ fontSize: '1.1rem', flexShrink: 0, width: '22px', textAlign: 'center' }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={logout}
          title={collapsed ? 'Logout' : ''}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px', borderRadius: '8px', border: 'none',
            background: 'transparent', color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
        >
          <span style={{ fontSize: '1.1rem', flexShrink: 0, width: '22px', textAlign: 'center' }}>↪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
