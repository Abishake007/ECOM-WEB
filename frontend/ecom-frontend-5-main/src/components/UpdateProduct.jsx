import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../axios";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // SUPPORT FOR MULTIPLE IMAGES
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
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
        
        // Fetch existing primary image for initial preview
        const responseImage = await API.get(`/product/${id}/image`, { responseType: "blob" });
        const imageFile = new File([responseImage.data], response.data.imageName, { type: responseImage.data.type });
        
        setImages([imageFile]);
        setImagePreviews([URL.createObjectURL(responseImage.data)]);
        
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
    
    // SUPPORT FOR MULTIPLE FILES: Appending all selected images
    images.forEach((file) => {
      formData.append("imageFiles", file); // Key matches AddProduct logic
    });

    formData.append(
      "product",
      new Blob([JSON.stringify(updateProduct)], { type: "application/json" })
    );

    API.put(`/product/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(() => {
      alert("PRODUCT REVISION SUCCESSFUL");
      navigate("/admin/products");
    })
    .catch((error) => {
      console.error("Error updating product:", error);
      alert("FAILED TO SYNC CHANGES");
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateProduct({ ...updateProduct, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Generate previews for multiple files
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  if (loading) return (
    <div className="text-center bg-white" style={{ height: "100vh", paddingTop: "200px" }}>
      <Spinner animation="border" variant="dark" />
      <p className="mt-3 Oswald-font fw-black text-uppercase">Fetching Inventory Data...</p>
    </div>
  );

  return (
    <div className="update-product-wrapper bg-white" style={{ minHeight: "100vh", paddingTop: "140px", paddingBottom: "80px" }}>
      <Container>
        <div className="border-bottom border-dark pb-3 mb-5">
          <h1 className="fw-black text-uppercase mb-0 Oswald-font" style={{ fontSize: "2.5rem", letterSpacing: "1.5px" }}>
            Edit Product
          </h1>
          <span className="fw-bold text-muted small Oswald-font text-uppercase">Asset ID: #{id}</span>
        </div>

        <Form onSubmit={handleSubmit}>
          <Row className="g-5">
            {/* Left Column: Industrial Preview */}
            <Col lg={4}>
              <div className="sticky-top" style={{ top: "160px" }}>
                <h6 className="Oswald-font fw-black text-uppercase mb-3" style={{ letterSpacing: '1px' }}>Current Asset View</h6>
                <div className="border border-dark p-2 bg-white">
                  <div className="bg-light d-flex align-items-center justify-content-center flex-wrap gap-1 p-2" style={{ minHeight: "300px" }}>
                    {imagePreviews.map((src, idx) => (
                        <img 
                          key={idx}
                          src={src} 
                          alt={`Preview ${idx}`} 
                          className="img-fluid border border-dark bg-white" 
                          style={{ maxHeight: imagePreviews.length > 1 ? "140px" : "280px", objectFit: "contain" }} 
                        />
                    ))}
                  </div>
                  <div className="p-3 border-top border-dark">
                    <span className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: "10px", letterSpacing: "1px" }}>{updateProduct.brand || "BRAND"}</span>
                    <h5 className="Oswald-font fw-black text-uppercase mb-2">{updateProduct.name || "PRODUCT NAME"}</h5>
                    <h4 className="Oswald-font fw-black mb-0">₹{updateProduct.price || "0.00"}</h4>
                  </div>
                </div>
              </div>
            </Col>

            {/* Right Column: Technical Specifications */}
            <Col lg={8}>
              <div className="border border-dark p-4 p-lg-5">
                <h5 className="Oswald-font fw-black text-uppercase mb-4" style={{ letterSpacing: '1px' }}>Inventory Specifications</h5>
                
                <Row className="g-4">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="Oswald-font fw-bold text-uppercase small">Full Product Title</Form.Label>
                      <Form.Control 
                        name="name" value={updateProduct.name} onChange={handleChange} 
                        className="rounded-0 border-dark shadow-none py-2" required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="Oswald-font fw-bold text-uppercase small">Manufacturer/Brand</Form.Label>
                      <Form.Control 
                        name="brand" value={updateProduct.brand} onChange={handleChange} 
                        className="rounded-0 border-dark shadow-none py-2" required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="Oswald-font fw-bold text-uppercase small">Market Category</Form.Label>
                      <Form.Select 
                        name="category" value={updateProduct.category} 
                        onChange={handleChange} className="rounded-0 border-dark shadow-none py-2"
                      >
                        <option value="laptop">LAPTOP</option>
                        <option value="headphone">HEADPHONE</option>
                        <option value="mobile">MOBILE</option>
                        <option value="electronics">ELECTRONICS</option>
                        <option value="fashion">FASHION & APPAREL</option>
                        <option value="toys">TOYS</option>
                        <option value="home">HOME & KITCHEN</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="Oswald-font fw-bold text-uppercase small">Technical Description</Form.Label>
                      <Form.Control 
                        as="textarea" rows={5} name="description" 
                        value={updateProduct.description} onChange={handleChange} 
                        className="rounded-0 border-dark shadow-none py-3" required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="Oswald-font fw-bold text-uppercase small">Unit Price (INR)</Form.Label>
                      <Form.Control 
                        type="number" name="price" value={updateProduct.price} 
                        onChange={handleChange} className="rounded-0 border-dark shadow-none py-2" required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="Oswald-font fw-bold text-uppercase small">Stock Quantity</Form.Label>
                      <Form.Control 
                        type="number" name="stockQuantity" 
                        value={updateProduct.stockQuantity} onChange={handleChange} 
                        className="rounded-0 border-dark shadow-none py-2" required
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <div className="p-3 bg-light border border-dark">
                      <Form.Group className="mb-0">
                        <Form.Label className="Oswald-font fw-bold text-uppercase small">Replace Visual Assets (Multiple)</Form.Label>
                        <Form.Control 
                            type="file" 
                            onChange={handleImageChange} 
                            multiple // ENABLED MULTIPLE SELECTION
                            accept="image/*"
                            className="rounded-0 border-dark bg-white shadow-none" 
                        />
                      </Form.Group>
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className="d-flex align-items-center justify-content-between py-2">
                      <Form.Check 
                        type="switch" 
                        label="ACTIVE LISTING" 
                        className="Oswald-font fw-black text-uppercase small"
                        checked={updateProduct.productAvailable}
                        onChange={(e) => setUpdateProduct({...updateProduct, productAvailable: e.target.checked})}
                      />
                    </div>
                  </Col>

                  <Col xs={12} className="mt-4">
                    <Button type="submit" variant="dark" className="w-100 py-3 rounded-0 Oswald-font fw-black text-uppercase shadow-none border-0" style={{ letterSpacing: '2px' }}>
                      Save Revision <i className="bi bi-arrow-right ms-2"></i>
                    </Button>
                  </Col>
                </Row>
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
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
};

export default UpdateProduct;