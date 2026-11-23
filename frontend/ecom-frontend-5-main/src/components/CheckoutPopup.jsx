import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from '../axios';
import PaymentForm from './PaymentForm';
import unplugged from "../assets/unplugged.png";
import { getDiscountPercentage, getSalePrice } from "../utils/pricing";

const stripePromise = loadStripe('pk_test_51TSWaI2OVQWK9oI9tI1U8cesyrjqJJftRr0Iwh44BBhZJyVTLQdKwxLdF0RNa5m9YizAt3e5vWhjFpPbF60qZL0U00NfncpOp4');
const emptyAddress = { name: '', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India' };

const CheckoutPopup = ({ show, handleClose, cartItems, totalPrice, handleCheckout }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('STRIPE');
  const [address, setAddress] = useState(emptyAddress);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!show || paymentMethod !== 'STRIPE' || totalPrice <= 0) {
      setClientSecret('');
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError('');
    axios.post('/payment/create-payment-intent', { amount: Math.round(totalPrice * 100), currency: 'inr' })
      .then(res => { if (active) setClientSecret(res.data.clientSecret); })
      .catch(err => { console.error("Payment Init Error:", err); if (active) setError('Online payment is unavailable right now.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [show, totalPrice, paymentMethod]);

  const updateAddress = (event) => setAddress(current => ({ ...current, [event.target.name]: event.target.value }));
  const submitCod = async (event) => {
    event.preventDefault();
    if (!address.name.trim() || !address.phone.trim() || !address.line1.trim() || !address.city.trim() || !address.state.trim() || !address.postal_code.trim() || !address.country.trim()) {
      setError('Complete your name, phone, and delivery address.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await handleCheckout({ name: address.name, phone: address.phone, address: { line1: address.line1, line2: address.line2, city: address.city, state: address.state, postal_code: address.postal_code, country: address.country } }, 'COD');
    } catch (e) {
      setError(e.message || 'We could not place your order. Please try again.');
    } finally { setSubmitting(false); }
  };

  const addressField = (name, label, required = true) => <div className={name === 'line1' || name === 'line2' ? 'col-12' : 'col-md-6'} key={name}>
    <label className="form-label small fw-bold" htmlFor={`cod-${name}`}>{label}</label>
    <input className="form-control rounded-0" id={`cod-${name}`} name={name} value={address[name]} onChange={updateAddress} required={required} autoComplete={name === 'line1' ? 'address-line1' : name === 'phone' ? 'tel' : undefined} />
  </div>;

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" backdrop="static" className="adidas-modal">
      <Modal.Header closeButton className="border-0 bg-white"><Modal.Title className="fw-black text-uppercase Oswald-font pt-3">Secure Checkout</Modal.Title></Modal.Header>
      <Modal.Body className="p-4 bg-white">
        <div className="row g-0 border border-dark border-2">
          <div className="col-md-5 border-end border-dark p-4 bg-light">
            <h6 className="fw-black text-uppercase small mb-4">Order Summary</h6>
            <div style={{ maxHeight: 250, overflowY: 'auto' }}>{cartItems.map(item => {
              const image = item.imageUrl || (item.imageData ? `data:${item.imageType};base64,${item.imageData}` : unplugged);
              return <div key={item.id} className="d-flex align-items-center mb-3 pb-3 border-bottom"><img src={image} alt={item.name} className="bg-white border me-3 p-1" style={{ width: 55, height: 55, objectFit: 'contain' }} /><div className="flex-grow-1"><div className="small fw-bold text-uppercase">{item.name}</div><small>Qty: {item.quantity || 1}{getDiscountPercentage(item) > 0 && ` · ${getDiscountPercentage(item)}% off`}</small></div><strong>₹{(getSalePrice(item) * (item.quantity || 1)).toFixed(2)}</strong></div>;
            })}</div>
            <div className="mt-3 pt-3 border-top border-dark d-flex justify-content-between fw-bold"><span>Total</span><span>₹{totalPrice.toFixed(2)}</span></div>
            <div className="mt-3 small text-muted">{paymentMethod === 'COD' ? 'Pay the order total to the delivery partner when your order arrives.' : 'Your online payment is processed securely by Stripe.'}</div>
          </div>
          <div className="col-md-7 p-4 bg-white">
            <h6 className="fw-black text-uppercase small mb-3">Payment Method</h6>
            <div className="d-flex flex-wrap gap-3 mb-4">
              <label className="border p-3 flex-fill"><input type="radio" name="paymentMethod" value="STRIPE" checked={paymentMethod === 'STRIPE'} onChange={() => setPaymentMethod('STRIPE')} className="me-2" />Pay online</label>
              <label className="border p-3 flex-fill"><input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="me-2" />Cash on delivery</label>
            </div>
            {paymentMethod === 'COD' ? <form onSubmit={submitCod}>
              <h6 className="fw-black text-uppercase small mb-3">Delivery Details</h6>
              <div className="row g-3">{addressField('name', 'Full name')}{addressField('phone', 'Phone number')}{addressField('line1', 'Address line 1')}{addressField('line2', 'Address line 2 (optional)', false)}{addressField('city', 'City')}{addressField('state', 'State')}{addressField('postal_code', 'Postal code')}{addressField('country', 'Country')}</div>
              {error && <div className="text-danger small mt-3" role="alert">{error}</div>}
              <Button variant="dark" type="submit" disabled={submitting} className="w-100 py-3 rounded-0 fw-bold text-uppercase mt-4">{submitting ? <><Spinner size="sm" className="me-2" />Placing order…</> : `Place COD order · ₹${totalPrice.toFixed(2)}`}</Button>
            </form> : loading ? <div className="text-center py-5"><Spinner animation="border" variant="dark" /><p className="mt-3 fw-bold text-uppercase small">Initializing payment…</p></div> : clientSecret ? <Elements options={{ clientSecret }} stripe={stripePromise}><PaymentForm totalPrice={totalPrice} onPaymentSuccess={(details) => handleCheckout(details, 'STRIPE')} /></Elements> : <div className="bg-danger text-white p-3 fw-bold small">{error || 'Online payment service unavailable.'}</div>}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 bg-white justify-content-start pb-4"><Button variant="link" className="text-dark fw-bold text-uppercase small" onClick={handleClose}>Cancel</Button></Modal.Footer>
      <style>{`.adidas-modal .modal-content{border-radius:0!important;border:none}.fw-black{font-weight:900!important}.Oswald-font{font-family:'Oswald',sans-serif}`}</style>
    </Modal>
  );
};
export default CheckoutPopup;
