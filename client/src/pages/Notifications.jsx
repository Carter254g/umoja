import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import Layout from '../components/layout/Layout';
import api from '../utils/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(res => {
      setNotifications(res.data.notifications || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: 0 }}>Notifications</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Your alerts and updates</p>
        </div>

        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
          {loading ? (
            <p style={{ color: '#64748b', fontSize: '13px' }}>Loading...</p>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Bell size={32} color="#1e2d45" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: '#64748b', fontSize: '14px' }}>No notifications yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.map(n => (
                <div key={n.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '14px 16px', background: n.read ? '#0d1424' : 'rgba(22,163,74,0.05)',
                  border: `1px solid ${n.read ? '#1e2d45' : 'rgba(22,163,74,0.2)'}`,
                  borderRadius: '10px',
                }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={16} color="#4ade80" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'white', fontSize: '13px', fontWeight: 500, margin: '0 0 4px' }}>{n.message || n.title}</p>
                    <p style={{ color: '#64748b', fontSize: '11px', margin: 0 }}>{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                  {n.read ? <CheckCheck size={14} color="#4ade80" /> : <Check size={14} color="#64748b" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
