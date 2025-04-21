/*
  # Fix RLS policies for products and brands

  1. Changes
    - Drop and recreate RLS policies for products table
    - Drop and recreate RLS policies for brands table
    - Ensure proper INSERT permissions for admin users
  
  2. Security
    - Maintain existing read access for authenticated users
    - Allow full CRUD operations for admin users
    - Protect archived items from regular users
*/

-- Fix products table policies
DROP POLICY IF EXISTS "Enable full access for admins" ON products;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON products;

CREATE POLICY "Enable full access for admins"
ON products
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'role')::text = 'ADMIN'
)
WITH CHECK (
  (auth.jwt() ->> 'role')::text = 'ADMIN'
);

CREATE POLICY "Enable read access for authenticated users"
ON products
FOR SELECT
TO authenticated
USING (
  status <> 'archived'
);

-- Fix brands table policies
DROP POLICY IF EXISTS "Brands are editable by admins only" ON brands;
DROP POLICY IF EXISTS "Brands are viewable by all authenticated users" ON brands;

CREATE POLICY "Enable full access for admins"
ON brands
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'role')::text = 'ADMIN'
)
WITH CHECK (
  (auth.jwt() ->> 'role')::text = 'ADMIN'
);

CREATE POLICY "Enable read access for authenticated users"
ON brands
FOR SELECT
TO authenticated
USING (
  status <> 'archived'
);