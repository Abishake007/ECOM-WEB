import React, { useState } from "react";
import API from "../axios";
import { Container, Row, Col, Card, Form, Button, InputGroup } from "react-bootstrap";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: "",
    productAvailable: false,
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const submitHandler = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("imageFile", image);
    formData.append(
      "product",
      new Blob([JSON.stringify(product)], { type: "application/json" })
    );

    API.post("/product", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        alert("Product added successfully");
        // Reset form
        setProduct({
          name: "", brand: "", description: "", price: "",
          category: "", stockQuantity: "", releaseDate: "", productAvailable: false
        });
        setImage(null);
        setImagePreview(null);
      })
      .catch((error) => {
        console.error("Error adding product:", error);
        alert("Error adding product");
      });
  };

  return (
    <div className="add-product-wrapper" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingTop: "100px", paddingBottom: "50px" }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-primary text-white p-4 text-center border-0" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                <h3 className="fw-bold mb-0">Inventory Enrollment</h3>
                <p className="small mb-0 opacity-75">Add a new item to your enterprise catalog</p>
              </div>
              <Card.Body className="p-4 p-lg-5">
                <Form onSubmit={submitHandler}>
                  <Row className="g-4">
                    <Col md={6}>
                      <Form.Group controlId="name">
                        <Form.Label className="fw-bold small text-uppercase text-muted">Product Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g. MacBook Pro M3"
                          name="name"
                          value={product.name}
                          onChange={handleInputChange}
                          className="py-2 rounded-3 border-light bg-light"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="brand">
                        <Form.Label className="fw-bold small text-uppercase text-muted">Manufacturer/Brand</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g. Apple"
                          name="brand"
                          value={product.brand}
                          onChange={handleInputChange}
                          className="py-2 rounded-3 border-light bg-light"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group controlId="description">
                        <Form.Label className="fw-bold small text-uppercase text-muted">Full Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Provide detailed product specifications..."
                          name="description"
                          value={product.description}
                          onChange={handleInputChange}
                          className="py-2 rounded-3 border-light bg-light"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group controlId="price">
                        <Form.Label className="fw-bold small text-uppercase text-muted">Listing Price</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-light">$</InputGroup.Text>
                          <Form.Control
                            type="number"
                            name="price"
                            value={product.price}
                            onChange={handleInputChange}
                            className="py-2 border-light bg-light"
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group controlId="category">
                        <Form.Label className="fw-bold small text-uppercase text-muted">Category</Form.Label>
                        <Form.Select
                          name="category"
                          value={product.category}
                          onChange={handleInputChange}
                          className="py-2 rounded-3 border-light bg-light"
                          required
                        >
                          <option value="">Select</option>
                          <option value="Laptop">Laptop</option>
                          <option value="Headphone">Headphone</option>
                          <option value="Mobile">Mobile</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Toys">Toys</option>
                          <option value="Fashion">Fashion</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group controlId="stockQuantity">
                        <Form.Label className="fw-bold small text-uppercase text-muted">Stock Level</Form.Label>
                        <Form.Control
                          type="number"
                          name="stockQuantity"
                          value={product.stockQuantity}
                          onChange={handleInputChange}
                          className="py-2 rounded-3 border-light bg-light"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="releaseDate">
                        <Form.Label className="fw-bold small text-uppercase text-muted">Release Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="releaseDate"
                          value={product.releaseDate}
                          onChange={handleInputChange}
                          className="py-2 rounded-3 border-light bg-light"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="image">
                        <Form.Label className="fw-bold small text-uppercase text-muted">Product Image</Form.Label>
                        <Form.Control
                          type="file"
                          onChange={handleImageChange}
                          className="py-2 rounded-3 border-light bg-light"
                          required={!imagePreview}
                        />
                      </Form.Group>
                    </Col>

                    {imagePreview && (
                      <Col xs={12} className="text-center">
                        <div className="p-3 border rounded-4 bg-light d-inline-block">
                          <img src={imagePreview} alt="Preview" style={{ maxHeight: "150px" }} className="rounded-3 shadow-sm" />
                          <p className="small text-muted mt-2 mb-0">Image Preview</p>
                        </div>
                      </Col>
                    )}

                    <Col xs={12}>
                      <Form.Check 
                        type="switch"
                        id="productAvailable"
                        label="Publish to storefront immediately"
                        checked={product.productAvailable}
                        onChange={(e) => setProduct({ ...product, productAvailable: e.target.checked })}
                        className="fw-bold text-muted"
                      />
                    </Col>

                    <Col xs={12} className="pt-3">
                      <Button 
                        type="submit" 
                        className="w-100 py-3 rounded-pill fw-bold shadow-sm"
                        style={{ background: "#764ba2", border: "none" }}
                      >
                        Finalize & Upload Product
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AddProduct;