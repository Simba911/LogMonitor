import { LogEntry, Alert, DashboardStats } from './client';

// =========================================
// MOCK LOGS
// =========================================
export const MOCK_LOGS: LogEntry[] = [
  // ნორმალური ტრაფიკი
  { id: 'log-001', sourceIp: '192.168.1.100', sourceName: 'WorkstationA', timestamp: '2025-06-14T08:02:11Z', level: 'INFO',     category: 'AUTH',    message: 'User admin logged in successfully',                      endpoint: undefined,          statusCode: undefined, hasAlert: false },
  { id: 'log-002', sourceIp: '192.168.1.101', sourceName: 'WorkstationB', timestamp: '2025-06-14T08:05:44Z', level: 'INFO',     category: 'HTTP',    message: 'GET /api/products 200 OK',                               endpoint: '/api/products',    statusCode: 200,       hasAlert: false },
  { id: 'log-003', sourceIp: '10.0.0.5',      sourceName: 'AppServer',    timestamp: '2025-06-14T08:11:03Z', level: 'INFO',     category: 'SYSTEM',  message: 'Scheduled backup completed successfully',                 endpoint: undefined,          statusCode: undefined, hasAlert: false },
  { id: 'log-004', sourceIp: '192.168.1.100', sourceName: 'WorkstationA', timestamp: '2025-06-14T08:14:22Z', level: 'INFO',     category: 'HTTP',    message: 'POST /api/orders 201 Created',                           endpoint: '/api/orders',      statusCode: 201,       hasAlert: false },
  { id: 'log-005', sourceIp: '172.16.0.8',    sourceName: 'DevMachine',   timestamp: '2025-06-14T08:20:57Z', level: 'INFO',     category: 'HTTP',    message: 'GET /api/users 200 OK',                                  endpoint: '/api/users',       statusCode: 200,       hasAlert: false },
  { id: 'log-006', sourceIp: '192.168.1.101', sourceName: 'WorkstationB', timestamp: '2025-06-14T08:31:08Z', level: 'WARNING',  category: 'HTTP',    message: 'GET /api/reports 200 OK (response time: 4200ms)',        endpoint: '/api/reports',     statusCode: 200,       hasAlert: false },
  { id: 'log-007', sourceIp: '10.0.0.5',      sourceName: 'AppServer',    timestamp: '2025-06-14T08:44:33Z', level: 'INFO',     category: 'SYSTEM',  message: 'Cache cleared successfully',                             endpoint: undefined,          statusCode: undefined, hasAlert: false },
  { id: 'log-008', sourceIp: '172.16.0.8',    sourceName: 'DevMachine',   timestamp: '2025-06-14T09:02:17Z', level: 'INFO',     category: 'AUTH',    message: 'User developer logged in successfully',                  endpoint: undefined,          statusCode: undefined, hasAlert: false },
  { id: 'log-009', sourceIp: '192.168.1.100', sourceName: 'WorkstationA', timestamp: '2025-06-14T09:15:44Z', level: 'INFO',     category: 'HTTP',    message: 'PUT /api/products/42 200 OK',                            endpoint: '/api/products/42', statusCode: 200,       hasAlert: false },
  { id: 'log-010', sourceIp: '10.0.0.5',      sourceName: 'AppServer',    timestamp: '2025-06-14T09:28:02Z', level: 'WARNING',  category: 'SYSTEM',  message: 'Memory usage at 78% — approaching threshold',            endpoint: undefined,          statusCode: undefined, hasAlert: false },

  // Brute Force შეტევა
  { id: 'log-011', sourceIp: '45.33.32.156',  sourceName: undefined,      timestamp: '2025-06-14T10:01:05Z', level: 'ERROR',    category: 'AUTH',    message: 'Login failed: invalid credentials for user admin (attempt 1)',  endpoint: undefined, statusCode: undefined, hasAlert: false },
  { id: 'log-012', sourceIp: '45.33.32.156',  sourceName: undefined,      timestamp: '2025-06-14T10:01:22Z', level: 'ERROR',    category: 'AUTH',    message: 'Login failed: invalid credentials for user admin (attempt 2)',  endpoint: undefined, statusCode: undefined, hasAlert: false },
  { id: 'log-013', sourceIp: '45.33.32.156',  sourceName: undefined,      timestamp: '2025-06-14T10:01:39Z', level: 'ERROR',    category: 'AUTH',    message: 'Login failed: invalid credentials for user admin (attempt 3)',  endpoint: undefined, statusCode: undefined, hasAlert: true  },
  { id: 'log-014', sourceIp: '45.33.32.156',  sourceName: undefined,      timestamp: '2025-06-14T10:01:55Z', level: 'ERROR',    category: 'AUTH',    message: 'Login failed: invalid credentials for user root (attempt 4)',   endpoint: undefined, statusCode: undefined, hasAlert: true  },
  { id: 'log-015', sourceIp: '45.33.32.156',  sourceName: undefined,      timestamp: '2025-06-14T10:02:10Z', level: 'ERROR',    category: 'AUTH',    message: 'Login failed: invalid credentials for user admin (attempt 5)',  endpoint: undefined, statusCode: undefined, hasAlert: true  },

  // ნორმალური ტრაფიკი გაგრძელება
  { id: 'log-016', sourceIp: '192.168.1.100', sourceName: 'WorkstationA', timestamp: '2025-06-14T10:10:44Z', level: 'INFO',     category: 'HTTP',    message: 'GET /api/dashboard 200 OK',                              endpoint: '/api/dashboard',   statusCode: 200,       hasAlert: false },
  { id: 'log-017', sourceIp: '192.168.1.101', sourceName: 'WorkstationB', timestamp: '2025-06-14T10:22:18Z', level: 'INFO',     category: 'HTTP',    message: 'DELETE /api/orders/17 200 OK',                           endpoint: '/api/orders/17',   statusCode: 200,       hasAlert: false },
  { id: 'log-018', sourceIp: '10.0.0.5',      sourceName: 'AppServer',    timestamp: '2025-06-14T10:35:02Z', level: 'ERROR',    category: 'HTTP',    message: 'GET /api/analytics 500 Internal Server Error',           endpoint: '/api/analytics',   statusCode: 500,       hasAlert: false },
  { id: 'log-019', sourceIp: '10.0.0.5',      sourceName: 'AppServer',    timestamp: '2025-06-14T10:36:14Z', level: 'ERROR',    category: 'HTTP',    message: 'GET /api/analytics 500 Internal Server Error',           endpoint: '/api/analytics',   statusCode: 500,       hasAlert: false },
  { id: 'log-020', sourceIp: '10.0.0.5',      sourceName: 'AppServer',    timestamp: '2025-06-14T10:37:29Z', level: 'ERROR',    category: 'SYSTEM',  message: 'Database connection timeout after 30s',                  endpoint: undefined,          statusCode: undefined, hasAlert: false },
  { id: 'log-021', sourceIp: '10.0.0.5',      sourceName: 'AppServer',    timestamp: '2025-06-14T10:38:01Z', level: 'ERROR',    category: 'SYSTEM',  message: 'Database connection timeout after 30s',                  endpoint: undefined,          statusCode: undefined, hasAlert: false },
  { id: 'log-022', sourceIp: '10.0.0.5',      sourceName: 'AppServer',    timestamp: '2025-06-14T10:38:45Z', level: 'ERROR',    category: 'SYSTEM',  message: 'Database connection timeout after 30s',                  endpoint: undefined,          statusCode: undefined, hasAlert: false },
  { id: 'log-023', sourceIp: '10.0.0.5',      sourceName: 'AppServer',    timestamp: '2025-06-14T10:39:12Z', level: 'CRITICAL', category: 'SYSTEM',  message: 'Database pool exhausted — service degraded',             endpoint: undefined,          statusCode: undefined, hasAlert: true  },

  // Port Scan
  { id: 'log-024', sourceIp: '87.101.44.22',  sourceName: undefined,      timestamp: '2025-06-14T11:00:03Z', level: 'WARNING',  category: 'NETWORK', message: 'Connection attempt to port :22 (SSH)',                   endpoint: ':22',              statusCode: undefined, hasAlert: true  },
  { id: 'log-025', sourceIp: '87.101.44.22',  sourceName: undefined,      timestamp: '2025-06-14T11:00:07Z', level: 'WARNING',  category: 'NETWORK', message: 'Connection attempt to port :80 (HTTP)',                  endpoint: ':80',              statusCode: undefined, hasAlert: true  },
  { id: 'log-026', sourceIp: '87.101.44.22',  sourceName: undefined,      timestamp: '2025-06-14T11:00:11Z', level: 'WARNING',  category: 'NETWORK', message: 'Connection attempt to port :443 (HTTPS)',                endpoint: ':443',             statusCode: undefined, hasAlert: true  },
  { id: 'log-027', sourceIp: '87.101.44.22',  sourceName: undefined,      timestamp: '2025-06-14T11:00:14Z', level: 'WARNING',  category: 'NETWORK', message: 'Connection attempt to port :3389 (RDP)',                 endpoint: ':3389',            statusCode: undefined, hasAlert: true  },
  { id: 'log-028', sourceIp: '87.101.44.22',  sourceName: undefined,      timestamp: '2025-06-14T11:00:18Z', level: 'WARNING',  category: 'NETWORK', message: 'Connection attempt to port :5432 (PostgreSQL)',           endpoint: ':5432',            statusCode: undefined, hasAlert: true  },
  { id: 'log-029', sourceIp: '87.101.44.22',  sourceName: undefined,      timestamp: '2025-06-14T11:00:22Z', level: 'WARNING',  category: 'NETWORK', message: 'Connection attempt to port :8080 (HTTP-alt)',            endpoint: ':8080',            statusCode: undefined, hasAlert: true  },

  // DDoS
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `log-ddos-${String(i + 1).padStart(3, '0')}`,
    sourceIp: '45.33.32.156',
    sourceName: undefined,
    timestamp: new Date(new Date('2025-06-14T13:00:00Z').getTime() + i * 2500).toISOString(),
    level: 'INFO' as const,
    category: 'HTTP',
    message: `GET /api/data HTTP/1.1 200 OK`,
    endpoint: '/api/data',
    statusCode: 200,
    hasAlert: i >= 5,
  })),

  // Off-Hours
  { id: 'log-off-001', sourceIp: '203.0.113.9', sourceName: undefined, timestamp: '2025-06-14T23:12:44Z', level: 'ERROR',   category: 'AUTH',   message: 'Login failed: invalid credentials for user sysadmin', endpoint: undefined, statusCode: undefined, hasAlert: true  },
  { id: 'log-off-002', sourceIp: '203.0.113.9', sourceName: undefined, timestamp: '2025-06-14T23:13:05Z', level: 'WARNING', category: 'SYSTEM', message: 'Unexpected process started: nc.exe',                  endpoint: undefined, statusCode: undefined, hasAlert: true  },

  // ნორმალური — დღის ბოლო
  { id: 'log-end-001', sourceIp: '192.168.1.100', sourceName: 'WorkstationA', timestamp: '2025-06-14T17:01:22Z', level: 'INFO', category: 'AUTH',   message: 'User admin logged out',           endpoint: undefined,  statusCode: undefined, hasAlert: false },
  { id: 'log-end-002', sourceIp: '192.168.1.101', sourceName: 'WorkstationB', timestamp: '2025-06-14T17:05:44Z', level: 'INFO', category: 'AUTH',   message: 'User developer logged out',       endpoint: undefined,  statusCode: undefined, hasAlert: false },
  { id: 'log-end-003', sourceIp: '10.0.0.5',      sourceName: 'AppServer',    timestamp: '2025-06-14T17:30:00Z', level: 'INFO', category: 'SYSTEM', message: 'Daily report generated and saved', endpoint: undefined, statusCode: undefined, hasAlert: false },
];

// =========================================
// MOCK ALERTS
// =========================================
export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-001',
    alertType: 'BRUTE_FORCE',
    severity: 'HIGH',
    sourceIp: '45.33.32.156',
    description: 'Brute force შეტევა: 5 წარუმატებელი შესვლის მცდელობა IP 45.33.32.156-დან ბოლო 5 წუთში.',
    isResolved: false,
    detectedAt: '2025-06-14T10:01:39Z',
  },
  {
    id: 'alert-002',
    alertType: 'PORT_SCAN',
    severity: 'HIGH',
    sourceIp: '87.101.44.22',
    description: 'სავარაუდო Port Scan: 6 განსხვავებული endpoint IP 87.101.44.22-დან ბოლო 1 წუთში.',
    isResolved: false,
    detectedAt: '2025-06-14T11:00:22Z',
  },
  {
    id: 'alert-003',
    alertType: 'DDOS',
    severity: 'CRITICAL',
    sourceIp: '45.33.32.156',
    description: 'სავარაუდო DDoS შეტევა: 110 რექვესტი IP 45.33.32.156-დან ბოლო 1 წუთში.',
    isResolved: false,
    detectedAt: '2025-06-14T13:00:28Z',
  },
  {
    id: 'alert-004',
    alertType: 'ERROR_SPIKE',
    severity: 'HIGH',
    sourceIp: '10.0.0.5',
    description: 'შეცდომების სპაიკი: 10 ERROR/CRITICAL IP 10.0.0.5-დან ბოლო 5 წუთში.',
    isResolved: false,
    detectedAt: '2025-06-14T10:39:12Z',
  },
  {
    id: 'alert-005',
    alertType: 'OFF_HOURS',
    severity: 'MEDIUM',
    sourceIp: '203.0.113.9',
    description: 'სამუშაო საათების გარეთ საეჭვო აქტივობა: AUTH მოვლენა 23:12-ზე IP 203.0.113.9-დან.',
    isResolved: false,
    detectedAt: '2025-06-14T23:12:44Z',
  },
  {
    id: 'alert-006',
    alertType: 'BRUTE_FORCE',
    severity: 'CRITICAL',
    sourceIp: '198.51.100.23',
    description: 'Brute force შეტევა: 14 წარუმატებელი შესვლის მცდელობა IP 198.51.100.23-დან ბოლო 5 წუთში.',
    isResolved: true,
    detectedAt: '2025-06-14T07:44:11Z',
  },
  {
    id: 'alert-007',
    alertType: 'PORT_SCAN',
    severity: 'MEDIUM',
    sourceIp: '104.21.88.5',
    description: 'სავარაუდო Port Scan: 5 განსხვავებული endpoint IP 104.21.88.5-დან ბოლო 1 წუთში.',
    isResolved: true,
    detectedAt: '2025-06-14T06:15:33Z',
  },
];

// =========================================
// MOCK DASHBOARD STATS
// =========================================
export const MOCK_STATS: DashboardStats = {
  totalLogsToday: MOCK_LOGS.length,
  activeAlerts: MOCK_ALERTS.filter(a => !a.isResolved).length,
  criticalAlerts: MOCK_ALERTS.filter(a => !a.isResolved && a.severity === 'CRITICAL').length,
  uniqueSourcesCount: new Set(MOCK_LOGS.map(l => l.sourceIp)).size,

  logsByHour: [
    { hour: '00:00', count: 2,  errorCount: 1 },
    { hour: '01:00', count: 0,  errorCount: 0 },
    { hour: '02:00', count: 0,  errorCount: 0 },
    { hour: '03:00', count: 1,  errorCount: 0 },
    { hour: '04:00', count: 0,  errorCount: 0 },
    { hour: '05:00', count: 0,  errorCount: 0 },
    { hour: '06:00', count: 3,  errorCount: 1 },
    { hour: '07:00', count: 7,  errorCount: 2 },
    { hour: '08:00', count: 14, errorCount: 1 },
    { hour: '09:00', count: 18, errorCount: 3 },
    { hour: '10:00', count: 22, errorCount: 8 },
    { hour: '11:00', count: 16, errorCount: 6 },
    { hour: '12:00', count: 11, errorCount: 1 },
    { hour: '13:00', count: 34, errorCount: 2 },
    { hour: '14:00', count: 19, errorCount: 1 },
    { hour: '15:00', count: 12, errorCount: 2 },
    { hour: '16:00', count: 9,  errorCount: 1 },
    { hour: '17:00', count: 5,  errorCount: 0 },
    { hour: '18:00', count: 0,  errorCount: 0 },
    { hour: '23:00', count: 2,  errorCount: 1 },
  ],

  alertsBySeverity: [
    { severity: 'CRITICAL', count: 1 },
    { severity: 'HIGH',     count: 3 },
    { severity: 'MEDIUM',   count: 1 },
  ],

  topSources: [
    { sourceIp: '45.33.32.156',  requestCount: 30, alertCount: 2 },
    { sourceIp: '10.0.0.5',      requestCount: 12, alertCount: 1 },
    { sourceIp: '192.168.1.100', requestCount: 10, alertCount: 0 },
    { sourceIp: '87.101.44.22',  requestCount: 6,  alertCount: 1 },
    { sourceIp: '192.168.1.101', requestCount: 6,  alertCount: 0 },
    { sourceIp: '172.16.0.8',    requestCount: 4,  alertCount: 0 },
    { sourceIp: '203.0.113.9',   requestCount: 2,  alertCount: 1 },
  ],
};
