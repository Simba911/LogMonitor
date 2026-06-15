import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Activity, AlertTriangle, Shield, Wifi } from 'lucide-react';
import { getStats, DashboardStats } from '../api/client';

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{ color: '#94a3b8', padding: 40 }}>იტვირთება...</div>;
  if (!stats) return <div style={{ color: '#ef4444', padding: 40 }}>მონაცემები ვერ ჩაიტვირთა</div>;

  const statCards = [
    { label: 'ლოგები დღეს', value: stats.totalLogsToday, icon: <Activity size={20} />, color: '#3b82f6' },
    { label: 'აქტიური ალერტები', value: stats.activeAlerts, icon: <AlertTriangle size={20} />, color: '#f97316' },
    { label: 'კრიტიკული', value: stats.criticalAlerts, icon: <Shield size={20} />, color: '#ef4444' },
    { label: 'უნიკ. წყაროები', value: stats.uniqueSourcesCount, icon: <Wifi size={20} />, color: '#8b5cf6' },
  ];

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            background: '#1e293b', borderRadius: 12, padding: 20,
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{card.label}</span>
              <div style={{ color: card.color }}>{card.icon}</div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Area Chart */}
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#f1f5f9' }}>ლოგები — ბოლო 24 საათი</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.logsByHour}>
              <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#1d4ed8" fillOpacity={0.3} name="სულ" />
              <Area type="monotone" dataKey="errorCount" stroke="#ef4444" fill="#7f1d1d" fillOpacity={0.3} name="შეცდომა" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#f1f5f9' }}>ალერტები სევერიტის მიხედვით</h3>
          {stats.alertsBySeverity.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', paddingTop: 60 }}>ალერტები არ არის</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={stats.alertsBySeverity}
                  cx="50%" cy="50%"
                  outerRadius={70}
                  dataKey="count"
                  nameKey="severity"
                  label={({ severity, count }) => `${severity}: ${count}`}
                >
                  {stats.alertsBySeverity.map((entry) => (
                    <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Sources Table */}
      <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#f1f5f9' }}>ყველაზე აქტიური IP-ები</h3>
        {stats.topSources.length === 0 ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: 24 }}>მონაცემები არ არის</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ color: '#64748b', borderBottom: '1px solid #334155' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>IP მისამართი</th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>რექვესტები</th>
                <th style={{ textAlign: 'right', padding: '8px 12px' }}>ალერტები</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>სტატუსი</th>
              </tr>
            </thead>
            <tbody>
              {stats.topSources.map((source) => (
                <tr key={source.sourceIp} style={{ borderBottom: '1px solid #1e3a5f' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#93c5fd' }}>{source.sourceIp}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: '#f1f5f9' }}>{source.requestCount}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: source.alertCount > 0 ? '#f97316' : '#22c55e' }}>
                    {source.alertCount}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 12,
                      background: source.alertCount > 0 ? '#7f1d1d' : '#14532d',
                      color: source.alertCount > 0 ? '#fca5a5' : '#86efac'
                    }}>
                      {source.alertCount > 0 ? '⚠ საეჭვო' : '✓ ნორმალური'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
