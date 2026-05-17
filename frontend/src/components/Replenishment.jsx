import React, { useState } from 'react';

const PRODUCTS = ['Laptop','Mobile','Tablet','Headphones','Smartwatch','Keyboard','Monitor','Mouse','Printer','Speaker'];
const LOCATIONS = ['Hyderabad','Mumbai','Delhi','Bangalore','Chennai','Pune','Kolkata','Ahmedabad'];

export default function Replenishment() {
  const [product,   setProduct]   = useState('Laptop');
  const [location,  setLocation]  = useState('Hyderabad');
  const [stock,     setStock]     = useState(100);
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [orderMsg,  setOrderMsg]  = useState('');
  const [orderSent, setOrderSent] = useState(false);

  const getReplenishment = () => {
    setLoading(true); setOrderMsg(''); setOrderSent(false);
    fetch(`https://web-production-0efc7.up.railway.app/replenish?product_id=${product}&location=${location}&stock=${stock}`)
      .then(r => r.json())
      .then(data => { setResult(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const sendToProcurement = () => {
    const orderDate = new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0];
    fetch('https://web-production-0efc7.up.railway.app/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id:     product,
        location:       location,
        quantity:       result.recommended_order,
        suggested_date: orderDate,
        reason:         result.reasoning,
      }),
    })
    .then(r => r.json())
    .then(data => {
      setOrderMsg(`✅ Order #${data.id} created! Go to Procurement to approve.`);
      setOrderSent(true);
    })
    .catch(() => setOrderMsg('❌ Failed to create order.'));
  };

  const urgencyColor = {
    'CRITICAL — Order immediately':   '#dc2626',
    'HIGH — Order within 2 days':     '#d97706',
    'MEDIUM — Reorder point reached': '#f59e0b',
    'LOW — Stock is sufficient':      '#059669',
  };

  const urgencyBg = {
    'CRITICAL — Order immediately':   '#fef2f2',
    'HIGH — Order within 2 days':     '#fffbeb',
    'MEDIUM — Reorder point reached': '#fff7ed',
    'LOW — Stock is sufficient':      '#f0fdf4',
  };

  const urgencyIcon = {
    'CRITICAL — Order immediately':   '🚨',
    'HIGH — Order within 2 days':     '⚠️',
    'MEDIUM — Reorder point reached': '🟡',
    'LOW — Stock is sufficient':      '✅',
  };

  return (
    <div className="page">
      <h2 className="page-title">🔄 Replenishment Recommendation</h2>

      {/* Controls */}
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
        <button className="btn-primary" onClick={getReplenishment} disabled={loading}>
          {loading ? 'Calculating...' : 'Get Recommendation'}
        </button>
      </div>

      {result && !result.error && (
        <>
          {/* Urgency Banner */}
          <div style={{
            background: urgencyBg[result.urgency]   || '#f8fafc',
            border:     `1px solid ${urgencyColor[result.urgency] || '#e2e8f0'}`,
            borderRadius:'10px', padding:'16px 20px', marginBottom:'1.5rem',
            display:'flex', alignItems:'center', gap:'14px',
          }}>
            <span style={{ fontSize:'32px' }}>{urgencyIcon[result.urgency]}</span>
            <div>
              <p style={{ fontWeight:'700', fontSize:'16px', color: urgencyColor[result.urgency] || '#333' }}>
                {result.urgency}
              </p>
              <p style={{ fontSize:'13px', color:'#64748b', marginTop:'2px' }}>
                {result.days_of_stock_left} days of stock remaining · Suggested order by <strong>{result.suggested_order_date}</strong>
              </p>
            </div>
          </div>

          {/* 8 Stat Cards */}
          <div className="stats-grid" style={{ marginBottom:'1.5rem' }}>
            {[
              { label:'Current Stock',     value: result.current_stock,      color:'#4f46e5' },
              { label:'Avg Daily Demand',  value: result.avg_daily_demand,   color:'#0891b2' },
              { label:'Demand Std Dev',    value: result.demand_std,         color:'#64748b' },
              { label:'Lead Time',         value: `${result.lead_time_days} days`, color:'#7c3aed' },
              { label:'Safety Stock',      value: result.safety_stock,       color:'#d97706' },
              { label:'Reorder Point',     value: result.reorder_point,      color:'#f59e0b' },
              { label:'EOQ (Optimal Qty)', value: result.eoq,                color:'#059669' },
              { label:'Recommended Order', value: result.recommended_order,  color:'#dc2626' },
            ].map(c => (
              <div className="stat-card" key={c.label}>
                <p className="stat-label">{c.label}</p>
                <p className="stat-value" style={{ color: c.color }}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* AI Reasoning */}
          <div className="result-card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ marginBottom:'10px' }}>🤖 AI Reasoning</h3>
            <div style={{ background:'#f8fafc', borderRadius:'8px', padding:'14px', borderLeft:'3px solid #4f46e5' }}>
              <p style={{ fontSize:'13px', color:'#475569', lineHeight:'1.7' }}>{result.reasoning}</p>
            </div>

            {/* Formula Cards */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'14px' }}>
              <div style={{ background:'#ede9fe', borderRadius:'8px', padding:'14px' }}>
                <p style={{ fontSize:'11px', fontWeight:'700', color:'#7c3aed', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                  📐 EOQ Formula
                </p>
                <p style={{ fontSize:'12px', color:'#4c1d95', lineHeight:'1.6' }}>
                  √(2 × Annual Demand × Ordering Cost ÷ Holding Cost)
                </p>
                <p style={{ fontSize:'16px', fontWeight:'800', color:'#4f46e5', marginTop:'8px' }}>
                  = {result.eoq} units
                </p>
              </div>
              <div style={{ background:'#fef3c7', borderRadius:'8px', padding:'14px' }}>
                <p style={{ fontSize:'11px', fontWeight:'700', color:'#92400e', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                  🛡️ Safety Stock (95% Service Level)
                </p>
                <p style={{ fontSize:'12px', color:'#78350f', lineHeight:'1.6' }}>
                  1.65 × σ (Demand Std Dev) × √(Lead Time)
                </p>
                <p style={{ fontSize:'16px', fontWeight:'800', color:'#d97706', marginTop:'8px' }}>
                  = {result.safety_stock} units
                </p>
              </div>
            </div>
          </div>

          {/* Send to Procurement */}
          {result.should_order && (
            <div className="result-card">
              <h3 style={{ marginBottom:'12px' }}>🛒 Create Purchase Order</h3>
              <p style={{ fontSize:'13px', color:'#64748b', marginBottom:'14px' }}>
                AI recommends ordering <strong style={{ color:'#059669' }}>{result.recommended_order} units</strong> of <strong>{product}</strong> in <strong>{location}</strong> by <strong>{result.suggested_order_date}</strong>.
              </p>
              <button
                onClick={sendToProcurement}
                disabled={orderSent}
                style={{
                  padding:'12px 24px',
                  background: orderSent ? '#94a3b8' : '#059669',
                  color:'white', border:'none', borderRadius:'8px',
                  cursor: orderSent ? 'not-allowed' : 'pointer',
                  fontSize:'14px', fontWeight:'700',
                }}
              >
                {orderSent ? '✅ Order Sent to Procurement' : '🛒 Send to Procurement'}
              </button>
              {orderMsg && (
                <p style={{
                  marginTop:'10px', fontSize:'13px', fontWeight:'500',
                  color: orderMsg.startsWith('✅') ? '#059669' : '#dc2626',
                }}>
                  {orderMsg}
                </p>
              )}
            </div>
          )}

          {!result.should_order && (
            <div style={{
              background:'#f0fdf4', border:'1px solid #86efac',
              borderRadius:'10px', padding:'14px 18px',
            }}>
              <p style={{ color:'#059669', fontWeight:'600', fontSize:'14px' }}>
                ✅ Stock is sufficient — no order needed right now.
              </p>
              <p style={{ color:'#64748b', fontSize:'13px', marginTop:'4px' }}>
                Current stock of {result.current_stock} units covers {result.days_of_stock_left} days. Reorder point is {result.reorder_point} units.
              </p>
            </div>
          )}
        </>
      )}

      {result?.error && (
        <p style={{ color:'red', marginTop:'1rem' }}>{result.error}</p>
      )}
    </div>
  );
}