-- Create database
CREATE DATABASE IF NOT EXISTS r_genzgifts;
USE r_genzgifts;

-- App roles enum
CREATE TABLE app_role (
  role ENUM('admin', 'user') NOT NULL
);

-- Users table
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User roles table (assuming auth.users is handled separately, perhaps use a users table)
CREATE TABLE user_roles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL, -- Assuming user_id is UUID from auth
  role ENUM('admin', 'user') NOT NULL,
  UNIQUE (user_id, role)
);

-- Categories table
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url VARCHAR(500) NOT NULL DEFAULT '',
  image_urls JSON NOT NULL DEFAULT '[]',
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  stock INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL DEFAULT '',
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_zip VARCHAR(20) NOT NULL,
  shipping_country VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  coupon_code VARCHAR(50) DEFAULT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  stripe_payment_id VARCHAR(255),
  payment_screenshot VARCHAR(500) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Order items
CREATE TABLE order_items (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id CHAR(36) NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Site settings (single row)
CREATE TABLE site_settings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  store_name VARCHAR(255) NOT NULL DEFAULT 'GenZGifts',
  email VARCHAR(255) NOT NULL DEFAULT 'info@genzgifts.com',
  phone VARCHAR(20) NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  instagram_url VARCHAR(500) NOT NULL DEFAULT '',
  tiktok_id VARCHAR(500) NOT NULL DEFAULT '',
  header_script TEXT NOT NULL DEFAULT '',
  body_script TEXT NOT NULL DEFAULT '',
  footer_script TEXT NOT NULL DEFAULT '',
  payment_accounts JSON NOT NULL DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reviews table for product reviews linked to orders
CREATE TABLE IF NOT EXISTS reviews (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id CHAR(36) NOT NULL,
  product_id INT NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  rating INT NULLABLE CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NULLABLE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Coupons table for discount codes
CREATE TABLE IF NOT EXISTS coupons (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT '',
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_uses INT NOT NULL DEFAULT 100,
  current_uses INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  valid_from TIMESTAMP NULL,
  valid_until TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Visitors table for tracking page views
CREATE TABLE IF NOT EXISTS visitors (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  page_url VARCHAR(500) NOT NULL DEFAULT '',
  referrer VARCHAR(500) NOT NULL DEFAULT '',
  country VARCHAR(100) NOT NULL DEFAULT '',
  city VARCHAR(100) NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  session_id VARCHAR(100) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session_id (session_id),
  INDEX idx_created_at (created_at),
  INDEX idx_page_url (page_url)
);

-- Insert default site settings
INSERT INTO site_settings (store_name, email) VALUES ('GenZGifts', 'info@genzgifts.com');

-- Insert mock users
INSERT INTO users (id, email, password) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@genzgifts.com', '$2b$10$dummy.hash.for.admin123'),
('550e8400-e29b-41d4-a716-446655440001', 'user@genzgifts.com', '$2b$10$dummy.hash.for.user123');

-- Insert user roles
INSERT INTO user_roles (user_id, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin'),
('550e8400-e29b-41d4-a716-446655440001', 'user');

-- Insert mock products
INSERT INTO products (name, description, price, image_url, category, stock, is_active) VALUES
('LED Galaxy Projector', 'Transform any room into a cosmic wonderland with this stunning LED galaxy projector. Perfect for bedrooms, parties, or vibing sessions.', 29.99, 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=400&fit=crop', 'Tech', 50, 1),
('Custom Name Necklace', 'A personalized gold-plated name necklace that makes the perfect gift for your bestie or significant other.', 24.99, 'https://images.unsplash.com/photo-1515562141589-67f0d569b6e5?w=400&h=400&fit=crop', 'Jewelry', 30, 1),
('Aesthetic Desk Organizer', 'Keep your desk clean and aesthetic with this minimalist acrylic organizer. Influencer approved!', 19.99, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', 'Home', 40, 1),
('Wireless Earbuds Case', 'A trendy silicone case for your wireless earbuds with a cute charm keychain attachment.', 14.99, 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop', 'Tech', 100, 1),
('Scented Candle Set', 'A set of 3 luxurious soy candles in aesthetically pleasing glass jars. Scents: Vanilla Dream, Lavender Cloud, Rose Garden.', 34.99, 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400&h=400&fit=crop', 'Home', 25, 1),
('Polaroid Photo Printer', 'Print your favorite memories instantly with this portable mini photo printer. Connects via Bluetooth.', 69.99, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop', 'Tech', 15, 1),
('Friendship Bracelet Kit', 'DIY friendship bracelet making kit with beads, threads, and charms. Make memories with your squad!', 16.99, 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop', 'DIY', 60, 1),
('Sunset Lamp', 'The viral sunset projection lamp for dreamy golden hour vibes any time of day.', 22.99, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', 'Home', 35, 1);

-- Bundles table for gift bundles
CREATE TABLE IF NOT EXISTS bundles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(500) NOT NULL DEFAULT '',
  min_items INT NOT NULL DEFAULT 3 CHECK (min_items >= 1),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_display_order (display_order),
  INDEX idx_is_active (is_active)
);

-- Insert sample bundles
INSERT INTO bundles (name, image_url, min_items, is_active, display_order) VALUES
('Birthday Surprise', '/placeholder.svg', 3, 1, 0),
('Bestie Gift Box', '/placeholder.svg', 4, 1, 1),
('Self-Care Bundle', '/placeholder.svg', 2, 1, 2);
