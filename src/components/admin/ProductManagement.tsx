import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Globe, Smartphone, Server, Headphones, CreditCard, Eye, EyeOff, Users, Package, X } from 'lucide-react';
import api from '../../api/client';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  departments: string[];
  businessUnitId?: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  icon: string;
  color: string;
  createdAt: string;
}

interface BusinessUnit {
  _id: string;
  name: string;
  description: string;
}

interface Department {
  _id: string;
  name: string;
}

interface ProductManagementProps {
  searchTerm: string;
}

const iconOptions = [
  { name: 'Globe', icon: Globe },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Server', icon: Server },
  { name: 'Headphones', icon: Headphones },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'Package', icon: Package },
];

const colorOptions = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', 
  '#84cc16', '#f97316', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'
];

const ProductManagement: React.FC<ProductManagementProps> = ({ searchTerm }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    departments: [] as string[],
    businessUnitId: '',
    icon: 'Globe',
    color: '#3b82f6',
  });

  useEffect(() => {
    fetchProducts();
    fetchBusinessUnits();
    fetchDepartments();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessUnits = async () => {
    try {
      const response = await api.get('/business-units');
      setBusinessUnits(response.data.data.businessUnits || []);
    } catch (error) {
      console.error('Error fetching business units:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      await fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        await fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      departments: [],
      businessUnitId: '',
      icon: 'Globe',
      color: '#3b82f6',
    });
    setEditingProduct(null);
    setShowCreateModal(false);
  };

  const startEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      departments: product.departments,
      businessUnitId: product.businessUnitId?._id || '',
      icon: product.icon,
      color: product.color,
    });
    setEditingProduct(product);
    setShowCreateModal(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.name === iconName);
    return iconOption ? iconOption.icon : Globe;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Product Management</h3>
          <p className="text-slate-600 mt-1">Create and manage products that users can create tickets for</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 p-6">
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-slate-200 rounded-lg mb-2"></div>
                <div className="h-4 bg-slate-200 rounded-lg mb-4 w-3/4"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-slate-200 rounded-full w-16"></div>
                  <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const IconComponent = getIconComponent(product.icon);
            return (
              <div
                key={product._id}
                className="group bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200/60 p-6 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-3 rounded-xl text-white shadow-lg"
                    style={{ backgroundColor: product.color }}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {product.isActive ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>

                <h4 className="text-xl font-bold text-slate-800 mb-2">{product.name}</h4>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {product.category}
                  </span>
                  {product.departments.slice(0, 2).map((dept) => (
                    <span
                      key={dept}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                    >
                      {dept}
                    </span>
                  ))}
                  {product.departments.length > 2 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      +{product.departments.length - 2} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                  <span className="text-xs text-slate-500">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(product)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl my-8">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-3xl flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </h3>
                <p className="text-blue-100 mt-1">
                  Configure product settings and department access
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                    placeholder="Enter product name"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-5 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                    placeholder="Describe what this product is for"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-5 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                    placeholder="e.g., Software, Hardware, Service"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Business Unit *
                  </label>
                  <select
                    required
                    value={formData.businessUnitId}
                    onChange={(e) => setFormData({ ...formData, businessUnitId: e.target.value })}
                    className="w-full px-5 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base bg-white"
                  >
                    <option value="">Select Business Unit</option>
                    {businessUnits.map((unit) => (
                      <option key={unit._id} value={unit._id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Icon
                  </label>
                  <div className="grid grid-cols-6 lg:grid-cols-9 gap-3">
                    {iconOptions.map((option) => {
                      const IconComp = option.icon;
                      return (
                        <button
                          key={option.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: option.name })}
                          className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center hover:shadow-md ${
                            formData.icon === option.name
                              ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md'
                              : 'border-slate-200 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          <IconComp className="h-6 w-6" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Theme Color
                </label>
                <div className="flex flex-wrap gap-4">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-12 h-12 rounded-xl border-4 transition-all hover:shadow-lg ${
                        formData.color === color
                          ? 'border-slate-400 scale-110 shadow-lg'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Department Access */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Department Access *
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {departments.map((dept) => (
                    <label
                      key={dept._id}
                      className={`relative flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.departments.includes(dept.name)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.departments.includes(dept.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              departments: [...formData.departments, dept.name]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              departments: formData.departments.filter(d => d !== dept.name)
                            });
                          }
                        }}
                        className="sr-only"
                      />
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">{dept.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-8 border-t border-slate-200 bg-white pb-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-3.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;