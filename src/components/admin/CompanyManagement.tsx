import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, Globe, Mail, Phone, ToggleLeft, ToggleRight, Save, X } from 'lucide-react';
import api from '../../api/client';
import { toast } from 'react-hot-toast';

interface Company {
  _id: string;
  name: string;
  shortName: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  settings: {
    allowUserRegistration: boolean;
    requireEmailVerification: boolean;
    slaEnabled: boolean;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CompanyManagementProps {
  searchTerm: string;
}

const CompanyManagement: React.FC<CompanyManagementProps> = ({ searchTerm }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    logo: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    settings: {
      allowUserRegistration: true,
      requireEmailVerification: true,
      slaEnabled: true
    }
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/companies');
      setCompanies(response.data.data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCompany) {
        await api.put(`/companies/${editingCompany._id}`, formData);
        toast.success('Company updated successfully');
      } else {
        await api.post('/companies', formData);
        toast.success('Company created successfully');
      }
      
      fetchCompanies();
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save company');
    }
  };

  const handleDelete = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    
    try {
      await api.delete(`/companies/${companyId}`);
      toast.success('Company deleted successfully');
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete company');
    }
  };

  const toggleStatus = async (companyId: string) => {
    try {
      await api.patch(`/companies/${companyId}/toggle-status`);
      toast.success('Company status updated');
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      shortName: company.shortName,
      logo: company.logo || '',
      website: company.website || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      settings: company.settings
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      shortName: '',
      logo: '',
      website: '',
      email: '',
      phone: '',
      address: '',
      settings: {
        allowUserRegistration: true,
        requireEmailVerification: true,
        slaEnabled: true
      }
    });
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Companies</h2>
          <p className="text-sm text-slate-600 mt-1">{filteredCompanies.length} companies found</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Company</span>
        </button>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <div
            key={company._id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-200 overflow-hidden group"
          >
            {/* Company Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <Building2 className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{company.name}</h3>
                      <span className="text-sm text-white/80 font-medium">{company.shortName}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleStatus(company._id)}
                  className="ml-2"
                  title={company.isActive ? 'Deactivate' : 'Activate'}
                >
                  {company.isActive ? (
                    <ToggleRight className="w-8 h-8 text-white hover:text-green-200 transition-colors" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-white/50 hover:text-red-200 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Company Details */}
            <div className="p-6 space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                {company.website && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                      {company.website}
                    </a>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{company.phone}</span>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="border-t border-slate-200/50 pt-4 space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Settings</h4>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                    company.settings.allowUserRegistration 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    User Registration: {company.settings.allowUserRegistration ? 'ON' : 'OFF'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                    company.settings.requireEmailVerification 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    Email Verify: {company.settings.requireEmailVerification ? 'ON' : 'OFF'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                    company.settings.slaEnabled 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    SLA: {company.settings.slaEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-200/50">
                <button
                  onClick={() => handleEdit(company)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(company._id)}
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

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No companies found</h3>
          <p className="text-slate-500">Create your first company to get started</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6 rounded-t-3xl">
              <h3 className="text-2xl font-bold">
                {editingCompany ? 'Edit Company' : 'Add New Company'}
              </h3>
            </div>

            <form id="company-form" onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    placeholder="Sheba Platform Ltd"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Short Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    placeholder="SPL"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    placeholder="contact@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    placeholder="+880 1234-567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  placeholder="https://www.sheba.xyz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  placeholder="Company address"
                />
              </div>

              {/* Settings */}
              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">Company Settings</h4>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <span className="text-sm font-medium text-slate-700">Allow User Registration</span>
                    <input
                      type="checkbox"
                      checked={formData.settings.allowUserRegistration}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, allowUserRegistration: e.target.checked }
                      })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <span className="text-sm font-medium text-slate-700">Require Email Verification</span>
                    <input
                      type="checkbox"
                      checked={formData.settings.requireEmailVerification}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, requireEmailVerification: e.target.checked }
                      })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <span className="text-sm font-medium text-slate-700">Enable SLA Tracking</span>
                    <input
                      type="checkbox"
                      checked={formData.settings.slaEnabled}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, slaEnabled: e.target.checked }
                      })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                </div>
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
                form="company-form"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 font-medium"
              >
                <Save className="w-5 h-5" />
                <span>{editingCompany ? 'Update' : 'Create'} Company</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;
