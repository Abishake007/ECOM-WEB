import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { Table, Badge, Spinner } from 'react-bootstrap';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/admin/orders')
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching admin orders:", err);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status) => {
    const style = { borderRadius: '0px', letterSpacing: '1px', fontWeight: '900' };
    switch (status?.toLowerCase()) {
      case 'completed': return <Badge style={style} bg="dark">COMPLETED</Badge>;
      case 'pending': return <Badge style={style} bg="secondary">PENDING</Badge>;
      case 'cancelled': return <Badge style={style} bg="danger">CANCELLED</Badge>;
      default: return <Badge style={style} bg="dark">PROCESSING</Badge>;
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await axios.put(`/admin/orders/${id}/status`, { status });
      setOrders(current => current.map(order => order.id === id ? response.data : order));
    } catch (error) { window.alert(error.response?.data || "Could not update order status."); }
  };

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="dark" />
      <p className="mt-3 Oswald-font fw-black text-uppercase">Accessing Records...</p>
    </div>
  );

  return (
    <div className="admin-orders-container">
      <div className="d-flex justify-content-between align-items-end border-bottom border-dark pb-3 mb-4">
        <h3 className="fw-black text-uppercase mb-0 Oswald-font" style={{ letterSpacing: '1px' }}>
          Customer Orders
        </h3>
        <span className="Oswald-font fw-bold text-muted small text-uppercase">
          {orders.length} Total Transactions
        </span>
      </div>

      <div className="border border-dark bg-white">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="bg-dark text-white">
            <tr className="Oswald-font small text-uppercase" style={{ letterSpacing: '1px' }}>
              <th className="ps-4 py-3 border-0">Order ID</th>
              <th className="border-0">Customer</th>
              <th className="border-0">Date</th>
              <th className="border-0">Amount</th>
              <th className="border-0">Payment</th>
              <th className="border-0">Status</th>
              <th className="text-center border-0 pe-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-5 Oswald-font fw-bold text-muted text-uppercase">
                  No orders found in the system.
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="border-bottom border-light">
                  <td className="ps-4 fw-black Oswald-font">#ORD-{order.id}</td>
                  <td>
                    <div className="d-flex flex-column">
                      <span className="fw-black text-uppercase small Oswald-font">{order.user?.username}</span>
                      <small className="text-muted" style={{ fontSize: '10px' }}>{order.user?.email}</small>
                    </div>
                  </td>
                  <td className="small fw-bold">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="fw-black Oswald-font">₹{order.totalAmount?.toFixed(2)}</td>
                  <td><Badge bg={order.paymentMethod === 'COD' ? 'warning' : 'dark'} text={order.paymentMethod === 'COD' ? 'dark' : undefined}>{order.paymentMethod === 'COD' ? 'CASH ON DELIVERY' : 'ONLINE'}</Badge></td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td className="text-center pe-4">
                    <select aria-label={`Update order ${order.id} delivery status`} className="form-select form-select-sm" value={order.status?.toUpperCase() || "PROCESSING"} onChange={event => updateStatus(order.id, event.target.value)}>
                      {["PENDING", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map(status => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .Oswald-font { font-family: 'Oswald', sans-serif; }
        .table-hover tbody tr:hover {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </div>
  );
};

export default AdminOrders;
