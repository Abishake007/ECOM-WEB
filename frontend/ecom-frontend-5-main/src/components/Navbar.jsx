import React, { useEffect, useState, useContext } from "react";
import API from "../axios";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import AppContext from "../Context/Context";

const Navbar = ({ onSelectCategory }) => {
  const { cart } = useContext(AppContext);
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  const logOut = () => {
    AuthService.logout();
    setCurrentUser(undefined);
    navigate("/login");
  };

  const handleSearch = async (value) => {
    setInput(value);
    if (value.length >= 1) {
      setShowSearchResults(true);
      try {
        const response = await API.get(`/products/search?keyword=${value}`);
        setSearchResults(response.data);
      } catch (error) { console.error("Search Error:", error); }
    } else {
      setShowSearchResults(false);
    }
  };

  const categories = ["Laptop", "Camera", "Mobile", "Electronics", "Toys", "Fashion"];
  const showAdminBoard = currentUser && currentUser.roles?.includes("ROLE_ADMIN");

  return (
    <header className="fixed-top adidas-nav bg-white shadow-sm">
      {/* Top Utility Bar: Clean & Minimalist */}
      <div className="nav-utility d-flex justify-content-end px-4 py-1 border-bottom bg-white">
        <div className="d-flex gap-4 small fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>
          {currentUser ? (
            <span className="cursor-pointer text-dark hover-underline" onClick={logOut}>Logout</span>
          ) : (
            <Link to="/login" className="text-decoration-none text-dark hover-underline">Join Us / Sign In</Link>
          )}
          <Link to="/wishlist" className="text-decoration-none text-dark hover-underline">Wishlist</Link>
          <Link to="/orders" className="text-decoration-none text-dark hover-underline">Orders</Link>
          {showAdminBoard && <Link to="/admin" className="text-decoration-none text-danger fw-black">Admin Central</Link>}
        </div>
      </div>

      {/* Main Navbar: Bold Branding & Centered Nav */}
      <div className="nav-main d-flex align-items-center justify-content-between px-4 py-3 bg-white">
        {/* Brand Logo - Bold & Black */}
        <Link className="navbar-brand text-dark fw-black mb-0" to="/" style={{ fontSize: '28px', letterSpacing: '-1.5px' }}>
          ECOMWEB
        </Link>

        {/* Categories: Lifestyle Navigation */}
        <nav className="d-none d-lg-flex gap-5">
          {categories.map(cat => (
            <span 
              key={cat} 
              className="adidas-link fw-bold text-uppercase cursor-pointer"
              onClick={() => onSelectCategory(cat)}
            >
              {cat}
            </span>
          ))}
        </nav>

        {/* Actions: Search & Cart */}
        <div className="d-flex align-items-center gap-4">
          {/* Minimalist Search Box */}
          <div className="position-relative d-none d-md-block">
            <div className="search-input-container">
              <input
                type="text"
                className="adidas-search-input"
                placeholder="SEARCH"
                value={input}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <i className="bi bi-search search-icon"></i>
            </div>
            
            {showSearchResults && (
              <div className="adidas-search-dropdown shadow-lg position-absolute end-0 mt-2 bg-white border-0 p-2">
                {searchResults.length > 0 ? (
                  searchResults.map(result => (
                    <Link key={result.id} to={`/product/${result.id}`} className="search-item" onClick={() => setShowSearchResults(false)}>
                      {result.name}
                    </Link>
                  ))
                ) : <div className="p-3 small text-muted text-center fw-bold">NO RESULTS FOUND</div>}
              </div>
            )}
          </div>

          {/* Cart Icon: The Shopping Bag */}
          <Link to="/cart" className="text-dark text-decoration-none position-relative ms-2">
            <i className="bi bi-bag fs-4 fw-bold"></i>
            {cart.length > 0 && (
              <span className="adidas-cart-badge">{cart.length}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;