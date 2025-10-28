import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Star, Package, Filter } from 'lucide-react';
import api from '../../api/client';

interface Product {
  _id: string;
  name: string;
  abbreviation: string;
  color: string;
}

interface Feature {
  _id: string;
  name: string;
  description: string;
  productId: {
    _id: string;
    name: string;
    abbreviation: string;
  };
  isActive: boolean;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface FeatureManagementProps {
  searchTerm: string;
}

const FeatureManagement: React.FC<FeatureManagementProps> = ({ searchTerm }) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productId: '',
    isActive: true,
  });

  useEffect(() => {
    fetchFeatures();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [selectedProductFilter]);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedProductFilter) {
        params.append('productId', selectedProductFilter);
      }
      
      const response = await api.get(`/features?${params.toString()}`);
      setFeatures(response.data.data.features || []);
    } catch (error) {
      console.error('Error fetching features:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.productId) {
      alert('Feature name and product are required');
      return;
    }

    try {
      if (editingFeature) {
        await api.put(`/features/${editingFeature._id}`, formData);
      } else {
        await api.post('/features', formData);
      }
      
      fetchFeatures();
      resetForm();
      setShowCreateModal(false);
    } catch (error: any) {
      console.error('Error saving feature:', error);
      alert(error.response?.data?.message || 'Error saving feature');
    }
  };

  const handleDelete = async (featureId: string) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      try {
        await api.delete(`/features/${featureId}`);
        fetchFeatures();
      } catch (error) {
        console.error('Error deleting feature:', error);
        alert('Error deleting feature');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      productId: '',
      isActive: true,
    });
    setEditingFeature(null);
  };

  const startEdit = (feature: Feature) => {
    setFormData({
      name: feature.name,
      description: feature.description,
      productId: feature.productId._id,
      isActive: feature.isActive,
    });
    setEditingFeature(feature);
    setShowCreateModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const filteredFeatures = features.filter(feature =>
    feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.productId.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductById = (productId: string) => {
    return products.find(p => p._id === productId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Feature Management</h3>
          <p className="text-slate-600 mt-1">Manage product features for better issue categorization</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5" />
          <span>Add Feature</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Filter by Product:</span>
          </div>
          <select
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Products</option>
            {products.map(product => (
              <option key={product._id} value={product._id}>
                {product.name} ({product.abbreviation})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Features Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-slate-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-slate-200 rounded-lg mb-2"></div>
                <div className="h-4 bg-slate-200 rounded-lg mb-4 w-3/4"></div>
                <div className="h-6 bg-slate-200 rounded-full w-24"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredFeatures.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No features found</h3>
          <p className="text-slate-600 mb-4">
            {searchTerm ? 'No features match your search.' : 'Get started by creating your first feature.'}
          </p>
          {!searchTerm && (
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Feature
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => {
            const product = getProductById(feature.productId._id);
            return (
              <div
                key={feature._id}
                className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-3 rounded-xl text-white shadow-lg"
                    style={{ backgroundColor: product?.color || '#3b82f6' }}
                  >
                    <Star className="h-5 w-5" />
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      feature.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {feature.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-slate-800 mb-2">{feature.name}</h4>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {feature.description || 'No description provided'}
                </p>

                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {feature.productId.name}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-xs text-slate-500">
                    {new Date(feature.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(feature)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(feature._id)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-6 pb-0">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingFeature ? 'Edit Feature' : 'Create New Feature'}
              </h3>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-4" style={{ maxHeight: 'calc(85vh - 180px)' }}>
              <form onSubmit={handleSubmit} className="space-y-6" id="feature-form">
                {/* Feature Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feature Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter feature name"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Describe this feature"
                  />
                </div>

                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a product...</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} ({product.abbreviation})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active Feature
                  </label>
                </div>
              </form>
            </div>

            {/* Fixed Footer Buttons */}
            <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="feature-form"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {editingFeature ? 'Update Feature' : 'Create Feature'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureManagement;