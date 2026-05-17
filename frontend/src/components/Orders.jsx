import React, { useEffect, useState } from 'react';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/orders/list')
      .then((r) => r.json())
      .then(setOrders)
      .catch(() =>
        setOrders([
  { id: 'ORD-001', item: 'Laptop',      qty: 100, date: '2025-05-01', status: 'Delivered'  },
  { id: 'ORD-002', item: 'Mobile',      qty: 50,  date: '2025-05-05', status: 'In Transit' },
  { id: 'ORD-003', item: 'Headphones',  qty: 200, date: '2025-05-10', status: 'Pending'    },
])
      );
  }, []);

  const statusColor = {
    Delivered:   'badge-success',
    'In Transit':'badge-warning',
    Pending:     'badge-neutral',
  };

  return (
    <div className="page">
      <h2 className="page-title">🛒 Orders</h2>

      <table className="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Item</th>
            <th>Quantity</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td><code>{o.id}</code></td>
              <td>{o.item}</td>
              <td>{o.qty}</td>
              <td>{o.date}</td>
              <td>
                <span className={`badge ${statusColor[o.status]}`}>{o.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}