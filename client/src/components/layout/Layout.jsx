import { useState } from 'react';
import { clsx } from 'clsx';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-20"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full z-30">
            <Sidebar />
          </div>
        </div>
      )}

      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <main className={clsx(
        'pt-16 pb-20 lg:pb-0 lg:pl-64 min-h-screen'
      )}>
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;
