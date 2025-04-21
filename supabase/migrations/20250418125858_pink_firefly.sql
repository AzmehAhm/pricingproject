/*
  # Fix is_admin function

  This migration creates a proper is_admin function that works with JWT claims
  to correctly identify admin users.
*/

-- Create a proper is_admin function
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the user role in JWT claims is ADMIN
  RETURN (
    COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'role', '') = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix policies for brands table
DROP POLICY IF EXISTS "Enable full access for admins" ON brands;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON brands;

CREATE POLICY "Enable full access for admins"
ON brands
FOR ALL
TO authenticated
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

CREATE POLICY "Enable read access for authenticated users"
ON brands
FOR SELECT
TO authenticated
USING (status <> 'archived');

-- Fix policies for products table
DROP POLICY IF EXISTS "Enable full access for admins" ON products;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON products;

CREATE POLICY "Enable full access for admins"
ON products
FOR ALL
TO authenticated
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

CREATE POLICY "Enable read access for authenticated users"
ON products
FOR SELECT
TO authenticated
USING (status <> 'archived');

-- Fix policies for categories table
DROP POLICY IF EXISTS "Enable full access for admins" ON categories;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON categories;

CREATE POLICY "Enable full access for admins"
ON categories
FOR ALL
TO authenticated
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

CREATE POLICY "Enable read access for authenticated users"
ON categories
FOR SELECT
TO authenticated
USING (status <> 'archived');