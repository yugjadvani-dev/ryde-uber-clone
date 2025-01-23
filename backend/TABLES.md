**Create User**

```postgresql
CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       avatar VARCHAR(255),
                       firstname VARCHAR(255) NOT NULL,
                       lastname VARCHAR(255) NOT NULL,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       phone_number VARCHAR(255),
                       is_verified BOOLEAN DEFAULT FALSE,
                       role VARCHAR(20) CHECK (role IN ('user', 'admin')) NOT NULL,
                       refresh_token VARCHAR(255),
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Drivers**

```postgresql
CREATE TABLE drivers (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         firstname VARCHAR(255) NOT NULL,
                         lastname VARCHAR(255) NOT NULL,
                         avatar VARCHAR(255),
                         car_image VARCHAR(255),
                         car_seats INTEGER NOT NULL CHECK (car_seats > 0),
                         rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
                         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**OTP codes**

```postgresql
CREATE TABLE otp_codes (
                           id SERIAL PRIMARY KEY,
                           user_id INT NOT NULL,
                           otp VARCHAR(6) NOT NULL,
                           otp_expiry TIMESTAMP NOT NULL,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```