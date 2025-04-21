/*
  # Add Sample Data for Products, Variants and Prices

  1. Changes
    - Add sample data for customer to see products
    - Create product variants for existing products
    - Add prices to the pricelist
*/

DO $$
DECLARE
  product_id uuid;
  size_small_id uuid;
  size_medium_id uuid;
  size_large_id uuid;
  variant_id uuid;
  pricelist_id uuid;
BEGIN
  -- Get the pricelist ID for the customer
  SELECT id INTO pricelist_id FROM pricelists WHERE name = 'Standard Pricelist';
  
  -- Get size IDs
  SELECT id INTO size_small_id FROM sizes WHERE name = '1L' LIMIT 1;
  SELECT id INTO size_medium_id FROM sizes WHERE name = '2L' LIMIT 1;
  SELECT id INTO size_large_id FROM sizes WHERE name = '5L' LIMIT 1;
  
  -- Create sizes if they don't exist
  IF size_small_id IS NULL THEN
    INSERT INTO sizes (name, status) VALUES ('1L', 'active') RETURNING id INTO size_small_id;
  END IF;
  
  IF size_medium_id IS NULL THEN
    INSERT INTO sizes (name, status) VALUES ('2L', 'active') RETURNING id INTO size_medium_id;
  END IF;
  
  IF size_large_id IS NULL THEN
    INSERT INTO sizes (name, status) VALUES ('5L', 'active') RETURNING id INTO size_large_id;
  END IF;
  
  -- For each product in the database, add variants and prices
  FOR product_id IN SELECT id FROM products WHERE status = 'active' LIMIT 5
  LOOP
    -- Create a small variant
    INSERT INTO product_variants (
      product_id, 
      size_id, 
      color, 
      sku, 
      status
    ) VALUES (
      product_id,
      size_small_id,
      'White',
      'SKU-' || SUBSTR(MD5(RANDOM()::TEXT), 0, 8),
      'active'
    ) RETURNING id INTO variant_id;
    
    -- Add price to pricelist
    INSERT INTO pricelist_items (
      pricelist_id,
      product_variant_id,
      price
    ) VALUES (
      pricelist_id,
      variant_id,
      19.99 + (RANDOM() * 30)::NUMERIC(10,2)
    );
    
    -- Create a medium variant
    INSERT INTO product_variants (
      product_id, 
      size_id, 
      color, 
      sku, 
      status
    ) VALUES (
      product_id,
      size_medium_id,
      'Blue',
      'SKU-' || SUBSTR(MD5(RANDOM()::TEXT), 0, 8),
      'active'
    ) RETURNING id INTO variant_id;
    
    -- Add price to pricelist
    INSERT INTO pricelist_items (
      pricelist_id,
      product_variant_id,
      price
    ) VALUES (
      pricelist_id,
      variant_id,
      29.99 + (RANDOM() * 40)::NUMERIC(10,2)
    );
    
    -- Create a large variant
    INSERT INTO product_variants (
      product_id, 
      size_id, 
      color, 
      sku, 
      status
    ) VALUES (
      product_id,
      size_large_id,
      'Red',
      'SKU-' || SUBSTR(MD5(RANDOM()::TEXT), 0, 8),
      'active'
    ) RETURNING id INTO variant_id;
    
    -- Add price to pricelist
    INSERT INTO pricelist_items (
      pricelist_id,
      product_variant_id,
      price
    ) VALUES (
      pricelist_id,
      variant_id,
      49.99 + (RANDOM() * 50)::NUMERIC(10,2)
    );
  END LOOP;
  
END $$;