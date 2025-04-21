/*
  # Fix brands table RLS policies

  1. Changes
    - Drop existing RLS policies on brands table
    - Add new RLS policies that properly handle admin access
    - Add helper function for checking admin role

  2. Security
    - Enable RLS on brands table (in case it was disabled)
    - Add policies for:
      - Full access for admin users
      - Read access for authenticated users (non-archived brands only)
*/

-- First create a helper function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt()->>'role' = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure RLS is enabled
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable full access for admins" ON public.brands;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.brands;

-- Create new policies
CREATE POLICY "Enable full access for admins"
ON public.brands
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Enable read access for authenticated users"
ON public.brands
FOR SELECT
TO authenticated
USING (status <> 'archived');