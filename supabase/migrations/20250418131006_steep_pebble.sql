/*
  # Fix Product Variants RLS Policy

  1. Changes
     - Update the RLS policy for product_variants to use the auth.is_admin() function
     - This aligns with how other tables in the schema check for admin rights
   
  2. Security
     - The updated policy will ensure that admins can properly create and edit product variants
     - Maintains the existing policy for read access
*/

-- Drop the existing policy for admin editing
DROP POLICY IF EXISTS "Product variants are editable by admins only" ON public.product_variants;

-- Create the updated policy using auth.is_admin() function
CREATE POLICY "Enable full access for admins" 
ON public.product_variants
FOR ALL
TO authenticated
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

-- Keep the existing SELECT policy in place
-- This maintains read access for authenticated users where status is not archived