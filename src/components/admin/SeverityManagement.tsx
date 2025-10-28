import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, TrendingUp, Flame, Zap, Clock, Shield } from 'lucide-react';

interface SeverityLevel {
  _id: string;
  name: string;
  level: number;
  description: string;
  color: string;
  icon: string;
  escalationTime: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SeverityManagementProps {
  searchTerm: string;
}

const SeverityManagement: React.FC<SeverityManagementProps> = ({ searchTerm }) => {
  const [severities, setSeverities] = useState<SeverityLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeverity, setEditingSeverity] = useState<SeverityLevel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    level: 1,
    description: '',
    color: '#10b981',
    icon: 'shield',
    escalationTime: 24,
    isActive: true
  });

  const colorOptions = [
    { name: 'Green', value: '#10b981', gradient: 'from-green-500 to-emerald-600', label: 'Low Priority' },
    { name: 'Yellow', value: '#f59e0b', gradient: 'from-yellow-500 to-amber-600', label: 'Medium Priority' },
    { name: 'Orange', value: '#f97316', gradient: 'from-orange-500 to-orange-600', label: 'High Priority' },
    { name: 'Red', value: '#ef4444', gradient: 'from-red-500 to-red-600', label: 'Critical' },
    { name: 'Purple', value: '#8b5cf6', gradient: 'from-purple-500 to-violet-600', label: 'Urgent' },
    { name: 'Blue', value: '#3b82f6', gradient: 'from-blue-500 to-blue-600', label: 'Normal' }
  ];

  const iconOptions = [
    { name: 'Shield', value: 'shield', component: Shield },
    { name: 'Alert', value: 'alert', component: AlertTriangle },
    { name: 'Trending', value: 'trending', component: TrendingUp },
    { name: 'Flame', value: 'flame', component: Flame },
    { name: 'Zap', value: 'zap', component: Zap },
    { name: 'Clock', value: 'clock', component: Clock }
  ];

  useEffect(() => {
    // Initialize with default severity levels if none exist
    const defaultSeverities: SeverityLevel[] = [
      {
        _id: '1',
        name: 'Low',
        level: 1,
        description: 'Minor issues that can be addressed during normal business hours',
        color: '#10b981',
        icon: 'shield',
        escalationTime: 72,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Medium',
        level: 2,
        description: 'Moderate issues that require attention within 24 hours',
        color: '#f59e0b',
        icon: 'alert',
        escalationTime: 24,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        name: 'High',
        level: 3,
        description: 'Important issues that need prompt resolution',
        color: '#f97316',
        icon: 'trending',
        escalationTime: 8,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '4',
        name: 'Critical',
        level: 4,
        description: 'Severe issues causing significant impact to operations',
        color: '#ef4444',
        icon: 'flame',
        escalationTime: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '5',
        name: 'Urgent',
        level: 5,
        description: 'Emergency issues requiring immediate attention',
        color: '#8b5cf6',
        icon: 'zap',
        escalationTime: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    setSeverities(defaultSeverities);
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSeverity: SeverityLevel = {
      _id: editingSeverity ? editingSeverity._id : Date.now().toString(),
      ...formData,
      createdAt: editingSeverity ? editingSeverity.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingSeverity) {
      setSeverities(prev => prev.map(s => s._id === editingSeverity._id ? newSeverity : s));
    } else {
      setSeverities(prev => [...prev, newSeverity]);
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (severityId: string) => {
    if (!confirm('Are you sure you want to delete this severity level?')) return;
    setSeverities(prev => prev.filter(s => s._id !== severityId));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      level: 1,
      description: '',
      color: '#10b981',
      icon: 'shield',
      escalationTime: 24,
      isActive: true
    });
    setEditingSeverity(null);
  };

  const openModal = (severity?: SeverityLevel) => {
    if (severity) {
      setEditingSeverity(severity);
      setFormData({
        name: severity.name,
        level: severity.level,
        description: severity.description,
        color: severity.color,
        icon: severity.icon,
        escalationTime: severity.escalationTime,
        isActive: severity.isActive
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const filteredSeverities = severities
    .filter(severity =>
      severity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      severity.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.level - b.level);

  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find(opt => opt.value === iconName);
    return icon ? icon.component : Shield;
  };

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
          <p className="text-slate-600 mt-1">Configure issue severity levels and escalation timelines</p>
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
          const IconComponent = getIconComponent(severity.icon);
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
                    <IconComponent className="w-6 h-6 text-white" />
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
                    {severity.description}
                  </p>
                </div>

                {/* Escalation Time */}
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Escalation: {severity.escalationTime}h
                  </span>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between pt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    severity.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {severity.isActive ? 'Active' : 'Inactive'}
                  </span>
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
                  type="number"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover-glow transition-all duration-300"
                  min="1"
                  max="10"
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

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {iconOptions.map((icon) => {
                    const IconComponent = icon.component;
                    return (
                      <button
                        key={icon.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon: icon.value }))}
                        className={`flex flex-col items-center justify-center h-16 rounded-lg border-2 transition-all hover-scale ${
                          formData.icon === icon.value
                            ? 'border-purple-500 bg-purple-50 text-purple-600 animate-glow'
                            : 'border-gray-300 hover:border-gray-400 text-gray-600'
                        }`}
                        title={icon.name}
                      >
                        <IconComponent className="w-6 h-6 mb-1" />
                        <span className="text-xs">{icon.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Escalation Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escalation Time (hours)
                </label>
                <input
                  type="number"
                  value={formData.escalationTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, escalationTime: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover-glow transition-all duration-300"
                  min="1"
                  max="168"
                  required
                />
              </div>

              {/* Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active Severity Level
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

export default SeverityManagement;