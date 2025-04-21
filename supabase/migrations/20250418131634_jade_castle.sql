/*
  # Add RLS Policies for Customer Product Variants Access

  1. Changes
    - Update RLS policies to allow customers to view product variants
    - Fix potential issues with pricing data access

  2. Security
    - Maintain existing security model with admin access
    - Add appropriate read access for authenticated customers
*/

-- Enable RLS for product_variants
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Product variants policies
DROP POLICY IF EXISTS "Product variants are viewable by all authenticated users" ON product_variants;

CREATE POLICY "Product variants are viewable by all authenticated users"
ON product_variants
FOR SELECT
TO authenticated
USING (status <> 'archived');

-- Make sure pricelist_items has appropriate policies for customers
DROP POLICY IF EXISTS "Pricelist items are viewable by customers with access to the pr" ON pricelist_items;

CREATE POLICY "Pricelist items are viewable by customers with access to the pricelist"
ON pricelist_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM customers
    WHERE customers.pricelist_id = pricelist_items.pricelist_id
    AND customers.user_id = auth.uid()
  ) 
  OR auth.is_admin()
);