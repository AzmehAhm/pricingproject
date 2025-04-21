import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNav from '../components/AdminNav';

function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 flex-shrink-0">
        <AdminNav />
      </div>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );

}
export default AdminLayout;