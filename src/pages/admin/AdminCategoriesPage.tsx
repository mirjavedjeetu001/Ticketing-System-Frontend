import React, { useState } from 'react';
import CategoryManagement from '../../components/admin/CategoryManagement';

const AdminCategoriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Premium Background Pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Categories Management
              </h1>
              <p className="text-slate-600 font-medium mt-2">Configure issue categories and SLA settings</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-4 py-2.5 bg-white/50 backdrop-blur border border-white/20 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-slate-900/10 overflow-hidden">
          <div className="p-8">
            <CategoryManagement searchTerm={searchTerm} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;