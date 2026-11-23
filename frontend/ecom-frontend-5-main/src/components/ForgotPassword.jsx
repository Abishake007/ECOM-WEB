import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async event => {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try { const response = await API.post("/auth/password-reset/request", { email }); setMessage(response.data.message); }
    catch { setError("Could not request a reset link. Please try again."); }
    finally { setLoading(false); }
  };
  return <main className="container" style={{ maxWidth: 500, paddingTop: 160 }}><h1 className="h3 fw-bold text-uppercase">Reset your password</h1><p className="text-muted">Enter your account email and we’ll send a secure reset link if it matches an account.</p><form onSubmit={submit}><label className="form-label" htmlFor="reset-email">Email</label><input id="reset-email" className="form-control mb-3" type="email" value={email} onChange={e => setEmail(e.target.value)} required /><button className="btn btn-dark" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</button></form>{message && <p className="alert alert-success mt-3">{message}</p>}{error && <p className="alert alert-danger mt-3">{error}</p>}<Link className="d-inline-block mt-3 text-dark" to="/login">Back to sign in</Link></main>;
};

export default ForgotPassword;
