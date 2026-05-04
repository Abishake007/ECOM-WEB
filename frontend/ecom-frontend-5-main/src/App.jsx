import "./App.css";
import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AdminUsers from "./components/AdminUsers";
import AdminProducts from "./components/AdminProducts"; 
import Wishlist from "./components/Wishlist";
import OrderHistory from "./components/OrderHistory";

function App() {
  const [selectedCategory, setSelectedCategory] = useState("");

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
      <Navbar onSelectCategory={handleCategorySelect} />
      <Routes>
        <Route path="/" element={<Home selectedCategory={selectedCategory} />} />
        <Route path="/add_product" element={<AddProduct />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product/update/:id" element={<UpdateProduct />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/orders" element={<OrderHistory />} />
        
        {/* Admin Nested Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<AdminOrders />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;