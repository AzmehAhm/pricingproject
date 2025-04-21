/*
  # Fix Products RLS Policies

  1. Changes
    - Drop existing RLS policies for products table
    - Create new RLS policies that properly handle admin roles using JWT claims
    
  2. Security
    - Add proper RLS policies for CRUD operations
    - Ensure admins have full access
    - Maintain read access for authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "admin_delete" ON products;
DROP POLICY IF EXISTS "admin_insert" ON products;
DROP POLICY IF EXISTS "admin_update" ON products;
DROP POLICY IF EXISTS "authenticated_read" ON products;

-- Create new policies using proper role checks
CREATE POLICY "Enable full access for admins"
ON products
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Enable read access for authenticated users"
ON products
FOR SELECT
TO authenticated
USING (status <> 'archived');