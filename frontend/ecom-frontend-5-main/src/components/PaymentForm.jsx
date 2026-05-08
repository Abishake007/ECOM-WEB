import React, { useState } from 'react';
import { PaymentElement, AddressElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Spinner } from 'react-bootstrap';

const PaymentForm = ({ totalPrice, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-1">
      <div className="mb-4">
        <h6 className="Oswald-font fw-black text-uppercase mb-3" style={{ letterSpacing: '1px' }}>
          01. Shipping Information
        </h6>
        <div className="border border-dark p-3 bg-white">
          <AddressElement options={{ 
            mode: 'shipping', 
            allowedCountries: ['IN', 'US'],
            appearance: {
                theme: 'none',
                variables: { fontFamily: 'Oswald, sans-serif', borderRadius: '0px' }
            }
          }} />
        </div>
      </div>
      
      <div className="mb-4">
        <h6 className="Oswald-font fw-black text-uppercase mb-3" style={{ letterSpacing: '1px' }}>
          02. Payment Details
        </h6>
        <div className="border border-dark p-3 bg-white">
          <PaymentElement options={{
            appearance: {
                theme: 'none',
                variables: { fontFamily: 'Oswald, sans-serif', borderRadius: '0px' }
            }
          }} />
        </div>
      </div>
      
      {errorMessage && (
        <div className="Oswald-font fw-bold text-danger small text-uppercase mb-3" style={{ letterSpacing: '0.5px' }}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {errorMessage}
        </div>
      )}
      
      <div className="mt-5">
        <Button 
          variant="dark" 
          type="submit" 
          disabled={isProcessing || !stripe || !elements}
          className="w-100 py-3 rounded-0 Oswald-font fw-black text-uppercase shadow-none border-0 d-flex justify-content-between align-items-center px-4"
          style={{ letterSpacing: '2px', fontSize: '1.1rem' }}
        >
          {isProcessing ? (
            <>
              <span>Processing</span>
              <Spinner animation="border" size="sm" variant="light" />
            </>
          ) : (
            <>
              <span>Authorize Payment</span>
              <span>₹{totalPrice}</span>
            </>
          )}
        </Button>
        <p className="text-center text-muted small mt-3 Oswald-font fw-bold text-uppercase" style={{ fontSize: '10px' }}>
          Secure Encrypted Transaction <i className="bi bi-lock-fill ms-1"></i>
        </p>
      </div>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .Oswald-font { font-family: 'Oswald', sans-serif; }
        
        /* Customizing Stripe Elements to match the app border style */
        .StripeElement {
          padding: 10px 0;
        }
      `}</style>
    </form>
  );
};

export default PaymentForm;