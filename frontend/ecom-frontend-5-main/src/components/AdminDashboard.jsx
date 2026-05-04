import React from 'react';
import { Nav, Row, Col, Container } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';

const AdminDashboard = () => {
  const location = useLocation();

  // Helper to determine if a link is active for custom styling
  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-wrapper" style={{ backgroundColor: "#f4f7f6", minHeight: "100vh", paddingTop: "90px" }}>
      <Container>
        <Row className="g-4">
          {/* Sidebar Navigation */}
          <Col lg={3}>
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white sticky-top" style={{ top: "110px" }}>
              <div className="d-flex align-items-center mb-4 ps-2">
                <div className="bg-primary rounded-3 p-2 me-3 shadow-sm">
                  <i className="bi bi-speedometer2 text-white fs-4"></i>
                </div>
                <h5 className="fw-bold mb-0">Admin Control</h5>
              </div>

              <Nav className="flex-column nav-pills">
                <Nav.Link 
                  as={Link} 
                  to="/admin/orders" 
                  className={`d-flex align-items-center rounded-3 mb-2 px-3 py-2 transition-all ${isActive('/admin/orders') ? 'bg-primary text-white shadow' : 'text-dark hover-bg-light'}`}
                >
                  <i className="bi bi-cart-check me-3"></i>
                  <span>Manage Orders</span>
                </Nav.Link>

                <Nav.Link 
                  as={Link} 
                  to="/admin/users" 
                  className={`d-flex align-items-center rounded-3 mb-2 px-3 py-2 transition-all ${isActive('/admin/users') ? 'bg-primary text-white shadow' : 'text-dark hover-bg-light'}`}
                >
                  <i className="bi bi-people me-3"></i>
                  <span>Manage Users</span>
                </Nav.Link>

                <Nav.Link 
                  as={Link} 
                  to="/admin/products" 
                  className={`d-flex align-items-center rounded-3 mb-2 px-3 py-2 transition-all ${isActive('/admin/products') ? 'bg-primary text-white shadow' : 'text-dark hover-bg-light'}`}
                >
                  <i className="bi bi-box-seam me-3"></i>
                  <span>Manage Inventory</span>
                </Nav.Link>
                
                <hr className="my-3 opacity-10" />
                
                <Nav.Link 
                  as={Link} 
                  to="/add_product" 
                  className="d-flex align-items-center text-success rounded-3 px-3 py-2 hover-bg-light"
                >
                  <i className="bi bi-plus-circle-dotted me-3"></i>
                  <span>Add New Product</span>
                </Nav.Link>
              </Nav>
            </div>
          </Col>

          {/* Main Content Area */}
          <Col lg={9}>
            <div className="card border-0 shadow-sm rounded-4 bg-white" style={{ minHeight: '600px' }}>
              <div className="card-header bg-transparent border-0 pt-4 px-4">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item small text-uppercase fw-bold text-muted">Dashboard</li>
                    <li className="breadcrumb-item small text-uppercase fw-bold active text-primary" aria-current="page">
                      {location.pathname.split('/').pop()}
                    </li>
                  </ol>
                </nav>
              </div>
              <div className="card-body p-4 pt-2">
                <Outlet />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;