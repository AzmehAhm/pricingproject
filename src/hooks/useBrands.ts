import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Brand } from '../types/product';

export function useBrands() {
  const queryClient = useQueryClient();

  const { data: brands, isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*, sub_brands(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Brand & { sub_brands: any[] })[];
    },
  });

  const createBrand = useMutation({
    mutationFn: async (newBrand: { name: string; status: string }) => {
      const { data, error } = await supabase
        .from('brands')
        .insert([newBrand])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });

  const updateBrand = useMutation({
    mutationFn: async ({ id, ...brand }: { id: string; name: string; status: string }) => {
      const { data, error } = await supabase
        .from('brands')
        .update(brand)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });

  const deleteBrand = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('brands')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });

  return {
    brands,
    isLoading,
    createBrand,
    updateBrand,
    deleteBrand,
  };
}