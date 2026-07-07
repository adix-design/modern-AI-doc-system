import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  ArrowRight, 
  MessageSquare, 
  Trophy, 
  Users, 
  Briefcase, 
  Clock, 
  ArrowUpRight, 
  X,
  FileText,
  DollarSign,
  Star,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces for our Client Data Structure
interface ClientJob {
  id: string;
  route: string;
  date: string;
  amount: number;
  status: 'Delivered' | 'In Transit' | 'Pending';
}

interface Client {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  route: string;
  lastJobDate: string;
  totalEarned: number;
  initial: string;
  notes: string;
  jobs: ClientJob[];
}

interface Company {
  id: string;
  name: string;
  revenue: number;
  clients: Client[];
  isNew?: boolean;
}

// Pre-seeded high-fidelity mock data with Indian contexts, realistic routes, and phone numbers
const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    name: 'Apex Foods International',
    revenue: 145000,
    clients: [
      {
        id: 'client-101',
        name: 'Amit Sharma',
        role: 'Logistics Head',
        phone: '+91 98765 43210',
        email: 'amit.sharma@apexfoods.in',
        route: 'Delhi → Mumbai',
        lastJobDate: '2026-07-01',
        totalEarned: 45000,
        initial: 'AS',
        notes: 'Prefers reefers with strict temperature logs. Prefers morning dispatches.',
        jobs: [
          { id: 'LD-9821', route: 'Delhi → Mumbai', date: '2026-07-01', amount: 45000, status: 'In Transit' },
          { id: 'LD-9102', route: 'Delhi → Mumbai', date: '2026-06-15', amount: 45000, status: 'Delivered' },
          { id: 'LD-8501', route: 'Amritsar → Delhi', date: '2026-05-20', amount: 22000, status: 'Delivered' }
        ]
      },
      {
        id: 'client-102',
        name: 'Priya Patel',
        role: 'Supply Chain Manager',
        phone: '+91 99887 76655',
        email: 'priya.patel@apexfoods.in',
        route: 'Ahmedabad → Pune',
        lastJobDate: '2026-06-28',
        totalEarned: 38000,
        initial: 'PP',
        notes: 'Excellent payer, usually clears invoice within 10 days of Proof of Delivery upload.',
        jobs: [
          { id: 'LD-8172', route: 'Ahmedabad → Pune', date: '2026-06-28', amount: 38000, status: 'Delivered' },
          { id: 'LD-7290', route: 'Surat → Pune', date: '2026-05-12', amount: 24000, status: 'Delivered' }
        ]
      },
      {
        id: 'client-103',
        name: 'Rajesh Gupta',
        role: 'Procurement Specialist',
        phone: '+91 91234 56789',
        email: 'rajesh.gupta@apexfoods.in',
        route: 'Indore → Bhopal',
        lastJobDate: '2026-07-04',
        totalEarned: 32000,
        initial: 'RG',
        notes: 'Requires daily WhatsApp updates for tracking. Very specific about driver checklist verification.',
        jobs: [
          { id: 'LD-4029', route: 'Indore → Bhopal', date: '2026-07-04', amount: 32000, status: 'Delivered' }
        ]
      },
      {
        id: 'client-104',
        name: 'Meera Nair',
        role: 'Operations Lead',
        phone: '+91 90123 45678',
        email: 'meera.nair@apexfoods.in',
        route: 'Bangalore → Cochin',
        lastJobDate: '2026-07-03',
        totalEarned: 30000,
        initial: 'MN',
        notes: 'Handles Southern regional supply routes. Prefers double-driver long hauls.',
        jobs: [
          { id: 'LD-5521', route: 'Bangalore → Cochin', date: '2026-07-03', amount: 30000, status: 'Delivered' }
        ]
      }
    ]
  },
  {
    id: 'comp-2',
    name: 'Titan Industrial Supply',
    revenue: 98400,
    clients: [
      {
        id: 'client-201',
        name: 'Vikram Singh',
        role: 'Director of Transport',
        phone: '+91 88888 88888',
        email: 'vikram.singh@titanindustrial.co.in',
        route: 'Jaipur → Noida',
        lastJobDate: '2026-07-02',
        totalEarned: 54400,
        initial: 'VS',
        notes: 'Requires heavy-duty flatbed trucks. Multi-point dropoff sometimes required.',
        jobs: [
          { id: 'LD-3011', route: 'Jaipur → Noida', date: '2026-07-02', amount: 54400, status: 'In Transit' },
          { id: 'LD-1102', route: 'Jaipur → Gurgaon', date: '2026-06-10', amount: 48000, status: 'Delivered' }
        ]
      },
      {
        id: 'client-202',
        name: 'Anjali Rao',
        role: 'Regional Dispatcher',
        phone: '+91 77777 77777',
        email: 'anjali.rao@titanindustrial.co.in',
        route: 'Chennai → Bangalore',
        lastJobDate: '2026-06-25',
        totalEarned: 44000,
        initial: 'AR',
        notes: 'Key contact for South India industrial cargo lanes. Active on weekends.',
        jobs: [
          { id: 'LD-8812', route: 'Chennai → Bangalore', date: '2026-06-25', amount: 44000, status: 'Delivered' }
        ]
      }
    ]
  },
  {
    id: 'comp-3',
    name: 'Noida Freight Carriers',
    revenue: 78000,
    clients: [
      {
        id: 'client-301',
        name: 'Sanjay Dutt',
        role: 'Fleet Coordinator',
        phone: '+91 95555 55555',
        email: 'sanjay.dutt@noidafreight.com',
        route: 'Noida → Jaipur',
        lastJobDate: '2026-07-03',
        totalEarned: 42000,
        initial: 'SD',
        notes: 'Aggregator partner, matches empty backhaul runs for our dedicated trucks.',
        jobs: [
          { id: 'LD-9281', route: 'Noida → Jaipur', date: '2026-07-03', amount: 42000, status: 'Delivered' }
        ]
      },
      {
        id: 'client-302',
        name: 'Divya Dutta',
        role: 'Client Partner',
        phone: '+91 94444 44444',
        email: 'divya.dutta@noidafreight.com',
        route: 'Delhi → Ludhiana',
        lastJobDate: '2026-06-29',
        totalEarned: 36000,
        initial: 'DD',
        notes: 'Manages agricultural logistics supply lines around Punjab area.',
        jobs: [
          { id: 'LD-7112', route: 'Delhi → Ludhiana', date: '2026-06-29', amount: 36000, status: 'Delivered' }
        ]
      }
    ]
  },
  {
    id: 'comp-4',
    name: 'Sharma Agri Logistics',
    revenue: 47500,
    clients: [
      {
        id: 'client-401',
        name: 'Baldev Singh',
        role: 'Operations Manager',
        phone: '+91 93333 33333',
        email: 'baldev.singh@sharmaagri.com',
        route: 'Amritsar → Delhi',
        lastJobDate: '2026-07-05',
        totalEarned: 47500,
        initial: 'BS',
        notes: 'Highly seasonal shipments (wheat & rice harvests). Needs immediate dispatch confirmations.',
        jobs: [
          { id: 'LD-6045', route: 'Amritsar → Delhi', date: '2026-07-05', amount: 47500, status: 'Delivered' }
        ]
      }
    ]
  },
  {
    id: 'comp-5',
    name: 'Vanguard Express Co.',
    revenue: 32400,
    clients: [
      {
        id: 'client-501',
        name: 'Rohan Mehta',
        role: 'Branch Supervisor',
        phone: '+91 92222 22222',
        email: 'rohan.mehta@vanguardexp.in',
        route: 'Indore → Gwalior',
        lastJobDate: '2026-07-02',
        totalEarned: 32400,
        initial: 'RM',
        notes: 'Requires digital signatures instantly via SMS link for all cargo drops.',
        jobs: [
          { id: 'LD-5290', route: 'Indore → Gwalior', date: '2026-07-02', amount: 32400, status: 'Delivered' }
        ]
      }
    ]
  },
  {
    id: 'comp-6',
    name: 'Hindustan Polymers',
    revenue: 0,
    isNew: true,
    clients: [
      {
        id: 'client-601',
        name: 'Suresh Kumar',
        role: 'Procurement Executive',
        phone: '+91 91111 11111',
        email: 'suresh.kumar@hindpolymers.com',
        route: 'Vadodara → Surat',
        lastJobDate: '-',
        totalEarned: 0,
        initial: 'SK',
        notes: 'New account onboarded on July 4, credit limit set to ₹1,00,000. Undergoing initial freight lane bidding.',
        jobs: []
      }
    ]
  }
];

export default function Clients() {
  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('vanguard_companies');
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'grouped' | 'flat'>('grouped');
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({
    'comp-1': true, // Keep first company expanded on mount by default
  });
  const [sortBy, setSortBy] = useState<'revenue' | 'clients' | 'alpha'>('revenue');
  
  // Track mobile viewport dynamically
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // States for interactive custom features
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedClientCompany, setSelectedClientCompany] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [clientNotes, setClientNotes] = useState<string>('');

  // Add Client Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientRole, setNewClientRole] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientRoute, setNewClientRoute] = useState('');
  const [newClientEarned, setNewClientEarned] = useState('0');
  const [newClientNotes, setNewClientNotes] = useState('');

  // Persist companies state in browser local storage
  useEffect(() => {
    localStorage.setItem('vanguard_companies', JSON.stringify(companies));
  }, [companies]);

  // Handle search navigation highlights
  useEffect(() => {
    const handleSearchNavigate = () => {
      const targetCompanyId = localStorage.getItem('vanguard_last_selected_company');
      const targetClientId = localStorage.getItem('vanguard_last_selected_client');
      if (targetCompanyId) {
        // Expand the company
        setExpandedCompanies(prev => ({
          ...prev,
          [targetCompanyId]: true
        }));
        // If client is targeted, open client detail
        if (targetClientId) {
          const comp = companies.find(c => c.id === targetCompanyId);
          if (comp) {
            const client = comp.clients.find(cl => cl.id === targetClientId);
            if (client) {
              setSelectedClient(client);
              setSelectedClientCompany(comp.name);
            }
          }
        }
        // Clear them out of localStorage so we don't trigger recursively
        localStorage.removeItem('vanguard_last_selected_company');
        localStorage.removeItem('vanguard_last_selected_client');
      }
    };

    // Run on mount or when companies change
    handleSearchNavigate();

    window.addEventListener('vanguard-search-navigate-client', handleSearchNavigate);
    return () => window.removeEventListener('vanguard-search-navigate-client', handleSearchNavigate);
  }, [companies]);

  // Sync active client notes with local storage when selected client changes or user updates notes
  useEffect(() => {
    if (selectedClient) {
      setClientNotes(selectedClient.notes);
    }
  }, [selectedClient]);

  // Handle Note Save function
  const handleSaveNotes = () => {
    if (!selectedClient) return;
    setCompanies(prevCompanies => {
      const updated = prevCompanies.map(comp => {
        const hasClient = comp.clients.some(c => c.id === selectedClient.id);
        if (!hasClient) return comp;
        return {
          ...comp,
          clients: comp.clients.map(c => c.id === selectedClient.id ? { ...c, notes: clientNotes } : c)
        };
      });
      
      // Also update selectedClient state to display the change
      setSelectedClient(prev => prev ? { ...prev, notes: clientNotes } : null);
      return updated;
    });
  };

  // Tap-to-Copy Phone to Clipboard function
  const handleCopyToClipboard = (text: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    });
  };

  // Toggle expand/collapse state of a company card
  const toggleCompany = (companyId: string) => {
    setExpandedCompanies(prev => ({
      ...prev,
      [companyId]: !prev[companyId]
    }));
  };

  // Toggle active view of a specific row to open Drawer
  const openClientDetail = (client: Client, companyName: string) => {
    setSelectedClient(client);
    setSelectedClientCompany(companyName);
  };

  // Quick stats calculation
  const totalClients = companies.reduce((acc, comp) => acc + comp.clients.length, 0);
  const totalCompanies = companies.length;
  const topCompany = [...companies]
    .filter(c => !c.isNew)
    .sort((a, b) => b.revenue - a.revenue)[0] || { name: 'None', revenue: 0 };

  // Indian Numbering System formatting helper (e.g., ₹1,24,500)
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Handle addition of a new client
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientCompany) return;

    const formattedInitial = newClientName
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const generatedId = `client-${Date.now()}`;
    const earnedAmount = parseFloat(newClientEarned) || 0;

    const newClientObj: Client = {
      id: generatedId,
      name: newClientName,
      role: newClientRole || 'Key Contact',
      phone: newClientPhone || '+91 99999 99999',
      email: newClientEmail || `${newClientName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      route: newClientRoute || 'Delhi → Indore',
      lastJobDate: earnedAmount > 0 ? new Date().toISOString().split('T')[0] : '-',
      totalEarned: earnedAmount,
      initial: formattedInitial || 'C',
      notes: newClientNotes || 'Onboarded via operator.',
      jobs: earnedAmount > 0 ? [
        {
          id: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
          route: newClientRoute || 'Delhi → Indore',
          date: new Date().toISOString().split('T')[0],
          amount: earnedAmount,
          status: 'Delivered'
        }
      ] : []
    };

    setCompanies(prevCompanies => {
      // Find if the company already exists
      const existingCompanyIndex = prevCompanies.findIndex(
        c => c.name.toLowerCase().trim() === newClientCompany.toLowerCase().trim()
      );

      if (existingCompanyIndex !== -1) {
        // Company exists, add client and update revenue
        return prevCompanies.map((c, idx) => {
          if (idx !== existingCompanyIndex) return c;
          return {
            ...c,
            revenue: c.revenue + earnedAmount,
            isNew: c.isNew && earnedAmount === 0, // No longer new if there is revenue
            clients: [...c.clients, newClientObj]
          };
        });
      } else {
        // Create new company
        const newCompanyObj: Company = {
          id: `comp-${Date.now()}`,
          name: newClientCompany,
          revenue: earnedAmount,
          isNew: earnedAmount === 0,
          clients: [newClientObj]
        };
        return [...prevCompanies, newCompanyObj];
      }
    });

    // Reset Form & Close Modal
    setNewClientName('');
    setNewClientRole('');
    setNewClientCompany('');
    setNewClientPhone('');
    setNewClientEmail('');
    setNewClientRoute('');
    setNewClientEarned('0');
    setNewClientNotes('');
    setIsAddModalOpen(false);
  };

  // Sorting and Filtering logic
  const filteredCompanies = companies
    .map(comp => {
      // Filter clients within each company based on search
      const matchedClients = comp.clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.route.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        ...comp,
        filteredClients: matchedClients
      };
    })
    .filter(comp => {
      // Keep company if company name matches OR has matched clients
      return comp.name.toLowerCase().includes(searchTerm.toLowerCase()) || comp.filteredClients.length > 0;
    });

  // Sort companies
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (sortBy === 'revenue') {
      return b.revenue - a.revenue;
    } else if (sortBy === 'clients') {
      return b.clients.length - a.clients.length;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  // Flat list of all clients for Flat View
  const flatClientsList: { client: Client; companyName: string; isNew?: boolean }[] = [];
  companies.forEach(comp => {
    comp.clients.forEach(c => {
      if (
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.route.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        flatClientsList.push({ client: c, companyName: comp.name, isNew: comp.isNew });
      }
    });
  });

  // Sort flat list (by earned value descending by default)
  flatClientsList.sort((a, b) => b.client.totalEarned - a.client.totalEarned);

  return (
    <div id="premium-clients-container" className="space-y-6 flex flex-col flex-1 relative">
      
      {/* ==================== 1. HEADER ROW ==================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-white text-sm font-semibold tracking-wider uppercase font-mono">Shipper & Broker Directories</h4>
          <p className="text-xs text-white/50">Track billing volume and contacts grouped by broker corporate entity</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Frosted Pill Search input */}
          <div className="relative w-64 md:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              <Search size={14} />
            </span>
            <input
              id="clients-search-bar"
              type="text"
              placeholder="Search name, company, route, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-full bg-white/5 hover:bg-white/8 focus:bg-white/10 text-xs text-white placeholder-white/40 border border-white/5 focus:border-[#D946C4]/30 focus:outline-none transition-all duration-200"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40 hover:text-white bg-white/10 px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          {/* Primary Action: Solid Warm-Amber Add Client button */}
          <button
            id="add-client-primary-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 h-9 bg-[#D946C4] hover:bg-[#D946C4]/80 text-white text-xs font-semibold rounded-full transition-all duration-200 shadow-lg shadow-[#D946C4]/10 hover:shadow-[#D946C4]/25 active:scale-95 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* ==================== 2. SUMMARY STRIP ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat Chip 1: Total Clients */}
        <div className="flex items-center gap-3 bg-white/4 border border-white/5 rounded-xl px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
          <div className="w-8 h-8 rounded-lg bg-[#D946C4]/10 flex items-center justify-center text-[#D946C4] border border-[#D946C4]/10">
            <Users size={15} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Total Clients</span>
            <span className="text-sm font-semibold text-white mt-0.5 block">{totalClients} Contacts Active</span>
          </div>
        </div>

        {/* Stat Chip 2: Total Companies */}
        <div className="flex items-center gap-3 bg-white/4 border border-white/5 rounded-xl px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
          <div className="w-8 h-8 rounded-lg bg-[#D946C4]/10 flex items-center justify-center text-[#D946C4] border border-[#D946C4]/10">
            <Building2 size={15} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Total Companies</span>
            <span className="text-sm font-semibold text-white mt-0.5 block">{totalCompanies} Corporate Entities</span>
          </div>
        </div>

        {/* Stat Chip 3: Top Company This Month */}
        <div className="flex items-center gap-3 bg-white/4 border border-white/5 rounded-xl px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
          <div className="w-8 h-8 rounded-lg bg-[#7C6FE0]/10 flex items-center justify-center text-[#7C6FE0] border border-[#7C6FE0]/10">
            <Trophy size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Top Broker Lane</span>
            <span className="text-sm font-semibold text-white truncate block flex items-center gap-1">
              {topCompany.name} <span className="text-[#7C6FE0] text-xs font-mono">({formatINR(topCompany.revenue)})</span>
            </span>
          </div>
        </div>
      </div>

      {/* ==================== 3. VIEW TOGGLE & SORTING BAR ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        {/* View Toggle Segmented Control */}
        <div className="inline-flex p-0.5 rounded-lg bg-stone-950/40 border border-white/5 self-start">
          <button
            onClick={() => setViewType('grouped')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewType === 'grouped' 
                ? 'bg-white/10 text-white font-semibold border-b border-white/5 shadow-inner' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            Grouped by Company
          </button>
          <button
            onClick={() => setViewType('flat')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewType === 'flat' 
                ? 'bg-white/10 text-white font-semibold border-b border-white/5 shadow-inner' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            All Clients (Flat List)
          </button>
        </div>

        {/* Sorting Dropdown (Only visible or active in Grouped View) */}
        {viewType === 'grouped' && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/45 uppercase">Sort Companies:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'revenue' | 'clients' | 'alpha')}
              className="bg-stone-900/60 hover:bg-stone-900 border border-white/10 text-white/80 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#D946C4]/40 font-mono transition-colors cursor-pointer"
            >
              <option value="revenue">By Revenue (Desc)</option>
              <option value="clients">By Client Count</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
        )}
      </div>

      {/* ==================== 4. MAIN CONTENT PANEL ==================== */}
      <div className="flex-1">
        
        {/* ==================== 4A. GROUPED VIEW ==================== */}
        {viewType === 'grouped' && (
          <div className="space-y-4">
            {sortedCompanies.length === 0 ? (
              <div className="p-12 text-center text-white/40 border border-dashed border-white/5 rounded-2xl bg-white/2">
                <Users size={28} className="mx-auto mb-2 text-white/20" />
                <p className="text-xs font-semibold">No companies match your query.</p>
                <p className="text-[10px] text-white/20 mt-1">Try modifying your filters or search criteria.</p>
              </div>
            ) : (
              sortedCompanies.map((company, cIndex) => {
                const isExpanded = expandedCompanies[company.id] || false;
                const matchCount = company.filteredClients?.length || 0;

                return (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 250, delay: cIndex * 35 }}
                    className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden shadow-md group/card transition-all duration-300"
                  >
                    {/* Collapsible Company Card Header */}
                    <div
                      onClick={() => toggleCompany(company.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/3 transition-colors select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-stone-900/50 flex items-center justify-center text-white/70 border border-white/5">
                          <Building2 size={14} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-white tracking-wide">{company.name}</h5>
                            <span className="px-1.5 py-0.2 bg-white/5 border border-white/5 text-[9px] font-mono text-white/55 rounded-full">
                              {company.clients.length} {company.clients.length === 1 ? 'contact' : 'contacts'}
                            </span>
                            {searchTerm && matchCount > 0 && (
                              <span className="px-1.5 py-0.2 bg-[#D946C4]/10 border border-[#D946C4]/20 text-[9px] font-mono text-[#D946C4] rounded-full">
                                {matchCount} match
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-white/35 mt-0.5">Corporate Broker Profile</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Empty company state / Revenue label */}
                        {company.isNew ? (
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded font-mono text-[9px] uppercase tracking-widest font-semibold">
                            New — no jobs yet
                          </span>
                        ) : (
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-[#D946C4]">{formatINR(company.revenue)}</span>
                            <span className="text-[9px] text-white/30 block font-mono uppercase tracking-widest mt-0.5">volume</span>
                          </div>
                        )}

                        <div className="w-7 h-7 rounded-lg bg-white/5 group-hover/card:bg-white/10 flex items-center justify-center text-white/50 transition-colors">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Contacts Table */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 250, ease: 'easeInOut' }}
                          className="overflow-hidden border-t border-white/5"
                        >
                          <div className="overflow-x-auto">
                            {/* Desktop/Tablet Table */}
                            <table className="w-full text-left border-collapse hidden md:table">
                              <thead>
                                <tr className="border-b border-white/5 bg-white/2 text-[9px] font-mono uppercase tracking-wider text-white/40">
                                  <th className="py-3 px-4">Contact</th>
                                  <th className="py-3 px-4">Phone</th>
                                  <th className="py-3 px-4">Primary Lane</th>
                                  <th className="py-3 px-4">Last Job</th>
                                  <th className="py-3 px-4 text-right">Earned</th>
                                  <th className="py-3 px-4 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/4 text-xs text-white/80">
                                {(searchTerm ? company.filteredClients : company.clients).map((client) => (
                                  <tr
                                    key={client.id}
                                    onClick={() => openClientDetail(client, company.name)}
                                    className="hover:bg-white/3 transition-colors cursor-pointer group/row"
                                  >
                                    {/* Name and avatar */}
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-[#D946C4]/10 border border-[#D946C4]/20 flex items-center justify-center font-display font-bold text-[#D946C4] text-[10px]">
                                          {client.initial}
                                        </div>
                                        <div>
                                          <span className="font-semibold text-white group-hover/row:text-[#D946C4] transition-colors block">{client.name}</span>
                                          <span className="text-[10px] text-white/40 block mt-0.5">{client.role}</span>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Phone with copy action */}
                                    <td className="py-3 px-4 font-mono text-[11px] text-white/60">
                                      <div className="flex items-center gap-1.5">
                                        <span>{client.phone}</span>
                                        <button
                                          onClick={(e) => handleCopyToClipboard(client.phone, client.id, e)}
                                          className="text-white/30 hover:text-[#D946C4] p-1 rounded hover:bg-white/5 transition-colors"
                                          title="Copy phone"
                                        >
                                          {copiedId === client.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                        </button>
                                      </div>
                                    </td>

                                    {/* Route Lane pill */}
                                    <td className="py-3 px-4">
                                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-white/70">
                                        <span>{client.route.split('→')[0].trim()}</span>
                                        <ArrowRight size={9} className="text-white/30" />
                                        <span>{client.route.split('→')[1].trim()}</span>
                                      </span>
                                    </td>

                                    {/* Last Job Date */}
                                    <td className="py-3 px-4 font-mono text-[11px] text-white/50">
                                      {client.lastJobDate}
                                    </td>

                                    {/* Total Earned */}
                                    <td className="py-3 px-4 text-right font-mono font-bold text-white/90">
                                      {client.totalEarned === 0 ? (
                                        <span className="text-white/30 font-normal text-[10px]">-</span>
                                      ) : (
                                        formatINR(client.totalEarned)
                                      )}
                                    </td>

                                    {/* Non-functional fast contact */}
                                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-center gap-1">
                                        <a
                                          href={`https://wa.me/${client.phone.replace(/[\s+]/g, '')}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="w-6 h-6 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center transition-colors"
                                          title="Open WhatsApp chat"
                                        >
                                          <MessageSquare size={11} />
                                        </a>
                                        <a
                                          href={`tel:${client.phone}`}
                                          className="w-6 h-6 rounded bg-[#7C6FE0]/10 hover:bg-[#7C6FE0]/20 text-[#7C6FE0] border border-[#7C6FE0]/20 flex items-center justify-center transition-colors"
                                          title="Make Call"
                                        >
                                          <Phone size={11} />
                                        </a>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            {/* Mobile Card Layout */}
                            <div className="md:hidden divide-y divide-white/5 bg-white/2">
                              {(searchTerm ? company.filteredClients : company.clients).map((client) => (
                                <div 
                                  key={client.id}
                                  onClick={() => openClientDetail(client, company.name)}
                                  className="p-4 space-y-3 hover:bg-white/3 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-full bg-[#D946C4]/10 border border-[#D946C4]/20 flex items-center justify-center font-display font-bold text-[#D946C4] text-[10px]">
                                        {client.initial}
                                      </div>
                                      <div>
                                        <h6 className="font-semibold text-white">{client.name}</h6>
                                        <span className="text-[10px] text-white/40 block">{client.role}</span>
                                      </div>
                                    </div>
                                    <span className="text-xs font-bold text-[#D946C4]">{client.totalEarned === 0 ? '-' : formatINR(client.totalEarned)}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-[11px] text-white/60 bg-white/1 rounded-lg p-2 font-mono">
                                    <div>
                                      <span className="text-[9px] text-white/30 block">PHONE</span>
                                      <span>{client.phone}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-white/30 block">PRIMARY LANE</span>
                                      <span>{client.route}</span>
                                    </div>
                                    <div className="col-span-2 pt-1 border-t border-white/5 flex justify-between items-center">
                                      <div>
                                        <span className="text-[9px] text-white/30 block">LAST JOB</span>
                                        <span>{client.lastJobDate}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                        <a
                                          href={`https://wa.me/${client.phone.replace(/[\s+]/g, '')}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="w-7 h-7 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center transition-colors"
                                        >
                                          <MessageSquare size={12} />
                                        </a>
                                        <a
                                          href={`tel:${client.phone}`}
                                          className="w-7.5 h-7.5 rounded bg-[#7C6FE0]/10 hover:bg-[#7C6FE0]/20 text-[#7C6FE0] border border-[#7C6FE0]/20 flex items-center justify-center transition-colors"
                                        >
                                          <Phone size={12} />
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* ==================== 4B. FLAT LIST VIEW ==================== */}
        {viewType === 'flat' && (
          <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden shadow-md">
            {flatClientsList.length === 0 ? (
              <div className="p-12 text-center text-white/40">
                <Users size={28} className="mx-auto mb-2 text-white/20" />
                <p className="text-xs font-semibold">No contacts match your query.</p>
                <p className="text-[10px] text-white/20 mt-1">Try resetting the search bar filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto animate-fade-in">
                {/* Desktop / Tablet Table */}
                <table className="w-full text-left border-collapse hidden md:table">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/2 text-[9px] font-mono uppercase tracking-wider text-white/40">
                      <th className="py-3.5 px-5">Contact Name</th>
                      <th className="py-3.5 px-5">Broker Company</th>
                      <th className="py-3.5 px-5">Phone</th>
                      <th className="py-3.5 px-5">Primary Route Lane</th>
                      <th className="py-3.5 px-5">Last Haul Date</th>
                      <th className="py-3.5 px-5 text-right">Lifetime Volume</th>
                      <th className="py-3.5 px-5 text-center">Connect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/4 text-xs text-white/80">
                    {flatClientsList.map(({ client, companyName, isNew }) => (
                      <tr
                        key={client.id}
                        onClick={() => openClientDetail(client, companyName)}
                        className="hover:bg-white/3 transition-colors cursor-pointer group/flatrow"
                      >
                        {/* Avatar + name */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#D946C4]/10 border border-[#D946C4]/20 flex items-center justify-center font-display font-bold text-[#D946C4] text-xs">
                              {client.initial}
                            </div>
                            <div>
                              <span className="font-semibold text-white group-hover/flatrow:text-[#D946C4] transition-colors block">{client.name}</span>
                              <span className="text-[10px] text-white/40 block mt-0.5">{client.role}</span>
                            </div>
                          </div>
                        </td>

                        {/* Company reference */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-white/90">{companyName}</span>
                            {isNew && (
                              <span className="px-1.5 py-0.1 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-[4px] text-[8px] font-mono uppercase">New</span>
                            )}
                          </div>
                        </td>

                        {/* Phone with copy action */}
                        <td className="py-3.5 px-5 font-mono text-[11px] text-white/60">
                          <div className="flex items-center gap-1.5">
                            <span>{client.phone}</span>
                            <button
                              onClick={(e) => handleCopyToClipboard(client.phone, client.id, e)}
                              className="text-white/30 hover:text-[#D946C4] p-1 rounded hover:bg-white/5 transition-colors"
                            >
                              {copiedId === client.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            </button>
                          </div>
                        </td>

                        {/* Route lane pill */}
                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-white/70">
                            <span>{client.route.split('→')[0].trim()}</span>
                            <ArrowRight size={9} className="text-white/30" />
                            <span>{client.route.split('→')[1].trim()}</span>
                          </span>
                        </td>

                        {/* Last job date */}
                        <td className="py-3.5 px-5 font-mono text-[11px] text-white/50">
                          {client.lastJobDate}
                        </td>

                        {/* Volume */}
                        <td className="py-3.5 px-5 text-right font-mono font-bold text-white/95">
                          {client.totalEarned === 0 ? '-' : formatINR(client.totalEarned)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <a
                              href={`https://wa.me/${client.phone.replace(/[\s+]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-6.5 h-6.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center transition-colors"
                            >
                              <MessageSquare size={11} />
                            </a>
                            <a
                              href={`tel:${client.phone}`}
                              className="w-6.5 h-6.5 rounded bg-[#7C6FE0]/10 hover:bg-[#7C6FE0]/20 text-[#7C6FE0] border border-[#7C6FE0]/20 flex items-center justify-center transition-colors"
                            >
                              <Phone size={11} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Cards Layout */}
                <div className="md:hidden divide-y divide-white/5">
                  {flatClientsList.map(({ client, companyName, isNew }) => (
                    <div
                      key={client.id}
                      onClick={() => openClientDetail(client, companyName)}
                      className="p-4 space-y-3 hover:bg-white/3 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#D946C4]/10 border border-[#D946C4]/20 flex items-center justify-center font-display font-bold text-[#D946C4] text-xs">
                            {client.initial}
                          </div>
                          <div>
                            <h6 className="font-semibold text-white group-hover/flatrow:text-[#D946C4] transition-colors">{client.name}</h6>
                            <span className="text-[10px] text-white/40 block">{client.role}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-white block">{client.totalEarned === 0 ? '-' : formatINR(client.totalEarned)}</span>
                          <span className="text-[9px] text-white/30 block uppercase tracking-wider">volume</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-[11px] text-white/60 bg-white/2 rounded-xl p-3 font-mono">
                        <div className="flex justify-between">
                          <span className="text-white/35">Broker Company:</span>
                          <span className="text-white font-semibold flex items-center gap-1">
                            {companyName}
                            {isNew && (
                              <span className="px-1 py-0.1 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-[4px] text-[7px] font-mono uppercase">New</span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/35">Phone:</span>
                          <span className="text-white/80">{client.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/35">Primary Route Lane:</span>
                          <span className="text-white/85">{client.route}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/35">Last Haul Date:</span>
                          <span className="text-white/80">{client.lastJobDate}</span>
                        </div>
                        
                        <div className="pt-2 border-t border-white/5 flex justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                          <a
                            href={`https://wa.me/${client.phone.replace(/[\s+]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-7.5 h-7.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center transition-colors"
                          >
                            <MessageSquare size={13} />
                          </a>
                          <a
                            href={`tel:${client.phone}`}
                            className="w-7.5 h-7.5 rounded bg-[#7C6FE0]/10 hover:bg-[#7C6FE0]/20 text-[#7C6FE0] border border-[#7C6FE0]/20 flex items-center justify-center transition-colors"
                          >
                            <Phone size={13} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ==================== 5. HIGH-FIDELITY DETAIL DRAWER ==================== */}
      <AnimatePresence>
        {selectedClient && (
          <>
            {/* Backdrop Dim with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 200 }}
              onClick={() => setSelectedClient(null)}
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Sliding Frosted Drawer from right / bottom sheet on mobile */}
            <motion.div
              initial={isMobile ? { y: '100%', x: 0 } : { x: '100%', y: 0 }}
              animate={isMobile ? { y: 0, x: 0 } : { x: 0, y: 0 }}
              exit={isMobile ? { y: '100%', x: 0 } : { x: '100%', y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed left-0 right-0 bottom-0 md:left-auto md:top-0 md:bottom-0 w-full md:max-w-md bg-stone-950/95 backdrop-blur-3xl border-t md:border-t-0 md:border-l border-white/10 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto rounded-t-3xl md:rounded-t-none h-[85vh] md:h-full"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                  <span className="text-[10px] font-mono text-[#D946C4] uppercase tracking-widest font-semibold flex items-center gap-1.5">
                    <Star size={11} className="fill-[#D946C4] text-[#D946C4]" /> Account File
                  </span>
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white border border-white/5 transition-all"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Profile Section */}
                <div className="flex items-center gap-4 bg-white/2 p-4 rounded-2xl border border-white/5 mb-5">
                  <div className="w-14 h-14 rounded-full bg-[#D946C4]/10 border border-[#D946C4]/20 flex items-center justify-center font-display font-bold text-[#D946C4] text-xl">
                    {selectedClient.initial}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white leading-tight">{selectedClient.name}</h4>
                    <p className="text-xs text-[#7C6FE0] font-mono mt-0.5">{selectedClientCompany}</p>
                    <p className="text-[10px] text-white/40 mt-1">{selectedClient.role}</p>
                  </div>
                </div>

                {/* Fast Contacts details */}
                <div className="space-y-3 mb-6">
                  <h5 className="text-[10px] font-mono text-white/45 uppercase tracking-wider">Contact Information</h5>
                  
                  {/* Phone */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                    <div className="flex items-center gap-2.5 text-xs text-white/70">
                      <Phone size={13} className="text-white/40" />
                      <span className="font-mono">{selectedClient.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyToClipboard(selectedClient.phone, 'drawer-phone')}
                        className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 border border-white/5 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === 'drawer-phone' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                      <a
                        href={`https://wa.me/${selectedClient.phone.replace(/[\s+]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-7 h-7 rounded bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20 transition-colors"
                      >
                        <MessageSquare size={12} />
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                    <div className="flex items-center gap-2.5 text-xs text-white/70 truncate">
                      <Mail size={13} className="text-white/40" />
                      <span className="truncate">{selectedClient.email}</span>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(selectedClient.email, 'drawer-email')}
                      className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 flex flex-shrink-0 items-center justify-center text-white/70 border border-white/5 transition-colors"
                      title="Copy email"
                    >
                      {copiedId === 'drawer-email' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>

                  {/* Lane */}
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/3 border border-white/5 text-xs text-white/70">
                    <MapPin size={13} className="text-white/40" />
                    <span>Primary Lane:</span>
                    <span className="font-semibold text-white ml-auto">{selectedClient.route}</span>
                  </div>
                </div>

                {/* Job History List */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-mono text-white/45 uppercase tracking-wider">Historical Load Manifests</h5>
                    <span className="text-[10px] font-mono text-[#D946C4] font-semibold">{selectedClient.jobs.length} completed</span>
                  </div>

                  {selectedClient.jobs.length === 0 ? (
                    <div className="p-6 text-center text-white/30 bg-white/1 border border-white/5 rounded-xl text-[11px]">
                      No active cargo jobs registered yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {selectedClient.jobs.map((job) => (
                        <div key={job.id} className="p-3 bg-white/2 hover:bg-white/4 rounded-xl border border-white/4 flex items-center justify-between text-xs text-white">
                          <div>
                            <span className="font-mono text-[#D946C4] font-bold block">{job.id}</span>
                            <span className="text-[10px] text-white/40 block mt-0.5">{job.route} • {job.date}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-semibold block">{formatINR(job.amount)}</span>
                            <span className={`text-[9px] font-mono uppercase mt-0.5 inline-block ${
                              job.status === 'Delivered' ? 'text-emerald-400' :
                              job.status === 'In Transit' ? 'text-[#D946C4] animate-pulse' : 'text-blue-400'
                            }`}>{job.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interactive Notes Section */}
                <div className="space-y-2.5">
                  <h5 className="text-[10px] font-mono text-white/45 uppercase tracking-wider">Internal Operations Notes</h5>
                  <textarea
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Add operational constraints, billing details or driver warnings..."
                    className="w-full h-24 p-3 rounded-xl bg-white/3 border border-white/8 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D946C4]/40 resize-none leading-relaxed transition-all"
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="py-1.5 px-3 bg-[#D946C4] hover:bg-[#D946C4]/80 text-white rounded-lg text-[11px] font-semibold transition-all float-right cursor-pointer"
                  >
                    Save Notes
                  </button>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6">
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-[11px] font-semibold rounded-lg border border-white/5 transition-all text-center flex items-center justify-center gap-1.5"
                >
                  Close Account Panel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ==================== 6. ADD CLIENT DIALOG MODAL ==================== */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-stone-950/75 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 w-full max-w-lg bg-stone-950/95 border border-white/10 rounded-2xl p-6 shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Plus size={16} className="text-[#D946C4]" /> Onboard New Client Profile
                </h4>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleAddClient} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-mono">Contact Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Ramesh Patel"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/8 text-xs text-white focus:outline-none focus:border-[#D946C4]/40"
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-mono">Broker Company *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Apex Foods International"
                      value={newClientCompany}
                      onChange={(e) => setNewClientCompany(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/8 text-xs text-white focus:outline-none focus:border-[#D946C4]/40"
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-mono">Corporate Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Dispatch Analyst"
                      value={newClientRole}
                      onChange={(e) => setNewClientRole(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/8 text-xs text-white focus:outline-none focus:border-[#D946C4]/40"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-mono">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 99999 99999"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/8 text-xs text-white focus:outline-none focus:border-[#D946C4]/40"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-mono">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. name@company.com"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/8 text-xs text-white focus:outline-none focus:border-[#D946C4]/40"
                    />
                  </div>

                  {/* Route */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-mono">Freight Lane</label>
                    <input
                      type="text"
                      placeholder="e.g. Indore → Delhi"
                      value={newClientRoute}
                      onChange={(e) => setNewClientRoute(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/8 text-xs text-white focus:outline-none focus:border-[#D946C4]/40"
                    />
                  </div>

                  {/* Initial Earned Volume */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] text-white/40 uppercase font-mono">Opening Job Billing (₹) — Optional</label>
                    <input
                      type="number"
                      placeholder="e.g. 45000"
                      value={newClientEarned}
                      onChange={(e) => setNewClientEarned(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/8 text-xs text-white focus:outline-none focus:border-[#D946C4]/40"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase font-mono">Initial Operational Notes</label>
                  <textarea
                    placeholder="Add cargo guidelines, compliance requisites, etc."
                    value={newClientNotes}
                    onChange={(e) => setNewClientNotes(e.target.value)}
                    className="w-full h-20 p-3 rounded-lg bg-white/5 border border-white/8 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D946C4]/40 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold border border-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#D946C4] hover:bg-[#D946C4]/80 text-white rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95"
                  >
                    Onboard Client
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
