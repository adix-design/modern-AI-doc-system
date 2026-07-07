import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Truck, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  AlertCircle, 
  MessageSquare, 
  ArrowUpRight, 
  CheckSquare
} from 'lucide-react';
import { motion } from 'motion/react';

// CountUp Component optimized to prevent unnecessary recalculations
function CountUp({ value, duration = 500, prefix = "", suffix = "" }: { value: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const endValue = value;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      setCount(Math.floor(easeProgress * endValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  // Indian Numbering System formatting (e.g., 1,24,500)
  const formatIndianNumber = (num: number) => {
    const numStr = num.toString();
    const lastThree = numStr.substring(numStr.length - 3);
    const otherNumbers = numStr.substring(0, numStr.length - 3);
    if (otherNumbers !== '') {
      return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
    }
    return lastThree;
  };

  return (
    <span>
      {prefix}
      {prefix === "₹" ? formatIndianNumber(count) : count}
      {suffix}
    </span>
  );
}

// Highly optimized, immediate performance skeleton loader
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 h-32 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-white/10 rounded" />
              <div className="h-5 w-12 bg-white/10 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-32 bg-white/15 rounded" />
              <div className="h-3 w-40 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-6 bg-white/4 border border-white/5 rounded-2xl p-6 h-80 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 w-36 bg-white/10 rounded" />
            <div className="h-3 w-56 bg-white/5 rounded" />
          </div>
          <div className="h-48 w-full bg-white/5 rounded-xl" />
        </div>
        <div className="lg:col-span-4 bg-white/4 border border-white/5 rounded-2xl p-6 h-80 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 w-44 bg-white/10 rounded" />
            <div className="h-3 w-32 bg-white/5 rounded" />
          </div>
          <div className="space-y-3 flex-1 mt-6">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-10 w-full bg-white/5 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate ultra-fast mock data retrieval to trigger visual animate-in transitions
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 240); // Fast transition to ensure structural shell paints instantly
    return () => clearTimeout(timer);
  }, []);

  // Sparkline static data for revenue card
  const sparklineData = [35, 45, 40, 55, 52, 65, 78, 72, 85];

  // Chart data: 6 Months Revenue vs Expenses (INR)
  const chartData = [
    { month: 'Jan', revenue: 165000, expenses: 110000 },
    { month: 'Feb', revenue: 185000, expenses: 130000 },
    { month: 'Mar', revenue: 210000, expenses: 145000 },
    { month: 'Apr', revenue: 195000, expenses: 138000 },
    { month: 'May', revenue: 245000, expenses: 155000 },
    { month: 'Jun', revenue: 284500, expenses: 172000 }
  ];

  // Interactive state for custom SVG chart
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Global Date States & Synchronization
  const [globalStartDate, setGlobalStartDate] = useState(() => localStorage.getItem('vanguard_global_start_date') || '');
  const [globalEndDate, setGlobalEndDate] = useState(() => localStorage.getItem('vanguard_global_end_date') || '');

  // Base raw shipments state loading dynamically
  const [rawShipments, setRawShipments] = useState<any[]>(() => {
    const saved = localStorage.getItem('vanguard_shipments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated = parsed.map((s: any) => {
            const clientName = s.clientName || s.client || s.companyName || 'Apex Foods International';
            const routeFrom = s.routeFrom || (s.route && s.route.split('→')[0].trim()) || 'Delhi';
            const routeTo = s.routeTo || (s.route && s.route.split('→')[1].trim()) || 'Mumbai';
            return {
              id: s.id || ('TRK-' + Math.floor(1000 + Math.random() * 9000)),
              client: clientName,
              route: `${routeFrom} → ${routeTo}`,
              truck: s.truckNo || s.truck || 'HR-55-A-8902',
              status: s.status || 'Pending Confirmation',
              rate: s.amount || s.rate || 45000,
              eta: s.status === 'Delivered' ? 'Completed' : (s.status === 'In Transit' ? '4h 12m' : 'Tomorrow'),
              pickupDate: s.pickupDate || '2026-07-06'
            };
          });
          const seen = new Set();
          return migrated.filter(s => {
            if (seen.has(s.id)) return false;
            seen.add(s.id);
            return true;
          });
        }
      } catch (e) {}
    }
    return [
      { id: 'LD-9821', client: 'Apex Foods', route: 'Delhi → Mumbai', truck: 'HR-55-A-8902', status: 'In Transit', eta: '4h 12m', rate: 24500, pickupDate: '2026-07-06' },
      { id: 'LD-8172', client: 'Titan Supply', route: 'Ahmedabad → Pune', truck: 'GJ-01-Y-4109', status: 'Loading', eta: 'Tomorrow', rate: 18200, pickupDate: '2026-07-07' },
      { id: 'LD-4029', client: 'Sharma Agri', route: 'Amritsar → Delhi', truck: 'PB-02-C-5231', status: 'Delivered', eta: 'Completed', rate: 14500, pickupDate: '2026-07-05' },
      { id: 'LD-5521', client: 'Noida Freight', route: 'Noida → Jaipur', truck: 'UP-16-T-9812', status: 'In Transit', eta: '1h 35m', rate: 12000, pickupDate: '2026-07-06' },
      { id: 'LD-3011', client: 'Vanguard Express', route: 'Indore → Gwalior', truck: 'MP-09-K-3341', status: 'Loading', eta: '3h', rate: 9800, pickupDate: '2026-07-03' }
    ];
  });

  useEffect(() => {
    const syncGlobalDates = () => {
      setGlobalStartDate(localStorage.getItem('vanguard_global_start_date') || '');
      setGlobalEndDate(localStorage.getItem('vanguard_global_end_date') || '');
      
      const saved = localStorage.getItem('vanguard_shipments');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const migrated = parsed.map((s: any) => {
              const clientName = s.clientName || s.client || s.companyName || 'Apex Foods International';
              const routeFrom = s.routeFrom || (s.route && s.route.split('→')[0].trim()) || 'Delhi';
              const routeTo = s.routeTo || (s.route && s.route.split('→')[1].trim()) || 'Mumbai';
              return {
                id: s.id || ('TRK-' + Math.floor(1000 + Math.random() * 9000)),
                client: clientName,
                route: `${routeFrom} → ${routeTo}`,
                truck: s.truckNo || s.truck || 'HR-55-A-8902',
                status: s.status || 'Pending Confirmation',
                rate: s.amount || s.rate || 45000,
                eta: s.status === 'Delivered' ? 'Completed' : (s.status === 'In Transit' ? '4h 12m' : 'Tomorrow'),
                pickupDate: s.pickupDate || '2026-07-06'
              };
            });
            const seen = new Set();
            const unique = migrated.filter(s => {
              if (seen.has(s.id)) return false;
              seen.add(s.id);
              return true;
            });
            setRawShipments(unique);
          }
        } catch (e) {}
      }
    };
    syncGlobalDates();
    window.addEventListener('vanguard-global-date-range-updated', syncGlobalDates);
    window.addEventListener('vanguard-shipments-updated', syncGlobalDates);
    return () => {
      window.removeEventListener('vanguard-global-date-range-updated', syncGlobalDates);
      window.removeEventListener('vanguard-shipments-updated', syncGlobalDates);
    };
  }, []);

  // Filter shipments based on active global date filters
  const shipments = useMemo(() => {
    return rawShipments.filter(s => {
      if (globalStartDate && s.pickupDate < globalStartDate) return false;
      if (globalEndDate && s.pickupDate > globalEndDate) return false;
      return true;
    });
  }, [rawShipments, globalStartDate, globalEndDate]);

  // Clients with Trip Count and Amounts (INR) computed dynamically
  const topClients = useMemo(() => {
    if (shipments.length > 0) {
      const clientsMap: Record<string, { name: string; trips: number; amount: number; initial: string; rating: string }> = {};
      shipments.forEach(s => {
        const name = s.client || 'Other Client';
        if (!clientsMap[name]) {
          clientsMap[name] = {
            name,
            trips: 0,
            amount: 0,
            initial: name.charAt(0),
            rating: 'A'
          };
        }
        clientsMap[name].trips += 1;
        clientsMap[name].amount += s.rate || 0;
      });

      const sorted = Object.values(clientsMap).sort((a, b) => b.amount - a.amount);
      return sorted.slice(0, 5).map((c, i) => {
        let rating = 'B';
        if (i === 0) rating = 'A+';
        else if (i === 1) rating = 'A';
        else if (i === 2) rating = 'A-';
        else if (i === 3) rating = 'B+';
        return { ...c, rating };
      });
    }
    return [
      { name: 'Apex Foods International', trips: 14, amount: 84500, initial: 'A', rating: 'A+' },
      { name: 'Titan Industrial Supply', trips: 9, amount: 56200, initial: 'T', rating: 'A' },
      { name: 'Noida Freight Carriers', trips: 8, amount: 48000, initial: 'N', rating: 'A' },
      { name: 'Sharma Agri Logistics', trips: 6, amount: 39500, initial: 'S', rating: 'B+' },
      { name: 'Vanguard Express Co.', trips: 5, amount: 32400, initial: 'V', rating: 'A' }
    ];
  }, [shipments]);

  // Dynamic calculations for stats cards
  const totalRevenue = useMemo(() => {
    if (globalStartDate || globalEndDate) {
      return shipments.reduce((sum, s) => s.status !== 'Cancelled' ? sum + s.rate : sum, 0);
    }
    return 284500; // default baseline matching initial static dashboard layout
  }, [shipments, globalStartDate, globalEndDate]);

  const netProfit = useMemo(() => {
    if (globalStartDate || globalEndDate) {
      return Math.round(totalRevenue * 0.682); // 68.2% margin matches initial static metrics
    }
    return 194200; // default baseline matching initial static dashboard layout
  }, [totalRevenue, globalStartDate, globalEndDate]);

  const activeShipmentsCount = useMemo(() => {
    if (globalStartDate || globalEndDate) {
      return shipments.filter(s => s.status === 'In Transit' || s.status === 'Booked' || s.status === 'Loading').length;
    }
    return 42; // default static baseline
  }, [shipments, globalStartDate, globalEndDate]);

  const activeInTransitCount = useMemo(() => {
    if (globalStartDate || globalEndDate) {
      return shipments.filter(s => s.status === 'In Transit').length;
    }
    return 26; // default static baseline
  }, [shipments, globalStartDate, globalEndDate]);

  const activeLoadingCount = useMemo(() => {
    if (globalStartDate || globalEndDate) {
      return shipments.filter(s => s.status === 'Booked' || s.status === 'Loading').length;
    }
    return 16; // default static baseline
  }, [shipments, globalStartDate, globalEndDate]);

  const pendingBookingsCount = useMemo(() => {
    if (globalStartDate || globalEndDate) {
      return shipments.filter(s => s.status === 'Pending Confirmation').length;
    }
    return 5; // default static baseline
  }, [shipments, globalStartDate, globalEndDate]);

  // Dispatcher Checklist
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Send dispatch invoice #1042 to Apex Foods', done: true, due: '09:30 AM', source: 'manual' },
    { id: 2, text: 'Confirm rate confirmation for Ahmedabad pickup', done: false, due: '11:00 AM', source: 'ai' },
    { id: 3, text: 'Verify driver hours (Roy Miller) via telematics portal', done: false, due: '01:30 PM', source: 'manual' },
    { id: 4, text: 'Check fuel surcharge adjustments for Noida loop', done: false, due: '03:00 PM', source: 'ai' }
  ]);

  // System log/activity feed matching WhatsApp parsed updates
  const recentActivity = [
    { id: 1, type: 'whatsapp', time: '10:02 AM', message: 'WhatsApp parse: Driver "Alex Singh" confirmed cargo loaded at Gurgaon warehouse. Status updated to Loading.' },
    { id: 2, type: 'system', time: '09:45 AM', message: 'Invoice #INV-4921 generated automatically and forwarded to billing portal for Apex Foods.' },
    { id: 3, type: 'telematics', time: '08:50 AM', message: 'Telematics alert: Truck GJ-01-Y-4109 geofence entered at Ahmedabad Hub.' },
    { id: 4, type: 'payment', time: 'Yesterday', message: 'Direct deposit cleared: ₹56,200 received from Titan Industrial Supply for Load #LD-7981.' }
  ];

  const handleToggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  // Helper to format Indian currency manually in other elements
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div id="premium-dashboard-container" className="space-y-6">
      
      {/* ==================== ROW 1: STATS GRID ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Revenue */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, delay: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-all duration-300 relative group overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.1)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/55">Total Revenue</span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <TrendingUp size={12} /> ▲ 14.2%
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-display font-bold text-white tracking-tight">
              <CountUp value={totalRevenue} prefix="₹" />
            </h4>
            <p className="text-[11px] text-white/40 mt-1">Operational gross in selected period</p>
          </div>
          {/* Subtle Sparkline design underneath */}
          <div className="mt-4 h-8 flex items-end gap-[3px] opacity-40 group-hover:opacity-75 transition-opacity duration-300">
            {sparklineData.map((val, i) => (
              <div 
                key={i} 
                className="flex-1 bg-[#D946C4] rounded-t-[2px]" 
                style={{ height: `${(val / 90) * 100}%` }}
              />
            ))}
          </div>
        </motion.div>

        {/* Card 2: Net Profit */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, delay: 0.03 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-all duration-300 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.1)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/55">Net Profit</span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <TrendingUp size={12} /> ▲ 11.5%
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-display font-bold text-white tracking-tight">
              <CountUp value={netProfit} prefix="₹" />
            </h4>
            <p className="text-[11px] text-white/45 mt-1">Estimated net profit after expenses</p>
          </div>
          {/* Subtle decoration lines */}
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tr from-[#D946C4]/5 to-transparent blur-2xl rounded-full" />
        </motion.div>

        {/* Card 3: Active Shipments */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, delay: 0.06 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-all duration-300 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.1)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/55">Active Shipments</span>
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
              <Truck size={15} />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-display font-bold text-white tracking-tight">
              <CountUp value={activeShipmentsCount} />
            </h4>
            <p className="text-[11px] text-white/45 mt-1">{activeInTransitCount} in transit, {activeLoadingCount} loading</p>
          </div>
        </motion.div>

        {/* Card 4: Pending Bookings */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, delay: 0.09 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-all duration-300 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.1)] ring-1 ring-[#D946C4]/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/55">Pending Bookings</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D946C4] animate-ping absolute" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#D946C4] relative" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-display font-bold text-white tracking-tight">
              <CountUp value={pendingBookingsCount} />
            </h4>
            <p className="text-[11px] text-[#D946C4]/80 mt-1 font-medium flex items-center gap-1">
              <AlertCircle size={11} /> {pendingBookingsCount} loads require dispatcher sign-off
            </p>
          </div>
        </motion.div>

      </div>

      {/* ==================== ROW 2: CHART & TOP CLIENTS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Left: Revenue vs Expenses SVG Custom Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
          className="lg:col-span-6 bg-white/4 border border-white/8 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] relative"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-display font-bold text-sm text-white">Revenue vs Expenses</h4>
              <p className="text-xs text-white/45">Historical cash flows for the last 6 months</p>
            </div>
            
            {/* Custom Dot Legend */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D946C4]" />
                <span className="text-white/70">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7C6FE0]" />
                <span className="text-white/70">Expenses</span>
              </div>
            </div>
          </div>

          {/* Interactive SVG Chart Container */}
          <div className="h-64 w-full relative pt-2">
            <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D946C4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#D946C4" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C6FE0" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#7C6FE0" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Minimal Gridlines */}
              <line x1="50" y1="30" x2="570" y2="30" stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
              <line x1="50" y1="80" x2="570" y2="80" stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
              <line x1="50" y1="130" x2="570" y2="130" stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
              <line x1="50" y1="180" x2="570" y2="180" stroke="rgba(255,255,255,0.06)" />

              {/* Area path for Revenue */}
              <path 
                d="M 50 180 Q 154 125, 258 110 T 466 70 T 570 50 L 570 180 Z" 
                fill="url(#revenueGrad)" 
              />
              {/* Line path for Revenue */}
              <path 
                d="M 50 180 Q 154 125, 258 110 T 466 70 T 570 50" 
                fill="none" 
                stroke="#D946C4" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />

              {/* Area path for Expenses */}
              <path 
                d="M 50 180 Q 154 150, 258 140 T 466 120 T 570 100 L 570 180 Z" 
                fill="url(#expenseGrad)" 
              />
              {/* Line path for Expenses */}
              <path 
                d="M 50 180 Q 154 150, 258 140 T 466 120 T 570 100" 
                fill="none" 
                stroke="#7C6FE0" 
                strokeWidth="2" 
                strokeLinecap="round"
                strokeDasharray="4,1"
              />

              {/* Interactive Hover Bar Zones */}
              {chartData.map((data, idx) => {
                const xPos = 50 + idx * 104;
                return (
                  <g key={idx}>
                    <rect 
                      x={xPos - 30} 
                      y="10" 
                      width="60" 
                      height="170" 
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    
                    {/* Hover highlights */}
                    {hoveredBar === idx && (
                      <>
                        <line x1={xPos} y1="20" x2={xPos} y2="180" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2,2" />
                        <circle cx={xPos} cy={idx === 5 ? 50 : 180 - (data.revenue / 300000) * 150} r="5" fill="#D946C4" stroke="#fff" strokeWidth="1.5" />
                        <circle cx={xPos} cy={idx === 5 ? 100 : 180 - (data.expenses / 300000) * 150} r="4" fill="#7C6FE0" stroke="#fff" strokeWidth="1.5" />
                      </>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Custom Tooltips Floating absolute */}
            {hoveredBar !== null && (
              <div 
                className="absolute bg-stone-950/95 p-3 rounded-xl border border-white/10 shadow-2xl text-[11px] pointer-events-none transition-all duration-150 z-30"
                style={{ 
                  left: `${5 + hoveredBar * 17}%`, 
                  top: '10px' 
                }}
              >
                <p className="font-semibold text-white mb-1.5 text-center border-b border-white/5 pb-1">{chartData[hoveredBar].month} Report</p>
                <div className="space-y-1">
                  <p className="flex justify-between gap-6 text-white/70">
                    <span>Revenue:</span>
                    <span className="font-mono text-[#D946C4] font-semibold">{formatINR(chartData[hoveredBar].revenue)}</span>
                  </p>
                  <p className="flex justify-between gap-6 text-white/70">
                    <span>Expenses:</span>
                    <span className="font-mono text-[#7C6FE0] font-semibold">{formatINR(chartData[hoveredBar].expenses)}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Month Labels underneath SVG */}
            <div className="flex justify-between pl-10 pr-6 mt-1 text-[10px] font-mono text-white/40">
              {chartData.map((d, i) => (
                <span key={i} className="w-12 text-center">{d.month}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: Top Clients Ranked List */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.14 }}
          className="lg:col-span-4 bg-white/4 border border-white/8 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex flex-col justify-between"
        >
          <div>
            <h4 className="font-display font-bold text-sm text-white">Top Clients This Month</h4>
            <p className="text-xs text-white/45 mb-4">Ranked by volume & billing</p>
            
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/3 border border-white/5 hover:bg-white/8 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#7C6FE0]/20 border border-[#7C6FE0]/30 flex items-center justify-center font-display font-bold text-[#7C6FE0] text-sm">
                      {client.initial}
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-white leading-none">{client.name}</h5>
                      <span className="text-[10px] text-white/40 mt-1 block">{client.trips} shipments completed</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white block">{formatINR(client.amount)}</span>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20 uppercase tracking-widest">{client.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[11px] font-semibold rounded-lg border border-white/5 transition-all text-center flex items-center justify-center gap-1">
            View full broker ledgers <ArrowUpRight size={12} />
          </button>
        </motion.div>

      </div>

      {/* ==================== ROW 3: SHIPMENTS & CHECKLIST ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Left: Active Shipments compact table */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="lg:col-span-6 bg-white/4 border border-white/8 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-display font-bold text-sm text-white">Active Dispatch Stream</h4>
              <p className="text-xs text-white/45">Current active freight under dispatch</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D946C4] animate-ping" />
              <span className="text-[10px] text-white/60 font-mono">Live updates</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {/* Desktop / Tablet Table */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="border-b border-white/10 text-[9px] font-mono uppercase tracking-wider text-white/40">
                  <th className="pb-3.5 pl-2">Load ID</th>
                  <th className="pb-3.5">Client & Route</th>
                  <th className="pb-3.5">Truck</th>
                  <th className="pb-3.5">Status</th>
                  <th className="pb-3.5 text-right pr-2">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-white/80 font-sans">
                {shipments.map((ship) => (
                  <tr key={ship.id} className="hover:bg-white/3 transition-colors group">
                    <td className="py-3.5 pl-2 font-mono text-[#D946C4] font-semibold">{ship.id}</td>
                    <td className="py-3.5 pr-2">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        {ship.client}
                      </div>
                      <div className="text-[10px] text-white/40 mt-0.5 flex items-center gap-1">
                        <span>{ship.route.split('→')[0].trim()}</span>
                        <ArrowRight size={10} className="text-white/20" />
                        <span>{ship.route.split('→')[1].trim()}</span>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-[11px] text-white/60">{ship.truck}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border ${
                        ship.status === 'In Transit' 
                          ? 'bg-[#D946C4]/10 text-[#D946C4] border-[#D946C4]/25' 
                          : ship.status === 'Loading' 
                          ? 'bg-blue-500/10 text-blue-300 border-blue-500/25' 
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                      }`}>
                        {ship.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono text-[11px] text-white/70 pr-2 group-hover:text-white transition-colors">
                      {ship.eta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Stacked Card format */}
            <div className="md:hidden space-y-3">
              {shipments.map((ship) => (
                <div key={ship.id} className="p-3.5 bg-white/3 border border-white/5 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#D946C4] font-semibold">{ship.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border ${
                      ship.status === 'In Transit' 
                        ? 'bg-[#D946C4]/10 text-[#D946C4] border-[#D946C4]/25' 
                        : ship.status === 'Loading' 
                        ? 'bg-blue-500/10 text-blue-300 border-blue-500/25' 
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                    }`}>
                      {ship.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white">{ship.client}</p>
                    <p className="text-[11px] text-white/50 flex items-center gap-1">
                      <span>{ship.route.split('→')[0].trim()}</span>
                      <ArrowRight size={10} className="text-white/20" />
                      <span>{ship.route.split('→')[1].trim()}</span>
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-white/5">
                    <span className="font-mono text-white/40">Truck: <span className="text-white/70">{ship.truck}</span></span>
                    <span className="font-mono text-white/40">ETA: <span className="text-white/80 font-bold">{ship.eta}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: Dispatcher Tasks Checklist */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18 }}
          className="lg:col-span-4 bg-white/4 border border-white/8 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                  <CheckSquare size={16} className="text-[#D946C4]" /> Dispatcher Queue
                </h4>
                <p className="text-xs text-white/45">Action items for dispatcher attention</p>
              </div>
              <button className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/5">
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/6 cursor-pointer transition-colors duration-200"
                >
                  <input
                    id={`dashboard-task-${task.id}`}
                    type="checkbox"
                    checked={task.done}
                    onChange={() => {}} // Controlled click via parent div
                    className="mt-0.5 rounded border-white/10 text-[#D946C4] bg-white/5 focus:ring-[#D946C4]/50"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs text-white font-medium ${task.done ? 'line-through text-white/40' : ''}`}>
                      {task.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-white/40 font-mono">
                      <span className="flex items-center gap-1"><Clock size={10} /> Due {task.due}</span>
                      <span>•</span>
                      {task.source === 'ai' ? (
                        <span className="flex items-center gap-0.5 text-[#D946C4] font-semibold"><Sparkles size={9} /> AI Dispatch</span>
                      ) : (
                        <span>Manual</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-[11px] text-white/40 font-mono">
            <span>{tasks.filter(t => !t.done).length} active items pending</span>
            <span className="text-[#D946C4] hover:underline cursor-pointer">Clear completed</span>
          </div>
        </motion.div>

      </div>

      {/* ==================== ROW 4: RECENT ACTIVITY TIMELINE ==================== */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white/4 border border-white/8 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
      >
        <div className="mb-4">
          <h4 className="font-display font-bold text-sm text-white">Automated Activity Feed</h4>
          <p className="text-xs text-white/45">WhatsApp OCR parsing, telematics event triggers, and financial entries</p>
        </div>

        <div className="space-y-3.5 relative before:absolute before:inset-y-1 before:left-3 before:w-[1px] before:bg-white/10">
          {recentActivity.map((act) => (
            <div key={act.id} className="flex items-start gap-4 relative z-10 pl-1 group">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-stone-900 border ${
                act.type === 'whatsapp' 
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' 
                  : act.type === 'telematics' 
                  ? 'bg-blue-500/20 border-blue-400 text-blue-400' 
                  : act.type === 'payment'
                  ? 'bg-[#7C6FE0]/20 border-[#7C6FE0] text-[#7C6FE0]'
                  : 'bg-white/10 border-white/30 text-white/60'
              }`}>
                {act.type === 'whatsapp' && <MessageSquare size={8} />}
                {act.type === 'telematics' && <Truck size={8} />}
                {act.type === 'payment' && <TrendingUp size={8} />}
                {act.type === 'system' && <CheckCircle2 size={8} />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold uppercase ${
                    act.type === 'whatsapp' ? 'text-emerald-400' :
                    act.type === 'telematics' ? 'text-blue-400' :
                    act.type === 'payment' ? 'text-[#7C6FE0]' : 'text-white/50'
                  }`}>
                    {act.type}
                  </span>
                  <span className="text-[9px] font-mono text-white/30">{act.time}</span>
                </div>
                <p className="text-xs text-white/80 mt-0.5 font-sans leading-relaxed group-hover:text-white transition-colors">
                  {act.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
