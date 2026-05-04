import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../axios";
import { Container, Row, Col, Card, Form, Button, InputGroup, Spinner ,Badge} from "react-bootstrap";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [updateProduct, setUpdateProduct] = useState({
    id: null,
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    releaseDate: "",
    productAvailable: false,
    stockQuantity: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/product/${id}`);
        setUpdateProduct(response.data);
        
        // Fetch existing image and convert to file for the form state
        const responseImage = await API.get(`/product/${id}/image`, { responseType: "blob" });
        const imageFile = new File([responseImage.data], response.data.imageName, { type: responseImage.data.type });
        setImage(imageFile);
        setImagePreview(URL.createObjectURL(responseImage.data));
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("imageFile", image);
    formData.append(
      "product",
      new Blob([JSON.stringify(updateProduct)], { type: "application/json" })
    );

    API.put(`/product/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(() => {
      alert("Product updated successfully!");
      navigate("/admin/products"); // Redirect back to inventory
    })
    .catch((error) => {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateProduct({ ...updateProduct, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (loading) return (
    <div className="text-center" style={{ marginTop: "150px" }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <div className="update-product-wrapper" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingTop: "110px", paddingBottom: "50px" }}>
      <Container>
        <Row className="g-4">
          {/* Left Side: Live Preview Card */}
          <Col lg={4}>
            <div className="sticky-top" style={{ top: "110px" }}>
              <h5 className="fw-bold mb-3 text-muted text-uppercase small">Live Preview</h5>
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="p-4 bg-white text-center" style={{ height: "250px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="img-fluid" 
                    style={{ maxHeight: "100%", objectFit: "contain" }} 
                  />
                </div>
                <Card.Body className="bg-light">
                  <Badge bg="primary" className="mb-2">{updateProduct.brand || "Brand"}</Badge>
                  <h5 className="fw-bold">{updateProduct.name || "Product Name"}</h5>
                  <h4 className="text-primary fw-bold">${updateProduct.price || "0.00"}</h4>
                  <p className="small text-muted text-truncate">{updateProduct.description}</p>
                </Card.Body>
              </Card>
            </div>
          </Col>

          {/* Right Side: Edit Form */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-4 p-4 p-lg-5">
              <div className="mb-4">
                <h3 className="fw-bold">Update Inventory Item</h3>
                <p className="text-muted">Modify the details for Product ID: <span className="text-primary fw-bold">#{id}</span></p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">Product Name</Form.Label>
                      <Form.Control 
                        name="name" value={updateProduct.name} onChange={handleChange} 
                        className="bg-light border-0 py-2" required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">Brand</Form.Label>
                      <Form.Control 
                        name="brand" value={updateProduct.brand} onChange={handleChange} 
                        className="bg-light border-0 py-2" required
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">Description</Form.Label>
                      <Form.Control 
                        as="textarea" rows={3} name="description" 
                        value={updateProduct.description} onChange={handleChange} 
                        className="bg-light border-0" required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Price</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-0">$</InputGroup.Text>
                      <Form.Control 
                        type="number" name="price" value={updateProduct.price} 
                        onChange={handleChange} className="bg-light border-0" required
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">Category</Form.Label>
                      <Form.Select 
                        name="category" value={updateProduct.category} 
                        onChange={handleChange} className="bg-light border-0"
                      >
                        <option value="laptop">Laptop</option>
                        <option value="headphone">Headphone</option>
                        <option value="mobile">Mobile</option>
                        <option value="electronics">Electronics</option>
                        <option value="toys">Toys</option>
                        <option value="fashion">Fashion</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">Stock</Form.Label>
                      <Form.Control 
                        type="number" name="stockQuantity" 
                        value={updateProduct.stockQuantity} onChange={handleChange} 
                        className="bg-light border-0"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase">Replace Image</Form.Label>
                      <Form.Control type="file" onChange={handleImageChange} className="bg-light border-0" />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Check 
                      type="switch" label="Product Available for Sale" 
                      checked={updateProduct.productAvailable}
                      onChange={(e) => setUpdateProduct({...updateProduct, productAvailable: e.target.checked})}
                    />
                  </Col>
                  <Col xs={12} className="mt-4">
                    <Button type="submit" className="w-100 py-3 rounded-pill fw-bold border-0 shadow" 
                            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                      Save Changes
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UpdateProduct;