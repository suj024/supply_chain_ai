import React, { useState, useEffect } from 'react';

const products = [
  { id: 'Laptop',      location: 'Hyderabad' },
  { id: 'Laptop',      location: 'Mumbai' },
  { id: 'Laptop',      location: 'Delhi' },
  { id: 'Laptop',      location: 'Bangalore' },
  { id: 'Laptop',      location: 'Chennai' },
  { id: 'Mobile',      location: 'Hyderabad' },
  { id: 'Mobile',      location: 'Mumbai' },
  { id: 'Mobile',      location: 'Delhi' },
  { id: 'Mobile',      location: 'Bangalore' },
  { id: 'Mobile',      location: 'Chennai' },
  { id: 'Tablet',      location: 'Hyderabad' },
  { id: 'Tablet',      location: 'Mumbai' },
  { id: 'Headphones',  location: 'Hyderabad' },
  { id: 'Headphones',  location: 'Delhi' },
  { id: 'Smartwatch',  location: 'Hyderabad' },
  { id: 'Smartwatch',  location: 'Bangalore' },
  { id: 'Keyboard',    location: 'Mumbai' },
  { id: 'Keyboard',    location: 'Pune' },
  { id: 'Monitor',     location: 'Delhi' },
  { id: 'Monitor',     location: 'Kolkata' },
  { id: 'Mouse',       location: 'Chennai' },
  { id: 'Mouse',       location: 'Ahmedabad' },
  { id: 'Printer',     location: 'Hyderabad' },
  { id: 'Speaker',     location: 'Mumbai' },
];

export default function Procurement() {
  const [orders, setOrders]             = useState([]);
  const [selected, setSelected]         = useState(products[0]);
  const [quantity, setQuantity]         = useState(100);
  const [date, setDate]                 = useState('');
  const [reason, setReason]             = useState('');
  const [loading, setLoading]           = useState(false);
  const [message, setMessage]           = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editDate, setEditDate]         = useState('');
  const [editReason, setEditReason]     = useState('');

  const fetchOrders = () => {
    fetch('http://localhost:8000/orders/list')
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => setOrders([]));
  };

  useEffect(() => { fetchOrders(); }, []);

  const createOrder = () => {
    if (!date || !reason) {
      setMessage('Please fill date and reason.');
      return;
    }
    setLoading(true);
    fetch('http://localhost:8000/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id:     selected.id,
        location:       selected.location,
        quantity:       parseInt(quantity),
        suggested_date: date,
        reason:         reason,
      }),
    })
      .then((r) => r.json())
      .then(() => {
        setMessage('✅ Order created!');
        setLoading(false);
        setDate('');
        setReason('');
        fetchOrders();
      })
      .catch(() => { setMessage('Error creating order.'); setLoading(false); });
  };

  const updateStatus = (orderId, action) => {
    fetch(`http://localhost:8000/orders/${orderId}/${action}`, { method: 'PUT' })
      .then((r) => r.json())
      .then(() => fetchOrders());
  };

  const deleteOrder = (orderId) => {
  if (window.confirm('Are you sure you want to delete this order?')) {
    fetch(`http://localhost:8000/orders/${orderId}/delete`, { method: 'DELETE' })
      .then((r) => r.json())
      .then(() => {
        setMessage('🗑️ Order deleted!');
        fetchOrders();
      })
      .catch(() => setMessage('Error deleting order.'));
  }
};

  const startEdit = (order) => {
    setEditingOrder(order.id);
    setEditQuantity(order.quantity);
    setEditDate(order.suggested_date);
    setEditReason(order.reason);
  };

  const saveEdit = (order) => {
    fetch(`http://localhost:8000/orders/${order.id}/edit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id:     order.product_id,
        location:       order.location,
        quantity:       parseInt(editQuantity),
        suggested_date: editDate,
        reason:         editReason,
      }),
    })
      .then((r) => r.json())
      .then(() => {
        setEditingOrder(null);
        setMessage('✅ Order updated!');
        fetchOrders();
      })
      .catch(() => setMessage('Error updating order.'));
  };

  const statusColor = {
    Pending:  'badge-warning',
    Approved: 'badge-success',
    Rejected: 'badge-danger',
  };

  return (
    <div className="page">
      <h2 className="page-title">🛒 Procurement Workflow</h2>

      {/* CREATE ORDER FORM */}
      <div className="result-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Create Purchase Order</h3>

        <div className="form-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <select
            className="select-input"
            onChange={(e) => setSelected(products[e.target.value])}
          >
            {products.map((p, i) => (
              <option key={i} value={i}>{p.id} — {p.location}</option>
            ))}
          </select>

          <input
            type="number"
            className="number-input"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity"
          />

          <input
            type="date"
            className="select-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            className="search-input"
            style={{ maxWidth: '100%' }}
            placeholder="Reason (e.g. Low stock alert for Laptop)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={createOrder} disabled={loading}>
          {loading ? 'Creating...' : '+ Create Order'}
        </button>

        {message && (
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#059669' }}>{message}</p>
        )}
      </div>

      {/* ORDERS TABLE */}
      <h3 style={{ marginBottom: '1rem', fontSize: '16px', color: '#1e293b' }}>
        All Purchase Orders ({orders.length})
      </h3>

      {orders.length === 0 ? (
        <div className="info-box">
          <p>No orders yet. Create one above.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product</th>
              <th>Location</th>
              <th>Quantity</th>
              <th>Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td><code>{order.id}</code></td>
                <td>{order.product_id}</td>
                <td>{order.location}</td>

                {editingOrder === order.id ? (
                  <>
                    <td>
                      <input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        style={{ width: '70px', padding: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        style={{ padding: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        style={{ width: '120px', padding: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </td>
                  </>
                ) : (
                  <>
                    <td>{order.quantity}</td>
                    <td>{order.suggested_date}</td>
                    <td style={{ maxWidth: '150px', fontSize: '12px' }}>{order.reason}</td>
                  </>
                )}

                <td>
                  <span className={`badge ${statusColor[order.status]}`}>
                    {order.status}
                  </span>
                </td>

                <td>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {order.status === 'Pending' && editingOrder !== order.id && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, 'approve')}
                          style={{ background: '#059669', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, 'reject')}
                          style={{ background: '#dc2626', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => startEdit(order)}
                          style={{ background: '#d97706', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                        <button
                     onClick={() => deleteOrder(order.id)}
                     style={{ background: '#1e293b', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
              >
                           Delete
                        </button>
                      </>
                    )}
                    {editingOrder === order.id && (
                      <>
                        <button
                          onClick={() => saveEdit(order)}
                          style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingOrder(null)}
                          style={{ background: '#64748b', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}