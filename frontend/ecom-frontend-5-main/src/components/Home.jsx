import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";
import API from "../axios";

const Home = ({ selectedCategory, onClearCategory }) => {
  const { data, addToCart, refreshData, notify } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [recentIds] = useState(() => JSON.parse(localStorage.getItem("klyro-recently-viewed") || "[]"));

  useEffect(() => { refreshData(); }, []);

  const addToWishlist = async (productId) => {
    try {
      await API.post(`/wishlist/add/${productId}`);
      notify("Added to your wishlist");
    } catch (err) { notify("Please sign in to save items to your wishlist", "error"); }
  };

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    notify("Newsletter signup is not connected yet. Please check back soon.", "error");
  };

  useEffect(() => {
    if (data && data.length > 0) {
      setProducts(data.map(p => ({
        ...p,
        imageUrl: p.imageData ? `data:${p.imageType};base64,${p.imageData}` : unplugged
      })));
    }
  }, [data]);

  const filteredProducts = (selectedCategory
    ? products.filter(p => (p.category || "").trim().toLocaleLowerCase() === selectedCategory.trim().toLocaleLowerCase())
    : products).filter(p => (!availableOnly || (p.productAvailable && Number(p.stockQuantity) > 0)) &&
      (!brandFilter || p.brand === brandFilter) && (!minPrice || Number(p.price) >= Number(minPrice)) &&
      (!maxPrice || Number(p.price) <= Number(maxPrice)) &&
      `${p.name} ${p.brand || ""} ${p.category || ""}`.toLowerCase().includes(searchText.toLowerCase()));
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
  const visibleProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return Number(a.price) - Number(b.price);
    if (sortBy === "price-high") return Number(b.price) - Number(a.price);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "newest") return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
    return 0;
  });
  const recentlyViewed = recentIds.map(id => products.find(p => String(p.id) === String(id))).filter(Boolean).slice(0, 6);

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
        <div className="d-flex flex-wrap align-items-center gap-2 bg-white p-3 mb-3 border">
          <input className="form-control" style={{ maxWidth: 260 }} value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Search products, brands..." aria-label="Filter products" />
          <select className="form-select" style={{ maxWidth: 210 }} value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort products">
            <option value="featured">Featured</option><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option>
          </select>
          <select className="form-select" style={{ maxWidth: 180 }} value={brandFilter} onChange={e => setBrandFilter(e.target.value)} aria-label="Filter by brand"><option value="">All brands</option>{brands.map(brand => <option key={brand}>{brand}</option>)}</select>
          <input className="form-control" type="number" min="0" style={{ maxWidth: 130 }} value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min price" aria-label="Minimum price" />
          <input className="form-control" type="number" min="0" style={{ maxWidth: 130 }} value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max price" aria-label="Maximum price" />
          <label className="d-flex align-items-center gap-2 small fw-bold ms-md-auto"><input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} /> In stock only</label>
          <span className="small text-muted">{visibleProducts.length} products</span>
        </div>
        <div className="row g-3">
          {visibleProducts.length > 0 ? (
            visibleProducts.map((product) => (
              <div className="col-6 col-md-4 col-lg-3 col-xl-2 mb-2" key={product.id}>
                {/* Modern Card Design */}
                <div className="product-card h-100 bg-white p-3 border-0 transition-all shadow-hover">
                  <Link to={`/product/${product.id}`} className="text-decoration-none text-dark h-100 d-flex flex-column">
                    
                    {/* Category Tag */}
                    <span className="text-muted text-uppercase mb-1" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                      {product.category}
                    </span>
                    {Number(product.stockQuantity) > 0 && Number(product.stockQuantity) <= 5 && <span className="text-danger small fw-bold mb-1">Only {product.stockQuantity} left</span>}
                    
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
                            disabled={!product.productAvailable || Number(product.stockQuantity) <= 0}
                            onClick={(e) => { e.preventDefault(); addToCart(product); }}
                            style={{ fontSize: '12px' }}
                          >
                            {Number(product.stockQuantity) > 0 ? "ADD" : "SOLD OUT"}
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
              <Link className="btn btn-warning mt-2" to="/" onClick={onClearCategory}>Browse All</Link>
            </div>
          )}
        </div>
        {!selectedCategory && recentlyViewed.length > 0 && <section className="mt-5 bg-white p-4"><h2 className="h5 fw-bold text-uppercase mb-3">Recently viewed</h2><div className="d-flex gap-3 overflow-auto">{recentlyViewed.map(p => <Link key={p.id} to={`/product/${p.id}`} className="text-dark text-decoration-none border p-2 flex-shrink-0" style={{ width: 170 }}><div className="small text-truncate">{p.name}</div><strong>₹{p.price}</strong></Link>)}</div></section>}
      </div>

      <footer className="home-footer mt-5">
        <div className="container-fluid px-lg-5 py-5">
          <div className="row g-5">
            <div className="col-12 col-lg-5">
              <Link to="/" className="home-footer-brand" onClick={onClearCategory}>KLYRO</Link>
              <p className="home-footer-copy mt-3 mb-0">Discover something you'll love. Shop the latest finds across every category.</p>
            </div>
            <div className="col-6 col-lg-2">
              <h2 className="home-footer-heading">Explore</h2>
              <Link to="/" onClick={onClearCategory}>Shop all</Link>
              <Link to="/wishlist">Wishlist</Link>
              <Link to="/orders">Orders</Link>
            </div>
            <div className="col-12 col-lg-5">
              <h2 className="home-footer-heading">Get the KLYRO newsletter</h2>
              <p className="home-footer-copy">Hear about new arrivals, offers, and more.</p>
              <form className="home-newsletter-form" onSubmit={handleNewsletterSubmit}>
                <label className="visually-hidden" htmlFor="newsletter-email">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Your email address"
                  value={newsletterEmail}
                  onChange={event => setNewsletterEmail(event.target.value)}
                  required
                />
                <button type="submit">Subscribe <i className="bi bi-arrow-right ms-2" /></button>
              </form>
            </div>
          </div>
          <div className="home-footer-bottom mt-5 pt-3">
            <span>{"\u00A9"} {new Date().getFullYear()} KLYRO</span>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Back to top <i className="bi bi-arrow-up ms-1" />
            </button>
          </div>
        </div>
      </footer>

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
