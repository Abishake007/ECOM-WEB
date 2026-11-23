-- Apply once in TiDB before deploying the review ownership change.
-- Existing reviews are linked to their author when reviewer_name matches username.
ALTER TABLE review
    ADD COLUMN reviewer_user_id BIGINT NULL;

UPDATE review r
JOIN users u ON u.username = r.reviewer_name
SET r.reviewer_user_id = u.id
WHERE r.reviewer_user_id IS NULL;
