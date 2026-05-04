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

    // Confirm payment and include shipping details collected by AddressElement
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Logic for backend to trigger EmailService confirmation
      onPaymentSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h6 className="mb-3">Shipping Information</h6>
      {/* mode="shipping" collects address and phone number */}
      <AddressElement options={{ mode: 'shipping', allowedCountries: ['IN', 'US'] }} />
      
      <h6 className="mt-4 mb-3">Payment Details</h6>
      <PaymentElement />
      
      {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
      
      <div className="d-grid gap-2 mt-4">
        <Button variant="primary" type="submit" disabled={isProcessing || !stripe || !elements}>
          {isProcessing ? <Spinner animation="border" size="sm" /> : `Pay $${totalPrice}`}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;