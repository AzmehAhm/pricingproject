/*
  # Add RLS policies for products table

  1. Changes
    - Add RLS policies for products table to allow ADMIN users to perform all operations
    - Add policy for authenticated users to view active products

  2. Security
    - Enable RLS on products table (if not already enabled)
    - Add policies for:
      - ADMIN users can perform all operations
      - Authenticated users can view non-archived products
*/

-- Enable RLS on products table (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Products are editable by admins only" ON products;
DROP POLICY IF EXISTS "Products are viewable by all authenticated users" ON products;

-- Create new policies
CREATE POLICY "Products are editable by admins only"
ON products
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'role')::text = 'ADMIN'
)
WITH CHECK (
  (auth.jwt() ->> 'role')::text = 'ADMIN'
);

CREATE POLICY "Products are viewable by all authenticated users"
ON products
FOR SELECT
TO authenticated
USING (
  status <> 'archived'
);