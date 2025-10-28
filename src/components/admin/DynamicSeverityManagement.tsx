import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, Star } from 'lucide-react';
import { severityApi, Severity } from '../../api/systemSettings';

interface DynamicSeverityManagementProps {
  searchTerm: string;
}

const DynamicSeverityManagement: React.FC<DynamicSeverityManagementProps> = ({ searchTerm }) => {
  const [severities, setSeverities] = useState<Severity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeverity, setEditingSeverity] = useState<Severity | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: '1',
    color: '#10b981',
    responseTime: 24,
    resolutionTime: 72
  });

  const colorOptions = [
    { name: 'Green', value: '#10b981', gradient: 'from-green-500 to-emerald-600', label: 'Low Priority' },
    { name: 'Yellow', value: '#f59e0b', gradient: 'from-yellow-500 to-amber-600', label: 'Medium Priority' },
    { name: 'Orange', value: '#f97316', gradient: 'from-orange-500 to-orange-600', label: 'High Priority' },
    { name: 'Red', value: '#ef4444', gradient: 'from-red-500 to-red-600', label: 'Critical' },
    { name: 'Purple', value: '#8b5cf6', gradient: 'from-purple-500 to-violet-600', label: 'Urgent' },
    { name: 'Blue', value: '#3b82f6', gradient: 'from-blue-500 to-blue-600', label: 'Normal' }
  ];

  useEffect(() => {
    fetchSeverities();
  }, []);

  const fetchSeverities = async () => {
    try {
      setLoading(true);
      const response = await severityApi.getAll();
      setSeverities(response || []);
    } catch (error) {
      console.error('Error fetching severities:', error);
      setSeverities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSeverity) {
        await severityApi.update(editingSeverity._id, formData);
      } else {
        await severityApi.create(formData);
      }
      
      await fetchSeverities();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving severity:', error);
      alert('Error saving severity. Please try again.');
    }
  };

  const handleDelete = async (severityId: string) => {
    if (!confirm('Are you sure you want to delete this severity level?')) return;
    
    try {
      await severityApi.delete(severityId);
      await fetchSeverities();
    } catch (error) {
      console.error('Error deleting severity:', error);
      alert('Error deleting severity. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      level: '1',
      color: '#10b981',
      responseTime: 24,
      resolutionTime: 72
    });
    setEditingSeverity(null);
  };

  const openModal = (severity?: Severity) => {
    if (severity) {
      setEditingSeverity(severity);
      setFormData({
        name: severity.name,
        description: severity.description || '',
        level: severity.level,
        color: severity.color,
        responseTime: severity.responseTime,
        resolutionTime: severity.resolutionTime
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const filteredSeverities = severities
    .filter(severity =>
      severity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (severity.description && severity.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => parseInt(a.level) - parseInt(b.level));

  const getColorGradient = (color: string) => {
    const colorOption = colorOptions.find(opt => opt.value === color);
    return colorOption ? colorOption.gradient : 'from-green-500 to-emerald-600';
  };

  const getSeverityBadgeStyle = (color: string) => {
    switch(color) {
      case '#10b981': return 'bg-green-100 text-green-800 border-green-200';
      case '#f59e0b': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '#f97316': return 'bg-orange-100 text-orange-800 border-orange-200';
      case '#ef4444': return 'bg-red-100 text-red-800 border-red-200';
      case '#8b5cf6': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
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
          <h3 className="text-2xl font-bold gradient-text-purple">Severity Levels</h3>
          <p className="text-slate-600 mt-1">Manage ticket severity levels from System Settings</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-ripple bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover-lift flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Severity</span>
        </button>
      </div>

      {/* Severity Levels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSeverities.map((severity, index) => {
          const gradientClass = getColorGradient(severity.color);
          const badgeStyle = getSeverityBadgeStyle(severity.color);
          
          return (
            <div
              key={severity._id}
              className="group relative bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-6 hover-lift hover:shadow-xl transition-all duration-300 animate-slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Severity Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${gradientClass} shadow-lg animate-glow`}>
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}>
                      Level {severity.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Severity Info */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {severity.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {severity.description || 'No description provided'}
                  </p>
                </div>

                {/* Response and Resolution Times */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-blue-500" />
                    <span className="text-gray-600">Response: {severity.responseTime}h</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-green-500" />
                    <span className="text-gray-600">Resolution: {severity.resolutionTime}h</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openModal(severity)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors hover-scale"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(severity._id)}
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
      {filteredSeverities.length === 0 && (
        <div className="text-center py-12 animate-fade-in-scale">
          <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-float" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No severity levels found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No severity levels match your search.' : 'Get started by creating your first severity level.'}
          </p>
          <button
            onClick={() => openModal()}
            className="btn-ripple bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover-lift flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Create First Severity</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-scale"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-premium animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6 gradient-text-purple">
              {editingSeverity ? 'Edit Severity Level' : 'Create Severity Level'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover-glow transition-all duration-300"
                  placeholder="Enter severity name"
                  required
                />
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Level (1-10)
                </label>
                <input
                  type="text"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover-glow transition-all duration-300"
                  placeholder="Enter level (1-10)"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none hover-glow transition-all duration-300"
                  rows={3}
                  placeholder="Enter severity description"
                  required
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={`flex items-center space-x-2 h-12 px-3 rounded-lg bg-gradient-to-r ${color.gradient} hover-scale transition-transform ${
                        formData.color === color.value ? 'ring-2 ring-offset-2 ring-purple-500 animate-glow' : ''
                      }`}
                      title={color.name}
                    >
                      <div className="w-4 h-4 bg-white/20 rounded-full"></div>
                      <span className="text-white text-sm font-medium">{color.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Time (hours)
                </label>
                <input
                  type="number"
                  value={formData.responseTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, responseTime: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover-glow transition-all duration-300"
                  min="1"
                  max="168"
                  required
                />
              </div>

              {/* Resolution Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Time (hours)
                </label>
                <input
                  type="number"
                  value={formData.resolutionTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, resolutionTime: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover-glow transition-all duration-300"
                  min="1"
                  max="720"
                  required
                />
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors btn-ripple hover-lift"
                >
                  {editingSeverity ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicSeverityManagement;