/*
  # Ensure Sample Brands and Categories

  1. Changes
    - Add sample brands if none exist
    - Add sample categories if none exist
    - Add sample products if none exist
*/

DO $$
DECLARE
  brand_id uuid;
  category_id uuid;
BEGIN
  -- Add a brand if none exist
  IF NOT EXISTS (SELECT 1 FROM brands WHERE status = 'active') THEN
    INSERT INTO brands (name, status) 
    VALUES 
      ('Premium Paints', 'active'),
      ('ColorMaster', 'active'),
      ('ProPaint', 'active')
    RETURNING id INTO brand_id;
    
    -- Add a category if none exist
    IF NOT EXISTS (SELECT 1 FROM categories WHERE status = 'active') THEN
      INSERT INTO categories (name, status) 
      VALUES 
        ('Interior', 'active'),
        ('Exterior', 'active'),
        ('Specialty', 'active')
      RETURNING id INTO category_id;
      
      -- Add a few products if none exist
      IF NOT EXISTS (SELECT 1 FROM products WHERE status = 'active') THEN
        INSERT INTO products (
          name, 
          description, 
          brand_id, 
          category_id, 
          status,
          image_url
        ) VALUES
          (
            'Premium Satin Finish', 
            'Long-lasting interior paint with a beautiful satin finish', 
            brand_id, 
            category_id, 
            'active',
            'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
          ),
          (
            'Weather Shield Exterior', 
            'Weather-resistant exterior paint for all conditions', 
            (SELECT id FROM brands WHERE name = 'ColorMaster' AND status = 'active'), 
            (SELECT id FROM categories WHERE name = 'Exterior' AND status = 'active'), 
            'active',
            'https://images.unsplash.com/photo-1541251205067-185caea66cc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
          ),
          (
            'Anti-Mold Formula', 
            'Specialty paint with anti-fungal properties for high-humidity areas', 
            (SELECT id FROM brands WHERE name = 'ProPaint' AND status = 'active'), 
            (SELECT id FROM categories WHERE name = 'Specialty' AND status = 'active'), 
            'active',
            'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
          );
      END IF;
    END IF;
  END IF;
END $$;