import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Vote, Wallet, Bell } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: Users, label: 'Communities', path: '/communities' },
  { icon: Vote, label: 'Votes', path: '/proposals' },
  { icon: Wallet, label: 'Treasury', path: '/treasury' },
  { icon: Bell, label: 'Alerts', path: '/notifications' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex lg:hidden"
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(148, 163, 184, 0.08)'
      }}
    >
      {navItems.map(({ icon: Icon, label, path }) => {
        const isActive = location.pathname === path ||
          (path !== '/dashboard' && location.pathname.startsWith(path));
        return (
          <Link
            key={path}
            to={path}
            className={clsx(
              'flex-1 flex flex-col items-center gap-1 py-3 transition-colors',
              isActive ? 'text-primary-400' : 'text-dark-400'
            )}
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
            {isActive && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-primary-500 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
