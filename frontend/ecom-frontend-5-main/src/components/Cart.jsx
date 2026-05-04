import React, { useContext, useEffect, useState } from "react";
import AppContext from "../Context/Context";
import CheckoutPopup from "./CheckoutPopup";
import unplugged from "../assets/unplugged.png";
import { Link } from "react-router-dom";

const Cart = () => {
  const { cart, removeFromCart } = useContext(AppContext);
  const [showPopup, setShowPopup] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const sum = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
    setTotal(sum);
  }, [cart]);

  const shipping = cart.length > 0 ? 10.00 : 0; // Flat shipping rate example

  return (
    <div className="cart-wrapper" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingTop: "100px" }}>
      <div className="container">
        <h2 className="fw-bold mb-4">Your Shopping Bag</h2>
        
        {cart.length === 0 ? (
          <div className="text-center py-5 shadow-sm bg-white rounded-4">
            <i className="bi bi-bag-x display-1 text-muted opacity-25"></i>
            <h3 className="mt-3 text-muted">Your cart is feeling light</h3>
            <p className="text-muted">Add some products to get started!</p>
            <Link to="/" className="btn btn-primary rounded-pill px-4 mt-2">Go Shopping</Link>
          </div>
        ) : (
          <div className="row g-4">
            {/* 1. Left Side: Cart Items List */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="list-group list-group-flush">
                  {cart.map((item) => (
                    <div key={item.id} className="list-group-item p-4 border-bottom">
                      <div className="row align-items-center">
                        <div className="col-3 col-md-2">
                          <img 
                            src={item.imageUrl || (item.imageData ? `data:${item.imageType};base64,${item.imageData}` : unplugged)} 
                            alt={item.name} 
                            className="img-fluid rounded-3 shadow-sm"
                            style={{ objectFit: "contain", backgroundColor: "#fff" }} 
                          />
                        </div>
                        <div className="col-5 col-md-6">
                          <h6 className="fw-bold mb-1 text-truncate">{item.name?.toUpperCase()}</h6>
                          <p className="text-muted small mb-0">Unit Price: ${item.price}</p>
                          <div className="d-flex align-items-center mt-2">
                             <span className="badge bg-light text-dark border fw-normal">Quantity: {item.quantity || 1}</span>
                          </div>
                        </div>
                        <div className="col-4 col-md-4 text-end">
                          <h5 className="fw-bold mb-2">${(item.price * (item.quantity || 1)).toFixed(2)}</h5>
                          <button 
                            className="btn btn-sm btn-link text-danger text-decoration-none p-0" 
                            onClick={() => removeFromCart(item.id)}
                          >
                            <i className="bi bi-trash3 me-1"></i> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Right Side: Order Summary Sidebar */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: "110px" }}>
                <h5 className="fw-bold mb-4">Order Summary</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Estimated Shipping</span>
                  <span className="fw-semibold">${shipping.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-4">
                  <span className="text-muted">Tax</span>
                  <span className="fw-semibold">Calculated at checkout</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4 mt-2">
                  <span className="h5 fw-bold">Total</span>
                  <span className="h5 fw-bold text-primary">${(total + shipping).toFixed(2)}</span>
                </div>
                <button 
                  className="btn btn-primary btn-lg w-100 rounded-pill fw-bold" 
                  style={{ backgroundColor: "#764ba2", border: "none" }}
                  onClick={() => setShowPopup(true)}
                >
                  Proceed to Checkout
                </button>
                <div className="text-center mt-3">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" height="20" className="me-2 opacity-50"/>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/Visa_Inc._logo_%282005%E2%80%932014%29.svg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original" alt="Visa" height="15" className="me-3 opacity-75"/>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" height="20" className="opacity-50"/>
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
          totalPrice={total + shipping} 
          cartItems={cart}
        />
      )}
    </div>
  );
};

export default Cart;