import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../axios";
import AppContext from "../Context/Context";
import { Container, Row, Col, Button, Badge, Spinner, Card } from "react-bootstrap";
import unplugged from "../assets/unplugged.png";
import AuthService from "../services/auth.service";
import { getDiscountPercentage, getSalePrice } from "../utils/pricing";

const Product = () => {
  const { id } = useParams();
  const { addToCart, data, cart } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [gallery, setGallery] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const currentUser = AuthService.getCurrentUser();
  const currentUserId = currentUser?.id ?? currentUser?.userId;
  const isAdmin = currentUser?.roles?.includes("ROLE_ADMIN");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/product/${id}`);
        const productData = response.data;
        setProduct(productData);
        const viewed = JSON.parse(localStorage.getItem("klyro-recently-viewed") || "[]").filter(item => String(item) !== String(id));
        localStorage.setItem("klyro-recently-viewed", JSON.stringify([id, ...viewed].slice(0, 12)));
        const reviewResponse = await API.get(`/product/${id}/reviews`);
        setReviews(reviewResponse.data);
        
        const primaryUrl = productData.imageUrl || unplugged;
        setMainImageUrl(primaryUrl);

        if (productData.gallery && productData.gallery.length > 0) {
          const galleryUrls = productData.gallery.map(img => 
            `${API.defaults.baseURL}/product/image/${img.id}`
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

  const submitReview = async (event) => {
    event.preventDefault();
    setReviewMessage("");
    try {
      const response = await API.post(`/product/${id}/reviews`, { rating: Number(rating), comment });
      setReviews(current => [response.data, ...current]);
      setComment("");
      setReviewMessage("Your review has been added.");
    } catch (error) {
      setReviewMessage(error.response?.status === 401 ? "Sign in to leave a review." : (error.response?.data || "Could not submit your review."));
    }
  };

  const deleteReview = async (review) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await API.delete(`/product/${id}/reviews/${review.id}`);
      setReviews(current => current.filter(item => item.id !== review.id));
      setReviewMessage("Review deleted.");
    } catch (error) {
      setReviewMessage(error.response?.status === 403 ? "Only the review author or an admin can delete this review." : "Could not delete the review.");
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Spinner animation="border" variant="dark" />
    </div>
  );

  if (!product) return <h2 className="text-center mt-5 Oswald-font uppercase">Product not found.</h2>;

  let viewedProductIds = [];
  try { viewedProductIds = JSON.parse(localStorage.getItem("klyro-recently-viewed") || "[]"); } catch { viewedProductIds = []; }
  const behaviorProducts = [
    ...viewedProductIds.map(viewedId => data.find(item => String(item.id) === String(viewedId))),
    ...cart,
    product
  ].filter(Boolean);
  const preferredCategories = new Set(behaviorProducts.map(item => item.category?.trim().toLowerCase()).filter(Boolean));
  const preferredBrands = new Set(behaviorProducts.map(item => item.brand?.trim().toLowerCase()).filter(Boolean));
  const visitedOrCartIds = new Set([...viewedProductIds, ...cart.map(item => item.id)].map(String));
  const recommendations = data.filter(item => String(item.id) !== String(id) && !visitedOrCartIds.has(String(item.id)))
    .map(item => ({ ...item, score: (preferredCategories.has(item.category?.trim().toLowerCase()) ? 3 : 0) + (preferredBrands.has(item.brand?.trim().toLowerCase()) ? 2 : 0) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return (
    <div className="product-page-wrapper bg-white" style={{ minHeight: "100vh", paddingTop: "24px", paddingBottom: "80px" }}>
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
                  <div className="d-flex align-items-baseline gap-2"><span className="h3 fw-black text-dark mb-0">₹{getSalePrice(product)}</span>{getDiscountPercentage(product) > 0 && <><span className="text-muted text-decoration-line-through">₹{product.price}</span><Badge bg="danger">{getDiscountPercentage(product)}% OFF</Badge></>}</div>
                  {product.productAvailable && Number(product.stockQuantity) > 0 ? (
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
              <p className="small mb-4"><Link to={`/support?productId=${product.id}`} className="text-dark">Questions or a problem with this product? Contact support.</Link></p>

              {/* ACTION BOX: Bold Black Button */}
              <div className="p-0 sticky-md-top" style={{ top: '160px', zIndex: '10' }}>
                <Button 
                  variant="dark" 
                  className="w-100 py-3 fw-black text-uppercase shadow-none mb-3"
                  style={{ borderRadius: '0', letterSpacing: '2px', fontSize: '1.1rem' }}
                  disabled={!product.productAvailable || Number(product.stockQuantity) <= 0}
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
                <h5 className="fw-black text-uppercase mb-4">Reviews ({reviews.length})</h5>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="mb-4 pb-4 border-bottom">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-black text-uppercase small">{review.reviewerName}</span>
                          <div className="d-flex align-items-center gap-3"><span className="small text-muted fw-bold" style={{ fontSize: '10px' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                            {(isAdmin || (currentUserId && Number(review.reviewerUserId) === Number(currentUserId))) && <Button size="sm" variant="outline-danger" onClick={() => deleteReview(review)}>Delete</Button>}
                          </div>
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
                <form onSubmit={submitReview} className="mt-4 p-3 bg-light">
                  <h6 className="fw-bold text-uppercase">Write a review</h6>
                  <label className="form-label small fw-bold" htmlFor="review-rating">Rating</label>
                  <select id="review-rating" className="form-select mb-2" value={rating} onChange={e => setRating(e.target.value)}><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select>
                  <textarea className="form-control mb-2" rows="3" maxLength="1000" value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience" required />
                  <button className="btn btn-dark text-uppercase fw-bold" type="submit">Submit review</button>
                  {reviewMessage && <p className="small mt-2 mb-0" role="status">{reviewMessage}</p>}
                </form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      {recommendations.length > 0 && <Container className="mt-5"><h2 className="h4 fw-black text-uppercase mb-3">Picked from what you’ve viewed and added</h2><div className="row g-3">{recommendations.map(item => <div className="col-6 col-md-3" key={item.id}><Link className="d-block border p-3 h-100 text-decoration-none text-dark" to={`/product/${item.id}`}><img src={item.imageUrl || unplugged} alt={item.name} className="w-100 bg-light mb-2" style={{ height: 150, objectFit: "contain" }} /><strong>{item.name}</strong><div>₹{getSalePrice(item)} {getDiscountPercentage(item) > 0 && <small className="text-danger">{getDiscountPercentage(item)}% OFF</small>}</div></Link></div>)}</div></Container>}

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .uppercase { text-transform: uppercase; }
        .Oswald-font { font-family: 'Oswald', sans-serif; }
        @media (max-width: 768px) {
          .product-page-wrapper { padding-top: 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default Product;
