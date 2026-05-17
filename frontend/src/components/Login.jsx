import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch('https://web-production-0efc7.up.railway.app/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    formData,
      });
      const data = await response.json();

      if (response.ok && data.access_token) {
        localStorage.setItem('token',   data.access_token);
        localStorage.setItem('name',    data.name);
        localStorage.setItem('role',    data.role);
        localStorage.setItem('product', data.product || '');
        setLoading(false);
        onLogin(data);
      } else {
        setError(data.detail || 'Incorrect username or password');
        setLoading(false);
      }
    } catch (err) {
      setError('Cannot connect to server. Make sure backend is running on port 8000.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background image as img tag — most reliable */}
      <img
        src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80"
        alt=""
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1,
      }} />

      {/* Login card */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        background: 'white',
        borderRadius: '20px',
        padding: '48px 40px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '52px', marginBottom: '10px' }}>📦</div>
          <h1 style={{
            fontSize: '26px', fontWeight: '700',
            color: '#1e293b', margin: 0,
          }}>
            Supply Chain AI
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px', margin: '8px 0 0' }}>
            Sign in to your account
          </p>
        </div>

        {/* Username */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontSize: '13px', fontWeight: '600',
            color: '#374151', display: 'block', marginBottom: '8px',
          }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', padding: '13px 16px',
              borderRadius: '10px', border: '1.5px solid #e2e8f0',
              fontSize: '14px', outline: 'none',
              boxSizing: 'border-box', background: '#f8fafc',
              color: '#1e293b',
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            fontSize: '13px', fontWeight: '600',
            color: '#374151', display: 'block', marginBottom: '8px',
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', padding: '13px 16px',
              borderRadius: '10px', border: '1.5px solid #e2e8f0',
              fontSize: '14px', outline: 'none',
              boxSizing: 'border-box', background: '#f8fafc',
              color: '#1e293b',
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fee2e2', border: '1px solid #fecaca',
            borderRadius: '10px', padding: '12px 16px',
            marginBottom: '20px', color: '#dc2626',
            fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            ❌ {error}
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white', border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.5px',
          }}
        >
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>

        {/* Footer */}
        <p style={{
          textAlign: 'center', marginTop: '20px',
          fontSize: '12px', color: '#94a3b8',
        }}>
          🔒 Secure access — authorized personnel only
        </p>

      </div>
    </div>
  );
}