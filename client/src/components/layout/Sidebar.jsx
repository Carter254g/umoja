import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Vote, Wallet, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';
import { clsx } from 'clsx';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Communities', path: '/communities' },
  { icon: Vote, label: 'Proposals', path: '/proposals' },
  { icon: Wallet, label: 'Treasury', path: '/treasury' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside
      className="w-64 h-screen flex flex-col"
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderRight: '1px solid rgba(148, 163, 184, 0.08)'
      }}
    >
      <div className="p-6 border-b border-dark-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Umoja</p>
            <p className="text-dark-400 text-xs">Governance Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                isActive
                  ? 'bg-primary-600/20 text-primary-400 font-medium'
                  : 'text-dark-300 hover:text-white hover:bg-dark-800'
              )}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === 'Notifications' && (
                <span className="ml-auto bg-gold-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">3</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center gap-3 p-3 rounded-xl mb-2">
          <Avatar name={user?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Guest'}</p>
            <p className="text-xs text-dark-400 truncate">{user?.phone || ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
