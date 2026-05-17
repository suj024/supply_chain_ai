import React, { useState } from 'react';

const PRODUCTS = ['Laptop','Mobile','Tablet','Headphones','Smartwatch','Keyboard','Monitor','Mouse','Printer','Speaker'];
const LOCATIONS = ['Hyderabad','Mumbai','Delhi','Bangalore','Chennai','Pune','Kolkata','Ahmedabad'];

export default function Forecast() {
  const [product,    setProduct]    = useState('Laptop');
  const [location,   setLocation]   = useState('Hyderabad');
  const [days,       setDays]       = useState(30);
  const [forecasts,  setForecasts]  = useState([]);
  const [forecastCi, setForecastCi] = useState([]);
  const [summary,    setSummary]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [showCI,     setShowCI]     = useState(true);
  const [model,      setModel]      = useState('');

  const getForecast = () => {
    setLoading(true); setForecasts([]); setSummary(null);
    fetch(`http://127.0.0.1:8000/forecast?product_id=${product}&location=${location}&days=${days}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { alert('Error: ' + data.error); setLoading(false); return; }
        setForecasts(data.forecast     || []);
        setForecastCi(data.forecast_ci || []);
        setSummary(data.summary        || null);
        setModel(data.model            || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const max       = forecastCi.length > 0 ? Math.max(...forecastCi.map(d => d.upper || d.value)) : 1;
  const labelStep = days <= 7 ? 1 : days <= 30 ? 5 : days <= 60 ? 10 : 15;

  return (
    <div className="page">
      <h2 className="page-title">📈 Demand Forecast</h2>

      {model && (
        <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'#ede9fe', borderRadius:'20px', padding:'4px 14px', marginBottom:'1rem', fontSize:'12px', color:'#4f46e5', fontWeight:'600' }}>
          🤖 {model}
        </div>
      )}

      {/* Controls */}
      <div className="form-row">
        <select className="select-input" value={product} onChange={e => { setProduct(e.target.value); setForecasts([]); }}>
          {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="select-input" value={location} onChange={e => { setLocation(e.target.value); setForecasts([]); }}>
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <div style={{ display:'flex', gap:'6px' }}>
          {[7,30,60,90].map(d => (
            <button key={d} onClick={() => setDays(d)} style={{
              padding:'8px 14px', borderRadius:'8px', border:'1px solid #cbd5e1',
              background: days===d ? '#4f46e5' : 'white',
              color:      days===d ? 'white'   : '#1e293b',
              cursor:'pointer', fontSize:'13px', fontWeight: days===d ? '600' : '400',
            }}>{d}d</button>
          ))}
        </div>
        <button className="btn-primary" onClick={getForecast} disabled={loading}>
          {loading ? 'Forecasting...' : 'Get Forecast'}
        </button>
        {forecasts.length > 0 && (
          <button onClick={() => setShowCI(!showCI)} style={{
            padding:'8px 14px', borderRadius:'8px', border:'1px solid #cbd5e1',
            background: showCI ? '#0891b2' : 'white',
            color:      showCI ? 'white'   : '#1e293b',
            cursor:'pointer', fontSize:'13px',
          }}>{showCI ? '✅ CI On' : 'Show CI'}</button>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="stats-grid" style={{ marginBottom:'1.5rem' }}>
          {[
            { label:'Avg / day',                value:summary.avg,   color:'#4f46e5' },
            { label:'Peak demand',              value:summary.peak,  color:'#059669' },
            { label:'Lowest demand',            value:summary.low,   color:'#d97706' },
            { label:`Total ${days}-day demand`, value:summary.total, color:'#0891b2' },
          ].map(c => (
            <div className="stat-card" key={c.label}>
              <p className="stat-label">{c.label}</p>
              <p className="stat-value" style={{ color:c.color }}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {forecasts.length > 0 && (
        <div className="result-card" style={{ marginBottom:'1.5rem' }}>
          <p style={{ fontSize:'13px', color:'#64748b', marginBottom:'12px' }}>
            {days}-day forecast — <strong>{product}</strong> in <strong>{location}</strong>
            {showCI && <span style={{ color:'#0891b2', marginLeft:'8px' }}>| Shaded = 95% confidence interval</span>}
          </p>
          <div style={{ display:'flex', alignItems:'flex-end', gap: days>30 ? '2px' : '4px', height:'200px', padding:'0 4px' }}>
            {forecastCi.map((item, index) => {
              const val   = item.value || 0;
              const upper = item.upper || val;
              const lower = item.lower || val;
              return (
                <div key={index}
                  style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', height:'100%', justifyContent:'flex-end' }}
                  title={`Day ${index+1}: ${val} (${lower}–${upper})`}
                >
                  {showCI && <div style={{ width:'100%', height:`${((upper-val)/max)*100}%`, background:'#bfdbfe', borderRadius:'2px 2px 0 0', minWidth:'2px' }} />}
                  <div style={{ width:'100%', height:`${(val/max)*100}%`, background:'#4f46e5', minWidth:'2px', borderRadius: showCI ? '0' : '3px 3px 0 0', transition:'height 0.5s' }} />
                  {showCI && <div style={{ width:'100%', height:`${((val-lower)/max)*100}%`, background:'#bfdbfe', minWidth:'2px' }} />}
                </div>
              );
            })}
          </div>
          {/* X-axis labels */}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:'6px', fontSize:'11px', color:'#94a3b8', padding:'0 4px' }}>
            {forecastCi.map((item, index) => index % labelStep === 0 ? (
              <span key={index}>{item.date ? item.date.slice(5) : `D${index+1}`}</span>
            ) : null)}
          </div>
        </div>
      )}

      {/* Table — only for 7d and 30d */}
      {forecasts.length > 0 && days <= 30 && (
        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Date</th>
                <th>Forecast (units)</th>
                {showCI && <th>Lower (95% CI)</th>}
                {showCI && <th>Upper (95% CI)</th>}
                <th>vs Average</th>
              </tr>
            </thead>
            <tbody>
              {forecastCi.map((item, index) => {
                const diff = item.value - (summary?.avg || 0);
                return (
                  <tr key={index}>
                    <td>Day {index+1}</td>
                    <td>{item.date || '—'}</td>
                    <td><strong>{item.value}</strong></td>
                    {showCI && <td style={{ color:'#0891b2' }}>{item.lower}</td>}
                    {showCI && <td style={{ color:'#0891b2' }}>{item.upper}</td>}
                    <td>
                      <span className={`badge ${diff >= 0 ? 'badge-success' : 'badge-danger'}`}>
                        {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {forecasts.length > 0 && days > 30 && (
        <div className="info-box">
          <p>Showing chart only for {days}-day forecast. Switch to <strong>7d or 30d</strong> for the day-by-day table.</p>
        </div>
      )}
    </div>
  );
}