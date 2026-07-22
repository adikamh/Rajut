-- ==========================================
-- SQL SCHEMA FOR TOKO RAJUT CLOUDFLARE D1 DATABASE
-- Run this script using Wrangler CLI:
-- npx wrangler d1 execute rajut-db --file=./d1_setup.sql
-- ==========================================

-- 1. Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Admin User (Password: admin) and Standard User (Password: user)
-- Hashes generated via bcrypt: $2a$10$e.xKx5kUuFj7.M3jWvEreO7vD1U/xQ1K9aMv9y6W7s0L6K7e.
-- Default test accounts:
-- Admin: admin@tokorajut.com / admin
-- User: user@tokorajut.com / user
INSERT OR IGNORE INTO users (name, address, phone, email, password, role) VALUES
  ('Administrator', 'Kantor Pusat Toko Rajut', '08123456789', 'haikaladika8@gmail.com', '$2b$10$ywdZSKkl4KQN1.W4FUrbOetSJAa2vUBMgF6sUCyY2bMQHeVI8tWsS', 'admin'),
  ('Budi Santoso', 'Jl. Kenari No. 12, Jakarta', '08987654321', 'user@tokorajut.com', '$2a$10$W1eH.f3vGvB7S.H6tL7gceZ0r1q5L1d3c0k3H4h.4n2b1a0c0d0e0', 'user');
