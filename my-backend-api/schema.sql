-- ==========================================
-- SQL SCHEMA FOR TOKO RAJUT CLOUDFLARE D1 DATABASE
-- ==========================================

CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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

-- Seed Initial Gallery
INSERT OR IGNORE INTO gallery (id, image_url) VALUES 
  (1, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96'),
  (2, 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b'),
  (3, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea'),
  (4, 'https://images.unsplash.com/photo-1601762603339-fd61e28b698a'),
  (5, 'https://images.unsplash.com/photo-1556906781-9a412961c28c');

-- Seed Initial Projects
INSERT OR IGNORE INTO projects (id, title, description, image_url) VALUES 
  (1, 'Winter Collection 2024', 'A collection of warm winter accessories including scarves, hats, and gloves.', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96'),
  (2, 'Custom Baby Blankets', 'Personalized baby blankets with custom colors and patterns.', 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b'),
  (3, 'Home Decor Items', 'Beautiful knitted pieces for home decoration and comfort.', 'https://images.unsplash.com/photo-1556906781-9a412961c28c');

-- Seed Default Admin & User Accounts (Password: admin & user)
INSERT OR IGNORE INTO users (id, name, address, phone, email, password, role) VALUES
  (1, 'Administrator', 'Kantor Pusat Toko Rajut', '08123456789', 'haikaladika8@gmail.com', '$2b$10$ywdZSKkl4KQN1.W4FUrbOetSJAa2vUBMgF6sUCyY2bMQHeVI8tWsS', 'admin'),
  (2, 'Budi Santoso', 'Jl. Kenari No. 12, Jakarta', '08987654321', 'user@tokorajut.com', '$2a$10$W1eH.f3vGvB7S.H6tL7gceZ0r1q5L1d3c0k3H4h.4n2b1a0c0d0e0', 'user');
