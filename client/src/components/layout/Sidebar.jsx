import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Vote, Wallet, 
  Bell, Settings, LogOut, Shield
} from 'lucide-react';
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
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-30"
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(148, 163, 184, 0.08)'
      }}
    >
      <div className="p-6 border-b border-dark-800">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow-green">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg leading-none">Umoja</p>
            <p className="text-dark-400 text-xs mt-0.5">Governance Platform</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path ||
            (path !== '/dashboard' && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={clsx('sidebar-item', isActive && 'active')}
            >
              <Icon size={18} />
              <span className="font-medium">{label}</span>
              {label === 'Notifications' && (
                <span className="ml-auto bg-gold-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-800 transition-colors cursor-pointer mb-2">
          <Avatar name={user?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Guest'}</p>
            <p className="text-xs text-dark-400 truncate">{user?.phone || ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={18} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
