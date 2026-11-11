-- Farmer-to-Customer Marketplace Database Schema
-- Database: farmer_marketplace
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS farmer_marketplace
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE farmer_marketplace;

-- ===================================================
-- 1. USERS TABLE
-- Roles: 'farmer', 'customer', 'admin'
-- ===================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('farmer', 'customer', 'admin') NOT NULL DEFAULT 'customer',
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_phone (phone),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- 2. PRODUCTS TABLE
-- Farmer products catalog
-- ===================================================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  unit ENUM('kg', 'quintal', 'ton') NOT NULL DEFAULT 'kg',
  location VARCHAR(150) NOT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_farmer FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_products_farmer (farmer_id),
  INDEX idx_products_category (category),
  INDEX idx_products_available (is_available),
  INDEX idx_products_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- 3. CARTS TABLE
-- One persistent cart per user
-- ===================================================
CREATE TABLE IF NOT EXISTS carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- 4. CART_ITEMS TABLE
-- Items inside a user's shopping cart
-- ===================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_product (cart_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- 5. ORDERS TABLE
-- High-level order details
-- ===================================================
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_phone VARCHAR(20) NOT NULL,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash on Delivery',
  payment_status ENUM('Pending', 'Paid', 'Failed') NOT NULL DEFAULT 'Pending',
  order_status ENUM('Pending', 'Accepted', 'Shipped', 'Delivered', 'Cancelled', 'Rejected') NOT NULL DEFAULT 'Pending',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  INDEX idx_orders_customer (customer_id),
  INDEX idx_orders_status (order_status),
  INDEX idx_orders_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- 6. ORDER_ITEMS TABLE
-- Line items with purchase-time price lock
-- ===================================================
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  farmer_id INT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  subtotal DECIMAL(10, 2) NOT NULL,
  item_status ENUM('Pending', 'Accepted', 'Shipped', 'Delivered', 'Rejected') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_order_items_farmer FOREIGN KEY (farmer_id) REFERENCES users(id),
  INDEX idx_order_items_farmer (farmer_id),
  INDEX idx_order_items_order (order_id),
  INDEX idx_order_items_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- 7. MARKET_PRICES TABLE
-- Real-world APMC/Mandi benchmark prices
-- ===================================================
CREATE TABLE IF NOT EXISTS market_prices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  crop_name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) DEFAULT 'General',
  unit VARCHAR(20) NOT NULL DEFAULT 'quintal',
  high_price DECIMAL(10, 2) NOT NULL,
  good_price DECIMAL(10, 2) NOT NULL,
  average_price DECIMAL(10, 2) NOT NULL,
  low_price DECIMAL(10, 2) NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- INITIAL BENCHMARK MARKET PRICES SEED
-- Preserves existing default prices and expands coverage
-- ===================================================
INSERT INTO market_prices (crop_name, category, unit, high_price, good_price, average_price, low_price)
VALUES
  ('Rice', 'Grains', 'quintal', 2200.00, 2000.00, 1800.00, 1500.00),
  ('Wheat', 'Grains', 'quintal', 2100.00, 1900.00, 1700.00, 1400.00),
  ('Maize', 'Grains', 'quintal', 1800.00, 1600.00, 1400.00, 1200.00),
  ('Cotton', 'Commercial', 'quintal', 7000.00, 6500.00, 6000.00, 5500.00),
  ('Sugarcane', 'Commercial', 'quintal', 3400.00, 3100.00, 2850.00, 2600.00),
  ('Groundnut', 'Oilseeds', 'quintal', 6800.00, 6200.00, 5700.00, 5100.00),
  ('Soybean', 'Oilseeds', 'quintal', 4900.00, 4500.00, 4200.00, 3800.00),
  ('Tomato', 'Vegetables', 'quintal', 3200.00, 2600.00, 2000.00, 1400.00),
  ('Onion', 'Vegetables', 'quintal', 2800.00, 2300.00, 1900.00, 1500.00),
  ('Potato', 'Vegetables', 'quintal', 1800.00, 1500.00, 1250.00, 1000.00)
ON DUPLICATE KEY UPDATE
  high_price = VALUES(high_price),
  good_price = VALUES(good_price),
  average_price = VALUES(average_price),
  low_price = VALUES(low_price);

-- ===================================================
-- SEED USERS (Password hashes for bcrypt)
-- Admin:    admin@farmer.com / Admin@123
-- Farmer:   ramesh.farmer@example.com / Farmer@123
-- Customer: priya.customer@example.com / Customer@123
-- ===================================================
INSERT INTO users (id, name, email, phone, password, role, address)
VALUES
  (1, 'System Administrator', 'admin@farmer.com', '9999999999', '$2b$10$wtisAQtj.DskhNHyi5.b6Oi3miu3dnmZ0CEEIC/21lvHG9gRuzKpS', 'admin', 'HQ Agricultural Commission, Pune'),
  (2, 'Ramesh Kumar', 'ramesh.farmer@example.com', '9876543210', '$2b$10$234dYI/LHo2FDfZ0hvt3KeEp8/MxUBoNaC7GZ1o/7Q4BoM1kO.kS6', 'farmer', 'Village Rampur, Taluka Haveli, Dist. Pune, Maharashtra'),
  (3, 'Priya Sharma', 'priya.customer@example.com', '9123456780', '$2b$10$XUAX/lmHiSYDkuIT/LXqB.hRZEMBt8upFDSC9hKJgjuYhD6ZhJYi6', 'customer', 'Flat 402, Green Valley Apartments, Kothrud, Pune, Maharashtra')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ===================================================
-- SEED SAMPLE PRODUCTS FOR FARMER (id: 2)
-- ===================================================
INSERT INTO products (id, farmer_id, name, category, description, price, quantity, unit, location, is_available)
VALUES
  (1, 2, 'Fresh Sharbati Wheat', 'Grains', 'Naturally harvested golden Sharbati wheat grains, cleaned and ready for storage.', 28.00, 500.00, 'kg', 'Pune, Maharashtra', TRUE),
  (2, 2, 'Organic Basmati Rice', 'Grains', 'Long grain fragrant Basmati rice cultivated using natural organic farming methods.', 75.00, 350.00, 'kg', 'Pune, Maharashtra', TRUE),
  (3, 2, 'Premium Hybrid Maize', 'Grains', 'Sun-dried high quality yellow feed maize grains with low moisture content.', 22.00, 400.00, 'kg', 'Pune, Maharashtra', TRUE),
  (4, 2, 'Farm Fresh Hybrid Tomatoes', 'Vegetables', 'Plump, ripe and firm red tomatoes harvested directly from our fields this morning.', 35.00, 150.00, 'kg', 'Nashik, Maharashtra', TRUE),
  (5, 2, 'Organic Red Onions', 'Vegetables', 'Crisp and pungent red onions with excellent shelf life and balanced moisture.', 26.00, 200.00, 'kg', 'Nashik, Maharashtra', TRUE),
  (6, 2, 'Natural Raw Cotton', 'Commercial', 'Clean white cotton bolls with high tensile fiber strength, directly from farm ginning.', 68.00, 600.00, 'kg', 'Nagpur, Maharashtra', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

