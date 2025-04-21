/*
  # Fix Customers RLS Policies

  1. Changes
    - Update RLS policies for customers table
    - Fix policy for admin access to customers data
    - Fix policy for pricelists

  2. Security
    - Allow admins full access
    - Allow customers to view their own data only
*/

-- Ensure RLS is enabled for customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Customers are editable by admins only" ON customers;
DROP POLICY IF EXISTS "Customers can view own data" ON customers;

-- Create policies for customers table
CREATE POLICY "Enable full access for admins"
ON customers
FOR ALL
TO authenticated
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

CREATE POLICY "Customers can view own data"
ON customers
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- Ensure RLS is enabled for pricelists
ALTER TABLE pricelists ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Pricelists are editable by admins only" ON pricelists;
DROP POLICY IF EXISTS "Pricelists are viewable by assigned customers and admins" ON pricelists;

-- Create policies for pricelists table
CREATE POLICY "Enable full access for admins"
ON pricelists
FOR ALL
TO authenticated
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

CREATE POLICY "Pricelists are viewable by assigned customers"
ON pricelists
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM customers
    WHERE customers.pricelist_id = pricelists.id
    AND customers.user_id = auth.uid()
  ) 
  OR auth.is_admin()
);

-- Create pricelist if none exists
DO $$
DECLARE
  pricelist_count int;
BEGIN
  SELECT COUNT(*) INTO pricelist_count FROM pricelists;
  
  IF pricelist_count = 0 THEN
    INSERT INTO pricelists (name, description, status)
    VALUES 
      ('Standard Pricelist', 'Default pricing for standard customers', 'active'),
      ('Wholesale Pricelist', 'Discounted pricing for wholesale customers', 'active'),
      ('Premium Pricelist', 'Premium pricing for special customers', 'active');
  END IF;
END $$;