import React, { useEffect, useState } from 'react';
import axios from '../axios';
import { Container, Row, Col, Badge, Card, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/user/orders')
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
      <Container className="text-center" style={{ marginTop: "150px" }}>
        <Spinner animation="border" variant="warning" />
        <p className="mt-3">Retrieving your marketplace orders...</p>
      </Container>
    );
  }

  return (
    <div className="order-history-wrapper" style={{ backgroundColor: "#eaeded", minHeight: "100vh", paddingTop: "120px", paddingBottom: "50px" }}>
      <Container>
        <h2 className="fw-bold mb-4">Your Orders</h2>

        {orders.length === 0 ? (
          <Card className="text-center p-5 border-0 shadow-sm">
            <Card.Body>
              <h5>No orders found.</h5>
              <p className="text-muted">Once you make a purchase, it will appear here.</p>
              <Link to="/">
                <Button variant="warning" className="rounded-pill fw-bold px-4">Continue Shopping</Button>
              </Link>
            </Card.Body>
          </Card>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <Card key={order.id} className="mb-4 border shadow-sm rounded-3 overflow-hidden">
                {/* Marketplace Order Header */}
                <Card.Header className="bg-light py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center">
                  <div className="d-flex gap-4 small text-uppercase fw-bold text-muted">
                    <div>
                      <div style={{ fontSize: '10px' }}>Order Placed</div>
                      <div className="text-dark">{new Date(order.orderDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px' }}>Total</div>
                      <div className="text-dark">
                        {navigator.language.includes('IN') ? '₹' : '$'}{order.totalAmount}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px' }}>Ship To</div>
                      <div className="text-primary cursor-pointer">Account Holder</div>
                    </div>
                  </div>
                  <div className="text-end small">
                    <div className="text-muted fw-bold text-uppercase" style={{ fontSize: '10px' }}>Order # ORD-{order.id}</div>
                    <Link to="#" className="text-decoration-none">View order details</Link>
                  </div>
                </Card.Header>

                <Card.Body className="p-4 bg-white">
                  <Row className="align-items-center">
                    <Col md={8}>
                      <div className="d-flex align-items-center mb-3">
                        <Badge bg={order.status === 'Delivered' ? 'success' : 'warning'} className="me-2 p-2 px-3">
                          {order.status.toUpperCase()}
                        </Badge>
                        <h5 className="mb-0 fw-bold">Package {order.status === 'Delivered' ? 'arrived' : 'status updated'}</h5>
                      </div>
                      
                      <div className="order-details text-muted small">
                        <p className="mb-1"><i className="bi bi-geo-alt me-2"></i>{order.shippingAddress}</p>
                        <p className="mb-0"><i className="bi bi-telephone me-2"></i>Contact: {order.phoneNumber}</p>
                      </div>
                    </Col>
                    
                    <Col md={4} className="text-md-end mt-3 mt-md-0 d-flex flex-column gap-2">
                      <Button variant="warning" className="w-100 fw-bold rounded-pill" style={{ backgroundColor: "#ffd814", borderColor: "#fcd200" }}>
                        Track Package
                      </Button>
                      <Button variant="outline-dark" className="w-100 fw-bold rounded-pill shadow-sm">
                        Write a product review
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default OrderHistory;