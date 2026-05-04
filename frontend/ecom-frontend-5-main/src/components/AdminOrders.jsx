import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { Table, Badge, Spinner, Card } from 'react-bootstrap';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetches all customer orders via the secure Admin route
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

  // Helper to provide color-coded status feedback
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <Badge pill bg="success">Completed</Badge>;
      case 'pending': return <Badge pill bg="warning" text="dark">Pending</Badge>;
      case 'cancelled': return <Badge pill bg="danger">Cancelled</Badge>;
      default: return <Badge pill bg="secondary">{status || 'Processing'}</Badge>;
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2 text-muted">Loading order records...</p>
    </div>
  );

  return (
    <div className="admin-orders-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Customer Orders</h3>
        <Badge bg="primary" className="p-2 px-3 rounded-pill">Total Orders: {orders.length}</Badge>
      </div>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="table-light">
            <tr className="text-muted small text-uppercase">
              <th className="ps-4">Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">No orders found in the system.</td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id}>
                  <td className="ps-4 fw-bold">#ORD-{order.id}</td>
                  <td>
                    <div className="d-flex flex-column">
                      <span className="fw-semibold">{order.user?.username}</span>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>{order.user?.email}</small>
                    </div>
                  </td>
                  <td>{new Date(order.orderDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td className="fw-bold text-dark">${order.totalAmount?.toFixed(2)}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-primary rounded-pill px-3">
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminOrders;