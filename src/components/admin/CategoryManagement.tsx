import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Tag, Clock, AlertTriangle, Settings2, X, Package } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
interface Priority {
  _id: string;
  name: string;
  level: number;
  description: string;
  color: string;
  isActive: boolean;
}
import api from '../../api/client';

interface IssueCategory {
  _id: string;
  name: string;
  description: string;
  featureIds: string[];
  color: string;
  icon?: string; // Optional since backend doesn't have this
  defaultPriorityId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryManagementProps {
  searchTerm: string;
}

interface Feature {
  _id: string;
  name: string;
  description: string;
  productId: {
    _id: string;
    name: string;
    abbreviation: string;
  } | string;
  isActive: boolean;
}

interface Product {
  _id: string;
  name: string;
  abbreviation: string;
  description: string;
  isActive: boolean;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ searchTerm }) => {
  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [filteredFeatures, setFilteredFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IssueCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: 'tag',
    featureIds: [] as string[],
    defaultPriorityId: '',
    isActive: true
  });



  const iconOptions = [
    { name: 'Tag', value: 'tag', component: Tag },
    { name: 'Bug', value: 'bug', component: AlertTriangle },
    { name: 'Feature', value: 'feature', component: Settings2 },
    { name: 'Clock', value: 'clock', component: Clock }
  ];

  // Debounced data loading to prevent multiple rapid calls
  const debouncedLoadData = useDebounce(() => {
    fetchCategories();
    fetchPriorities();
    fetchAllFeatures();
    fetchProducts();
  }, 300);

  useEffect(() => {
    debouncedLoadData();
  }, [debouncedLoadData]);

  useEffect(() => {
    if (selectedProductId) {
      const productFeatures = features.filter(feature => 
        typeof feature.productId === 'object' 
          ? feature.productId._id === selectedProductId 
          : feature.productId === selectedProductId
      );
      setFilteredFeatures(productFeatures);
    } else {
      setFilteredFeatures([]);
    }
  }, [selectedProductId, features]);

  const fetchCategories = useCallback(async () => {
    if (loading) return; // Prevent multiple simultaneous calls
    
    try {
      setLoading(true);
      const response = await api.get('/categories');
      const categories = response.data?.data?.categories || [];
      setCategories(categories);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError('Failed to load categories');
      }
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const fetchPriorities = useCallback(async () => {
    try {
      const response = await api.get('/system-settings/priorities?isActive=true');
      setPriorities(response.data?.data?.priorities || []);
    } catch (error: any) {
      console.error('Error fetching priorities:', error);
      if (error.response?.status !== 429) { // Don't log 429 errors as they're handled globally
        setPriorities([]);
      }
    }
  }, []);

  const fetchAllFeatures = useCallback(async () => {
    if (loadingFeatures) return; // Prevent multiple calls
    
    try {
      setLoadingFeatures(true);
      const response = await api.get('/features');
      setFeatures(response.data.data.features || []);
      console.log('Fetched all features:', response.data);
    } catch (error: any) {
      console.error('Error fetching features:', error);
      if (error?.response?.status === 401) {
        console.warn('Unauthorized - token may be invalid');
      } else if (error.response?.status !== 429) {
        setFeatures([]);
      }
    } finally {
      setLoadingFeatures(false);
    }
  }, [loadingFeatures]);

  const fetchProducts = useCallback(async () => {
    if (loadingProducts) return; // Prevent multiple calls
    
    try {
      setLoadingProducts(true);
      const response = await api.get('/products');
      setProducts(response.data?.data?.products || []);
      console.log('Fetched products:', response.data);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      if (error?.response?.status === 401) {
        console.warn('Unauthorized - token may be invalid');
      } else if (error.response?.status !== 429) {
        setProducts([]);
      }
    } finally {
      setLoadingProducts(false);
    }
  }, [loadingProducts]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return; // Prevent multiple submissions
    setSubmitting(true);
    
    // Validation
    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }
    
    if (!selectedProductId) {
      alert('Please select a product');
      return;
    }
    
    if (!formData.featureIds.length) {
      alert('Please select at least one feature');
      return;
    }
    
    if (!formData.defaultPriorityId) {
      alert('Please select a default priority');
      return;
    }
    
    try {
      // Prepare data that matches backend model
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        featureIds: formData.featureIds,
        defaultPriorityId: formData.defaultPriorityId,
        color: formData.color,
        isActive: formData.isActive
      };
      
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, submitData);
        alert('Category updated successfully!');
      } else {
        await api.post('/categories', submitData);
        alert('Category created successfully!');
      }
      
      await fetchCategories();
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving category:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Unknown error occurred';
      alert('Error saving category: ' + errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, formData, selectedProductId, editingCategory, fetchCategories]);

  const handleDelete = useCallback(async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.delete(`/categories/${categoryId}`);
      console.log('Category deleted successfully');
      await fetchCategories(); // Wait for refresh to complete
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const message = error?.response?.status === 429 
        ? 'Too many requests. Please wait a moment and try again.'
        : error?.response?.data?.message || error.message || 'Unknown error';
      alert('Error deleting category: ' + message);
    }
  }, [fetchCategories]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6',
      icon: 'tag',
      featureIds: [],
      defaultPriorityId: '',
      isActive: true
    });
    setEditingCategory(null);
    setSelectedProductId('');
  };

  const openModal = (category?: IssueCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon || 'tag',
        featureIds: category.featureIds || [],
        defaultPriorityId: category.defaultPriorityId || '',
        isActive: category.isActive
      });
      
      // Find the product ID from the first selected feature when editing
      if (category.featureIds && category.featureIds.length > 0) {
        const firstFeature = features.find(f => f._id === category.featureIds[0]);
        if (firstFeature) {
          const productId = typeof firstFeature.productId === 'object' 
            ? firstFeature.productId._id 
            : firstFeature.productId;
          setSelectedProductId(productId);
        }
      }
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find(opt => opt.value === iconName);
    return icon ? icon.component : Tag;
  };



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Issue Categories</h3>
          <p className="text-gray-600 mt-1">Create and manage ticket categories with product features and priorities</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCategories.map((category) => {
          const IconComponent = getIconComponent(category.icon || 'tag');
          
          return (
            <div
              key={category._id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300"
            >
              {/* Category Header */}
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="p-3 rounded-lg shadow-sm"
                  style={{ backgroundColor: category.color || '#3b82f6' }}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  category.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Category Info */}
              <div className="space-y-3 mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {category.name}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {category.description || 'No description provided'}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    <Tag className="w-4 h-4 inline mr-1" />
                    {category.featureIds?.length || 0} feature{(category.featureIds?.length || 0) !== 1 ? 's' : ''}
                  </span>
                  <span className="text-gray-400 text-xs">
                    Created {new Date(category.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => openModal(category)}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-12 animate-fade-in-scale">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-float" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No categories match your search.' : 'Get started by creating your first category.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => openModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors hover-lift"
            >
              Create Category
            </button>
          )}
        </div>
      )}

      {/* Full Screen Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="h-full w-full bg-white flex flex-col">
            {/* Header - Fixed */}
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0 shadow-sm">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingCategory ? 'Edit Category' : 'Create New Issue Category'}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {editingCategory ? 'Update category settings and assignments' : 'Set up a new category with product features and default priority'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-3 hover:bg-white/60 rounded-xl transition-colors border border-gray-200 bg-white/40"
                  type="button"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <div className="max-w-7xl mx-auto p-8">
                <form onSubmit={handleSubmit} className="space-y-8" id="category-form">
                
                {/* Basic Information Section */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Tag className="w-4 h-4 text-blue-600" />
                    </div>
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Category Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="e.g., Bug Reports, Feature Requests, Support Issues"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                        rows={3}
                        placeholder="Describe what types of issues this category covers..."
                      />
                    </div>
                  </div>
                </div>

                {/* Product & Features Assignment Section */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Package className="w-4 h-4 text-green-600" />
                    </div>
                    Product & Features Assignment
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => {
                          setSelectedProductId(e.target.value);
                          // Clear selected features when product changes
                          setFormData(prev => ({ ...prev, featureIds: [] }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                        disabled={loadingProducts}
                      >
                        <option value="">{loadingProducts ? 'Loading products...' : 'Select a product'}</option>
                        {products.map(product => (
                          <option key={product._id} value={product._id}>
                            {product.name} {product.abbreviation ? `(${product.abbreviation})` : ''}
                          </option>
                        ))}
                      </select>
                      {products.length === 0 && !loadingProducts && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-700">
                            ⚠️ No products found. Create products first in Product Management.
                          </p>
                        </div>
                      )}
                      {selectedProductId && (
                        <p className="mt-2 text-sm text-green-600">
                          ✓ Product selected. Choose features below.
                        </p>
                      )}
                    </div>

                    {/* Feature Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Features <span className="text-red-500">*</span>
                      </label>
                      <div className="min-h-[200px] max-h-60 overflow-y-auto border border-gray-300 rounded-lg bg-white">
                        {loadingFeatures ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-sm text-gray-500">Loading features...</span>
                          </div>
                        ) : !selectedProductId ? (
                          <div className="flex items-center justify-center py-12">
                            <p className="text-sm text-gray-500">Select a product first to see its features</p>
                          </div>
                        ) : filteredFeatures.length === 0 ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                              <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500 mb-1">No features found</p>
                              <p className="text-xs text-yellow-600">Create features for this product first</p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 space-y-3">
                            {filteredFeatures.map(feature => (
                              <label key={feature._id} className="flex items-start space-x-3 cursor-pointer p-3 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200">
                                <input
                                  type="checkbox"
                                  checked={formData.featureIds.includes(feature._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        featureIds: [...prev.featureIds, feature._id] 
                                      }));
                                    } else {
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        featureIds: prev.featureIds.filter(id => id !== feature._id) 
                                      }));
                                    }
                                  }}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {feature.name}
                                  </div>
                                  {feature.description && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {feature.description}
                                    </div>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Selection Summary */}
                      <div className="mt-3 flex items-center justify-between">
                        {formData.featureIds.length > 0 ? (
                          <p className="text-sm text-green-600 font-medium">
                            ✓ {formData.featureIds.length} feature{formData.featureIds.length > 1 ? 's' : ''} selected
                          </p>
                        ) : selectedProductId && filteredFeatures.length > 0 ? (
                          <p className="text-sm text-red-500">
                            Please select at least one feature
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">
                            Features will appear after selecting a product
                          </p>
                        )}
                        
                        {formData.featureIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, featureIds: [] }))}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              {/* Color & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Active Category
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Only active categories can be used for tickets
                  </p>
                </div>
              </div>



                {/* Priority & Settings Section */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Settings2 className="w-4 h-4 text-purple-600" />
                    </div>
                    Priority & Settings
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Default Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Priority <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.defaultPriorityId}
                        onChange={(e) => setFormData(prev => ({ ...prev, defaultPriorityId: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      >
                        <option value="">Select default priority...</option>
                        {priorities.map(priority => (
                          <option key={priority._id} value={priority._id}>
                            {priority.name} - {priority.description}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-xs text-gray-500">
                        This priority will be automatically assigned to tickets in this category
                      </p>
                      {priorities.length === 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-700">
                            ⚠️ No priorities configured. Create priorities in System Settings first.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                </form>
              </div>
            </div>

            {/* Fixed Footer Buttons - Always Visible */}
            <div className="px-8 py-6 border-t border-gray-200 bg-white shadow-lg" style={{ flexShrink: 0 }}>
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Form validation helper */}
                <div>
                  {(!formData.name || !selectedProductId || formData.featureIds.length === 0 || !formData.defaultPriorityId) && (
                    <p className="text-sm text-gray-500">
                      ⚠️ Please fill all required fields to continue
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="category-form"
                    disabled={!formData.name || !selectedProductId || formData.featureIds.length === 0 || !formData.defaultPriorityId}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm"
                  >
                    <Tag className="h-5 w-5" />
                    <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;