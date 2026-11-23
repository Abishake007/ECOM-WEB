import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../axios";
import AuthService from "../services/auth.service";

const AdminRoute = ({ children }) => {
  const [access, setAccess] = useState("checking");

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    const token = user?.accessToken || user?.token || user?.jwt;
    if (!token) {
      setAccess("unauthenticated");
      return;
    }

    API.get("/admin/access")
      .then(() => setAccess("allowed"))
      .catch(error => {
        if (error.response?.status === 401) {
          AuthService.logout();
          setAccess("unauthenticated");
        } else if (error.response?.status === 403) {
          setAccess("forbidden");
        } else {
          setAccess("unavailable");
        }
      });
  }, []);

  if (access === "checking") return <main className="container text-center" style={{ paddingTop: 180 }}>Checking administrator access…</main>;
  if (access === "unauthenticated") return <Navigate to="/login" replace />;
  if (access === "forbidden") return <Navigate to="/" replace />;
  if (access === "unavailable") return <main className="container alert alert-warning" style={{ marginTop: 180 }}>Could not verify administrator access. Please try again.</main>;
  return children;
};

export default AdminRoute;
