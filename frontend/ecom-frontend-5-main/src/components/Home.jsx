import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";
import API from "../axios";

const Home = ({ selectedCategory }) => {
  const { data, addToCart, refreshData } = useContext(AppContext);
  const [products, setProducts] = useState([]);

  useEffect(() => { refreshData(); }, []);

  const addToWishlist = async (productId) => {
    try {
      await API.post(`/wishlist/add/${productId}`);
      alert("Added to Wishlist!");
    } catch (err) { alert("Please log in to save items."); }
  };

  useEffect(() => {
    if (data && data.length > 0) {
      setProducts(data.map(p => ({
        ...p,
        imageUrl: p.imageData ? `data:${p.imageType};base64,${p.imageData}` : unplugged
      })));
    }
  }, [data]);

  const filteredProducts = selectedCategory ? products.filter(p => p.category === selectedCategory) : products;

  return (
    <div className="home-wrapper" style={{ backgroundColor: "#eaeded", minHeight: "100vh", paddingBottom: "50px" }}>
      
      {/* 1. Modern Hero Banner - Responsive Height & Gradient Fade */}
      {!selectedCategory && (
        <div className="hero-banner w-100 position-relative" style={{ overflow: "hidden" }}>
          <img 
            src="/banner.png" 
            className="w-100 d-block" 
            style={{ 
              minHeight: "220px",
              maxHeight: "450px",
              objectFit: "cover",
              objectPosition: "center",
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)"
            }} 
            alt="Black Friday Promotion" 
          />
        </div>
      )}

      {/* 2. Overlapping Product Grid */}
      <div 
        className="container-fluid px-lg-5" 
        style={{ 
          marginTop: selectedCategory ? "120px" : "-12vw", // Dynamic overlap based on screen width
          position: "relative", 
          zIndex: 2 
        }}
      >
        <div className="row g-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div className="col-6 col-md-4 col-lg-3 col-xl-2 mb-2" key={product.id}>
                {/* Modern Card Design */}
                <div className="product-card h-100 bg-white p-3 border-0 transition-all shadow-hover">
                  <Link to={`/product/${product.id}`} className="text-decoration-none text-dark h-100 d-flex flex-column">
                    
                    {/* Category Tag */}
                    <span className="text-muted text-uppercase mb-1" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                      {product.category}
                    </span>
                    
                    <h6 className="fw-bold mb-3 text-truncate" style={{ fontSize: '14px' }}>
                      {product.name}
                    </h6>
                    
                    {/* Image Stage */}
                    <div className="image-stage mb-3 d-flex align-items-center justify-content-center" style={{ height: "160px" }}>
                      <img 
                        src={product.imageUrl} 
                        className="img-fluid" 
                        style={{ maxHeight: "100%", transition: "transform 0.3s ease" }} 
                        alt={product.name}
                      />
                    </div>

                    {/* Price & Action Footer */}
                    <div className="mt-auto pt-3 border-top">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex flex-column">
                          <h5 className="fw-bold mb-0 text-dark">₹{product.price}</h5>
                          <span className="text-muted" style={{ fontSize: '10px', textDecoration: 'line-through' }}>
                            ₹{Math.floor(product.price * 1.2)}
                          </span>
                        </div>
                        
                        <div className="d-flex gap-1">
                          <button 
                            className="btn btn-sm btn-outline-secondary border-0 p-1" 
                            onClick={(e) => { e.preventDefault(); addToWishlist(product.id); }}
                          >
                            <i className="bi bi-heart"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-warning fw-bold px-3 shadow-sm rounded-1"
                            onClick={(e) => { e.preventDefault(); addToCart(product); }}
                            style={{ fontSize: '12px' }}
                          >
                            ADD
                          </button>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center gap-1">
                        <i className="bi bi-truck text-primary" style={{ fontSize: '12px' }}></i>
                        <small className="text-primary fw-bold" style={{ fontSize: '10px' }}>
                          FREE Delivery Tomorrow
                        </small>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 bg-white shadow-sm rounded-1">
              <i className="bi bi-box-seam display-1 text-light"></i>
              <h4 className="text-muted mt-3">We couldn't find any products in this section.</h4>
              <button className="btn btn-warning mt-2" onClick={() => window.location.reload()}>Browse All</button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Global CSS for Hover Animations */}
      <style>{`
        .product-card {
          border-radius: 4px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.12) !important;
        }
        .product-card:hover img {
          transform: scale(1.05);
        }
        .image-stage {
          background-color: #f8f9fa;
          border-radius: 4px;
        }
        .home-wrapper {
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
};

export default Home;