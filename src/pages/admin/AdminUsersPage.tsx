import React from 'react';
import UserManagement from '../../components/admin/UserManagement';

const AdminUsersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        <UserManagement />
      </div>
    </div>
  );
};

export default AdminUsersPage;
