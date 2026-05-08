import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../axios";
import AppContext from "../Context/Context";
import { Container, Row, Col, Button, Badge, Spinner, Card } from "react-bootstrap";
import unplugged from "../assets/unplugged.png";

const Product = () => {
  const { id } = useParams();
  const { addToCart } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [gallery, setGallery] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/product/${id}`);
        const productData = response.data;
        setProduct(productData);
        
        const primaryUrl = productData.imageData 
          ? `data:${productData.imageType};base64,${productData.imageData}`
          : unplugged;
        setMainImageUrl(primaryUrl);

        if (productData.gallery && productData.gallery.length > 0) {
          const galleryUrls = productData.gallery.map(img => 
            `http://localhost:8080/api/product/image/${img.id}`
          );
          setGallery([primaryUrl, ...galleryUrls]);
        } else {
          setGallery([primaryUrl]);
        }
      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Spinner animation="border" variant="dark" />
    </div>
  );

  if (!product) return <h2 className="text-center mt-5 Oswald-font uppercase">Product not found.</h2>;

  return (
    <div className="product-page-wrapper bg-white" style={{ minHeight: "100vh", paddingTop: "140px", paddingBottom: "80px" }}>
      <Container>
        {/* Adidas Breadcrumb: Clean & Uppercase */}
        <nav aria-label="breadcrumb" className="mb-4 d-none d-md-block">
          <ol className="breadcrumb bg-transparent p-0 small text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>
            <li className="breadcrumb-item"><Link to="/" className="text-dark text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item text-muted">{product.category}</li>
            <li className="breadcrumb-item active text-dark">{product.name}</li>
          </ol>
        </nav>

        <Row className="g-5">
          {/* DESKTOP GALLERY: Left vertical bar with sharp edges */}
          <Col lg={1} md={2} className="d-none d-md-block">
            <div className="d-flex flex-column gap-3">
              {gallery.map((imgUrl, i) => (
                <div 
                  key={i} 
                  className={`cursor-pointer transition-all border-bottom-2 ${mainImageUrl === imgUrl ? 'border-dark' : 'border-transparent'}`}
                  style={{ borderBottom: mainImageUrl === imgUrl ? '3px solid black' : '3px solid transparent', paddingBottom: '5px' }}
                  onMouseEnter={() => setMainImageUrl(imgUrl)}
                >
                  <img 
                    src={imgUrl} 
                    className="img-fluid bg-light p-1" 
                    alt={`View ${i}`} 
                    style={{ height: "70px", width: "100%", objectFit: "contain" }}
                  />
                </div>
              ))}
            </div>
          </Col>

          {/* MAIN IMAGE DISPLAY */}
          <Col lg={6} md={10} className="text-center">
            <div className="product-image-stage p-4 bg-light mb-4 shadow-none border-0" style={{ minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={mainImageUrl} 
                alt={product.name} 
                className="img-fluid"
                style={{ maxHeight: "550px", objectFit: "contain" }}
              />
            </div>

            {/* MOBILE GALLERY: Horizontal Scrollable */}
            <div className="d-md-none overflow-auto d-flex gap-2 pb-3 no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
              {gallery.map((imgUrl, i) => (
                <div 
                  key={i} 
                  className={`flex-shrink-0 bg-light ${mainImageUrl === imgUrl ? 'border border-dark' : ''}`}
                  onClick={() => setMainImageUrl(imgUrl)}
                  style={{ width: '80px', height: '80px', scrollSnapAlign: 'start' }}
                >
                  <img 
                    src={imgUrl} 
                    className="img-fluid h-100 w-100 p-1" 
                    alt={`View ${i}`} 
                    style={{ objectFit: "contain" }} 
                  />
                </div>
              ))}
            </div>
          </Col>

          {/* PRODUCT INFO: High-Contrast Minimalist */}
          <Col lg={5}>
            <div className="ps-lg-2">
              <div className="mb-2">
                <span className="text-uppercase fw-bold text-muted small" style={{ letterSpacing: '2px' }}>{product.brand}</span>
              </div>
              <h1 className="h2 fw-black text-uppercase text-dark mb-3" style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: '0.5px' }}>{product.name}</h1>
              
              <div className="price-section mb-4">
                <div className="d-flex align-items-center gap-3">
                  <span className="h3 fw-black text-dark mb-0">₹{product.price}</span>
                  {product.productAvailable ? (
                    <span className="text-uppercase small fw-bold text-success border border-success px-2 py-1">In Stock</span>
                  ) : (
                    <span className="text-uppercase small fw-bold text-danger border border-danger px-2 py-1">Out of Stock</span>
                  )}
                </div>
                <p className="text-muted small text-uppercase mt-2 fw-bold" style={{ fontSize: '10px' }}>Inclusive of all taxes</p>
              </div>

              {/* OFFERS: Sharp Cards */}
              <div className="offers-container mb-5">
                <h6 className="fw-black text-uppercase mb-3 small" style={{ letterSpacing: '1px' }}>Available Offers</h6>
                <Row className="g-2">
                  <Col xs={12}>
                    <div className="border border-dark p-3 mb-2 d-flex justify-content-between align-items-center">
                      <span className="small fw-bold text-uppercase">Special Price Discount</span>
                      <i className="bi bi-arrow-right"></i>
                    </div>
                    <div className="border border-dark p-3 d-flex justify-content-between align-items-center">
                      <span className="small fw-bold text-uppercase">Free Delivery Over ₹499</span>
                      <i className="bi bi-truck"></i>
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="mb-5">
                <h6 className="fw-black text-uppercase small mb-3">Description</h6>
                <p className="text-dark small" style={{ lineHeight: "1.8", letterSpacing: '0.2px' }}>
                  {product.description || "Premium quality build and aesthetic. Designed for performance and style."}
                </p>
              </div>

              {/* ACTION BOX: Bold Black Button */}
              <div className="p-0 sticky-md-top" style={{ top: '160px', zIndex: '10' }}>
                <Button 
                  variant="dark" 
                  className="w-100 py-3 fw-black text-uppercase shadow-none mb-3"
                  style={{ borderRadius: '0', letterSpacing: '2px', fontSize: '1.1rem' }}
                  disabled={!product.productAvailable}
                  onClick={() => addToCart(product)}
                >
                  Add to Bag <i className="bi bi-arrow-right ms-2"></i>
                </Button>
                
                <div className="row g-0 text-center border border-dark py-3">
                  <div className="col-4 border-end border-dark">
                    <span style={{ fontSize: '9px' }} className="fw-black text-uppercase d-block">Fast Delivery</span>
                  </div>
                  <div className="col-4 border-end border-dark">
                    <span style={{ fontSize: '9px' }} className="fw-black text-uppercase d-block">Secure Pay</span>
                  </div>
                  <div className="col-4">
                    <span style={{ fontSize: '9px' }} className="fw-black text-uppercase d-block">7 Day Return</span>
                  </div>
                </div>
              </div>

              {/* REVIEWS: Monochrome List */}
              <div className="mt-5 border-top border-dark pt-5">
                <h5 className="fw-black text-uppercase mb-4">Reviews ({product.reviews?.length || 0})</h5>
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review.id} className="mb-4 pb-4 border-bottom">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-black text-uppercase small">{review.reviewerName}</span>
                          <span className="small text-muted fw-bold" style={{ fontSize: '10px' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-dark mb-2" style={{ fontSize: '0.8rem' }}>
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`bi ${i < review.rating ? 'bi-star-fill' : 'bi-star'} me-1`}></i>
                          ))}
                        </div>
                        <p className="mb-0 small text-dark fw-medium" style={{ lineHeight: '1.6' }}>{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small text-uppercase fw-bold">No reviews yet.</p>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .uppercase { text-transform: uppercase; }
        .Oswald-font { font-family: 'Oswald', sans-serif; }
        @media (max-width: 768px) {
          .product-page-wrapper { padding-top: 100px !important; }
        }
      `}</style>
    </div>
  );
};

export default Product;