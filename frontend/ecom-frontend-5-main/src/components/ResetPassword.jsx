import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../axios";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async event => {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try { const response = await API.post("/auth/password-reset/confirm", { token, password }); setMessage(response.data.message); }
    catch (requestError) { setError(requestError.response?.data?.message || "This reset link is invalid or expired. Request a new one."); }
    finally { setLoading(false); }
  };
  return <main className="container" style={{ maxWidth: 500, paddingTop: 160 }}><h1 className="h3 fw-bold text-uppercase">Choose a new password</h1>{!token ? <p className="alert alert-warning">This reset link is missing its token.</p> : <form onSubmit={submit}><label className="form-label" htmlFor="new-password">New password</label><input id="new-password" className="form-control mb-3" type="password" minLength="8" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required /><small className="text-muted d-block mb-3">Use at least 8 characters.</small><button className="btn btn-dark" disabled={loading}>{loading ? "Updating…" : "Update password"}</button></form>}{message && <p className="alert alert-success mt-3">{message}</p>}{error && <p className="alert alert-danger mt-3">{error}</p>}<Link className="d-inline-block mt-3 text-dark" to="/login">Back to sign in</Link></main>;
};

export default ResetPassword;
