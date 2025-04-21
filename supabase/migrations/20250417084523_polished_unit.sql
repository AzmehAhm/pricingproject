/*
  # Initial Schema for Paint Manufacturing Company

  1. Core Tables
    - Brands: Company brands
    - SubBrands: Sub-brands under main brands
    - Categories: Product categories
    - Sizes: Available product sizes
    - Products: Main product information
    - ProductVariants: Size and color variants
    - Pricelists: Price lists for different customer segments
    - PricelistItems: Individual prices for products
    - PriceHistory: Audit trail for price changes
    - Customers: Customer information

  2. Security
    - Enable RLS on all tables
    - Set up policies for ADMIN and CUSTOMER roles
    - Secure access to sensitive data
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('ADMIN', 'CUSTOMER');
CREATE TYPE status_type AS ENUM ('active', 'inactive', 'archived');

-- Create tables
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  status status_type DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sub_brands (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id uuid REFERENCES brands(id),
  name text NOT NULL,
  status status_type DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  status status_type DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sizes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  status status_type DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id uuid REFERENCES brands(id),
  sub_brand_id uuid REFERENCES sub_brands(id),
  category_id uuid REFERENCES categories(id),
  name text NOT NULL,
  description text,
  image_url text,
  status status_type DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id),
  size_id uuid REFERENCES sizes(id),
  color text,
  sku text UNIQUE NOT NULL,
  status status_type DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricelists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  status status_type DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricelist_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pricelist_id uuid REFERENCES pricelists(id),
  product_variant_id uuid REFERENCES product_variants(id),
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(pricelist_id, product_variant_id)
);

CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pricelist_item_id uuid REFERENCES pricelist_items(id),
  old_price decimal(10,2) NOT NULL,
  new_price decimal(10,2) NOT NULL,
  changed_at timestamptz DEFAULT now(),
  changed_by uuid REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) UNIQUE,
  pricelist_id uuid REFERENCES pricelists(id),
  company_name text NOT NULL,
  contact_person text NOT NULL,
  status status_type DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_pricelist_items_pricelist ON pricelist_items(pricelist_id);
CREATE INDEX idx_price_history_item ON price_history(pricelist_item_id);
CREATE INDEX idx_customers_user ON customers(user_id);

-- Enable Row Level Security
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricelists ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricelist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Brands
CREATE POLICY "Brands are viewable by all authenticated users"
  ON brands FOR SELECT
  TO authenticated
  USING (status != 'archived');

CREATE POLICY "Brands are editable by admins only"
  ON brands FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'ADMIN'
    )
  );

-- Similar policies for other tables...
-- Products
CREATE POLICY "Products are viewable by all authenticated users"
  ON products FOR SELECT
  TO authenticated
  USING (status != 'archived');

CREATE POLICY "Products are editable by admins only"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'ADMIN'
    )
  );

-- Customers can only view their own data
CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'ADMIN'
    )
  );

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Similar triggers for other tables...

-- Create function to log price changes
CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price != OLD.price THEN
    INSERT INTO price_history (
      pricelist_item_id,
      old_price,
      new_price,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.price,
      NEW.price,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for price change logging
CREATE TRIGGER log_price_changes
  AFTER UPDATE OF price ON pricelist_items
  FOR EACH ROW
  EXECUTE FUNCTION log_price_change();