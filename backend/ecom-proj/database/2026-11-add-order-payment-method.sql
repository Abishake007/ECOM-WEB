-- Apply this to the TiDB database before deploying the backend that adds COD.
-- Existing orders are treated as online Stripe orders.
ALTER TABLE orders
    ADD COLUMN payment_method VARCHAR(32) NOT NULL DEFAULT 'STRIPE';
