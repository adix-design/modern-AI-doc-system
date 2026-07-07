/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { PageId } from './types';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import PlaceholderPage from './components/PlaceholderPage';
import LoginScreen from './components/LoginScreen';
import { motion } from 'motion/react';
import MascotAssistant from './components/MascotAssistant';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('vanguard_auth') === 'true';
  });
  const [activePage, setActivePage] = useState<PageId>('dashboard');
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
        setActivePage={setActivePage}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onLogout={handleLogout}
      />

      {/* 4. Main Panel Wrapper (Floating glass dashboard and page content canvas) */}
      <MainPanel
        activePage={activePage}
        setActivePage={setActivePage}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsMobileOpen={setIsMobileSidebarOpen}
      >
        <PlaceholderPage id={activePage} setActivePage={setActivePage} />
      </MainPanel>

      {/* 5. Floating Mascot Assistant Widget */}
      <MascotAssistant activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
}
