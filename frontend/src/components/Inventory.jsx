import React, { useState } from 'react';

const PRODUCTS = ['Laptop','Mobile','Tablet','Headphones','Smartwatch','Keyboard','Monitor','Mouse','Printer','Speaker'];
const LOCATIONS = ['Hyderabad','Mumbai','Delhi','Bangalore','Chennai','Pune','Kolkata','Ahmedabad'];

export default function Inventory() {
  const [product,  setProduct]  = useState('Laptop');
  const [location, setLocation] = useState('Hyderabad');
  const [stock,    setStock]    = useState(100);
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);

  const checkInventory = () => {
    setLoading(true);
    fetch(`https://web-production-0efc7.up.railway.app/inventory?product_id=${product}&location=${location}&stock=${stock}`)
      .then(r => r.json())
      .then(data => { setResult(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const statusColor = { CRITICAL:'#dc2626', UNDERSTOCK:'#d97706', HEALTHY:'#059669', OVERSTOCK:'#7c3aed' };
  const statusBg    = { CRITICAL:'#fef2f2', UNDERSTOCK:'#fffbeb', HEALTHY:'#f0fdf4', OVERSTOCK:'#faf5ff' };
  const statusIcon  = { CRITICAL:'🚨', UNDERSTOCK:'⚠️', HEALTHY:'✅', OVERSTOCK:'📦' };

  return (
    <div className="page">
      <h2 className="page-title">📦 Inventory Health</h2>

      <div className="form-row">
        <select className="select-input" value={product} onChange={e => { setProduct(e.target.value); setResult(null); }}>
          {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="select-input" value={location} onChange={e => { setLocation(e.target.value); setResult(null); }}>
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <input
          type="number"
          className="number-input"
          value={stock}
          onChange={e => setStock(e.target.value)}
          placeholder="Current stock"
        />
        <button className="btn-primary" onClick={checkInventory} disabled={loading}>
          {loading ? 'Checking...' : 'Check Inventory'}
        </button>
      </div>

      {result && !result.error && (
        <>
          {/* Status Banner */}
          <div style={{
            background: statusBg[result.status] || '#f8fafc',
            border: `1px solid ${statusColor[result.status] || '#e2e8f0'}`,
            borderRadius:'10px', padding:'16px 20px', marginBottom:'1.5rem',
            display:'flex', alignItems:'center', gap:'14px',
          }}>
            <span style={{ fontSize:'32px' }}>{statusIcon[result.status]}</span>
            <div>
              <p style={{ fontWeight:'700', fontSize:'16px', color: statusColor[result.status] }}>
                {result.status}
              </p>
              <p style={{ fontSize:'13px', color:'#64748b', marginTop:'2px' }}>{result.message}</p>
            </div>
          </div>

          {/* 8 Stat Cards */}
          <div className="stats-grid" style={{ marginBottom:'1.5rem' }}>
            {[
              { label:'Current Stock',    value: result.current_stock,          color:'#4f46e5' },
              { label:'Avg Daily Demand', value: result.avg_demand,             color:'#0891b2' },
              { label:'Safety Stock',     value: result.safety_stock,           color:'#d97706' },
              { label:'Reorder Point',    value: result.reorder_point,          color:'#f59e0b' },
              { label:'Max Stock (30d)',  value: result.max_stock,              color:'#059669' },
              { label:'Days Remaining',   value: `${result.days_remaining}d`,   color:'#dc2626' },
              { label:'Lead Time',        value: `${result.lead_time_days}d`,   color:'#7c3aed' },
              { label:'Seasonal Factor',  value: `×${result.seasonal_factor}`,  color:'#0891b2' },
            ].map(c => (
              <div className="stat-card" key={c.label}>
                <p className="stat-label">{c.label}</p>
                <p className="stat-value" style={{ color: c.color }}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Visual Stock Bar */}
          <div className="result-card">
            <h3 style={{ marginBottom:'14px' }}>📊 Stock Level Visualizer</h3>
            {[
              { label:'Safety Stock',  value: result.safety_stock,  color:'#dc2626' },
              { label:'Reorder Point', value: result.reorder_point, color:'#d97706' },
              { label:'Current Stock', value: result.current_stock, color: statusColor[result.status] },
              { label:'Max Stock',     value: result.max_stock,     color:'#059669' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom:'14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#64748b', marginBottom:'4px' }}>
                  <span>{item.label}</span>
                  <span><strong>{item.value}</strong> units</span>
                </div>
                <div style={{ background:'#e2e8f0', borderRadius:'99px', height:'12px', overflow:'hidden' }}>
                  <div style={{
                    height:'100%', borderRadius:'99px',
                    width: `${Math.min(100, (item.value / result.max_stock) * 100)}%`,
                    background: item.color,
                    transition:'width 0.8s ease',
                  }} />
                </div>
              </div>
            ))}

            {/* Legend */}
            <div style={{ display:'flex', gap:'16px', marginTop:'8px', flexWrap:'wrap' }}>
              {[
                { label:'Safety Stock',  color:'#dc2626' },
                { label:'Reorder Point', color:'#d97706' },
                { label:'Current Stock', color: statusColor[result.status] },
                { label:'Max Stock',     color:'#059669' },
              ].map(l => (
                <div key={l.label} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', color:'#64748b' }}>
                  <div style={{ width:'12px', height:'12px', borderRadius:'3px', background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {result?.error && (
        <p style={{ color:'red', marginTop:'1rem' }}>{result.error}</p>
      )}
    </div>
  );
}