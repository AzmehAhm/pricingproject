import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface Customer {
  id: string;
  company_name: string;
  contact_person: string;
  pricelist_id: string | null;
  user_id: string | null;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
  pricelist?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    email?: string;
  };
}

interface CustomerFormData {
  company_name: string;
  contact_person: string;
  pricelist_id: string | null;
  email: string;
  password?: string;
  status: 'active' | 'inactive' | 'archived';
}

export function useCustomers() {
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      // Fetch the customers with pricelist info
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select(`
          *,
          pricelist:pricelists(id, name)
        `)
        .order('created_at', { ascending: false });

      if (customerError) throw customerError;

      // Get current user to handle user data association
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id;

      // Add user info where appropriate
      const customersWithUserInfo = (customerData || []).map(customer => {
        const userInfo = {
          id: customer.user_id,
          // Only add email for the current user since we can't query other users directly
          ...(customer.user_id === currentUserId && authData?.user?.email ? 
              { email: authData.user.email } : 
              {})
        };

        return {
          ...customer,
          user: customer.user_id ? userInfo : undefined
        };
      });

      return customersWithUserInfo as Customer[];
    },
  });

  const { data: pricelists } = useQuery({
    queryKey: ['pricelists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricelists')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      return data;
    },
  });

  const createCustomer = useMutation({
    mutationFn: async (customerData: CustomerFormData) => {
      // Note: User creation should happen in a secure backend function
      // We can only create the customer record from the frontend
      
      // Create customer record without associating a user for now
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          company_name: customerData.company_name,
          contact_person: customerData.contact_person,
          pricelist_id: customerData.pricelist_id,
          // Do not set user_id here as we can't create users from the frontend
          status: customerData.status
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const updateCustomer = useMutation({
    mutationFn: async ({ id, ...customerData }: CustomerFormData & { id: string }) => {
      // If we need to update user email, that would happen here with auth.admin.updateUserById

      // Update customer record
      const { data, error } = await supabase
        .from('customers')
        .update({
          company_name: customerData.company_name,
          contact_person: customerData.contact_person,
          pricelist_id: customerData.pricelist_id,
          status: customerData.status
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return {
    customers,
    pricelists,
    isLoading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}