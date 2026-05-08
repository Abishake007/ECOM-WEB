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
    e.preventDefault();
    setMessage("");
    setLoading(true);

    AuthService.login(username, password)
      .then((data) => {
        setLoading(false);
        navigate("/");
        window.location.reload(); 
      })
      .catch((error) => {
        setLoading(false);
        const resMessage = error.response?.data?.message || error.message || "LOGIN FAILED";
        setMessage(resMessage);
      });
  };

  return (
    <div className="auth-page-wrapper d-flex align-items-center justify-content-center bg-white" 
         style={{ minHeight: "100vh", fontFamily: "'Oswald', sans-serif" }}>
      
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            {/* Minimalist Card: Sharp edges, heavy borders */}
            <div className="card border border-dark border-2 p-4 p-lg-5 shadow-none" style={{ borderRadius: "0px" }}>
              
              <div className="text-start mb-5">
                <h1 className="fw-black text-uppercase mb-2" style={{ letterSpacing: "1px", fontSize: "2.5rem" }}>
                  Login
                </h1>
                <p className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "1.5px" }}>
                  Access your creator account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="text-uppercase">
                <div className="mb-4">
                  <label className="fw-black mb-2 small" style={{ letterSpacing: "1px" }}>Username</label>
                  <input
                    type="text"
                    className="form-control border border-dark bg-white py-3 px-3 fw-bold"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ borderRadius: "0px", fontSize: "0.9rem" }}
                  />
                </div>

                <div className="mb-5">
                  <label className="fw-black mb-2 small" style={{ letterSpacing: "1px" }}>Password</label>
                  <input
                    type="password"
                    className="form-control border border-dark bg-white py-3 px-3 fw-bold"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ borderRadius: "0px", fontSize: "0.9rem" }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-dark w-100 py-3 fw-black text-uppercase d-flex align-items-center justify-content-between mb-4 shadow-none" 
                  disabled={loading}
                  style={{ borderRadius: "0px", letterSpacing: "2px" }}
                >
                  {loading ? (
                    <>
                      <span>Authenticating...</span>
                      <span className="spinner-border spinner-border-sm"></span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <i className="bi bi-arrow-right fs-4"></i>
                    </>
                  )}
                </button>

                {message && (
                  <div className="bg-danger text-white p-3 small text-center fw-bold mb-4" style={{ letterSpacing: "1px" }}>
                    <i className="bi bi-exclamation-square-fill me-2"></i>
                    {message}
                  </div>
                )}
              </form>

              <div className="text-start mt-4 border-top border-dark pt-4">
                <p className="text-muted small fw-bold text-uppercase mb-0" style={{ letterSpacing: "1px" }}>
                  New to the club? <br/>
                  <Link to="/signup" className="text-dark fw-black text-decoration-underline mt-2 d-inline-block">
                    Register Now
                  </Link>
                </p>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .form-control:focus { 
          box-shadow: none !important; 
          border-color: #000 !important;
          background-color: #f8f9fa !important;
        }
        input { text-transform: uppercase; }
      `}</style>
    </div>
  );
};

export default SignIn;