import React, { useState } from 'react';
import { Settings, Boxes, Tags, AlertTriangle, Users, Palette, Plus, Search, Filter } from 'lucide-react';
import ProductManagement from '../components/admin/ProductManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import DynamicSeverityManagement from '../components/admin/DynamicSeverityManagement';
import DepartmentManagement from '../components/admin/DepartmentManagement';
import SystemSettingsPage from '../components/admin/SystemSettingsPage';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'products', name: 'Products', icon: Boxes, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', description: 'Manage products and their configurations' },
    { id: 'categories', name: 'Categories', icon: Tags, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10', description: 'Configure issue categories and SLA settings' },
    { id: 'severity', name: 'Severity Levels', icon: AlertTriangle, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500/10', description: 'Set up severity levels and priorities' },
    { id: 'departments', name: 'Departments', icon: Users, color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', description: 'Manage departments and user roles' },
    { id: 'system-settings', name: 'System Settings', icon: Settings, color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-500/10', description: 'Configure severities, priorities, and SLA rules' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductManagement searchTerm={searchTerm} />;
      case 'categories':
        return <CategoryManagement searchTerm={searchTerm} />;
      case 'severity':
        return <DynamicSeverityManagement searchTerm={searchTerm} />;
      case 'departments':
        return <DepartmentManagement searchTerm={searchTerm} />;
      case 'system-settings':
        return <SystemSettingsPage searchTerm={searchTerm} />;
      default:
        return <ProductManagement searchTerm={searchTerm} />;
    }
  };

  const activeTabConfig = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Premium Background Pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg shadow-slate-900/5">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Title Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30 animate-pulse" />
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                  <Settings className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  System Administration
                </h1>
                <p className="text-slate-600 font-medium">Configure and manage your ticketing system</p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white/50 backdrop-blur border border-white/20 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                />
              </div>
              <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-0.5">
                <Plus className="h-5 w-5" />
                <span>Quick Add</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 p-1 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex-1 group ${
                    isActive
                      ? 'bg-white shadow-lg shadow-slate-900/10 text-slate-800'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} opacity-5 rounded-xl`} />
                  )}
                  <div className={`relative p-2 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` 
                      : `${tab.bgColor} group-hover:bg-gradient-to-r group-hover:${tab.color} group-hover:text-white`
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="relative">
                    <span className="text-sm font-bold">{tab.name}</span>
                    <p className="text-xs opacity-70 mt-0.5">{tab.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-slate-900/10 overflow-hidden">
          {/* Tab Content Header */}
          <div className={`bg-gradient-to-r ${activeTabConfig?.color} p-6 text-white`}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                {activeTabConfig && <activeTabConfig.icon className="h-8 w-8" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{activeTabConfig?.name}</h2>
                <p className="text-white/90 font-medium">{activeTabConfig?.description}</p>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;