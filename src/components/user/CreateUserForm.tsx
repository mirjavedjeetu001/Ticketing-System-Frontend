import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Shield, Building2, AlertCircle, UserPlus } from 'lucide-react';
import userService from '../../services/userService';
import { departmentService } from '../../services/departmentService';
import { productService } from '../../services/productService';

interface CreateUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Department {
  _id: string;
  name: string;
  description: string;
}

interface Product {
  _id: string;
  name: string;
  code?: string;
  color?: string;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [productAccess, setProductAccess] = useState<string[]>([]);

  // Simple state for each field
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'agent' | 'user'>('user');
  const [departmentId, setDepartmentId] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
      loadProducts();
    }
  }, [isOpen]);

  const loadDepartments = async () => {
    try {
      const response = await departmentService.getDepartments();
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts();
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors['firstName'] = 'First name is required';
    if (!lastName.trim()) newErrors['lastName'] = 'Last name is required';
    if (!email.trim()) {
      newErrors['email'] = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors['email'] = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors['password'] = 'Password is required';
    } else if (password.length < 8) {
      newErrors['password'] = 'Password must be at least 8 characters long';
    }
    if (password !== confirmPassword) {
      newErrors['confirmPassword'] = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProductToggle = (productId: string) => {
    setProductAccess(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRole('user');
    setDepartmentId('');
    setProductAccess([]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData: any = {
        email,
        password,
        firstName,
        lastName,
        role,
        productAccess
      };

      if (departmentId) {
        userData.departmentId = departmentId;
      }

      await userService.createUser(userData);
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('User creation error:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to create user. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={handleClose} />

        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
                <p className="text-sm text-gray-500">Add a new team member</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors['firstName'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter first name"
                />
                {errors['firstName'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors['firstName']}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors['lastName'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter last name"
                />
                {errors['lastName'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors['lastName']}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors['email'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              {errors['email'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors['email']}
                </p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors['password'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter password"
                  />
                </div>
                {errors['password'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors['password']}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors['confirmPassword'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm password"
                  />
                </div>
                {errors['confirmPassword'] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors['confirmPassword']}
                  </p>
                )}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'agent' | 'user')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="user">User</option>
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Department */}
            {departments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department (Optional)
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">No Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Product Access */}
            {products.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Access (Optional)
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {products.map((product) => (
                      <label
                        key={product._id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={productAccess.includes(product._id)}
                          onChange={() => handleProductToggle(product._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{product.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Error */}
            {errors['submit'] && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-5 w-5" />
                {errors['submit']}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;
