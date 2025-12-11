-- Refresh Breeze Database Schema
-- PostgreSQL / Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members table for idol group members
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    member_color VARCHAR(7) NOT NULL, -- Hex color code
    catchphrase TEXT,
    bio TEXT,
    position VARCHAR(100), -- e.g., "Center", "Leader"
    birthdate DATE,
    image_url TEXT,
    gallery_images TEXT[], -- Array of image URLs
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table for merchandise (Cheki & Goods)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'cheki' or 'goods'
    member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, shipped, completed, cancelled
    payment_method VARCHAR(50),
    midtrans_order_id VARCHAR(255) UNIQUE,
    midtrans_transaction_id VARCHAR(255),
    payment_url TEXT,
    shipping_address TEXT,
    shipping_name VARCHAR(255),
    shipping_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL, -- Store name in case product is deleted
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event schedule table
CREATE TABLE schedule (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(50), -- 'live', 'meet-and-greet', 'release', etc.
    event_date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    description TEXT,
    ticket_url TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fan content table (for Fan Corner)
CREATE TABLE fan_content (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'blog', -- 'blog', 'video', 'gallery'
    author_member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
    image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_member ON products(member_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_schedule_date ON schedule(event_date);
CREATE INDEX idx_fan_content_published ON fan_content(is_published, published_at);

-- Sample data for members (7 members with placeholder data)
INSERT INTO members (name, member_color, catchphrase, bio, position, birthdate, image_url, display_order) VALUES
('Aira Mizuki', '#00CED1', 'Menyegarkan seperti angin pagi!', 'Member energik dengan suara yang jernih. Hobi menari dan suka warna biru.', 'Center', '2005-03-15', '/assets/images/member1.jpg', 1),
('Sakura Hoshino', '#87CEEB', 'Bersinar seperti bintang di langit!', 'Vokalis utama dengan kepribadian ceria. Suka memasak dan kucing.', 'Leader', '2004-07-22', '/assets/images/member2.jpg', 2),
('Yuki Amano', '#98D8C8', 'Sejuk seperti salju di musim panas!', 'Dancer berbakat dengan senyum manis. Hobi fotografi dan travelling.', 'Main Dancer', '2005-11-08', '/assets/images/member3.jpg', 3),
('Riko Tanaka', '#40E0D0', 'Energi yang tak terbatas!', 'Rapper dengan karisma tinggi. Suka olahraga dan fashion.', 'Main Rapper', '2004-12-30', '/assets/images/member4.jpg', 4),
('Mio Suzuki', '#B0E0E6', 'Lembut seperti ombak pantai!', 'Vokalis dengan nada tinggi yang indah. Suka membaca dan menulis lagu.', 'Lead Vocalist', '2005-05-17', '/assets/images/member5.jpg', 5),
('Hana Watanabe', '#AFEEEE', 'Semangat yang selalu fresh!', 'All-rounder dengan bakat menggambar. Suka anime dan game.', 'Sub Vocalist', '2005-09-25', '/assets/images/member6.jpg', 6),
('Nana Kobayashi', '#5F9EA0', 'Kalem tapi penuh kejutan!', 'Visual member dengan tinggi badan ideal. Hobi modeling dan yoga.', 'Visual', '2004-02-14', '/assets/images/member7.jpg', 7);

-- Sample products
INSERT INTO products (name, description, price, category, member_id, image_url, stock) VALUES
('Cheki - Aira Mizuki', 'Foto polaroid eksklusif Aira Mizuki dengan tanda tangan', 50000, 'cheki', 1, '/assets/images/cheki1.jpg', 50),
('Cheki - Sakura Hoshino', 'Foto polaroid eksklusif Sakura Hoshino dengan tanda tangan', 50000, 'cheki', 2, '/assets/images/cheki2.jpg', 50),
('Refresh Breeze Official T-Shirt', 'Kaos official dengan logo Refresh Breeze (S, M, L, XL)', 150000, 'goods', NULL, '/assets/images/tshirt.jpg', 100),
('Photo Book - 1st Anniversary', 'Buku foto edisi ulang tahun pertama Refresh Breeze', 250000, 'goods', NULL, '/assets/images/photobook.jpg', 30),
('Light Stick - Official', 'Light stick resmi Refresh Breeze dengan 7 warna member', 300000, 'goods', NULL, '/assets/images/lightstick.jpg', 75);

-- Sample schedule events
INSERT INTO schedule (event_name, event_type, event_date, location, description, is_featured) VALUES
('Refresh Breeze 1st Live Concert', 'live', '2025-12-25 18:00:00', 'Jakarta Convention Center', 'Konser perdana Refresh Breeze dengan full setlist!', true),
('Meet & Greet - Surabaya', 'meet-and-greet', '2025-12-30 15:00:00', 'Tunjungan Plaza, Surabaya', 'Kesempatan bertemu langsung dengan member!', false),
('New Single Release', 'release', '2026-01-15 00:00:00', 'Online - All Platforms', 'Perilisan single terbaru "Ocean Breeze"', true);

-- Sample fan content
INSERT INTO fan_content (title, content, content_type, author_member_id, is_published, published_at) VALUES
('Halo dari Aira!', 'Hai semua!! Ini adalah blog pertama aku di Fan Corner! Semoga kalian suka ya~', 'blog', 1, true, CURRENT_TIMESTAMP),
('Behind the Scenes - Practice', 'Video latihan dance untuk single baru kami! Stay tuned!', 'video', 2, true, CURRENT_TIMESTAMP);
