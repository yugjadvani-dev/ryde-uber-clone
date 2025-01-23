-- SELECT * from users;
-- SELECT * FROM otp_codes;

-- CREATE TABLE otp_codes (
--   id SERIAL PRIMARY KEY,
--   user_id UUID NOT NULL,
--   otp VARCHAR(6) NOT NULL,
--   otp_expiry TIMESTAMP NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- ALTER TABLE users
-- ADD COLUMN avatar VARCHAR(255),
-- ADD COLUMN refresh_token VARCHAR(255);

-- DROP TABLE users;
-- DROP TABLE otp_codes;