import React, { useState } from 'react';

const PRODUCTS = ['Laptop','Mobile','Tablet','Headphones','Smartwatch','Keyboard','Monitor','Mouse','Printer','Speaker'];
const LOCATIONS = ['Hyderabad','Mumbai','Delhi','Bangalore','Chennai','Pune','Kolkata','Ahmedabad'];

export default function Risk() {
  const [product,  setProduct]  = useState('Laptop');
  const [location, setLocation] = useState('Hyderabad');
  const [stock,    setStock]    = useState(100);
  const [result,   setResult]   = useState(null);
  const [signals,  setSignals]  = useState(null);
  const [loading,  setLoading]  = useState(false);

  const detectRisk = () => {
    setLoading(true);
    Promise.all([
      fetch(`https://web-production-0efc7.up.railway.app/risk?product_id=${product}&location=${location}&stock=${stock}`).then(r => r.json()),
      fetch(`https://web-production-0efc7.up.railway.app/signals?product_id=${product}&location=${location}`).then(r => r.json()),
    ])
    .then(([riskData, signalData]) => {
      setResult(riskData);
      setSignals(signalData);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  };

  const riskTextColor = (risk) => {
    if (!risk) return '#333';
    if (risk.includes('HIGH'))      return '#dc2626';
    if (risk.includes('MEDIUM'))    return '#d97706';
    if (risk.includes('OVERSTOCK')) return '#7c3aed';
    return '#059669';
  };

  const riskBgColor = (risk) => {
    if (!risk) return '#f8fafc';
    if (risk.includes('HIGH'))      return '#fef2f2';
    if (risk.includes('MEDIUM'))    return '#fffbeb';
    if (risk.includes('OVERSTOCK')) return '#faf5ff';
    return '#f0fdf4';
  };

  const riskBarColor = (score) => {
    if (score >= 70) return '#dc2626';
    if (score >= 45) return '#d97706';
    return '#059669';
  };

  return (
    <div className="page">
      <h2 className="page-title">⚠️ Risk Detection</h2>

      {/* Controls */}
      <div className="form-row">
        <select className="select-input" value={product} onChange={e => { setProduct(e.target.value); setResult(null); setSignals(null); }}>
          {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="select-input" value={location} onChange={e => { setLocation(e.target.value); setResult(null); setSignals(null); }}>
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <input
          type="number"
          className="number-input"
          value={stock}
          onChange={e => setStock(e.target.value)}
          placeholder="Current stock"
        />
        <button className="btn-primary" onClick={detectRisk} disabled={loading}>
          {loading ? 'Analyzing...' : 'Detect Risk'}
        </button>
      </div>

      {/* Advance Warning Banner */}
      {result?.advance_warning && (
        <div style={{
          background:   result.advance_warning.startsWith('⚠️') ? '#fef2f2' : '#fffbeb',
          border:       `1px solid ${result.advance_warning.startsWith('⚠️') ? '#fca5a5' : '#fcd34d'}`,
          borderRadius: '10px', padding:'16px 20px', marginBottom:'1.5rem',
          color:        result.advance_warning.startsWith('⚠️') ? '#dc2626' : '#92400e',
          fontWeight:   '600', fontSize:'14px', lineHeight:'1.7',
        }}>
          {result.advance_warning}
          <div style={{ marginTop:'6px', fontSize:'13px', fontWeight:'400' }}>
            📅 Order by: <strong>{result.order_by_date}</strong>
          </div>
        </div>
      )}

      {result && (
        <>
          {/* AI Risk Score Circle + Bar */}
          <div className="result-card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ marginBottom:'1rem' }}>🎯 AI Risk Score</h3>
            <div style={{ display:'flex', alignItems:'center', gap:'24px', marginBottom:'20px' }}>

              {/* Circle */}
              <div style={{
                width:'100px', height:'100px', borderRadius:'50%',
                background: riskBgColor(result.risk),
                border: `5px solid ${riskTextColor(result.risk)}`,
                display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize:'26px', fontWeight:'800', color: riskTextColor(result.risk) }}>
                  {result.risk_score}
                </span>
                <span style={{ fontSize:'11px', color:'#64748b' }}>/ 100</span>
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight:'700', fontSize:'16px', color: riskTextColor(result.risk), marginBottom:'6px' }}>
                  {result.risk}
                </p>
                <p style={{ fontSize:'13px', color:'#64748b', marginBottom:'8px' }}>
                  {result.recommendation}
                </p>
                <div style={{ display:'flex', gap:'16px' }}>
                  <div style={{ background:'#f8fafc', borderRadius:'8px', padding:'8px 14px' }}>
                    <p style={{ fontSize:'11px', color:'#94a3b8' }}>Stockout Probability</p>
                    <p style={{ fontSize:'18px', fontWeight:'800', color: riskBarColor(result.risk_score) }}>
                      {result.stockout_probability}%
                    </p>
                  </div>
                  <div style={{ background:'#f8fafc', borderRadius:'8px', padding:'8px 14px' }}>
                    <p style={{ fontSize:'11px', color:'#94a3b8' }}>Days of Stock</p>
                    <p style={{ fontSize:'18px', fontWeight:'800', color:'#4f46e5' }}>
                      {result.days_of_stock_left}d
                    </p>
                  </div>
                  <div style={{ background:'#f8fafc', borderRadius:'8px', padding:'8px 14px' }}>
                    <p style={{ fontSize:'11px', color:'#94a3b8' }}>Avg Demand</p>
                    <p style={{ fontSize:'18px', fontWeight:'800', color:'#0891b2' }}>
                      {result.avg_demand}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ background:'#e2e8f0', borderRadius:'99px', height:'14px', overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:'99px',
                width:`${result.risk_score}%`,
                background: riskBarColor(result.risk_score),
                transition:'width 0.8s ease',
              }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#94a3b8', marginTop:'4px' }}>
              <span>0 — Low Risk</span>
              <span>45 — Medium</span>
              <span>70 — High Risk — 100</span>
            </div>
          </div>

          {/* Risk Factor Breakdown */}
          <div className="result-card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ marginBottom:'1rem' }}>📊 AI Risk Factor Breakdown</h3>
            <div className="stats-grid">
              {[
                { label:'Stock Coverage',     value:`${result.risk_breakdown?.stock_coverage_days}d`,   color:'#4f46e5', weight:'40%', icon:'📦' },
                { label:'Demand Variability', value:result.risk_breakdown?.demand_variability,           color:'#0891b2', weight:'20%', icon:'📈' },
                { label:'Supplier Score',     value:`${result.risk_breakdown?.supplier_score}/100`,      color:'#059669', weight:'25%', icon:'🏭' },
                { label:'Seasonal Pressure',  value:`×${result.risk_breakdown?.seasonal_pressure}`,     color:'#d97706', weight:'15%', icon:'🌤️' },
              ].map(c => (
                <div className="stat-card" key={c.label} style={{ borderTop:`3px solid ${c.color}` }}>
                  <p className="stat-label">{c.icon} {c.label}</p>
                  <p className="stat-value" style={{ color:c.color }}>{c.value}</p>
                  <p style={{ fontSize:'11px', color:'#94a3b8', marginTop:'4px' }}>
                    Weight: <strong>{c.weight}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier Reliability */}
          {result.supplier && (
            <div className="result-card" style={{ marginBottom:'1.5rem' }}>
              <h3 style={{ marginBottom:'1rem' }}>🏭 Supplier Reliability</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <p className="stat-label">Supplier Name</p>
                  <p style={{ fontWeight:'600', fontSize:'14px', color:'#1e293b', marginTop:'4px' }}>
                    {result.supplier.name}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">Reliability Score</p>
                  <p className="stat-value" style={{
                    color: result.supplier.score >= 90 ? '#059669' :
                           result.supplier.score >= 75 ? '#d97706' : '#dc2626'
                  }}>
                    {result.supplier.score}/100
                  </p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">Avg Delay</p>
                  <p className="stat-value" style={{ color:'#0891b2' }}>
                    {result.supplier.avg_delay_days} days
                  </p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">Reliability</p>
                  <p style={{ fontWeight:'600', fontSize:'13px', color:'#4f46e5', marginTop:'4px' }}>
                    {result.supplier.risk_flag}
                  </p>
                </div>
              </div>

              {/* Supplier score bar */}
              <div style={{ marginTop:'14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#64748b', marginBottom:'4px' }}>
                  <span>Supplier Reliability Score</span>
                  <span><strong>{result.supplier.score}</strong>/100</span>
                </div>
                <div style={{ background:'#e2e8f0', borderRadius:'99px', height:'10px', overflow:'hidden' }}>
                  <div style={{
                    height:'100%', borderRadius:'99px',
                    width:`${result.supplier.score}%`,
                    background: result.supplier.score >= 90 ? '#059669' :
                                result.supplier.score >= 75 ? '#d97706' : '#dc2626',
                    transition:'width 0.8s ease',
                  }} />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* External Signals */}
      {signals && (
        <div className="result-card">
          <h3 style={{ marginBottom:'1rem' }}>🌍 External Signals</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">🌦️ Weather</p>
              <p style={{ fontWeight:'600', fontSize:'14px', color:'#0891b2', marginTop:'4px' }}>
                {signals.weather?.event}
              </p>
              <p style={{ fontSize:'12px', color:'#64748b', marginTop:'4px' }}>
                {signals.weather?.impact} (×{signals.weather?.factor})
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-label">🎉 Festival</p>
              <p style={{ fontWeight:'600', fontSize:'14px', color:'#059669', marginTop:'4px' }}>
                {signals.festival?.event}
              </p>
              <p style={{ fontSize:'12px', color:'#64748b', marginTop:'4px' }}>
                {signals.festival?.impact} (×{signals.festival?.factor})
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-label">🏪 Competitor</p>
              <p style={{ fontWeight:'600', fontSize:'14px', color:'#dc2626', marginTop:'4px' }}>
                {signals.competitor?.name}
              </p>
              <p style={{ fontSize:'12px', color:'#64748b', marginTop:'4px' }}>
                {signals.competitor?.promo} (×{signals.competitor?.factor})
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-label">📊 Combined Factor</p>
              <p style={{ fontWeight:'700', fontSize:'1.6rem', color:'#4f46e5', marginTop:'4px' }}>
                ×{signals.combined_demand_factor}
              </p>
              <p style={{ fontSize:'12px', color:'#64748b', marginTop:'4px' }}>
                {signals.adjusted_demand_note}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}