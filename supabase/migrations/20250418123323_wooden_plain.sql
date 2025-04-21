/*
  # Fix products table RLS policies

  1. Changes
    - Drop all existing policies to start fresh
    - Add granular policies for each operation type
    - Fix ADMIN role check syntax
    - Ensure proper WITH CHECK clauses

  2. Security
    - Enable RLS on products table
    - Add separate policies for:
      - INSERT: Only ADMIN users
      - UPDATE: Only ADMIN users
      - DELETE: Only ADMIN users
      - SELECT: All authenticated users (non-archived products)
*/

-- Enable RLS on products table (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Products are editable by admins only" ON products;
DROP POLICY IF EXISTS "Products are viewable by all authenticated users" ON products;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable all access for admin users" ON products;
DROP POLICY IF EXISTS "admin_insert" ON products;
DROP POLICY IF EXISTS "admin_update" ON products;
DROP POLICY IF EXISTS "admin_delete" ON products;
DROP POLICY IF EXISTS "authenticated_read" ON products;

-- Create granular policies for each operation
CREATE POLICY "admin_insert"
ON products
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt()->>'role' = 'ADMIN'
);

CREATE POLICY "admin_update"
ON products
FOR UPDATE
TO authenticated
USING (
  auth.jwt()->>'role' = 'ADMIN'
)
WITH CHECK (
  auth.jwt()->>'role' = 'ADMIN'
);

CREATE POLICY "admin_delete"
ON products
FOR DELETE
TO authenticated
USING (
  auth.jwt()->>'role' = 'ADMIN'
);

CREATE POLICY "authenticated_read"
ON products
FOR SELECT
TO authenticated
USING (
  status <> 'archived'
);