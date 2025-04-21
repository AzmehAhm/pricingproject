export interface Brand {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'archived';
}

export interface Category {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'archived';
}

export interface Size {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'archived';
}

export interface ProductFormData {
  name: string;
  description: string;
  brand_id: string | null;
  sub_brand_id: string | null;
  category_id: string | null;
  image_url: string;
  status: 'active' | 'inactive' | 'archived';
}

export interface Product extends ProductFormData {
  id: string;
  created_at: string;
  updated_at: string;
  brands?: {
    id: string;
    name: string;
  };
  categories?: {
    id: string;
    name: string;
  };
  sub_brands?: {
    id: string;
    name: string;
  };
}

export interface ProductVariantFormData {
  product_id: string;
  size_id: string | null;
  color: string | null;
  sku: string;
  status: 'active' | 'inactive' | 'archived';
}

export interface ProductVariant extends ProductVariantFormData {
  id: string;
  created_at: string;
  updated_at: string;
  product?: Product;
  size?: Size;
}