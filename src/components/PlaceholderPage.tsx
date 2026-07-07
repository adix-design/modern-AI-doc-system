import React, { Suspense, lazy } from 'react';
import { PageId } from '../types';

// Lazy load page components for route-based code splitting
const Dashboard = lazy(() => import('./Dashboard'));
const ShipmentsPage = lazy(() => import('./ShipmentsPage'));
const FleetDrivers = lazy(() => import('./FleetDrivers'));
const CalendarPage = lazy(() => import('./CalendarPage'));
const Clients = lazy(() => import('./Clients'));
const Documents = lazy(() => import('./Documents'));
const Finance = lazy(() => import('./Finance'));
const Quotations = lazy(() => import('./Quotations'));
const AIAssistant = lazy(() => import('./AIAssistant'));
const TodoPage = lazy(() => import('./TodoPage'));
const SettingsPage = lazy(() => import('./SettingsPage'));

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
            return <ShipmentsPage setActivePage={setActivePage || (() => {})} />;

          case 'fleet-drivers':
            return <FleetDrivers setActivePage={setActivePage} />;

          case 'calendar':
            return <CalendarPage setActivePage={setActivePage || (() => {})} />;

          case 'clients':
            return <Clients />;

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
            return <SettingsPage setActivePage={setActivePage || (() => {})} />;

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
