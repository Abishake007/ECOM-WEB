import React, { useEffect, useState, useContext } from "react";
import API from "../axios";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import AppContext from "../Context/Context";

const Navbar = ({ onSelectCategory }) => {
  const { cart, data } = useContext(AppContext);
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (!user?.accessToken && !user?.token && !user?.jwt) {
      AuthService.logout();
      setCurrentUser(undefined);
      setIsAdmin(false);
      return;
    }
    setCurrentUser(user);
    API.get("/admin/access")
      .then(() => setIsAdmin(true))
      .catch(error => {
        setIsAdmin(false);
        if (error.response?.status === 401) {
          AuthService.logout();
          setCurrentUser(undefined);
        }
      });
  }, []);

  const logOut = () => {
    AuthService.logout();
    setCurrentUser(undefined);
    setIsAdmin(false);
    navigate("/login");
  };

  const handleSearch = async (value) => {
    setInput(value);
    if (value.length >= 1) {
      setShowSearchResults(true);
      try {
        const response = await API.get(`/products/search?keyword=${encodeURIComponent(value)}`);
        setSearchResults(response.data);
      } catch (error) { console.error("Search Error:", error); }
    } else {
      setShowSearchResults(false);
    }
  };

  const categoryLabels = new Map();
  (data || []).forEach(product => {
    const label = product.category?.trim();
    if (label) {
      const key = label.toLocaleLowerCase();
      categoryLabels.set(key, key === "toys" ? "Toys" : (categoryLabels.get(key) || label));
    }
  });
  categoryLabels.set("toys", "Toys");
  const categories = [...categoryLabels.values()].sort((a, b) => a.localeCompare(b));
  const showAdminBoard = Boolean(currentUser && isAdmin && currentUser.roles?.includes("ROLE_ADMIN"));

  return (
    <header className="fixed-top adidas-nav bg-white shadow-sm">
      {/* Top Utility Bar */}
      <div className="nav-utility d-flex justify-content-end px-4 py-1 border-bottom bg-white">
        <div className="d-flex gap-4 small fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>
          {currentUser ? (
            <span className="cursor-pointer text-dark hover-underline" onClick={logOut}>Logout</span>
          ) : (
            <Link to="/login" className="text-decoration-none text-dark hover-underline">Join Us / Sign In</Link>
          )}
          <Link to="/wishlist" className="text-decoration-none text-dark hover-underline">Wishlist</Link>
          <Link to="/orders" className="text-decoration-none text-dark hover-underline">Orders</Link>
          <Link to="/support" className="text-decoration-none text-dark hover-underline">Support</Link>
          {showAdminBoard && <Link to="/admin" className="text-decoration-none text-danger fw-black">Admin Central</Link>}
        </div>
      </div>

      {/* Main Navbar Row */}
      <div className="nav-main d-flex align-items-center justify-content-between gap-4 px-4 py-3 bg-white">
        <Link className="navbar-brand text-dark fw-black mb-0" to="/" onClick={() => onSelectCategory("")} style={{ fontSize: '28px', letterSpacing: '-1.5px' }}>
          KLYRO
        </Link>

        <nav className="category-nav d-flex align-items-center gap-4 flex-grow-1" aria-label="Product categories">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              className="adidas-link category-link fw-bold text-uppercase"
              onClick={() => { onSelectCategory(cat); navigate("/"); }}
            >
              {cat}
            </button>
          ))}
        </nav>

        <div className="nav-actions d-flex align-items-center gap-4">
          {/* Desktop Search Box */}
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

          <Link to="/cart" className="text-dark text-decoration-none position-relative ms-2">
            <i className="bi bi-bag fs-4 fw-bold"></i>
            {cart.length > 0 && (
              <span className="adidas-cart-badge">{cart.length}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Search Row - Positioned outside to prevent layout overlap */}
      <div className="d-md-none px-4 pb-3 bg-white">
        <div className="search-input-container position-relative w-100">
          <input
            type="text"
            className="adidas-search-input w-100"
            placeholder="SEARCH"
            value={input}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <i className="bi bi-search search-icon"></i>

          {/* Mobile Search Results */}
          {showSearchResults && (
            <div className="adidas-search-dropdown shadow-lg position-absolute start-0 w-100 mt-1 bg-white border p-2" style={{ zIndex: 1000 }}>
              {searchResults.length > 0 ? (
                searchResults.map(result => (
                  <Link key={result.id} to={`/product/${result.id}`} className="search-item d-block p-2 text-dark text-decoration-none" onClick={() => setShowSearchResults(false)}>
                    {result.name}
                  </Link>
                ))
              ) : <div className="p-3 small text-muted text-center fw-bold">NO RESULTS FOUND</div>}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
