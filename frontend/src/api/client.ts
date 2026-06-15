import axios from 'axios';

// =========================================
// API BASE URL — backend
// =========================================
const API_URL = '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// =========================================
// TYPES
// =========================================
export interface LogEntry {
  id: string;
  sourceIp: string;
  sourceName?: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  category: string;
  message: string;
  endpoint?: string;
  statusCode?: number;
  hasAlert: boolean;
}

export interface Alert {
  id: string;
  alertType: string;
  severity: string;
  sourceIp?: string;
  description: string;
  isResolved: boolean;
  detectedAt: string;
}

export interface DashboardStats {
  totalLogsToday: number;
  activeAlerts: number;
  criticalAlerts: number;
  uniqueSourcesCount: number;
  logsByHour: { hour: string; count: number; errorCount: number }[];
  alertsBySeverity: { severity: string; count: number }[];
  topSources: { sourceIp: string; requestCount: number; alertCount: number }[];
}

// =========================================
// API CALLS — match backend endpoints
// =========================================

// GET /api/logs
export const getLogs = (params?: {
  level?: string;
  sourceIp?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}) => api.get<LogEntry[]>('/logs', { params });

// GET /api/logs/stats
export const getStats = () =>
  api.get<DashboardStats>('/logs/stats');

// GET /api/alerts
export const getAlerts = (params?: {
  isResolved?: boolean;
  severity?: string;
}) => api.get<Alert[]>('/alerts', { params });

// PATCH /api/alerts/{id}/resolve
export const resolveAlert = (id: string) =>
  api.patch(`/alerts/${id}/resolve`);
