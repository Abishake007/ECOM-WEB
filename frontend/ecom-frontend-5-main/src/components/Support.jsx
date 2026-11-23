import React, { useState } from 'react';
import { Alert, Button, Card, Container, Form } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../axios';
import AuthService from '../services/auth.service';

const Support = () => {
  const [params] = useSearchParams();
  const user = AuthService.getCurrentUser();
  const [type, setType] = useState('PRODUCT_QUESTION');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState(null);
  const [sending, setSending] = useState(false);
  const signedIn = Boolean(user?.accessToken || user?.token || user?.jwt);

  const submit = async (event) => {
    event.preventDefault(); setSending(true); setNotice(null);
    try {
      const response = await API.post('/support', { type, subject, message, productId: params.get('productId') ? Number(params.get('productId')) : null, orderId: params.get('orderId') ? Number(params.get('orderId')) : null });
      setNotice({ variant: 'success', text: response.data.message || 'Your request was sent.' }); setSubject(''); setMessage('');
    } catch (error) {
      setNotice({ variant: 'danger', text: typeof error.response?.data === 'string' ? error.response.data : 'Could not send your request. Please try again.' });
    } finally { setSending(false); }
  };

  return <main style={{ minHeight: '100vh', paddingTop: 140, paddingBottom: 60, background: '#f7f7f7' }}><Container style={{ maxWidth: 760 }}>
    <h1 className="fw-bold text-uppercase mb-2">Customer support</h1><p className="text-muted mb-4">Ask about a product, order, delivery, or problem with your purchase.</p>
    {!signedIn ? <Alert variant="warning">Please <Link to="/login">sign in</Link> to send a support request.</Alert> : <Card className="border-0 shadow-sm"><Card.Body className="p-4 p-md-5">
      {notice && <Alert variant={notice.variant} role="status">{notice.text}</Alert>}
      <Form onSubmit={submit}>
        <Form.Group className="mb-3"><Form.Label>What do you need help with?</Form.Label><Form.Select value={type} onChange={e => setType(e.target.value)}><option value="PRODUCT_QUESTION">Product question</option><option value="ORDER_ISSUE">Order or delivery issue</option><option value="COMPLAINT">Complaint</option><option value="RETURN_REFUND">Return or refund</option><option value="OTHER">Other</option></Form.Select></Form.Group>
        {params.get('productId') && <p className="small text-muted">About product #{params.get('productId')}</p>}{params.get('orderId') && <p className="small text-muted">About order #ORD-{params.get('orderId')}</p>}
        <Form.Group className="mb-3"><Form.Label>Subject</Form.Label><Form.Control maxLength={160} required value={subject} onChange={e => setSubject(e.target.value)} placeholder="Briefly describe your question" /></Form.Group>
        <Form.Group className="mb-4"><Form.Label>Message</Form.Label><Form.Control as="textarea" rows={6} maxLength={5000} required value={message} onChange={e => setMessage(e.target.value)} placeholder="Include details that will help us assist you." /><Form.Text>{message.length}/5000</Form.Text></Form.Group>
        <Button type="submit" variant="dark" disabled={sending}>{sending ? 'Sending…' : 'Send to support'}</Button>
      </Form>
    </Card.Body></Card>}
  </Container></main>;
};
export default Support;
