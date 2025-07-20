import axios from 'axios';

// API Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  isEmailVerified: boolean;
  lastLogin: string;
  isActive: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      taskUpdates: boolean;
      mentions: boolean;
    };
    timezone: string;
  };
  workspaces: Array<{
    workspace: {
      _id: string;
      name: string;
      description: string;
      color: string;
      icon: string;
    };
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joinedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  description: string;
  owner: User;
  members: Array<{
    user: User;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joinedAt: string;
    invitedBy?: User;
  }>;
  settings: {
    visibility: 'public' | 'private' | 'team';
    allowGuestAccess: boolean;
    defaultTaskStatus: string;
    taskLabels: Array<{ name: string; color: string }>;
    taskPriorities: string[];
  };
  color: string;
  icon: string;
  isActive: boolean;
  stats: {
    totalTasks: number;
    completedTasks: number;
    totalMembers: number;
  };
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  workspace: string | Workspace;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: User;
  reporter: User;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  labels: Array<{ name: string; color: string }>;
  attachments: Array<{
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimeType: string;
    uploadedBy: User;
    createdAt: string;
  }>;
  comments: Array<{
    _id: string;
    user: User;
    content: string;
    attachments: any[];
    mentions: User[];
    isEdited: boolean;
    editedAt?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  subtasks: Array<{
    title: string;
    isCompleted: boolean;
    completedAt?: string;
    completedBy?: User;
  }>;
  dependencies: Array<{
    task: Task;
    type: 'blocks' | 'blocked_by' | 'relates_to';
  }>;
  watchers: User[];
  isArchived: boolean;
  position: number;
  customFields: Record<string, any>;
  progress: number;
  isOverdue: boolean;
  timeRemaining?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  settings?: any;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
  labels?: Array<{ name: string; color: string }>;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  labels?: Array<{ name: string; color: string }>;
}

export interface TaskReorderData {
  tasks: Array<{
    id: string;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    position: number;
  }>;
}

export interface AddCommentData {
  content: string;
}

export interface AddSubtaskData {
  title: string;
}

export interface AnalyticsData {
  workspaces: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  recentActivity: Task[];
  productivityTrends: Array<{
    _id: string;
    completed: number;
  }>;
}

// API Service Class
class ApiService {
  private api: any;


  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config: any) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: any) => {
        return response;
      },
      async (error: any) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshAuthToken(refreshToken);
              if (response.data) {
                this.setTokens(response.data.token, response.data.refreshToken);
                
                originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getToken(): string | null {
    return localStorage.getItem('taskflow_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('taskflow_refresh_token');
  }

  private setTokens(token: string, refreshToken: string) {
    localStorage.setItem('taskflow_token', token);
    localStorage.setItem('taskflow_refresh_token', refreshToken);
  }

  private clearTokens() {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_refresh_token');
  }

  // Authentication methods
  async register(data: RegisterData): Promise<ApiResponse<AuthTokens>> {
    const response = await this.api.post('/auth/register', data);
    if (response.data.success) {
      this.setTokens(response.data.token, response.data.refreshToken);
    }
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthTokens>> {
    const response = await this.api.post('/auth/login', credentials);
    if (response.data.success) {
      this.setTokens(response.data.token, response.data.refreshToken);
    }
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    } finally {
      this.clearTokens();
    }
    return { success: true, message: 'Logged out successfully' };
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async refreshAuthToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    const response = await this.api.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<AuthTokens>> {
    const response = await this.api.put('/auth/update-password', {
      currentPassword,
      newPassword,
    });
    if (response.data.success) {
      this.setTokens(response.data.token, response.data.refreshToken);
    }
    return response.data;
  }

  // Workspace methods
  async getWorkspaces(): Promise<ApiResponse<Workspace[]>> {
    const response = await this.api.get('/workspaces');
    return response.data;
  }

  async getWorkspace(id: string): Promise<ApiResponse<Workspace>> {
    const response = await this.api.get(`/workspaces/${id}`);
    return response.data;
  }

  async createWorkspace(data: CreateWorkspaceData): Promise<ApiResponse<Workspace>> {
    const response = await this.api.post('/workspaces', data);
    return response.data;
  }

  async updateWorkspace(id: string, data: Partial<CreateWorkspaceData>): Promise<ApiResponse<Workspace>> {
    const response = await this.api.put(`/workspaces/${id}`, data);
    return response.data;
  }

  async deleteWorkspace(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/workspaces/${id}`);
    return response.data;
  }

  async addWorkspaceMember(workspaceId: string, email: string, role: string = 'member'): Promise<ApiResponse<Workspace>> {
    const response = await this.api.post(`/workspaces/${workspaceId}/members`, {
      email,
      role,
    });
    return response.data;
  }

  async updateWorkspaceMemberRole(workspaceId: string, userId: string, role: string): Promise<ApiResponse<Workspace>> {
    const response = await this.api.put(`/workspaces/${workspaceId}/members/${userId}`, {
      role,
    });
    return response.data;
  }

  async removeWorkspaceMember(workspaceId: string, userId: string): Promise<ApiResponse<Workspace>> {
    const response = await this.api.delete(`/workspaces/${workspaceId}/members/${userId}`);
    return response.data;
  }

  async getWorkspaceStats(workspaceId: string): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/workspaces/${workspaceId}/stats`);
    return response.data;
  }

  // Task methods
  async getTasks(workspaceId: string, params?: {
    status?: string;
    assignee?: string;
    priority?: string;
    search?: string;
  }): Promise<ApiResponse<Task[]>> {
    const response = await this.api.get(`/tasks`, {
      params: { workspaceId, ...params },
    });
    return response.data;
  }

  async getTask(id: string): Promise<ApiResponse<Task>> {
    const response = await this.api.get(`/tasks/${id}`);
    return response.data;
  }

  async createTask(workspaceId: string, data: CreateTaskData): Promise<ApiResponse<Task>> {
    const response = await this.api.post(`/tasks`, {
      ...data,
      workspaceId,
    });
    return response.data;
  }

  async updateTask(id: string, data: UpdateTaskData): Promise<ApiResponse<Task>> {
    const response = await this.api.put(`/tasks/${id}`, data);
    return response.data;
  }

  async deleteTask(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/tasks/${id}`);
    return response.data;
  }

  async reorderTasks(workspaceId: string, data: TaskReorderData): Promise<ApiResponse> {
    const response = await this.api.put(`/tasks/reorder`, data, {
      params: { workspaceId },
    });
    return response.data;
  }

  async addTaskComment(taskId: string, data: AddCommentData): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/tasks/${taskId}/comments`, data);
    return response.data;
  }

  async addTaskSubtask(taskId: string, data: AddSubtaskData): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/tasks/${taskId}/subtasks`, data);
    return response.data;
  }

  async completeTaskSubtask(taskId: string, subtaskIndex: number): Promise<ApiResponse<any>> {
    const response = await this.api.put(`/tasks/${taskId}/subtasks/${subtaskIndex}`);
    return response.data;
  }

  async addTaskWatcher(taskId: string): Promise<ApiResponse> {
    const response = await this.api.post(`/tasks/${taskId}/watchers`);
    return response.data;
  }

  async removeTaskWatcher(taskId: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/tasks/${taskId}/watchers`);
    return response.data;
  }

  async getOverdueTasks(workspaceId: string): Promise<ApiResponse<Task[]>> {
    const response = await this.api.get(`/tasks/overdue`, {
      params: { workspaceId },
    });
    return response.data;
  }

  async getAssignedTasks(): Promise<ApiResponse<Task[]>> {
    const response = await this.api.get('/tasks/assigned');
    return response.data;
  }

  async getReportedTasks(): Promise<ApiResponse<Task[]>> {
    const response = await this.api.get('/tasks/reported');
    return response.data;
  }

  // User methods
  async updateProfile(data: { name?: string; avatar?: string }): Promise<ApiResponse<User>> {
    const response = await this.api.put('/users/profile', data);
    return response.data;
  }

  async updatePreferences(data: {
    theme?: string;
    notifications?: any;
    timezone?: string;
  }): Promise<ApiResponse<User>> {
    const response = await this.api.put('/users/preferences', data);
    return response.data;
  }

  async getUserStats(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/users/stats');
    return response.data;
  }

  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    const response = await this.api.get('/users/search', {
      params: { query },
    });
    return response.data;
  }

  async getUserActivity(limit?: number): Promise<ApiResponse<any>> {
    const response = await this.api.get('/users/activity', {
      params: { limit },
    });
    return response.data;
  }

  // Analytics methods
  async getDashboardAnalytics(): Promise<ApiResponse<AnalyticsData>> {
    const response = await this.api.get('/analytics/dashboard');
    return response.data;
  }

  async getWorkspaceAnalytics(workspaceId: string): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/analytics/workspace/${workspaceId}`);
    return response.data;
  }

  async getUserProductivity(period?: number): Promise<ApiResponse<any>> {
    const response = await this.api.get('/analytics/productivity', {
      params: { period },
    });
    return response.data;
  }

  async getTeamAnalytics(workspaceId: string, period?: number): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/analytics/team/${workspaceId}`, {
      params: { period },
    });
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService; 