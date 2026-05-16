import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617' }}>

      {/* Sidebar - desktop only */}
      <div id="desktop-sidebar" style={{ width: '256px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: 'relative', zIndex: 51, width: '256px' }}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;
