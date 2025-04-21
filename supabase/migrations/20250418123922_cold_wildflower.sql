/*
  # Fix Brands RLS Policies

  1. Changes
    - Drop existing RLS policies for brands table
    - Create new policies that properly handle:
      - Full access for admin users
      - Read access for authenticated users (non-archived brands only)
  
  2. Security
    - Maintains RLS enabled on brands table
    - Ensures proper access control based on user role
    - Prevents unauthorized modifications
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable full access for admins" ON brands;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON brands;

-- Create new policies with proper checks
CREATE POLICY "Enable full access for admins"
ON public.brands
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Enable read access for authenticated users"
ON public.brands
FOR SELECT
TO authenticated
USING (status <> 'archived');