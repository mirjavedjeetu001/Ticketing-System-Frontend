import api from './client';

export interface Severity {
  _id: string;
  level: string;
  name: string;
  description?: string;
  color: string;
  responseTime: number;
  resolutionTime: number;
}

export interface Priority {
  _id: string;
  level: string;
  name: string;
  description?: string;
  color: string;
  weight: number;
}

export interface SlaRule {
  _id: string;
  name: string;
  severity: string;
  priority: string;
  responseTime: number;
  resolutionTime: number;
  businessHoursOnly: boolean;
  escalationEnabled: boolean;
}

// Severity API functions
export const severityApi = {
  getAll: async (): Promise<Severity[]> => {
    const response = await api.get('/system-settings/severities');
    return response.data.data.severities;
  },

  create: async (data: Omit<Severity, '_id'>): Promise<Severity> => {
    const response = await api.post('/system-settings/severities', data);
    return response.data.data.severity;
  },

  update: async (id: string, data: Partial<Severity>): Promise<Severity> => {
    const response = await api.put(`/system-settings/severities/${id}`, data);
    return response.data.data.severity;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/system-settings/severities/${id}`);
  },
};

// Priority API functions
export const priorityApi = {
  getAll: async (): Promise<Priority[]> => {
    const response = await api.get('/system-settings/priorities');
    return response.data.data.priorities;
  },

  create: async (data: Omit<Priority, '_id'>): Promise<Priority> => {
    const response = await api.post('/system-settings/priorities', data);
    return response.data.data.priority;
  },

  update: async (id: string, data: Partial<Priority>): Promise<Priority> => {
    const response = await api.put(`/system-settings/priorities/${id}`, data);
    return response.data.data.priority;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/system-settings/priorities/${id}`);
  },
};

// SLA Rules API functions
export const slaApi = {
  getAll: async (): Promise<SlaRule[]> => {
    const response = await api.get('/system-settings/sla-rules');
    return response.data.data.slaRules;
  },

  create: async (data: Omit<SlaRule, '_id'>): Promise<SlaRule> => {
    const response = await api.post('/system-settings/sla-rules', data);
    return response.data.data.slaRule;
  },

  update: async (id: string, data: Partial<SlaRule>): Promise<SlaRule> => {
    const response = await api.put(`/system-settings/sla-rules/${id}`, data);
    return response.data.data.slaRule;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/system-settings/sla-rules/${id}`);
  },
};