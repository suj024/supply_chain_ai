import React, { useEffect, useState } from 'react';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/suppliers')
      .then(r => r.json())
      .then(data => {
        setSuppliers(data.suppliers);
        setLoading(false);
      })
      .catch(() => {
        setSuppliers([
          { product: 'Laptop',     supplier: 'Dell Supplies India',    reliability: 'Good',      score: 82, avg_delay: 2, status: 'Active'   },
          { product: 'Mobile',     supplier: 'Samsung Distributors',   reliability: 'Excellent', score: 91, avg_delay: 1, status: 'Active'   },
          { product: 'Tablet',     supplier: 'Apple India Logistics',  reliability: 'Excellent', score: 88, avg_delay: 1, status: 'Active'   },
          { product: 'Headphones', supplier: 'Boat Warehouse',         reliability: 'Average',   score: 74, avg_delay: 3, status: 'Active'   },
          { product: 'Smartwatch', supplier: 'Noise Tech Supplies',    reliability: 'Average',   score: 70, avg_delay: 4, status: 'Active'   },
          { product: 'Keyboard',   supplier: 'Logitech India Hub',     reliability: 'Excellent', score: 95, avg_delay: 1, status: 'Active'   },
          { product: 'Monitor',    supplier: 'LG Electronics India',   reliability: 'Good',      score: 85, avg_delay: 2, status: 'Active'   },
          { product: 'Mouse',      supplier: 'HP Accessories India',   reliability: 'Excellent', score: 90, avg_delay: 1, status: 'Active'   },
          { product: 'Printer',    supplier: 'Canon India Warehouse',  reliability: 'Poor',      score: 65, avg_delay: 5, status: 'Inactive' },
          { product: 'Speaker',    supplier: 'JBL India Logistics',    reliability: 'Average',   score: 78, avg_delay: 3, status: 'Active'   },
        ]);
        setLoading(false);
      });
  }, []);

  const activeCount   = suppliers.filter(s => s.status === 'Active').length;
  const excellentCount = suppliers.filter(s => s.reliability === 'Excellent').length;
  const poorCount     = suppliers.filter(s => s.reliability === 'Poor').length;

  const scoreColor = (score) =>
    score >= 90 ? '#059669' : score >= 75 ? '#d97706' : '#dc2626';

  const reliabilityBadge = (r) =>
    r === 'Excellent' ? 'badge-success' :
    r === 'Good'      ? 'badge-success' :
    r === 'Average'   ? 'badge-warning' : 'badge-danger';

  if (loading) return (
    <div className="page">
      <h2 className="page-title">🏭 Supplier Management</h2>
      <p style={{ color: '#64748b' }}>Loading suppliers...</p>
    </div>
  );

  return (
    <div className="page">
      <h2 className="page-title">🏭 Supplier Management</h2>

      {/* STATS */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <p className="stat-label">Total Suppliers</p>
          <p className="stat-value" style={{ color: '#4f46e5' }}>{suppliers.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Active Suppliers</p>
          <p className="stat-value" style={{ color: '#059669' }}>{activeCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Excellent Reliability</p>
          <p className="stat-value" style={{ color: '#0891b2' }}>{excellentCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Poor Reliability</p>
          <p className="stat-value" style={{ color: '#dc2626' }}>{poorCount}</p>
        </div>
      </div>

      {/* TABLE */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Supplier Name</th>
            <th>Score</th>
            <th>Reliability</th>
            <th>Avg Delay</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s, i) => (
            <tr key={i}>
              <td><strong>{s.product}</strong></td>
              <td>{s.supplier}</td>
              <td>
                <span style={{ fontWeight: '700', color: scoreColor(s.score) }}>
                  {s.score}/100
                </span>
              </td>
              <td>
                <span className={`badge ${reliabilityBadge(s.reliability)}`}>
                  {s.reliability}
                </span>
              </td>
              <td>{s.avg_delay} days</td>
              <td>
                <span className={`badge ${s.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                  {s.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}