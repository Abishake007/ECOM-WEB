import React, { useState } from "react";
import API from "../axios";
import { Container, Row, Col, Form, Button } from "react-bootstrap";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: "",
    productAvailable: true,
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const submitHandler = (event) => {
    event.preventDefault();
    if (images.length === 0) return alert("Please upload at least one product image");

    const formData = new FormData();
    images.forEach((file) => {
      formData.append("imageFiles", file);
    });

    formData.append(
      "product",
      new Blob([JSON.stringify(product)], { type: "application/json" })
    );

    API.post("/product", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(() => {
        alert("LISTING SUCCESSFUL");
        setProduct({
          name: "", brand: "", description: "", price: "",
          category: "", stockQuantity: "", releaseDate: "", productAvailable: true
        });
        setImages([]);
        setImagePreviews([]);
      })
      .catch((err) => {
        console.error(err);
        alert("UPLOAD FAILED");
      });
  };

  return (
    <div className="add-product-container bg-white" style={{ minHeight: "100vh", paddingTop: "140px", paddingBottom: "80px" }}>
      <Container>
        <div className="border-bottom border-dark pb-3 mb-5">
          <h1 className="fw-black text-uppercase mb-0 Oswald-font" style={{ fontSize: "2.5rem", letterSpacing: "1.5px" }}>
            New Listing
          </h1>
          <span className="fw-bold text-muted small Oswald-font text-uppercase">Merchant Inventory Entry</span>
        </div>

        <Form onSubmit={submitHandler}>
          <Row className="g-5">
            {/* Primary Details */}
            <Col lg={8}>
              <div className="border border-dark p-4 p-lg-5">
                <h5 className="fw-black text-uppercase Oswald-font mb-4" style={{ letterSpacing: '1px' }}>General Information</h5>
                
                <Form.Group className="mb-4">
                  <Form.Label className="Oswald-font fw-bold text-uppercase small">Product Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="name" 
                    className="rounded-0 border-dark shadow-none py-2" 
                    value={product.name} 
                    onChange={handleInputChange} 
                    placeholder="E.G. SUPERSTAR CLASSIC" 
                    required 
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="Oswald-font fw-bold text-uppercase small">Brand</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="brand" 
                        className="rounded-0 border-dark shadow-none py-2" 
                        value={product.brand} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="Oswald-font fw-bold text-uppercase small">Category</Form.Label>
                      <Form.Select 
                        name="category" 
                        className="rounded-0 border-dark shadow-none py-2" 
                        value={product.category} 
                        onChange={handleInputChange} 
                        required
                      >
                        <option value="">SELECT CATEGORY</option>
                        <option value="Mobile">MOBILE</option>
                        <option value="Laptop">LAPTOP</option>
                        <option value="Electronics">ELECTRONICS</option>
                        <option value="Fashion">FASHION & APPAREL</option>
                        <option value="Camera">CAMERA</option>
                        <option value="Toys">TOYS</option>
                        <option value="Home_applience">HOME APPLIENCE</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-0">
                  <Form.Label className="Oswald-font fw-bold text-uppercase small">Description</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={6} 
                    name="description" 
                    className="rounded-0 border-dark shadow-none py-3" 
                    value={product.description} 
                    onChange={handleInputChange} 
                    placeholder="TECHNICAL SPECIFICATIONS AND PRODUCT HIGHLIGHTS..." 
                    required 
                  />
                </Form.Group>
              </div>
            </Col>

            {/* Assets & Logistics */}
            <Col lg={4}>
              <div className="d-flex flex-column gap-4">
                {/* Image Upload Block */}
                <div className="border border-dark p-4 bg-light">
                  <h5 className="fw-black text-uppercase Oswald-font mb-3 small">Gallery Assets</h5>
                  <Form.Control 
                    type="file" 
                    size="sm" 
                    className="rounded-0 border-dark shadow-none bg-white mb-3" 
                    onChange={handleImageChange} 
                    multiple 
                    accept="image/*"
                    required 
                  />
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="border border-dark bg-white p-1">
                        <img src={src} alt="Preview" style={{ width: "50px", height: "50px", objectFit: "cover" }} />
                      </div>
                    ))}
                    {imagePreviews.length === 0 && <div className="py-4 w-100 text-center text-muted border border-dashed border-dark opacity-50 small fw-bold">NO ASSETS SELECTED</div>}
                  </div>
                </div>

                {/* Pricing & Stock Block */}
                <div className="border border-dark p-4">
                  <h5 className="fw-black text-uppercase Oswald-font mb-3 small">Logistics</h5>
                  <Form.Group className="mb-3">
                    <Form.Label className="Oswald-font fw-bold text-uppercase" style={{ fontSize: '10px' }}>Price (INR)</Form.Label>
                    <Form.Control type="number" name="price" className="rounded-0 border-dark shadow-none" value={product.price} onChange={handleInputChange} required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="Oswald-font fw-bold text-uppercase" style={{ fontSize: '10px' }}>Quantity</Form.Label>
                    <Form.Control type="number" name="stockQuantity" className="rounded-0 border-dark shadow-none" value={product.stockQuantity} onChange={handleInputChange} required />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="Oswald-font fw-bold text-uppercase" style={{ fontSize: '10px' }}>Launch Date</Form.Label>
                    <Form.Control type="date" name="releaseDate" className="rounded-0 border-dark shadow-none" value={product.releaseDate} onChange={handleInputChange} required />
                  </Form.Group>

                  <Form.Check 
                    type="switch" 
                    label="ACTIVATE ON STOREFRONT" 
                    className="Oswald-font fw-black small text-uppercase"
                    checked={product.productAvailable} 
                    onChange={(e) => setProduct({...product, productAvailable: e.target.checked})}
                  />
                </div>

                <Button type="submit" variant="dark" className="w-100 py-3 rounded-0 Oswald-font fw-black text-uppercase shadow-none border-0" style={{ letterSpacing: '2px' }}>
                  Confirm & List Item <i className="bi bi-arrow-right ms-2"></i>
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .Oswald-font { font-family: 'Oswald', sans-serif; }
        .form-control:focus, .form-select:focus {
          border-color: #000 !important;
          background-color: #fff !important;
        }
        .border-dashed { border-style: dashed !important; }
      `}</style>
    </div>
  );
};

export default AddProduct;