import React, { useEffect, useState, useContext } from 'react';
import API from '../axios';
import AppContext from "../Context/Context";
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
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
      await API.delete(`/wishlist/remove/${productId}`);
      // UPDATE STATE: Remove the item from the local list immediately
      setItems(prevItems => prevItems.filter(item => item.id !== productId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center bg-white" style={{ height: "100vh" }}>
      <div className="text-center">
        <Spinner animation="border" variant="dark" />
        <p className="fw-black text-uppercase mt-3 Oswald-font">Opening your collection...</p>
      </div>
    </div>
  );

  return (
    <div className="wishlist-wrapper bg-white" style={{ minHeight: "100vh", paddingTop: "140px", paddingBottom: "80px" }}>
      <Container>
        {/* Adidas Header Style */}
        <div className="d-flex justify-content-between align-items-end border-bottom border-dark pb-3 mb-5">
          <h1 className="fw-black text-uppercase mb-0 Oswald-font" style={{ fontSize: "2.5rem", letterSpacing: "1.5px" }}>
            My Wishlist
          </h1>
          <span className="fw-bold text-uppercase small Oswald-font text-muted">
            {items.length} Saved Items
          </span>
        </div>

        <Row className="g-4">
          {items.length === 0 ? (
            <Col className="text-center py-5">
              <div className="border border-dark p-5">
                <i className="bi bi-heart display-1 text-muted opacity-25"></i>
                <h3 className="fw-black text-uppercase mt-4 Oswald-font">Your wishlist is empty</h3>
                <p className="text-muted fw-bold text-uppercase small mb-4" style={{ letterSpacing: "1px" }}>
                  Save items you love to find them easily later.
                </p>
                <Link to="/" className="btn btn-dark fw-black text-uppercase px-5 py-3 shadow-none" style={{ borderRadius: "0px", letterSpacing: "2px" }}>
                  Start Exploring <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </Col>
          ) : (
            items.map(item => {
              // Safety check for nested product objects
              const product = item.product ? item.product : item;
              
              return (
                <Col xs={12} sm={6} md={4} lg={3} key={item.id}>
                  {/* Modern Sharp Card */}
                  <div className="product-card h-100 bg-white border border-dark p-3 position-relative">
                    
                    {/* Minimalist Remove Button */}
                    <button 
                      className="btn btn-dark btn-sm position-absolute top-0 end-0 m-2 shadow-none"
                      style={{ zIndex: 5, borderRadius: "0px", width: "30px", height: "30px", padding: "0" }}
                      onClick={() => removeFromWishlist(item.id)}
                      title="Remove from Wishlist"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>

                    {/* Image Stage */}
                    <div className="image-stage d-flex align-items-center justify-content-center mb-3 bg-light" style={{ height: "200px" }}>
                      <img 
                        src={product.imageData ? `data:${product.imageType};base64,${product.imageData}` : unplugged} 
                        style={{ maxHeight: "80%", maxWidth: "80%", objectFit: "contain" }}
                        alt={product.name}
                      />
                    </div>

                    <div className="d-flex flex-column">
                      <div className="mb-2">
                        <span className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: "10px", letterSpacing: "1px" }}>
                           {product.brand}
                        </span>
                        <h6 className="fw-black text-uppercase Oswald-font text-truncate mb-0" style={{ letterSpacing: "0.5px" }}>
                          {product.name}
                        </h6>
                      </div>
                      
                      <div className="mt-3">
                        <h5 className="fw-black Oswald-font mb-3">₹{product.price}</h5>
                        
                        <Button 
                          variant="dark" 
                          className="w-100 fw-black text-uppercase d-flex align-items-center justify-content-between px-3 py-2 shadow-none" 
                          style={{ borderRadius: "0px", fontSize: "0.8rem", letterSpacing: "1px" }}
                          onClick={() => {
                            addToCart(product);
                          }}
                        >
                          <span>Add to Bag</span>
                          <i className="bi bi-bag-plus fs-5"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })
          )}
        </Row>
      </Container>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .Oswald-font { font-family: 'Oswald', sans-serif; }
        .product-card {
           transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .product-card:hover {
           transform: translateY(-8px);
           box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default Wishlist;