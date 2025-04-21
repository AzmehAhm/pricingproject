import React, { useState } from 'react';
import { Users, Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { useCustomers } from '../../hooks/useCustomers';

interface CustomerFormData {
  id?: string;
  company_name: string;
  contact_person: string;
  pricelist_id: string | null;
  email: string;
  password?: string;
  status: 'active' | 'inactive' | 'archived';
}

function Customers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CustomerFormData>({
    company_name: '',
    contact_person: '',
    pricelist_id: null,
    email: '',
    password: '',
    status: 'active'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [userCreationInfo, setUserCreationInfo] = useState(false);

  const { customers, pricelists, isLoading, createCustomer, updateCustomer, deleteCustomer } = useCustomers();

  const filteredCustomers = React.useMemo(() => {
    if (!customers) return [];
    return customers.filter(customer =>
      customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCustomer) {
        await updateCustomer.mutateAsync({ ...formData, id: selectedCustomer.id });
      } else {
        // Show a notification if the user is trying to create a customer with an email
        if (formData.email && formData.password) {
          setUserCreationInfo(true);
          return;
        }
        
        await createCustomer.mutateAsync(formData);
      }
      setIsModalOpen(false);
      setSelectedCustomer(null);
      resetForm();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error saving customer. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      contact_person: '',
      pricelist_id: null,
      email: '',
      password: '',
      status: 'active'
    });
    setShowPassword(false);
    setUserCreationInfo(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Error deleting customer. Please try again.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convert empty strings to null for pricelist_id
    const newValue = name === 'pricelist_id' && value === '' ? null : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Customers
          </h1>
          <p className="mt-1 text-gray-600">Manage customer accounts and pricelists</p>
        </div>
        <button 
          onClick={() => {
            setSelectedCustomer(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <select 
              className="border border-gray-300 rounded-md px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              onChange={(e) => setSearchTerm(e.target.value === 'all' ? '' : e.target.value)}
            >
              <option value="all">All Pricelists</option>
              {pricelists?.map((pricelist) => (
                <option key={pricelist.id} value={pricelist.name}>
                  {pricelist.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricelist
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
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500" colSpan={6}>
                    Loading...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500" colSpan={6}>
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.company_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.contact_person}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.user?.email || 'No account'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.pricelist?.name || 'None'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setFormData({
                            company_name: customer.company_name,
                            contact_person: customer.contact_person,
                            pricelist_id: customer.pricelist_id,
                            email: customer.user?.email || '',
                            status: customer.status
                          });
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedCustomer(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {userCreationInfo && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                <h4 className="text-sm font-medium text-yellow-800">User Account Creation Not Available</h4>
                <p className="text-xs text-yellow-700 mt-1">
                  Creating user accounts directly from the admin interface is not supported. Please create the customer without an account for now. User accounts need to be created through a secure backend function.
                </p>
                <button 
                  onClick={() => setUserCreationInfo(false)}
                  className="mt-2 text-xs text-indigo-600 hover:text-indigo-500">
                  Continue without user account
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700">
                  Contact Person
                </label>
                <input
                  type="text"
                  id="contact_person"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="pricelist_id" className="block text-sm font-medium text-gray-700">
                  Pricelist
                </label>
                <select
                  id="pricelist_id"
                  name="pricelist_id"
                  value={formData.pricelist_id || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                >
                  <option value="">Select a pricelist</option>
                  {pricelists?.map(pricelist => (
                    <option key={pricelist.id} value={pricelist.id}>
                      {pricelist.name}
                    </option>
                  ))}
                </select>
              </div>

              {!selectedCustomer && (
                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">User Account Information</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Note: User account creation requires a secure backend function. This section is disabled for now.
                  </p>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      
                      placeholder="User accounts must be created separately"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-400"
                    />
                  </div>
                </div>
              )}

              {selectedCustomer && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed from this interface.
                  </p>
                </div>
              )}

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

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedCustomer(null);
                    resetForm();
                  }}
                  className="mr-3 inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCustomer.isPending || updateCustomer.isPending}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {createCustomer.isPending || updateCustomer.isPending ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;