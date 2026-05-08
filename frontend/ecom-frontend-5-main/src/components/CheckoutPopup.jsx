import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from '../axios';
import PaymentForm from './PaymentForm';
import unplugged from "../assets/unplugged.png";

const stripePromise = loadStripe('pk_test_51TSWaI2OVQWK9oI9tI1U8cesyrjqJJftRr0Iwh44BBhZJyVTLQdKwxLdF0RNa5m9YizAt3e5vWhjFpPbF60qZL0U00NfncpOp4');

const CheckoutPopup = ({ show, handleClose, cartItems, totalPrice, handleCheckout }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && totalPrice > 0) {
      setLoading(true);
      axios.post('/payment/create-payment-intent', {
        amount: Math.round(totalPrice * 100),
        currency: 'inr'
      })
      .then(res => {
        setClientSecret(res.data.clientSecret);
        setLoading(false);
      })
      .catch(err => {
        console.error("Payment Init Error:", err);
        setLoading(false);
      });
    }
  }, [show, totalPrice]);

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      size="lg" 
      backdrop="static"
      className="adidas-modal"
    >
      <Modal.Header closeButton className="border-0 bg-white">
        <Modal.Title className="fw-black text-uppercase Oswald-font pt-3" style={{ letterSpacing: '1.5px' }}>
          Secure Checkout
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4 bg-white">
        <div className="row g-0 border border-dark border-2">
          {/* Summary Side */}
          <div className="col-md-5 border-end border-dark p-4 bg-light">
            <h6 className="fw-black text-uppercase small mb-4">Order Summary</h6>
            
            <div className="checkout-items no-scrollbar" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {cartItems.map((item) => {
                // FIXED IMAGE LOGIC: Handles both URL and Base64 data
                const displayImg = item.imageUrl || 
                  (item.imageData ? `data:${item.imageType};base64,${item.imageData}` : unplugged);

                return (
                  <div key={item.id} className="d-flex align-items-center mb-3 pb-3 border-bottom border-secondary border-opacity-25">
                    <div className="bg-white border border-dark p-1 me-3" style={{ width: '60px', height: '60px' }}>
                      <img 
                        src={displayImg} 
                        alt={item.name} 
                        className="img-fluid h-100 w-100" 
                        style={{ objectFit: 'contain' }} 
                      />
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <p className="mb-0 fw-black text-uppercase small text-truncate" style={{ fontSize: '11px' }}>{item.name}</p>
                      <p className="mb-0 text-muted fw-bold" style={{ fontSize: '9px' }}>QTY: {item.quantity || 1}</p>
                    </div>
                    <div className="ms-2">
                      <span className="fw-black small">₹{(item.price * (item.quantity || 1)).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-3 border-top border-dark">
              <div className="d-flex justify-content-between mb-2 text-uppercase fw-bold" style={{ fontSize: '11px' }}>
                <span>Subtotal</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <span className="h4 fw-black text-uppercase Oswald-font">Total</span>
                <span className="h4 fw-black Oswald-font">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 p-3 border border-dark d-flex align-items-center bg-white">
              <i className="bi bi-shield-lock-fill text-dark fs-5 me-3"></i>
              <div className="fw-bold text-uppercase" style={{ fontSize: '8px', letterSpacing: '0.5px', lineHeight: '1.4' }}>
                Your data is encrypted and processed via Stripe secure gateway.
              </div>
            </div>
          </div>

          {/* Payment Side */}
          <div className="col-md-7 p-4 bg-white">
            <h6 className="fw-black text-uppercase small mb-4">Payment Details</h6>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="dark" />
                <p className="mt-3 fw-black text-uppercase small">Initializing...</p>
              </div>
            ) : clientSecret ? (
              <Elements options={{ clientSecret }} stripe={stripePromise}>
                <PaymentForm totalPrice={totalPrice} onPaymentSuccess={handleCheckout} />
              </Elements>
            ) : (
              <div className="bg-danger text-white p-3 fw-bold text-uppercase small">
                Service unavailable.
              </div>
            )}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 bg-white justify-content-start pb-4">
        <Button variant="link" className="text-dark fw-black text-uppercase small text-decoration-underline p-0 ms-4" onClick={handleClose}>
          Cancel
        </Button>
      </Modal.Footer>

      <style>{`
        .adidas-modal .modal-content { border-radius: 0px !important; border: none; }
        .fw-black { font-weight: 900 !important; }
        .Oswald-font { font-family: 'Oswald', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </Modal>
  );
};

export default CheckoutPopup;