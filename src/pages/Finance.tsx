import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  ArrowUpRight, 
  Tag, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Sparkles, 
  DollarSign,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle,
  Briefcase,
  Layers,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// CountUp Component customized for Indian Numbering System
function CountUp({ value, duration = 600, prefix = "", suffix = "" }: { value: number; duration?: number; prefix?: string; suffix?: string }) {
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

// Interfaces
interface Transaction {
  id: string;
  date: string;
  type: 'Income' | 'Expense';
  category: string;
  description: string;
  relatedShipment?: string;
  amount: number;
}

interface ShipmentProfitability {
  id: string;
  client: string;
  route: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
}

export default function Finance() {
  // 1. Initial State for Transactions (incorporating Indian freight scenarios)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('vanguard_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    const initialList: Transaction[] = [
      { id: 'TXN-101', date: '2026-07-06', type: 'Income', category: 'Freight Revenue', description: 'Apex Foods Delhi-Mumbai load complete', relatedShipment: 'LD-9821', amount: 57820 },
      { id: 'TXN-102', date: '2026-07-06', type: 'Expense', category: 'Fuel', description: 'Gurgaon HP Fuel Station - Surcharge refill', relatedShipment: 'LD-9821', amount: 12500 },
      { id: 'TXN-103', date: '2026-07-05', type: 'Expense', category: 'Driver Payment', description: 'Driver allowance & food: Alex Singh', relatedShipment: 'LD-9821', amount: 8000 },
      { id: 'TXN-104', date: '2026-07-05', type: 'Expense', category: 'Tolls & Permits', description: 'NH48 Toll Fastag Auto-debit', relatedShipment: 'LD-9821', amount: 1500 },
      { id: 'TXN-105', date: '2026-07-05', type: 'Income', category: 'Freight Revenue', description: 'Titan Supply Ahmedabad-Pune advance', relatedShipment: 'LD-8172', amount: 38000 },
      { id: 'TXN-106', date: '2026-07-04', type: 'Expense', category: 'Fuel', description: 'Gujarat Petro Fuel card topup', relatedShipment: 'LD-8172', amount: 11000 },
      { id: 'TXN-107', date: '2026-07-04', type: 'Expense', category: 'Driver Payment', description: 'Bilty advance: Gurpreet Singh', relatedShipment: 'LD-8172', amount: 7500 },
      { id: 'TXN-108', date: '2026-07-04', type: 'Expense', category: 'Tolls & Permits', description: 'Mumbai-Pune Expressway toll charge', relatedShipment: 'LD-8172', amount: 2200 },
      { id: 'TXN-109', date: '2026-07-03', type: 'Income', category: 'Freight Revenue', description: 'Sharma Agri Amritsar-Delhi complete delivery', relatedShipment: 'LD-4029', amount: 32000 },
      { id: 'TXN-110', date: '2026-07-02', type: 'Expense', category: 'Driver Payment', description: 'Mandi runner payment - Rajinder Pal', relatedShipment: 'LD-4029', amount: 6000 },
      { id: 'TXN-111', date: '2026-07-02', type: 'Expense', category: 'Maintenance', description: 'Engine Oil & Filter Change (Tata Prima)', relatedShipment: 'LD-4029', amount: 4500 },
      { id: 'TXN-112', date: '2026-07-02', type: 'Expense', category: 'Tolls & Permits', description: 'Azadpur Entry Permit Surcharge', relatedShipment: 'LD-4029', amount: 1200 },
      { id: 'TXN-113', date: '2026-07-01', type: 'Income', category: 'Freight Revenue', description: 'Noida Freight Polymers Jaipur route', relatedShipment: 'LD-5521', amount: 30000 },
      { id: 'TXN-114', date: '2026-06-30', type: 'Expense', category: 'Driver Payment', description: 'Trip payout: Devender Kumar', relatedShipment: 'LD-5521', amount: 5500 },
      { id: 'TXN-115', date: '2026-06-29', type: 'Expense', category: 'Loading/Unloading', description: 'Noida Phase 3 Loading crane surcharge', relatedShipment: 'LD-5521', amount: 1500 },
      { id: 'TXN-116', date: '2026-06-29', type: 'Expense', category: 'Tolls & Permits', description: 'State barrier tax - Jaipur border', relatedShipment: 'LD-5521', amount: 1000 },
      { id: 'TXN-117', date: '2026-06-28', type: 'Income', category: 'Freight Revenue', description: 'Vanguard Express Indore-Gwalior FMCG delivery', relatedShipment: 'LD-3011', amount: 32400 },
      { id: 'TXN-118', date: '2026-06-27', type: 'Expense', category: 'Fuel', description: 'Indore Bypass BPCL diesel fill', relatedShipment: 'LD-3011', amount: 10200 },
      { id: 'TXN-119', date: '2026-06-27', type: 'Expense', category: 'Driver Payment', description: 'Standard trip allowance - Madan Lal', relatedShipment: 'LD-3011', amount: 5800 },
      { id: 'TXN-120', date: '2026-06-26', type: 'Expense', category: 'Other', description: 'Driver night stay tea & snack expenses', relatedShipment: 'LD-3011', amount: 800 }
    ];
    localStorage.setItem('vanguard_transactions', JSON.stringify(initialList));
    return initialList;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('vanguard_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Synchronize when transaction additions or modifications occur from the background
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('vanguard_transactions');
      if (saved) {
        try { setTransactions(JSON.parse(saved)); } catch (e) {}
      }
    };
    window.addEventListener('vanguard-finance-updated', handleSync);
    return () => window.removeEventListener('vanguard-finance-updated', handleSync);
  }, []);

  // Static Shipments Reference (matches existing shipments list across the app)
  const shipmentRef = useMemo(() => [
    { id: 'LD-9821', client: 'Apex Foods International', route: 'Delhi → Mumbai' },
    { id: 'LD-8172', client: 'Titan Industrial Supply', route: 'Ahmedabad → Pune' },
    { id: 'LD-4029', client: 'Sharma Agri Logistics', route: 'Amritsar → Delhi' },
    { id: 'LD-5521', client: 'Noida Freight Carriers', route: 'Noida → Jaipur' },
    { id: 'LD-3011', client: 'Vanguard Express Co.', route: 'Indore → Gwalior' }
  ], []);

  // 2. Navigation & View settings
  const [dateRange, setDateRange] = useState<'This Month' | 'Last Month' | 'Last 3 Months' | 'Custom'>('This Month');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 3. Ledger Search, Filter & Pagination states
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'All' | 'Income' | 'Expense'>('All');
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState('All');
  const [ledgerPage, setLedgerPage] = useState(1);
  const itemsPerPage = 6;

  // 4. Shipment Profitability Sort settings
  const [shipmentSortKey, setShipmentSortKey] = useState<keyof ShipmentProfitability>('profit');
  const [shipmentSortDirection, setShipmentSortDirection] = useState<'asc' | 'desc'>('desc');

  // 5. Active Hover states for charts
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);
  const [hoveredDonutIdx, setHoveredDonutIdx] = useState<number | null>(null);

  // Toast Notification triggered on adding transaction
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 6. Form state for new transaction
  const [formType, setFormType] = useState<'Income' | 'Expense'>('Expense');
  const [formCategory, setFormCategory] = useState('Fuel');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState('2026-07-06');
  const [formDescription, setFormDescription] = useState('');
  const [formShipment, setFormShipment] = useState('');

  // Auto categories list depending on Type
  const expenseCategories = ['Fuel', 'Driver Payment', 'Tolls & Permits', 'Maintenance', 'Loading/Unloading', 'Other'];
  const incomeCategories = ['Freight Revenue', 'Surcharge / Loading Fee', 'Other Income'];

  // Set default category when formType toggles
  useEffect(() => {
    setFormCategory(formType === 'Expense' ? 'Fuel' : 'Freight Revenue');
  }, [formType]);

  // Indian Currency display formatter
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Global Date States & Synchronization
  const [globalStartDate, setGlobalStartDate] = useState(() => localStorage.getItem('vanguard_global_start_date') || '');
  const [globalEndDate, setGlobalEndDate] = useState(() => localStorage.getItem('vanguard_global_end_date') || '');

  useEffect(() => {
    const syncGlobalDates = () => {
      setGlobalStartDate(localStorage.getItem('vanguard_global_start_date') || '');
      setGlobalEndDate(localStorage.getItem('vanguard_global_end_date') || '');
    };
    syncGlobalDates();
    window.addEventListener('vanguard-global-date-range-updated', syncGlobalDates);
    return () => window.removeEventListener('vanguard-global-date-range-updated', syncGlobalDates);
  }, []);

  // 7. Computed Stats based on Transactions and Date Range
  const filteredTransactionsByDate = useMemo(() => {
    return transactions.filter(t => {
      // Apply global date filters first if any of them are active
      if (globalStartDate && t.date < globalStartDate) return false;
      if (globalEndDate && t.date > globalEndDate) return false;
      if (globalStartDate || globalEndDate) return true; // if global filters are applied, bypass local dateRange preset

      const tDate = new Date(t.date);
      const today = new Date('2026-07-06');
      
      if (dateRange === 'This Month') {
        return tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear();
      } else if (dateRange === 'Last Month') {
        const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
        const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
        return tDate.getMonth() === lastMonth && tDate.getFullYear() === lastMonthYear;
      } else if (dateRange === 'Last 3 Months') {
        const cutOffDate = new Date(today);
        cutOffDate.setMonth(today.getMonth() - 3);
        return tDate >= cutOffDate;
      }
      return true; // "Custom" or default to show all in mock view
    });
  }, [transactions, dateRange, globalStartDate, globalEndDate]);

  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;

    filteredTransactionsByDate.forEach(t => {
      if (t.type === 'Income') {
        income += t.amount;
      } else {
        expenses += t.amount;
      }
    });

    const netProfit = income - expenses;
    const margin = income > 0 ? Math.round((netProfit / income) * 100) : 0;

    return {
      income,
      expenses,
      netProfit,
      margin
    };
  }, [filteredTransactionsByDate]);

  // Static Monthly Breakdown (Jan - Jun) for line chart, computing live updates for Jul
  const monthlyData = useMemo(() => {
    // Standard baseline
    const base = [
      { month: 'Jan', income: 165000, expenses: 110000 },
      { month: 'Feb', income: 185000, expenses: 130000 },
      { month: 'Mar', income: 210000, expenses: 145000 },
      { month: 'Apr', income: 195000, expenses: 138000 },
      { month: 'May', income: 245000, expenses: 155000 },
      { month: 'Jun', income: 284500, expenses: 172000 }
    ];

    // Compute live July parameters from transactions
    let julIncome = 0;
    let julExpenses = 0;
    transactions.forEach(t => {
      const date = new Date(t.date);
      if (date.getMonth() === 6 && date.getFullYear() === 2026) { // July (Month index 6)
        if (t.type === 'Income') julIncome += t.amount;
        else julExpenses += t.amount;
      }
    });

    return [...base, { month: 'Jul', income: julIncome || 190220, expenses: julExpenses || 116200 }];
  }, [transactions]);

  // 8. Expense Category Breakdown for Donut Chart
  const categoryBreakdown = useMemo(() => {
    const categories: Record<string, number> = {
      'Fuel': 0,
      'Driver Payment': 0,
      'Tolls & Permits': 0,
      'Maintenance': 0,
      'Loading/Unloading': 0,
      'Other': 0
    };

    filteredTransactionsByDate.forEach(t => {
      if (t.type === 'Expense') {
        const cat = t.category;
        if (categories[cat] !== undefined) {
          categories[cat] += t.amount;
        } else {
          categories['Other'] += t.amount;
        }
      }
    });

    const totalExp = Object.values(categories).reduce((a, b) => a + b, 0);

    const colors = [
      '#e07a5f', // terracotta (Fuel)
      '#f2cc8f', // clay-yellow (Driver Payment)
      '#81b29a', // soft-sage (Tolls)
      '#3d5a80', // ocean slate (Maintenance)
      '#98c1d9', // dusty blue (Loading)
      '#b5838d'  // muted rose (Other)
    ];

    return Object.entries(categories).map(([name, amount], idx) => ({
      name,
      amount,
      percentage: totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0,
      color: colors[idx % colors.length]
    })).filter(c => c.amount > 0 || totalExp === 0);
  }, [filteredTransactionsByDate]);

  // Total expense sum
  const totalExpenseSum = useMemo(() => {
    return categoryBreakdown.reduce((acc, curr) => acc + curr.amount, 0);
  }, [categoryBreakdown]);

  // 9. Shipment Profitability Calculations
  const shipmentProfitabilityList = useMemo(() => {
    return shipmentRef.map(shipment => {
      // Find all transactions linked to this shipment
      const linked = transactions.filter(t => t.relatedShipment === shipment.id);
      
      let revenue = 0;
      let expenses = 0;

      linked.forEach(t => {
        if (t.type === 'Income') revenue += t.amount;
        else expenses += t.amount;
      });

      const profit = revenue - expenses;
      const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

      return {
        id: shipment.id,
        client: shipment.client,
        route: shipment.route,
        revenue,
        expenses,
        profit,
        margin
      };
    });
  }, [transactions, shipmentRef]);

  // Sorted Shipment Profitability list
  const sortedShipmentProfitability = useMemo(() => {
    return [...shipmentProfitabilityList].sort((a, b) => {
      const valA = a[shipmentSortKey];
      const valB = b[shipmentSortKey];
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return shipmentSortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
      
      // Numbers
      return shipmentSortDirection === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
  }, [shipmentProfitabilityList, shipmentSortKey, shipmentSortDirection]);

  // Handle Shipment Profitability sorting toggle
  const handleSort = (key: keyof ShipmentProfitability) => {
    if (shipmentSortKey === key) {
      setShipmentSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setShipmentSortKey(key);
      setShipmentSortDirection('desc');
    }
  };

  // 10. Ledger Filtering & Searching
  const ledgerCategories = useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach(t => cats.add(t.category));
    return ['All', ...Array.from(cats)];
  }, [transactions]);

  const filteredLedger = useMemo(() => {
    return transactions.filter(t => {
      // Type filter
      if (ledgerTypeFilter !== 'All' && t.type !== ledgerTypeFilter) return false;

      // Category filter
      if (ledgerCategoryFilter !== 'All' && t.category !== ledgerCategoryFilter) return false;

      // Search query
      if (ledgerSearch.trim() !== '') {
        const query = ledgerSearch.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesCat = t.category.toLowerCase().includes(query);
        const matchesShipment = t.relatedShipment?.toLowerCase().includes(query) || false;
        return matchesDesc || matchesCat || matchesShipment;
      }

      return true;
    });
  }, [transactions, ledgerTypeFilter, ledgerCategoryFilter, ledgerSearch]);

  // Ledger Pagination Calculations
  const totalLedgerPages = Math.ceil(filteredLedger.length / itemsPerPage) || 1;
  const paginatedLedger = useMemo(() => {
    const startIdx = (ledgerPage - 1) * itemsPerPage;
    return filteredLedger.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredLedger, ledgerPage]);

  // Reset pagination page when filters change
  useEffect(() => {
    setLedgerPage(1);
  }, [ledgerTypeFilter, ledgerCategoryFilter, ledgerSearch]);

  // 11. Add Transaction Form Submission
  const handleAddTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    const newTxn: Transaction = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      date: formDate,
      type: formType,
      category: formCategory,
      description: formDescription || `${formCategory} transaction`,
      amount: parsedAmount,
      relatedShipment: formShipment || undefined
    };

    setTransactions(prev => [newTxn, ...prev]);
    setIsAddModalOpen(false);
    
    // Clear Form
    setFormAmount('');
    setFormDescription('');
    setFormShipment('');

    // Trigger toast message
    setToastMessage(`Successfully added ${formType} transaction: ₹${parsedAmount.toLocaleString('en-IN')}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div id="finance-tab-view" className="space-y-6 flex flex-col flex-1 pb-16 relative">
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-stone-900 border border-emerald-500/30 text-white rounded-xl px-4 py-3.5 shadow-2xl flex items-center gap-3 z-50 w-full max-w-sm"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle size={13} />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-emerald-400">Transaction Added</p>
              <p className="text-[10px] text-white/50 mt-0.5">{toastMessage}</p>
            </div>
            <button 
              onClick={() => setToastMessage(null)} 
              className="ml-auto text-white/30 hover:text-white p-0.5"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 1. HEADER ROW ==================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-white tracking-tight flex items-center gap-2">
            Finance
            <span className="text-[10px] font-mono font-semibold bg-[#D946C4]/10 border border-[#D946C4]/20 text-[#D946C4] px-2 py-0.5 rounded uppercase tracking-wider">
              BETA
            </span>
          </h1>
          <p className="text-xs text-white/50 font-sans">Income, expenses & profit matrix</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Frosted Date dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs px-4 h-9 rounded-xl flex items-center gap-2 transition-all cursor-pointer font-medium font-sans"
            >
              <Calendar size={13} className="text-white/40" />
              <span>{dateRange}</span>
              <span className="text-[9px] text-white/40 font-mono">▼</span>
            </button>

            {isDateDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDateDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-stone-900/95 border border-white/10 rounded-xl shadow-2xl p-1 z-20 backdrop-blur-xl animate-fade-in">
                  {(['This Month', 'Last Month', 'Last 3 Months', 'Custom'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setDateRange(range);
                        setIsDateDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors block cursor-pointer ${
                        dateRange === range 
                          ? 'bg-[#D946C4] text-white font-semibold' 
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Primary CTA: Add Transaction Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 h-9 bg-[#D946C4] hover:bg-[#D946C4]/80 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-[#D946C4]/10 active:scale-95 cursor-pointer font-sans"
          >
            <Plus size={14} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* ==================== 2. TOP STAT ROW (4 cards) ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Income */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-5 hover:bg-white/6 transition-all duration-300 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/45">Total Income</span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <TrendingUp size={11} /> ▲ 12.4%
            </span>
          </div>
          <div className="mt-3">
            <h4 className="text-2xl font-bold text-white tracking-tight font-display">
              <CountUp value={stats.income} prefix="₹" />
            </h4>
            <p className="text-[10px] text-white/40 mt-1">Sourced from active delivery slips</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-5 hover:bg-white/6 transition-all duration-300 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/45">Total Expenses</span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <TrendingDown size={11} /> ▲ 4.1%
            </span>
          </div>
          <div className="mt-3">
            <h4 className="text-2xl font-bold text-white/90 tracking-tight font-display">
              <CountUp value={stats.expenses} prefix="₹" />
            </h4>
            <p className="text-[10px] text-white/40 mt-1">Fuel, driver payout, tolls, service</p>
          </div>
        </div>

        {/* HERO CARD: Net Profit (Signal Violet highlighted with a subtle glow) */}
        <div className="bg-gradient-to-br from-[#D946C4]/10 to-stone-900/10 border border-[#D946C4]/35 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_20px_rgba(217,70,196,0.06)] hover:border-[#D946C4] transition-all duration-300">
          {/* Subtle back glowing circle */}
          <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-[#D946C4]/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-center relative z-10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#D946C4] font-semibold flex items-center gap-1">
              <Sparkles size={11} className="text-[#D946C4]" />
              Net Profit
            </span>
            <span className="text-[9px] font-mono bg-[#D946C4] text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">
              HERO
            </span>
          </div>
          <div className="mt-3 relative z-10">
            <h4 className="text-2xl font-extrabold text-[#D946C4] tracking-tight font-display text-shadow-glow">
              <CountUp value={stats.netProfit} prefix="₹" />
            </h4>
            <p className="text-[10px] text-white/50 mt-1">Operational surplus before taxes</p>
          </div>
        </div>

        {/* Profit Margin % */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-5 hover:bg-white/6 transition-all duration-300 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/45">Profit Margin</span>
            <div className="text-[10px] text-white/40 font-mono">
              Margin Metric
            </div>
          </div>
          <div className="mt-3">
            <h4 className="text-2xl font-bold text-white tracking-tight font-display">
              <CountUp value={stats.margin} suffix="%" />
            </h4>
            <p className="text-[10px] text-white/40 mt-1">Computed as: <span className="font-mono text-white/50">profit ÷ income</span></p>
          </div>
        </div>

      </div>

      {/* ==================== 3. SECOND ROW — SPLIT PANELS (Charts) ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* LEFT CHART (~55% width / 5.5 cols): Income vs Expenses Line Chart */}
        <div className="lg:col-span-6 bg-white/4 border border-white/8 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-display font-bold text-sm text-white">Income vs Expenses Over Time</h4>
                <p className="text-xs text-white/45">Historical cash flows for the last 7 months</p>
              </div>
              
              {/* Custom Legend */}
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#D946C4]" />
                  <span className="text-white/65">Income</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#7C6FE0]" />
                  <span className="text-white/65">Expenses</span>
                </div>
              </div>
            </div>

            {/* Interactive Custom SVG Chart */}
            <div className="h-60 w-full relative pt-2">
              <svg className="w-full h-full" viewBox="0 0 600 210" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D946C4" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#D946C4" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C6FE0" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#7C6FE0" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Minimal Gridlines */}
                <line x1="40" y1="20" x2="570" y2="20" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
                <line x1="40" y1="70" x2="570" y2="70" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
                <line x1="40" y1="120" x2="570" y2="120" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
                <line x1="40" y1="170" x2="570" y2="170" stroke="rgba(255,255,255,0.05)" />

                {/* Area under Income Path */}
                {/* Points roughly calculated for [165k, 185k, 210k, 195k, 245k, 284k, julLive] */}
                <path 
                  d="M 40 170 Q 128 115, 216 100 T 392 80 T 568 45 L 568 170 Z" 
                  fill="url(#incomeGrad)" 
                />
                <path 
                  d="M 40 170 Q 128 115, 216 100 T 392 80 T 568 45" 
                  fill="none" 
                  stroke="#D946C4" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />

                {/* Area under Expense Path */}
                {/* Points roughly calculated for [110k, 130k, 145k, 138k, 155k, 172k, julLive] */}
                <path 
                  d="M 40 170 Q 128 140, 216 130 T 392 120 T 568 95 L 568 170 Z" 
                  fill="url(#expenseGrad)" 
                />
                <path 
                  d="M 40 170 Q 128 140, 216 130 T 392 120 T 568 95" 
                  fill="none" 
                  stroke="#7C6FE0" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  strokeDasharray="4,1"
                />

                {/* Vertical hover zones */}
                {monthlyData.map((data, idx) => {
                  const xPos = 40 + idx * 88;
                  return (
                    <g key={idx}>
                      <rect 
                        x={xPos - 25} 
                        y="10" 
                        width="50" 
                        height="160" 
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredMonthIdx(idx)}
                        onMouseLeave={() => setHoveredMonthIdx(null)}
                      />
                      
                      {hoveredMonthIdx === idx && (
                        <>
                          <line x1={xPos} y1="15" x2={xPos} y2="170" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2,2" />
                          <circle cx={xPos} cy={170 - (data.income / 320000) * 140} r="5" fill="#D946C4" stroke="#fff" strokeWidth="1.5" />
                          <circle cx={xPos} cy={170 - (data.expenses / 320000) * 140} r="4" fill="#7C6FE0" stroke="#fff" strokeWidth="1.5" />
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip inside container */}
              {hoveredMonthIdx !== null && (
                <div 
                  className="absolute bg-stone-950/95 p-3 rounded-xl border border-white/10 shadow-2xl text-[11px] pointer-events-none transition-all duration-150 z-30"
                  style={{ 
                    left: `${Math.min(75, 4 + hoveredMonthIdx * 14.5)}%`, 
                    top: '20px' 
                  }}
                >
                  <p className="font-semibold text-white mb-1.5 text-center border-b border-white/5 pb-1">{monthlyData[hoveredMonthIdx].month} Report</p>
                  <div className="space-y-1">
                    <p className="flex justify-between gap-6 text-white/70">
                      <span>Total Income:</span>
                      <span className="font-mono text-[#D946C4] font-semibold">{formatINR(monthlyData[hoveredMonthIdx].income)}</span>
                    </p>
                    <p className="flex justify-between gap-6 text-white/70">
                      <span>Total Expenses:</span>
                      <span className="font-mono text-[#7C6FE0] font-semibold">{formatINR(monthlyData[hoveredMonthIdx].expenses)}</span>
                    </p>
                    <p className="flex justify-between gap-6 text-white/70 border-t border-white/5 pt-1 mt-1">
                      <span>Net profit:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {formatINR(monthlyData[hoveredMonthIdx].income - monthlyData[hoveredMonthIdx].expenses)}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Month Labels */}
              <div className="flex justify-between pl-8 pr-4 mt-1 text-[9px] font-mono text-white/35">
                {monthlyData.map((d, i) => (
                  <span key={i} className="w-10 text-center">{d.month}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CHART (~45% width / 4 cols): Expense Breakdown Donut Chart */}
        <div className="lg:col-span-4 bg-white/4 border border-white/8 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex flex-col justify-between">
          <div>
            <h4 className="font-display font-bold text-sm text-white">Expense Breakdown</h4>
            <p className="text-xs text-white/45 mb-4">Breakdown of operational spend</p>

            <div className="flex items-center gap-6">
              {/* SVG Donut */}
              <div className="w-32 h-32 relative flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background track */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    fill="transparent" 
                    stroke="rgba(255,255,255,0.03)" 
                    strokeWidth="10" 
                  />

                  {/* Draw segments dynamically */}
                  {(() => {
                    let cumulativePercentage = 0;
                    return categoryBreakdown.map((item, idx) => {
                      const strokeDash = 2 * Math.PI * 38; // ~238.76
                      const offset = strokeDash - (item.percentage / 100) * strokeDash;
                      const rotation = (cumulativePercentage / 100) * 360;
                      cumulativePercentage += item.percentage;

                      const isHovered = hoveredDonutIdx === idx;

                      return (
                        <circle 
                          key={item.name}
                          cx="50" 
                          cy="50" 
                          r="38" 
                          fill="transparent" 
                          stroke={item.color} 
                          strokeWidth={isHovered ? "13" : "10"} 
                          strokeDasharray={strokeDash}
                          strokeDashoffset={offset}
                          transform={`rotate(${rotation} 50 50)`}
                          className="transition-all duration-300 cursor-pointer"
                          style={{ strokeLinecap: 'butt' }}
                          onMouseEnter={() => setHoveredDonutIdx(idx)}
                          onMouseLeave={() => setHoveredDonutIdx(null)}
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Center text indicating hover item or total */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  {hoveredDonutIdx !== null ? (
                    <>
                      <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest text-center truncate max-w-[80px]">
                        {categoryBreakdown[hoveredDonutIdx].name}
                      </span>
                      <span className="text-sm font-bold text-white font-mono mt-0.5">
                        {categoryBreakdown[hoveredDonutIdx].percentage}%
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[8px] font-mono text-white/35 uppercase tracking-widest">Total Spend</span>
                      <span className="text-[11px] font-bold text-white/90 font-mono mt-0.5">
                        {formatINR(totalExpenseSum)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Small Category List */}
              <div className="flex-1 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {categoryBreakdown.map((item, idx) => (
                  <div 
                    key={item.name} 
                    className={`flex items-center justify-between text-xs p-1 rounded transition-colors ${
                      hoveredDonutIdx === idx ? 'bg-white/5' : ''
                    }`}
                    onMouseEnter={() => setHoveredDonutIdx(idx)}
                    onMouseLeave={() => setHoveredDonutIdx(null)}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-white/70 truncate">{item.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-white/40 ml-2">
                      ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>

          <div className="border-t border-white/5 pt-3 mt-4 text-[10px] text-white/40 flex items-center gap-1.5">
            <Info size={11} className="text-[#D946C4]" />
            <span>Hover segments to drill into specific expense codes.</span>
          </div>
        </div>

      </div>

      {/* ==================== 4. THIRD ROW — PER-SHIPMENT PROFITABILITY ==================== */}
      <div className="bg-white/4 border border-white/8 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
              Per-Shipment Profitability Analysis
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-normal">
                Auto Calculated
              </span>
            </h3>
            <p className="text-xs text-white/45">Real-time lane profitability margins</p>
          </div>
          <div className="text-[10px] text-white/40 font-mono italic">
            Sorted by {shipmentSortKey.toUpperCase()} ({shipmentSortDirection.toUpperCase()})
          </div>
        </div>

        {/* Scrollable table container */}
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-stone-950/20">
          {/* Desktop/Tablet Table */}
          <table className="w-full text-left border-collapse hidden md:table">
            <thead>
              <tr className="bg-white/2 border-b border-white/5 text-[10px] font-mono text-white/45 uppercase tracking-wider select-none">
                <th className="py-3 px-4 font-normal">ID</th>
                <th className="py-3 px-4 font-normal">Client Account</th>
                <th className="py-3 px-4 font-normal">Route / Lane</th>
                <th 
                  className="py-3 px-4 text-right font-normal cursor-pointer hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => handleSort('revenue')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Revenue (₹)</span>
                    <ArrowUpDown size={10} className="opacity-50" />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-right font-normal cursor-pointer hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => handleSort('expenses')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Expenses (₹)</span>
                    <ArrowUpDown size={10} className="opacity-50" />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-right font-semibold cursor-pointer hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => handleSort('profit')}
                >
                  <div className="flex items-center justify-end gap-1 text-[#D946C4]">
                    <span>Net Profit (₹)</span>
                    <ArrowUpDown size={10} className="opacity-50" />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-right font-normal cursor-pointer hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => handleSort('margin')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Margin %</span>
                    <ArrowUpDown size={10} className="opacity-50" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-white">
              <AnimatePresence mode="popLayout">
                {sortedShipmentProfitability.map((ship, index) => {
                  // Color codes: green if above 20%, amber if 10-20%, red if below 10%
                  let marginBadgeStyle = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                  if (ship.margin >= 20) {
                    marginBadgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                  } else if (ship.margin >= 10) {
                    marginBadgeStyle = "bg-[#D946C4]/10 text-[#D946C4] border border-[#D946C4]/20";
                  }

                  return (
                    <motion.tr 
                      key={ship.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="hover:bg-white/2 transition-colors duration-150"
                    >
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#D946C4]/80 font-bold">{ship.id}</td>
                      <td className="py-3.5 px-4 font-medium max-w-[150px] truncate">{ship.client}</td>
                      <td className="py-3.5 px-4 text-white/70 font-sans">{ship.route}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-white/80">{formatINR(ship.revenue)}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-white/60">{formatINR(ship.expenses)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#D946C4]">{formatINR(ship.profit)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${marginBadgeStyle}`}>
                          {ship.margin}%
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>

          {/* Mobile Card Layout */}
          <div className="md:hidden divide-y divide-white/5 bg-stone-950/10">
            {sortedShipmentProfitability.map((ship) => {
              let marginBadgeStyle = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
              if (ship.margin >= 20) {
                marginBadgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
              } else if (ship.margin >= 10) {
                marginBadgeStyle = "bg-[#D946C4]/10 text-[#D946C4] border border-[#D946C4]/20";
              }

              return (
                <div key={ship.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#D946C4]/80 font-bold">{ship.id}</span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${marginBadgeStyle}`}>
                      {ship.margin}% Margin
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white">{ship.client}</p>
                    <p className="text-[11px] text-white/50">{ship.route}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-2 border-t border-white/5 font-mono">
                    <div className="bg-white/1 rounded p-1">
                      <span className="text-white/30 block text-[8px] uppercase">Revenue</span>
                      <span className="text-white">{formatINR(ship.revenue)}</span>
                    </div>
                    <div className="bg-white/1 rounded p-1">
                      <span className="text-white/30 block text-[8px] uppercase">Expenses</span>
                      <span className="text-white/70">{formatINR(ship.expenses)}</span>
                    </div>
                    <div className="bg-white/1 rounded p-1">
                      <span className="text-[#D946C4]/30 block text-[8px] uppercase font-bold">Profit</span>
                      <span className="text-[#D946C4] font-bold">{formatINR(ship.profit)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================== 5. BOTTOM — ALL TRANSACTIONS LEDGER ==================== */}
      <div className="bg-white/4 border border-white/8 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        
        {/* Title and Controls */}
        <div className="flex flex-col gap-4 mb-4">
          <div>
            <h3 className="font-display font-bold text-sm text-white">All Transactions Ledger</h3>
            <p className="text-xs text-white/45">Historical records of payments and operating expense accounts</p>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-white/5">
            
            {/* Left: Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'All', label: 'All Entries' },
                { id: 'Income', label: 'Income Only' },
                { id: 'Expense', label: 'Expenses Only' }
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setLedgerTypeFilter(chip.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    ledgerTypeFilter === chip.id 
                      ? 'bg-white/12 text-white font-semibold border border-white/20' 
                      : 'bg-white/2 text-white/50 hover:text-white border border-transparent'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Right: Search, category dropdown */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              
              {/* Category selector */}
              <div className="w-full sm:w-auto flex items-center gap-2">
                <span className="text-[10px] font-mono text-white/40 uppercase whitespace-nowrap">Category:</span>
                <select
                  value={ledgerCategoryFilter}
                  onChange={(e) => setLedgerCategoryFilter(e.target.value)}
                  className="bg-stone-900 border border-white/10 text-white text-xs rounded-lg px-3 h-8 focus:outline-none focus:border-[#D946C4]/40 cursor-pointer min-w-32"
                >
                  {ledgerCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Small Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search size={13} className="absolute left-3 top-2.5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search description, shipment id..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="w-full bg-stone-900/50 border border-white/10 rounded-lg h-8 pl-9 pr-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D946C4]/40"
                />
                {ledgerSearch && (
                  <button 
                    onClick={() => setLedgerSearch('')}
                    className="absolute right-2 top-2 text-white/40 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-stone-950/20">
          {/* Desktop/Tablet Table */}
          <table className="w-full text-left border-collapse hidden md:table">
            <thead>
              <tr className="bg-white/2 border-b border-white/5 text-[10px] font-mono text-white/45 uppercase tracking-wider">
                <th className="py-2.5 px-4 font-normal">Date</th>
                <th className="py-2.5 px-4 font-normal">Type</th>
                <th className="py-2.5 px-4 font-normal">Category</th>
                <th className="py-2.5 px-4 font-normal">Description</th>
                <th className="py-2.5 px-4 font-normal">Linked Shipment</th>
                <th className="py-2.5 px-4 text-right font-normal">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-white">
              {paginatedLedger.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/30 italic">
                    No transactions match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedLedger.map((txn) => (
                  <tr key={txn.id} className="hover:bg-white/2 transition-colors duration-150">
                    <td className="py-3 px-4 font-mono text-[11px] text-white/50">{txn.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold font-mono ${
                        txn.type === 'Income' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/80 font-sans">{txn.category}</td>
                    <td className="py-3 px-4 max-w-[220px] truncate" title={txn.description}>{txn.description}</td>
                    <td className="py-3 px-4">
                      {txn.relatedShipment ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-[#D946C4] font-bold">
                          <Tag size={9} />
                          {txn.relatedShipment}
                        </span>
                      ) : (
                        <span className="text-white/20 font-mono text-[10px]">—</span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${
                      txn.type === 'Income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {txn.type === 'Income' ? '+' : '-'}{formatINR(txn.amount).replace('₹', '')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Card Layout */}
          <div className="md:hidden divide-y divide-white/5">
            {paginatedLedger.length === 0 ? (
              <p className="py-8 text-center text-white/30 italic text-xs">
                No transactions match your filter criteria.
              </p>
            ) : (
              paginatedLedger.map((txn) => (
                <div key={txn.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-white/40">{txn.date}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold font-mono ${
                      txn.type === 'Income' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {txn.type}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white">{txn.description}</p>
                    <p className="text-[11px] text-white/50">{txn.category}</p>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-2 border-t border-white/5 font-mono">
                    <div>
                      {txn.relatedShipment ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-[#D946C4] font-bold">
                          <Tag size={9} />
                          {txn.relatedShipment}
                        </span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </div>
                    <span className={`font-bold ${txn.type === 'Income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {txn.type === 'Income' ? '+' : '-'}{formatINR(txn.amount).replace('₹', '')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ledger Pagination Controls */}
        {filteredLedger.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            <span className="text-[10px] font-mono text-white/40">
              Showing {(ledgerPage - 1) * itemsPerPage + 1} - {Math.min(ledgerPage * itemsPerPage, filteredLedger.length)} of {filteredLedger.length} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={ledgerPage === 1}
                onClick={() => setLedgerPage(prev => prev - 1)}
                className="w-8 h-8 rounded-lg bg-white/3 hover:bg-white/5 border border-white/5 flex items-center justify-center text-white/70 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-mono text-white/80 px-2">
                Page {ledgerPage} / {totalLedgerPages}
              </span>
              <button
                disabled={ledgerPage === totalLedgerPages}
                onClick={() => setLedgerPage(prev => prev + 1)}
                className="w-8 h-8 rounded-lg bg-white/3 hover:bg-white/5 border border-white/5 flex items-center justify-center text-white/70 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ==================== 6. ADD TRANSACTION MODAL ==================== */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-stone-950/80 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-md bg-stone-900 border border-white/15 rounded-2xl overflow-hidden shadow-2xl z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/5 bg-stone-950/60 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-white flex items-center gap-1.5 font-display">
                    <Plus size={16} className="text-[#D946C4]" />
                    Record Ledger Transaction
                  </h4>
                  <p className="text-[11px] text-white/40">Adds entry to the local workspace and updates summaries live</p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleAddTransactionSubmit} className="p-5 space-y-4">
                
                {/* Type Selection Segmented Toggle */}
                <div>
                  <label className="text-[10px] font-mono text-white/40 uppercase block mb-1.5">Transaction Type</label>
                  <div className="grid grid-cols-2 gap-2 bg-stone-950 p-1 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setFormType('Expense')}
                      className={`py-1.5 text-center text-xs rounded-lg transition-all ${
                        formType === 'Expense' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold' 
                          : 'text-white/45 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Expense Ledger
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType('Income')}
                      className={`py-1.5 text-center text-xs rounded-lg transition-all ${
                        formType === 'Income' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold' 
                          : 'text-white/45 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Income Receipt
                    </button>
                  </div>
                </div>

                {/* Amount and Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Amount (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-white/30 font-mono">₹</span>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 15000"
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-lg h-9 pl-7 pr-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/40 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Posting Date</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/40 font-mono"
                    />
                  </div>
                </div>

                {/* Category & Linked Shipment */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/40 cursor-pointer"
                    >
                      {formType === 'Expense' 
                        ? expenseCategories.map(cat => <option key={cat} value={cat} className="bg-stone-900">{cat}</option>)
                        : incomeCategories.map(cat => <option key={cat} value={cat} className="bg-stone-900">{cat}</option>)
                      }
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Linked Load (ID)</label>
                    <select
                      value={formShipment}
                      onChange={(e) => setFormShipment(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/40 cursor-pointer"
                    >
                      <option value="">None (Generic Spend)</option>
                      {shipmentRef.map(s => (
                        <option key={s.id} value={s.id} className="bg-stone-900">{s.id} ({s.client.substring(0, 10)}...)</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Transaction Description</label>
                  <textarea
                    rows={2}
                    placeholder="Provide ledger entry description..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-lg p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D946C4]/40"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/5 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-9 rounded-lg bg-[#D946C4] hover:bg-[#D946C4]/80 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Record Transaction
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
