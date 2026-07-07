import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  User, 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  Copy, 
  Plus, 
  Search, 
  ChevronRight, 
  X, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  Phone,
  MessageSquare,
  Sparkles,
  Info,
  Check,
  StarHalf,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageId } from '../types';

interface Trip {
  id: string;
  date: string;
  client: string;
  companyName: string;
  routeFrom: string;
  routeTo: string;
  status: 'Pending Confirmation' | 'Booked' | 'In Transit' | 'Delivered' | 'Cancelled';
  shipmentId: string;
  amount: number;
}

interface TruckRecord {
  id: string;
  truckNo: string;
  truckType: string;
  assignedDriverId: string;
  notes?: string;
}

interface DriverRecord {
  id: string;
  name: string;
  phone: string;
  rating: number;
  notes?: string;
}

interface FleetDriversProps {
  setActivePage?: (page: PageId) => void;
}

const TRUCK_TYPES = ['407 LCV', 'Eicher 14ft', 'Eicher 19ft', '22ft Container', '32ft Multi-Axle'];

const INITIAL_TRUCKS: TruckRecord[] = [
  { id: 'T-1', truckNo: 'HR-55-A-8902', truckType: '22ft Container', assignedDriverId: 'D-1', notes: 'Refrigerated container for cold storage' },
  { id: 'T-2', truckNo: 'GJ-01-XX-4820', truckType: 'Eicher 14ft', assignedDriverId: 'D-2', notes: 'Dry van setup' },
  { id: 'T-3', truckNo: 'HR-38-S-5501', truckType: '32ft Multi-Axle', assignedDriverId: 'D-3', notes: 'Flatbed steel carrier' },
  { id: 'T-4', truckNo: 'KA-03-M-1102', truckType: '407 LCV', assignedDriverId: 'D-4', notes: 'Intracity express dispatches' },
  { id: 'T-5', truckNo: 'DL-1C-AA-9081', truckType: 'Eicher 19ft', assignedDriverId: 'D-5', notes: 'Open body standard cargo' },
  { id: 'T-6', truckNo: 'MP-04-HE-1234', truckType: 'Eicher 19ft', assignedDriverId: 'D-6', notes: 'Bhopal local fleet node' },
  { id: 'T-7', truckNo: 'PB-02-C-5231', truckType: '22ft Container', assignedDriverId: 'D-7', notes: 'Agri-freight setup' }
];

const INITIAL_DRIVERS: DriverRecord[] = [
  { id: 'D-1', name: 'Alex Singh', phone: '+91 98120 12345', rating: 4.6, notes: 'Hazmat & Cold-chain certified' },
  { id: 'D-2', name: 'Gurpreet Singh', phone: '+91 99887 76655', rating: 4.9, notes: 'Express lane cargo expert' },
  { id: 'D-3', name: 'Devender Kumar', phone: '+91 91234 56789', rating: 4.5, notes: 'Heavy industrial machinery dispatcher' },
  { id: 'D-4', name: 'Madan Lal', phone: '+91 98000 11122', rating: 4.3, notes: 'Intracity logistics specialist' },
  { id: 'D-5', name: 'Rajesh Kumar', phone: '+91 96543 21098', rating: 4.7, notes: 'National route driver (long haul)' },
  { id: 'D-6', name: 'Ramesh Kumar', phone: '+91 98765 43210', rating: 4.8, notes: 'Madhya Pradesh regional route expert' },
  { id: 'D-7', name: 'Rajinder Pal', phone: '+91 95400 98765', rating: 4.4, notes: 'Northern corridor lane driver' }
];

export default function FleetDrivers({ setActivePage }: FleetDriversProps) {
  const [trucks, setTrucks] = useState<TruckRecord[]>(() => {
    const saved = localStorage.getItem('vanguard_fleet_trucks');
    return saved ? JSON.parse(saved) : INITIAL_TRUCKS;
  });

  const [drivers, setDrivers] = useState<DriverRecord[]>(() => {
    const saved = localStorage.getItem('vanguard_fleet_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [activeView, setActiveView] = useState<'truck' | 'driver'>('truck');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer & Modal states
  const [selectedTruck, setSelectedTruck] = useState<TruckRecord | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DriverRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; subText?: string } | null>(null);

  // Form Fields
  const [formTruckNo, setFormTruckNo] = useState('');
  const [formTruckType, setFormTruckType] = useState('Eicher 19ft');
  const [formDriverName, setFormDriverName] = useState('');
  const [formDriverPhone, setFormDriverPhone] = useState('');
  const [formDriverRating, setFormDriverRating] = useState('4.5');
  const [formNotes, setFormNotes] = useState('');

  // Persist State
  useEffect(() => {
    localStorage.setItem('vanguard_fleet_trucks', JSON.stringify(trucks));
    window.dispatchEvent(new Event('vanguard_fleet_updated'));
  }, [trucks]);

  useEffect(() => {
    localStorage.setItem('vanguard_fleet_drivers', JSON.stringify(drivers));
    window.dispatchEvent(new Event('vanguard_fleet_updated'));
  }, [drivers]);

  // Load Shipments to construct Live Trip History
  const [shipments, setShipments] = useState<any[]>([]);

  const loadShipments = () => {
    const saved = localStorage.getItem('vanguard_shipments');
    if (saved) {
      try {
        setShipments(JSON.parse(saved));
      } catch (e) {
        setShipments([]);
      }
    }
  };

  useEffect(() => {
    loadShipments();
    window.addEventListener('vanguard_shipments_updated', loadShipments);
    window.addEventListener('storage', loadShipments);
    return () => {
      window.removeEventListener('vanguard_shipments_updated', loadShipments);
      window.removeEventListener('storage', loadShipments);
    };
  }, []);

  const triggerToast = (message: string, subText?: string) => {
    setToast({ message, subText });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyPhone = (e: React.MouseEvent, phone: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    triggerToast("Phone number copied", phone);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Add Truck/Driver operation
  const handleAddTruckDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTruckNo || !formDriverName || !formDriverPhone) {
      alert('Please fill in Truck Plate Number, Driver Name, and Phone Number.');
      return;
    }

    const cleanTruckNo = formTruckNo.toUpperCase().trim();
    const cleanDriverName = formDriverName.trim();
    const cleanDriverPhone = formDriverPhone.trim();

    // Check if truck already exists
    const existingTruck = trucks.find(t => t.truckNo.replace(/\s+/g, '') === cleanTruckNo.replace(/\s+/g, ''));
    if (existingTruck) {
      alert(`Vehicle with Plate Number ${cleanTruckNo} is already registered in the fleet.`);
      return;
    }

    const driverId = `D-${Date.now()}`;
    const truckId = `T-${Date.now()}`;

    // Add Driver
    const newDriver: DriverRecord = {
      id: driverId,
      name: cleanDriverName,
      phone: cleanDriverPhone,
      rating: parseFloat(formDriverRating) || 4.5,
      notes: formNotes || 'Onboarded via operator.'
    };

    // Add Truck
    const newTruck: TruckRecord = {
      id: truckId,
      truckNo: cleanTruckNo,
      truckType: formTruckType,
      assignedDriverId: driverId,
      notes: formNotes
    };

    setDrivers(prev => [...prev, newDriver]);
    setTrucks(prev => [...prev, newTruck]);

    triggerToast("Fleet Record Added", `${cleanTruckNo} registered to ${cleanDriverName}`);
    
    // Reset Form
    setFormTruckNo('');
    setFormTruckType('Eicher 19ft');
    setFormDriverName('');
    setFormDriverPhone('');
    setFormDriverRating('4.5');
    setFormNotes('');
    setIsAddModalOpen(false);
  };

  // Trip history logic for a given truck
  const getTruckTrips = (truckNo: string) => {
    return shipments.filter(s => s.truckNo.replace(/\s+/g, '').toLowerCase() === truckNo.replace(/\s+/g, '').toLowerCase());
  };

  // Trip history logic for a given driver
  const getDriverTrips = (driverName: string, assignedTruckNo?: string) => {
    return shipments.filter(s => {
      const matchName = s.driverName && s.driverName.toLowerCase() === driverName.toLowerCase();
      const matchTruck = assignedTruckNo && s.truckNo.replace(/\s+/g, '').toLowerCase() === assignedTruckNo.replace(/\s+/g, '').toLowerCase();
      return matchName || matchTruck;
    });
  };

  // Compute stats for detail drawers
  const getDrawerStats = (trips: any[], driverRating: number) => {
    const totalTrips = trips.length;
    const totalDistance = totalTrips * 320; // estimate 320km per trip
    const averageRating = driverRating || 4.5;
    
    // Find most common route
    const routes: Record<string, number> = {};
    trips.forEach(t => {
      const r = `${t.routeFrom} → ${t.routeTo}`;
      routes[r] = (routes[r] || 0) + 1;
    });
    
    let commonRoute = 'Bhopal → Indore';
    let max = 0;
    Object.keys(routes).forEach(r => {
      if (routes[r] > max) {
        max = routes[r];
        commonRoute = r;
      }
    });

    return { totalTrips, totalDistance, averageRating, commonRoute };
  };

  // Search filter implementation
  const filteredTrucks = useMemo(() => {
    return trucks.filter(t => {
      const driver = drivers.find(d => d.id === t.assignedDriverId);
      const query = searchQuery.toLowerCase().trim();
      return (
        t.truckNo.toLowerCase().includes(query) ||
        t.truckType.toLowerCase().includes(query) ||
        (driver && driver.name.toLowerCase().includes(query)) ||
        (driver && driver.phone.includes(query))
      );
    });
  }, [trucks, drivers, searchQuery]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const truck = trucks.find(t => t.assignedDriverId === d.id);
      const query = searchQuery.toLowerCase().trim();
      return (
        d.name.toLowerCase().includes(query) ||
        d.phone.includes(query) ||
        (truck && truck.truckNo.toLowerCase().includes(query)) ||
        (truck && truck.truckType.toLowerCase().includes(query))
      );
    });
  }, [drivers, trucks, searchQuery]);

  // Navigate to shipments page helper
  const handleNavigateShipment = (shipmentId: string) => {
    localStorage.setItem('vanguard_last_selected_shipment', shipmentId);
    if (setActivePage) {
      setActivePage('shipments');
    }
  };

  // Rendering Helper for Stars
  const renderStars = (rating: number) => {
    const filledStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[...Array(filledStars)].map((_, i) => (
          <Star key={i} size={11} fill="currentColor" />
        ))}
        {hasHalf && <StarHalf size={11} fill="currentColor" />}
        {[...Array(5 - filledStars - (hasHalf ? 1 : 0))].map((_, i) => (
          <Star key={i} size={11} className="text-white/20" />
        ))}
        <span className="text-[10px] text-white/50 font-bold ml-1 font-mono">{rating} ★</span>
      </div>
    );
  };

  // Retrieve active drawer state
  const activeDrawerTrips = useMemo(() => {
    if (selectedTruck) {
      return getTruckTrips(selectedTruck.truckNo);
    }
    if (selectedDriver) {
      const truck = trucks.find(t => t.assignedDriverId === selectedDriver.id);
      return getDriverTrips(selectedDriver.name, truck?.truckNo);
    }
    return [];
  }, [selectedTruck, selectedDriver, shipments, trucks]);

  const activeDrawerStats = useMemo(() => {
    const rating = selectedTruck 
      ? (drivers.find(d => d.id === selectedTruck.assignedDriverId)?.rating || 4.5)
      : (selectedDriver?.rating || 4.5);
    return getDrawerStats(activeDrawerTrips, rating);
  }, [selectedTruck, selectedDriver, activeDrawerTrips, drivers]);

  return (
    <div className="flex flex-col flex-1 space-y-6 relative text-white">
      {/* 1. HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-lg sm:text-xl text-[#F2EEF9]">Fleet & Drivers</h1>
          <p className="text-xs text-white/40 mt-0.5">Operational registry of trucks, drivers & live dispatch histories</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:w-64 max-w-xs">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plate, driver, phone..."
              className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/5 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D946C4]/30"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Add Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-[#D946C4] hover:bg-[#D946C4]/95 text-white font-bold text-xs tracking-wide transition-all shadow-[0_4px_16px_rgba(217,70,196,0.12)] flex items-center gap-1.5 cursor-pointer select-none active:scale-95 shrink-0"
          >
            <Plus size={14} />
            Add Truck/Driver
          </button>
        </div>
      </div>

      {/* 2. VIEW TOGGLE BAR */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="inline-flex p-0.5 rounded-lg bg-stone-950/40 border border-white/5 self-start">
          <button
            onClick={() => { setActiveView('truck'); setSearchQuery(''); }}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeView === 'truck' 
                ? 'bg-white/10 text-white border-b border-white/5 shadow-inner' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            By Truck
          </button>
          <button
            onClick={() => { setActiveView('driver'); setSearchQuery(''); }}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeView === 'driver' 
                ? 'bg-white/10 text-white border-b border-white/5 shadow-inner' 
                : 'text-white/50 hover:text-white'
            }`}
          >
            By Driver
          </button>
        </div>

        <div className="text-[10px] font-mono text-white/30">
          Total: {activeView === 'truck' ? filteredTrucks.length : filteredDrivers.length} Entries
        </div>
      </div>

      {/* 3. CARD GRID AREA */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {activeView === 'truck' ? (
            <motion.div
              key="truck-grid"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredTrucks.length === 0 ? (
                <div className="col-span-full p-12 text-center text-white/30 border border-dashed border-white/5 rounded-2xl bg-white/2">
                  <Truck size={24} className="mx-auto mb-2 text-white/10" />
                  <p className="text-xs font-semibold">No trucks match your query.</p>
                </div>
              ) : (
                filteredTrucks.map((truck, idx) => {
                  const driver = drivers.find(d => d.id === truck.assignedDriverId);
                  const trips = getTruckTrips(truck.truckNo);
                  const lastTrip = trips.length > 0 ? trips[0] : null;

                  // Find most common route
                  const routes: Record<string, number> = {};
                  trips.forEach(t => {
                    const r = `${t.routeFrom} → ${t.routeTo}`;
                    routes[r] = (routes[r] || 0) + 1;
                  });
                  let commonRoute = 'N/A';
                  let max = 0;
                  Object.keys(routes).forEach(r => {
                    if (routes[r] > max) {
                      max = routes[r];
                      commonRoute = r;
                    }
                  });

                  return (
                    <motion.div
                      key={truck.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      className="bg-white/4 border border-white/8 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-[#D946C4]/25 transition-all group relative overflow-hidden"
                    >
                      {/* Inner glowing top highlight */}
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#D946C4]/15 to-transparent pointer-events-none" />

                      <div className="space-y-4">
                        {/* Truck Plate No & Size */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-bold tracking-wider text-[#F2EEF9] font-mono group-hover:text-[#D946C4] transition-colors">
                              {truck.truckNo}
                            </h3>
                            <span className="inline-block text-[10px] text-white/50 bg-white/5 border border-white/5 rounded px-2 py-0.5 mt-1">
                              {truck.truckType}
                            </span>
                          </div>
                          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40">
                            <Truck size={14} />
                          </div>
                        </div>

                        {/* Assigned Driver details */}
                        {driver ? (
                          <div className="bg-stone-950/20 border border-white/5 p-3 rounded-xl space-y-2">
                            <span className="text-[9px] font-mono text-white/30 uppercase block">Active Assigner</span>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#D946C4]/20 border border-[#D946C4]/30 flex items-center justify-center text-xs font-bold text-[#D946C4]">
                                {driver.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold text-white truncate">{driver.name}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-white/50 font-mono">{driver.phone}</span>
                                  <button
                                    onClick={(e) => handleCopyPhone(e, driver.phone, driver.id)}
                                    className="text-white/30 hover:text-white p-0.5 rounded transition-colors"
                                    title="Copy Contact Phone"
                                  >
                                    {copiedId === driver.id ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="pt-1.5 border-t border-white/5 flex items-center justify-between">
                              <span className="text-[9px] text-white/40">Driver Score:</span>
                              {renderStars(driver.rating)}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-stone-950/10 border border-dashed border-white/5 p-3 rounded-xl text-center text-xs text-white/30 italic">
                            No driver assigned
                          </div>
                        )}

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center text-xs">
                          <div className="bg-white/2 p-2 rounded-lg">
                            <span className="text-[9px] text-white/40 block">Trips Completed</span>
                            <span className="font-mono font-bold text-white block mt-0.5">{trips.length} run</span>
                          </div>
                          <div className="bg-white/2 p-2 rounded-lg col-span-2">
                            <span className="text-[9px] text-white/40 block">Primary Lane</span>
                            <span className="font-semibold text-white block mt-0.5 truncate" title={commonRoute}>{commonRoute}</span>
                          </div>
                        </div>
                      </div>

                      {/* View Trip History link */}
                      <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white/30">
                          Last Trip: <span className="text-white/60">{lastTrip ? lastTrip.date : 'No operations'}</span>
                        </span>
                        <button
                          onClick={() => { setSelectedTruck(truck); setSelectedDriver(null); }}
                          className="text-[10px] font-bold text-[#D946C4] hover:text-[#e269d0] transition-colors flex items-center gap-0.5 cursor-pointer uppercase tracking-wider"
                        >
                          Trip Logs
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          ) : (
            <motion.div
              key="driver-grid"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredDrivers.length === 0 ? (
                <div className="col-span-full p-12 text-center text-white/30 border border-dashed border-white/5 rounded-2xl bg-white/2">
                  <User size={24} className="mx-auto mb-2 text-white/10" />
                  <p className="text-xs font-semibold">No drivers match your query.</p>
                </div>
              ) : (
                filteredDrivers.map((driver, idx) => {
                  const assignedTruck = trucks.find(t => t.assignedDriverId === driver.id);
                  const trips = getDriverTrips(driver.name, assignedTruck?.truckNo);
                  const totalDistance = trips.length * 320;

                  return (
                    <motion.div
                      key={driver.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      className="bg-white/4 border border-white/8 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-[#D946C4]/25 transition-all group relative overflow-hidden"
                    >
                      {/* Inner glowing top highlight */}
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#D946C4]/15 to-transparent pointer-events-none" />

                      <div className="space-y-4">
                        {/* Driver Profile Summary */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#D946C4]/20 border border-[#D946C4]/30 flex items-center justify-center font-bold text-[#D946C4] shadow-md shadow-[#D946C4]/5 text-sm shrink-0">
                            {driver.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-[#F2EEF9] truncate group-hover:text-[#D946C4] transition-colors">
                              {driver.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-white/50 font-mono">{driver.phone}</span>
                              <button
                                onClick={(e) => handleCopyPhone(e, driver.phone, driver.id)}
                                className="text-white/30 hover:text-white p-0.5 rounded transition-colors"
                              >
                                {copiedId === driver.id ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Rating block */}
                        <div className="flex items-center justify-between bg-white/2 px-3 py-2 rounded-xl border border-white/5">
                          <span className="text-[10px] text-white/40">Reliability Rating</span>
                          {renderStars(driver.rating)}
                        </div>

                        {/* Assigned Truck Tag */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-white/30 uppercase block">Active Vehicle</span>
                          {assignedTruck ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 border border-white/10 rounded-full text-xs font-semibold text-white/95 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D946C4] animate-pulse" />
                              {assignedTruck.truckNo} ({assignedTruck.truckType})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/25 rounded-full text-xs font-semibold text-rose-400">
                              No vehicle linked
                            </span>
                          )}
                        </div>

                        {/* Performance Stats */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-center text-xs">
                          <div className="bg-white/2 p-2 rounded-lg">
                            <span className="text-[9px] text-white/40 block">Trips Completed</span>
                            <span className="font-mono font-bold text-white block mt-0.5">{trips.length} runs</span>
                          </div>
                          <div className="bg-white/2 p-2 rounded-lg">
                            <span className="text-[9px] text-white/40 block">Est. Run Dist</span>
                            <span className="font-mono font-bold text-white block mt-0.5">{totalDistance} km</span>
                          </div>
                        </div>
                      </div>

                      {/* View Trip History link */}
                      <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-end">
                        <button
                          onClick={() => { setSelectedDriver(driver); setSelectedTruck(null); }}
                          className="text-[10px] font-bold text-[#D946C4] hover:text-[#e269d0] transition-colors flex items-center gap-0.5 cursor-pointer uppercase tracking-wider"
                        >
                          Trip Logs
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. EXPANDED TRIP HISTORY DRAWER */}
      <AnimatePresence>
        {(selectedTruck || selectedDriver) && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedTruck(null); setSelectedDriver(null); }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-stone-950 border-l border-white/10 shadow-2xl p-6 flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="space-y-4 shrink-0">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-base font-bold font-mono text-[#F2EEF9]">
                      {selectedTruck ? `History: ${selectedTruck.truckNo}` : `History: ${selectedDriver?.name}`}
                    </h3>
                    <p className="text-[11px] text-white/40 mt-0.5">
                      {selectedTruck ? `Configuration: ${selectedTruck.truckType}` : `Phone Contact: ${selectedDriver?.phone}`}
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelectedTruck(null); setSelectedDriver(null); }}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-colors border border-white/5"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Summary Statistics Card */}
                <div className="bg-gradient-to-br from-[#D946C4]/15 to-[#7C6FE0]/15 border border-[#D946C4]/20 p-4 rounded-2xl grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Trips Dispatched</span>
                    <span className="text-base font-bold text-white font-mono">{activeDrawerStats.totalTrips}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Est. Logistics Run</span>
                    <span className="text-base font-bold text-white font-mono">{activeDrawerStats.totalDistance} km</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Commercial Rating</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={12} className="text-amber-400" fill="currentColor" />
                      <span className="text-xs font-bold text-white font-mono">{activeDrawerStats.averageRating} / 5</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-white/40 uppercase block">Preferred Lane</span>
                    <span className="text-xs font-semibold text-white truncate block">{activeDrawerStats.commonRoute}</span>
                  </div>
                </div>
              </div>

              {/* Chronological List of Trips */}
              <div className="flex-1 overflow-y-auto my-5 pr-1 space-y-3">
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-2">Transit Log Feed</h4>
                {activeDrawerTrips.length === 0 ? (
                  <div className="p-8 text-center text-white/30 border border-dashed border-white/5 rounded-xl bg-white/2">
                    No active dispatches or past operations registered.
                  </div>
                ) : (
                  activeDrawerTrips.map((trip, index) => {
                    const isCompleted = trip.status === 'Delivered';
                    return (
                      <div 
                        key={trip.id || index}
                        className="bg-white/4 border border-white/5 p-3.5 rounded-xl flex flex-col gap-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-white/40 flex items-center gap-1">
                            <Calendar size={10} />
                            {trip.pickupDate || trip.date}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : trip.status === 'Cancelled'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {trip.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-white/40 block text-[9px] uppercase font-mono">Lane</span>
                            <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                              {trip.routeFrom}
                              <ArrowRight size={10} className="text-white/30" />
                              {trip.routeTo}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-white/40 block text-[9px] uppercase font-mono">Freight Contract</span>
                            <span className="font-mono font-semibold text-[#D946C4] mt-0.5 block">₹{(trip.amount || 25000).toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/50">
                          <span>Shipper: <strong className="text-white/70">{trip.companyName || trip.clientName || trip.client}</strong></span>
                          <button
                            onClick={() => handleNavigateShipment(trip.id)}
                            className="bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/5 text-[9px] text-[#D946C4] font-bold flex items-center gap-0.5 transition-colors"
                          >
                            <FileText size={9} />
                            {trip.id}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Close Bottom Area */}
              <div className="shrink-0 pt-4 border-t border-white/5">
                <button
                  onClick={() => { setSelectedTruck(null); setSelectedDriver(null); }}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Close History Feed
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 5. "+ ADD TRUCK/DRIVER" MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-stone-900/95 border border-white/10 rounded-2xl shadow-2xl p-6 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>

              <h3 className="text-base font-bold text-[#F2EEF9] flex items-center gap-2 mb-1.5 font-display">
                <Truck size={16} className="text-[#D946C4]" />
                Onboard Fleet Node
              </h3>
              <p className="text-[11px] text-white/40 mb-4">Register a vehicle plate and assign driver contact profiles.</p>

              <form onSubmit={handleAddTruckDriver} className="space-y-4">
                {/* Truck Plate */}
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1 uppercase">Truck Plate Number *</label>
                  <input
                    type="text"
                    value={formTruckNo}
                    onChange={(e) => setFormTruckNo(e.target.value)}
                    placeholder="e.g. MP-04-HE-1234 or HR-55-A-8902"
                    className="w-full h-10 px-3 bg-stone-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#D946C4]/40 font-mono"
                    required
                  />
                </div>

                {/* Truck Type/Size */}
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1 uppercase">Vehicle Type *</label>
                  <select
                    value={formTruckType}
                    onChange={(e) => setFormTruckType(e.target.value)}
                    className="w-full h-10 px-3 bg-stone-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#D946C4]/40"
                  >
                    {TRUCK_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Driver Name */}
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1 uppercase">Driver Full Name *</label>
                  <input
                    type="text"
                    value={formDriverName}
                    onChange={(e) => setFormDriverName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full h-10 px-3 bg-stone-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#D946C4]/40"
                    required
                  />
                </div>

                {/* Driver Phone */}
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1 uppercase">Driver Phone Number *</label>
                  <input
                    type="tel"
                    value={formDriverPhone}
                    onChange={(e) => setFormDriverPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full h-10 px-3 bg-stone-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#D946C4]/40 font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Rating */}
                  <div>
                    <label className="text-[10px] font-mono text-white/50 block mb-1 uppercase">Driver Rating</label>
                    <select
                      value={formDriverRating}
                      onChange={(e) => setFormDriverRating(e.target.value)}
                      className="w-full h-10 px-3 bg-stone-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#D946C4]/40 font-mono"
                    >
                      {['5.0', '4.9', '4.8', '4.7', '4.6', '4.5', '4.0', '3.5', 'Unrated'].map(r => (
                        <option key={r} value={r === 'Unrated' ? '0' : r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Notes / Licence */}
                  <div>
                    <label className="text-[10px] font-mono text-white/50 block mb-1 uppercase">Licence / Details</label>
                    <input
                      type="text"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="e.g. DL expiry, Permit info"
                      className="w-full h-10 px-3 bg-stone-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#D946C4]/40"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-[#D946C4] hover:bg-[#D946C4]/95 text-white font-bold text-xs tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={13} />
                    Onboard Fleet Node
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global mini-toast alerts stacked absolute */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-stone-900 border border-[#D946C4]/30 rounded-2xl p-4 shadow-xl flex gap-3 pointer-events-none"
          >
            <div className="w-8 h-8 rounded-xl bg-[#D946C4]/15 border border-[#D946C4]/35 flex items-center justify-center text-[#D946C4]">
              <Info size={14} />
            </div>
            <div className="text-xs">
              <p className="font-bold text-white">{toast.message}</p>
              {toast.subText && <p className="text-[10px] text-white/50 font-mono mt-0.5">{toast.subText}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
