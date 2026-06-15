import { useState } from 'react';
import { Activity, AlertTriangle, FileText, Shield } from 'lucide-react';
import Dashboard from './components/Dashboard';
import LogsList from './components/LogsList';
import AlertsList from './components/AlertsList';

type Page = 'dashboard' | 'logs' | 'alerts';

const NAV_ITEMS: { id: Page; label: string; icon: JSX.Element }[] = [
  { id: 'dashboard', label: 'Dashboard',  icon: <Activity size={18} /> },
  { id: 'logs',      label: 'ლოგები',     icon: <FileText size={18} /> },
  { id: 'alerts',    label: 'ალერტები',   icon: <AlertTriangle size={18} /> },
];

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');

  const PAGE_TITLES: Record<Page, string> = {
    dashboard: 'Dashboard',
    logs:      'ლოგების სია',
    alerts:    'ალერტები',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: '#e2e8f0',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      display: 'flex'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#1e293b',
        borderRight: '1px solid #334155',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', height: '100vh'
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={24} color="#3b82f6" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>LogMonitor</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Security Dashboard</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: 10, padding: '10px 12px', borderRadius: 8,
                border: 'none', cursor: 'pointer', fontSize: 14,
                marginBottom: 4, textAlign: 'left',
                background: page === item.id ? '#1d4ed8' : 'transparent',
                color: page === item.id ? '#fff' : '#94a3b8',
                transition: 'all 0.15s'
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* API Status */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #334155',
          fontSize: 12, color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 6px #22c55e'
            }} />
            API: localhost:5000
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: 220, flex: 1, padding: 32 }}>
        {/* Page Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>
            {PAGE_TITLES[page]}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            {new Date().toLocaleString('ka-GE')}
          </p>
        </div>

        {/* Page Content */}
        {page === 'dashboard' && <Dashboard />}
        {page === 'logs'      && <LogsList />}
        {page === 'alerts'    && <AlertsList />}
      </main>
    </div>
  );
}
