/*
  # Fix RLS policies for sizes table

  1. Changes
    - Add proper RLS policies for the sizes table
    - Allow admin users to perform all operations
    - Allow authenticated users to view non-archived sizes

  2. Security
    - Ensure proper RLS policies are in place for CRUD operations
    - Use the is_admin() function to check admin role
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable full access for admins" ON sizes;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON sizes;

-- Create new policies
CREATE POLICY "Enable full access for admins"
ON sizes
FOR ALL
TO authenticated
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

CREATE POLICY "Enable read access for authenticated users"
ON sizes
FOR SELECT
TO authenticated
USING (status <> 'archived');