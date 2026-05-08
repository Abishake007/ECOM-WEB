import React, { useEffect, useState } from 'react';
import axios from '../axios';
import { Container, Table, Badge, Card, Spinner } from 'react-bootstrap';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch orders for the logged-in user using the JWT token in headers
    axios.get('/user/orders')
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Order history fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="order-history-wrapper" style={{ backgroundColor: "#fbfbff", minHeight: "100vh", paddingTop: "110px" }}>
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">Your Order History</h2>
          <Badge bg="primary" className="rounded-pill px-3 py-2">
            Total Orders: {orders.length}
          </Badge>
        </div>

        {orders.length === 0 ? (
          <Card className="border-0 shadow-sm text-center p-5 rounded-4">
            <i className="bi bi-bag-x text-muted mb-3" style={{ fontSize: "3rem" }}></i>
            <h4 className="text-muted">No orders found yet.</h4>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Table hover responsive className="mb-0 align-middle">
              <thead className="table-light">
                <tr className="text-muted small text-uppercase">
                  <th className="ps-4">Order ID</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Shipping Address</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="ps-4 fw-bold">#ORD-{order.id}</td>
                    <td>{new Date(order.orderDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="fw-bold text-dark">
                      {/* Adapts currency based on Indian locale as established in your summary */}
                      {navigator.language.includes('IN') ? '₹' : '$'}
                      {order.totalAmount?.toFixed(2)}
                    </td>
                    <td>
                      <Badge 
                        pill 
                        bg={order.status === 'Completed' ? 'success' : 'info'} 
                        className="px-3"
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="text-muted small text-truncate" style={{ maxWidth: "200px" }}>
                      {order.shippingAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default UserOrders;