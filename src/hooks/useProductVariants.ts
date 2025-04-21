import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ProductVariant, ProductVariantFormData } from '../types/product';

export function useProductVariants(productId?: string) {
  const queryClient = useQueryClient();

  const { data: variants, isLoading } = useQuery({
    queryKey: ['product-variants', productId],
    queryFn: async () => {
      let query = supabase
        .from('product_variants')
        .select(`
          *,
          product:product_id(*),
          size:size_id(*)
        `);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProductVariant[];
    },
    enabled: !!productId, // Only run the query if productId is provided
  });

  const createVariant = useMutation({
    mutationFn: async (newVariant: ProductVariantFormData) => {
      const { data, error } = await supabase
        .from('product_variants')
        .insert([newVariant])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
    },
  });

  const updateVariant = useMutation({
    mutationFn: async ({ id, ...variant }: ProductVariantFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('product_variants')
        .update(variant)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
    },
  });

  const deleteVariant = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_variants')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
    },
  });

  return {
    variants,
    isLoading,
    createVariant,
    updateVariant,
    deleteVariant,
  };
}