import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, Users, Tags, PaintBucket } from 'lucide-react';

function Dashboard() {
  const { user } = useAuth();
  const adminName = user?.email?.split('@')[0] || 'Admin';

  const stats = [
    { label: 'Total Products', value: '0', icon: Package },
    { label: 'Active Brands', value: '0', icon: PaintBucket },
    { label: 'Categories', value: '0', icon: Tags },
    { label: 'Customers', value: '0', icon: Users },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {adminName}!
        </h1>
        <p className="mt-1 text-gray-600">
          Here's what's happening with your paint store today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="px-6 py-6 bg-white rounded-lg shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  {item.label}
                </span>
                <Icon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-2">
                <p className="text-3xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <LayoutDashboard className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900">Add New Product</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a new product listing
            </p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900">Manage Inventory</h3>
            <p className="mt-1 text-sm text-gray-500">
              Update stock and prices
            </p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-900">View Reports</h3>
            <p className="mt-1 text-sm text-gray-500">
              Check sales and analytics
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;