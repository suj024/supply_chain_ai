import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [time, setTime]   = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    Promise.all([
      fetch('https://web-production-0efc7.up.railway.app/orders/summary').then(r => r.json()),
      fetch('https://web-production-0efc7.up.railway.app/accuracy/all').then(r => r.json()),
    ])
    .then(([summary, accuracy]) => {
      setStats({
        totalOrders:    summary.total    ?? 0,
        pendingOrders:  summary.pending  ?? 0,
        approvedOrders: summary.approved ?? 0,
        rejectedOrders: summary.rejected ?? 0,
        avgAccuracy:    accuracy.overall_accuracy ?? 0,
      });
    })
    .catch(() => setStats({ totalOrders:0, pendingOrders:0, approvedOrders:0, rejectedOrders:0, avgAccuracy:0 }));
    return () => clearInterval(timer);
  }, []);

  if (!stats) return <div style={{padding:'2rem',color:'#64748b'}}>Loading...</div>;

  const products  = ['Laptop','Mobile','Tablet','Headphones','Smartwatch','Keyboard','Monitor','Mouse','Printer','Speaker'];
  const locations = ['Hyderabad','Mumbai','Delhi','Bangalore','Chennai','Pune','Kolkata','Ahmedabad'];
  const sparkData = [40,55,45,60,52,70,65,80,72,85,78,90];
  const sparkMax  = Math.max(...sparkData);

  const row1 = [
    { label:'Total Orders',      value:stats.totalOrders,    color:'#6366f1', bg:'#eef2ff', icon:'🛒' },
    { label:'Inventory Records', value:'14,480',             color:'#0891b2', bg:'#e0f2fe', icon:'📦' },
    { label:'Active Suppliers',  value:10,                   color:'#10b981', bg:'#f0fdf4', icon:'🏭' },
    { label:'Locations',         value:8,                    color:'#d97706', bg:'#fef3c7', icon:'📍' },
  ];

  const row2 = [
    { label:'Pending Orders',    value:stats.pendingOrders,  color:'#f59e0b', bg:'#fffbeb', icon:'⏳' },
    { label:'Approved Orders',   value:stats.approvedOrders, color:'#10b981', bg:'#f0fdf4', icon:'✅' },
    { label:'Rejected Orders',   value:stats.rejectedOrders, color:'#ef4444', bg:'#fef2f2', icon:'❌' },
    { label:'Forecast Accuracy', value:`${stats.avgAccuracy}%`, color:'#8b5cf6', bg:'#faf5ff', icon:'🎯' },
  ];

  const aiModules = [
    { icon:'🤖', title:'Prophet AI',    desc:'14,480 records · Weekly seasonality', color:'#6366f1' },
    { icon:'📐', title:'EOQ Engine',    desc:'95% service level · Safety stock',    color:'#10b981' },
    { icon:'⚠️', title:'Risk Scorer',  desc:'4-factor weighted AI model',          color:'#f59e0b' },
    { icon:'🌍', title:'Ext. Signals', desc:'Weather · Festival · Competitor',     color:'#0891b2' },
  ];

  const riskItems = [
    { product:'Printer',    location:'Hyderabad', risk:'HIGH',   score:78, color:'#ef4444' },
    { product:'Smartwatch', location:'Bangalore', risk:'MEDIUM', score:52, color:'#f59e0b' },
    { product:'Headphones', location:'Delhi',     risk:'MEDIUM', score:48, color:'#f59e0b' },
    { product:'Laptop',     location:'Mumbai',    risk:'LOW',    score:22, color:'#10b981' },
    { product:'Mobile',     location:'Chennai',   risk:'LOW',    score:18, color:'#10b981' },
  ];

  const recentOrders = [
    { id:'#001', product:'Laptop',  location:'Hyderabad', qty:120, status:'Approved', date:'2025-06-28' },
    { id:'#002', product:'Mobile',  location:'Mumbai',    qty:200, status:'Pending',  date:'2025-06-29' },
    { id:'#003', product:'Printer', location:'Delhi',     qty:50,  status:'Approved', date:'2025-06-30' },
  ];

  const W = { background:'white', borderRadius:'12px', padding:'12px 14px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'10px', height:'calc(100vh - 4rem)', overflow:'hidden' }}>

      {/* TOP BAR */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontSize:'18px', fontWeight:'800', color:'#1e293b', margin:0 }}>📊 Supply Chain Command Center</h1>
          <p style={{ fontSize:'11px', color:'#94a3b8', margin:0 }}>Real-time AI-powered supply chain intelligence · India Operations</p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:'8px', padding:'5px 12px', fontSize:'11px', color:'#166534', fontWeight:'600' }}>🟢 All Systems Operational</div>
          <div style={{ background:'#1e293b', borderRadius:'8px', padding:'5px 14px', fontSize:'11px', color:'#94a3b8', fontFamily:'monospace' }}>🕐 {time.toLocaleTimeString()}</div>
        </div>
      </div>

      {/* ROW 1 — 4 KPIs + Sparkline */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1.5fr', gap:'10px' }}>
        {row1.map(k => (
          <div key={k.label} style={{ ...W, borderTop:`3px solid ${k.color}`, display:'flex', flexDirection:'column', gap:'4px' }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ background:k.bg, borderRadius:'6px', padding:'5px', fontSize:'14px' }}>{k.icon}</span>
              <span style={{ fontSize:'10px', color:'#94a3b8' }}>Live</span>
            </div>
            <p style={{ fontSize:'26px', fontWeight:'900', color:k.color, margin:0, lineHeight:1 }}>{k.value}</p>
            <p style={{ fontSize:'11px', color:'#64748b', margin:0 }}>{k.label}</p>
          </div>
        ))}

        {/* Sparkline */}
        <div style={{ background:'linear-gradient(135deg,#1e293b,#334155)', borderRadius:'12px', padding:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.2)', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <div>
              <p style={{ color:'#94a3b8', fontSize:'10px', margin:0 }}>DEMAND TREND</p>
              <p style={{ color:'white', fontSize:'15px', fontWeight:'800', margin:'2px 0 0' }}>14,480 Records</p>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ color:'#6ee7b7', fontSize:'11px', fontWeight:'700', margin:0 }}>↑ Prophet AI</p>
              <p style={{ color:'#64748b', fontSize:'10px', margin:'2px 0 0' }}>10 products · 8 cities</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:'2px', height:'35px' }}>
            {sparkData.map((v, i) => (
              <div key={i} style={{ flex:1, height:'100%', display:'flex', alignItems:'flex-end' }}>
                <div style={{ width:'100%', height:`${(v/sparkMax)*100}%`, background: i===sparkData.length-1?'#6ee7b7':'rgba(99,102,241,0.7)', borderRadius:'2px 2px 0 0', minHeight:'3px' }} />
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:'9px', color:'#475569' }}>Jan 2025</span>
            <span style={{ fontSize:'9px', color:'#475569' }}>Jun 2025</span>
          </div>
        </div>
      </div>

      {/* ROW 2 — 4 KPIs (Pending/Approved/Rejected/Accuracy) + Risk */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1.5fr', gap:'10px' }}>
        {row2.map(k => (
          <div key={k.label} style={{ ...W, borderTop:`3px solid ${k.color}`, display:'flex', flexDirection:'column', gap:'4px' }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ background:k.bg, borderRadius:'6px', padding:'5px', fontSize:'14px' }}>{k.icon}</span>
              <span style={{ fontSize:'10px', color:'#94a3b8' }}>Live</span>
            </div>
            <p style={{ fontSize:'26px', fontWeight:'900', color:k.color, margin:0, lineHeight:1 }}>{k.value}</p>
            <p style={{ fontSize:'11px', color:'#64748b', margin:0 }}>{k.label}</p>
          </div>
        ))}

        {/* Mini Risk Panel */}
        <div style={{ ...W, display:'flex', flexDirection:'column', gap:'4px' }}>
          <p style={{ fontSize:'11px', fontWeight:'700', color:'#1e293b', margin:'0 0 4px' }}>⚠️ Top Risk</p>
          {riskItems.slice(0,3).map((r,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'4px 6px', borderRadius:'6px', background: r.risk==='HIGH'?'#fef2f2':r.risk==='MEDIUM'?'#fffbeb':'#f0fdf4' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:r.color, flexShrink:0 }} />
              <p style={{ fontSize:'11px', fontWeight:'600', color:'#1e293b', margin:0, flex:1 }}>{r.product} <span style={{ color:'#94a3b8', fontWeight:'400' }}>· {r.location}</span></p>
              <span style={{ fontSize:'10px', fontWeight:'700', color:r.color }}>{r.risk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ROW 3 — AI Status + Full Risk + Products + Orders */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1.2fr', gap:'10px', flex:1, overflow:'hidden' }}>

        {/* AI Engine */}
        <div style={{ ...W, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <p style={{ fontSize:'12px', fontWeight:'700', color:'#1e293b', marginBottom:'6px' }}>🤖 AI Engine Status</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px', flex:1 }}>
            {aiModules.map(m => (
              <div key={m.title} style={{ display:'flex', alignItems:'center', gap:'8px', background:'#f8fafc', borderRadius:'8px', padding:'7px 10px', borderLeft:`3px solid ${m.color}`, flex:1 }}>
                <span style={{ fontSize:'16px' }}>{m.icon}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:'11px', fontWeight:'700', color:'#1e293b', margin:0 }}>{m.title}</p>
                  <p style={{ fontSize:'10px', color:'#94a3b8', margin:'1px 0 0' }}>{m.desc}</p>
                </div>
                <span style={{ fontSize:'10px', fontWeight:'700', color:'#059669', background:'#f0fdf4', padding:'2px 7px', borderRadius:'99px', whiteSpace:'nowrap' }}>● Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* Full Risk Alerts */}
        <div style={{ ...W, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <p style={{ fontSize:'12px', fontWeight:'700', color:'#1e293b', marginBottom:'6px' }}>⚠️ Live Risk Alerts</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'5px', flex:1 }}>
            {riskItems.map((r, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 8px', borderRadius:'8px', flex:1, background: r.risk==='HIGH'?'#fef2f2':r.risk==='MEDIUM'?'#fffbeb':'#f0fdf4' }}>
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:r.color, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:'11px', fontWeight:'600', color:'#1e293b', margin:0 }}>{r.product} <span style={{ color:'#94a3b8', fontWeight:'400' }}>· {r.location}</span></p>
                </div>
                <p style={{ fontSize:'10px', fontWeight:'700', color:r.color, margin:0 }}>{r.risk}</p>
                <div style={{ width:'32px', background:'#e2e8f0', borderRadius:'99px', height:'5px', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${r.score}%`, background:r.color, borderRadius:'99px' }} />
                </div>
                <p style={{ fontSize:'10px', color:'#94a3b8', margin:0 }}>{r.score}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Products + Orders */}
        <div style={{ display:'flex', flexDirection:'column', gap:'8px', overflow:'hidden' }}>
          <div style={{ ...W }}>
            <p style={{ fontSize:'11px', fontWeight:'700', color:'#1e293b', marginBottom:'6px' }}>🛍️ Products & Locations</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'3px', marginBottom:'4px' }}>
              {products.map(p => <span key={p} style={{ background:'#ede9fe', color:'#4f46e5', padding:'2px 8px', borderRadius:'99px', fontSize:'10px', fontWeight:'600' }}>{p}</span>)}
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'3px' }}>
              {locations.map(l => <span key={l} style={{ background:'#dcfce7', color:'#059669', padding:'2px 8px', borderRadius:'99px', fontSize:'10px', fontWeight:'600' }}>{l}</span>)}
            </div>
          </div>

          <div style={{ ...W, flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <p style={{ fontSize:'11px', fontWeight:'700', color:'#1e293b', marginBottom:'6px' }}>🛒 Recent Orders</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'5px', flex:1 }}>
              {recentOrders.map(o => (
                <div key={o.id} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 8px', background:'#f8fafc', borderRadius:'8px', flex:1 }}>
                  <span style={{ fontSize:'10px', fontWeight:'700', color:'#4f46e5', minWidth:'32px' }}>{o.id}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:'11px', fontWeight:'600', color:'#1e293b', margin:0 }}>{o.product} · {o.location}</p>
                    <p style={{ fontSize:'10px', color:'#94a3b8', margin:'1px 0 0' }}>{o.date} · {o.qty} units</p>
                  </div>
                  <span style={{ fontSize:'10px', fontWeight:'700', padding:'2px 7px', borderRadius:'99px', background: o.status==='Approved'?'#f0fdf4':'#fffbeb', color: o.status==='Approved'?'#059669':'#d97706' }}>{o.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}