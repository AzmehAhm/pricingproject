/*
  # Fix products RLS policies

  1. Changes
    - Drop all existing product policies to avoid conflicts
    - Create new granular policies for CRUD operations
    
  2. Security
    - Ensures admin users can perform all operations
    - Maintains read access for authenticated users
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Enable all access for admin users" ON products;
DROP POLICY IF EXISTS "Products are editable by admins only" ON products;
DROP POLICY IF EXISTS "Products are viewable by all authenticated users" ON products;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable insert for admin users" ON products;
DROP POLICY IF EXISTS "Enable update for admin users" ON products;
DROP POLICY IF EXISTS "Enable delete for admin users" ON products;

-- Create new policies
CREATE POLICY "admin_insert"
ON products
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text);

CREATE POLICY "admin_update"
ON products
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text);

CREATE POLICY "admin_delete"
ON products
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text);

CREATE POLICY "authenticated_read"
ON products
FOR SELECT
TO authenticated
USING (status <> 'archived'::status_type);