import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ProductFormData, Brand, Category } from '../types/product';

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  isSubmitting: boolean;
}

function ProductForm({ initialData, onSubmit, isSubmitting }: ProductFormProps) {
  const [formData, setFormData] = React.useState<ProductFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    brand_id: initialData?.brand_id || null,
    sub_brand_id: initialData?.sub_brand_id || null,
    category_id: initialData?.category_id || null,
    image_url: initialData?.image_url || '',
    status: initialData?.status || 'active',
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('status', 'active');
      if (error) throw error;
      return data as Brand[];
    },
  });

  const { data: subBrands } = useQuery({
    queryKey: ['sub-brands', formData.brand_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_brands')
        .select('*')
        .eq('brand_id', formData.brand_id)
        .eq('status', 'active');
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
    enabled: !!formData.brand_id,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active');
      if (error) throw error;
      return data as Category[];
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert empty strings to null for UUID fields
    const newValue = ['brand_id', 'sub_brand_id', 'category_id'].includes(name) && value === '' 
      ? null 
      : value;
    
    // Clear sub_brand_id when brand_id changes
    if (name === 'brand_id') {
      setFormData(prev => ({
        ...prev,
        [name]: newValue,
        sub_brand_id: null
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: newValue }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Product Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="brand_id" className="block text-sm font-medium text-gray-700">
          Brand
        </label>
        <select
          id="brand_id"
          name="brand_id"
          value={formData.brand_id || ''}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        >
          <option value="">Select a brand</option>
          {brands?.map(brand => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      {formData.brand_id && subBrands?.length > 0 && (
        <div>
          <label htmlFor="sub_brand_id" className="block text-sm font-medium text-gray-700">
            Sub-Brand
          </label>
          <select
            id="sub_brand_id"
            name="sub_brand_id"
            value={formData.sub_brand_id || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="">Select a sub-brand</option>
            {subBrands.map(subBrand => (
              <option key={subBrand.id} value={subBrand.id}>
                {subBrand.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category_id"
          name="category_id"
          value={formData.category_id || ''}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        >
          <option value="">Select a category</option>
          {categories?.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          type="url"
          id="image_url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;