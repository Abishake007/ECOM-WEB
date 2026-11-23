-- Apply once in TiDB before deploying per-product offers.
ALTER TABLE product
    ADD COLUMN discount_percentage INT NOT NULL DEFAULT 0;
