import api from '../api/client';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: 'super_admin' | 'admin' | 'business_unit_head' | 'department_head' | 'team_lead' | 'agent' | 'user';
  department?: string;
  departmentId?: string;
  businessUnitId?: string;
  teamId?: string;
  companyId?: string;
  productAccess?: string[];
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
  updatedAt: string;
  jobTitle?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  languages?: string[];
  timezone?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: User['role'];
  department?: string;
  departmentId?: string;
  businessUnitId?: string;
  teamId?: string;
  companyId?: string;
  productAccess?: string[];
  permissions?: Partial<User['permissions']>;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: User['role'];
  department?: string;
  departmentId?: string;
  businessUnitId?: string;
  teamId?: string;
  companyId?: string;
  productAccess?: string[];
  permissions?: Partial<User['permissions']>;
  isActive?: boolean;
}

export interface UserListResponse {
  success: boolean;
  data: {
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: {
    user: User;
  };
  message?: string;
}

class UserService {
  // Get all users with filtering and pagination
  async getUsers(params?: {
    role?: string;
    department?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<UserListResponse> {
    const response = await api.get('/users', { params });
    return response.data;
  }

  // Get user by ID
  async getUserById(id: string): Promise<UserResponse> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  // Create new user
  async createUser(userData: CreateUserData): Promise<UserResponse> {
    const response = await api.post('/users', userData);
    return response.data;
  }

  // Update user
  async updateUser(id: string, userData: UpdateUserData): Promise<UserResponse> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  }

  // Delete user (soft delete)
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }

  // Update user password
  async updatePassword(id: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/users/${id}/password`, { password: newPassword });
    return response.data;
  }

  // Get users by role (agents, admins, etc.)
  async getUsersByRole(role: string): Promise<UserListResponse> {
    return this.getUsers({ role });
  }

  // Get users by department
  async getUsersByDepartment(departmentId: string): Promise<UserListResponse> {
    const response = await api.get(`/users/department/${departmentId}`);
    return response.data;
  }

  // Get users with access to specific product
  async getUsersByProduct(productId: string): Promise<UserListResponse> {
    const response = await api.get(`/users/product/${productId}`);
    return response.data;
  }

  // Update user role
  async updateUserRole(id: string, role: User['role']): Promise<UserResponse> {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  }

  // Update user permissions
  async updateUserPermissions(id: string, permissions: Partial<User['permissions']>): Promise<UserResponse> {
    const response = await api.patch(`/users/${id}/permissions`, { permissions });
    return response.data;
  }

  // Toggle user active status
  async toggleUserStatus(id: string): Promise<UserResponse> {
    const response = await api.patch(`/users/${id}/toggle-status`);
    return response.data;
  }

  // Assign company
  async assignCompany(id: string, companyId: string): Promise<UserResponse> {
    const response = await api.patch(`/users/${id}/assign/company`, { companyId });
    return response.data;
  }

  // Assign business unit
  async assignBusinessUnit(id: string, businessUnitId: string): Promise<UserResponse> {
    const response = await api.patch(`/users/${id}/assign/business-unit`, { businessUnitId });
    return response.data;
  }

  // Assign department
  async assignDepartment(id: string, departmentId: string): Promise<UserResponse> {
    const response = await api.patch(`/users/${id}/assign/department`, { departmentId });
    return response.data;
  }

  // Assign team
  async assignTeam(id: string, teamId: string): Promise<UserResponse> {
    const response = await api.patch(`/users/${id}/assign/team`, { teamId });
    return response.data;
  }
}

export default new UserService();