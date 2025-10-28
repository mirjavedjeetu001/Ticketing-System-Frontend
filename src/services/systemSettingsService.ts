import api from '../api/client';

export interface Severity {
  _id: string;
  name: string;
  level: number;
  description: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Priority {
  _id: string;
  name: string;
  level: number;
  description: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SLARule {
  _id: string;
  name: string;
  description: string;
  severityId: {
    _id: string;
    name: string;
    level: number;
    color: string;
  } | null;
  priorityId: {
    _id: string;
    name: string;
    level: number;
    color: string;
  } | null;
  responseTime: number;
  resolutionTime: number;
  responseTimeFormatted: string;
  resolutionTimeFormatted: string;
  isActive: boolean;
  escalationRules: {
    level: number;
    timeThreshold: number;
    escalateTo: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    }[];
    notificationTemplate: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSeverityData {
  name: string;
  level: number;
  description: string;
  color: string;
}

export interface CreatePriorityData {
  name: string;
  level: number;
  description: string;
  color: string;
}

export interface CreateSLARuleData {
  name: string;
  description: string;
  severityId: string;
  priorityId: string;
  responseTime: number;
  resolutionTime: number;
  escalationRules?: {
    level: number;
    timeThreshold: number;
    escalateTo: string[];
    notificationTemplate: string;
  }[];
}

class SystemSettingsService {
  // Get system overview (all active severities, priorities, and SLA rules)
  async getSystemOverview() {
    const response = await api.get('/system-settings/overview');
    return response.data;
  }

  // Severity Management
  async getSeverities(params?: any) {
    const response = await api.get('/system-settings/severities', { params });
    return response.data;
  }

  async getSeverityById(id: string) {
    const response = await api.get(`/system-settings/severities/${id}`);
    return response.data;
  }

  async createSeverity(data: CreateSeverityData) {
    const response = await api.post('/system-settings/severities', data);
    return response.data;
  }

  async updateSeverity(id: string, data: Partial<CreateSeverityData> & { isActive?: boolean }) {
    const response = await api.put(`/system-settings/severities/${id}`, data);
    return response.data;
  }

  async deleteSeverity(id: string) {
    const response = await api.delete(`/system-settings/severities/${id}`);
    return response.data;
  }

  // Priority Management
  async getPriorities(params?: any) {
    const response = await api.get('/system-settings/priorities', { params });
    return response.data;
  }

  async getPriorityById(id: string) {
    const response = await api.get(`/system-settings/priorities/${id}`);
    return response.data;
  }

  async createPriority(data: CreatePriorityData) {
    const response = await api.post('/system-settings/priorities', data);
    return response.data;
  }

  async updatePriority(id: string, data: Partial<CreatePriorityData> & { isActive?: boolean }) {
    const response = await api.put(`/system-settings/priorities/${id}`, data);
    return response.data;
  }

  async deletePriority(id: string) {
    const response = await api.delete(`/system-settings/priorities/${id}`);
    return response.data;
  }

  // SLA Rules Management
  async getSLARules(params?: any) {
    const response = await api.get('/system-settings/sla-rules', { params });
    return response.data;
  }

  async getSLARuleById(id: string) {
    const response = await api.get(`/system-settings/sla-rules/${id}`);
    return response.data;
  }

  async createSLARule(data: CreateSLARuleData) {
    const response = await api.post('/system-settings/sla-rules', data);
    return response.data;
  }

  async updateSLARule(id: string, data: Partial<CreateSLARuleData> & { isActive?: boolean }) {
    const response = await api.put(`/system-settings/sla-rules/${id}`, data);
    return response.data;
  }

  async deleteSLARule(id: string) {
    const response = await api.delete(`/system-settings/sla-rules/${id}`);
    return response.data;
  }
}

export const systemSettingsService = new SystemSettingsService();