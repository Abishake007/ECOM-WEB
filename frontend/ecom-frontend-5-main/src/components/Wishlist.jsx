import React, { useEffect, useState, useContext } from 'react';
import API from '../axios';
import AppContext from "../Context/Context";
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import unplugged from "../assets/unplugged.png";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const { addToCart } = useContext(AppContext); 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    API.get('/wishlist') 
      .then(res => {
        setItems(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Wishlist fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId) => {
  try {
    // This call will now automatically include the "Authorization: Bearer <token>" header
    await API.delete(`/wishlist/remove/${productId}`);
    // Update your local state here
  } catch (error) {
    console.error("Error removing from wishlist:", error);
  }
};

  if (loading) return (
    <div className="text-center" style={{ marginTop: "150px" }}>
      <Spinner animation="border" variant="primary" />
      <p className="text-muted mt-2">Opening your collection...</p>
    </div>
  );

  return (
    <div className="wishlist-wrapper" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingTop: "110px" }}>
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">My Wishlist</h2>
          <span className="badge bg-white text-dark border rounded-pill px-3 py-2 shadow-sm">
            {items.length} Saved Items
          </span>
        </div>

        <Row className="g-4">
          {items.length === 0 ? (
            <Col className="text-center py-5">
              <div className="bg-white p-5 rounded-4 shadow-sm">
                <i className="bi bi-heart display-1 text-muted opacity-25"></i>
                <h3 className="mt-3 text-muted">Your wishlist is empty</h3>
                <p className="text-muted mb-4">Save items you love to find them easily later.</p>
                <Link to="/" className="btn btn-primary rounded-pill px-4">Start Exploring</Link>
              </div>
            </Col>
          ) : (
            items.map(item => {
              const product = item.product ? item.product : item;
              
              return (
                <Col xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden position-relative custom-hover-card">
                    {/* Quick Remove Button */}
                    <button 
                      className="btn btn-light btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
                      style={{ zIndex: 5, width: "32px", height: "32px", border: "none" }}
                      onClick={() => removeFromWishlist(item.id)}
                      title="Remove from Wishlist"
                    >
                      <i className="bi bi-x-lg text-danger small"></i>
                    </button>

                    <div className="p-3 bg-white d-flex align-items-center justify-content-center" style={{ height: "180px" }}>
                      <Card.Img 
                        variant="top"
                        src={product.imageData ? `data:${product.imageType};base64,${product.imageData}` : unplugged} 
                        style={{ maxHeight: "100%", width: "auto", objectFit: "contain" }}
                      />
                    </div>

                    <Card.Body className="d-flex flex-column pt-0">
                      <div className="mb-2">
                        <small className="text-primary fw-bold text-uppercase" style={{ fontSize: "0.7rem" }}>{product.brand}</small>
                        <Card.Title className="fs-6 fw-bold mb-1 text-truncate" title={product.name}>
                          {product.name?.toUpperCase()}
                        </Card.Title>
                      </div>
                      
                      <div className="mt-auto">
                        <h5 className="fw-bold text-dark mb-3">${product.price}</h5>
                        <Button 
                          variant="primary" 
                          className="w-100 rounded-pill py-2 fw-bold" 
                          style={{ backgroundColor: "#764ba2", border: "none", fontSize: "0.85rem" }}
                          onClick={() => {
                            addToCart(product);
                            alert(`${product.name} added to cart!`);
                          }}
                        >
                          <i className="bi bi-cart-plus me-1"></i> Add to Cart
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })
          )}
        </Row>
      </Container>
    </div>
  );
};

export default Wishlist;