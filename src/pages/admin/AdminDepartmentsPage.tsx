import React from 'react';
import EnhancedDepartmentManagement from '../../components/admin/EnhancedDepartmentManagement';

const AdminDepartmentsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        <EnhancedDepartmentManagement />
      </div>
    </div>
  );
};

export default AdminDepartmentsPage;