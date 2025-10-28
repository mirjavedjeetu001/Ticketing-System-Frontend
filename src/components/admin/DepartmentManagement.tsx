import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, Users, Mail, Phone, MapPin, Settings } from 'lucide-react';

interface Department {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  head: string;
  email: string;
  phone: string;
  location: string;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentManagementProps {
  searchTerm: string;
}

const DepartmentManagement: React.FC<DepartmentManagementProps> = ({ searchTerm }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: 'building2',
    head: '',
    email: '',
    phone: '',
    location: '',
    memberCount: 0,
    isActive: true
  });

  const colorOptions = [
    { name: 'Blue', value: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
    { name: 'Green', value: '#10b981', gradient: 'from-green-500 to-green-600' },
    { name: 'Purple', value: '#8b5cf6', gradient: 'from-purple-500 to-purple-600' },
    { name: 'Pink', value: '#ec4899', gradient: 'from-pink-500 to-pink-600' },
    { name: 'Indigo', value: '#6366f1', gradient: 'from-indigo-500 to-indigo-600' },
    { name: 'Teal', value: '#14b8a6', gradient: 'from-teal-500 to-teal-600' },
    { name: 'Orange', value: '#f97316', gradient: 'from-orange-500 to-orange-600' },
    { name: 'Red', value: '#ef4444', gradient: 'from-red-500 to-red-600' }
  ];

  const iconOptions = [
    { name: 'Building', value: 'building2', component: Building2 },
    { name: 'Users', value: 'users', component: Users },
    { name: 'Settings', value: 'settings', component: Settings },
    { name: 'Mail', value: 'mail', component: Mail }
  ];

  useEffect(() => {
    // Initialize with default departments
    const defaultDepartments: Department[] = [
      {
        _id: '1',
        name: 'IT Support',
        description: 'Technical support and infrastructure management',
        color: '#3b82f6',
        icon: 'settings',
        head: 'John Smith',
        email: 'it-support@company.com',
        phone: '+1 (555) 123-4567',
        location: 'Building A, Floor 2',
        memberCount: 12,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Human Resources',
        description: 'Employee relations and organizational development',
        color: '#10b981',
        icon: 'users',
        head: 'Sarah Johnson',
        email: 'hr@company.com',
        phone: '+1 (555) 234-5678',
        location: 'Building B, Floor 3',
        memberCount: 8,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        name: 'Finance',
        description: 'Financial operations and accounting services',
        color: '#8b5cf6',
        icon: 'building2',
        head: 'Michael Brown',
        email: 'finance@company.com',
        phone: '+1 (555) 345-6789',
        location: 'Building A, Floor 4',
        memberCount: 15,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '4',
        name: 'Customer Support',
        description: 'Customer service and client relations',
        color: '#ec4899',
        icon: 'mail',
        head: 'Emily Davis',
        email: 'support@company.com',
        phone: '+1 (555) 456-7890',
        location: 'Building C, Floor 1',
        memberCount: 25,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    setDepartments(defaultDepartments);
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newDepartment: Department = {
      _id: editingDepartment ? editingDepartment._id : Date.now().toString(),
      ...formData,
      createdAt: editingDepartment ? editingDepartment.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingDepartment) {
      setDepartments(prev => prev.map(d => d._id === editingDepartment._id ? newDepartment : d));
    } else {
      setDepartments(prev => [...prev, newDepartment]);
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (departmentId: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    setDepartments(prev => prev.filter(d => d._id !== departmentId));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6',
      icon: 'building2',
      head: '',
      email: '',
      phone: '',
      location: '',
      memberCount: 0,
      isActive: true
    });
    setEditingDepartment(null);
  };

  const openModal = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        description: department.description,
        color: department.color,
        icon: department.icon,
        head: department.head,
        email: department.email,
        phone: department.phone,
        location: department.location,
        memberCount: department.memberCount,
        isActive: department.isActive
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const filteredDepartments = departments.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.head.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find(opt => opt.value === iconName);
    return icon ? icon.component : Building2;
  };

  const getColorGradient = (color: string) => {
    const colorOption = colorOptions.find(opt => opt.value === color);
    return colorOption ? colorOption.gradient : 'from-blue-500 to-blue-600';
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
          <h3 className="text-2xl font-bold gradient-text">Departments</h3>
          <p className="text-slate-600 mt-1">Manage organizational departments and teams</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-ripple bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover-lift flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department, index) => {
          const IconComponent = getIconComponent(department.icon);
          const gradientClass = getColorGradient(department.color);
          
          return (
            <div
              key={department._id}
              className="group relative bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-6 hover-lift hover:shadow-xl transition-all duration-300 animate-slide-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Department Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${gradientClass} shadow-lg animate-glow`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{department.memberCount} members</span>
                  </div>
                </div>
              </div>

              {/* Department Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {department.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {department.description}
                  </p>
                </div>

                {/* Department Head */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">{department.head}</p>
                  <p className="text-xs text-gray-500">Department Head</p>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  {department.email && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{department.email}</span>
                    </div>
                  )}
                  {department.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{department.phone}</span>
                    </div>
                  )}
                  {department.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{department.location}</span>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between pt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    department.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {department.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openModal(department)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors hover-scale"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(department._id)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors hover-scale"
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
      {filteredDepartments.length === 0 && (
        <div className="text-center py-12 animate-fade-in-scale">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-float" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No departments match your search.' : 'Get started by creating your first department.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => openModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors hover-lift"
            >
              Create Department
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-scale"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-premium animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6 gradient-text">
              {editingDepartment ? 'Edit Department' : 'Create Department'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover-glow transition-all duration-300"
                  placeholder="Enter department name"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none hover-glow transition-all duration-300"
                  rows={3}
                  placeholder="Enter department description"
                  required
                />
              </div>

              {/* Department Head */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Head
                </label>
                <input
                  type="text"
                  value={formData.head}
                  onChange={(e) => setFormData(prev => ({ ...prev, head: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover-glow transition-all duration-300"
                  placeholder="Enter department head name"
                  required
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover-glow transition-all duration-300"
                    placeholder="department@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover-glow transition-all duration-300"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover-glow transition-all duration-300"
                  placeholder="Building A, Floor 2"
                />
              </div>

              {/* Member Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Count
                </label>
                <input
                  type="number"
                  value={formData.memberCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, memberCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover-glow transition-all duration-300"
                  min="0"
                  placeholder="0"
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Theme
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={`h-10 rounded-lg bg-gradient-to-r ${color.gradient} hover-scale transition-transform ${
                        formData.color === color.value ? 'ring-2 ring-offset-2 ring-indigo-500 animate-glow' : ''
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {iconOptions.map((icon) => {
                    const IconComponent = icon.component;
                    return (
                      <button
                        key={icon.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon: icon.value }))}
                        className={`flex items-center justify-center h-12 rounded-lg border-2 transition-all hover-scale ${
                          formData.icon === icon.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-600 animate-glow'
                            : 'border-gray-300 hover:border-gray-400 text-gray-600'
                        }`}
                        title={icon.name}
                      >
                        <IconComponent className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active Department
                </label>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors hover-lift"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors btn-ripple hover-lift"
                >
                  {editingDepartment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;