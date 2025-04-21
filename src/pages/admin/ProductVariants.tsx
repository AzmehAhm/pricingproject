import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layers, ArrowLeft, Plus, Edit, Trash2, X } from 'lucide-react';
import { useProductVariants } from '../../hooks/useProductVariants';
import { useSizes } from '../../hooks/useSizes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { ProductVariantFormData } from '../../types/product';

function ProductVariants() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedVariant, setSelectedVariant] = React.useState<any>(null);
  const [formData, setFormData] = React.useState<ProductVariantFormData>({
    product_id: productId || '',
    size_id: '',
    color: '',
    sku: '',
    status: 'active'
  });

  const { variants, isLoading, createVariant, updateVariant, deleteVariant } = useProductVariants(productId);
  const { sizes } = useSizes();

  // Get product details
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brands:brand_id(name),
          categories:category_id(name)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedVariant) {
        await updateVariant.mutateAsync({ ...formData, id: selectedVariant.id });
      } else {
        await createVariant.mutateAsync(formData);
      }
      setIsModalOpen(false);
      setSelectedVariant(null);
      setFormData({
        product_id: productId || '',
        size_id: '',
        color: '',
        sku: '',
        status: 'active'
      });
    } catch (error) {
      console.error('Error saving variant:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this variant?')) {
      try {
        await deleteVariant.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting variant:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'size_id' && value === '' ? null : value
    }));
  };

  const generateSku = () => {
    if (!product) return;
    
    const brand = product.brands?.name?.substring(0, 3).toUpperCase() || 'XXX';
    const productName = product.name.substring(0, 3).toUpperCase();
    const sizeCode = formData.size_id && sizes
      ? sizes.find(s => s.id === formData.size_id)?.name.substring(0, 2).toUpperCase() || 'XX'
      : 'XX';
    const colorCode = formData.color
      ? formData.color.substring(0, 3).toUpperCase()
      : 'XXX';
    
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const sku = `${brand}-${productName}-${sizeCode}-${colorCode}-${randomNum}`;
    
    setFormData(prev => ({
      ...prev,
      sku
    }));
  };

  if (isLoadingProduct) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-800">Product not found</h1>
        <button
          onClick={() => navigate('/admin/products')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate('/admin/products')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Products
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6" />
            Product Variants: {product.name}
          </h1>
          <p className="mt-1 text-gray-600">
            Brand: {product.brands?.name || 'N/A'} | Category: {product.categories?.name || 'N/A'}
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedVariant(null);
            setFormData({
              product_id: productId || '',
              size_id: '',
              color: '',
              sku: '',
              status: 'active'
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Variant
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500" colSpan={5}>
                    Loading...
                  </td>
                </tr>
              ) : variants?.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500" colSpan={5}>
                    No variants found. Add your first variant.
                  </td>
                </tr>
              ) : (
                variants?.map((variant) => (
                  <tr key={variant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {variant.sku}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variant.size?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variant.color || 'N/A'}
                      {variant.color && (
                        <span 
                          className="ml-2 inline-block w-4 h-4 rounded-full border border-gray-300" 
                          style={{ backgroundColor: variant.color }}
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        variant.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {variant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedVariant(variant);
                          setFormData({
                            product_id: variant.product_id,
                            size_id: variant.size_id || '',
                            color: variant.color || '',
                            sku: variant.sku,
                            status: variant.status
                          });
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(variant.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedVariant ? 'Edit Variant' : 'Add New Variant'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedVariant(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="size_id" className="block text-sm font-medium text-gray-700">
                  Size
                </label>
                <select
                  id="size_id"
                  name="size_id"
                  value={formData.size_id || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                >
                  <option value="">Select a size</option>
                  {sizes?.map(size => (
                    <option key={size.id} value={size.id}>
                      {size.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={formData.color || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Red, Blue, #FF5733"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  />
                  {formData.color && (
                    <div 
                      className="ml-2 w-8 h-8 rounded-full border border-gray-300" 
                      style={{ backgroundColor: formData.color }}
                    />
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                  SKU
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Unique product code"
                    required
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={generateSku}
                    className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedVariant(null);
                  }}
                  className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {selectedVariant ? 'Update Variant' : 'Add Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductVariants;