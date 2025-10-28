export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'admin' | 'agent' | 'user';
  department?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  _id: string;
  title: string;
  description?: string;
  createdBy: User;
  assignee?: User;
  assignedBy?: User;
  mentionedUsers?: User[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  department?: string;
  product?: string;
  tags: string[];
  attachments: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
  }>;
  comments: Array<{
    _id: string;
    author: User;
    content: string;
    createdAt: string;
    isInternal: boolean;
  }>;
  resolution?: string;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  resolvedAt?: string;
  closedAt?: string;
  isOverdue?: boolean;
  timeToResolve?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketStats {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  totalPages: number;
  stats: TicketStats;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'admin' | 'agent' | 'user';
  department?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateTicketData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  department?: string;
  product?: string;
  tags?: string[];
  estimatedHours?: number;
  dueDate?: string;
}

export interface UpdateTicketData extends Partial<CreateTicketData> {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignee?: string;
  resolution?: string;
  actualHours?: number;
}

export interface TicketFilters {
  status?: string | string[];
  priority?: string | string[];
  assignee?: string;
  createdBy?: string;
  department?: string;
  product?: string;
  tags?: string[];
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  createdDateFrom?: string;
  createdDateTo?: string;
  isOverdue?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CommentData {
  content: string;
  isInternal?: boolean;
}