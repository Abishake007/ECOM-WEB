import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";
import API from "../axios";
import AuthService from "../services/auth.service";
import { getDiscountPercentage, getSalePrice } from "../utils/pricing";

const Home = ({ selectedCategory, onSelectCategory, onClearCategory }) => {
  const { data, cart, addToCart, refreshData, notify } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [recentIds] = useState(() => JSON.parse(localStorage.getItem("klyro-recently-viewed") || "[]"));
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const categoryViewportRef = useRef(null);
  const categoryCardRefs = useRef([]);

  useEffect(() => { refreshData(); }, []);

  const addToWishlist = async (productId) => {
    const user = AuthService.getCurrentUser();
    if (!user?.accessToken && !user?.token && !user?.jwt) {
      sessionStorage.setItem("klyro-pending-wishlist-product", String(productId));
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    try {
      await API.post(`/wishlist/add/${productId}`);
      notify("Added to your wishlist");
    } catch (err) { notify("Please sign in to save items to your wishlist", "error"); }
  };

  useEffect(() => {
    const pendingProductId = sessionStorage.getItem("klyro-pending-wishlist-product");
    const user = AuthService.getCurrentUser();
    if (!pendingProductId || !data.length || (!user?.accessToken && !user?.token && !user?.jwt)) return;
    sessionStorage.removeItem("klyro-pending-wishlist-product");
    addToWishlist(Number(pendingProductId));
  }, [data]);

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    notify("Newsletter signup is not connected yet. Please check back soon.", "error");
  };

  const viewAllProducts = () => {
    onClearCategory();
    setSearchText("");
    setBrandFilter("");
    setMinPrice("");
    setMaxPrice("");
    setAvailableOnly(false);
    setSortBy("featured");
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      document.getElementById("product-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
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
  const categoriesByKey = new Map();
  products.forEach(item => {
    const category = item.category?.trim();
    if (category && !categoriesByKey.has(category.toLowerCase())) categoriesByKey.set(category.toLowerCase(), category);
  });
  const categoryCards = [...categoriesByKey.values()]
    .sort((a, b) => a.localeCompare(b))
    .map(category => {
      const categoryProducts = products.filter(item => item.category?.trim().toLowerCase() === category.toLowerCase());
      const imageProduct = categoryProducts.find(item => item.imageData) || categoryProducts[0];
      return { category, image: imageProduct?.imageData ? `data:${imageProduct.imageType};base64,${imageProduct.imageData}` : (imageProduct?.imageUrl || unplugged) };
    });
  useEffect(() => {
    if (!categoryCards.length || selectedCategory) return undefined;
    const initialIndex = categoryCards.length > 4 ? 2 : 1;
    const nextIndex = categoryCards.length > 1 && activeCategoryIndex === 0
      ? initialIndex : Math.min(activeCategoryIndex, categoryCards.length - 1);
    if (nextIndex !== activeCategoryIndex) {
      setActiveCategoryIndex(nextIndex);
      return undefined;
    }
    const centerActiveCard = () => {
      const viewport = categoryViewportRef.current;
      const card = categoryCardRefs.current[nextIndex];
      if (!viewport || !card) return;
      const viewportRect = viewport.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const targetLeft = viewport.scrollLeft + cardRect.left - viewportRect.left - (viewport.clientWidth - cardRect.width) / 2;
      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      viewport.scrollTo({ left: Math.max(0, Math.min(targetLeft, maxScroll)), behavior: "smooth" });
    };
    centerActiveCard();
    window.addEventListener("resize", centerActiveCard);
    return () => window.removeEventListener("resize", centerActiveCard);
  }, [categoryCards.length, activeCategoryIndex, selectedCategory]);

  const showCategory = (index) => {
    const safeIndex = (index + categoryCards.length) % categoryCards.length;
    setActiveCategoryIndex(safeIndex);
    onSelectCategory(categoryCards[safeIndex].category);
    window.setTimeout(() => document.getElementById("category-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };
  const behaviorItems = [...recentlyViewed, ...cart];
  const behaviorIds = new Set(behaviorItems.map(item => String(item.id)));
  const categoryInterests = new Set(behaviorItems.map(item => item.category?.trim().toLowerCase()).filter(Boolean));
  const brandInterests = new Set(behaviorItems.map(item => item.brand?.trim().toLowerCase()).filter(Boolean));
  const personalizedRecommendations = behaviorItems.length ? products
    .filter(item => !behaviorIds.has(String(item.id)))
    .map(item => ({
      ...item,
      interestScore: (categoryInterests.has(item.category?.trim().toLowerCase()) ? 3 : 0)
        + (brandInterests.has(item.brand?.trim().toLowerCase()) ? 2 : 0)
    }))
    .filter(item => item.interestScore > 0)
    .sort((a, b) => b.interestScore - a.interestScore)
    .slice(0, 6) : [];

  return (
    <div className="home-wrapper" style={{ backgroundColor: "#eaeded", minHeight: "100vh" }}>
      
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
          marginTop: selectedCategory ? "24px" : "-12vw", // Dynamic overlap based on screen width
          position: "relative", 
          zIndex: 2 
        }}
      >
        {selectedCategory && <div id="category-results" className="d-flex flex-wrap align-items-center justify-content-between gap-2 bg-white p-3 mb-3 border">
          <div><h1 className="h4 fw-bold text-uppercase mb-1">{selectedCategory}</h1><p className="small text-muted mb-0">Browse products in this category.</p></div>
          <button type="button" className="btn btn-outline-dark btn-sm" onClick={viewAllProducts}>View all products</button>
        </div>}
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
        {!selectedCategory && categoryCards.length > 0 && <section className="shop-category-section mb-4 p-3 p-md-4">
          <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
            <div><h2 className="h5 fw-bold text-uppercase mb-1">Shop by category</h2><p className="small mb-0">Choose a category to browse its products.</p></div>
            <button type="button" className="btn btn-sm btn-outline-light" onClick={viewAllProducts}>View all products</button>
          </div>
          <div className="shop-category-carousel position-relative">
            <div className="shop-category-viewport" ref={categoryViewportRef}>
              <div className="shop-category-track">
                {categoryCards.map(({ category, image }, index) => <button type="button" ref={element => { categoryCardRefs.current[index] = element; }} key={category} className={`shop-category-card${activeCategoryIndex === index ? " is-active" : ""}`} onClick={() => showCategory(index)} aria-label={`Browse ${category} products`}>
                  <img src={image} alt="" loading="lazy" />
                  <span>{category}</span>
                </button>)}
              </div>
            </div>
            {categoryCards.length > 1 && <>
              <button type="button" className="shop-category-arrow shop-category-arrow-prev" aria-label="Previous categories" onClick={() => setActiveCategoryIndex(index => (index - 1 + categoryCards.length) % categoryCards.length)}><i className="bi bi-chevron-left" /></button>
              <button type="button" className="shop-category-arrow shop-category-arrow-next" aria-label="Next categories" onClick={() => setActiveCategoryIndex(index => (index + 1) % categoryCards.length)}><i className="bi bi-chevron-right" /></button>
            </>}
          </div>
          {categoryCards.length > 1 && <div className="shop-category-dots" aria-label="Choose a category slide">{categoryCards.map(({ category }, index) => <button type="button" key={category} className={activeCategoryIndex === index ? "is-active" : ""} aria-label={`Show ${category}`} aria-current={activeCategoryIndex === index ? "true" : undefined} onClick={() => setActiveCategoryIndex(index)} />)}</div>}
        </section>}
        {!selectedCategory && recentlyViewed.length > 0 && <section className="mb-4 bg-white p-4 border">
          <h2 className="h5 fw-bold text-uppercase mb-3">Recently viewed</h2>
          <div className="d-flex gap-3 overflow-auto">{recentlyViewed.map(p => <Link key={p.id} to={`/product/${p.id}`} className="text-dark text-decoration-none border p-2 flex-shrink-0" style={{ width: 170 }}>
            <img src={p.imageUrl || unplugged} alt={p.name} className="w-100 bg-light mb-2" style={{ height: 100, objectFit: "contain" }} />
            <div className="small text-truncate">{p.name}</div><strong>₹{getSalePrice(p)}</strong>{getDiscountPercentage(p) > 0 && <small className="text-danger fw-bold">{getDiscountPercentage(p)}% OFF</small>}
          </Link>)}</div>
        </section>}
        {!selectedCategory && personalizedRecommendations.length > 0 && <section className="mb-4 bg-white p-4 border">
          <h2 className="h5 fw-bold text-uppercase mb-3">Picked from what you’ve viewed and added</h2>
          <div className="row g-3">{personalizedRecommendations.map(p => <div className="col-6 col-md-4 col-lg-2" key={p.id}><Link to={`/product/${p.id}`} className="d-block h-100 p-2 border text-dark text-decoration-none">
            <img src={p.imageUrl || unplugged} alt={p.name} className="w-100 bg-light mb-2" style={{ height: 110, objectFit: "contain" }} /><div className="small text-truncate">{p.name}</div><strong>₹{getSalePrice(p)}</strong>{getDiscountPercentage(p) > 0 && <small className="text-danger fw-bold d-block">{getDiscountPercentage(p)}% OFF</small>}
          </Link></div>)}</div>
        </section>}
        <div className="row g-3" id="product-results">
          {visibleProducts.length > 0 ? (
            visibleProducts.map((product) => (
              <div className="col-6 col-md-4 col-lg-3 col-xl-2 mb-2" key={product.id}>
                {/* Modern Card Design */}
                <div className="product-card h-100 d-flex flex-column bg-white p-3 border-0 transition-all shadow-hover">
                  <Link to={`/product/${product.id}`} className="product-card-link text-decoration-none text-dark d-flex flex-column flex-grow-1">
                    
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
                  </Link>

                    {/* Price & Action Footer */}
                    <div className="product-card-footer mt-auto pt-3 border-top">
                      <div className="product-card-price-row mb-2">
                        <div className="d-flex flex-column">
                          <div className="d-flex flex-column"><h5 className="fw-bold mb-0 text-dark">₹{getSalePrice(product)}</h5>{getDiscountPercentage(product) > 0 && <small className="text-muted text-decoration-line-through">₹{product.price}</small>}</div>
                        </div>
                        
                        <div className="product-card-actions">
                          <button 
                            type="button"
                            className="product-card-wishlist btn btn-outline-secondary border"
                            aria-label={`Add ${product.name} to wishlist`}
                            onClick={() => addToWishlist(product.id)}
                          >
                            <i className="bi bi-heart"></i>
                          </button>
                          <button 
                            type="button"
                            className="product-card-add btn btn-warning fw-bold px-3 shadow-sm rounded-1"
                            aria-label={`Add ${product.name} to bag`}
                            disabled={!product.productAvailable || Number(product.stockQuantity) <= 0}
                            onClick={() => addToCart(product)}
                            style={{ fontSize: '12px' }}
                          >
                            {Number(product.stockQuantity) > 0 ? "ADD" : "SOLD OUT"}
                          </button>
                        </div>
                      </div>
                      
                      <div className="d-flex flex-column gap-1">
                        {getDiscountPercentage(product) > 0 && <small className="text-danger fw-bold text-uppercase" style={{ fontSize: '10px' }}>{getDiscountPercentage(product)}% OFF</small>}
                        <div className="d-flex align-items-center gap-1">
                          <i className="bi bi-truck text-primary" style={{ fontSize: '12px' }}></i>
                          <small className="text-primary fw-bold" style={{ fontSize: '10px' }}>Free delivery over {"\u20B9"}499</small>
                        </div>
                      </div>
                    </div>
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
              <Link to="/support">Customer support</Link>
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
