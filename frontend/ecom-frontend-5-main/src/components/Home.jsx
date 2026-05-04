import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../axios";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";

const Home = ({ selectedCategory }) => {
  const { data, isError, addToCart, refreshData } = useContext(AppContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    refreshData();
  }, []);

  const addToWishlist = async (productId) => {
    try {
      const response = await API.post(`/wishlist/add/${productId}`);
      if (response.status === 200 || response.status === 201) {
        alert("Added to Wishlist!");
      }
    } catch (err) {
      console.error("Wishlist POST Error:", err.response);
      alert("Please log in to use the Wishlist.");
    }
  };

  useEffect(() => {
    if (data && data.length > 0) {
      const processedProducts = data.map(product => ({
        ...product,
        imageUrl: product.imageData 
          ? `data:${product.imageType};base64,${product.imageData}` 
          : unplugged
      }));
      setProducts(processedProducts);
    }
  }, [data]);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  if (isError) return (
    <div className="container text-center mt-5 pt-5">
      <img src={unplugged} alt="Error" width="150" className="mb-3 opacity-50"/>
      <h3 className="text-muted">Something went wrong while fetching products.</h3>
    </div>
  );

  return (
    <div className="home-wrapper" style={{ backgroundColor: "#fbfbff", minHeight: "100vh" }}>
      {/* 1. Hero Section */}
      {!selectedCategory && (
        <div className="hero-section py-5 mb-5" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
          <div className="container py-4 text-center">
            <h1 className="display-4 fw-bold mb-3">Upgrade Your Lifestyle</h1>
            <p className="lead mb-4 opacity-75">Discover premium tech and essentials at the best prices.</p>
            <button className="btn btn-outline-light btn-lg rounded-pill px-5">Shop New Arrivals</button>
          </div>
        </div>
      )}

      <div className="container pt-3">
        {/* 2. Header Info */}
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="fw-bold mb-0">{selectedCategory ? selectedCategory : "Featured Products"}</h2>
            <p className="text-muted mb-0">{filteredProducts.length} items found</p>
          </div>
        </div>

        {/* 3. Product Grid */}
        <div className="row">
          {filteredProducts.length === 0 ? (
            <div className="col-12 text-center py-5">
              <h2 className="text-muted">No Products found in this category.</h2>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={product.id}>
                <div className="card h-100 border-0 shadow-sm custom-product-card" style={{ borderRadius: "20px", transition: "transform 0.3s ease" }}>
                  
                  {/* Wishlist Button */}
                  <button 
                    className="wishlist-btn"
                    style={{ 
                      position: "absolute", top: "15px", right: "15px", zIndex: 5,
                      background: "rgba(255,255,255,0.9)", border: "none",
                      borderRadius: "50%", padding: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      addToWishlist(product.id);
                    }}
                  >
                    <i className="bi bi-heart-fill text-danger"></i>
                  </button>

                  <Link to={`/product/${product.id}`} className="text-decoration-none text-dark h-100 d-flex flex-column">
                    <div className="image-container p-3" style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="img-fluid"
                        style={{ maxHeight: "100%", transition: "0.3s ease" }}
                      />
                    </div>
                    
                    <div className="card-body pt-0 d-flex flex-column">
                      <div className="mb-2">
                        <span className="badge bg-light text-primary mb-1" style={{ fontSize: "0.7rem" }}>{product.category}</span>
                        <h6 className="card-title fw-bold mb-0 text-truncate" title={product.name}>
                          {product.name?.toUpperCase()}
                        </h6>
                        <small className="text-muted">{product.brand}</small>
                      </div>
                      
                      <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                        <h5 className="mb-0 fw-bold" style={{ color: "#764ba2" }}>${product.price}</h5>
                        <button 
                          className="btn rounded-pill p-2 px-3"
                          style={{ backgroundColor: "#764ba2", color: "white", border: "none", fontSize: "0.85rem" }}
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                            alert(`${product.name} added to cart!`); // Popup added here
                          }}
                        >
                          <i className="bi bi-cart-plus me-1"></i> Add
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;