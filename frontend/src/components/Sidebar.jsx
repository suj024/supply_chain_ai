import React from 'react';

const allNavItems = [
  { id: 'dashboard',     label: 'Dashboard',     icon: '📊', roles: ['admin', 'manager'] },
  { id: 'forecast',      label: 'Forecast',       icon: '📈', roles: ['admin', 'manager'] },
  { id: 'inventory',     label: 'Inventory',      icon: '📦', roles: ['admin', 'manager', 'procurement'] },
  { id: 'replenishment', label: 'Replenishment',  icon: '🔄', roles: ['admin', 'manager', 'procurement'] },
  { id: 'risk',          label: 'Risk Detection', icon: '⚠️', roles: ['admin', 'manager'] },
  { id: 'promotion',     label: 'Promotion',      icon: '🎯', roles: ['admin', 'manager'] },
  { id: 'procurement',   label: 'Procurement',    icon: '🛒', roles: ['admin', 'manager', 'procurement', 'supplier'] },
  { id: 'accuracy',      label: 'Accuracy',       icon: '🎯', roles: ['admin', 'manager'] },
  { id: 'suppliers',     label: 'Suppliers',      icon: '🏭', roles: ['admin', 'manager'] },
];

export default function Sidebar({ activePage, onNavigate, user, onLogout }) {
  const navItems = allNavItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  return (
    <div style={{
      width: '220px',
      minWidth: '220px',
      background: '#1e293b',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
      boxSizing: 'border-box',
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
        <span>📦</span>
        <h1 style={{ fontSize: '1rem', fontWeight: '700', color: '#e2e8f0', margin: 0 }}>Supply Chain AI</h1>
      </div>

      {/* Nav Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activePage === item.id ? '#4f46e5' : 'transparent',
              color: activePage === item.id ? 'white' : '#94a3b8',
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User info */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '8px',
        }}>
          <p style={{ color: 'white', fontSize: '13px', fontWeight: '600', margin: 0 }}>
            {user?.name}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '11px', margin: '2px 0 0 0', textTransform: 'capitalize' }}>
            {user?.role}
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '10px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          🚪 Logout
        </button>
      </div>

    </div>
  );
}