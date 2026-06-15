import { useEffect, useState } from 'react';
import { getAlerts, resolveAlert, Alert } from '../api/client';

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: '#7f1d1d', text: '#fee2e2', border: '#ef4444' },
  HIGH:     { bg: '#431407', text: '#fed7aa', border: '#f97316' },
  MEDIUM:   { bg: '#422006', text: '#fef08a', border: '#eab308' },
  LOW:      { bg: '#14532d', text: '#bbf7d0', border: '#22c55e' },
};

const ALERT_TYPE_LABELS: Record<string, string> = {
  BRUTE_FORCE: '🔓 Brute Force',
  DDOS:        '💥 DDoS',
  OFF_HOURS:   '🌙 Off-Hours',
  PORT_SCAN:   '🔍 Port Scan',
  ERROR_SPIKE: '📈 Error Spike',
};

export default function AlertsList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showResolved, setShowResolved] = useState(false);
  const [severity, setSeverity] = useState('');
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data } = await getAlerts({
        isResolved: showResolved ? undefined : false,
        severity: severity || undefined,
      });
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [showResolved, severity]);

  const handleResolve = async (id: string) => {
    setResolving(id);
    try {
      await resolveAlert(id);
      await fetchAlerts();
    } catch (e) {
      console.error(e);
    } finally {
      setResolving(null);
    }
  };

  return (
    <div>
      {/* ფილტრები */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <select
          value={severity}
          onChange={e => setSeverity(e.target.value)}
          style={{
            background: '#1e293b', color: '#e2e8f0',
            border: '1px solid #334155', borderRadius: 6,
            padding: '8px 12px', fontSize: 14
          }}
        >
          <option value="">ყველა სევერიტი</option>
          {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 14, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showResolved}
            onChange={e => setShowResolved(e.target.checked)}
          />
          დახურულებიც ვაჩვენო
        </label>

        <button
          onClick={fetchAlerts}
          style={{
            background: '#3b82f6', color: '#fff',
            border: 'none', borderRadius: 6,
            padding: '8px 16px', cursor: 'pointer', fontSize: 14
          }}
        >
          განახლება
        </button>

        <span style={{ color: '#64748b', fontSize: 13, marginLeft: 'auto' }}>
          სულ: {alerts.length} ალერტი
        </span>
      </div>

      {/* ალერტების ბარათები */}
      {loading ? (
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>იტვირთება...</div>
      ) : alerts.length === 0 ? (
        <div style={{
          background: '#1e293b', borderRadius: 12,
          border: '1px solid #334155', padding: 40,
          textAlign: 'center', color: '#64748b'
        }}>
          ✓ ალერტები არ არის
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alerts.map(alert => {
            const colors = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.LOW;
            return (
              <div
                key={alert.id}
                style={{
                  background: '#1e293b',
                  borderRadius: 12,
                  border: `1px solid ${alert.isResolved ? '#334155' : colors.border}`,
                  padding: 20,
                  opacity: alert.isResolved ? 0.6 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 4, fontSize: 12,
                        background: colors.bg, color: colors.text, fontWeight: 600
                      }}>
                        {alert.severity}
                      </span>
                      <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15 }}>
                        {ALERT_TYPE_LABELS[alert.alertType] || alert.alertType}
                      </span>
                      {alert.isResolved && (
                        <span style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: 11,
                          background: '#14532d', color: '#86efac'
                        }}>
                          ✓ დახურული
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p style={{ color: '#cbd5e1', fontSize: 14, margin: '0 0 8px' }}>
                      {alert.description}
                    </p>

                    {/* Meta */}
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                      {alert.sourceIp && (
                        <span>IP: <span style={{ color: '#93c5fd', fontFamily: 'monospace' }}>{alert.sourceIp}</span></span>
                      )}
                      <span>აღმოჩნდა: {new Date(alert.detectedAt).toLocaleString('ka-GE')}</span>
                    </div>
                  </div>

                  {/* Resolve Button */}
                  {!alert.isResolved && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      disabled={resolving === alert.id}
                      style={{
                        background: resolving === alert.id ? '#374151' : '#065f46',
                        color: resolving === alert.id ? '#9ca3af' : '#6ee7b7',
                        border: '1px solid #059669',
                        borderRadius: 6, padding: '8px 16px',
                        cursor: resolving === alert.id ? 'not-allowed' : 'pointer',
                        fontSize: 13, marginLeft: 16, whiteSpace: 'nowrap'
                      }}
                    >
                      {resolving === alert.id ? '...' : '✓ დახურვა'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
