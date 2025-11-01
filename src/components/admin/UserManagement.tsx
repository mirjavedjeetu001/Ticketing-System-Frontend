import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Crown,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Building2,
  Building,
  Briefcase,
  UsersIcon,
  Calendar,
  X,
  Save,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/client';

interface User {
  _id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  role: 'super_admin' | 'admin' | 'business_unit_head' | 'department_head' | 'team_lead' | 'agent' | 'user';
  department?: string;
  departmentId?: string | { _id: string; name: string };
  businessUnitId?: string | { _id: string; name: string; shortName: string };
  teamId?: string | { _id: string; name: string };
  companyId?: string | { _id: string; name: string; shortName: string };
  permissions: {
    canCreateTickets: boolean;
    canViewAllTickets: boolean;
    canAssignTickets: boolean;
    canCloseTickets: boolean;
    canDeleteTickets: boolean;
    canManageUsers: boolean;
    canManageTeams: boolean;
    canManageDepartments: boolean;
    canManageBusinessUnits: boolean;
    canManageCompany: boolean;
    canViewReports: boolean;
    canExportData: boolean;
  };
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface Company {
  _id: string;
  name: string;
  shortName: string;
}

interface BusinessUnit {
  _id: string;
  name: string;
  shortName: string;
  companyId: string;
}

interface Department {
  _id: string;
  name: string;
  businessUnitId?: string;
}

interface Team {
  _id: string;
  name: string;
  departmentId: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [expandedPermissions, setExpandedPermissions] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'user' as User['role'],
    companyId: '',
    businessUnitId: '',
    departmentId: '',
    teamId: '',
    permissions: {
      canCreateTickets: true,
      canViewAllTickets: false,
      canAssignTickets: false,
      canCloseTickets: false,
      canDeleteTickets: false,
      canManageUsers: false,
      canManageTeams: false,
      canManageDepartments: false,
      canManageBusinessUnits: false,
      canManageCompany: false,
      canViewReports: false,
      canExportData: false,
    }
  });

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedRole]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, companiesRes, businessUnitsRes, departmentsRes, teamsRes] = await Promise.all([
        api.get('/users', { params: { search: searchTerm, role: selectedRole } }),
        api.get('/companies'),
        api.get('/business-units'),
        api.get('/departments'),
        api.get('/teams')
      ]);

      setUsers(usersRes.data.data.users || []);
      setCompanies(companiesRes.data.data.companies || []);
      setBusinessUnits(businessUnitsRes.data.data.businessUnits || []);
      setDepartments(departmentsRes.data.data.departments || []);
      setTeams(teamsRes.data.data.teams || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/users', formData);
      toast.success('User created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      // Update basic info
      await api.put(`/users/${selectedUser._id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });

      // Update role
      await api.patch(`/users/${selectedUser._id}/role`, { role: formData.role });

      // Update permissions
      await api.patch(`/users/${selectedUser._id}/permissions`, { permissions: formData.permissions });

      // Update organizational assignments
      if (formData.companyId) {
        await api.patch(`/users/${selectedUser._id}/assign/company`, { companyId: formData.companyId });
      }
      if (formData.businessUnitId) {
        await api.patch(`/users/${selectedUser._id}/assign/business-unit`, { businessUnitId: formData.businessUnitId });
      }
      if (formData.departmentId) {
        await api.patch(`/users/${selectedUser._id}/assign/department`, { departmentId: formData.departmentId });
      }
      if (formData.teamId) {
        await api.patch(`/users/${selectedUser._id}/assign/team`, { teamId: formData.teamId });
      }

      toast.success('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        toast.success('User deleted successfully');
        fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}/toggle-status`);
      toast.success('User status updated');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const openEditModal = (user: User) => {
    console.log('Opening edit modal for user:', user);
    
    setSelectedUser(user);
    
    // Handle populated objects - extract _id if it's an object, otherwise use the value directly
    const getIdValue = (field: any) => {
      if (!field) return '';
      return typeof field === 'object' ? field._id : field;
    };
    
    // Extract IDs directly from user fields
    let extractedCompanyId = getIdValue(user.companyId);
    let extractedBusinessUnitId = getIdValue(user.businessUnitId);
    let extractedDepartmentId = getIdValue(user.departmentId);
    const extractedTeamId = getIdValue(user.teamId);
    
    // If department is populated with nested businessUnit and company, extract those IDs too
    if (user.departmentId && typeof user.departmentId === 'object') {
      const dept = user.departmentId as any;
      console.log('Department object:', dept);
      
      // Extract businessUnitId from department if available
      if (dept.businessUnitId) {
        if (typeof dept.businessUnitId === 'object') {
          extractedBusinessUnitId = dept.businessUnitId._id;
          console.log('Extracted businessUnitId from department:', extractedBusinessUnitId);
          
          // Extract companyId from businessUnit if available
          if (dept.businessUnitId.companyId) {
            if (typeof dept.businessUnitId.companyId === 'object') {
              extractedCompanyId = dept.businessUnitId.companyId._id;
              console.log('Extracted companyId from businessUnit:', extractedCompanyId);
            } else {
              extractedCompanyId = dept.businessUnitId.companyId;
            }
          }
        } else {
          extractedBusinessUnitId = dept.businessUnitId;
        }
      }
    }
    
    console.log('Final extracted IDs:');
    console.log('  companyId:', extractedCompanyId);
    console.log('  businessUnitId:', extractedBusinessUnitId);
    console.log('  departmentId:', extractedDepartmentId);
    console.log('  teamId:', extractedTeamId);
    
    setFormData({
      email: user.email || '',
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      role: user.role,
      companyId: extractedCompanyId,
      businessUnitId: extractedBusinessUnitId,
      departmentId: extractedDepartmentId,
      teamId: extractedTeamId,
      permissions: { ...user.permissions }
    });
    
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'user',
      companyId: '',
      businessUnitId: '',
      departmentId: '',
      teamId: '',
      permissions: {
        canCreateTickets: true,
        canViewAllTickets: false,
        canAssignTickets: false,
        canCloseTickets: false,
        canDeleteTickets: false,
        canManageUsers: false,
        canManageTeams: false,
        canManageDepartments: false,
        canManageBusinessUnits: false,
        canManageCompany: false,
        canViewReports: false,
        canExportData: false,
      }
    });
  };

  const applyRoleDefaults = (role: User['role']) => {
    const defaultPermissions: Record<User['role'], typeof formData.permissions> = {
      super_admin: {
        canCreateTickets: true,
        canViewAllTickets: true,
        canAssignTickets: true,
        canCloseTickets: true,
        canDeleteTickets: true,
        canManageUsers: true,
        canManageTeams: true,
        canManageDepartments: true,
        canManageBusinessUnits: true,
        canManageCompany: true,
        canViewReports: true,
        canExportData: true,
      },
      admin: {
        canCreateTickets: true,
        canViewAllTickets: true,
        canAssignTickets: true,
        canCloseTickets: true,
        canDeleteTickets: true,
        canManageUsers: true,
        canManageTeams: true,
        canManageDepartments: true,
        canManageBusinessUnits: false,
        canManageCompany: false,
        canViewReports: true,
        canExportData: true,
      },
      business_unit_head: {
        canCreateTickets: true,
        canViewAllTickets: true,
        canAssignTickets: true,
        canCloseTickets: true,
        canDeleteTickets: false,
        canManageUsers: true,
        canManageTeams: true,
        canManageDepartments: true,
        canManageBusinessUnits: false,
        canManageCompany: false,
        canViewReports: true,
        canExportData: true,
      },
      department_head: {
        canCreateTickets: true,
        canViewAllTickets: true,
        canAssignTickets: true,
        canCloseTickets: true,
        canDeleteTickets: false,
        canManageUsers: false,
        canManageTeams: true,
        canManageDepartments: false,
        canManageBusinessUnits: false,
        canManageCompany: false,
        canViewReports: true,
        canExportData: false,
      },
      team_lead: {
        canCreateTickets: true,
        canViewAllTickets: true,
        canAssignTickets: true,
        canCloseTickets: true,
        canDeleteTickets: false,
        canManageUsers: false,
        canManageTeams: false,
        canManageDepartments: false,
        canManageBusinessUnits: false,
        canManageCompany: false,
        canViewReports: false,
        canExportData: false,
      },
      agent: {
        canCreateTickets: true,
        canViewAllTickets: false,
        canAssignTickets: false,
        canCloseTickets: true,
        canDeleteTickets: false,
        canManageUsers: false,
        canManageTeams: false,
        canManageDepartments: false,
        canManageBusinessUnits: false,
        canManageCompany: false,
        canViewReports: false,
        canExportData: false,
      },
      user: {
        canCreateTickets: true,
        canViewAllTickets: false,
        canAssignTickets: false,
        canCloseTickets: false,
        canDeleteTickets: false,
        canManageUsers: false,
        canManageTeams: false,
        canManageDepartments: false,
        canManageBusinessUnits: false,
        canManageCompany: false,
        canViewReports: false,
        canExportData: false,
      },
    };

    setFormData(prev => ({
      ...prev,
      role,
      permissions: defaultPermissions[role]
    }));
  };

  const getRoleIcon = (role: User['role']) => {
    const icons = {
      super_admin: <Crown className="h-4 w-4 text-yellow-600" />,
      admin: <Crown className="h-4 w-4 text-purple-600" />,
      business_unit_head: <Building2 className="h-4 w-4 text-indigo-600" />,
      department_head: <Building className="h-4 w-4 text-blue-600" />,
      team_lead: <UsersIcon className="h-4 w-4 text-cyan-600" />,
      agent: <ShieldCheck className="h-4 w-4 text-green-600" />,
      user: <Users className="h-4 w-4 text-gray-600" />,
    };
    return icons[role];
  };

  const getRoleBadgeColor = (role: User['role']) => {
    const colors = {
      super_admin: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-purple-100 text-purple-800',
      business_unit_head: 'bg-indigo-100 text-indigo-800',
      department_head: 'bg-blue-100 text-blue-800',
      team_lead: 'bg-cyan-100 text-cyan-800',
      agent: 'bg-green-100 text-green-800',
      user: 'bg-gray-100 text-gray-800',
    };
    return colors[role];
  };

  const getRoleLabel = (role: User['role']) => {
    const labels = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      business_unit_head: 'Business Unit Head',
      department_head: 'Department Head',
      team_lead: 'Team Lead',
      agent: 'Agent',
      user: 'User',
    };
    return labels[role];
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const UserModal = ({ isEdit }: { isEdit: boolean }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              {isEdit ? <Edit className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
              {isEdit ? 'Edit User' : 'Create New User'}
            </h2>
            <button
              onClick={() => {
                isEdit ? setShowEditModal(false) : setShowCreateModal(false);
                setSelectedUser(null);
                resetForm();
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  key={`firstName-${showCreateModal}-${showEditModal}`}
                  type="text"
                  name="firstName"
                  defaultValue={formData.firstName}
                  onBlur={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  key={`lastName-${showCreateModal}-${showEditModal}`}
                  type="text"
                  name="lastName"
                  defaultValue={formData.lastName}
                  onBlur={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  key={`email-${showCreateModal}-${showEditModal}`}
                  type="email"
                  name="email"
                  defaultValue={formData.email}
                  onBlur={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isEdit}
                  required
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  key={`phone-${showCreateModal}-${showEditModal}`}
                  type="text"
                  name="phone"
                  defaultValue={formData.phone}
                  onBlur={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="off"
                />
              </div>
              {!isEdit && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <input
                    key={`password-${showCreateModal}-${showEditModal}`}
                    type="password"
                    name="password"
                    defaultValue={formData.password}
                    onBlur={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    autoComplete="new-password"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Role & Permissions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Role & Permissions
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => applyRoleDefaults(e.target.value as User['role'])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="agent">Agent</option>
                  <option value="team_lead">Team Lead</option>
                  <option value="department_head">Department Head</option>
                  <option value="business_unit_head">Business Unit Head</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {/* Permissions */}
              <div className="border border-gray-200 rounded-lg p-4">
                <button
                  type="button"
                  onClick={() => setExpandedPermissions(!expandedPermissions)}
                  className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-2"
                >
                  <span>Permissions (Click to {expandedPermissions ? 'collapse' : 'expand'})</span>
                  {expandedPermissions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expandedPermissions && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {Object.entries(formData.permissions).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, [key]: e.target.checked }
                          }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Organizational Assignment */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              Organizational Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <select
                  value={formData.companyId}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Company</option>
                  {companies.map(company => (
                    <option key={company._id} value={company._id}>
                      {company.name} ({company.shortName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Unit</label>
                <select
                  value={formData.businessUnitId}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessUnitId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
                <select
                  value={formData.teamId}
                  onChange={(e) => setFormData(prev => ({ ...prev, teamId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Team</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={() => {
              isEdit ? setShowEditModal(false) : setShowCreateModal(false);
              setSelectedUser(null);
              resetForm();
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={isEdit ? handleUpdateUser : handleCreateUser}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isEdit ? 'Update User' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-7 w-7 text-blue-600" />
            User Management
          </h2>
          <p className="text-gray-600 mt-1">Manage users, roles, permissions, and organizational assignments</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <UserPlus className="h-5 w-5" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="business_unit_head">Business Unit Head</option>
            <option value="department_head">Department Head</option>
            <option value="team_lead">Team Lead</option>
            <option value="agent">Agent</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading users...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <div
              key={user._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                      {user.firstName?.[0] || 'U'}{user.lastName?.[0] || 'S'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No Name'}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Mail className="h-3 w-3" />
                        {user.email || 'No email'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {user.isActive ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Role */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Role</span>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    {getRoleLabel(user.role)}
                  </div>
                </div>

                {/* Organization */}
                {(user.department || user.phone) && (
                  <div className="space-y-2 text-xs">
                    {user.department && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building className="h-3.5 w-3.5" />
                        {user.department}
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-3.5 w-3.5" />
                        {user.phone}
                      </div>
                    )}
                  </div>
                )}

                {/* Last Login */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Last login:
                  </div>
                  <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <button
                  onClick={() => handleToggleStatus(user._id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    user.isActive
                      ? 'text-red-700 hover:bg-red-100'
                      : 'text-green-700 hover:bg-green-100'
                  }`}
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit user"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete user"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <UserModal isEdit={false} />}
      {showEditModal && <UserModal isEdit={true} />}
    </div>
  );
};

export default UserManagement;
