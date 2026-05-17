import React, { useState } from 'react';

const PRODUCTS = ['Laptop','Mobile','Tablet','Headphones','Smartwatch','Keyboard','Monitor','Mouse','Printer','Speaker'];
const LOCATIONS = ['Hyderabad','Mumbai','Delhi','Bangalore','Chennai','Pune','Kolkata','Ahmedabad'];

export default function Accuracy() {
  const [product,   setProduct]   = useState('Laptop');
  const [location,  setLocation]  = useState('Hyderabad');
  const [records,   setRecords]   = useState([]);
  const [date,      setDate]      = useState('');
  const [actual,    setActual]    = useState('');
  const [predicted, setPredicted] = useState('');
  const [message,   setMessage]   = useState('');
  const [summary,   setSummary]   = useState(null);
  const [loading,   setLoading]   = useState(false);

  const logEntry = () => {
    if (!date || !actual || !predicted) {
      setMessage('⚠️ Please fill all fields.');
      return;
    }
    fetch('https://web-production-0efc7.up.railway.app/accuracy/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: product,
        location:   location,
        date,
        actual:     parseFloat(actual),
        predicted:  parseFloat(predicted),
      }),
    })
    .then(() => {
      setMessage('✅ Logged successfully!');
      setDate(''); setActual(''); setPredicted('');
      fetchReport();
    })
    .catch(() => setMessage('❌ Error logging entry.'));
  };

  const fetchReport = () => {
    setLoading(true);
    fetch(`https://web-production-0efc7.up.railway.app/accuracy/report?product_id=${product}&location=${location}`)
      .then(r => r.json())
      .then(data => {
        if (data.records && data.records.length > 0) {
          setRecords(data.records);
          setSummary({
            total:       data.total_records,
            avgAccuracy: data.avg_accuracy,
            avgError:    (data.records.reduce((s, r) => s + r.error, 0) / data.records.length).toFixed(2),
            bestDay:     data.records.reduce((a, b) => {
              const accA = Math.max(0, 100 - (a.error / a.actual) * 100);
              const accB = Math.max(0, 100 - (b.error / b.actual) * 100);
              return accA > accB ? a : b;
            }),
          });
          setMessage(`✅ Found ${data.total_records} records.`);
        } else {
          setRecords([]);
          setSummary(null);
          setMessage('⚠️ No records found. Log some data first.');
        }
        setLoading(false);
      })
      .catch(() => { setMessage('❌ Error fetching report.'); setLoading(false); });
  };

  const clearAll = () => {
    fetch('https://web-production-0efc7.up.railway.app/accuracy/clear', { method: 'DELETE' })
      .then(() => { setRecords([]); setSummary(null); setMessage('🗑️ All records cleared.'); })
      .catch(() => setMessage('❌ Error clearing records.'));
  };

  const getAccuracy = (actual, error) => Math.max(0, 100 - (error / actual) * 100).toFixed(1);
  const getAccuracyColor = (acc) => acc >= 90 ? '#059669' : acc >= 75 ? '#d97706' : '#dc2626';

  return (
    <div className="page">
      <h2 className="page-title">📊 Forecast Accuracy Tracker</h2>

      <div style={{
        background:'#ede9fe', border:'1px solid #c4b5fd',
        borderRadius:'10px', padding:'12px 16px', marginBottom:'1.5rem',
        fontSize:'13px', color:'#4c1d95',
      }}>
        🎯 Log actual vs predicted sales to measure how accurate the Prophet AI forecasts are over time.
      </div>

      {/* Log Form */}
      <div className="result-card" style={{ marginBottom:'1.5rem' }}>
        <h3 style={{ marginBottom:'1rem' }}>📝 Log Actual vs Predicted</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
          <div>
            <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px' }}>Product</label>
            <select className="select-input" value={product} onChange={e => { setProduct(e.target.value); setRecords([]); setSummary(null); }}>
              {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px' }}>Location</label>
            <select className="select-input" value={location} onChange={e => { setLocation(e.target.value); setRecords([]); setSummary(null); }}>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px' }}>Date</label>
            <input
              type="date"
              className="select-input"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px' }}>Actual Sales</label>
            <input
              type="number"
              className="number-input"
              placeholder="e.g. 65"
              value={actual}
              onChange={e => setActual(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'6px' }}>Predicted Sales</label>
            <input
              type="number"
              className="number-input"
              placeholder="e.g. 60"
              value={predicted}
              onChange={e => setPredicted(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
          <button className="btn-primary" onClick={logEntry}>
            📝 Log Entry
          </button>
          <button
            className="btn-primary"
            style={{ background:'#0891b2' }}
            onClick={fetchReport}
            disabled={loading}
          >
            {loading ? 'Loading...' : '📊 View Report'}
          </button>
          <button
            className="btn-primary"
            style={{ background:'#dc2626' }}
            onClick={clearAll}
          >
            🗑️ Clear All
          </button>
        </div>

        {message && (
          <p style={{
            marginTop:'12px', fontSize:'13px', fontWeight:'500',
            color: message.startsWith('✅') ? '#059669' :
                   message.startsWith('❌') ? '#dc2626' : '#d97706',
          }}>
            {message}
          </p>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="stats-grid" style={{ marginBottom:'1.5rem' }}>
          {[
            { label:'Total Records',    value: summary.total,                                          color:'#4f46e5' },
            { label:'Avg Accuracy',     value: `${summary.avgAccuracy}%`,                              color: getAccuracyColor(summary.avgAccuracy) },
            { label:'Avg Error',        value: summary.avgError,                                       color:'#d97706' },
            { label:'Best Day',         value: summary.bestDay ? summary.bestDay.date : '—',           color:'#059669' },
          ].map(c => (
            <div className="stat-card" key={c.label}>
              <p className="stat-label">{c.label}</p>
              <p className="stat-value" style={{ color:c.color }}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Accuracy Meter */}
      {summary && (
        <div className="result-card" style={{ marginBottom:'1.5rem' }}>
          <h3 style={{ marginBottom:'14px' }}>🎯 Overall Accuracy Meter</h3>
          <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
            <div style={{
              width:'80px', height:'80px', borderRadius:'50%',
              border:`5px solid ${getAccuracyColor(summary.avgAccuracy)}`,
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
              background: summary.avgAccuracy >= 90 ? '#f0fdf4' :
                          summary.avgAccuracy >= 75 ? '#fffbeb' : '#fef2f2',
              flexShrink:0,
            }}>
              <span style={{ fontSize:'18px', fontWeight:'800', color: getAccuracyColor(summary.avgAccuracy) }}>
                {summary.avgAccuracy}%
              </span>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ background:'#e2e8f0', borderRadius:'99px', height:'14px', overflow:'hidden' }}>
                <div style={{
                  height:'100%', borderRadius:'99px',
                  width:`${summary.avgAccuracy}%`,
                  background: getAccuracyColor(summary.avgAccuracy),
                  transition:'width 0.8s ease',
                }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#94a3b8', marginTop:'4px' }}>
                <span>0%</span>
                <span>75% — Good</span>
                <span>90% — Excellent — 100%</span>
              </div>
              <p style={{ fontSize:'13px', color:'#64748b', marginTop:'8px' }}>
                {summary.avgAccuracy >= 90 ? '🟢 Excellent — Prophet AI is highly accurate for this product.' :
                 summary.avgAccuracy >= 75 ? '🟡 Good — Minor deviations. Log more data to improve.' :
                 '🔴 Needs improvement — Consider adding more historical data.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Records Table */}
      {records.length > 0 && (
        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Actual</th>
                <th>Predicted</th>
                <th>Error</th>
                <th>Accuracy</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => {
                const acc = parseFloat(getAccuracy(r.actual, r.error));
                return (
                  <tr key={i}>
                    <td>{r.date}</td>
                    <td><strong>{r.actual}</strong></td>
                    <td>{r.predicted}</td>
                    <td>
                      <span className={`badge ${r.error > 10 ? 'badge-danger' : 'badge-success'}`}>
                        {r.error}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${acc >= 90 ? 'badge-success' : acc >= 75 ? 'badge-warning' : 'badge-danger'}`}>
                        {acc}%
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize:'13px' }}>
                        {acc >= 90 ? '🟢 Excellent' : acc >= 75 ? '🟡 Good' : '🔴 Poor'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}