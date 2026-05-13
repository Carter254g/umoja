import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header
      className="fixed top-0 right-0 left-64 h-16 z-20 flex items-center justify-between px-6"
      style={{
        background: 'rgba(15, 23, 42, 0.90)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.08)'
      }}
    >
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="relative hidden md:block flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="Search communities, proposals..."
            className="input-dark pl-9 py-2 text-sm w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-dark-700">
          <Avatar name={user?.name} size="sm" />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white leading-none">{user?.name}</p>
            <p className="text-xs text-dark-400 mt-0.5">Member</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
