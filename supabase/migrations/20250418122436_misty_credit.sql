/*
  # Fix RLS policies for brands and categories

  1. Security Changes
    - Enable RLS on categories table
    - Add policies for categories:
      - Admins can perform all operations
      - Authenticated users can view active categories
    - Update brands policies to match categories
    - Use JWT claims for role checking instead of users table

  2. Notes
    - Fixes the users table dependency
    - Maintains same security model using JWT claims
*/

-- Enable RLS on categories table (brands already has RLS enabled)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Categories are editable by admins only"
ON categories
FOR ALL
TO authenticated
USING (
  auth.jwt()->>'role' = 'ADMIN'
);

CREATE POLICY "Categories are viewable by all authenticated users"
ON categories
FOR SELECT
TO authenticated
USING (status <> 'archived');

-- Update brands policies to match categories
DROP POLICY IF EXISTS "Brands are editable by admins only" ON brands;
DROP POLICY IF EXISTS "Brands are viewable by all authenticated users" ON brands;

CREATE POLICY "Brands are editable by admins only"
ON brands
FOR ALL
TO authenticated
USING (
  auth.jwt()->>'role' = 'ADMIN'
);

CREATE POLICY "Brands are viewable by all authenticated users"
ON brands
FOR SELECT
TO authenticated
USING (status <> 'archived');