import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../axios";
import AppContext from "../Context/Context"; // Import to use addToCart
import { Container, Row, Col, Button, Badge, Spinner } from "react-bootstrap";
import unplugged from "../assets/unplugged.png";

const Product = () => {
  const { id } = useParams();
  const { addToCart } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/product/${id}`);
        setProduct(response.data);
        
        // Check if there is image data directly in the object first
        if (response.data.imageData) {
          setImageUrl(`data:${response.data.imageType};base64,${response.data.imageData}`);
        } else {
          const imgResponse = await API.get(`/product/${id}/image`, { responseType: "blob" });
          setImageUrl(URL.createObjectURL(imgResponse.data));
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
      <Spinner animation="border" variant="primary" />
    </div>
  );

  if (!product) return <h2 className="text-center mt-5">Product not found.</h2>;

  return (
    <div className="product-page-wrapper" style={{ backgroundColor: "#fbfbff", minHeight: "100vh", paddingTop: "110px" }}>
      <Container>
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item text-muted">{product.category}</li>
            <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <Row className="g-5">
          {/* Left: Product Image */}
          <Col lg={6}>
            <div className="product-image-container p-4 shadow-sm bg-white rounded-4 text-center">
              <img 
                src={imageUrl || unplugged} 
                alt={product.name} 
                className="img-fluid"
                style={{ maxHeight: "450px", objectFit: "contain" }}
              />
            </div>
          </Col>

          {/* Right: Product Details */}
          <Col lg={6}>
            <div className="ps-lg-4">
              <Badge bg="light" text="primary" className="mb-2 px-3 py-2 border rounded-pill">
                {product.brand}
              </Badge>
              <h1 className="display-5 fw-bold mb-3">{product.name?.toUpperCase()}</h1>
              
              <div className="d-flex align-items-center mb-4">
                <h2 className="text-primary fw-bold me-3 mb-0">${product.price}</h2>
                {product.productAvailable ? (
                  <Badge bg="success" className="rounded-pill px-3">In Stock</Badge>
                ) : (
                  <Badge bg="danger" className="rounded-pill px-3">Out of Stock</Badge>
                )}
              </div>

              <div className="mb-4">
                <h5 className="fw-bold">Description</h5>
                <p className="text-muted leading-relaxed" style={{ fontSize: "1.1rem" }}>
                  {product.description || "No description provided for this premium item."}
                </p>
              </div>

              <div className="p-4 bg-white border rounded-4 shadow-sm mb-4">
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Available Quantity:</span>
                  <span className="fw-bold">{product.stockQuantity} units</span>
                </div>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-100 rounded-pill fw-bold py-3"
                  style={{ backgroundColor: "#764ba2", border: "none" }}
                  disabled={!product.productAvailable}
                  onClick={() => addToCart(product)}
                >
                  <i className="bi bi-cart-plus me-2"></i>
                  {product.productAvailable ? "Add to Shopping Bag" : "Currently Unavailable"}
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="row g-3 text-center mt-2">
                <div className="col-4 border-end">
                  <i className="bi bi-truck fs-3 text-muted"></i>
                  <p className="small text-muted mb-0">Fast Shipping</p>
                </div>
                <div className="col-4 border-end">
                  <i className="bi bi-shield-check fs-3 text-muted"></i>
                  <p className="small text-muted mb-0">Secure Payment</p>
                </div>
                <div className="col-4">
                  <i className="bi bi-arrow-counterclockwise fs-3 text-muted"></i>
                  <p className="small text-muted mb-0">Easy Returns</p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Product;