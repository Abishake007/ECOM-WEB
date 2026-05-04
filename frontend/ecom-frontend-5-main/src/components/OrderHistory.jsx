import React, { useEffect, useState } from 'react';
import axios from '../axios';
import { Container, Table, Badge, Card, Spinner } from 'react-bootstrap';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetches orders for the logged-in user using the JWT token in headers
    axios.get('/api/user/orders')
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading your purchase history...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5 mb-5">
      <h3 className="mb-4">Your Orders</h3>
      {orders.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <h5>No orders found.</h5>
            <p className="text-muted">Once you make a purchase, it will appear here.</p>
          </Card.Body>
        </Card>
      ) : (
        <Table responsive hover className="shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Shipping Address</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#ORD-{order.id}</td>
                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                <td style={{ maxWidth: '200px' }} className="text-truncate">
                  {order.shippingAddress}
                </td>
                <td>{order.phoneNumber}</td>
                <td>
                  <Badge bg={order.status === 'Delivered' ? 'success' : 'warning'} text="dark">
                    {order.status.toUpperCase()}
                  </Badge>
                </td>
                <td>
                  <strong>
                    {/* Symbol automatically adapts based on your location logic */}
                    {navigator.language.includes('IN') ? '₹' : '$'}
                    {order.totalAmount}
                  </strong>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default OrderHistory;