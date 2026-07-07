import React, { Suspense, lazy } from 'react';
import { PageId } from '../types';

// Lazy load page components for route-based code splitting
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Shipments = lazy(() => import('../pages/Shipments'));
const FleetDrivers = lazy(() => import('./FleetDrivers'));
const CalendarPage = lazy(() => import('./CalendarPage'));
const Customers = lazy(() => import('../pages/Customers'));
const Documents = lazy(() => import('../pages/Documents'));
const Finance = lazy(() => import('./Finance'));
const Quotations = lazy(() => import('./Quotations'));
const AIAssistant = lazy(() => import('./AIAssistant'));
const TodoPage = lazy(() => import('./TodoPage'));
const Settings = lazy(() => import('../pages/Settings'));

interface PlaceholderPageProps {
  id: PageId;
  setActivePage?: (page: PageId) => void;
}

// A high-fidelity premium skeleton loader fallback
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-white/40 space-y-4 animate-pulse">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-white/5"></div>
      <div className="absolute inset-0 rounded-full border-2 border-[#D946C4] border-t-transparent animate-spin"></div>
    </div>
    <span className="text-xs font-mono tracking-wider uppercase text-white/60">Loading Workspace...</span>
  </div>
);

export default function PlaceholderPage({ id, setActivePage }: PlaceholderPageProps) {
  return (
    <Suspense fallback={<PageLoader />}>
      {(() => {
        switch (id) {
          case 'dashboard':
            return <Dashboard />;

          case 'shipments':
            return <Shipments setActivePage={setActivePage || (() => {})} />;

          case 'fleet-drivers':
            return <FleetDrivers setActivePage={setActivePage} />;

          case 'calendar':
            return <CalendarPage setActivePage={setActivePage || (() => {})} />;

          case 'clients':
            return <Customers />;

          case 'documents':
            return <Documents />;

          case 'finance':
            return <Finance />;

          case 'quotations':
            return <Quotations />;

          case 'ai-assistant':
            return <AIAssistant setActivePage={setActivePage} />;

          case 'todo':
            return <TodoPage setActivePage={setActivePage} />;

          case 'settings':
            return <Settings setActivePage={setActivePage || (() => {})} />;

          default:
            return (
              <div className="p-12 text-center text-white/40">
                <p className="text-sm">Page placeholder content is under development.</p>
              </div>
            );
        }
      })()}
    </Suspense>
  );
}
