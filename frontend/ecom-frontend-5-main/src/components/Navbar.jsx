import React, { useEffect, useState, useContext } from "react";
import API from "../axios";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import AppContext from "../Context/Context";

const Navbar = ({ onSelectCategory }) => {
  const { cart } = useContext(AppContext);
  const navigate = useNavigate();

  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme ? storedTheme : "light-theme";
  };

  const [selectedCategory, setSelectedCategory] = useState("");
  const [theme, setTheme] = useState(getInitialTheme());
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const logOut = () => {
    AuthService.logout();
    setCurrentUser(undefined);
    navigate("/login");
  };

  const handleChange = async (value) => {
    setInput(value);
    if (value.length >= 1) {
      setShowSearchResults(true);
      try {
        const response = await API.get(`/products/search?keyword=${value}`);
        setSearchResults(response.data);
        setNoResults(response.data.length === 0);
      } catch (error) {
        console.error("Error searching:", error);
      }
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
      setNoResults(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    onSelectCategory(category);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark-theme" ? "light-theme" : "dark-theme";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const categories = ["Laptop", "Headphone", "Mobile", "Electronics", "Toys", "Fashion"];
  const showAdminBoard = currentUser && currentUser.roles?.includes("ROLE_ADMIN");

  return (
    <header className="main-header">
      <nav className="navbar navbar-expand-lg fixed-top shadow-sm py-3" 
           style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)" }}>
        <div className="container">
          <Link className="navbar-brand fw-bold fs-4 text-primary" to="/" style={{ letterSpacing: "-1px" }}>
            ECOM<span className="text-dark">WEB</span>
          </Link>

          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navContent">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
              <li className="nav-item">
                <Link className="nav-link fw-semibold" to="/">Home</Link>
              </li>
              
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle fw-semibold" href="#" role="button" data-bs-toggle="dropdown">
                  Categories
                </a>
                <ul className="dropdown-menu border-0 shadow-lg mt-3">
                  <li>
                    <button className="dropdown-item" onClick={() => handleCategorySelect("")}>
                      All Products
                    </button>
                  </li>
                  <hr className="dropdown-divider" />
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button className="dropdown-item" onClick={() => handleCategorySelect(cat)}>
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>

            {/* Search Bar Group */}
            <div className="search-box me-lg-4 position-relative">
              <div className="input-group">
                <span className="input-group-text bg-light border-0 rounded-start-pill ps-3">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  className="form-control bg-light border-0 rounded-end-pill py-2 pe-4"
                  type="search"
                  placeholder="Find products..."
                  value={input}
                  onChange={(e) => handleChange(e.target.value)}
                  style={{ width: "250px" }}
                />
              </div>

              {showSearchResults && (
                <div className="search-results-dropdown shadow-lg rounded-4 position-absolute w-100 mt-2 p-2 bg-white border border-light" 
                     style={{ zIndex: 1050 }}>
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <Link 
                        key={result.id} 
                        to={`/product/${result.id}`} 
                        className="d-block p-2 text-decoration-none text-dark hover-gray rounded-3"
                        onClick={() => setShowSearchResults(false)}
                      >
                        <i className="bi bi-arrow-right me-2 opacity-50"></i>
                        {result.name}
                      </Link>
                    ))
                  ) : noResults && (
                    <div className="p-3 text-center text-muted small">No results found for "{input}"</div>
                  )}
                </div>
              )}
            </div>

            <div className="d-flex align-items-center gap-3">
              {/* Theme Toggle */}
              <button className="btn btn-link text-dark p-0 fs-5" onClick={toggleTheme}>
                {theme === "dark-theme" ? <i className="bi bi-moon-stars"></i> : <i className="bi bi-sun"></i>}
              </button>

              <Link className="nav-link position-relative fs-5 p-0" to="/wishlist">
                <i className="bi bi-heart text-danger"></i>
              </Link>

              <Link className="nav-link position-relative fs-5 p-0 me-2" to="/cart">
                <i className="bi bi-bag"></i>
                {cart.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" 
                        style={{ fontSize: "0.6rem" }}>
                    {cart.length}
                  </span>
                )}
              </Link>

              {currentUser ? (
                <div className="dropdown">
                  <button className="btn btn-primary rounded-pill px-4 dropdown-toggle" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle me-2"></i>
                    {currentUser.username}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg mt-2 py-2" style={{ borderRadius: "12px" }}>
                    <li className="px-3 py-1 small text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>Account</li>
                    
                    {/* Order History Link */}
                    <li>
                      <Link className="dropdown-item py-2" to="/orders">
                        <i className="bi bi-clock-history me-2 text-primary"></i> Order History
                      </Link>
                    </li>
                    
                    {showAdminBoard && (
                      <li>
                        <Link className="dropdown-item py-2" to="/admin/orders">
                          <i className="bi bi-speedometer2 me-2 text-danger"></i> Admin Panel
                        </Link>
                      </li>
                    )}
                    
                    <li><hr className="dropdown-divider mx-2" /></li>
                    <li>
                      <button className="dropdown-item text-danger py-2" onClick={logOut}>
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <Link to="/login" className="btn btn-outline-primary rounded-pill px-4">Login</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;