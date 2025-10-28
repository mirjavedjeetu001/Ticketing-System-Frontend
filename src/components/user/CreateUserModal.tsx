import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Building2, 
  Boxes, 
  Upload,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  UserPlus,
  Star,
  MapPin,
  Phone,
  Calendar,
  Briefcase
} from 'lucide-react';
import { CreateUserData } from '../../services/userService';
import userService from '../../services/userService';
import { departmentService } from '../../services/departmentService';
import { productService } from '../../services/productService';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Department {
  _id: string;
  name: string;
  description: string;
  members?: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  name: string;
  code: string;
  color: string;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [avatar, setAvatar] = useState<string>('');
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateUserData & {
    confirmPassword: string;
    phone?: string;
    jobTitle?: string;
    location?: string;
    startDate?: string;
    bio?: string;
    skills?: string[];
    languages?: string[];
    timezone?: string;
    notifications?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  }>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'user',
    departmentId: '',
    productAccess: [],
    phone: '',
    jobTitle: '',
    location: '',
    startDate: '',
    bio: '',
    skills: [],
    languages: ['English'],
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
      loadProducts();
      setStep(1);
      setErrors({});
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: 'user',
        departmentId: '',
        productAccess: [],
        phone: '',
        jobTitle: '',
        location: '',
        startDate: '',
        bio: '',
        skills: [],
        languages: ['English'],
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      });
    }
  }, [isOpen]);

  const loadDepartments = async () => {
    try {
      const response = await departmentService.getDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts();
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else if (stepNumber === 2) {
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const generateAvatar = (firstName: string, lastName: string) => {
    const colors = [
      'from-blue-600 to-blue-700',
      'from-purple-600 to-purple-700',
      'from-green-600 to-green-700',
      'from-red-600 to-red-700',
      'from-indigo-600 to-indigo-700',
      'from-pink-600 to-pink-700',
      'from-teal-600 to-teal-700',
      'from-orange-600 to-orange-700'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return `bg-gradient-to-r ${randomColor}`;
  };

  const handleSkillAdd = (skill: string) => {
    if (skill.trim() && !formData.skills?.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skill.trim()]
      }));
    }
  };

  const handleSkillRemove = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skill) || []
    }));
  };

  const handleProductToggle = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      productAccess: prev.productAccess?.includes(productId)
        ? prev.productAccess.filter(id => id !== productId)
        : [...(prev.productAccess || []), productId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setLoading(true);
    try {
      // Prepare the data for submission (exclude extra fields)
      const {
        confirmPassword,
        phone,
        jobTitle,
        location,
        startDate,
        bio,
        skills,
        languages,
        timezone,
        notifications,
        ...userData
      } = formData;

      console.log('Submitting user data:', userData); // Debug log

      await userService.createUser(userData);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('User creation error:', error); // Debug log
      setErrors({ submit: error.response?.data?.message || 'Failed to create user' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
                <p className="text-sm text-gray-500">Add a new team member to your organization</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {[1, 2, 3, 4].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-200 ${
                      step >= stepNumber 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step > stepNumber ? <Check className="h-4 w-4" /> : stepNumber}
                    </div>
                    {stepNumber < 4 && (
                      <div className={`w-16 h-1 rounded-full transition-colors duration-200 ${
                        step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                Step {step} of 4
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Basic Information
                </h3>

                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold ${
                    avatar || generateAvatar(formData.firstName, formData.lastName)
                  }`}>
                    {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                  </div>
                  <div>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </button>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.firstName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.firstName}
                      </div>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.lastName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.lastName}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter email address"
                      />
                    </div>
                    {errors.email && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.email}
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Job Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter job title"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter location"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Brief description about the user..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Security & Access */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-600" />
                  Security & Access
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.password}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      Password should be at least 8 characters long
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Confirm password"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                      >
                        <option value="user">User - Basic access to assigned tickets</option>
                        <option value="agent">Agent - Can manage tickets in their department</option>
                        <option value="admin">Admin - Full system access and management</option>
                      </select>
                    </div>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Role Description */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-2">Role Permissions:</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    {formData.role === 'user' && (
                      <ul className="space-y-1">
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600" />
                          Create and view own tickets
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600" />
                          Comment on assigned tickets
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600" />
                          View basic dashboard metrics
                        </li>
                      </ul>
                    )}
                    {formData.role === 'agent' && (
                      <ul className="space-y-1">
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600" />
                          All user permissions
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600" />
                          Manage tickets in assigned department
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600" />
                          Assign tickets to team members
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600" />
                          Access advanced reporting
                        </li>
                      </ul>
                    )}
                    {formData.role === 'admin' && (
                      <ul className="space-y-1">
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600" />
                          Full system access
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600" />
                          Manage users and departments
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600" />
                          Configure system settings
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-600" />
                          Access all reports and analytics
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Department & Products */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Department & Product Access
                </h3>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {departments.map(dept => (
                      <div
                        key={dept._id}
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          departmentId: dept._id === prev.departmentId ? '' : dept._id 
                        }))}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          formData.departmentId === dept._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{dept.name}</div>
                            <div className="text-sm text-gray-500">{dept.description}</div>
                            {dept.members && dept.members.length > 0 && (
                              <div className="text-xs text-gray-400 mt-1">
                                {dept.members.length} member{dept.members.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                          {formData.departmentId === dept._id && (
                            <Check className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product Access */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Access
                  </label>
                  <p className="text-sm text-gray-500 mb-4">
                    Select which products this user can create tickets for
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {products.map(product => (
                      <div
                        key={product._id}
                        onClick={() => handleProductToggle(product._id)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          formData.productAccess?.includes(product._id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: product.color }} />
                            <Boxes className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.code}</div>
                          </div>
                          {formData.productAccess?.includes(product._id) && (
                            <Check className="h-5 w-5 text-blue-600 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Additional Details */}
            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-600" />
                  Additional Details
                </h3>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills & Expertise
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Add a skill (press Enter)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSkillAdd((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      {formData.skills?.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleSkillRemove(skill)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Languages
                  </label>
                  <select
                    multiple
                    value={formData.languages}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData(prev => ({ ...prev, languages: selected }));
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    size={4}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Portuguese">Portuguese</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="UTC">UTC (GMT+0)</option>
                    <option value="EST">Eastern Time (GMT-5)</option>
                    <option value="PST">Pacific Time (GMT-8)</option>
                    <option value="CET">Central European Time (GMT+1)</option>
                    <option value="JST">Japan Standard Time (GMT+9)</option>
                    <option value="IST">India Standard Time (GMT+5:30)</option>
                  </select>
                </div>

                {/* Notification Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Notification Preferences
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">Email Notifications</div>
                          <div className="text-sm text-gray-500">Receive notifications via email</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.notifications?.email}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications!, email: e.target.checked }
                        }))}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">Push Notifications</div>
                          <div className="text-sm text-gray-500">Receive browser push notifications</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.notifications?.push}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications!, push: e.target.checked }
                        }))}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertCircle className="h-5 w-5" />
                {errors.submit}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    Back
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    Next
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
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
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;