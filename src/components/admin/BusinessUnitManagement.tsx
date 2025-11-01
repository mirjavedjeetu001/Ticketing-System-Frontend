import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building, Users, ToggleLeft, ToggleRight, Save, X } from 'lucide-react';
import api from '../../api/client';
import { toast } from 'react-hot-toast';

interface BusinessUnit {
  _id: string;
  name: string;
  shortName: string;
  companyId: {
    _id: string;
    name: string;
  };
  headUserId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  description?: string;
  isActive: boolean;
  createdAt: string;
}

interface Company {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface BusinessUnitManagementProps {
  searchTerm: string;
}

const BusinessUnitManagement: React.FC<BusinessUnitManagementProps> = ({ searchTerm }) => {
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<BusinessUnit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    companyId: '',
    headUserId: '',
    description: ''
  });

  const buShortNames = ['SSL', 'SFL', 'SML', 'SBE', 'SBC', 'Tech'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [buResponse, compResponse, userResponse] = await Promise.all([
        api.get('/business-units'),
        api.get('/companies'),
        api.get('/users')
      ]);
      
      setBusinessUnits(buResponse.data.data.businessUnits || []);
      setCompanies(compResponse.data.data.companies || []);
      setUsers(userResponse.data.data.users || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUnit) {
        await api.put(`/business-units/${editingUnit._id}`, formData);
        toast.success('Business unit updated successfully');
      } else {
        await api.post('/business-units', formData);
        toast.success('Business unit created successfully');
      }
      
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save business unit');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this business unit?')) return;
    
    try {
      await api.delete(`/business-units/${id}`);
      toast.success('Business unit deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await api.patch(`/business-units/${id}/toggle-status`);
      toast.success('Status updated');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleEdit = (unit: BusinessUnit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      shortName: unit.shortName,
      companyId: typeof unit.companyId === 'object' ? unit.companyId._id : unit.companyId,
      headUserId: unit.headUserId ? (typeof unit.headUserId === 'object' ? unit.headUserId._id : unit.headUserId) : '',
      description: unit.description || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingUnit(null);
    setFormData({
      name: '',
      shortName: '',
      companyId: '',
      headUserId: '',
      description: ''
    });
  };

  const filteredUnits = businessUnits.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Business Units</h2>
          <p className="text-sm text-slate-600 mt-1">{filteredUnits.length} units found</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-purple-500/30"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Business Unit</span>
        </button>
      </div>

      {/* Business Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUnits.map((unit) => (
          <div
            key={unit._id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{unit.name}</h3>
                      <span className="text-sm text-white/80 font-bold">{unit.shortName}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleStatus(unit._id)}
                  className="ml-2"
                >
                  {unit.isActive ? (
                    <ToggleRight className="w-8 h-8 text-white hover:text-green-200 transition-colors" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-white/50 hover:text-red-200 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Company:</span>{' '}
                  {typeof unit.companyId === 'object' ? unit.companyId.name : 'N/A'}
                </div>
                {unit.headUserId && typeof unit.headUserId === 'object' && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>
                      <span className="font-medium text-slate-700">Head:</span>{' '}
                      {unit.headUserId.firstName} {unit.headUserId.lastName}
                    </span>
                  </div>
                )}
                {unit.description && (
                  <p className="text-sm text-slate-600 mt-2">{unit.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-200/50">
                <button
                  onClick={() => handleEdit(unit)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(unit._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUnits.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No business units found</h3>
          <p className="text-slate-500">Create your first business unit to get started</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-6 rounded-t-3xl">
              <h3 className="text-2xl font-bold">
                {editingUnit ? 'Edit Business Unit' : 'Add New Business Unit'}
              </h3>
            </div>

            <form id="bu-form" onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Business Unit Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                    placeholder="Sheba Services Ltd"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Short Name *
                  </label>
                  <select
                    required
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                  >
                    <option value="">Select...</option>
                    {buShortNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company *
                </label>
                <select
                  required
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                >
                  <option value="">Select Company...</option>
                  {companies.map(company => (
                    <option key={company._id} value={company._id}>{company.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Business Unit Head
                </label>
                <select
                  value={formData.headUserId}
                  onChange={(e) => setFormData({ ...formData, headUserId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                >
                  <option value="">Select User...</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                  placeholder="Business unit description..."
                />
              </div>

            </form>

            {/* Actions - Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-8 py-4 rounded-b-3xl flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                form="bu-form"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/30 font-medium"
              >
                <Save className="w-5 h-5" />
                <span>{editingUnit ? 'Update' : 'Create'} Unit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessUnitManagement;
