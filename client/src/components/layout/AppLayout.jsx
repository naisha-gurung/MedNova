import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div style={{
        flex: 1,
        marginLeft: collapsed ? '70px' : 'var(--sidebar-width)',
        paddingTop: 'var(--topbar-height)',
        transition: 'margin-left 0.3s ease',
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
      }}>
        <Topbar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        <main style={{ flex: 1, padding: '28px 32px' }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
