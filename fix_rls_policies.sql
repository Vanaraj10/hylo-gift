-- Quick Fix Script for RLS Policies
-- Run this in your Supabase SQL Editor to fix the permission issues

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated users full access to products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users full access to categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated users full access to brands" ON brands;

-- Create permissive policies for anonymous users (needed for admin panel)
CREATE POLICY "Allow anonymous full access to products" ON products
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous full access to categories" ON categories
    FOR ALL USING (true);

CREATE POLICY "Allow anonymous full access to brands" ON brands
    FOR ALL USING (true);

-- Verify policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('products', 'categories', 'brands')
ORDER BY tablename, policyname;
