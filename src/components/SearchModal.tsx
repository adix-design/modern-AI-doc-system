import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  Truck, 
  Users, 
  FileText, 
  CornerDownLeft, 
  Clock, 
  SearchCode, 
  Sparkles,
  ChevronRight,
  ArrowRight,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageId } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActivePage: (page: PageId) => void;
}

export interface SearchResult {
  id: string;
  category: 'shipments' | 'clients' | 'documents';
  title: string;
  subtitle: string;
  additionalInfo?: string;
  targetPage: PageId;
  payload?: any; // any extra data
}

export default function SearchModal({ isOpen, onClose, setActivePage }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'shipments' | 'clients' | 'documents'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vanguard_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        setRecentSearches([]);
      }
    } else {
      // Default initial recommendations
      setRecentSearches(['Delhi', 'TRK-2901', 'INV-9821']);
    }
  }, [isOpen]);

  // Save a search term
  const saveSearchTerm = (term: string) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...recentSearches.filter(t => t !== cleanTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('vanguard_recent_searches', JSON.stringify(updated));
  };

  // Remove a search term
  const removeSearchTerm = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(t => t !== term);
    setRecentSearches(updated);
    localStorage.setItem('vanguard_recent_searches', JSON.stringify(updated));
  };

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Base datasets compiled from shipments, clients and documents
  const searchIndex = useMemo<SearchResult[]>(() => {
    const items: SearchResult[] = [];

    // 1. SHIPMENTS
    const shipmentsList = [
      {
        id: 'trk-2901',
        title: '#TRK-2901: Los Angeles to Seattle',
        subtitle: 'In Transit • Sarah Jenkins • 53\' Reefer',
        additionalInfo: 'Load ID: #TRK-2901 Rate: $4,250 Vanguard Dedicated Fleet Route: LA to Seattle, WA',
        targetPage: 'shipments' as PageId
      },
      {
        id: 'trk-1823',
        title: '#TRK-1823: Phoenix to Chicago',
        subtitle: 'Dispatched • Tom Henderson • 53\' Dry Van',
        additionalInfo: 'Load ID: #TRK-1823 Rate: $3,100 Landstar Trans Partner Route: Phoenix, AZ to Chicago, IL',
        targetPage: 'shipments' as PageId
      },
      {
        id: 'trk-0922',
        title: '#TRK-0922: Atlanta to Miami',
        subtitle: 'Scheduled • Alex Rivera • Flatbed (Oversize)',
        additionalInfo: 'Load ID: #TRK-0922 Rate: $2,800 Vanguard Dedicated Fleet Route: Atlanta, GA to Miami, FL',
        targetPage: 'shipments' as PageId
      }
    ];

    shipmentsList.forEach(s => {
      items.push({
        id: s.id,
        category: 'shipments',
        title: s.title,
        subtitle: s.subtitle,
        additionalInfo: s.additionalInfo,
        targetPage: s.targetPage
      });
    });

    // 2. CLIENTS (Fetch from LocalStorage or default to standard fallback)
    let companiesData = [];
    const savedCompanies = localStorage.getItem('vanguard_companies');
    if (savedCompanies) {
      try {
        companiesData = JSON.parse(savedCompanies);
      } catch (e) {
        companiesData = [];
      }
    }

    // Default clients fallback if not initialized in localStorage yet
    if (!companiesData || companiesData.length === 0) {
      companiesData = [
        {
          id: 'comp-1',
          name: 'Apex Foods International',
          revenue: 145000,
          clients: [
            { id: 'client-101', name: 'Amit Sharma', role: 'Logistics Head', email: 'amit.sharma@apexfoods.in', phone: '+91 98765 43210', route: 'Delhi → Mumbai' },
            { id: 'client-102', name: 'Priya Patel', role: 'Supply Chain Manager', email: 'priya.patel@apexfoods.in', phone: '+91 99887 76655', route: 'Ahmedabad → Pune' },
            { id: 'client-103', name: 'Rajesh Gupta', role: 'Procurement Specialist', email: 'rajesh.gupta@apexfoods.in', phone: '+91 91234 56789', route: 'Indore → Bhopal' },
            { id: 'client-104', name: 'Meera Nair', role: 'Operations Lead', email: 'meera.nair@apexfoods.in', phone: '+91 90123 45678', route: 'Bangalore → Cochin' }
          ]
        },
        {
          id: 'comp-2',
          name: 'Titan Industrial Supply',
          revenue: 98400,
          clients: [
            { id: 'client-201', name: 'Vikram Singh', role: 'Director of Transport', email: 'vikram.singh@titanindustrial.co.in', phone: '+91 88888 88888', route: 'Jaipur → Noida' },
            { id: 'client-202', name: 'Anjali Rao', role: 'Regional Dispatcher', email: 'anjali.rao@titanindustrial.co.in', phone: '+91 77777 77777', route: 'Chennai → Bangalore' }
          ]
        },
        {
          id: 'comp-3',
          name: 'Noida Freight Carriers',
          revenue: 78000,
          clients: [
            { id: 'client-301', name: 'Sanjay Dutt', role: 'Fleet Coordinator', email: 'sanjay.dutt@noidafreight.com', phone: '+91 95555 55555', route: 'Noida → Jaipur' },
            { id: 'client-302', name: 'Divya Dutta', role: 'Client Partner', email: 'divya.dutta@noidafreight.com', phone: '+91 94444 44444', route: 'Delhi → Ludhiana' }
          ]
        }
      ];
    }

    companiesData.forEach((company: any) => {
      // Add Company itself
      items.push({
        id: `company-${company.id}`,
        category: 'clients',
        title: company.name,
        subtitle: `Broker/Shipper • Revenue: ₹${company.revenue?.toLocaleString('en-IN') || company.revenue}`,
        additionalInfo: `Company: ${company.name} Shipper Broker Corporate account`,
        targetPage: 'clients' as PageId,
        payload: { companyId: company.id }
      });

      // Add each client
      if (company.clients && Array.isArray(company.clients)) {
        company.clients.forEach((c: any) => {
          items.push({
            id: `client-${c.id}`,
            category: 'clients',
            title: c.name,
            subtitle: `${c.role} @ ${company.name}`,
            additionalInfo: `${c.name} ${c.role} ${c.email} ${c.phone} Route: ${c.route} Notes: ${c.notes || ''}`,
            targetPage: 'clients' as PageId,
            payload: { companyId: company.id, clientId: c.id }
          });

          // Generate associated documents for active client jobs
          if (c.jobs && Array.isArray(c.jobs)) {
            c.jobs.forEach((j: any) => {
              const numericId = j.id.split('-')[1] || j.id;
              // Invoice document
              items.push({
                id: `doc-inv-${j.id}`,
                category: 'documents',
                title: `Invoice #INV-${numericId}`,
                subtitle: `Amount: ₹${j.amount?.toLocaleString('en-IN') || j.amount} • Client: ${c.name} • Route: ${j.route}`,
                additionalInfo: `Invoice INV-${numericId} Doc PDF Billing rate confirmation Job ID: ${j.id} Route: ${j.route} Status: ${j.status}`,
                targetPage: 'documents' as PageId,
                payload: { docType: 'invoice', docNo: `INV-${numericId}`, clientName: c.name }
              });

              // Lorry Receipt (LR) document
              items.push({
                id: `doc-lr-${j.id}`,
                category: 'documents',
                title: `Lorry Receipt #LR-${numericId}`,
                subtitle: `Consignor: ${company.name} • Route: ${j.route}`,
                additionalInfo: `Lorry Receipt LR LR-${numericId} POD Proof of Delivery transport docket Route: ${j.route} Client: ${c.name}`,
                targetPage: 'documents' as PageId,
                payload: { docType: 'lr', docNo: `LR-${numericId}`, clientName: c.name }
              });

              // Money Receipt (MR) document
              items.push({
                id: `doc-mr-${j.id}`,
                category: 'documents',
                title: `Money Receipt #MR-${numericId}`,
                subtitle: `Status: Paid • Client: ${c.name} • Route: ${j.route}`,
                additionalInfo: `Money Receipt MR MR-${numericId} payment voucher record transaction Route: ${j.route} Client: ${c.name}`,
                targetPage: 'documents' as PageId,
                payload: { docType: 'receipt', docNo: `MR-${numericId}`, clientName: c.name }
              });
            });
          }
        });
      }
    });

    // Add default core documents that exist in Document view if not generated above
    const defaultDocs = [
      { id: 'doc-inv-default', docType: 'invoice', docNo: 'INV-9821', title: 'Invoice #INV-9821', subtitle: 'Amount: ₹45,000 • Client: Amit Sharma • Route: Delhi → Mumbai', additionalInfo: 'Invoice INV-9821 Apex Foods Amit Sharma Delhi Mumbai' },
      { id: 'doc-lr-default', docType: 'lr', docNo: 'LR-9821', title: 'Lorry Receipt #LR-9821', subtitle: 'Consignor: Apex Foods Delhi Hub • Route: Delhi → Mumbai', additionalInfo: 'Lorry Receipt LR-9821 LR POD proof of delivery Delhi Mumbai' },
      { id: 'doc-receipt-default', docType: 'receipt', docNo: 'MR-9821', title: 'Money Receipt #MR-9821', subtitle: 'Payment Mode: Bank Transfer • Reference: UPI-TXN-9821-APX', additionalInfo: 'Money Receipt MR-9821 MR UPI payment completed Delhi Mumbai' }
    ];

    defaultDocs.forEach(d => {
      // Check if already loaded to avoid duplicate ids
      if (!items.some(item => item.id === d.id)) {
        items.push({
          id: d.id,
          category: 'documents',
          title: d.title,
          subtitle: d.subtitle,
          additionalInfo: d.additionalInfo,
          targetPage: 'documents' as PageId,
          payload: { docType: d.docType, docNo: d.docNo }
        });
      }
    });

    return items;
  }, []);

  // Filtered Results
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    
    return searchIndex.filter(item => {
      // Category Filter Check
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      const matchText = `${item.title} ${item.subtitle} ${item.additionalInfo || ''}`.toLowerCase();
      
      // All terms in the query must match some part of the item text
      return searchTerms.every(term => matchText.includes(term));
    });
  }, [query, selectedCategory, searchIndex]);

  // Handle arrow and hotkeys inside search list
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredResults.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleItemSelect(filteredResults[selectedIndex]);
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const categories: ('all' | 'shipments' | 'clients' | 'documents')[] = ['all', 'shipments', 'clients', 'documents'];
        const nextIndex = (categories.indexOf(selectedCategory) + 1) % categories.length;
        setSelectedCategory(categories[nextIndex]);
        setSelectedIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, selectedCategory, onClose]);

  // When selected, apply local changes and transition page
  const handleItemSelect = (item: SearchResult) => {
    saveSearchTerm(query || item.title.replace(/#/, ''));
    
    // Check if there are payloads we want to propagate
    if (item.category === 'clients' && item.payload) {
      // If we clicked a client, let's store selected state so Clients.tsx can auto-open this client
      if (item.payload.companyId) {
        localStorage.setItem('vanguard_last_selected_company', item.payload.companyId);
      }
      if (item.payload.clientId) {
        localStorage.setItem('vanguard_last_selected_client', item.payload.clientId);
      }
      window.dispatchEvent(new Event('vanguard-search-navigate-client'));
    } else if (item.category === 'documents' && item.payload) {
      // If we clicked a document, save docType and docNo so Documents.tsx can load it
      if (item.payload.docType) {
        localStorage.setItem('vanguard_active_document_tab', item.payload.docType);
      }
      if (item.payload.docNo) {
        localStorage.setItem('vanguard_active_document_no', item.payload.docNo);
      }
      window.dispatchEvent(new Event('vanguard-search-navigate-document'));
    }

    setActivePage(item.targetPage);
    onClose();
  };

  // Helper to highlight matched query substring
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-[#D946C4]/25 text-[#D946C4] font-medium rounded-sm px-0.5">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  // Click handler for background backdrop close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Sync scroll on key navigation
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        const container = resultsContainerRef.current;
        const activeTop = activeEl.offsetTop;
        const activeBottom = activeTop + activeEl.offsetHeight;
        const containerScrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;

        if (activeTop < containerScrollTop) {
          container.scrollTop = activeTop;
        } else if (activeBottom > containerScrollTop + containerHeight) {
          container.scrollTop = activeBottom - containerHeight;
        }
      }
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="global-search-backdrop"
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-stone-950/80 backdrop-blur-md animate-fade-in"
        >
          <motion.div
            id="global-search-container"
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-2xl bg-stone-900/90 border border-white/10 rounded-2xl shadow-2xl shadow-stone-950/80 overflow-hidden flex flex-col max-h-[520px]"
          >
            {/* Top Search Input Row */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 bg-stone-950/40">
              <Search size={20} className="text-white/40 shrink-0" />
              <input
                ref={inputRef}
                id="modal-search-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search shipments, clients, invoices, LR docs..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
              />
              {query && (
                <button
                  id="modal-clear-search-btn"
                  onClick={() => {
                    setQuery('');
                    setSelectedIndex(0);
                  }}
                  className="p-1 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
              <span className="hidden sm:block text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-1 rounded text-white/40 uppercase shrink-0">
                esc to exit
              </span>
            </div>

            {/* Quick Filter Bar */}
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5 bg-stone-950/20 overflow-x-auto scrollbar-none">
              <button
                onClick={() => { setSelectedCategory('all'); setSelectedIndex(0); }}
                className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full border transition-all duration-150 ${
                  selectedCategory === 'all' 
                    ? 'bg-[#D946C4]/10 border-[#D946C4]/30 text-[#D946C4] font-semibold' 
                    : 'bg-white/3 border-white/5 hover:border-white/10 text-white/60'
                }`}
              >
                All Results
              </button>
              <button
                onClick={() => { setSelectedCategory('shipments'); setSelectedIndex(0); }}
                className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full border transition-all duration-150 flex items-center gap-1 ${
                  selectedCategory === 'shipments' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold' 
                    : 'bg-white/3 border-white/5 hover:border-white/10 text-white/60'
                }`}
              >
                <Truck size={10} /> Shipments
              </button>
              <button
                onClick={() => { setSelectedCategory('clients'); setSelectedIndex(0); }}
                className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full border transition-all duration-150 flex items-center gap-1 ${
                  selectedCategory === 'clients' 
                    ? 'bg-[#D946C4]/10 border-[#D946C4]/30 text-[#D946C4] font-semibold' 
                    : 'bg-white/3 border-white/5 hover:border-white/10 text-white/60'
                }`}
              >
                <Users size={10} /> Clients
              </button>
              <button
                onClick={() => { setSelectedCategory('documents'); setSelectedIndex(0); }}
                className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full border transition-all duration-150 flex items-center gap-1 ${
                  selectedCategory === 'documents' 
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 font-semibold' 
                    : 'bg-white/3 border-white/5 hover:border-white/10 text-white/60'
                }`}
              >
                <FileText size={10} /> Documents
              </button>
            </div>

            {/* Results or Empty State Container */}
            <div className="flex-1 overflow-y-auto min-h-[160px] p-2" id="search-modal-scroller">
              {query.trim() === '' ? (
                /* Empty query: Show recent searches and shortcuts */
                <div className="p-4 space-y-5">
                  {recentSearches.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                        <Clock size={12} /> Recent Searches
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setQuery(term);
                              setTimeout(() => inputRef.current?.focus(), 50);
                            }}
                            className="bg-white/3 hover:bg-white/6 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-xl text-xs text-white/80 hover:text-white flex items-center gap-2 cursor-pointer transition-all duration-150 group"
                          >
                            <span>{term}</span>
                            <span 
                              onClick={(e) => removeSearchTerm(e, term)}
                              className="text-white/30 hover:text-red-400 transition-colors"
                            >
                              <X size={10} />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <h5 className="text-[10px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                      <Sparkles size={12} /> Search Suggestions
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/70">
                      <div 
                        onClick={() => { setQuery('Apex Foods'); }}
                        className="p-2.5 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 cursor-pointer flex items-center gap-2.5 transition-all"
                      >
                        <Building2 size={14} className="text-[#D946C4]" />
                        <div>
                          <p className="font-semibold text-white/90">Apex Foods</p>
                          <p className="text-[10px] text-white/40">Query client account</p>
                        </div>
                      </div>
                      <div 
                        onClick={() => { setQuery('TRK-'); }}
                        className="p-2.5 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 cursor-pointer flex items-center gap-2.5 transition-all"
                      >
                        <Truck size={14} className="text-emerald-400" />
                        <div>
                          <p className="font-semibold text-white/90">TRK-2901</p>
                          <p className="text-[10px] text-white/40">Find active freight</p>
                        </div>
                      </div>
                      <div 
                        onClick={() => { setQuery('INV-'); }}
                        className="p-2.5 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 cursor-pointer flex items-center gap-2.5 transition-all"
                      >
                        <FileText size={14} className="text-blue-400" />
                        <div>
                          <p className="font-semibold text-white/90">INV-9821</p>
                          <p className="text-[10px] text-white/40">Locate invoice docs</p>
                        </div>
                      </div>
                      <div 
                        onClick={() => { setQuery('Delhi'); }}
                        className="p-2.5 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 cursor-pointer flex items-center gap-2.5 transition-all"
                      >
                        <SearchCode size={14} className="text-[#D946C4]" />
                        <div>
                          <p className="font-semibold text-white/90">&ldquo;Delhi&rdquo;</p>
                          <p className="text-[10px] text-white/40">Search route or lane</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : filteredResults.length > 0 ? (
                /* Active query results */
                <div ref={resultsContainerRef} className="space-y-1">
                  {filteredResults.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    
                    // Determine category icon and colors
                    let Icon = FileText;
                    let colorClass = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                    let categoryLabel = 'Document';

                    if (item.category === 'shipments') {
                      Icon = Truck;
                      colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                      categoryLabel = 'Shipment';
                    } else if (item.category === 'clients') {
                      Icon = Users;
                      colorClass = 'text-[#D946C4] bg-[#D946C4]/10 border-[#D946C4]/20';
                      categoryLabel = 'Client/Company';
                    }

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemSelect(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`p-3 rounded-xl flex items-center gap-3 transition-all duration-150 cursor-pointer border ${
                          isSelected 
                            ? 'bg-white/8 border-[#D946C4]/40 shadow-md shadow-black/20' 
                            : 'bg-transparent border-transparent hover:bg-white/3'
                        }`}
                      >
                        {/* Icon Indicator */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${colorClass}`}>
                          <Icon size={16} />
                        </div>

                        {/* Title, Subtitle, Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-white/40">
                              {categoryLabel}
                            </span>
                            <span className="text-[9px] text-white/20">•</span>
                            <span className="text-[9px] font-mono text-[#D946C4]/80">
                              {item.targetPage.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-white leading-tight mt-0.5 truncate">
                            {renderHighlightedText(item.title, query)}
                          </h4>
                          <p className="text-[10px] text-white/50 truncate mt-0.5">
                            {renderHighlightedText(item.subtitle, query)}
                          </p>
                        </div>

                        {/* Arrow Right Indicator */}
                        <div className="shrink-0 flex items-center gap-1.5 pl-2 text-white/30">
                          {isSelected && (
                            <span className="text-[9px] font-mono text-[#D946C4] mr-1 flex items-center gap-0.5">
                              <span>Select</span>
                              <CornerDownLeft size={9} />
                            </span>
                          )}
                          <ChevronRight size={14} className={isSelected ? 'text-[#D946C4] translate-x-0.5 transition-transform' : ''} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Active query, no results */
                <div className="py-12 text-center text-white/40 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#D946C4]/70">
                    <Search size={16} />
                  </div>
                  <h4 className="text-xs font-semibold text-white/80">No results found for &ldquo;{query}&rdquo;</h4>
                  <p className="text-[10px] text-white/40 max-w-xs mx-auto">Double check spelling, or try selecting a different category filter above.</p>
                </div>
              )}
            </div>

            {/* Bottom Keyboard Navigation Hints */}
            <div className="px-4 py-2.5 border-t border-white/5 bg-stone-950/60 text-[9px] text-white/30 font-mono flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="bg-white/5 border border-white/10 px-1 py-0.5 rounded text-[8px] uppercase">↑↓</span> Move
                </span>
                <span className="flex items-center gap-1">
                  <span className="bg-white/5 border border-white/10 px-1 py-0.5 rounded text-[8px] uppercase">Enter</span> Select
                </span>
                <span className="flex items-center gap-1">
                  <span className="bg-white/5 border border-white/10 px-1 py-0.5 rounded text-[8px] uppercase">Tab</span> Cycle Tabs
                </span>
              </div>
              <div>
                <span>Ctrl + K or Click Floating Search</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
