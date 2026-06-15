import { useEffect, useState } from 'react';
import { getLogs, LogEntry } from '../api/client';

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  INFO:     { bg: '#1e3a5f', text: '#93c5fd' },
  WARNING:  { bg: '#4a2c0a', text: '#fcd34d' },
  ERROR:    { bg: '#4c1d1d', text: '#fca5a5' },
  CRITICAL: { bg: '#7f1d1d', text: '#fee2e2' },
};

export default function LogsList() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [level, setLevel] = useState('');
  const [sourceIp, setSourceIp] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await getLogs({
        level: level || undefined,
        sourceIp: sourceIp || undefined
      });
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [level, sourceIp]);

  return (
    <div>
      {/* ფილტრები */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select
          value={level}
          onChange={e => setLevel(e.target.value)}
          style={{
            background: '#1e293b', color: '#e2e8f0',
            border: '1px solid #334155', borderRadius: 6,
            padding: '8px 12px', fontSize: 14
          }}
        >
          <option value="">ყველა დონე</option>
          {['INFO', 'WARNING', 'ERROR', 'CRITICAL'].map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <input
          placeholder="IP მისამართი..."
          value={sourceIp}
          onChange={e => setSourceIp(e.target.value)}
          style={{
            background: '#1e293b', color: '#e2e8f0',
            border: '1px solid #334155', borderRadius: 6,
            padding: '8px 12px', fontSize: 14, width: 200
          }}
        />

        <button
          onClick={fetchLogs}
          style={{
            background: '#3b82f6', color: '#fff',
            border: 'none', borderRadius: 6,
            padding: '8px 16px', cursor: 'pointer', fontSize: 14
          }}
        >
          განახლება
        </button>
      </div>

      {/* ცხრილი */}
      <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: '#64748b', borderBottom: '1px solid #334155' }}>
              {['დრო', 'IP', 'დონე', 'კატეგ.', 'შეტყობინება'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                  იტვირთება...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                  ლოგები არ არის
                </td>
              </tr>
            ) : logs.map(log => {
              const colors = LEVEL_COLORS[log.level] || LEVEL_COLORS.INFO;
              return (
                <tr
                  key={log.id}
                  style={{
                    borderBottom: '1px solid #1e3a5f',
                    background: log.hasAlert ? '#1c1010' : 'transparent'
                  }}
                >
                  <td style={{ padding: '10px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString('ka-GE')}
                  </td>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: '#93c5fd' }}>
                    {log.sourceIp}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11,
                      background: colors.bg, color: colors.text
                    }}>
                      {log.level}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#94a3b8' }}>{log.category}</td>
                  <td style={{ padding: '10px 16px', color: '#e2e8f0', maxWidth: 400 }}>
                    {log.hasAlert && <span style={{ color: '#f97316', marginRight: 6 }}>⚠</span>}
                    {log.message}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
