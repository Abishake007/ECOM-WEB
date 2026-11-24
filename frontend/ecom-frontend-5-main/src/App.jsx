import "./App.css";
import React, { useLayoutEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Component Imports
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import UpdateProduct from "./components/UpdateProduct";
import SignIn from "./components/SignIn";
import Signup from "./components/Signup";
import AdminDashboard from "./components/AdminDashboard";
import AdminOrders from "./components/AdminOrders";
import AdminOverview from "./components/AdminOverview";
import AdminUsers from "./components/AdminUsers";
import AdminProducts from "./components/AdminProducts"; 
import Wishlist from "./components/Wishlist";
import OrderHistory from "./components/OrderHistory";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AdminRoute from "./components/AdminRoute";
import Support from "./components/Support";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <BrowserRouter 
  future={{ 
    v7_startTransition: true, 
    v7_relativeSplatPath: true 
  }}
>
      <ScrollToTop />
      <Navbar onSelectCategory={handleCategorySelect} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Routes>
        <Route path="/" element={<Home selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} onClearCategory={() => setSelectedCategory("")} searchText={searchQuery} onSearchChange={setSearchQuery} />} />
        <Route path="/add_product" element={<AddProduct />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product/update/:id" element={<UpdateProduct />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/support" element={<Support />} />
        
        {/* Admin Nested Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
