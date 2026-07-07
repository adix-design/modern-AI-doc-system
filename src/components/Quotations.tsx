import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  ArrowRight, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Info,
  Sparkles,
  ArrowUpDown,
  Download,
  Share2,
  FileText,
  Pencil,
  Trash2,
  Check,
  X,
  FileCheck,
  MapPin,
  Building2,
  User,
  Phone,
  Mail,
  Printer,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Indian Number to Words Converter (Rupees & Lakhs Style)
function convertNumberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';
  if (isNaN(num)) return 'Zero Rupees Only';
  
  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const double = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const formatTens = (n: number): string => {
    if (n < 20) return single[n];
    return double[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : '');
  };
  
  const formatHundreds = (n: number): string => {
    if (n === 0) return '';
    let str = '';
    if (Math.floor(n / 100) > 0) {
      str += single[Math.floor(n / 100)] + ' Hundred';
    }
    const rem = n % 100;
    if (rem > 0) {
      str += (str ? ' and ' : '') + formatTens(rem);
    }
    return str;
  };

  let remainder = Math.floor(num);
  let str = '';
  
  const crore = Math.floor(remainder / 10000000);
  remainder %= 10000000;
  
  const lakh = Math.floor(remainder / 100000);
  remainder %= 100000;
  
  const thousand = Math.floor(remainder / 1000);
  remainder %= 1000;
  
  if (crore > 0) {
    str += formatHundreds(crore) + ' Crore ';
  }
  if (lakh > 0) {
    str += formatHundreds(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    str += formatHundreds(thousand) + ' Thousand ';
  }
  if (remainder > 0) {
    str += formatHundreds(remainder);
  }
  
  return str.trim() + ' Rupees Only';
}

// Interfaces
interface PriceMatrixRow {
  id: string;
  fromCity: string;
  toCity: string;
  distanceKm: number;
  rates: {
    [key: string]: number;
  };
  lastUpdated: string;
}

interface ClientRef {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
}

interface AdditionalCharge {
  id: string;
  label: string;
  amount: number;
}

export default function Quotations() {
  // Tabs: 'Price Matrix' or 'New Quotation'
  const [activeTab, setActiveTab] = useState<'matrix' | 'quote'>('matrix');

  // Mobile single-panel view state for Quotation Workspace
  const [mobileQuoteView, setMobileQuoteView] = useState<'form' | 'preview'>('form');

  // Pre-seeded Clients (Aligned with existing application clients)
  const clientsList = useMemo<ClientRef[]>(() => [
    { id: 'client-101', name: 'Amit Sharma', company: 'Apex Foods International', phone: '+91 98765 43210', email: 'amit.sharma@apexfoods.in' },
    { id: 'client-102', name: 'Priya Patel', company: 'Titan Industrial Supply', phone: '+91 99887 76655', email: 'priya.patel@apexfoods.in' },
    { id: 'client-103', name: 'Rajinder Pal', company: 'Sharma Agri Logistics', phone: '+91 91234 56789', email: 'rajinder.pal@sharmaagri.in' },
    { id: 'client-104', name: 'Devender Kumar', company: 'Noida Freight Carriers', phone: '+91 98123 45670', email: 'devender@noidafreight.com' },
    { id: 'client-105', name: 'Madan Lal', company: 'Vanguard Express Co.', phone: '+91 95432 10987', email: 'madan.lal@vanguardexp.com' },
    { id: 'client-106', name: 'Karan Rajput', company: 'Rajput Cold Chain', phone: '+91 94111 22233', email: 'karan.rajput@coldchain.in' },
    { id: 'client-107', name: 'Suresh Gehlot', company: 'Jaipur Trading Corp', phone: '+91 93122 33445', email: 'suresh@jaipurtrading.in' }
  ], []);

  // Truck types reference
  const truckTypes = useMemo(() => [
    '407 LCV',
    'Eicher 14ft',
    'Eicher 19ft',
    '22ft Container',
    '32ft Multi-Axle'
  ], []);

  // Initial Price Matrix State
  const [priceMatrix, setPriceMatrix] = useState<PriceMatrixRow[]>([
    {
      id: 'R-01',
      fromCity: 'Bhopal',
      toCity: 'Indore',
      distanceKm: 195,
      rates: {
        '407 LCV': 8500,
        'Eicher 14ft': 12000,
        'Eicher 19ft': 16500,
        '22ft Container': 21000,
        '32ft Multi-Axle': 32000
      },
      lastUpdated: '2026-07-04'
    },
    {
      id: 'R-02',
      fromCity: 'Indore',
      toCity: 'Mumbai',
      distanceKm: 585,
      rates: {
        '407 LCV': 22000,
        'Eicher 14ft': 31000,
        'Eicher 19ft': 42000,
        '22ft Container': 52000,
        '32ft Multi-Axle': 74500
      },
      lastUpdated: '2026-07-05'
    },
    {
      id: 'R-03',
      fromCity: 'Bhopal',
      toCity: 'Delhi',
      distanceKm: 780,
      rates: {
        '407 LCV': 28000,
        'Eicher 14ft': 38500,
        'Eicher 19ft': 49000,
        '22ft Container': 61000,
        '32ft Multi-Axle': 88000
      },
      lastUpdated: '2026-06-29'
    },
    {
      id: 'R-04',
      fromCity: 'Delhi',
      toCity: 'Mumbai',
      distanceKm: 1420,
      rates: {
        '407 LCV': 45000,
        'Eicher 14ft': 58000,
        'Eicher 19ft': 72000,
        '22ft Container': 89000,
        '32ft Multi-Axle': 128000
      },
      lastUpdated: '2026-07-06'
    },
    {
      id: 'R-05',
      fromCity: 'Ahmedabad',
      toCity: 'Pune',
      distanceKm: 520,
      rates: {
        '407 LCV': 19500,
        'Eicher 14ft': 27000,
        'Eicher 19ft': 35000,
        '22ft Container': 44000,
        '32ft Multi-Axle': 63000
      },
      lastUpdated: '2026-07-01'
    },
    {
      id: 'R-06',
      fromCity: 'Amritsar',
      toCity: 'Delhi',
      distanceKm: 450,
      rates: {
        '407 LCV': 16000,
        'Eicher 14ft': 22500,
        'Eicher 19ft': 30000,
        '22ft Container': 38000,
        '32ft Multi-Axle': 54000
      },
      lastUpdated: '2026-07-03'
    },
    {
      id: 'R-07',
      fromCity: 'Noida',
      toCity: 'Jaipur',
      distanceKm: 280,
      rates: {
        '407 LCV': 11000,
        'Eicher 14ft': 15500,
        'Eicher 19ft': 21000,
        '22ft Container': 26000,
        '32ft Multi-Axle': 39000
      },
      lastUpdated: '2026-07-05'
    },
    {
      id: 'R-08',
      fromCity: 'Indore',
      toCity: 'Gwalior',
      distanceKm: 500,
      rates: {
        '407 LCV': 18000,
        'Eicher 14ft': 24000,
        'Eicher 19ft': 31500,
        '22ft Container': 40000,
        '32ft Multi-Axle': 58000
      },
      lastUpdated: '2026-06-25'
    }
  ]);

  // Matrix Filter states
  const [matrixSearch, setMatrixSearch] = useState('');
  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);

  // Hover indices to trace cell intersections
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [hoveredColKey, setHoveredColKey] = useState<string | null>(null);

  // Inline Cell Editing States
  const [editingCell, setEditingCell] = useState<{ rowId: string; colKey: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Route Form States
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');
  const [newDistance, setNewDistance] = useState('');
  const [newRates, setNewRates] = useState<Record<string, string>>({
    '407 LCV': '',
    'Eicher 14ft': '',
    'Eicher 19ft': '',
    '22ft Container': '',
    '32ft Multi-Axle': ''
  });

  // ==================== TAB 2: QUOTE BUILDER FORM STATES ====================
  const [selectedClientId, setSelectedClientId] = useState('client-101');
  const [clientSearch, setClientSearch] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  
  const [quoteFrom, setQuoteFrom] = useState('Delhi');
  const [quoteTo, setQuoteTo] = useState('Mumbai');
  const [quoteTruck, setQuoteTruck] = useState('32ft Multi-Axle');
  
  // Custom manual overrides
  const [manualDistance, setManualDistance] = useState<number | null>(null);
  const [manualBaseRate, setManualBaseRate] = useState<number | null>(null);
  const [isRateOverridden, setIsRateOverridden] = useState(false);
  const [isDistanceOverridden, setIsDistanceOverridden] = useState(false);

  // Extra charges list
  const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>([
    { id: '1', label: 'Loading Charges', amount: 1500 },
    { id: '2', label: 'Unloading Charges', amount: 1500 },
    { id: '3', label: 'Tolls & State Taxes', amount: 3500 }
  ]);
  const [newChargeLabel, setNewChargeLabel] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState('');

  // Quote Metadata
  const [quoteNo, setQuoteNo] = useState('QTE-2026-070601');
  const [quoteDate, setQuoteDate] = useState('2026-07-06');
  const [validUntil, setValidUntil] = useState('2026-07-13');
  const [gstRate, setGstRate] = useState<5 | 12 | 18>(12);
  const [notes, setNotes] = useState(
    "1. Rates include standard transit diesel surcharge.\n" +
    "2. Loading/Unloading allowed: 4 Hours at each warehouse end; detention is ₹2,500/day thereafter.\n" +
    "3. Excludes any physical custom clearance fees or gate entry taxes unless mentioned."
  );

  // Action states
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [savingDocument, setSavingDocument] = useState(false);

  // Check if date is in the last 7 days from July 06, 2026
  const isRecentlyUpdated = (dateStr: string) => {
    const date = new Date(dateStr);
    const anchorDate = new Date('2026-07-06');
    const diffTime = Math.abs(anchorDate.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // Indian format helper
  const formatIndianNumber = (num: number) => {
    const numStr = Math.round(num).toString();
    const lastThree = numStr.substring(numStr.length - 3);
    const otherNumbers = numStr.substring(0, numStr.length - 3);
    if (otherNumbers !== '') {
      return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
    }
    return lastThree;
  };

  // Find dynamic client data
  const activeClient = useMemo(() => {
    return clientsList.find(c => c.id === selectedClientId) || clientsList[0];
  }, [selectedClientId, clientsList]);

  // Filter clients for searchable dropdown
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clientsList;
    const query = clientSearch.toLowerCase();
    return clientsList.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.company.toLowerCase().includes(query)
    );
  }, [clientSearch, clientsList]);

  // Find suggested matrix route based on selected quote From/To
  const suggestedMatrixRoute = useMemo(() => {
    return priceMatrix.find(
      r => r.fromCity.toLowerCase() === quoteFrom.toLowerCase() && 
           r.toCity.toLowerCase() === quoteTo.toLowerCase()
    );
  }, [priceMatrix, quoteFrom, quoteTo]);

  // Base rate lookup
  const baseRate = useMemo(() => {
    if (isRateOverridden && manualBaseRate !== null) {
      return manualBaseRate;
    }
    if (suggestedMatrixRoute && suggestedMatrixRoute.rates[quoteTruck] !== undefined) {
      return suggestedMatrixRoute.rates[quoteTruck];
    }
    // Fallback formula if route not in matrix
    const distance = manualDistance !== null ? manualDistance : 350;
    const ratesPerKm: Record<string, number> = {
      '407 LCV': 45,
      'Eicher 14ft': 55,
      'Eicher 19ft': 75,
      '22ft Container': 90,
      '32ft Multi-Axle': 120
    };
    return Math.round(distance * (ratesPerKm[quoteTruck] || 70));
  }, [suggestedMatrixRoute, quoteTruck, isRateOverridden, manualBaseRate, manualDistance]);

  // Distance lookup
  const distanceKm = useMemo(() => {
    if (isDistanceOverridden && manualDistance !== null) {
      return manualDistance;
    }
    if (suggestedMatrixRoute) {
      return suggestedMatrixRoute.distanceKm;
    }
    return 350; // default standard distance if not found
  }, [suggestedMatrixRoute, isDistanceOverridden, manualDistance]);

  // Calculation summaries
  const calculations = useMemo(() => {
    const baseAmount = baseRate;
    const additionalTotal = additionalCharges.reduce((acc, curr) => acc + curr.amount, 0);
    const subtotal = baseAmount + additionalTotal;
    const gstAmount = Math.round(subtotal * (gstRate / 100));
    const grandTotal = subtotal + gstAmount;

    return {
      baseAmount,
      additionalTotal,
      subtotal,
      gstAmount,
      grandTotal
    };
  }, [baseRate, additionalCharges, gstRate]);

  // Search filtered matrix rows
  const filteredMatrix = useMemo(() => {
    if (!matrixSearch.trim()) return priceMatrix;
    const query = matrixSearch.toLowerCase();
    return priceMatrix.filter(row => 
      row.fromCity.toLowerCase().includes(query) || 
      row.toCity.toLowerCase().includes(query)
    );
  }, [priceMatrix, matrixSearch]);

  // Handle saving matrix inline edit
  const saveCellEdit = () => {
    if (!editingCell) return;
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed) && parsed >= 0) {
      setPriceMatrix(prev => prev.map(row => {
        if (row.id === editingCell.rowId) {
          return {
            ...row,
            rates: {
              ...row.rates,
              [editingCell.colKey]: parsed
            },
            lastUpdated: '2026-07-06' // dynamic marker to trigger amber dot
          };
        }
        return row;
      }));
      triggerToast(`Updated ${editingCell.colKey} price for ${priceMatrix.find(r => r.id === editingCell.rowId)?.fromCity} route to ₹${parsed.toLocaleString('en-IN')}`);
    }
    setEditingCell(null);
  };

  // Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handle adding custom route
  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFrom || !newTo || !newDistance) {
      alert('Please fill out From City, To City, and Distance.');
      return;
    }

    const distVal = parseInt(newDistance);
    if (isNaN(distVal) || distVal <= 0) {
      alert('Please enter a valid positive distance.');
      return;
    }

    // Default rates based on typical per-km charges
    const computedRates: Record<string, number> = {};
    truckTypes.forEach(type => {
      const manualVal = parseFloat(newRates[type]);
      if (!isNaN(manualVal) && manualVal > 0) {
        computedRates[type] = manualVal;
      } else {
        const factorMap: Record<string, number> = {
          '407 LCV': 45,
          'Eicher 14ft': 55,
          'Eicher 19ft': 75,
          '22ft Container': 90,
          '32ft Multi-Axle': 120
        };
        computedRates[type] = Math.round(distVal * (factorMap[type] || 60));
      }
    });

    const newRow: PriceMatrixRow = {
      id: `R-${Date.now().toString().slice(-2)}`,
      fromCity: newFrom.charAt(0).toUpperCase() + newFrom.slice(1),
      toCity: newTo.charAt(0).toUpperCase() + newTo.slice(1),
      distanceKm: distVal,
      rates: computedRates,
      lastUpdated: '2026-07-06'
    };

    setPriceMatrix(prev => [...prev, newRow]);
    setIsAddRouteModalOpen(false);

    // Clear form
    setNewFrom('');
    setNewTo('');
    setNewDistance('');
    setNewRates({
      '407 LCV': '',
      'Eicher 14ft': '',
      'Eicher 19ft': '',
      '22ft Container': '',
      '32ft Multi-Axle': ''
    });

    triggerToast(`Successfully added reference lane: ${newRow.fromCity} → ${newRow.toCity}`);
  };

  // Add line item to quote charges
  const handleAddChargeLine = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(newChargeAmount);
    if (!newChargeLabel || isNaN(parsedAmt) || parsedAmt <= 0) {
      alert('Please enter a valid label and positive cost amount.');
      return;
    }

    const newCharge: AdditionalCharge = {
      id: Date.now().toString(),
      label: newChargeLabel,
      amount: parsedAmt
    };

    setAdditionalCharges(prev => [...prev, newCharge]);
    setNewChargeLabel('');
    setNewChargeAmount('');
  };

  // Remove charge line
  const handleRemoveChargeLine = (id: string) => {
    setAdditionalCharges(prev => prev.filter(c => c.id !== id));
  };

  // Trigger Action: Download PDF
  const handleDownloadPDF = () => {
    setPdfGenerating(true);
    setTimeout(() => {
      setPdfGenerating(false);
      triggerToast(`Downloaded Quotation ${quoteNo} successfully in PDF format.`);
    }, 1800);
  };

  // Trigger Action: WhatsApp Share
  const handleWhatsAppShare = () => {
    triggerToast(`Generated WhatsApp share link! Notified ${activeClient.name} (${activeClient.phone})`);
  };

  // Trigger Action: Save to Documents
  const handleSaveToDocuments = () => {
    setSavingDocument(true);
    setTimeout(() => {
      setSavingDocument(false);
      triggerToast(`Successfully saved ${quoteNo} to Documents as an Invoice draft.`);
    }, 1500);
  };

  return (
    <div id="quotations-view-container" className="space-y-6 flex flex-col flex-1 pb-16 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-stone-900 border border-[#D946C4]/30 text-white rounded-xl px-4 py-3.5 shadow-2xl flex items-center gap-3 z-50 w-full max-w-sm"
          >
            <div className="w-5 h-5 rounded-full bg-[#D946C4]/10 border border-[#D946C4]/20 flex items-center justify-center text-[#D946C4]">
              <CheckCircle size={13} />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-[#D946C4]">Notification</p>
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

      {/* ==================== SEGMENTED TAB SELECTOR ==================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-white tracking-tight flex items-center gap-2">
            Quotations
            <span className="text-[10px] font-mono font-semibold bg-[#D946C4]/10 border border-[#D946C4]/20 text-[#D946C4] px-2 py-0.5 rounded uppercase tracking-wider">
              PRICING & SPOT
            </span>
          </h1>
          <p className="text-xs text-white/50 font-sans">Reference matrices and professional client bidding builders</p>
        </div>

        {/* Tab switcher */}
        <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex self-start md:self-auto">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'matrix' 
                ? 'bg-[#D946C4] text-white shadow-md' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Price Matrix
          </button>
          <button
            onClick={() => {
              setActiveTab('quote');
              // Initialize quote details nicely
              setQuoteNo(`QTE-2026-${Math.floor(100000 + Math.random() * 900000)}`);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'quote' 
                ? 'bg-[#D946C4] text-white shadow-md' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            New Quotation
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: PRICE MATRIX ==================== */}
      <AnimatePresence mode="wait">
        {activeTab === 'matrix' && (
          <motion.div
            key="matrix-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            
            {/* SEARCH ROW & QUICK METRICS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/3 border border-white/8 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-[#D946C4] shrink-0" />
                <p className="text-xs text-white/70">
                  <span className="font-semibold text-white">Interactive reference rates:</span> Click on any cell price to edit directly. Updated values apply immediately.
                </p>
              </div>

              {/* Action and filter controls */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                {/* Search field */}
                <div className="relative flex-1 sm:w-64">
                  <Search size={13} className="absolute left-3 top-2.5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search routes..."
                    value={matrixSearch}
                    onChange={(e) => setMatrixSearch(e.target.value)}
                    className="w-full bg-stone-900 border border-white/10 rounded-xl h-9 pl-9 pr-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D946C4]/40"
                  />
                  {matrixSearch && (
                    <button 
                      onClick={() => setMatrixSearch('')}
                      className="absolute right-2 top-2.5 text-white/40 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Add Route Button */}
                <button
                  onClick={() => setIsAddRouteModalOpen(true)}
                  className="flex items-center gap-1.5 h-9 px-4 bg-[#D946C4] hover:bg-[#D946C4]/80 text-white text-xs font-semibold rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  <Plus size={14} />
                  <span className="hidden sm:inline">Add Route</span>
                </button>
              </div>
            </div>

            {/* INTERACTIVE GRID MATRIX */}
            <div className="bg-white/4 border border-white/8 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden">
              
              {/* Scrollable grid frame with sticky headers */}
              <div className="overflow-x-auto rounded-xl border border-white/5 bg-stone-950/20 max-h-[500px]">
                <table className="w-full text-left border-collapse table-fixed min-w-[750px]">
                  <thead>
                    <tr className="bg-stone-950/80 border-b border-white/8 sticky top-0 z-10 text-[10px] font-mono text-white/50 uppercase tracking-wider">
                      {/* Route Header (Sticky first column) */}
                      <th className="py-4 px-4 font-normal sticky left-0 bg-stone-950/90 z-20 w-52 border-r border-white/5">
                        Route / Distance
                      </th>
                      {/* Truck Categories Columns */}
                      {truckTypes.map(truck => {
                        const isColHovered = hoveredColKey === truck;
                        return (
                          <th 
                            key={truck} 
                            className={`py-4 px-4 font-normal text-right transition-colors border-r last:border-r-0 border-white/5 ${
                              isColHovered ? 'bg-white/5 text-[#D946C4] font-semibold' : ''
                            }`}
                            onMouseEnter={() => setHoveredColKey(truck)}
                            onMouseLeave={() => setHoveredColKey(null)}
                          >
                            <span className="block">{truck}</span>
                            <span className="text-[8px] text-white/30 font-sans tracking-tight font-normal">Reference capacity</span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-white">
                    {filteredMatrix.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-white/30 italic">
                          No routes match your search filters.
                        </td>
                      </tr>
                    ) : (
                      filteredMatrix.map((row) => {
                        const isRowHovered = hoveredRowId === row.id;
                        
                        return (
                          <tr 
                            key={row.id}
                            className={`transition-colors duration-150 ${
                              isRowHovered ? 'bg-white/3' : ''
                            }`}
                            onMouseEnter={() => setHoveredRowId(row.id)}
                            onMouseLeave={() => setHoveredRowId(null)}
                          >
                            {/* Sticky Route Cell */}
                            <td className="py-3 px-4 font-sans font-semibold sticky left-0 bg-stone-900/95 z-10 border-r border-white/5 shadow-md">
                              <div className="flex items-center gap-1.5 text-white">
                                <span>{row.fromCity}</span>
                                <ArrowRight size={11} className="text-white/30" />
                                <span>{row.toCity}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-mono text-white/40">{row.distanceKm} km</span>
                                <span className="text-[9px] text-white/30 font-mono">• Updated {row.lastUpdated.substring(5)}</span>
                              </div>
                            </td>

                            {/* Rates Cells */}
                            {truckTypes.map((truck) => {
                              const isColHovered = hoveredColKey === truck;
                              const isThisCellHovered = isRowHovered && isColHovered;
                              const cellValue = row.rates[truck] || 0;
                              const recent = isRecentlyUpdated(row.lastUpdated);

                              return (
                                <td 
                                  key={truck}
                                  className={`p-2 transition-colors border-r last:border-r-0 border-white/5 ${
                                    isThisCellHovered 
                                      ? 'bg-[#D946C4]/10' 
                                      : isColHovered 
                                        ? 'bg-white/3' 
                                        : ''
                                  }`}
                                  onMouseEnter={() => {
                                    setHoveredRowId(row.id);
                                    setHoveredColKey(truck);
                                  }}
                                  onMouseLeave={() => {
                                    setHoveredRowId(null);
                                    setHoveredColKey(null);
                                  }}
                                >
                                  {/* Dynamic editable block */}
                                  <div className="relative group min-h-[38px] flex items-center justify-end px-2.5 rounded-lg transition-colors cursor-pointer hover:bg-white/5">
                                    <AnimatePresence mode="wait">
                                      {editingCell?.rowId === row.id && editingCell?.colKey === truck ? (
                                        <motion.div
                                          key="edit-input"
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.95 }}
                                          className="w-full flex items-center"
                                        >
                                          <span className="text-[#D946C4] mr-0.5 text-xs">₹</span>
                                          <input
                                            type="number"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={saveCellEdit}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') saveCellEdit();
                                              if (e.key === 'Escape') setEditingCell(null);
                                            }}
                                            className="w-full bg-stone-950 border border-[#D946C4]/50 rounded px-1 py-0.5 text-xs text-right text-[#D946C4] focus:outline-none focus:ring-1 focus:ring-[#D946C4]/50"
                                            autoFocus
                                          />
                                        </motion.div>
                                      ) : (
                                        <motion.div
                                          key="display-val"
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          onClick={() => {
                                            setEditingCell({ rowId: row.id, colKey: truck });
                                            setEditValue(cellValue.toString());
                                          }}
                                          className="w-full flex items-center justify-end gap-1.5 font-mono text-xs text-right"
                                        >
                                          {recent && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#D946C4] inline-block mr-1 animate-pulse" title="Updated recently" />
                                          )}
                                          <span className="text-white/90">₹{formatIndianNumber(cellValue)}</span>
                                          <Pencil size={10} className="text-white/30 opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0" />
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Legend/Note */}
              <div className="border-t border-white/5 pt-4 mt-4 text-[11px] text-white/40 flex items-center gap-1.5">
                <Info size={12} className="text-[#D946C4]" />
                <span>Rates are base freight only — loading, unloading, and detention charged separately in Documents. Matrix cells marked with <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D946C4]" /> are fresh entries revised in the last 7 days.</span>
              </div>
            </div>

          </motion.div>
        )}

        {/* ==================== TAB 2: NEW QUOTATION ==================== */}
        {activeTab === 'quote' && (
          <motion.div
            key="quote-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start"
          >
            
            {/* Mobile Tab Switcher to switch between Builder and Live Sheet */}
            <div className="lg:hidden flex bg-stone-900/60 p-1 rounded-xl border border-white/5 w-full mb-2">
              <button
                type="button"
                onClick={() => setMobileQuoteView('form')}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all duration-200 ${
                  mobileQuoteView === 'form'
                    ? 'bg-[#D946C4] text-white font-bold'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                Quote Builder Form
              </button>
              <button
                type="button"
                onClick={() => setMobileQuoteView('preview')}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all duration-200 ${
                  mobileQuoteView === 'preview'
                    ? 'bg-[#D946C4] text-white font-bold'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                Live Quote Sheet
              </button>
            </div>

            {/* LEFT PANEL (~40% / 4 Cols): Quote Builder Form */}
            <div className={`lg:col-span-4 space-y-6 ${mobileQuoteView === 'form' ? 'block' : 'hidden lg:block'}`}>
              
              <div className="bg-white/4 border border-white/8 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] space-y-4">
                <h3 className="font-display font-bold text-sm text-white border-b border-white/5 pb-2">
                  Quote Builder
                </h3>

                {/* Client Searchable Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider block">Client/Company Account</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                      className="w-full bg-stone-900 border border-white/10 text-left text-xs rounded-xl px-4 h-10 flex items-center justify-between text-white focus:outline-none focus:border-[#D946C4]/40"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 size={13} className="text-white/40" />
                        <span className="font-semibold truncate max-w-[200px]">{activeClient.company}</span>
                        <span className="text-[10px] text-white/40">({activeClient.name})</span>
                      </div>
                      <span className="text-white/30 text-[9px]">▼</span>
                    </button>

                    {isClientDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setIsClientDropdownOpen(false)} />
                        <div className="absolute left-0 right-0 mt-1.5 bg-stone-900 border border-white/10 rounded-xl shadow-2xl p-2 z-30 max-h-56 overflow-y-auto">
                          {/* Search bar inside dropdown */}
                          <div className="relative mb-2">
                            <Search size={11} className="absolute left-2 top-2 text-white/40" />
                            <input
                              type="text"
                              placeholder="Search client accounts..."
                              value={clientSearch}
                              onChange={(e) => setClientSearch(e.target.value)}
                              className="w-full bg-stone-950 border border-white/5 rounded-lg h-7 pl-7 pr-3 text-[11px] text-white placeholder-white/20 focus:outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {/* List */}
                          {filteredClients.map(client => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => {
                                setSelectedClientId(client.id);
                                setIsClientDropdownOpen(false);
                                setClientSearch('');
                              }}
                              className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors block ${
                                selectedClientId === client.id 
                                  ? 'bg-[#D946C4] text-white font-semibold' 
                                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <div className="font-semibold truncate">{client.company}</div>
                              <div className="text-[10px] opacity-60 truncate">{client.name} • {client.phone}</div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* From / To City Router */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider block">From City</label>
                    <select
                      value={quoteFrom}
                      onChange={(e) => {
                        setQuoteFrom(e.target.value);
                        setIsRateOverridden(false);
                        setIsDistanceOverridden(false);
                      }}
                      className="w-full bg-stone-900 border border-white/10 text-white text-xs rounded-xl px-3 h-10 focus:outline-none focus:border-[#D946C4]/40 cursor-pointer"
                    >
                      {['Bhopal', 'Indore', 'Delhi', 'Mumbai', 'Ahmedabad', 'Pune', 'Amritsar', 'Noida', 'Jaipur', 'Gwalior'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider block">To City</label>
                    <select
                      value={quoteTo}
                      onChange={(e) => {
                        setQuoteTo(e.target.value);
                        setIsRateOverridden(false);
                        setIsDistanceOverridden(false);
                      }}
                      className="w-full bg-stone-900 border border-white/10 text-white text-xs rounded-xl px-3 h-10 focus:outline-none focus:border-[#D946C4]/40 cursor-pointer"
                    >
                      {['Bhopal', 'Indore', 'Delhi', 'Mumbai', 'Ahmedabad', 'Pune', 'Amritsar', 'Noida', 'Jaipur', 'Gwalior'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Truck Size & Auto Rate Display */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider block">Vehicle Category</label>
                    <select
                      value={quoteTruck}
                      onChange={(e) => {
                        setQuoteTruck(e.target.value);
                        setIsRateOverridden(false);
                      }}
                      className="w-full bg-stone-900 border border-white/10 text-white text-xs rounded-xl px-3 h-10 focus:outline-none focus:border-[#D946C4]/40 cursor-pointer"
                    >
                      {truckTypes.map(truck => (
                        <option key={truck} value={truck}>{truck}</option>
                      ))}
                    </select>
                  </div>

                  {/* Overrides block */}
                  <div className="bg-stone-950/40 border border-white/5 p-3.5 rounded-xl space-y-3.5">
                    {/* Distance override */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-white/60 block">Lane Distance:</span>
                        <span className="text-xs font-semibold text-white">
                          {distanceKm} km
                          {suggestedMatrixRoute && !isDistanceOverridden && (
                            <span className="text-[9px] text-[#D946C4] ml-2 font-mono">(Matrix Suggested)</span>
                          )}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (isDistanceOverridden) {
                            setIsDistanceOverridden(false);
                            setManualDistance(null);
                          } else {
                            setIsDistanceOverridden(true);
                            setManualDistance(distanceKm);
                          }
                        }}
                        className="text-[10px] text-[#D946C4]/70 hover:text-[#D946C4] font-mono"
                      >
                        {isDistanceOverridden ? 'Reset' : 'Override Distance'}
                      </button>
                    </div>

                    {isDistanceOverridden && (
                      <div className="relative animate-fade-in">
                        <input
                          type="number"
                          placeholder="Override distance in km"
                          value={manualDistance !== null ? manualDistance : ''}
                          onChange={(e) => setManualDistance(parseInt(e.target.value) || 0)}
                          className="w-full bg-stone-900 border border-white/15 rounded-lg h-8 px-3 text-xs text-white"
                        />
                      </div>
                    )}

                    {/* Base Rate override */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-white/60 block font-sans">Base Freight Price:</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           <span className="text-sm font-bold text-[#D946C4] font-mono">
                            ₹{formatIndianNumber(baseRate)}
                          </span>
                          {!isRateOverridden && suggestedMatrixRoute ? (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-mono font-normal">
                              AUTO-FILLED
                            </span>
                          ) : isRateOverridden ? (
                            <span className="text-[9px] bg-[#D946C4]/10 text-[#D946C4] border border-[#D946C4]/20 px-1 py-0.2 rounded font-mono font-normal">
                              OVERRIDDEN
                            </span>
                          ) : (
                            <span className="text-[9px] bg-white/5 text-white/40 border border-white/10 px-1 py-0.2 rounded font-mono font-normal">
                              ESTIMATED KM RATE
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (isRateOverridden) {
                            setIsRateOverridden(false);
                            setManualBaseRate(null);
                          } else {
                            setIsRateOverridden(true);
                            setManualBaseRate(baseRate);
                          }
                        }}
                        className="text-[10px] text-[#D946C4]/70 hover:text-[#D946C4] font-mono"
                      >
                        {isRateOverridden ? 'Reset' : 'Override Rate'}
                      </button>
                    </div>

                    {isRateOverridden && (
                      <div className="relative animate-fade-in">
                        <span className="absolute left-3 top-2 text-white/40 text-xs">₹</span>
                        <input
                          type="number"
                          placeholder="Override base freight rate"
                          value={manualBaseRate !== null ? manualBaseRate : ''}
                          onChange={(e) => setManualBaseRate(parseFloat(e.target.value) || 0)}
                          className="w-full bg-stone-900 border border-white/15 rounded-lg h-8 pl-6 pr-3 text-xs text-white"
                        />
                      </div>
                    )}

                  </div>
                </div>

                {/* Additional repeatable line-items */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider block">Additional Line Item Charges</label>
                  
                  {/* Item List */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {additionalCharges.length === 0 ? (
                      <span className="text-[10px] text-white/30 block italic">No additional charges added.</span>
                    ) : (
                      additionalCharges.map(charge => (
                        <div key={charge.id} className="flex items-center justify-between bg-white/2 border border-white/5 px-2.5 py-1.5 rounded-lg text-xs">
                          <span className="text-white/80">{charge.label}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[#D946C4]">₹{formatIndianNumber(charge.amount)}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveChargeLine(charge.id)}
                              className="text-white/40 hover:text-[#D946C4] transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add item builder */}
                  <form onSubmit={handleAddChargeLine} className="grid grid-cols-12 gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="e.g., Detention (2 Days)"
                      value={newChargeLabel}
                      onChange={(e) => setNewChargeLabel(e.target.value)}
                      className="col-span-7 bg-stone-900 border border-white/10 rounded-lg h-8 px-2 text-xs text-white placeholder-white/30 focus:outline-none"
                    />
                    <div className="col-span-3 relative">
                      <span className="absolute left-1.5 top-2 text-white/40 text-[10px]">₹</span>
                      <input
                        type="number"
                        placeholder="Cost"
                        value={newChargeAmount}
                        onChange={(e) => setNewChargeAmount(e.target.value)}
                        className="w-full bg-stone-900 border border-white/10 rounded-lg h-8 pl-4 pr-1 text-xs text-white placeholder-white/30 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="col-span-2 h-8 rounded-lg bg-white/10 text-white hover:bg-white/15 text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
                      title="Add surcharge item"
                    >
                      <Plus size={14} />
                    </button>
                  </form>
                </div>

                {/* Validity and GST Config */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider block">Valid Until</label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full bg-stone-900 border border-white/10 text-white text-xs rounded-xl px-3 h-10 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider block">GST Rate %</label>
                    <select
                      value={gstRate}
                      onChange={(e) => setGstRate(parseInt(e.target.value) as any)}
                      className="w-full bg-stone-900 border border-white/10 text-white text-xs rounded-xl px-3 h-10 focus:outline-none cursor-pointer"
                    >
                      <option value={5}>5% GST (RCM)</option>
                      <option value={12}>12% GST (Regular)</option>
                      <option value={18}>18% GST (Heavy Brokerage)</option>
                    </select>
                  </div>
                </div>

                {/* Freeform Notes Field */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider block">Quote Terms & Conditions</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-stone-900 border border-white/10 rounded-xl p-3 text-xs text-white/80 focus:outline-none placeholder-white/20"
                    placeholder="Enter customized logistics terms..."
                  />
                </div>

                {/* Live-calculated totals inside builder */}
                <div className="bg-[#D946C4]/5 border border-[#D946C4]/20 p-3.5 rounded-xl flex items-center justify-between text-xs pt-3">
                  <div>
                    <span className="text-[10px] text-white/50 block font-mono">SUBTOTAL</span>
                    <span className="text-white/80 font-mono font-semibold">₹{formatIndianNumber(calculations.subtotal)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-white/50 block font-mono">GST ({gstRate}%)</span>
                    <span className="text-white/80 font-mono">₹{formatIndianNumber(calculations.gstAmount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#D946C4] font-semibold block font-mono">ESTIMATED TOTAL</span>
                    <span className="text-base font-bold text-[#D946C4] font-mono">₹{formatIndianNumber(calculations.grandTotal)}</span>
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT PANEL (~60% / 6 Cols): Clean Live Quote Document Preview */}
            <div className={`lg:col-span-6 space-y-4 ${mobileQuoteView === 'preview' ? 'block' : 'hidden lg:block'}`}>
              
              {/* Document Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white/3 border border-white/8 rounded-2xl p-4">
                <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <Printer size={13} className="text-[#D946C4]" />
                  Live Print Preview
                </span>

                <div className="flex items-center gap-2">
                  {/* Download Action */}
                  <button
                    onClick={handleDownloadPDF}
                    disabled={pdfGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    {pdfGenerating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span className="text-[11px]">Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download size={13} className="text-white/60" />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>

                  {/* Share Action */}
                  <button
                    onClick={handleWhatsAppShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    <Share2 size={13} className="text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Save to Documents Action */}
                  <button
                    onClick={handleSaveToDocuments}
                    disabled={savingDocument}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D946C4] hover:bg-[#D946C4]/80 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                  >
                    {savingDocument ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-stone-950/20 border-t-stone-950 rounded-full animate-spin" />
                        <span className="text-[11px]">Drafting...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck size={13} />
                        <span>Save to Documents</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* PRINT DOCUMENT PAPER */}
              <div className="bg-white text-stone-800 rounded-2xl p-8 shadow-2xl relative border border-white/10 overflow-hidden font-sans text-xs flex flex-col justify-between min-h-[700px]">
                
                {/* Clean Letterhead background watermark */}
                <div className="absolute right-[-100px] top-[-100px] w-96 h-96 rounded-full bg-stone-100/30 blur-3xl pointer-events-none" />

                {/* Top Section */}
                <div className="space-y-6">
                  
                  {/* Letterhead and Header Block */}
                  <div className="flex justify-between items-start border-b border-stone-200 pb-5">
                    <div>
                      <h2 className="text-lg font-black tracking-tight text-stone-900 font-display">VANGUARD LOGISTICS LLP</h2>
                      <p className="text-[10px] text-stone-500 leading-relaxed mt-0.5 font-mono">
                        Plot 14, Sector 18, Gurugram, Haryana - 122001<br />
                        GSTIN: 06AAAFV4912K1Z9 | Phone: +91 124 4920211
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[#D946C4] bg-[#D946C4]/10 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                        QUOTATION
                      </span>
                      <h4 className="text-base font-black text-stone-900 font-mono mt-2">{quoteNo}</h4>
                      <p className="text-[10px] text-stone-500 font-mono">Date: {quoteDate}</p>
                    </div>
                  </div>

                  {/* Client & Route Split Info Blocks */}
                  <div className="grid grid-cols-2 gap-6 bg-stone-50 p-4 rounded-xl border border-stone-200/50">
                    <div>
                      <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">QUOTED TO CLIENT</h4>
                      <div className="mt-2 space-y-1">
                        <p className="font-extrabold text-stone-900 text-sm leading-none">{activeClient.company}</p>
                        <p className="text-stone-700 font-medium">{activeClient.name}</p>
                        <p className="text-stone-500 leading-normal">
                          {activeClient.phone}<br />
                          {activeClient.email}
                        </p>
                      </div>
                    </div>

                    <div className="border-l border-stone-200 pl-6">
                      <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">ROUTE & TRANSPORT SPEC</h4>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-1.5 font-extrabold text-stone-950 text-sm">
                          <span>{quoteFrom}</span>
                          <ArrowRight size={12} className="text-stone-400" />
                          <span>{quoteTo}</span>
                        </div>
                        <p className="text-stone-700 font-semibold flex items-center gap-1">
                          Vehicle Type: <span className="text-[#D946C4] font-mono">{quoteTruck}</span>
                        </p>
                        <p className="text-stone-500">
                          Estimated Distance: <span className="font-mono font-semibold">{distanceKm} km</span><br />
                          Validity: <span className="text-stone-700 font-semibold">Valid until {validUntil}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Itemized Charges Table */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">ITEMIZED PRICE SCHEDULE</h4>
                    <div className="border border-stone-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-stone-100 border-b border-stone-200 text-[10px] font-mono text-stone-600 uppercase tracking-wider">
                            <th className="py-2.5 px-4">Line Item Description</th>
                            <th className="py-2.5 px-4 text-center">Equipment / Context</th>
                            <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-[11px] text-stone-800">
                          {/* Base Freight Rate */}
                          <tr>
                            <td className="py-3 px-4">
                              <span className="font-bold text-stone-900 block">Base Freight Route Charges</span>
                              <span className="text-[10px] text-stone-500">Fixed rate of transport lane ({quoteFrom} to {quoteTo})</span>
                            </td>
                            <td className="py-3 px-4 text-center text-stone-600 font-mono">{quoteTruck}</td>
                            <td className="py-3 px-4 text-right font-mono font-semibold">₹{formatIndianNumber(calculations.baseAmount)}</td>
                          </tr>

                          {/* Surcharges */}
                          {additionalCharges.map(charge => (
                            <tr key={charge.id}>
                              <td className="py-2.5 px-4 font-medium text-stone-800">{charge.label}</td>
                              <td className="py-2.5 px-4 text-center text-stone-500 font-mono">Auxiliary charge</td>
                              <td className="py-2.5 px-4 text-right font-mono">₹{formatIndianNumber(charge.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* Bottom Total Block & T&C */}
                <div className="mt-8 space-y-6">
                  
                  {/* Totals Section */}
                  <div className="flex justify-between items-start border-t border-stone-200 pt-5 gap-6">
                    {/* Convert to words block */}
                    <div className="flex-1">
                      <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Amount in Words</h4>
                      <p className="text-[10px] font-semibold text-stone-600 italic mt-1 font-sans">
                        {convertNumberToWords(calculations.grandTotal)}
                      </p>

                      <div className="mt-4">
                        <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Terms & Reference Notes</h4>
                        <p className="text-[9px] text-stone-500 leading-relaxed mt-1 whitespace-pre-line">
                          {notes}
                        </p>
                      </div>
                    </div>

                    {/* Totals Calculation */}
                    <div className="w-56 bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2 select-none">
                      <div className="flex justify-between text-stone-600">
                        <span>Base Total:</span>
                        <span className="font-mono">₹{formatIndianNumber(calculations.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>GST ({gstRate}%):</span>
                        <span className="font-mono">₹{formatIndianNumber(calculations.gstAmount)}</span>
                      </div>
                      <div className="border-t border-stone-200/80 my-1 pt-1.5 flex justify-between font-extrabold text-stone-900 text-sm">
                        <span className="text-[#D946C4]">Grand Total:</span>
                        <span className="font-mono text-[#D946C4]">₹{formatIndianNumber(calculations.grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stamp/Signatory area */}
                  <div className="flex justify-between items-center border-t border-stone-100 pt-5 text-[10px] text-stone-500">
                    <div>
                      <p className="font-mono">IP Address logged: 192.168.1.103</p>
                      <p className="mt-0.5">Quotation Ref: <strong>{quoteNo}</strong></p>
                    </div>

                    <div className="text-right">
                      {/* Signature line */}
                      <div className="inline-block border-b border-stone-300 w-36 text-center font-serif text-[#D946C4] font-bold italic mb-1 select-none">
                        Vanguard Auth
                      </div>
                      <p className="font-mono">Authorized Representative Stamp</p>
                      <p className="text-[9px] text-stone-400 mt-0.5 italic">This is a system-generated quotation.</p>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== ADD REFERENCE ROUTE MODAL DIALOG ==================== */}
      <AnimatePresence>
        {isAddRouteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddRouteModalOpen(false)}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-stone-900 border border-white/10 rounded-2xl p-6 shadow-2xl w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#D946C4]/10 border border-[#D946C4]/20 flex items-center justify-center text-[#D946C4]">
                    <Plus size={16} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-white">Add Reference Route Lane</h3>
                    <p className="text-[10px] text-white/55">Create reference rates to auto-populate Quote Builders</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddRouteModalOpen(false)}
                  className="text-white/40 hover:text-white p-1"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddRoute} className="space-y-4">
                {/* Cities and distance */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">From City</label>
                    <input
                      type="text"
                      placeholder="e.g., Bhopal"
                      value={newFrom}
                      onChange={(e) => setNewFrom(e.target.value)}
                      className="w-full bg-stone-950 border border-white/10 rounded-xl h-9 px-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D946C4]/40"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">To City</label>
                    <input
                      type="text"
                      placeholder="e.g., Indore"
                      value={newTo}
                      onChange={(e) => setNewTo(e.target.value)}
                      className="w-full bg-stone-950 border border-white/10 rounded-xl h-9 px-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D946C4]/40"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/40 uppercase block">Distance (km)</label>
                    <input
                      type="number"
                      placeholder="e.g., 195"
                      value={newDistance}
                      onChange={(e) => setNewDistance(e.target.value)}
                      className="w-full bg-stone-950 border border-white/10 rounded-xl h-9 px-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D946C4]/40"
                      required
                    />
                  </div>
                </div>

                {/* Sub title rates */}
                <div className="border-t border-white/5 pt-3">
                  <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2 font-mono">Rates per Vehicle Class (₹)</h4>
                  <p className="text-[9px] text-white/40 mb-3 font-sans">Enter base prices. Leaving blank will automatically calculate baseline estimates based on distance.</p>

                  <div className="space-y-2.5">
                    {truckTypes.map(truck => (
                      <div key={truck} className="flex items-center justify-between gap-4">
                        <span className="text-xs text-white/80 font-medium">{truck}</span>
                        <div className="relative w-44">
                          <span className="absolute left-3 top-2 text-white/40 text-xs">₹</span>
                          <input
                            type="number"
                            placeholder="Estimate (Calculated)"
                            value={newRates[truck]}
                            onChange={(e) => setNewRates(prev => ({ ...prev, [truck]: e.target.value }))}
                            className="w-full bg-stone-950 border border-white/10 rounded-lg h-8 pl-6 pr-3 text-xs text-white placeholder-white/20 text-right focus:outline-none focus:border-[#D946C4]/40"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 border-t border-white/5 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddRouteModalOpen(false)}
                    className="px-4 h-9 rounded-xl border border-white/10 hover:bg-white/5 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 h-9 rounded-xl bg-[#D946C4] hover:bg-[#D946C4]/80 text-white text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    Add Lane Route
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
