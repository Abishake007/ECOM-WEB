import React from 'react';
import { Nav, Row, Col, Container } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';

const AdminDashboard = () => {
  const location = useLocation();

  // Helper to determine if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-wrapper bg-white" style={{ minHeight: "100vh", paddingTop: "140px", paddingBottom: "60px" }}>
      <Container>
        <div className="border-bottom border-dark pb-3 mb-5">
          <h1 className="fw-black text-uppercase mb-0 Oswald-font" style={{ fontSize: "2.5rem", letterSpacing: "1.5px" }}>
            Admin Panel
          </h1>
        </div>

        <Row className="g-5">
          {/* Sidebar Navigation - Adidas Style */}
          <Col lg={3}>
            <div className="sticky-top" style={{ top: "160px" }}>
              <div className="d-flex align-items-center mb-4 ps-1">
                <i className="bi bi-shield-lock-fill fs-4 me-2"></i>
                <span className="fw-black text-uppercase Oswald-font small" style={{ letterSpacing: '1px' }}>
                  Management
                </span>
              </div>

              <Nav className="flex-column">
                <Nav.Link 
                  as={Link} 
                  to="/admin/orders" 
                  className={`d-flex align-items-center mb-1 px-3 py-3 border border-dark Oswald-font fw-black text-uppercase shadow-none transition-all ${isActive('/admin/orders') ? 'bg-dark text-white' : 'bg-white text-dark hover-gray'}`}
                  style={{ borderRadius: '0px', letterSpacing: '1px', fontSize: '13px' }}
                >
                  <i className="bi bi-cart-check me-3 fs-5"></i>
                  <span>Manage Orders</span>
                </Nav.Link>

                <Nav.Link 
                  as={Link} 
                  to="/admin/users" 
                  className={`d-flex align-items-center mb-1 px-3 py-3 border border-dark Oswald-font fw-black text-uppercase shadow-none transition-all ${isActive('/admin/users') ? 'bg-dark text-white' : 'bg-white text-dark hover-gray'}`}
                  style={{ borderRadius: '0px', letterSpacing: '1px', fontSize: '13px' }}
                >
                  <i className="bi bi-people me-3 fs-5"></i>
                  <span>Manage Users</span>
                </Nav.Link>

                <Nav.Link 
                  as={Link} 
                  to="/admin/products" 
                  className={`d-flex align-items-center mb-1 px-3 py-3 border border-dark Oswald-font fw-black text-uppercase shadow-none transition-all ${isActive('/admin/products') ? 'bg-dark text-white' : 'bg-white text-dark hover-gray'}`}
                  style={{ borderRadius: '0px', letterSpacing: '1px', fontSize: '13px' }}
                >
                  <i className="bi bi-box-seam me-3 fs-5"></i>
                  <span>Inventory</span>
                </Nav.Link>
                
                <div className="my-4 border-top border-dark border-opacity-25" />
                
                <Nav.Link 
                  as={Link} 
                  to="/add_product" 
                  className="d-flex align-items-center px-3 py-3 border border-dark bg-white text-dark Oswald-font fw-black text-uppercase shadow-none hover-gray"
                  style={{ borderRadius: '0px', letterSpacing: '1px', fontSize: '13px' }}
                >
                  <i className="bi bi-plus-lg me-3 fs-5"></i>
                  <span>Add Product</span>
                </Nav.Link>
              </Nav>
            </div>
          </Col>

          {/* Main Content Area */}
          <Col lg={9}>
            <div className="border border-dark p-4 p-lg-5" style={{ minHeight: '600px', borderRadius: '0px' }}>
              <div className="mb-4">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item Oswald-font fw-bold text-muted small text-uppercase">Admin</li>
                    <li className="breadcrumb-item Oswald-font fw-black text-dark small text-uppercase active" aria-current="page">
                      {location.pathname.split('/').pop()}
                    </li>
                  </ol>
                </nav>
              </div>
              
              <div className="admin-content-outlet">
                <Outlet />
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .Oswald-font { font-family: 'Oswald', sans-serif; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .hover-gray:hover {
          background-color: #f8f9fa !important;
          transform: translateX(5px);
        }
        .breadcrumb-item + .breadcrumb-item::before {
          content: "/";
          color: #000;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;