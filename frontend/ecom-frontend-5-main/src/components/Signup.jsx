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
      setMessage("PASSWORD MUST BE AT LEAST 6 CHARACTERS LONG.");
      return;
    }

    setLoading(true);

    AuthService.register(username, email, password).then(
      (response) => {
        setMessage(response.data.message.toUpperCase());
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

        setMessage(resMessage.toUpperCase());
        setSuccessful(false);
        setLoading(false);
      }
    );
  };

  return (
    <div className="auth-page-wrapper d-flex align-items-center justify-content-center bg-white" 
         style={{ minHeight: "100vh", fontFamily: "'Oswald', sans-serif", padding: "20px" }}>
      
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            {/* Minimalist Card: Sharp edges, heavy borders */}
            <div className="card border border-dark border-2 p-4 p-lg-5 shadow-none" style={{ borderRadius: "0px" }}>
              
              <div className="text-start mb-5">
                <h1 className="fw-black text-uppercase mb-2" style={{ letterSpacing: "1px", fontSize: "2.5rem" }}>
                  Join Us
                </h1>
                <p className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "1.5px" }}>
                  Become a member of the club
                </p>
              </div>

              <form onSubmit={handleRegister} className="text-uppercase">
                {!successful && (
                  <>
                    <div className="mb-4">
                      <label className="fw-black mb-2 small" style={{ letterSpacing: "1px" }}>Username</label>
                      <input
                        type="text"
                        className="form-control border border-dark bg-white py-3 px-3 fw-bold"
                        placeholder="CHOOSE A USERNAME"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ borderRadius: "0px", fontSize: "0.9rem" }}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="fw-black mb-2 small" style={{ letterSpacing: "1px" }}>Email Address</label>
                      <input
                        type="email"
                        className="form-control border border-dark bg-white py-3 px-3 fw-bold"
                        placeholder="EMAIL@EXAMPLE.COM"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ borderRadius: "0px", fontSize: "0.9rem" }}
                      />
                    </div>

                    <div className="mb-5">
                      <label className="fw-black mb-2 small" style={{ letterSpacing: "1px" }}>Password</label>
                      <input
                        type="password"
                        className="form-control border border-dark bg-white py-3 px-3 fw-bold"
                        placeholder="MINIMUM 6 CHARACTERS"
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
                          <span>Processing...</span>
                          <span className="spinner-border spinner-border-sm"></span>
                        </>
                      ) : (
                        <>
                          <span>Register Now</span>
                          <i className="bi bi-arrow-right fs-4"></i>
                        </>
                      )}
                    </button>
                  </>
                )}

                {message && (
                  <div className={`p-3 small text-center fw-bold mb-0 ${successful ? "bg-success text-white" : "bg-danger text-white"}`} 
                       style={{ letterSpacing: "1px" }}>
                    <i className={`bi ${successful ? "bi-check-square-fill" : "bi-exclamation-square-fill"} me-2`}></i>
                    {message}
                  </div>
                )}
              </form>

              <div className="text-start mt-4 border-top border-dark pt-4">
                <p className="text-muted small fw-bold text-uppercase mb-0" style={{ letterSpacing: "1px" }}>
                  Already a member? <br/>
                  <Link to="/login" className="text-dark fw-black text-decoration-underline mt-2 d-inline-block">
                    Sign In Here
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
        input::placeholder { color: #adb5bd; font-size: 0.8rem; }
        input { text-transform: uppercase; }
      `}</style>
    </div>
  );
};

export default Signup;