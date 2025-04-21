/*
  # Create auth.is_admin function
  
  1. New Function
    - `auth.is_admin()` - Function to check if current user has ADMIN role
  
  2. Purpose
    - This function will be used in RLS policies to grant admin users full access
    - Fixes the "new row violates row-level security policy" error for admin users
*/

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create the is_admin function
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean 
LANGUAGE sql SECURITY DEFINER
AS $$
  -- Check if the current user has the ADMIN role
  SELECT 
    CASE WHEN EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ADMIN'
    ) THEN TRUE
    ELSE 
      -- Alternative check using the JWT claim directly
      (current_setting('request.jwt.claims', true)::json->>'role') = 'ADMIN'
    END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION auth.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_admin() TO anon;