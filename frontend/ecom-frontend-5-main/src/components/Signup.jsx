import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthService from "../services/auth.service";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successful, setSuccessful] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setMessage("");
    setSuccessful(false);

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    AuthService.register(username, email, password).then(
      (response) => {
        setMessage(response.data.message);
        setSuccessful(true);
        setLoading(false);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        setMessage(resMessage);
        setSuccessful(false);
        setLoading(false);
      }
    );
  };

  return (
    <div className="auth-page-wrapper d-flex align-items-center justify-content-center" 
         style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "20px" }}>
      
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card border-0 shadow-lg p-4 p-lg-5" style={{ borderRadius: "24px" }}>
              
              <div className="text-center mb-4">
                <div className="d-inline-block p-3 rounded-circle bg-light mb-3">
                  <i className="bi bi-person-plus-fill text-primary fs-2"></i>
                </div>
                <h2 className="fw-bold">Create Account</h2>
                <p className="text-muted">Join our community today</p>
              </div>

              <form onSubmit={handleRegister}>
                {!successful && (
                  <>
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

                    <div className="form-floating mb-3">
                      <input
                        type="email"
                        className="form-control bg-light border-0"
                        id="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ borderRadius: "12px" }}
                      />
                      <label htmlFor="email">Email address</label>
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
                      <label htmlFor="password">Password (min. 6 chars)</label>
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
                          Creating Account...
                        </>
                      ) : (
                        "Sign Up"
                      )}
                    </button>
                  </>
                )}

                {message && (
                  <div className={`alert border-0 small text-center mb-0 ${successful ? "alert-success" : "alert-danger"}`} 
                       style={{ borderRadius: "12px" }}>
                    <i className={`bi ${successful ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"} me-2`}></i>
                    {message}
                  </div>
                )}
              </form>

              <div className="text-center mt-4 border-top pt-4">
                <p className="text-muted mb-0">
                  Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Sign In</Link>
                </p>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;