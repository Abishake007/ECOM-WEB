import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from '../axios';
import PaymentForm from './PaymentForm';

// Stripe Publishable Key
const stripePromise = loadStripe('pk_test_51TSWaI2OVQWK9oI9tI1U8cesyrjqJJftRr0Iwh44BBhZJyVTLQdKwxLdF0RNa5m9YizAt3e5vWhjFpPbF60qZL0U00NfncpOp4');

const CheckoutPopup = ({ show, handleClose, cartItems, totalPrice, handleCheckout }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && totalPrice > 0) {
      setLoading(true);
      
      const locale = navigator.language;
      const userCurrency = (locale === 'en-IN' || locale === 'ta-IN') ? 'inr' : 'usd';

      axios.post('/payment/create-payment-intent', {
        amount: Math.round(totalPrice * 100),
        currency: userCurrency
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
      className="checkout-modal"
      backdrop="static" // Prevent accidental closing during payment
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold ps-2">Secure Checkout</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        <div className="row g-4">
          {/* Left Side: Order Summary */}
          <div className="col-md-5 border-end pe-md-4">
            <h6 className="text-uppercase small fw-bold text-muted mb-3">Order Summary</h6>
            <div className="checkout-items" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {cartItems.map((item) => (
                <div key={item.id} className="d-flex align-items-center mb-3">
                  <div className="bg-light rounded p-1 me-3" style={{ width: '50px', height: '50px' }}>
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="img-fluid h-100 w-100" 
                      style={{ objectFit: 'contain' }} 
                    />
                  </div>
                  <div className="flex-grow-1 overflow-hidden">
                    <p className="mb-0 fw-bold text-truncate small" title={item.name}>{item.name}</p>
                    <p className="mb-0 text-muted extra-small">Qty: {item.quantity}</p>
                  </div>
                  <div className="ms-2">
                    <span className="small fw-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-top">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted small">Subtotal</span>
                <span className="small fw-bold">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="h5 fw-bold">Grand Total</span>
                <span className="h5 fw-bold text-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-light rounded-3 d-flex align-items-center">
              <i className="bi bi-shield-lock-fill text-success fs-4 me-3"></i>
              <div className="extra-small text-muted">
                Your payment data is encrypted and processed via Stripe secure gateway.
              </div>
            </div>
          </div>

          {/* Right Side: Payment Form */}
          <div className="col-md-7 ps-md-4">
            <h6 className="text-uppercase small fw-bold text-muted mb-3">Payment Details</h6>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted small">Contacting Bank...</p>
              </div>
            ) : clientSecret ? (
              <Elements options={{ clientSecret }} stripe={stripePromise}>
                <PaymentForm totalPrice={totalPrice} onPaymentSuccess={handleCheckout} />
              </Elements>
            ) : (
              <div className="alert alert-danger rounded-3 small">
                <i className="bi bi-exclamation-octagon-fill me-2"></i>
                Service unavailable. Please try again later.
              </div>
            )}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button variant="link" className="text-muted text-decoration-none small" onClick={handleClose}>
          Back to Shopping
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CheckoutPopup;