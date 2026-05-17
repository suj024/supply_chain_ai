import React, { useState } from 'react';

const PRODUCTS = ['Laptop','Mobile','Tablet','Headphones','Smartwatch','Keyboard','Monitor','Mouse','Printer','Speaker'];
const LOCATIONS = ['Hyderabad','Mumbai','Delhi','Bangalore','Chennai','Pune','Kolkata','Ahmedabad'];

export default function Promotion() {
  const [product,  setProduct]  = useState('Laptop');
  const [location, setLocation] = useState('Hyderabad');
  const [lift,     setLift]     = useState(20);
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);

  const simulate = () => {
    setLoading(true);
    fetch(`https://web-production-0efc7.up.railway.app/promotion?product_id=${product}&location=${location}&lift=${lift}`)
      .then(r => r.json())
      .then(data => { setResult(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const liftPresets = [5, 10, 15, 20, 30, 50];

  return (
    <div className="page">
      <h2 className="page-title">🎯 Promotion Impact Simulator</h2>

      <div style={{
        background:'#f0fdf4', border:'1px solid #86efac',
        borderRadius:'10px', padding:'12px 16px', marginBottom:'1.5rem',
        fontSize:'13px', color:'#166534',
      }}>
        📢 Enter an upcoming promotion and see the predicted demand lift per product per location.
      </div>

      {/* Controls */}
      <div className="form-row">
        <select className="select-input" value={product} onChange={e => { setProduct(e.target.value); setResult(null); }}>
          {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="select-input" value={location} onChange={e => { setLocation(e.target.value); setResult(null); }}>
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <button className="btn-primary" onClick={simulate} disabled={loading}>
          {loading ? 'Simulating...' : '🚀 Simulate'}
        </button>
      </div>

      {/* Lift % Selector */}
      <div className="result-card" style={{ marginBottom:'1.5rem' }}>
        <h3 style={{ marginBottom:'12px' }}>📊 Promotion Discount / Lift %</h3>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'14px' }}>
          {liftPresets.map(p => (
            <button key={p} onClick={() => setLift(p)} style={{
              padding:'8px 18px', borderRadius:'8px',
              border:'1px solid #cbd5e1',
              background: lift === p ? '#4f46e5' : 'white',
              color:      lift === p ? 'white'   : '#1e293b',
              cursor:'pointer', fontSize:'13px', fontWeight: lift === p ? '700' : '400',
              transition:'all 0.2s',
            }}>
              {p}%
            </button>
          ))}
        </div>

        {/* Custom lift input */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'13px', color:'#64748b' }}>Custom %:</span>
          <input
            type="number"
            className="number-input"
            value={lift}
            onChange={e => setLift(Number(e.target.value))}
            placeholder="e.g. 25"
            min="1" max="100"
            style={{ width:'100px' }}
          />
          <span style={{ fontSize:'13px', color:'#64748b' }}>
            {lift <= 10 ? '🟢 Low lift' : lift <= 25 ? '🟡 Medium lift' : '🔴 High lift — watch inventory!'}
          </span>
        </div>
      </div>

      {result && (
        <>
          {/* Main Result Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            borderRadius:'12px', padding:'24px 28px', marginBottom:'1.5rem',
            color:'white',
          }}>
            <p style={{ fontSize:'13px', opacity:0.8, marginBottom:'6px' }}>
              {product} · {location} · {lift}% promotion
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:'32px' }}>
              <div>
                <p style={{ fontSize:'12px', opacity:0.7 }}>Base Demand</p>
                <p style={{ fontSize:'32px', fontWeight:'800' }}>
                  {result.base_demand?.toFixed(1)}
                </p>
                <p style={{ fontSize:'11px', opacity:0.6 }}>units/day</p>
              </div>
              <div style={{ fontSize:'28px' }}>→</div>
              <div>
                <p style={{ fontSize:'12px', opacity:0.7 }}>After Promotion</p>
                <p style={{ fontSize:'32px', fontWeight:'800', color:'#fde68a' }}>
                  {result.predicted_demand_after_promotion?.toFixed(1)}
                </p>
                <p style={{ fontSize:'11px', opacity:0.6 }}>units/day</p>
              </div>
              <div style={{ marginLeft:'auto', textAlign:'right' }}>
                <p style={{ fontSize:'12px', opacity:0.7 }}>Demand Increase</p>
                <p style={{ fontSize:'36px', fontWeight:'900', color:'#6ee7b7' }}>
                  +{((result.predicted_demand_after_promotion - result.base_demand)).toFixed(1)}
                </p>
                <p style={{ fontSize:'11px', opacity:0.6 }}>extra units/day</p>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="stats-grid" style={{ marginBottom:'1.5rem' }}>
            {[
              { label:'Base Demand',       value:`${result.base_demand?.toFixed(2)} units`,      color:'#4f46e5' },
              { label:'Lift Applied',      value:`${result.promotion_lift_percent}%`,             color:'#d97706' },
              { label:'Predicted Demand',  value:`${result.predicted_demand_after_promotion?.toFixed(2)} units`, color:'#059669' },
              { label:'Extra Units/Day',   value:`+${(result.predicted_demand_after_promotion - result.base_demand).toFixed(2)}`, color:'#dc2626' },
            ].map(c => (
              <div className="stat-card" key={c.label}>
                <p className="stat-label">{c.label}</p>
                <p className="stat-value" style={{ color:c.color }}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Demand lift bar */}
          <div className="result-card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ marginBottom:'14px' }}>📈 Demand Lift Visualizer</h3>
            {[
              { label:'Base Demand',      value: result.base_demand,                              color:'#4f46e5' },
              { label:'Promoted Demand',  value: result.predicted_demand_after_promotion,          color:'#059669' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom:'14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#64748b', marginBottom:'4px' }}>
                  <span>{item.label}</span>
                  <span><strong>{item.value?.toFixed(1)}</strong> units/day</span>
                </div>
                <div style={{ background:'#e2e8f0', borderRadius:'99px', height:'14px', overflow:'hidden' }}>
                  <div style={{
                    height:'100%', borderRadius:'99px',
                    width:`${Math.min(100, (item.value / (result.predicted_demand_after_promotion * 1.1)) * 100)}%`,
                    background: item.color,
                    transition:'width 0.8s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Inventory Warning */}
          {lift >= 20 && (
            <div style={{
              background:'#fffbeb', border:'1px solid #fcd34d',
              borderRadius:'10px', padding:'14px 18px',
            }}>
              <p style={{ fontWeight:'700', fontSize:'14px', color:'#92400e', marginBottom:'6px' }}>
                ⚠️ Inventory Warning
              </p>
              <p style={{ fontSize:'13px', color:'#78350f', lineHeight:'1.6' }}>
                A <strong>{lift}%</strong> promotion will increase daily demand from <strong>{result.base_demand?.toFixed(1)}</strong> to <strong>{result.predicted_demand_after_promotion?.toFixed(1)}</strong> units.
                Make sure you have sufficient stock before launching. Consider triggering a replenishment order first.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}