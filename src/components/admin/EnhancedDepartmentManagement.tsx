import React, { useState, useEffect } from 'react';
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Save,
  X,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/client';

interface Department {
  _id: string;
  name: string;
  description?: string;
  businessUnitId?: string;
  businessUnit?: {
    _id: string;
    name: string;
    shortName: string;
  };
  headUserId?: string;
  isActive: boolean;
  createdAt: string;
}

interface BusinessUnit {
  _id: string;
  name: string;
  shortName: string;
}

const EnhancedDepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    businessUnitId: '',
    headUserId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [departmentsRes, businessUnitsRes, usersRes] = await Promise.all([
        api.get('/departments'),
        api.get('/business-units'),
        api.get('/users')
      ]);

      setDepartments(departmentsRes.data.data.departments || []);
      setBusinessUnits(businessUnitsRes.data.data.businessUnits || []);
      setUsers(usersRes.data.data.users || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingDepartment) {
        await api.put(`/departments/${editingDepartment._id}`, formData);
        toast.success('Department updated successfully');
      } else {
        await api.post('/departments', formData);
        toast.success('Department created successfully');
      }
      setShowModal(false);
      setEditingDepartment(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await api.delete(`/departments/${id}`);
        toast.success('Department deleted successfully');
        fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete department');
      }
    }
  };

  const openEditModal = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      businessUnitId: department.businessUnitId || '',
      headUserId: department.headUserId || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      businessUnitId: '',
      headUserId: ''
    });
    setEditingDepartment(null);
  };

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBusinessUnit = !selectedBusinessUnit || dept.businessUnitId === selectedBusinessUnit;
    return matchesSearch && matchesBusinessUnit;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Building className="h-7 w-7 text-green-600" />
            Department Management
          </h2>
          <p className="text-gray-600 mt-1">Manage departments and business unit assignments</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Add Department
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedBusinessUnit}
            onChange={(e) => setSelectedBusinessUnit(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Business Units</option>
            {businessUnits.map(bu => (
              <option key={bu._id} value={bu._id}>
                {bu.name} ({bu.shortName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading departments...</span>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
          <p className="text-gray-600">Get started by creating your first department</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map(department => (
            <div
              key={department._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center text-white">
                      <Building className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{department.name}</h3>
                      {department.businessUnit && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Building2 className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {department.businessUnit.shortName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                {department.description && (
                  <p className="text-sm text-gray-600 mb-3">{department.description}</p>
                )}
                <div className="text-xs text-gray-500">
                  Created: {new Date(department.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-end gap-2 border-t border-gray-200">
                <button
                  onClick={() => openEditModal(department)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit department"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(department._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete department"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  {editingDepartment ? <Edit2 className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                  {editingDepartment ? 'Edit Department' : 'Create New Department'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingDepartment(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Customer Experience, Technical Support"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Brief description of the department..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Unit
                </label>
                <select
                  value={formData.businessUnitId}
                  onChange={(e) => setFormData({ ...formData, businessUnitId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Business Unit</option>
                  {businessUnits.map(bu => (
                    <option key={bu._id} value={bu._id}>
                      {bu.name} ({bu.shortName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Head
                </label>
                <select
                  value={formData.headUserId}
                  onChange={(e) => setFormData({ ...formData, headUserId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Department Head</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.fullName || `${user.firstName} ${user.lastName}`} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingDepartment(null);
                  resetForm();
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingDepartment ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDepartmentManagement;
