-- SELECT * from users;
-- SELECT * FROM otp_codes;
-- SELECT * FROM drivers;

-- CREATE TABLE otp_codes (
--   id SERIAL PRIMARY KEY,
--   user_id UUID NOT NULL,
--   otp VARCHAR(6) NOT NULL,
--   otp_expiry TIMESTAMP NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE drivers (
--                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--                          firstname VARCHAR(255) NOT NULL,
--                          lastname VARCHAR(255) NOT NULL,
--                          avatar VARCHAR(255),
--                          car_image VARCHAR(255),
--                          car_seats INTEGER NOT NULL CHECK (car_seats > 0),
--                          rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
--                          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- ALTER TABLE users
-- ADD COLUMN avatar VARCHAR(255),
-- ADD COLUMN refresh_token VARCHAR(255);

-- DROP TABLE users;
-- DROP TABLE otp_codes;
-- DROP TABLE drivers;