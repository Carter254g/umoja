import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Vote, Wallet, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Communities', path: '/communities' },
  { icon: Vote, label: 'Proposals', path: '/proposals' },
  { icon: Wallet, label: 'Treasury', path: '/treasury' },
  { icon: Users, label: 'Members', path: '/members' },
  { icon: Bell, label: 'Notifications', path: '/notifications', badge: 3 },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside style={{
      width: '256px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0d1424',
      borderRight: '1px solid #1e2d45',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e2d45' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(22,163,74,0.4)',
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '16px' }}>U</span>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '15px', letterSpacing: '0.02em' }}>Umoja</div>
            <div style={{ color: '#4a6fa5', fontSize: '11px', marginTop: '1px' }}>Governance Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ icon: Icon, label, path, badge }) => {
          const isActive = location.pathname === path;
          return (
            <Link key={path} to={path} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', borderRadius: '10px',
              textDecoration: 'none', transition: 'all 0.15s',
              background: isActive ? 'rgba(22,163,74,0.15)' : 'transparent',
              color: isActive ? '#4ade80' : '#94a3b8',
              fontWeight: isActive ? 600 : 400,
              fontSize: '14px',
              border: isActive ? '1px solid rgba(22,163,74,0.2)' : '1px solid transparent',
            }}>
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge && (
                <span style={{
                  background: '#d97706', color: 'white',
                  fontSize: '11px', fontWeight: 700,
                  padding: '2px 6px', borderRadius: '10px',
                }}>{badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #1e2d45' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', marginBottom: '4px' }}>
          <Avatar name={user?.name} size="sm" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'white', fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Guest'}</div>
            <div style={{ color: '#4a6fa5', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.phone || ''}</div>
          </div>
        </div>
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '10px 12px', borderRadius: '10px', width: '100%',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#f87171', fontSize: '14px', transition: 'all 0.15s',
        }}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
