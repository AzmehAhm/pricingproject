import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Size } from '../types/product';

export function useSizes() {
  const queryClient = useQueryClient();

  const { data: sizes, isLoading } = useQuery({
    queryKey: ['sizes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sizes')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Size[];
    },
  });

  const createSize = useMutation({
    mutationFn: async (newSize: { name: string; status: string }) => {
      const { data, error } = await supabase
        .from('sizes')
        .insert([newSize])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sizes'] });
    },
  });

  const updateSize = useMutation({
    mutationFn: async ({ id, ...size }: { id: string; name: string; status: string }) => {
      const { data, error } = await supabase
        .from('sizes')
        .update(size)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sizes'] });
    },
  });

  const deleteSize = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sizes')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sizes'] });
    },
  });

  return {
    sizes,
    isLoading,
    createSize,
    updateSize,
    deleteSize,
  };
}