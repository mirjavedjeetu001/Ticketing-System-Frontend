import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Building2, 
  Edit2, 
  Save, 
  Activity, 
  Ticket, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  MessageSquare,
  TrendingUp,
  Settings,
  Lock,
  Bell,
  Globe,
  Star,
  Award,
  Briefcase
} from 'lucide-react';
import { User as UserType, UpdateUserData } from '../../services/userService';
import userService from '../../services/userService';
import { departmentService } from '../../services/departmentService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

interface Department {
  _id: string;
  name: string;
  color?: string;
  head?: string;
}



interface UserActivity {
  id: string;
  type: 'login' | 'ticket_created' | 'ticket_updated' | 'profile_updated';
  description: string;
  timestamp: string;
  details?: any;
}

interface UserStats {
  totalTickets: number;
  resolvedTickets: number;
  pendingTickets: number;
  avgResolutionTime: number;
  lastLogin: string;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  userId 
}) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userStats] = useState<UserStats>({
    totalTickets: 24,
    resolvedTickets: 18,
    pendingTickets: 6,
    avgResolutionTime: 2.5,
    lastLogin: '2025-10-25T10:30:00Z'
  });
  const [userActivity] = useState<UserActivity[]>([
    {
      id: '1',
      type: 'login',
      description: 'Logged into the system',
      timestamp: '2025-10-25T10:30:00Z'
    },
    {
      id: '2',
      type: 'ticket_created',
      description: 'Created ticket #SHEBA-1234',
      timestamp: '2025-10-25T09:15:00Z'
    },
    {
      id: '3',
      type: 'ticket_updated',
      description: 'Updated ticket #SHEBA-1233 to resolved',
      timestamp: '2025-10-24T16:45:00Z'
    },
    {
      id: '4',
      type: 'profile_updated',
      description: 'Updated profile information',
      timestamp: '2025-10-24T14:20:00Z'
    }
  ]);

  const [formData, setFormData] = useState<UpdateUserData & {
    phone?: string;
    jobTitle?: string;
    location?: string;
    bio?: string;
    skills?: string[];
    languages?: string[];
    timezone?: string;
  }>({
    firstName: '',
    lastName: '',
    role: 'user',
    departmentId: '',
    productAccess: [],
    isActive: true,
    phone: '',
    jobTitle: '',
    location: '',
    bio: '',
    skills: [],
    languages: [],
    timezone: 'UTC'
  });

  useEffect(() => {
    if (isOpen && userId) {
      loadUserData();
      loadDepartments();
    }
  }, [isOpen, userId]);

  const loadUserData = async () => {
    try {
      const response = await userService.getUserById(userId);
      const userData = response.data.user;
      setUser(userData);
      
      // Populate form data
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        departmentId: userData.departmentId || '',
        productAccess: userData.productAccess || [],
        isActive: userData.isActive,
        phone: userData.phone || '',
        jobTitle: userData.jobTitle || '',
        location: userData.location || '',
        bio: userData.bio || '',
        skills: userData.skills || [],
        languages: userData.languages || ['English'],
        timezone: userData.timezone || 'UTC'
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await departmentService.getDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };



  const handleSave = async () => {
    try {
      setSaving(true);
      await userService.updateUser(userId, formData);
      await loadUserData();
      setIsEditing(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        departmentId: user.departmentId || '',
        productAccess: user.productAccess || [],
        isActive: user.isActive,
        phone: user.phone || '',
        jobTitle: user.jobTitle || '',
        location: user.location || '',
        bio: user.bio || '',
        skills: user.skills || [],
        languages: user.languages || ['English'],
        timezone: user.timezone || 'UTC'
      });
    }
    setIsEditing(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-5 w-5 text-purple-600" />;
      case 'agent': return <Award className="h-5 w-5 text-blue-600" />;
      case 'user': return <User className="h-5 w-5 text-green-600" />;
      default: return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'agent': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <Eye className="h-4 w-4 text-green-600" />;
      case 'ticket_created': return <Ticket className="h-4 w-4 text-blue-600" />;
      case 'ticket_updated': return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case 'profile_updated': return <Settings className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatRelativeDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleIcon(user.role)}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  <div className="flex items-center gap-1">
                    {user.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${user.isActive ? 'text-green-700' : 'text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {[
                { id: 'profile', name: 'Profile', icon: User },
                { id: 'activity', name: 'Activity', icon: Activity },
                { id: 'statistics', name: 'Statistics', icon: TrendingUp },
                { id: 'settings', name: 'Settings', icon: Settings }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 max-h-[600px] overflow-y-auto">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Basic Information
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <div className="text-gray-900">{user.firstName}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <div className="text-gray-900">{user.lastName}</div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          Email
                        </label>
                        <div className="text-gray-900">{user.email}</div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          Phone
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter phone number"
                          />
                        ) : (
                          <div className="text-gray-900">{formData.phone || 'Not provided'}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          Job Title
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.jobTitle}
                            onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter job title"
                          />
                        ) : (
                          <div className="text-gray-900">{formData.jobTitle || 'Not specified'}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Location
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter location"
                          />
                        ) : (
                          <div className="text-gray-900">{formData.location || 'Not specified'}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* System Information */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      System Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.role}
                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="user">User</option>
                            <option value="agent">Agent</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            {getRoleIcon(user.role)}
                            <span className="text-gray-900 capitalize">{user.role}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          Department
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.departmentId}
                            onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                              <option key={dept._id} value={dept._id}>{dept.name}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-gray-900">{user.department || 'Not assigned'}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Member Since
                        </label>
                        <div className="text-gray-900">{formatDate(user.createdAt)}</div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Last Login
                        </label>
                        <div className="text-gray-900">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.isActive ? 'active' : 'inactive'}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            {user.isActive ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className={user.isActive ? 'text-green-700' : 'text-red-700'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Bio
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <div className="text-gray-900">{formData.bio || 'No bio provided'}</div>
                  )}
                </div>

                {/* Skills & Languages */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-blue-600" />
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(formData.skills || []).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {(!formData.skills || formData.skills.length === 0) && (
                        <div className="text-gray-500">No skills listed</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(formData.languages || ['English']).map((language, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {userActivity.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatRelativeDate(activity.timestamp)} • {formatDate(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'statistics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Statistics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-6 w-6" />
                      <h4 className="font-semibold">Total Tickets</h4>
                    </div>
                    <div className="text-2xl font-bold mt-2">{userStats.totalTickets}</div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6" />
                      <h4 className="font-semibold">Resolved</h4>
                    </div>
                    <div className="text-2xl font-bold mt-2">{userStats.resolvedTickets}</div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-6 w-6" />
                      <h4 className="font-semibold">Pending</h4>
                    </div>
                    <div className="text-2xl font-bold mt-2">{userStats.pendingTickets}</div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                    <div className="flex items-center gap-2">
                      <Clock className="h-6 w-6" />
                      <h4 className="font-semibold">Avg Resolution</h4>
                    </div>
                    <div className="text-2xl font-bold mt-2">{userStats.avgResolutionTime}d</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-4">Resolution Rate</h4>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(userStats.resolvedTickets / userStats.totalTickets) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {Math.round((userStats.resolvedTickets / userStats.totalTickets) * 100)}% of tickets resolved
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Settings</h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Bell className="h-5 w-5 text-blue-600" />
                      Notification Preferences
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Email Notifications</div>
                          <div className="text-sm text-gray-500">Receive notifications via email</div>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Push Notifications</div>
                          <div className="text-sm text-gray-500">Receive browser notifications</div>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Lock className="h-5 w-5 text-blue-600" />
                      Security
                    </h4>
                    <div className="space-y-3">
                      <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <div className="font-medium text-gray-900">Change Password</div>
                        <div className="text-sm text-gray-500">Update your account password</div>
                      </button>
                      <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                        <div className="text-sm text-gray-500">Enable 2FA for enhanced security</div>
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      Preferences
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Timezone
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="UTC">UTC (GMT+0)</option>
                          <option value="EST">Eastern Time (GMT-5)</option>
                          <option value="PST">Pacific Time (GMT-8)</option>
                          <option value="CET">Central European Time (GMT+1)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Language
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;