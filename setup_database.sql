-- SQL Script to set up complete database schema
-- Run this in your Supabase SQL Editor

-- Create Products table (main table)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    product_discount DECIMAL(5,2) DEFAULT 0,
    product_description TEXT,
    product_image TEXT NOT NULL,
    category_id INTEGER,
    brand_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Brands table
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add category_id and brand_id columns to products table (if they don't exist)
-- Note: If you're creating fresh, these columns are already included above
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id INTEGER,
ADD COLUMN IF NOT EXISTS brand_id INTEGER;

-- Add foreign key constraints
ALTER TABLE products 
ADD CONSTRAINT fk_products_category 
FOREIGN KEY (category_id) REFERENCES categories(id);

ALTER TABLE products 
ADD CONSTRAINT fk_products_brand 
FOREIGN KEY (brand_id) REFERENCES brands(id);

-- Insert sample categories
INSERT INTO categories (name) VALUES 
('Corporate Gifts'),
('Festival Gifts'),
('Stationery'),
('Promotional Items'),
('Tech Accessories'),
('Home & Kitchen'),
('Sports & Fitness'),
('Travel Accessories')
ON CONFLICT (name) DO NOTHING;

-- Insert sample brands
INSERT INTO brands (name) VALUES 
('HyLoApp'),
('Premium Collection'),
('Eco-Friendly'),
('Luxury Line'),
('Budget Series'),
('Corporate Elite'),
('Festival Special'),
('Tech Pro')
ON CONFLICT (name) DO NOTHING;

-- Optional: Update existing products with default category and brand
-- (You may want to manually assign these based on your actual data)
-- UPDATE products 
-- SET category_id = 1, brand_id = 1 
-- WHERE category_id IS NULL AND brand_id IS NULL;

-- Sample product data (optional - remove if you have existing products)
INSERT INTO products (product_name, product_price, product_discount, category_id, brand_id, product_description, product_image) VALUES 
('Premium Diary Set', 299.99, 10, 1, 1, 'High-quality leather diary with pen holder and bookmark', 'https://via.placeholder.com/400x400?text=Diary+Set'),
('Corporate Gift Hamper', 1499.99, 15, 1, 2, 'Complete corporate gift package with branded items', 'https://via.placeholder.com/400x400?text=Gift+Hamper'),
('Festival Decoration Kit', 599.99, 20, 2, 7, 'Beautiful decoration items for festive occasions', 'https://via.placeholder.com/400x400?text=Decoration+Kit'),
('Premium Pen Collection', 199.99, 5, 3, 3, 'Set of 5 premium writing pens with gift box', 'https://via.placeholder.com/400x400?text=Pen+Collection'),
('Branded Water Bottle', 149.99, 0, 4, 1, 'Eco-friendly water bottle with custom branding option', 'https://via.placeholder.com/400x400?text=Water+Bottle'),
('Wireless Charging Pad', 899.99, 25, 5, 8, 'Fast wireless charging pad compatible with all devices', 'https://via.placeholder.com/400x400?text=Charging+Pad')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(product_price);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for better security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security needs)
CREATE POLICY "Allow public read access on products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on brands" ON brands
    FOR SELECT USING (true);

-- Allow anonymous users to perform all operations (for admin panel)
-- Note: In production, you should restrict this to authenticated admin users
CREATE POLICY "Allow anonymous full access to products" ON products
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous full access to categories" ON categories
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous full access to brands" ON brands
    FOR ALL USING (true);
