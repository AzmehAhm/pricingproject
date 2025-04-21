import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useCustomerProducts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer-products', user?.id],
    queryFn: async () => {
      // First get the customer's pricelist
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('pricelist_id')
        .eq('user_id', user?.id)
        .single();

      if (customerError) throw customerError;
      
      if (!customerData?.pricelist_id) {
        throw new Error('No pricelist assigned to this customer');
      }

      // Then get the products with variants and prices
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, 
          name, 
          description,
          image_url,
          status,
          brands:brand_id(id, name),
          sub_brands:sub_brand_id(id, name),
          categories:category_id(id, name),
          variants:product_variants(
            id,
            sku,
            color,
            status,
            size:size_id(id, name),
            prices:pricelist_items(
              id,
              price,
              pricelist_id
            )
          )
        `)
        .eq('status', 'active')
        .eq('variants.status', 'active')
        .eq('variants.prices.pricelist_id', customerData.pricelist_id);

      if (error) throw error;

      return data;
    },
    enabled: !!user?.id,
  });
}