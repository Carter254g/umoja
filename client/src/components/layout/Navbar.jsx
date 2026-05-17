import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header style={{
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      background: '#0d1424',
      borderBottom: '1px solid #1e2d45',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4a6fa5' }} />
          <input type="text" placeholder="Search communities, proposals..." style={{
            width: '100%', padding: '9px 12px 9px 36px',
            background: '#111827', border: '1px solid #1e2d45',
            borderRadius: '10px', color: '#cbd5e1', fontSize: '13px',
            outline: 'none', boxSizing: 'border-box',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button style={{
          position: 'relative', width: '38px', height: '38px',
          background: '#111827', border: '1px solid #1e2d45',
          borderRadius: '10px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94a3b8',
        }}>
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: '8px', right: '8px',
            width: '7px', height: '7px',
            background: '#d97706', borderRadius: '50%',
          }} />
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '6px 12px', background: '#111827',
          border: '1px solid #1e2d45', borderRadius: '10px',
        }}>
          <Avatar name={user?.name} size="sm" />
          <div>
            <div style={{ color: 'white', fontSize: '13px', fontWeight: 600, lineHeight: 1.2 }}>{user?.name}</div>
            <div style={{ color: '#4a6fa5', fontSize: '11px' }}>Member</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
