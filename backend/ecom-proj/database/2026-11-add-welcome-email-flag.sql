-- Apply once in TiDB before deploying the first-login welcome email change.
ALTER TABLE users
    ADD COLUMN welcome_email_sent INT NOT NULL DEFAULT 0;

-- Do not send a first-login welcome message to accounts that already exist.
UPDATE users
SET welcome_email_sent = 1;
