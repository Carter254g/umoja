import { useState } from 'react';
import { User, Phone, Shield, Bell, Moon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  return (
    <Layout>
      <div style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: 0 }}>Settings</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>Manage your account preferences</p>
        </div>

        {/* Profile */}
        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ color: 'white', fontSize: '15px', fontWeight: 600, margin: '0 0 20px' }}>Profile</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #16a34a, #15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '20px' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ color: 'white', fontSize: '16px', fontWeight: 600, margin: 0 }}>{user?.name}</p>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>{user?.phone}</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Full Name', value: user?.name, icon: <User size={16} color="#64748b" /> },
              { label: 'Phone Number', value: user?.phone, icon: <Phone size={16} color="#64748b" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#0d1424', border: '1px solid #1e2d45', borderRadius: '10px' }}>
                {icon}
                <div>
                  <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 2px' }}>{label}</p>
                  <p style={{ color: 'white', fontSize: '13px', fontWeight: 500, margin: 0 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ color: 'white', fontSize: '15px', fontWeight: 600, margin: '0 0 20px' }}>Notifications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Push Notifications', desc: 'Get notified about votes and proposals', value: notifications, set: setNotifications, icon: <Bell size={16} color="#64748b" /> },
              { label: 'SMS Alerts', desc: 'Receive SMS for urgent community updates', value: smsAlerts, set: setSmsAlerts, icon: <Phone size={16} color="#64748b" /> },
            ].map(({ label, desc, value, set, icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#0d1424', border: '1px solid #1e2d45', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {icon}
                  <div>
                    <p style={{ color: 'white', fontSize: '13px', fontWeight: 500, margin: 0 }}>{label}</p>
                    <p style={{ color: '#64748b', fontSize: '11px', margin: '2px 0 0' }}>{desc}</p>
                  </div>
                </div>
                <div onClick={() => set(!value)} style={{ width: '40px', height: '22px', borderRadius: '11px', background: value ? '#16a34a' : '#1e2d45', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: '3px', left: value ? '21px' : '3px', width: '16px', height: '16px', background: 'white', borderRadius: '50%', transition: 'left 0.2s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ color: 'white', fontSize: '15px', fontWeight: 600, margin: '0 0 16px' }}>Security</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(22,163,74,0.15)', borderRadius: '10px' }}>
            <Shield size={18} color="#4ade80" />
            <div>
              <p style={{ color: 'white', fontSize: '13px', fontWeight: 500, margin: 0 }}>Phone OTP Authentication</p>
              <p style={{ color: '#64748b', fontSize: '11px', margin: '2px 0 0' }}>Your account is secured with SMS verification</p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#4ade80', fontSize: '12px', fontWeight: 600 }}>Active</span>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Settings;
