import React, { useState, useMemo, useEffect } from 'react';
import { Package, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useCustomerProducts } from '../../hooks/useCustomerProducts';

function CustomerProducts() {
  const { data: products, isLoading, error } = useCustomerProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subBrandFilter, setSubBrandFilter] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  // Extract unique brands, categories, and sub-brands for filters
  const brands = useMemo(() => {
    if (!products) return [];
    const uniqueBrands = new Set();
    products.forEach(product => {
      if (product.brands?.name) {
        uniqueBrands.add(product.brands.name);
      }
    });
    return Array.from(uniqueBrands) as string[];
  }, [products]);

  const categories = useMemo(() => {
    if (!products) return [];
    const uniqueCategories = new Set();
    products.forEach(product => {
      if (product.categories?.name) {
        uniqueCategories.add(product.categories.name);
      }
    });
    return Array.from(uniqueCategories) as string[];
  }, [products]);

  const subBrands = useMemo(() => {
    if (!products) return [];
    const uniqueSubBrands = new Set();
    products.forEach(product => {
      if (product.sub_brands?.name) {
        uniqueSubBrands.add(product.sub_brands.name);
      }
    });
    return Array.from(uniqueSubBrands) as string[];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter(product => {
      const productName = product.name?.toLowerCase() || '';
      const brandName = product.brands?.name?.toLowerCase() || '';
      const categoryName = product.categories?.name?.toLowerCase() || '';
      const subBrandName = product.sub_brands?.name?.toLowerCase() || '';
      
      const matchesSearch = 
        productName.includes(searchTerm.toLowerCase()) ||
        brandName.includes(searchTerm.toLowerCase());
      
      const matchesBrand = brandFilter ? brandName === brandFilter.toLowerCase() : true;
      const matchesCategory = categoryFilter ? categoryName === categoryFilter.toLowerCase() : true;
      const matchesSubBrand = subBrandFilter ? subBrandName === subBrandFilter.toLowerCase() : true;
      
      return matchesSearch && matchesBrand && matchesCategory && matchesSubBrand;
    });
  }, [products, searchTerm, brandFilter, categoryFilter, subBrandFilter]);

  // Toggle product expansion
  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Initialize all products as expanded
  useEffect(() => {
    if (products && products.length > 0) {
      const expanded: Record<string, boolean> = {};
      products.forEach(product => {
        expanded[product.id] = true; // Initially expanded
      });
      setExpandedProducts(expanded);
    }
  }, [products]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p className="font-medium">Error loading products</p>
          <p className="text-sm">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-6 h-6" />
          Products Catalog
        </h1>
        <p className="mt-1 text-gray-600">Browse our collection of paints and supplies</p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {subBrands.length > 0 && (
            <select
              value={subBrandFilter}
              onChange={(e) => setSubBrandFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Sub-brands</option>
              {subBrands.map(subBrand => (
                <option key={subBrand} value={subBrand}>{subBrand}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No products found matching your criteria
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const hasVariants = product.variants && product.variants.length > 0;
                const isExpanded = expandedProducts[product.id] ?? true;
                const brandName = product.brands?.name || 'Unknown Brand';

                return (
                  <React.Fragment key={product.id}>
                    <tr 
                      className={`${hasVariants ? 'bg-gray-50 cursor-pointer hover:bg-gray-100' : ''}`}
                      onClick={() => hasVariants && toggleProductExpansion(product.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {brandName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                        {product.name}
                        {hasVariants && (
                          <button className="ml-2 focus:outline-none">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {!hasVariants ? 'N/A' : `${product.variants.length} sizes`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {!hasVariants ? 'N/A' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {!hasVariants ? 'Price not available' : ''}
                      </td>
                    </tr>
                    {hasVariants && isExpanded && product.variants.map(variant => (
                      <tr key={variant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 pl-10">
                          {variant.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {variant.size?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {variant.color ? (
                            <div className="flex items-center">
                              {variant.color}
                              <span
                                className="ml-2 inline-block w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: variant.color }}
                              />
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {variant.prices && variant.prices[0]?.price
                            ? `$${parseFloat(variant.prices[0].price).toFixed(2)}`
                            : 'Price not available'}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerProducts;