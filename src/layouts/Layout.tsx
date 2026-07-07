import { useState, useEffect } from 'react';
import { PageId } from '../types';
import Sidebar from '../components/Sidebar';
import MainPanel from '../components/MainPanel';
import LoginScreen from '../components/LoginScreen';
import MascotAssistant from '../components/MascotAssistant';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('vanguard_auth') === 'true';
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Derive activePage from the current pathname
  const getActivePageFromPath = (path: string): PageId => {
    switch (path) {
      case '/': return 'dashboard';
      case '/shipments': return 'shipments';
      case '/customers': return 'clients';
      case '/documents': return 'documents';
      case '/settings': return 'settings';
      case '/calendar': return 'calendar';
      case '/finance': return 'finance';
      case '/quotations': return 'quotations';
      case '/ai-assistant': return 'ai-assistant';
      case '/todo': return 'todo';
      case '/fleet-drivers': return 'fleet-drivers';
      default: return 'dashboard';
    }
  };

  const activePage = getActivePageFromPath(location.pathname);

  // When clicking items, nav to path
  const handlePageChange = (page: PageId) => {
    switch (page) {
      case 'dashboard': navigate('/'); break;
      case 'shipments': navigate('/shipments'); break;
      case 'clients': navigate('/customers'); break;
      case 'documents': navigate('/documents'); break;
      case 'settings': navigate('/settings'); break;
      case 'calendar': navigate('/calendar'); break;
      case 'finance': navigate('/finance'); break;
      case 'quotations': navigate('/quotations'); break;
      case 'ai-assistant': navigate('/ai-assistant'); break;
      case 'todo': navigate('/todo'); break;
      case 'fleet-drivers': navigate('/fleet-drivers'); break;
      default: navigate('/');
    }
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 && window.innerWidth < 1024;
    }
    return false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Apply background glow configuration
    const intensity = localStorage.getItem('vanguard_glow_intensity') || 'balanced';
    const root = document.documentElement;
    if (intensity === 'subtle') {
      root.style.setProperty('--bg-radial-opacity-1', '0.15');
      root.style.setProperty('--bg-radial-opacity-2', '0.25');
      root.style.setProperty('--bg-radial-opacity-3', '0.55');
      root.style.setProperty('--bg-glow-opacity', '0.05');
    } else if (intensity === 'vivid') {
      root.style.setProperty('--bg-radial-opacity-1', '0.55');
      root.style.setProperty('--bg-radial-opacity-2', '0.75');
      root.style.setProperty('--bg-radial-opacity-3', '0.95');
      root.style.setProperty('--bg-glow-opacity', '0.20');
    } else { // balanced
      root.style.setProperty('--bg-radial-opacity-1', '0.35');
      root.style.setProperty('--bg-radial-opacity-2', '0.55');
      root.style.setProperty('--bg-radial-opacity-3', '0.85');
      root.style.setProperty('--bg-glow-opacity', '0.10');
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('vanguard_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('vanguard_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A14] font-sans overflow-x-hidden select-none text-[#F2EEF9]">
      {/* 1. Cinematic subtle fine grain/noise overlay */}
      <div className="grain-overlay" />

      {/* 2. Page entry ambient highlight overlay (blooming violet sunset light at top center) */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[32rem] blur-[140px] rounded-full pointer-events-none z-0 transition-all duration-500" 
        style={{ backgroundColor: 'rgba(217, 70, 196, var(--bg-glow-opacity, 0.10))' }}
      />

      {/* 3. Slide-in Desktop Sidebar or Mobile Drawer */}
      <Sidebar
        activePage={activePage}
        setActivePage={handlePageChange}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onLogout={handleLogout}
      />

      {/* 4. Main Panel Wrapper (Floating glass dashboard and page content canvas) */}
      <MainPanel
        activePage={activePage}
        setActivePage={handlePageChange}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsMobileOpen={setIsMobileSidebarOpen}
      >
        <Outlet />
      </MainPanel>

      {/* 5. Floating Mascot Assistant Widget */}
      <MascotAssistant activePage={activePage} setActivePage={handlePageChange} />
    </div>
  );
}
