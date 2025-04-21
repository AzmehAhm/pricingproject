import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface Pricelist {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

interface PricelistFormData {
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
}

export function usePricelists() {
  const queryClient = useQueryClient();

  const { data: pricelists, isLoading } = useQuery({
    queryKey: ['pricelists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricelists')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Pricelist[];
    },
  });

  const createPricelist = useMutation({
    mutationFn: async (newPricelist: PricelistFormData) => {
      const { data, error } = await supabase
        .from('pricelists')
        .insert([newPricelist])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricelists'] });
    },
  });

  const updatePricelist = useMutation({
    mutationFn: async ({ id, ...pricelist }: PricelistFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('pricelists')
        .update(pricelist)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricelists'] });
    },
  });

  const deletePricelist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pricelists')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricelists'] });
    },
  });

  return {
    pricelists,
    isLoading,
    createPricelist,
    updatePricelist,
    deletePricelist,
  };
}