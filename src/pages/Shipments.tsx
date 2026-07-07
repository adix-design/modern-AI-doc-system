import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Sparkles, 
  User, 
  Check, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  X, 
  ArrowRight, 
  Filter, 
  Layers, 
  Table, 
  FileText, 
  CheckCircle2, 
  Building2, 
  Circle, 
  Send, 
  History, 
  MapPin, 
  SlidersHorizontal, 
  AlertCircle,
  HelpCircle,
  UserX,
  RefreshCw,
  TrendingUp,
  Sliders,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageId } from '../types';

interface ShipmentActivity {
  time: string;
  message: string;
  type: 'system' | 'whatsapp' | 'manual' | 'status';
}

interface Shipment {
  id: string; // e.g. TRK-2901
  clientName: string;
  companyName: string;
  routeFrom: string;
  routeTo: string;
  truckSize: string;
  truckNo: string;
  driverName?: string;
  driverPhone?: string;
  status: 'Pending Confirmation' | 'Booked' | 'In Transit' | 'Delivered' | 'Cancelled';
  pickupDate: string;
  amount: number;
  source: 'manual' | 'ai';
  notes?: string;
  activityLog: ShipmentActivity[];
}

interface ShipmentsProps {
  setActivePage?: (page: PageId) => void;
}

const DEFAULT_TRUCK_RATES: Record<string, number> = {
  '407 LCV': 12000,
  'Eicher 14ft': 18500,
  'Eicher 19ft': 28000,
  '22ft Container': 45000,
  '32ft Multi-Axle': 58000
};

const TRUCK_TYPES = ['407 LCV', 'Eicher 14ft', 'Eicher 19ft', '22ft Container', '32ft Multi-Axle'];

const INITIAL_TRUCKS_MOCK = [
  { id: 'T-1', truckNo: 'HR-55-A-8902', truckType: '22ft Container', assignedDriverId: 'D-1' },
  { id: 'T-2', truckNo: 'GJ-01-XX-4820', truckType: 'Eicher 14ft', assignedDriverId: 'D-2' },
  { id: 'T-3', truckNo: 'HR-38-S-5501', truckType: '32ft Multi-Axle', assignedDriverId: 'D-3' },
  { id: 'T-4', truckNo: 'KA-03-M-1102', truckType: '407 LCV', assignedDriverId: 'D-4' },
  { id: 'T-5', truckNo: 'DL-1C-AA-9081', truckType: 'Eicher 19ft', assignedDriverId: 'D-5' },
  { id: 'T-6', truckNo: 'MP-04-HE-1234', truckType: 'Eicher 19ft', assignedDriverId: 'D-6' },
  { id: 'T-7', truckNo: 'PB-02-C-5231', truckType: '22ft Container', assignedDriverId: 'D-7' }
];

const INITIAL_DRIVERS_MOCK = [
  { id: 'D-1', name: 'Alex Singh', phone: '+91 98120 12345', rating: 4.6 },
  { id: 'D-2', name: 'Gurpreet Singh', phone: '+91 99887 76655', rating: 4.9 },
  { id: 'D-3', name: 'Devender Kumar', phone: '+91 91234 56789', rating: 4.5 },
  { id: 'D-4', name: 'Madan Lal', phone: '+91 98000 11122', rating: 4.3 },
  { id: 'D-5', name: 'Rajesh Kumar', phone: '+91 96543 21098', rating: 4.7 },
  { id: 'D-6', name: 'Ramesh Kumar', phone: '+91 98765 43210', rating: 4.8 },
  { id: 'D-7', name: 'Rajinder Pal', phone: '+91 95400 98765', rating: 4.4 }
];

const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'TRK-2901',
    clientName: 'Amit Sharma',
    companyName: 'Apex Foods International',
    routeFrom: 'Delhi',
    routeTo: 'Mumbai',
    truckSize: '22ft Container',
    truckNo: 'HR-55-A-8902',
    driverName: 'Alex Singh',
    driverPhone: '+91 98120 12345',
    status: 'In Transit',
    pickupDate: '2026-07-06',
    amount: 45000,
    source: 'ai',
    notes: 'Urgent cold storage dispatch. Maintain sub-zero temperature monitoring.',
    activityLog: [
      { time: '2026-07-06 09:30 AM', message: 'Carrier loaded & OTP verified at Delhi Hub.', type: 'status' },
      { time: '2026-07-06 08:00 AM', message: 'Gate-in completed for vehicle HR-55-A-8902.', type: 'system' },
      { time: '2026-07-05 06:15 PM', message: 'Booking confirmed via WhatsApp integration.', type: 'whatsapp' }
    ]
  },
  {
    id: 'TRK-1823',
    clientName: 'Priya Patel',
    companyName: 'Apex Foods International',
    routeFrom: 'Ahmedabad',
    routeTo: 'Pune',
    truckSize: 'Eicher 14ft',
    truckNo: 'GJ-01-XX-4820',
    driverName: 'Gurpreet Singh',
    driverPhone: '+91 99887 76655',
    status: 'Booked',
    pickupDate: '2026-07-07',
    amount: 18500,
    source: 'manual',
    notes: 'Snack food consignments. Dry van configuration.',
    activityLog: [
      { time: '2026-07-06 11:15 AM', message: 'Vehicle placement scheduled & driver details shared.', type: 'system' },
      { time: '2026-07-06 10:00 AM', message: 'Manual booking created by dispatch officer.', type: 'manual' }
    ]
  },
  {
    id: 'TRK-0922',
    clientName: 'Vikram Singh',
    companyName: 'Titan Industrial Supply',
    routeFrom: 'Jaipur',
    routeTo: 'Noida',
    truckSize: '32ft Multi-Axle',
    truckNo: 'HR-38-S-5501',
    driverName: 'Devender Kumar',
    driverPhone: '+91 91234 56789',
    status: 'Pending Confirmation',
    pickupDate: '2026-07-08',
    amount: 52000,
    source: 'ai',
    notes: 'Steel rod bundles. Flatbed placement required.',
    activityLog: [
      { time: '2026-07-06 07:44 AM', message: 'AI WhatsApp Assistant: Detected new booking query. Auto-parsed shipper details, lane, and size.', type: 'whatsapp' }
    ]
  },
  {
    id: 'TRK-1044',
    clientName: 'Anjali Rao',
    companyName: 'Titan Industrial Supply',
    routeFrom: 'Chennai',
    routeTo: 'Bangalore',
    truckSize: '407 LCV',
    truckNo: 'KA-03-M-1102',
    driverName: 'Madan Lal',
    driverPhone: '+91 98000 11122',
    status: 'Delivered',
    pickupDate: '2026-07-05',
    amount: 12400,
    source: 'manual',
    notes: 'Industrial bolts and fasteners.',
    activityLog: [
      { time: '2026-07-05 04:30 PM', message: 'POD uploaded & approved. Status set to Delivered.', type: 'system' },
      { time: '2026-07-05 01:10 PM', message: 'Arrived at consignee warehouse in Bangalore.', type: 'status' },
      { time: '2026-07-04 09:00 AM', message: 'Dispatched from Chennai warehouse.', type: 'status' }
    ]
  },
  {
    id: 'TRK-3341',
    clientName: 'Sanjay Dutt',
    companyName: 'Noida Freight Carriers',
    routeFrom: 'Noida',
    routeTo: 'Jaipur',
    truckSize: 'Eicher 19ft',
    truckNo: 'DL-1C-AA-9081',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 96543 21098',
    status: 'Cancelled',
    pickupDate: '2026-07-03',
    amount: 24000,
    source: 'manual',
    notes: 'Order cancelled due to delayed factory production.',
    activityLog: [
      { time: '2026-07-03 11:00 AM', message: 'Consignment cancelled by client request.', type: 'manual' }
    ]
  }
];

export default function Shipments({ setActivePage }: ShipmentsProps) {
  // --- STATE ---
  const [shipments, setShipments] = useState<Shipment[]>(() => {
    const saved = localStorage.getItem('vanguard_shipments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated = parsed.map((s: any) => {
            const clientName = s.clientName || s.client || s.companyName || 'Apex Foods International';
            const companyName = s.companyName || s.company || 'Apex Foods International';
            const routeFrom = s.routeFrom || (s.route && s.route.split('→')[0].trim()) || 'Delhi';
            const routeTo = s.routeTo || (s.route && s.route.split('→')[1].trim()) || 'Mumbai';
            const truckSize = s.truckSize || s.truckType || '22ft Container';
            const truckNo = s.truckNo || s.truck || 'HR-55-A-8902';
            const status = s.status || 'Pending Confirmation';
            const pickupDate = s.pickupDate || '2026-07-06';
            const amount = s.amount || s.rate || 45000;
            const source = s.source || 'manual';
            const activityLog = s.activityLog || [];
            return {
              id: s.id || ('TRK-' + Math.floor(1000 + Math.random() * 9000)),
              clientName,
              companyName,
              routeFrom,
              routeTo,
              truckSize,
              truckNo,
              status,
              pickupDate,
              amount,
              source,
              activityLog
            };
          });
          const seen = new Set();
          return migrated.filter(s => {
            if (seen.has(s.id)) return false;
            seen.add(s.id);
            return true;
          });
        }
      } catch (e) {
        return INITIAL_SHIPMENTS;
      }
    }
    return INITIAL_SHIPMENTS;
  });

  const [activeTab, setActiveTab] = useState<'All' | 'Pending Confirmation' | 'Booked' | 'In Transit' | 'Delivered' | 'Cancelled'>('All');
  const [viewType, setViewType] = useState<'list' | 'board'>('list');

  // Synchronize shipments with localStorage when updated elsewhere
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('vanguard_shipments');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const migrated = parsed.map((s: any) => {
              const clientName = s.clientName || s.client || s.companyName || 'Apex Foods International';
              const companyName = s.companyName || s.company || 'Apex Foods International';
              const routeFrom = s.routeFrom || (s.route && s.route.split('→')[0].trim()) || 'Delhi';
              const routeTo = s.routeTo || (s.route && s.route.split('→')[1].trim()) || 'Mumbai';
              const truckSize = s.truckSize || s.truckType || '22ft Container';
              const truckNo = s.truckNo || s.truck || 'HR-55-A-8902';
              const status = s.status || 'Pending Confirmation';
              const pickupDate = s.pickupDate || '2026-07-06';
              const amount = s.amount || s.rate || 45000;
              const source = s.source || 'manual';
              const activityLog = s.activityLog || [];
              return {
                id: s.id || ('TRK-' + Math.floor(1000 + Math.random() * 9000)),
                clientName,
                companyName,
                routeFrom,
                routeTo,
                truckSize,
                truckNo,
                status,
                pickupDate,
                amount,
                source,
                activityLog
              };
            });
            const seen = new Set();
            const unique = migrated.filter(s => {
              if (seen.has(s.id)) return false;
              seen.add(s.id);
              return true;
            });
            setShipments(unique);
          }
        } catch (e) {}
      }
    };
    window.addEventListener('vanguard_shipments_updated', handleSync);
    return () => window.removeEventListener('vanguard_shipments_updated', handleSync);
  }, []);
  
  // Filters
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'All' | 'Manual' | 'AI Assistant'>('All');

  // Synchronize with global date range filter
  useEffect(() => {
    const syncGlobalDates = () => {
      const globalStart = localStorage.getItem('vanguard_global_start_date') || '';
      const globalEnd = localStorage.getItem('vanguard_global_end_date') || '';
      setStartDate(globalStart);
      setEndDate(globalEnd);
    };
    syncGlobalDates();
    window.addEventListener('vanguard-global-date-range-updated', syncGlobalDates);
    return () => window.removeEventListener('vanguard-global-date-range-updated', syncGlobalDates);
  }, []);

  // Drawer / Selection
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  // New Shipment Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editShipmentId, setEditShipmentId] = useState<string | null>(null);

  // Form Fields
  const [formClientName, setFormClientName] = useState('');
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formRouteFrom, setFormRouteFrom] = useState('');
  const [formRouteTo, setFormRouteTo] = useState('');
  const [formTruckSize, setFormTruckSize] = useState('22ft Container');
  const [formTruckNo, setFormTruckNo] = useState('');
  const [formDriverName, setFormDriverName] = useState('');
  const [formDriverPhone, setFormDriverPhone] = useState('');
  const [formPickupDate, setFormPickupDate] = useState('2026-07-06');
  const [formAmount, setFormAmount] = useState<number>(45000);
  const [formNotes, setFormNotes] = useState('');

  // Dropdown searches for clients
  const [clientSearchText, setClientSearchText] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  // Dropdown searches for trucks
  const [isTruckDropdownOpen, setIsTruckDropdownOpen] = useState(false);
  const [truckSearchText, setTruckSearchText] = useState('');

  // Fleet database loaded from localStorage
  const fleetTrucks = useMemo(() => {
    const saved = localStorage.getItem('vanguard_fleet_trucks');
    return saved ? JSON.parse(saved) : INITIAL_TRUCKS_MOCK;
  }, [isNewModalOpen]); // reload when modal opens

  const fleetDrivers = useMemo(() => {
    const saved = localStorage.getItem('vanguard_fleet_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS_MOCK;
  }, [isNewModalOpen]); // reload when modal opens

  // Clients database parsed from localStorage
  const clientsData = useMemo(() => {
    let list: any[] = [];
    const savedCompanies = localStorage.getItem('vanguard_companies');
    if (savedCompanies) {
      try {
        const companies = JSON.parse(savedCompanies);
        companies.forEach((company: any) => {
          if (company.clients && Array.isArray(company.clients)) {
            company.clients.forEach((c: any) => {
              list.push({
                name: c.name,
                companyName: company.name,
                initial: c.name ? c.name.charAt(0) : 'C',
                role: c.role || 'Client'
              });
            });
          }
        });
      } catch (e) {
        list = [];
      }
    }
    
    // Default fallback clients
    if (list.length === 0) {
      list = [
        { name: 'Amit Sharma', companyName: 'Apex Foods International', initial: 'A' },
        { name: 'Priya Patel', companyName: 'Apex Foods International', initial: 'P' },
        { name: 'Vikram Singh', companyName: 'Titan Industrial Supply', initial: 'V' },
        { name: 'Anjali Rao', companyName: 'Titan Industrial Supply', initial: 'A' },
        { name: 'Sanjay Dutt', companyName: 'Noida Freight Carriers', initial: 'S' },
        { name: 'Rajesh Gupta', companyName: 'Apex Foods International', initial: 'R' }
      ];
    }
    return list;
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('vanguard_shipments', JSON.stringify(shipments));
  }, [shipments]);

  // Update detail drawer if shipment edits occur in background
  useEffect(() => {
    if (selectedShipment) {
      const fresh = shipments.find(s => s.id === selectedShipment.id);
      if (fresh) setSelectedShipment(fresh);
    }
  }, [shipments, selectedShipment?.id]);

  // Handle auto rate population on truck size change
  useEffect(() => {
    if (!isEditMode) {
      setFormAmount(DEFAULT_TRUCK_RATES[formTruckSize] || 25000);
    }
  }, [formTruckSize, isEditMode]);

  // --- STATS COUNT ---
  const tabCounts = useMemo(() => {
    const counts = {
      All: shipments.length,
      'Pending Confirmation': 0,
      Booked: 0,
      'In Transit': 0,
      Delivered: 0,
      Cancelled: 0
    };
    shipments.forEach(s => {
      if (counts[s.status] !== undefined) {
        counts[s.status]++;
      }
    });
    return counts;
  }, [shipments]);

  // --- FILTERS LOGIC ---
  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      // 1. Status Tab filter
      if (activeTab !== 'All' && s.status !== activeTab) {
        return false;
      }

      // 2. Search Text
      if (searchText.trim()) {
        const query = searchText.toLowerCase();
        const matchesQuery = 
          s.id.toLowerCase().includes(query) ||
          s.clientName.toLowerCase().includes(query) ||
          s.companyName.toLowerCase().includes(query) ||
          s.routeFrom.toLowerCase().includes(query) ||
          s.routeTo.toLowerCase().includes(query) ||
          s.truckNo.toLowerCase().includes(query) ||
          s.truckSize.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // 3. Date range
      if (startDate && s.pickupDate < startDate) return false;
      if (endDate && s.pickupDate > endDate) return false;

      // 4. Source
      if (sourceFilter === 'Manual' && s.source !== 'manual') return false;
      if (sourceFilter === 'AI Assistant' && s.source !== 'ai') return false;

      return true;
    });
  }, [shipments, activeTab, searchText, startDate, endDate, sourceFilter]);

  // --- FILTERED CLIENTS DROPDOWN ---
  const filteredDropdownClients = useMemo(() => {
    if (!clientSearchText) return clientsData;
    return clientsData.filter(c => 
      c.name.toLowerCase().includes(clientSearchText.toLowerCase()) ||
      c.companyName.toLowerCase().includes(clientSearchText.toLowerCase())
    );
  }, [clientsData, clientSearchText]);

  // --- FILTERED TRUCKS DROPDOWN ---
  const filteredDropdownTrucks = useMemo(() => {
    if (!truckSearchText) return fleetTrucks;
    const query = truckSearchText.toLowerCase();
    return fleetTrucks.filter(t => {
      const driver = fleetDrivers.find(d => d.id === t.assignedDriverId);
      return (
        t.truckNo.toLowerCase().includes(query) ||
        t.truckType.toLowerCase().includes(query) ||
        (driver && driver.name.toLowerCase().includes(query))
      );
    });
  }, [fleetTrucks, fleetDrivers, truckSearchText]);

  // --- MUTATIONS ---
  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientName || !formRouteFrom || !formRouteTo || !formTruckNo) {
      alert('Please fill out all mandatory fields: Client, From/To routes, and Truck plate number.');
      return;
    }

    const formatTime = () => {
      const now = new Date();
      return now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    if (isEditMode && editShipmentId) {
      // Update existing
      setShipments(prev => {
        const updated = prev.map(s => {
          if (s.id === editShipmentId) {
            const statusChanged = s.truckSize !== formTruckSize || s.routeFrom !== formRouteFrom || s.routeTo !== formRouteTo;
            const updatedLogs = [...s.activityLog];
            if (statusChanged) {
              updatedLogs.unshift({
                time: formatTime(),
                message: `Shipment details updated: ${formRouteFrom}→${formRouteTo}, Size: ${formTruckSize}`,
                type: 'manual'
              });
            }
            return {
              ...s,
              clientName: formClientName,
              companyName: formCompanyName,
              routeFrom: formRouteFrom,
              routeTo: formRouteTo,
              truckSize: formTruckSize,
              truckNo: formTruckNo,
              driverName: formDriverName,
              driverPhone: formDriverPhone,
              pickupDate: formPickupDate,
              amount: formAmount,
              notes: formNotes,
              activityLog: updatedLogs
            };
          }
          return s;
        });
        // Dispatch custom sync event
        setTimeout(() => {
          window.dispatchEvent(new Event('vanguard_shipments_updated'));
        }, 10);
        return updated;
      });
      triggerToast(`Shipment ${editShipmentId} successfully updated.`);
    } else {
      // Create new
      const randomId = 'TRK-' + Math.floor(1000 + Math.random() * 9000);
      const newShipment: Shipment = {
        id: randomId,
        clientName: formClientName,
        companyName: formCompanyName || 'Apex Foods International',
        routeFrom: formRouteFrom,
        routeTo: formRouteTo,
        truckSize: formTruckSize,
        truckNo: formTruckNo,
        driverName: formDriverName,
        driverPhone: formDriverPhone,
        status: 'Booked',
        pickupDate: formPickupDate,
        amount: formAmount,
        source: 'manual',
        notes: formNotes,
        activityLog: [
          { time: formatTime(), message: `Booking created manually by system dispatch. Status set to Booked. Assigned vehicle: ${formTruckNo}.`, type: 'manual' }
        ]
      };
      setShipments(prev => {
        const updated = [newShipment, ...prev];
        setTimeout(() => {
          window.dispatchEvent(new Event('vanguard_shipments_updated'));
        }, 10);
        return updated;
      });
      triggerToast(`Shipment ${randomId} created in Booked status.`);
    }

    closeFormModal();
  };

  const handleConfirmPending = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const formatTime = () => {
      const now = new Date();
      return now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    setShipments(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: 'Booked',
          activityLog: [
            { time: formatTime(), message: 'WhatsApp dispatch draft confirmed by controller. Booking active.', type: 'status' },
            ...s.activityLog
          ]
        };
      }
      return s;
    }));
    triggerToast(`Booking ${id} confirmed and scheduled!`);
  };

  const handleDeleteShipment = (id: string) => {
    if (window.confirm(`Are you sure you want to cancel or delete shipment ${id}?`)) {
      setShipments(prev => prev.filter(s => s.id !== id));
      setSelectedShipment(null);
      triggerToast(`Shipment ${id} was removed.`);
    }
  };

  const handleUpdateStatusDirectly = (id: string, newStatus: Shipment['status']) => {
    const formatTime = () => {
      const now = new Date();
      return now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    setShipments(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: newStatus,
          activityLog: [
            { time: formatTime(), message: `Status advanced manually to: ${newStatus}`, type: 'status' },
            ...s.activityLog
          ]
        };
      }
      return s;
    }));
    triggerToast(`Status updated to ${newStatus}`);
  };

  // --- KANBAN DRAG & DROP IMPLEMENTATION ---
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    setDragOverColumn(col);
  };

  const handleCardDragOver = (e: React.DragEvent, cardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCardId(cardId);
  };

  const handleDrop = (col: string) => {
    if (draggedId) {
      setShipments(prev => {
        const draggedIndex = prev.findIndex(s => s.id === draggedId);
        if (draggedIndex === -1) return prev;

        const list = [...prev];
        const [removed] = list.splice(draggedIndex, 1);

        const formatTime = () => {
          const now = new Date();
          return now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        };

        const oldStatus = removed.status;
        const newStatus = col as Shipment['status'];
        let updatedShipment = { ...removed, status: newStatus };

        if (oldStatus !== newStatus) {
          updatedShipment.activityLog = [
            { time: formatTime(), message: `Status advanced manually to: ${newStatus} via board drag-and-drop`, type: 'status' },
            ...removed.activityLog
          ];
          triggerToast(`Moved ${draggedId} to ${newStatus}`);
        }

        // Insert at the bottom of the targeted status column
        let targetInsertIndex = -1;
        for (let i = list.length - 1; i >= 0; i--) {
          if (list[i].status === col) {
            targetInsertIndex = i + 1;
            break;
          }
        }

        if (targetInsertIndex !== -1) {
          list.splice(targetInsertIndex, 0, updatedShipment);
        } else {
          list.push(updatedShipment);
        }

        return list;
      });
    }
    setDraggedId(null);
    setDragOverColumn(null);
    setDragOverCardId(null);
  };

  const handleCardDrop = (e: React.DragEvent, targetCardId: string, col: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedId && draggedId !== targetCardId) {
      setShipments(prev => {
        const draggedIndex = prev.findIndex(s => s.id === draggedId);
        const targetIndex = prev.findIndex(s => s.id === targetCardId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
          const list = [...prev];
          const [removed] = list.splice(draggedIndex, 1);
          
          const formatTime = () => {
            const now = new Date();
            return now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
          };
          
          const oldStatus = removed.status;
          const newStatus = col as Shipment['status'];
          let updatedShipment = { ...removed, status: newStatus };
          
          if (oldStatus !== newStatus) {
            updatedShipment.activityLog = [
              { time: formatTime(), message: `Status advanced manually to: ${newStatus} via board drag-and-drop`, type: 'status' },
              ...removed.activityLog
            ];
          }

          const currentTargetIndex = list.findIndex(s => s.id === targetCardId);
          list.splice(currentTargetIndex, 0, updatedShipment);
          
          if (oldStatus !== newStatus) {
            triggerToast(`Moved ${draggedId} to ${newStatus}`);
          } else {
            triggerToast(`Reordered ${draggedId} in ${newStatus}`);
          }
          
          return list;
        }
        return prev;
      });
    }
    
    setDraggedId(null);
    setDragOverColumn(null);
    setDragOverCardId(null);
  };

  // --- ROUTING UTILITIES ---
  const handleNavigateDocument = (docType: 'invoice' | 'lr' | 'receipt', docNo: string) => {
    localStorage.setItem('vanguard_active_document_tab', docType);
    localStorage.setItem('vanguard_active_document_no', docNo);
    window.dispatchEvent(new Event('vanguard-search-navigate-document'));
    setActivePage('documents');
  };

  // --- TOAST NOTIFICATIONS ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // --- MODAL UTILS ---
  const openNewModal = () => {
    setIsEditMode(false);
    setEditShipmentId(null);
    setFormClientName('');
    setFormCompanyName('');
    setFormRouteFrom('');
    setFormRouteTo('');
    setFormTruckSize('22ft Container');
    setFormTruckNo('');
    setFormDriverName('');
    setFormDriverPhone('');
    setFormPickupDate('2026-07-06');
    setFormAmount(45000);
    setFormNotes('');
    setTruckSearchText('');
    setIsNewModalOpen(true);
  };

  const openEditModal = (shipment: Shipment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsEditMode(true);
    setEditShipmentId(shipment.id);
    setFormClientName(shipment.clientName);
    setFormCompanyName(shipment.companyName);
    setFormRouteFrom(shipment.routeFrom);
    setFormRouteTo(shipment.routeTo);
    setFormTruckSize(shipment.truckSize);
    setFormTruckNo(shipment.truckNo);
    setFormDriverName(shipment.driverName || '');
    setFormDriverPhone(shipment.driverPhone || '');
    setFormPickupDate(shipment.pickupDate);
    setFormAmount(shipment.amount);
    setFormNotes(shipment.notes || '');
    setTruckSearchText(shipment.truckNo);
    setIsNewModalOpen(true);
  };

  const closeFormModal = () => {
    setIsNewModalOpen(false);
    setIsClientDropdownOpen(false);
    setIsTruckDropdownOpen(false);
  };

  // Status Color Mapper Helper
  const getStatusStyle = (status: Shipment['status']) => {
    switch (status) {
      case 'Pending Confirmation':
        return {
          pill: 'bg-white/5 text-white/50 border-white/10',
          dot: 'bg-white/40',
          text: 'text-white/40'
        };
      case 'Booked':
        return {
          pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          dot: 'bg-blue-500',
          text: 'text-blue-400'
        };
      case 'In Transit':
        return {
          pill: 'bg-[#D946C4]/10 text-[#D946C4] border-[#D946C4]/20',
          dot: 'bg-[#D946C4]',
          text: 'text-[#D946C4] font-semibold'
        };
      case 'Delivered':
        return {
          pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500',
          text: 'text-emerald-400'
        };
      case 'Cancelled':
        return {
          pill: 'bg-red-500/10 text-red-400 border-red-500/20',
          dot: 'bg-red-500',
          text: 'text-red-400'
        };
    }
  };

  return (
    <div id="shipments-container" className="space-y-6 animate-fade-in relative">
      {/* 1. HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Shipments</h4>
          <p className="text-xs text-white/50">Bookings, tracking &amp; delivery status</p>
        </div>
        <button 
          id="btn-new-shipment"
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#D946C4] hover:bg-[#c33eb0] text-stone-950 text-xs font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#D946C4]/10 active:scale-95 self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>New Shipment</span>
        </button>
      </div>

      {/* 2. STATUS TABS (segmented control, primary filter) */}
      <div className="bg-white/3 border border-white/5 rounded-2xl p-1.5 flex flex-wrap gap-1">
        {(['All', 'Pending Confirmation', 'Booked', 'In Transit', 'Delivered', 'Cancelled'] as const).map(tab => {
          const isActive = activeTab === tab;
          const count = tabCounts[tab] || 0;
          const needsPulse = tab === 'Pending Confirmation' && count > 0;

          return (
            <button
              key={tab}
              id={`tab-filter-${tab.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono tracking-wide uppercase transition-all duration-200 relative ${
                isActive 
                  ? 'bg-white/8 text-white border border-white/10 font-bold shadow-md shadow-black/10' 
                  : 'text-white/50 hover:text-white hover:bg-white/2 border border-transparent'
              }`}
            >
              {needsPulse && (
                <span className="w-2 h-2 rounded-full bg-[#D946C4] animate-pulse shrink-0" />
              )}
              <span>{tab}</span>
              <span className={`px-1.5 py-0.5 text-[9px] rounded-full ${isActive ? 'bg-white/10 text-white' : 'bg-white/3 text-white/40'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. SECONDARY FILTER ROW */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/2 border border-white/5 p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Text Search */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
              <Search size={14} />
            </span>
            <input
              id="shipments-search-input"
              type="text"
              placeholder="Search client, truck, lane..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl bg-white/5 border border-white/5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D946C4]/20 transition-all"
            />
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                id="shipments-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 px-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white/80 focus:outline-none focus:border-[#D946C4]/20"
                placeholder="Start Date"
              />
            </div>
            <span className="text-white/20 text-xs">-</span>
            <div className="relative">
              <input
                id="shipments-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 px-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white/80 focus:outline-none focus:border-[#D946C4]/20"
                placeholder="End Date"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="p-1 text-white/40 hover:text-white"
                title="Clear Dates"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Source and View toggles */}
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          {/* Source Filter Chips */}
          <div className="flex items-center gap-1.5 bg-stone-950/40 p-1 rounded-xl border border-white/5">
            {(['All', 'Manual', 'AI Assistant'] as const).map(src => (
              <button
                key={src}
                onClick={() => setSourceFilter(src)}
                className={`px-3 py-1 text-[10px] uppercase font-mono tracking-wide rounded-lg transition-all ${
                  sourceFilter === src
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          {/* List vs Board View Toggle */}
          <div className="flex items-center gap-1 bg-stone-950/40 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setViewType('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewType === 'list' 
                  ? 'bg-[#D946C4] text-stone-950 font-semibold' 
                  : 'text-white/40 hover:text-white'
              }`}
              title="List View"
            >
              <Table size={14} />
            </button>
            <button
              onClick={() => setViewType('board')}
              className={`p-1.5 rounded-lg transition-all ${
                viewType === 'board' 
                  ? 'bg-[#D946C4] text-stone-950 font-semibold' 
                  : 'text-white/40 hover:text-white'
              }`}
              title="Kanban Board"
            >
              <Layers size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN VIEWS (LIST & BOARD) WITH CROSS-FADE ANIMATION */}
      <div className="min-h-[400px]">
        {viewType === 'list' ? (
          /* LIST VIEW */
          <motion.div
            id="shipments-list-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {filteredShipments.length > 0 ? (
              filteredShipments.map(shipment => {
                const style = getStatusStyle(shipment.status);
                const isPending = shipment.status === 'Pending Confirmation';

                return (
                  <div
                    key={shipment.id}
                    id={`shipment-row-${shipment.id}`}
                    onClick={() => setSelectedShipment(shipment)}
                    className="p-4 bg-white/3 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 cursor-pointer transition-all duration-200"
                  >
                    {/* Left details */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Avatar Initials Circle */}
                      <div className="w-10 h-10 rounded-xl bg-[#D946C4]/10 border border-[#D946C4]/20 flex items-center justify-center font-semibold text-[#D946C4] text-xs shrink-0">
                        {shipment.clientName ? shipment.clientName.charAt(0) : 'S'}
                      </div>

                      {/* Client + Route */}
                      <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-white truncate">{shipment.clientName}</h4>
                          <p className="text-[10px] text-white/40 truncate">{shipment.companyName}</p>
                        </div>
                        {/* Route as arrow pill */}
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-white/2 border border-white/5 rounded-lg text-[10px] font-semibold text-white/90">
                            {shipment.routeFrom}
                          </span>
                          <ArrowRight size={10} className="text-white/30 shrink-0" />
                          <span className="px-2.5 py-1 bg-white/2 border border-white/5 rounded-lg text-[10px] font-semibold text-white/90">
                            {shipment.routeTo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mid details */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 shrink-0">
                      {/* Truck size & Plate */}
                      <div className="text-left md:text-right min-w-[110px]">
                        <p className="text-xs font-semibold text-white/80">{shipment.truckSize}</p>
                        <p className="text-[10px] font-mono text-white/40 mt-0.5">{shipment.truckNo}</p>
                      </div>

                      {/* Pickup date */}
                      <div className="text-left md:text-right min-w-[90px]">
                        <span className="text-[10px] text-white/40 block">PICKUP</span>
                        <span className="text-xs font-mono text-white/80">{shipment.pickupDate}</span>
                      </div>

                      {/* Source indicator */}
                      <div className="flex items-center justify-center">
                        {shipment.source === 'ai' ? (
                          <span className="p-1.5 rounded-lg bg-[#D946C4]/10 border border-[#D946C4]/20 text-[#D946C4]" title="Parsed via AI Assistant (WhatsApp)">
                            <Sparkles size={13} />
                          </span>
                        ) : (
                          <span className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-white/40" title="Manual entry">
                            <User size={13} />
                          </span>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="min-w-[80px] text-left md:text-right">
                        <span className="text-xs font-bold text-white block">₹{shipment.amount.toLocaleString('en-IN')}</span>
                      </div>

                      {/* Status pill */}
                      <div className="min-w-[120px]">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono border flex items-center justify-center gap-1.5 uppercase ${style.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          <span>{shipment.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* 5. "PENDING CONFIRMATION" ACTION TRIGGER */}
                    {isPending ? (
                      <div className="flex items-center gap-2 border-t md:border-t-0 border-white/5 pt-3 md:pt-0 shrink-0">
                        <button
                          id={`btn-confirm-shipment-${shipment.id}`}
                          onClick={(e) => handleConfirmPending(shipment.id, e)}
                          className="px-2.5 py-1 bg-[#D946C4] hover:bg-[#D946C4]/80 text-white text-[10px] font-bold rounded-lg transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          id={`btn-edit-shipment-${shipment.id}`}
                          onClick={(e) => openEditModal(shipment, e)}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white text-[10px] border border-white/10 rounded-lg transition-all"
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      /* Optional row arrow button */
                      <div className="hidden md:flex items-center justify-center w-6 text-white/20 hover:text-white shrink-0">
                        <ChevronRight size={16} />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              /* Empty list fallback */
              <div className="py-16 text-center text-white/40 space-y-3 bg-white/2 rounded-2xl border border-white/5">
                <AlertCircle className="mx-auto text-white/25" size={24} />
                <p className="text-xs">No shipments found matching the filters.</p>
                <button 
                  onClick={() => { setSearchText(''); setSourceFilter('All'); setActiveTab('All'); setStartDate(''); setEndDate(''); }}
                  className="text-xs text-[#D946C4] underline hover:text-[#D946C4]/80"
                >
                  Reset filters
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          /* BOARD VIEW (KANBAN BOARD) */
          <motion.div
            id="shipments-board-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Columns matching active statuses: Pending Confirmation, Booked, In Transit, Delivered */}
            {(['Pending Confirmation', 'Booked', 'In Transit', 'Delivered'] as const).map(colStatus => {
              const colShipments = shipments.filter(s => s.status === colStatus);
              const isOver = dragOverColumn === colStatus;
              
              let headerColor = 'text-white/40';
              let dotColor = 'bg-white/30';
              if (colStatus === 'Booked') { headerColor = 'text-blue-400'; dotColor = 'bg-blue-400'; }
              if (colStatus === 'In Transit') { headerColor = 'text-[#D946C4]'; dotColor = 'bg-[#D946C4]'; }
              if (colStatus === 'Delivered') { headerColor = 'text-emerald-400'; dotColor = 'bg-emerald-400'; }

              return (
                <div
                  key={colStatus}
                  onDragOver={(e) => handleDragOver(e, colStatus)}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={() => handleDrop(colStatus)}
                  className={`bg-white/2 border rounded-2xl p-4 flex flex-col min-h-[480px] transition-all duration-200 ${
                    isOver ? 'border-[#D946C4]/30 bg-white/4 shadow-lg shadow-[#D946C4]/5' : 'border-white/5'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3.5">
                    <h5 className={`text-[10px] font-mono uppercase tracking-wider flex items-center gap-2 ${headerColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                      <span>{colStatus}</span>
                    </h5>
                    <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/40">
                      {colShipments.length}
                    </span>
                  </div>

                  {/* Kanban Cards Scroll container */}
                  <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] scrollbar-none">
                    {colShipments.length > 0 ? (
                      colShipments.map(card => {
                        const isPending = card.status === 'Pending Confirmation';

                        return (
                          <div
                            key={card.id}
                            id={`kanban-card-${card.id}`}
                            draggable
                            onDragStart={() => handleDragStart(card.id)}
                            onDragOver={(e) => handleCardDragOver(e, card.id)}
                            onDragLeave={() => setDragOverCardId(null)}
                            onDrop={(e) => handleCardDrop(e, card.id, colStatus)}
                            onClick={() => setSelectedShipment(card)}
                            className={`p-3.5 border rounded-xl space-y-2.5 cursor-grab active:cursor-grabbing transition-all duration-200 shadow-md ${
                              draggedId === card.id 
                                ? 'opacity-40 border-dashed border-white/20 bg-stone-900/20' 
                                : dragOverCardId === card.id && draggedId !== card.id
                                  ? 'border-[#D946C4] bg-stone-900/90 scale-[1.02] shadow-lg shadow-[#D946C4]/10'
                                  : 'bg-stone-900/60 hover:bg-stone-900/90 border-white/5 hover:border-white/15 hover:shadow-black/20'
                            }`}
                          >
                            {/* Card Top: ID & Source */}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-[#D946C4] font-bold">{card.id}</span>
                              <div className="flex items-center gap-1.5">
                                {card.source === 'ai' ? (
                                  <span className="flex items-center gap-1 text-[8px] uppercase tracking-wide font-mono bg-[#D946C4]/10 text-[#D946C4] border border-[#D946C4]/20 px-1 rounded-md">
                                    <Sparkles size={8} /> parsed
                                  </span>
                                ) : (
                                  <span className="text-white/20" title="Manual Entry">
                                    <User size={8} />
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Client & Route */}
                            <div>
                              <h4 className="text-xs font-bold text-white truncate">{card.clientName}</h4>
                              <p className="text-[10px] text-white/40 truncate">{card.companyName}</p>
                            </div>

                            {/* Lane */}
                            <div className="flex items-center justify-between text-[10px] text-white/70 py-1 border-t border-b border-white/5">
                              <span className="font-semibold">{card.routeFrom}</span>
                              <ArrowRight size={10} className="text-white/30 mx-1 shrink-0" />
                              <span className="font-semibold">{card.routeTo}</span>
                            </div>

                            {/* Truck size & Plate */}
                            <div className="flex justify-between text-[9px] text-white/40">
                              <span>{card.truckSize}</span>
                              <span className="font-mono">{card.truckNo}</span>
                            </div>

                            {/* Amount & Confirm buttons */}
                            <div className="flex items-center justify-between border-t border-white/5 pt-2">
                              <span className="text-xs font-bold text-white">₹{card.amount.toLocaleString('en-IN')}</span>
                              {isPending && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => handleConfirmPending(card.id, e)}
                                    className="px-1.5 py-0.5 bg-[#D946C4] hover:bg-[#c33eb0] text-stone-950 text-[9px] font-bold rounded"
                                    title="Quick Confirm"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={(e) => openEditModal(card, e)}
                                    className="px-1.5 py-0.5 bg-white/5 hover:bg-white/10 text-white text-[9px] rounded"
                                    title="Quick Edit"
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      /* Drag instruction empty col state */
                      <div className="h-24 border border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-center text-white/20 p-2 text-[10px]">
                        <span>Drop shipments here</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* 6. SLIDING FROSTED DRAWER FROM RIGHT (Detail Drawer) */}
      <AnimatePresence>
        {selectedShipment && (
          <>
            {/* Backdrop Dim with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedShipment(null)}
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Sliding Frosted Drawer */}
            <motion.div
              id="shipment-detail-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-stone-950/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#D946C4] font-bold">{selectedShipment.id}</span>
                    <span className="text-[10px] text-white/30">•</span>
                    <span className="text-[10px] font-mono text-white/40 uppercase">Shipment File</span>
                  </div>
                  <button
                    onClick={() => setSelectedShipment(null)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white border border-white/5 transition-all"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Profile Box */}
                <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D946C4]/10 border border-[#D946C4]/20 flex items-center justify-center font-bold text-[#D946C4] text-lg">
                    {selectedShipment.clientName ? selectedShipment.clientName.charAt(0) : 'S'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{selectedShipment.clientName}</h4>
                    <p className="text-xs text-white/40 mt-0.5">{selectedShipment.companyName}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#D946C4] font-mono">
                      {selectedShipment.source === 'ai' ? (
                        <>
                          <Sparkles size={10} />
                          <span>Parsed via WhatsApp integration</span>
                        </>
                      ) : (
                        <>
                          <User size={10} />
                          <span>Created manually by dispatcher</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Horizontal Stepper Stepper (Booked → Picked Up → In Transit → Delivered) */}
                <div className="space-y-2.5">
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-white/40">Shipment Status Progress</h5>
                  
                  {/* Stepper Node Line */}
                  <div className="bg-white/2 border border-white/5 p-4 rounded-2xl">
                    <div className="flex items-center justify-between relative">
                      {/* Connecting Line */}
                      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-white/5 -z-10" />
                      
                      {(['Booked', 'In Transit', 'Delivered'] as const).map((step, idx) => {
                        const currentStatus = selectedShipment.status;
                        
                        let isCompleted = false;
                        let isActive = currentStatus === step;

                        if (step === 'Booked') {
                          isCompleted = currentStatus === 'Booked' || currentStatus === 'In Transit' || currentStatus === 'Delivered';
                        } else if (step === 'In Transit') {
                          isCompleted = currentStatus === 'In Transit' || currentStatus === 'Delivered';
                        } else if (step === 'Delivered') {
                          isCompleted = currentStatus === 'Delivered';
                        }

                        let nodeColor = 'bg-stone-900 border-white/10 text-white/40';
                        if (isCompleted) nodeColor = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';
                        if (isActive) nodeColor = 'bg-[#D946C4] text-white border-[#D946C4]/80';

                        return (
                          <div 
                            key={step} 
                            onClick={() => handleUpdateStatusDirectly(selectedShipment.id, step)}
                            className="flex flex-col items-center gap-1.5 cursor-pointer group"
                          >
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold transition-all duration-200 group-hover:scale-105 ${nodeColor}`}>
                              {isCompleted && !isActive ? <Check size={13} /> : idx + 1}
                            </div>
                            <span className={`text-[9px] font-semibold font-mono ${isActive ? 'text-[#D946C4]' : isCompleted ? 'text-emerald-400/80' : 'text-white/30'}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[9px] text-white/30 text-center mt-3">Click on stepper nodes to manually update status progress</p>
                  </div>
                </div>

                {/* Basic Shipment Details */}
                <div className="bg-white/2 border border-white/5 rounded-2xl p-4 space-y-3.5">
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-white/40">Freight Information</h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] text-white/40 block font-mono">ORIGIN</span>
                      <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-[#D946C4]" /> {selectedShipment.routeFrom}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-white/40 block font-mono">DESTINATION</span>
                      <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-emerald-400" /> {selectedShipment.routeTo}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-white/40 block font-mono">VEHICLE ASSIGNED</span>
                      <span className="text-xs font-semibold text-white/85 block mt-0.5">{selectedShipment.truckSize}</span>
                      <span className="text-[10px] font-mono text-white/40 mt-0.5 block">{selectedShipment.truckNo}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-white/40 block font-mono">PICKUP DATE</span>
                      <span className="text-xs font-mono text-white/80 block mt-0.5">{selectedShipment.pickupDate}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-white/40 block font-mono">TOTAL BOOKING RATE</span>
                      <span className="text-sm font-bold text-[#D946C4] block mt-0.5">₹{selectedShipment.amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {selectedShipment.notes && (
                    <div className="border-t border-white/5 pt-3 mt-1 text-xs">
                      <span className="text-[9px] text-white/40 block font-mono">CONSIGNMENT NOTES</span>
                      <p className="text-white/70 mt-1 italic">&ldquo;{selectedShipment.notes}&rdquo;</p>
                    </div>
                  )}
                </div>

                {/* Linked Documents Tags */}
                <div className="space-y-2.5">
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-white/40">Linked Documents</h5>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleNavigateDocument('invoice', 'INV-9821')}
                      className="p-3 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl flex flex-col items-center gap-1.5 transition-all text-center text-[10px] text-white/80"
                    >
                      <FileText size={16} className="text-blue-400" />
                      <span className="font-semibold font-mono">Invoice</span>
                    </button>
                    <button
                      onClick={() => handleNavigateDocument('lr', 'LR-9821')}
                      className="p-3 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl flex flex-col items-center gap-1.5 transition-all text-center text-[10px] text-white/80"
                    >
                      <FileText size={16} className="text-emerald-400" />
                      <span className="font-semibold font-mono">Lorry Receipt</span>
                    </button>
                    <button
                      onClick={() => handleNavigateDocument('receipt', 'MR-9821')}
                      className="p-3 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl flex flex-col items-center gap-1.5 transition-all text-center text-[10px] text-white/80"
                    >
                      <FileText size={16} className="text-[#D946C4]" />
                      <span className="font-semibold font-mono">Money Receipt</span>
                    </button>
                  </div>
                  <p className="text-[9px] text-white/30 text-center">Click tag to view or print document files</p>
                </div>

                {/* Log activity list */}
                <div className="space-y-2.5">
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-white/40">Audit Trail / Activity Log</h5>
                  <div className="bg-stone-900/40 border border-white/5 p-4 rounded-2xl max-h-[160px] overflow-y-auto space-y-3">
                    {selectedShipment.activityLog && selectedShipment.activityLog.length > 0 ? (
                      selectedShipment.activityLog.map((log, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D946C4] mt-1 shrink-0" />
                          <div className="space-y-0.5">
                            <p className="text-xs text-white/80">{log.message}</p>
                            <span className="text-[9px] font-mono text-white/30">{log.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-white/30">No activities registered for this shipment.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar inside drawer */}
              <div className="border-t border-white/5 pt-4 mt-6 flex items-center justify-between gap-2.5">
                <button
                  id="drawer-delete-btn"
                  onClick={() => handleDeleteShipment(selectedShipment.id)}
                  className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl transition-all"
                >
                  Cancel / Remove
                </button>
                <button
                  id="drawer-edit-btn"
                  onClick={(e) => openEditModal(selectedShipment, e)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Edit Shipment
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 7. "+ NEW SHIPMENT" / EDIT MODAL FORM */}
      <AnimatePresence>
        {isNewModalOpen && (
          <div 
            id="new-shipment-modal-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in"
          >
            {/* Modal Box */}
            <motion.div
              id="new-shipment-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg bg-stone-900/95 border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-visible flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 shrink-0">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders size={15} className="text-[#D946C4]" />
                  <span>{isEditMode ? `Edit Shipment File #${editShipmentId}` : 'Create Shipment File'}</span>
                </h4>
                <button
                  id="modal-close-btn"
                  onClick={closeFormModal}
                  className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content Scrolling Area */}
              <form onSubmit={handleCreateShipment} className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Searchable Client Account Field */}
                <div className="relative">
                  <label className="text-[10px] text-white/50 font-semibold block mb-1.5 uppercase font-mono">
                    Client Account Name *
                  </label>
                  <div className="relative">
                    <input
                      id="form-client-search"
                      type="text"
                      placeholder="Type to search or select client..."
                      value={formClientName}
                      onChange={(e) => {
                        setFormClientName(e.target.value);
                        setClientSearchText(e.target.value);
                        setIsClientDropdownOpen(true);
                      }}
                      onFocus={() => setIsClientDropdownOpen(true)}
                      className="w-full h-10 px-3 bg-stone-950 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D946C4]/30"
                      required
                    />
                    
                    {/* Client Dropdown Box */}
                    {isClientDropdownOpen && filteredDropdownClients.length > 0 && (
                      <div className="absolute left-0 right-0 top-11 bg-stone-950 border border-white/15 rounded-xl z-20 shadow-2xl max-h-48 overflow-y-auto p-1 divide-y divide-white/5">
                        {filteredDropdownClients.map((client, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setFormClientName(client.name);
                              setFormCompanyName(client.companyName);
                              setIsClientDropdownOpen(false);
                            }}
                            className="p-2 text-xs text-white/80 hover:bg-white/5 rounded-lg cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <span className="font-semibold block">{client.name}</span>
                              <span className="text-[10px] text-white/40 block">{client.companyName}</span>
                            </div>
                            <span className="text-[10px] font-mono text-white/30">{client.role || 'Client'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Hidden/Helper Corporate Sync Group */}
                {formCompanyName && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl flex items-center gap-2 text-[10px] text-emerald-400">
                    <CheckCircle2 size={12} />
                    <span>Associated Company: <strong>{formCompanyName}</strong></span>
                  </div>
                )}

                {/* Origin & Destination Lane */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-white/50 font-semibold block mb-1.5 uppercase font-mono">
                      Origin City *
                    </label>
                    <input
                      id="form-route-from"
                      type="text"
                      placeholder="e.g. Delhi"
                      value={formRouteFrom}
                      onChange={(e) => setFormRouteFrom(e.target.value)}
                      className="w-full h-10 px-3 bg-stone-950 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D946C4]/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/50 font-semibold block mb-1.5 uppercase font-mono">
                      Destination City *
                    </label>
                    <input
                      id="form-route-to"
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={formRouteTo}
                      onChange={(e) => setFormRouteTo(e.target.value)}
                      className="w-full h-10 px-3 bg-stone-950 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D946C4]/30"
                      required
                    />
                  </div>
                </div>

                {/* Truck Size (auto suggested) & Truck Plate Number */}
                <div className="grid grid-cols-2 gap-3 overflow-visible">
                  <div>
                    <label className="text-[10px] text-white/50 font-semibold block mb-1.5 uppercase font-mono">
                      Truck Configuration *
                    </label>
                    <select
                      id="form-truck-size"
                      value={formTruckSize}
                      onChange={(e) => setFormTruckSize(e.target.value)}
                      className="w-full h-10 px-3 bg-stone-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#D946C4]/30"
                    >
                      {TRUCK_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <label className="text-[10px] text-white/50 font-semibold block mb-1.5 uppercase font-mono">
                      Truck Plate Number *
                    </label>
                    <div className="relative">
                      <input
                        id="form-truck-no"
                        type="text"
                        placeholder="Search or enter plate..."
                        value={formTruckNo}
                        onChange={(e) => {
                          setFormTruckNo(e.target.value);
                          setTruckSearchText(e.target.value);
                          setIsTruckDropdownOpen(true);
                        }}
                        onFocus={() => setIsTruckDropdownOpen(true)}
                        className="w-full h-10 px-3 bg-stone-950 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D946C4]/30 font-mono"
                        required
                      />

                      {isTruckDropdownOpen && (
                        <div className="absolute left-0 right-0 top-11 bg-stone-950 border border-white/15 rounded-xl z-20 shadow-2xl max-h-48 overflow-y-auto p-1 divide-y divide-white/5">
                          {filteredDropdownTrucks.map((truck, idx) => {
                            const driver = fleetDrivers.find(d => d.id === truck.assignedDriverId);
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  setFormTruckNo(truck.truckNo);
                                  setFormTruckSize(truck.truckType);
                                  setTruckSearchText(truck.truckNo);
                                  if (driver) {
                                    setFormDriverName(driver.name);
                                    setFormDriverPhone(driver.phone);
                                  }
                                  setIsTruckDropdownOpen(false);
                                }}
                                className="p-2 text-xs text-white/80 hover:bg-white/5 rounded-lg cursor-pointer flex items-center justify-between"
                              >
                                <div className="text-left">
                                  <span className="font-semibold block font-mono">{truck.truckNo}</span>
                                  <span className="text-[9px] text-white/40 block">{truck.truckType}</span>
                                </div>
                                {driver && (
                                  <div className="text-right">
                                    <span className="text-[9px] text-[#D946C4] block">{driver.name}</span>
                                    <span className="text-[8px] text-white/30 block font-mono">{driver.phone}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {filteredDropdownTrucks.length === 0 && (
                            <div className="p-3 text-xs text-white/40 text-center italic">
                              Unrecognized vehicle. Custom plate number.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assigned Driver auto-fill card */}
                {formDriverName && (
                  <div className="bg-[#D946C4]/5 border border-[#D946C4]/15 p-2.5 rounded-xl flex items-center justify-between text-[10px] text-white/80 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#D946C4]/20 flex items-center justify-center font-bold text-[#D946C4]">
                        {formDriverName.charAt(0)}
                      </div>
                      <span>Assigned Driver: <strong>{formDriverName}</strong> ({formDriverPhone})</span>
                    </div>
                    <span className="text-[9px] bg-[#D946C4]/10 text-[#D946C4] px-1.5 py-0.5 rounded font-mono uppercase font-bold">Auto-filled</span>
                  </div>
                )}

                {/* Pickup Date & Freight Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-white/50 font-semibold block mb-1.5 uppercase font-mono">
                      Planned Pickup Date *
                    </label>
                    <input
                      id="form-pickup-date"
                      type="date"
                      value={formPickupDate}
                      onChange={(e) => setFormPickupDate(e.target.value)}
                      className="w-full h-10 px-3 bg-stone-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/50 font-semibold block mb-1.5 uppercase font-mono flex items-center justify-between">
                      <span>Rate Amount (₹) *</span>
                      <span className="text-[8px] text-[#D946C4] lowercase font-normal italic">Suggested from matrix</span>
                    </label>
                    <input
                      id="form-amount"
                      type="number"
                      placeholder="₹ Rate Value"
                      value={formAmount}
                      onChange={(e) => setFormAmount(parseInt(e.target.value) || 0)}
                      className="w-full h-10 px-3 bg-stone-950 border border-white/10 rounded-xl text-xs text-white font-mono placeholder-white/30 focus:outline-none focus:border-[#D946C4]/30"
                      required
                    />
                  </div>
                </div>

                {/* Dispatch Notes */}
                <div>
                  <label className="text-[10px] text-white/50 font-semibold block mb-1.5 uppercase font-mono">
                    Consignment Dispatch Notes
                  </label>
                  <textarea
                    id="form-notes"
                    placeholder="Provide special instructions, temperature requests, load types etc..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-stone-950 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D946C4]/30 resize-none"
                  />
                </div>

                {/* Footer buttons inside modal box scroll */}
                <div className="border-t border-white/5 pt-4 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={closeFormModal}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white text-xs font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    id="modal-submit-btn"
                    type="submit"
                    className="px-5 py-2 bg-[#D946C4] hover:bg-[#D946C4]/80 text-white text-xs font-bold rounded-xl shadow-lg shadow-[#D946C4]/10 transition-all active:scale-95"
                  >
                    {isEditMode ? 'Save Changes' : 'Create Booking'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- IN-APP TOAST NOTIFICATION POPUP --- */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            id="shipments-toast"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-900/90 border border-[#D946C4]/30 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50 backdrop-blur-md"
          >
            <Sparkles className="text-[#D946C4]" size={14} />
            <span className="font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
