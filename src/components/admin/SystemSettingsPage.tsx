import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Star,
  Clock,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Info
} from 'lucide-react';
import { systemSettingsService, Severity, Priority, SLARule } from '../../services/systemSettingsService';

interface SystemSettingsPageProps {
  searchTerm: string;
}

const SystemSettingsPage: React.FC<SystemSettingsPageProps> = ({ searchTerm }) => {
  const [activeTab, setActiveTab] = useState<'severities' | 'priorities' | 'sla-rules'>('severities');
  const [severities, setSeverities] = useState<Severity[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [slaRules, setSlaRules] = useState<SLARule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [formData, setFormData] = useState<{
    name?: string;
    level?: number | string;
    description?: string;
    color?: string;
    severityId?: string;
    priorityId?: string;
    responseTime?: number | string;
    resolutionTime?: number | string;
  }>({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Load initial data for severities and priorities when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const overviewResponse = await systemSettingsService.getSystemOverview();
        const { severities: activeSeverities, priorities: activePriorities } = overviewResponse.data;
        
        if (severities.length === 0) {
          setSeverities(activeSeverities);
        }
        if (priorities.length === 0) {
          setPriorities(activePriorities);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        // Fallback to individual API calls if overview fails
        try {
          const [severityResponse, priorityResponse] = await Promise.all([
            systemSettingsService.getSeverities({ isActive: true }),
            systemSettingsService.getPriorities({ isActive: true })
          ]);
          
          if (severities.length === 0) {
            setSeverities(severityResponse.data.severities);
          }
          if (priorities.length === 0) {
            setPriorities(priorityResponse.data.priorities);
          }
        } catch (fallbackError) {
          console.error('Error loading fallback data:', fallbackError);
        }
      }
    };

    loadInitialData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'severities':
          const severityResponse = await systemSettingsService.getSeverities({ search: searchTerm });
          setSeverities(severityResponse.data.severities);
          break;
        case 'priorities':
          const priorityResponse = await systemSettingsService.getPriorities({ search: searchTerm });
          setPriorities(priorityResponse.data.priorities);
          break;
        case 'sla-rules':
          // For SLA rules, we need to load all three types of data
          const [slaResponse, severityResponse2, priorityResponse2] = await Promise.all([
            systemSettingsService.getSLARules({ search: searchTerm }),
            systemSettingsService.getSeverities({ isActive: true }),
            systemSettingsService.getPriorities({ isActive: true })
          ]);
          setSlaRules(slaResponse.data.slaRules);
          setSeverities(severityResponse2.data.severities);
          setPriorities(priorityResponse2.data.priorities);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setError('');
    setSuccessMessage('');
    
    if (activeTab === 'sla-rules') {
      setFormData({
        name: '',
        description: '',
        severityId: '',
        priorityId: '',
        responseTime: '',
        resolutionTime: ''
      });
    } else {
      setFormData({
        name: '',
        level: '',
        description: '',
        color: '#3B82F6'
      });
    }
    
    setShowCreateModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      level: item.level,
      description: item.description,
      color: item.color,
      ...(activeTab === 'sla-rules' && {
        severityId: item.severityId?._id || '',
        priorityId: item.priorityId?._id || '',
        responseTime: item.responseTime,
        resolutionTime: item.resolutionTime
      })
    });
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    try {
      // Validate and prepare data based on active tab
      const preparedData: any = {};

      if (activeTab === 'severities' || activeTab === 'priorities') {
        // Validation for severity/priority
        if (!formData.name || !formData.level || !formData.description || !formData.color) {
          alert('All fields are required');
          return;
        }
        
        preparedData.name = formData.name;
        preparedData.level = typeof formData.level === 'string' ? parseInt(formData.level) : formData.level;
        preparedData.description = formData.description;
        preparedData.color = formData.color;
      } else if (activeTab === 'sla-rules') {
        // Validation for SLA rules
        if (!formData.name || !formData.description || !formData.severityId || 
            !formData.priorityId || !formData.responseTime || !formData.resolutionTime) {
          alert('All fields are required for SLA rules');
          return;
        }
        
        preparedData.name = formData.name;
        preparedData.description = formData.description;
        preparedData.severityId = formData.severityId;
        preparedData.priorityId = formData.priorityId;
        preparedData.responseTime = typeof formData.responseTime === 'string' ? 
          parseInt(formData.responseTime) : formData.responseTime;
        preparedData.resolutionTime = typeof formData.resolutionTime === 'string' ? 
          parseInt(formData.resolutionTime) : formData.resolutionTime;
      }

      if (editingItem) {
        // Update existing item
        switch (activeTab) {
          case 'severities':
            await systemSettingsService.updateSeverity(editingItem._id, preparedData);
            break;
          case 'priorities':
            await systemSettingsService.updatePriority(editingItem._id, preparedData);
            break;
          case 'sla-rules':
            await systemSettingsService.updateSLARule(editingItem._id, preparedData);
            break;
        }
      } else {
        // Create new item
        switch (activeTab) {
          case 'severities':
            await systemSettingsService.createSeverity(preparedData);
            break;
          case 'priorities':
            await systemSettingsService.createPriority(preparedData);
            break;
          case 'sla-rules':
            await systemSettingsService.createSLARule(preparedData);
            break;
        }
      }
      
      setShowCreateModal(false);
      setFormData({});
      setError('');
      setSuccessMessage(`${editingItem ? 'Updated' : 'Created'} successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
      await loadData();
    } catch (error) {
      console.error('Error saving:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error ${editingItem ? 'updating' : 'creating'}: ${errorMessage}`);
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      switch (activeTab) {
        case 'severities':
          await systemSettingsService.deleteSeverity(id);
          break;
        case 'priorities':
          await systemSettingsService.deletePriority(id);
          break;
        case 'sla-rules':
          await systemSettingsService.deleteSLARule(id);
          break;
      }
      
      setSuccessMessage('Item deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      await loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error deleting: ${errorMessage}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  const tabs = [
    {
      id: 'severities' as const,
      name: 'Severity Levels',
      icon: AlertTriangle,
      description: 'Manage severity levels (S1, S2, S3, S4)'
    },
    {
      id: 'priorities' as const,
      name: 'Priority Levels',
      icon: Star,
      description: 'Manage priority levels (P1, P2, P3, etc.)'
    },
    {
      id: 'sla-rules' as const,
      name: 'SLA Rules',
      icon: Clock,
      description: 'Configure SLA rules with automatic time tracking'
    }
  ];

  const renderSeverities = () => (
    <div className="space-y-4">
      {severities.map((severity) => (
        <div key={severity._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: severity.color }}
              >
                {severity.name}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{severity.name}</h3>
                <p className="text-sm text-gray-600">Level {severity.level}</p>
                <p className="text-sm text-gray-500 mt-1">{severity.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                severity.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {severity.isActive ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={() => handleEdit(severity)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(severity._id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPriorities = () => (
    <div className="space-y-4">
      {priorities.map((priority) => (
        <div key={priority._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: priority.color }}
              >
                {priority.name}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{priority.name}</h3>
                <p className="text-sm text-gray-600">Level {priority.level}</p>
                <p className="text-sm text-gray-500 mt-1">{priority.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                priority.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {priority.isActive ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={() => handleEdit(priority)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(priority._id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSLARules = () => (
    <div className="space-y-4">
      {slaRules.map((rule) => (
        <div key={rule._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
              <p className="text-sm text-gray-500">{rule.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                rule.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {rule.isActive ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={() => handleEdit(rule)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(rule._id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              {rule.severityId ? (
                <>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: rule.severityId.color || '#6b7280' }}
                  >
                    {rule.severityId.name}
                  </div>
                  <span className="text-sm font-medium">{rule.severityId.name}</span>
                </>
              ) : (
                <span className="text-sm text-gray-500">No severity set</span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {rule.priorityId ? (
                <>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: rule.priorityId.color || '#6b7280' }}
                  >
                    {rule.priorityId.name}
                  </div>
                  <span className="text-sm font-medium">{rule.priorityId.name}</span>
                </>
              ) : (
                <span className="text-sm text-gray-500">No priority set</span>
              )}
            </div>
            
            <div className="text-sm">
              <span className="text-gray-500">Response: </span>
              <span className="font-medium">{rule.responseTimeFormatted}</span>
            </div>
            
            <div className="text-sm">
              <span className="text-gray-500">Resolution: </span>
              <span className="font-medium">{rule.resolutionTimeFormatted}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'severities':
        return renderSeverities();
      case 'priorities':
        return renderPriorities();
      case 'sla-rules':
        return renderSLARules();
      default:
        return null;
    }
  };

  const renderModal = () => (
    showCreateModal && (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingItem ? 'Edit' : 'Create'} {tabs.find(t => t.id === activeTab)?.name.slice(0, -1)}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError('');
                  setSuccessMessage('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Common fields for severity and priority */}
              {(activeTab === 'severities' || activeTab === 'priorities') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`e.g., ${activeTab === 'severities' ? 'S1' : 'P1'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level *
                    </label>
                    <input
                      type="number"
                      value={formData.level}
                      onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || '' }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe when this level should be used..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color *
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* SLA Rules specific fields */}
              {activeTab === 'sla-rules' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rule Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="S1 + P1 Rule"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Critical issues with high priority..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Severity Level *
                      </label>
                      <select
                        value={formData.severityId}
                        onChange={(e) => setFormData(prev => ({ ...prev, severityId: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select severity...</option>
                        {severities.map(severity => (
                          <option key={severity._id} value={severity._id}>
                            {severity.level} - {severity.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority Level *
                      </label>
                      <select
                        value={formData.priorityId}
                        onChange={(e) => setFormData(prev => ({ ...prev, priorityId: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select priority...</option>
                        {priorities.map(priority => (
                          <option key={priority._id} value={priority._id}>
                            {priority.level} - {priority.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Response Time (minutes) *
                      </label>
                      <input
                        type="number"
                        value={formData.responseTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, responseTime: parseInt(e.target.value) || '' }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="120"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resolution Time (minutes) *
                      </label>
                      <input
                        type="number"
                        value={formData.resolutionTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, resolutionTime: parseInt(e.target.value) || '' }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="480"
                        min="1"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Info className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {activeTab === 'severities' && 'Severity levels help categorize the impact of issues (S1 = Critical, S4 = Low)'}
                    {activeTab === 'priorities' && 'Priority levels help determine the urgency of resolution (P1 = Urgent, P4 = Low)'}
                    {activeTab === 'sla-rules' && 'SLA rules automatically calculate response and resolution times based on severity and priority combinations'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{editingItem ? 'Update' : 'Create'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {tabs.find(t => t.id === activeTab)?.name}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {tabs.find(t => t.id === activeTab)?.description}
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add {tabs.find(t => t.id === activeTab)?.name.slice(0, -1)}</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      ) : (
        renderContent()
      )}

      {/* Empty State */}
      {!loading && (
        (activeTab === 'severities' && severities.length === 0) ||
        (activeTab === 'priorities' && priorities.length === 0) ||
        (activeTab === 'sla-rules' && slaRules.length === 0)
      ) && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {tabs.find(t => t.id === activeTab)?.icon && (
              React.createElement(tabs.find(t => t.id === activeTab)!.icon, { className: "h-12 w-12 mx-auto" })
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {tabs.find(t => t.id === activeTab)?.name} Found
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first {tabs.find(t => t.id === activeTab)?.name.toLowerCase().slice(0, -1)}.
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create {tabs.find(t => t.id === activeTab)?.name.slice(0, -1)}</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default SystemSettingsPage;