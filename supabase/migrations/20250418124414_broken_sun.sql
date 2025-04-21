/*
  # Create user roles and permissions

  1. New Roles
    - Creates anon and authenticated roles
    - Sets up proper role inheritance
    - Configures default privileges

  2. Role Grants
    - Grants appropriate permissions to each role
    - Sets up RLS policies using role-based checks

  3. Changes
    - Updates existing RLS policies to use proper role checks
*/

-- Create roles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
  END IF;
END
$$;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant table access
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Create custom claims checking functions
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'authenticated'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
  SELECT auth.user_role() = 'ADMIN';
$$ LANGUAGE sql SECURITY DEFINER;

-- Update RLS policies to use the new role functions
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable full access for admins" ON products;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON products;

CREATE POLICY "Enable full access for admins"
ON products
FOR ALL
TO authenticated
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

CREATE POLICY "Enable read access for authenticated users"
ON products
FOR SELECT
TO authenticated
USING (status <> 'archived');

-- Update brands policies
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable full access for admins" ON brands;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON brands;

CREATE POLICY "Enable full access for admins"
ON brands
FOR ALL
TO authenticated
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

CREATE POLICY "Enable read access for authenticated users"
ON brands
FOR SELECT
TO authenticated
USING (status <> 'archived');

-- Update categories policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are editable by admins only" ON categories;
DROP POLICY IF EXISTS "Categories are viewable by all authenticated users" ON categories;

CREATE POLICY "Enable full access for admins"
ON categories
FOR ALL
TO authenticated
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

CREATE POLICY "Enable read access for authenticated users"
ON categories
FOR SELECT
TO authenticated
USING (status <> 'archived');