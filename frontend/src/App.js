import React, { useState, useEffect } from 'react';
import Sidebar       from './components/Sidebar';
import Dashboard     from './components/Dashboard';
import Forecast      from './components/Forecast';
import Inventory     from './components/Inventory';
import Replenishment from './components/Replenishment';
import Risk          from './components/Risk';
import Promotion     from './components/Promotion';
import Procurement   from './components/Procurement';
import Accuracy      from './components/Accuracy';
import Suppliers     from './components/Suppliers';
import Login         from './components/Login';
import './App.css';

export default function App() {
  const [page, setPage]   = useState('dashboard');
  const [user, setUser]   = useState(null);

  // check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const name  = localStorage.getItem('name');
    const role  = localStorage.getItem('role');
    if (token && name && role) {
      setUser({ token, name, role, product: localStorage.getItem('product') });
    }
  }, []);

  const handleLogin = (data) => {
    setUser(data);
    // set default page based on role
    if (data.role === 'supplier') {
      setPage('procurement');
    } else {
      setPage('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setPage('dashboard');
  };

  // show login page if not logged in
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // pages based on role
  const allPages = {
    dashboard:     <Dashboard />,
    forecast:      <Forecast />,
    inventory:     <Inventory />,
    replenishment: <Replenishment />,
    risk:          <Risk />,
    promotion:     <Promotion />,
    procurement:   <Procurement user={user} />,
    accuracy:      <Accuracy />,
    suppliers:     <Suppliers />,
  };

  // supplier only sees procurement page
  const supplierPages = {
    procurement: <Procurement user={user} />,
  };

  const pages = user.role === 'supplier' ? supplierPages : allPages;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        activePage={page}
        onNavigate={setPage}
        user={user}
        onLogout={handleLogout}
      />
      <main style={{ flex: 1, overflow: 'auto' }}>
        {pages[page] || <Dashboard />}
      </main>
    </div>
  );
}