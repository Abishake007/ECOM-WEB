import React, { useContext, useEffect, useState } from "react";
import AppContext from "../Context/Context";
import CheckoutPopup from "./CheckoutPopup";
import unplugged from "../assets/unplugged.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import API from "../axios";
import { getDiscountPercentage, getSalePrice } from "../utils/pricing";
import { getImageUrl } from "../utils/imageUrl";

const Cart = () => {
  const { cart, removeFromCart, clearCart, notify, refreshData } = useContext(AppContext);
  const [showPopup, setShowPopup] = useState(false);
  const [total, setTotal] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (new URLSearchParams(location.search).get("checkout") === "1" && (user?.accessToken || user?.token || user?.jwt)) {
      setShowPopup(true);
      navigate("/cart", { replace: true });
    }
  }, [location.search, navigate]);

  const beginCheckout = () => {
    const user = AuthService.getCurrentUser();
    if (!user?.accessToken && !user?.token && !user?.jwt) {
      navigate("/login", { state: { from: "/cart?checkout=1" } });
      return;
    }
    setShowPopup(true);
  };

  useEffect(() => {
    const sum = cart.reduce((acc, item) => acc + getSalePrice(item) * (item.quantity || 1), 0);
    setTotal(sum);
    setDiscount(0);
    setCouponMessage("");
  }, [cart]);

  const shipping = cart.length > 0 && total < 499 ? 10.00 : 0;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    const rate = code === "KLYRO10" ? 0.10 : code === "WELCOME15" ? 0.15 : 0;
    if (!rate) { setDiscount(0); setCouponMessage("That coupon code is not valid."); return; }
    const amount = Number((total * rate).toFixed(2));
    setDiscount(amount);
    setCouponMessage(`${code} applied: ₹${amount.toFixed(2)} off.`);
  };

  const completeCheckout = async (shippingDetails, paymentMethod = "STRIPE") => {
    try {
      const address = shippingDetails.address;
      const shippingAddress = [shippingDetails.name, address.line1, address.line2, address.city, address.state, address.postal_code, address.country].filter(Boolean).join(", ");
      await API.post("/orders", {
        couponCode: discount ? coupon.trim().toUpperCase() : "", paymentMethod, shippingAddress,
        phoneNumber: shippingDetails.phone || "",
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity || 1 }))
      });
      clearCart();
      refreshData();
      notify(paymentMethod === "COD" ? "Order placed. Pay the delivery partner when it arrives." : "Payment complete. Your order is being processed.");
      setShowPopup(false);
      navigate("/orders");
    } catch (error) {
      const message = typeof error.response?.data === "string" ? error.response.data : error.response?.data?.message;
      const fallback = paymentMethod === "COD" ? "We could not place your order. Please try again." : "Payment succeeded, but order confirmation failed. Contact support with your payment receipt.";
      notify(message || fallback, "error");
      if (paymentMethod === "COD") throw new Error(message || fallback);
    }
  };

  return (
    <div className="cart-wrapper bg-white" style={{ minHeight: "100vh", paddingTop: "24px", paddingBottom: "80px" }}>
      <div className="container">
        <h1 className="fw-black text-uppercase mb-5 Oswald-font" style={{ letterSpacing: "1.5px", fontSize: "2.5rem" }}>
          Your Bag <span className="text-muted fw-normal">({cart.length})</span>
        </h1>
        
        {cart.length === 0 ? (
          <div className="text-start py-5 border border-dark p-4 p-lg-5" style={{ borderRadius: "0px" }}>
            <h2 className="fw-black text-uppercase Oswald-font">Your bag is empty</h2>
            <p className="text-muted fw-bold text-uppercase small mb-4" style={{ letterSpacing: "1px" }}>Once you add something to your bag, it will appear here.</p>
            <Link to="/" className="btn btn-dark fw-black text-uppercase px-5 py-3 shadow-none" style={{ borderRadius: "0px", letterSpacing: "2px" }}>
              Shop Now <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          </div>
        ) : (
          <div className="row g-5">
            {/* 1. Left Side: Cart Items List */}
            <div className="col-lg-8">
              <div className="border-top border-dark">
                {cart.map((item) => (
                  <div key={item.id} className="py-4 border-bottom border-dark">
                    <div className="row align-items-start">
                      <div className="col-4 col-md-3">
                        <div className="bg-light p-2 text-center">
                          <img 
                            src={getImageUrl(item.imageUrl) || unplugged}
                            alt={item.name} 
                            className="img-fluid"
                            style={{ maxHeight: "150px", objectFit: "contain" }} 
                          />
                        </div>
                      </div>
                      <div className="col-8 col-md-9 d-flex flex-column justify-content-between h-100">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="fw-black text-uppercase Oswald-font mb-1" style={{ letterSpacing: "0.5px" }}>{item.name}</h5>
                            <p className="text-muted small fw-bold text-uppercase mb-0">Price: ₹{getSalePrice(item)}{getDiscountPercentage(item) > 0 && <> <span className="text-decoration-line-through">₹{item.price}</span> ({getDiscountPercentage(item)}% off)</>}</p>
                            <p className="small fw-bold text-uppercase mt-1">Quantity: {item.quantity || 1}</p>
                          </div>
                          <div className="text-end">
                            <h5 className="fw-black Oswald-font">₹{(getSalePrice(item) * (item.quantity || 1)).toFixed(2)}</h5>
                          </div>
                        </div>
                        <div className="mt-3">
                          <button 
                            className="btn btn-link text-dark text-uppercase fw-black p-0 small text-decoration-underline" 
                            onClick={() => removeFromCart(item.id)}
                            style={{ fontSize: "11px", letterSpacing: "1px" }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Right Side: Order Summary Sidebar */}
            <div className="col-lg-4">
              <div className="border border-dark p-4 sticky-top" style={{ top: "160px", borderRadius: "0px" }}>
                <h4 className="fw-black text-uppercase Oswald-font mb-4">Summary</h4>
                
                <div className="d-flex justify-content-between mb-3 text-uppercase small fw-bold">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-3 text-uppercase small fw-bold">
                  <span>Shipping</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="coupon-code" className="form-label small fw-bold text-uppercase">Discount code</label>
                  <div className="input-group"><input id="coupon-code" className="form-control" value={coupon} onChange={e => { setCoupon(e.target.value); setDiscount(0); setCouponMessage(""); }} placeholder="Enter code" /><button type="button" className="btn btn-outline-dark" onClick={applyCoupon}>Apply</button></div>
                  {couponMessage && <small className={discount ? "text-success" : "text-danger"} role="status">{couponMessage}</small>}
                </div>
                {discount > 0 && <div className="d-flex justify-content-between mb-3 text-uppercase small fw-bold text-success"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
                
                <div className="d-flex justify-content-between mb-4 text-uppercase small fw-bold">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                
                <div className="border-top border-dark pt-3 d-flex justify-content-between mb-4">
                  <span className="h5 fw-black text-uppercase Oswald-font">Total</span>
                  <span className="h5 fw-black Oswald-font">₹{(total + shipping - discount).toFixed(2)}</span>
                </div>

                <button 
                  className="btn btn-dark btn-lg w-100 fw-black text-uppercase d-flex align-items-center justify-content-between px-4 py-3 shadow-none" 
                  style={{ borderRadius: "0px", letterSpacing: "2px" }}
                  onClick={beginCheckout}
                >
                  <span>Checkout</span>
                  <i className="bi bi-arrow-right fs-4"></i>
                </button>

                <div className="mt-4 border-top border-light pt-3 d-flex justify-content-center gap-3 grayscale">
                   <i className="bi bi-credit-card fs-4"></i>
                   <i className="bi bi-paypal fs-4"></i>
                   <i className="bi bi-wallet2 fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPopup && (
        <CheckoutPopup 
          show={showPopup} 
          handleClose={() => setShowPopup(false)} 
          totalPrice={total + shipping - discount}
          cartItems={cart}
          handleCheckout={completeCheckout}
        />
      )}

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .Oswald-font { font-family: 'Oswald', sans-serif; }
        .grayscale i { opacity: 0.6; filter: grayscale(1); }
        .btn-link:hover { color: #555 !important; }
      `}</style>
    </div>
  );
};

export default Cart;
