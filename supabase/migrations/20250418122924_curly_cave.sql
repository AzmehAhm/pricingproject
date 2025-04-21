/*
  # Fix Products RLS Policies

  1. Changes
    - Drop existing RLS policies for products table
    - Create new policies that properly handle admin operations
    - Ensure admins can perform all operations
    - Maintain read access for authenticated users

  2. Security
    - Maintain RLS enabled on products table
    - Add comprehensive policies for all operations (SELECT, INSERT, UPDATE, DELETE)
    - Ensure proper role-based access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Products are editable by admins only" ON products;
DROP POLICY IF EXISTS "Products are viewable by all authenticated users" ON products;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON products
FOR SELECT
TO authenticated
USING (
  status <> 'archived'::status_type
);

CREATE POLICY "Enable all access for admin users"
ON products
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'role')::text = 'ADMIN'
) 
WITH CHECK (
  (auth.jwt() ->> 'role')::text = 'ADMIN'
);