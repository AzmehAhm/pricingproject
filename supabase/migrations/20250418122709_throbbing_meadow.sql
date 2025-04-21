/*
  # Fix RLS Policies

  1. Changes
    - Drop existing policies before recreating them
    - Enable RLS on all tables
    - Set up consistent admin access policies
    - Configure appropriate read access

  2. Tables Covered
    - products
    - product_variants
    - customers
    - pricelists
    - pricelist_items
    - price_history
    - sub_brands
*/

-- Enable RLS on all remaining tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricelists ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricelist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_brands ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DROP POLICY IF EXISTS "Products are editable by admins only" ON products;
DROP POLICY IF EXISTS "Products are viewable by all authenticated users" ON products;
DROP POLICY IF EXISTS "Product variants are editable by admins only" ON product_variants;
DROP POLICY IF EXISTS "Product variants are viewable by all authenticated users" ON product_variants;
DROP POLICY IF EXISTS "Sub-brands are editable by admins only" ON sub_brands;
DROP POLICY IF EXISTS "Sub-brands are viewable by all authenticated users" ON sub_brands;
DROP POLICY IF EXISTS "Customers are editable by admins only" ON customers;
DROP POLICY IF EXISTS "Customers can view own data" ON customers;
DROP POLICY IF EXISTS "Pricelists are editable by admins only" ON pricelists;
DROP POLICY IF EXISTS "Pricelists are viewable by assigned customers and admins" ON pricelists;
DROP POLICY IF EXISTS "Pricelist items are editable by admins only" ON pricelist_items;
DROP POLICY IF EXISTS "Pricelist items are viewable by customers with access to the pricelist" ON pricelist_items;
DROP POLICY IF EXISTS "Price history is viewable by admins only" ON price_history;

-- Products policies
CREATE POLICY "Products are editable by admins only"
ON products
FOR ALL
TO authenticated
USING (auth.jwt()->>'role' = 'ADMIN');

CREATE POLICY "Products are viewable by all authenticated users"
ON products
FOR SELECT
TO authenticated
USING (status <> 'archived');

-- Product variants policies
CREATE POLICY "Product variants are editable by admins only"
ON product_variants
FOR ALL
TO authenticated
USING (auth.jwt()->>'role' = 'ADMIN');

CREATE POLICY "Product variants are viewable by all authenticated users"
ON product_variants
FOR SELECT
TO authenticated
USING (status <> 'archived');

-- Sub-brands policies
CREATE POLICY "Sub-brands are editable by admins only"
ON sub_brands
FOR ALL
TO authenticated
USING (auth.jwt()->>'role' = 'ADMIN');

CREATE POLICY "Sub-brands are viewable by all authenticated users"
ON sub_brands
FOR SELECT
TO authenticated
USING (status <> 'archived');

-- Customers policies
CREATE POLICY "Customers are editable by admins only"
ON customers
FOR ALL
TO authenticated
USING (auth.jwt()->>'role' = 'ADMIN');

CREATE POLICY "Customers can view own data"
ON customers
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  auth.jwt()->>'role' = 'ADMIN'
);

-- Pricelists policies
CREATE POLICY "Pricelists are editable by admins only"
ON pricelists
FOR ALL
TO authenticated
USING (auth.jwt()->>'role' = 'ADMIN');

CREATE POLICY "Pricelists are viewable by assigned customers and admins"
ON pricelists
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM customers
    WHERE customers.pricelist_id = pricelists.id
    AND customers.user_id = auth.uid()
  ) OR auth.jwt()->>'role' = 'ADMIN'
);

-- Pricelist items policies
CREATE POLICY "Pricelist items are editable by admins only"
ON pricelist_items
FOR ALL
TO authenticated
USING (auth.jwt()->>'role' = 'ADMIN');

CREATE POLICY "Pricelist items are viewable by customers with access to the pricelist"
ON pricelist_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM customers
    WHERE customers.pricelist_id = pricelist_items.pricelist_id
    AND customers.user_id = auth.uid()
  ) OR auth.jwt()->>'role' = 'ADMIN'
);

-- Price history policies
CREATE POLICY "Price history is viewable by admins only"
ON price_history
FOR ALL
TO authenticated
USING (auth.jwt()->>'role' = 'ADMIN');