import React, { useState } from 'react';
import { Search } from 'lucide-react';
import FeatureManagement from '../components/admin/FeatureManagement';

const FeaturesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Features</h1>
            <p className="text-slate-600">
              Manage product features for better issue categorization and tracking
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
            placeholder="Search features by name, description, or product..."
          />
        </div>
      </div>

      {/* Feature Management Component */}
      <FeatureManagement searchTerm={searchTerm} />
    </div>
  );
};

export default FeaturesPage;