import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthService from "../services/auth.service";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
  e.preventDefault(); // Prevents the browser from refreshing the page
  setMessage("");
  setLoading(true);

  AuthService.login(username, password)
    .then((data) => {
      console.log("Login logic finished. Data:", data);
      setLoading(false);
      
      // Navigate first so React handles the state change
      navigate("/");
      
      // ONLY reload if you absolutely must update the Navbar immediately
      // Better: Use a state change in your AppContext
      window.location.reload(); 
    })
    .catch((error) => {
      setLoading(false);
      const resMessage = error.response?.data?.message || error.message || "Login Failed";
      setMessage(resMessage);
      console.error("Login Error:", error);
    });
};

  return (
    <div className="auth-page-wrapper d-flex align-items-center justify-content-center" 
         style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card border-0 shadow-lg p-4 p-lg-5" style={{ borderRadius: "24px" }}>
              
              <div className="text-center mb-4">
                <div className="d-inline-block p-3 rounded-circle bg-light mb-3">
                  <i className="bi bi-shield-lock-fill text-primary fs-2"></i>
                </div>
                <h2 className="fw-bold">Welcome Back</h2>
                <p className="text-muted">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control bg-light border-0"
                    id="username"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ borderRadius: "12px" }}
                  />
                  <label htmlFor="username">Username</label>
                </div>

                <div className="form-floating mb-4">
                  <input
                    type="password"
                    className="form-control bg-light border-0"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ borderRadius: "12px" }}
                  />
                  <label htmlFor="password">Password</label>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-3 fw-bold mb-3 shadow" 
                  disabled={loading}
                  style={{ borderRadius: "12px", backgroundColor: "#764ba2", border: "none" }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Authenticating...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>

                {message && (
                  <div className="alert alert-danger border-0 small text-center" role="alert" style={{ borderRadius: "12px" }}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {message}
                  </div>
                )}
              </form>

              <div className="text-center mt-4 border-top pt-4">
                <p className="text-muted mb-0">
                  Don't have an account? <Link to="/signup" className="text-primary fw-bold text-decoration-none">Create Account</Link>
                </p>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;