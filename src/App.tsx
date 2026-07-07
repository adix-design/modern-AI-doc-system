import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from 'react';

import MainLayout from "./layouts/MainLayout";

// Lazy load page components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Shipments = lazy(() => import("./pages/Shipments"));
const Customers = lazy(() => import("./pages/Customers"));
const Documents = lazy(() => import("./pages/Documents"));
const Settings = lazy(() => import("./pages/Settings"));
const Finance = lazy(() => import("./pages/Finance"));
const Analytics = lazy(() => import("./pages/Analytics"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));

// Other components
const FleetDrivers = lazy(() => import("./components/FleetDrivers"));
const CalendarPage = lazy(() => import("./components/CalendarPage"));
const TodoPage = lazy(() => import("./components/TodoPage"));

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

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/quotations" element={<Analytics />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            
            <Route path="/fleet-drivers" element={<FleetDrivers />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/todo" element={<TodoPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
