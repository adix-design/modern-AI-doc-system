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
  ChevronLeft,
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
  Clock,
  ExternalLink,
  Bell,
  Sliders,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageId } from '../types';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'pickup' | 'meeting' | 'reminder' | 'payment' | 'custom';
  dateTime: string; // e.g. '2026-07-06T14:00'
  duration: string; // e.g. '1 hour', 'All Day', '30 mins'
  linkedType?: 'Client' | 'Shipment' | 'None';
  linkedId?: string;
  linkedLabel?: string;
  notes?: string;
  reminders: string[]; // e.g. ['on-day', '1-day-before']
}

interface CalendarPageProps {
  setActivePage: (page: PageId) => void;
}

// Fallback clients if clients database is empty
const FALLBACK_CLIENTS = [
  { name: 'Amit Sharma', companyName: 'Apex Foods International' },
  { name: 'Priya Patel', companyName: 'Apex Foods International' },
  { name: 'Vikram Singh', companyName: 'Titan Industrial Supply' },
  { name: 'Anjali Rao', companyName: 'Titan Industrial Supply' },
  { name: 'Sanjay Dutt', companyName: 'Noida Freight Carriers' },
  { name: 'Rajesh Gupta', companyName: 'Apex Foods International' }
];

// Fallback shipments if empty
const FALLBACK_SHIPMENTS = [
  { id: 'TRK-2901', clientName: 'Amit Sharma', routeFrom: 'Delhi', routeTo: 'Mumbai', pickupDate: '2026-07-06', truckSize: '22ft Container', truckNo: 'HR-55-A-8902', amount: 45000 },
  { id: 'TRK-1823', clientName: 'Priya Patel', routeFrom: 'Ahmedabad', routeTo: 'Pune', pickupDate: '2026-07-07', truckSize: 'Eicher 14ft', truckNo: 'GJ-01-XX-4820', amount: 18500 },
  { id: 'TRK-0922', clientName: 'Vikram Singh', routeFrom: 'Jaipur', routeTo: 'Noida', pickupDate: '2026-07-08', truckSize: '32ft Multi-Axle', truckNo: 'HR-38-S-5501', amount: 52000 },
  { id: 'TRK-1044', clientName: 'Anjali Rao', routeFrom: 'Chennai', routeTo: 'Bangalore', pickupDate: '2026-07-05', truckSize: '407 LCV', truckNo: 'KA-03-M-1102', amount: 12400 }
];

const EVENT_TYPES = [
  { value: 'pickup', label: 'Pickup / Delivery', color: 'violet', bg: 'bg-[#D946C4]/10 text-[#D946C4] border-[#D946C4]/20 hover:bg-[#D946C4]/20', border: 'border-[#D946C4]', dot: 'bg-[#D946C4]' },
  { value: 'meeting', label: 'Client Meeting', color: 'blue', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20', border: 'border-blue-500', dot: 'bg-blue-500' },
  { value: 'reminder', label: 'Follow-up / Reminder', color: 'purple', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20', border: 'border-purple-500', dot: 'bg-purple-500' },
  { value: 'payment', label: 'Payment Due', color: 'red', bg: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20', border: 'border-red-500', dot: 'bg-red-500' },
  { value: 'custom', label: 'Custom / Other', color: 'stone', bg: 'bg-white/5 text-stone-300 border-white/10 hover:bg-white/10', border: 'border-white/30', dot: 'bg-stone-400' }
];

export default function CalendarPage({ setActivePage }: CalendarPageProps) {
  // Current designated date (Today starts at July 6, 2026 as per workspace prompt timing)
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-07-06T12:00:00'));
  const [selectedView, setSelectedView] = useState<'month' | 'week' | 'day'>('month');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'none'>('none');

  // Load Shipments dynamically for auto-population
  const [shipments, setShipments] = useState<any[]>(() => {
    const saved = localStorage.getItem('vanguard_shipments');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return FALLBACK_SHIPMENTS; }
    }
    return FALLBACK_SHIPMENTS;
  });

  // Watch shipments changes from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('vanguard_shipments');
      if (saved) {
        try { setShipments(JSON.parse(saved)); } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Shipments can change from pages
    window.addEventListener('vanguard_shipments_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('vanguard_shipments_updated', handleStorageChange);
    };
  }, []);

  // Sync / Load Events (combines dynamic shipments and custom events)
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('vanguard_events');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Listener to keep calendar events synchronized with custom events created in background
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('vanguard_events');
      if (saved) {
        try { setCustomEvents(JSON.parse(saved)); } catch (e) {}
      }
    };
    window.addEventListener('vanguard-calendar-updated', handleSync);
    return () => window.removeEventListener('vanguard-calendar-updated', handleSync);
  }, []);

  // Default reminder settings from settings
  const defaultReminderTiming = useMemo(() => {
    const saved = localStorage.getItem('vanguard_settings_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.defaultReminderTiming || '1day';
      } catch (e) {}
    }
    return '1day';
  }, []);

  // Auto-generate pickup events from shipments
  const shipmentEvents = useMemo<CalendarEvent[]>(() => {
    return shipments.map(s => {
      // Determine if delivery or pickup
      return {
        id: `shipment-event-${s.id}`,
        title: `🚚 Load Scheduled: ${s.clientName} (${s.routeFrom} → ${s.routeTo})`,
        type: 'pickup',
        dateTime: `${s.pickupDate}T09:00`,
        duration: 'All Day',
        linkedType: 'Shipment',
        linkedId: s.id,
        linkedLabel: `${s.id} (${s.routeFrom} → ${s.routeTo})`,
        notes: s.notes || `Carrier details: ${s.truckNo || 'TBD'} (${s.truckSize}). Status: ${s.status}. Value: ₹${s.amount.toLocaleString('en-IN')}`,
        reminders: [defaultReminderTiming]
      };
    });
  }, [shipments, defaultReminderTiming]);

  // Combine shipment events + custom events
  const allEvents = useMemo<CalendarEvent[]>(() => {
    // Generate static placeholder non-shipment events if customEvents is empty to show a high-fidelity dashboard on first load
    const fallbackCustom: CalendarEvent[] = [
      {
        id: 'cust-1',
        title: 'Meeting with Vikram Singh',
        type: 'meeting',
        dateTime: '2026-07-06T14:30',
        duration: '1 hour',
        linkedType: 'Client',
        linkedId: 'Vikram Singh',
        linkedLabel: 'Vikram Singh (Titan Industrial Supply)',
        notes: 'Discuss Q3 freight budget allocations and trailer lease schedules.',
        reminders: ['1day']
      },
      {
        id: 'cust-2',
        title: 'Follow-up Call: Priya Patel',
        type: 'reminder',
        dateTime: '2026-07-07T11:00',
        duration: '30 mins',
        linkedType: 'Client',
        linkedId: 'Priya Patel',
        linkedLabel: 'Priya Patel (Apex Foods International)',
        notes: 'Confirm dispatch availability of 14ft Eicher for Ahmedabad route on July 7.',
        reminders: ['on-day']
      },
      {
        id: 'cust-3',
        title: 'Balance Invoice payout: #1021',
        type: 'payment',
        dateTime: '2026-07-09T17:00',
        duration: 'All Day',
        linkedType: 'None',
        notes: 'Final deadline for payment collection from ABC Traders.',
        reminders: ['2days']
      },
      {
        id: 'cust-4',
        title: 'Warehouse Safety Audit',
        type: 'custom',
        dateTime: '2026-07-10T10:00',
        duration: '2 hours',
        linkedType: 'None',
        notes: 'Annual HSE checklist review for Gurgaon main terminal.',
        reminders: ['1week']
      }
    ];

    const currentList = customEvents.length > 0 ? customEvents : fallbackCustom;
    // ensure unique keys
    const finalEvents = [...shipmentEvents];
    currentList.forEach(ce => {
      if (!finalEvents.some(fe => fe.id === ce.id)) {
        finalEvents.push(ce);
      }
    });
    return finalEvents;
  }, [shipmentEvents, customEvents]);

  // Sync customEvents to localStorage
  useEffect(() => {
    localStorage.setItem('vanguard_events', JSON.stringify(customEvents));
  }, [customEvents]);

  // Helper date checker
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // --- MODAL & FORM STATE ---
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Form inputs
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<CalendarEvent['type']>('meeting');
  const [formDate, setFormDate] = useState('2026-07-06');
  const [formTime, setFormTime] = useState('10:00');
  const [formDuration, setFormDuration] = useState('1 hour');
  const [formAllDay, setFormAllDay] = useState(false);
  const [formLinkedType, setFormLinkedType] = useState<CalendarEvent['linkedType']>('None');
  const [formLinkedQuery, setFormLinkedQuery] = useState('');
  const [formLinkedId, setFormLinkedId] = useState('');
  const [formLinkedLabel, setFormLinkedLabel] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formReminders, setFormReminders] = useState<string[]>(['1day']);

  const [isLinkDropdownOpen, setIsLinkDropdownOpen] = useState(false);

  // Detail Popover
  const [selectedEventDetail, setSelectedEventDetail] = useState<CalendarEvent | null>(null);

  // Day Popover state for days with > 3 events
  const [activeDayPopover, setActiveDayPopover] = useState<{ date: Date; events: CalendarEvent[] } | null>(null);

  // Search clients for link dropdown
  const parsedClients = useMemo(() => {
    const savedCompanies = localStorage.getItem('vanguard_companies');
    let list: any[] = [];
    if (savedCompanies) {
      try {
        const companies = JSON.parse(savedCompanies);
        companies.forEach((company: any) => {
          if (company.clients) {
            company.clients.forEach((c: any) => {
              list.push({
                id: c.name,
                name: c.name,
                companyName: company.name,
                label: `${c.name} (${company.name})`
              });
            });
          }
        });
      } catch (e) {}
    }
    return list.length > 0 ? list : FALLBACK_CLIENTS.map(c => ({
      id: c.name,
      name: c.name,
      companyName: c.companyName,
      label: `${c.name} (${c.companyName})`
    }));
  }, []);

  // Filter linked items
  const filteredLinkedItems = useMemo(() => {
    if (formLinkedType === 'Client') {
      return parsedClients.filter(c => 
        c.name.toLowerCase().includes(formLinkedQuery.toLowerCase()) ||
        c.companyName.toLowerCase().includes(formLinkedQuery.toLowerCase())
      );
    } else if (formLinkedType === 'Shipment') {
      return shipments.map(s => ({
        id: s.id,
        name: s.clientName,
        label: `${s.id} (${s.routeFrom} → ${s.routeTo})`
      })).filter(s => s.label.toLowerCase().includes(formLinkedQuery.toLowerCase()));
    }
    return [];
  }, [formLinkedType, formLinkedQuery, parsedClients, shipments]);

  // Navigate to today
  const handleGoToToday = () => {
    setCurrentDate(new Date('2026-07-06T12:00:00'));
  };

  // Nav chevrons
  const handleNavigateCalendar = (direction: 'prev' | 'next') => {
    setSlideDirection(direction === 'prev' ? 'right' : 'left');
    
    const newDate = new Date(currentDate);
    if (selectedView === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'prev' ? -1 : 1));
    } else if (selectedView === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -7 : 7));
    } else if (selectedView === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -1 : 1));
    }
    
    setCurrentDate(newDate);

    // Reset slide direction transition
    setTimeout(() => {
      setSlideDirection('none');
    }, 300);
  };

  // Switch views
  const handleViewChange = (view: 'month' | 'week' | 'day') => {
    setSelectedView(view);
  };

  // Month navigation labels
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Week boundary label
  const weekLabel = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay(); // 0 = Sunday
    startOfWeek.setDate(startOfWeek.getDate() - day);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${startOfWeek.toLocaleDateString('default', options)} – ${endOfWeek.toLocaleDateString('default', { ...options, year: 'numeric' })}`;
  }, [currentDate]);

  // Day label
  const dayLabel = currentDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // --- MONTH CELLS GENERATION ---
  const monthCells = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Days in current month
    const totalDays = new Date(year, month + 1, 0).getDate();
    // Weekday of the first day (0 = Sunday)
    const firstDayIndex = new Date(year, month, 1).getDay();

    // Previous month total days
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const cells: { date: Date; isCurrentMonth: boolean; isToday: boolean; isWeekend: boolean }[] = [];

    // Fill previous month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthTotalDays - i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      cells.push({
        date: d,
        isCurrentMonth: false,
        isToday: isSameDay(d, new Date('2026-07-06')),
        isWeekend
      });
    }

    // Fill current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      cells.push({
        date: d,
        isCurrentMonth: true,
        isToday: isSameDay(d, new Date('2026-07-06')),
        isWeekend
      });
    }

    // Fill next month days
    const remaining = 42 - cells.length; // standard grid layout
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      cells.push({
        date: d,
        isCurrentMonth: false,
        isToday: isSameDay(d, new Date('2026-07-06')),
        isWeekend
      });
    }

    return cells;
  }, [currentDate]);

  // --- WEEK DAYS ---
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay(); // 0 = Sun
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Hours range for Week/Day view (8 AM to 6 PM)
  const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  // --- MUTATIONS ---
  const handleOpenAddModal = (date?: Date) => {
    setEditingEvent(null);
    setFormTitle('');
    setFormType('meeting');
    
    if (date) {
      // format date YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setFormDate(`${year}-${month}-${day}`);
    } else {
      setFormDate('2026-07-06');
    }

    setFormTime('10:00');
    setFormDuration('1 hour');
    setFormAllDay(false);
    setFormLinkedType('None');
    setFormLinkedQuery('');
    setFormLinkedId('');
    setFormLinkedLabel('');
    setFormNotes('');
    setFormReminders([defaultReminderTiming]);
    setIsEventModalOpen(true);
  };

  const handleOpenEditModal = (event: CalendarEvent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Check if it's a shipment-owned event
    if (event.id.startsWith('shipment-event-')) {
      alert('This load event is auto-synchronized from Active Shipments. To modify scheduling, please use the Shipments page.');
      // Optionally redirect to shipments
      setActivePage('shipments');
      return;
    }

    setEditingEvent(event);
    setFormTitle(event.title);
    setFormType(event.type);
    
    // Split Date / Time
    const parts = event.dateTime.split('T');
    setFormDate(parts[0]);
    setFormTime(parts[1] || '12:00');
    setFormDuration(event.duration);
    setFormAllDay(event.duration === 'All Day');
    setFormLinkedType(event.linkedType || 'None');
    setFormLinkedId(event.linkedId || '');
    setFormLinkedLabel(event.linkedLabel || '');
    setFormLinkedQuery(event.linkedLabel || '');
    setFormNotes(event.notes || '');
    setFormReminders(event.reminders || [defaultReminderTiming]);
    setSelectedEventDetail(null); // Close popover
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please enter an event title.');
      return;
    }

    const eventDateTime = `${formDate}T${formAllDay ? '00:00' : formTime}`;

    const newEvent: CalendarEvent = {
      id: editingEvent ? editingEvent.id : `cust-evt-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formTitle,
      type: formType,
      dateTime: eventDateTime,
      duration: formAllDay ? 'All Day' : formDuration,
      linkedType: formLinkedType,
      linkedId: formLinkedId,
      linkedLabel: formLinkedLabel,
      notes: formNotes,
      reminders: formReminders
    };

    if (editingEvent) {
      setCustomEvents(prev => prev.map(ev => ev.id === editingEvent.id ? newEvent : ev));
      triggerToast(`Event "${formTitle}" updated successfully.`);
    } else {
      setCustomEvents(prev => [newEvent, ...prev]);
      triggerToast(`Event "${formTitle}" saved & active.`);

      // Dynamic warning dispatch via Notification Center integration (Step 8 bell sync)
      // When saving, immediately add an active warning notification
      const savedNotifs = localStorage.getItem('vanguard_notifications');
      let notifsList = [];
      if (savedNotifs) {
        try { notifsList = JSON.parse(savedNotifs); } catch (e) {}
      }
      
      const newNotif = {
        id: `notif-cal-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'reminder',
        title: `Calendar Reminder: ${formTitle}`,
        desc: `Event scheduled for ${new Date(eventDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${formAllDay ? 'All Day' : formTime}`,
        time: 'Just now',
        timestamp: new Date().toISOString(),
        read: false
      };

      notifsList.unshift(newNotif);
      localStorage.setItem('vanguard_notifications', JSON.stringify(notifsList));
      window.dispatchEvent(new Event('vanguard-notifications-updated'));
    }

    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (id.startsWith('shipment-event-')) {
      alert('This auto-synchronized shipment pickup cannot be deleted here. Go to the Shipments page.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this event?')) {
      setCustomEvents(prev => prev.filter(ev => ev.id !== id));
      setSelectedEventDetail(null);
      triggerToast('Event deleted from schedule.');
    }
  };

  // Add multiple reminders logic
  const handleAddAnotherReminder = () => {
    setFormReminders(prev => [...prev, 'on-day']);
  };

  const handleRemoveReminder = (index: number) => {
    if (formReminders.length > 1) {
      setFormReminders(prev => prev.filter((_, idx) => idx !== index));
    }
  };

  const handleUpdateReminderValue = (index: number, val: string) => {
    setFormReminders(prev => prev.map((item, idx) => idx === index ? val : item));
  };

  // --- SELECTING SEARCH LINK OPTIONS ---
  const handleSelectLinkItem = (item: any) => {
    setFormLinkedId(item.id);
    setFormLinkedLabel(item.label || item.name);
    setFormLinkedQuery(item.label || item.name);
    setIsLinkDropdownOpen(false);
  };

  // --- GET UPCOMING EVENTS FOR SIDEBAR (7 DAYS) ---
  const upcomingEventsList = useMemo(() => {
    const today = new Date('2026-07-06T00:00:00');
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return allEvents
      .filter(ev => {
        const evDate = new Date(ev.dateTime);
        return evDate >= today && evDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [allEvents]);

  // --- TOASTS ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Event Type Class Helper
  const getEventClass = (type: CalendarEvent['type']) => {
    const found = EVENT_TYPES.find(t => t.value === type);
    return found || EVENT_TYPES[4];
  };

  return (
    <div id="calendar-container" className="space-y-6 animate-fade-in relative">
      
      {/* HEADER SECTION: Title & Legend */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Calendar</h4>
          <p className="text-xs text-white/50">Load schedules, pickups, and meetings</p>
        </div>

        {/* Dynamic Legend */}
        <div className="flex flex-wrap gap-2 items-center bg-white/3 border border-white/5 p-2 rounded-xl text-[10px]">
          <span className="text-white/40 mr-1.5 uppercase font-mono tracking-wider font-semibold">Legend:</span>
          {EVENT_TYPES.map(t => (
            <div key={t.value} className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-900/40 border border-white/5">
              <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
              <span className="text-white/70 font-sans">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* VIEW SELECTOR & DATE NAVIGATOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/2 border border-white/5 p-4 rounded-2xl">
        {/* Navigation chevrons & Label */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleNavigateCalendar('prev')}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 flex items-center justify-center transition-all"
              title="Previous"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handleNavigateCalendar('next')}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 flex items-center justify-center transition-all"
              title="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <h5 className="text-sm font-bold text-white tracking-wide font-display min-w-[120px]">
            {selectedView === 'month' && monthName}
            {selectedView === 'week' && weekLabel}
            {selectedView === 'day' && dayLabel}
          </h5>
        </div>

        {/* Right side controls: view toggle, today, and add event */}
        <div className="flex flex-wrap items-center gap-3.5">
          {/* Segmented view switcher */}
          <div className="bg-stone-950/40 p-1 rounded-xl border border-white/5 flex gap-1">
            {(['month', 'week', 'day'] as const).map(v => (
              <button
                key={v}
                onClick={() => handleViewChange(v)}
                className={`px-3 py-1 text-[10px] uppercase font-mono tracking-wide rounded-lg transition-all ${
                  selectedView === v
                    ? 'bg-[#D946C4] text-stone-950 font-bold'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Today Button */}
          <button
            onClick={handleGoToToday}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/90 uppercase hover:text-white transition-all duration-200"
          >
            Today
          </button>

          {/* + Add Event Primary */}
          <button
            onClick={() => handleOpenAddModal(currentDate)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#D946C4] hover:bg-[#c33eb0] text-stone-950 text-xs font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#D946C4]/10 active:scale-95"
          >
            <Plus size={14} />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* CORE GRID: Bento Columns Layout (Calendar is 75%, Upcoming Sidebar is 25%) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* LEFT COMPONENT: The Calendar (Grid, Week view, or Day view) */}
        <div className="lg:col-span-3 flex flex-col min-h-[500px]">
          
          <AnimatePresence mode="wait">
            {selectedView === 'month' && (
              /* --- MONTH VIEW --- */
              <motion.div
                key="month-view"
                initial={{ opacity: 0, x: slideDirection === 'left' ? 30 : slideDirection === 'right' ? -30 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideDirection === 'left' ? -30 : slideDirection === 'right' ? 30 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                {/* 7 Column weekday header */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-[10px] font-mono tracking-wider text-white/40 uppercase">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 flex-1 bg-white/2 border border-white/5 p-1.5 rounded-2xl">
                  {monthCells.map((cell, idx) => {
                    // Filter events for this cell's day
                    const cellEvents = allEvents.filter(ev => {
                      const evDate = new Date(ev.dateTime);
                      return isSameDay(evDate, cell.date);
                    });

                    // Up to 3 event chips displayed, rest shown under '+X more'
                    const displayedEvents = cellEvents.slice(0, 2);
                    const overflowCount = cellEvents.length - displayedEvents.length;

                    return (
                      <div
                        key={idx}
                        onClick={() => cellEvents.length > 0 ? setActiveDayPopover({ date: cell.date, events: cellEvents }) : handleOpenAddModal(cell.date)}
                        className={`min-h-[90px] p-2 rounded-xl flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                          cell.isToday
                            ? 'bg-[#D946C4]/10 border border-[#D946C4]/40 shadow-inner'
                            : 'bg-stone-900/40 hover:bg-stone-900/60 border border-white/5 hover:border-white/10'
                        } ${cell.isCurrentMonth ? '' : 'opacity-25'} ${cell.isWeekend ? 'bg-black/10' : ''}`}
                      >
                        {/* Day indicator */}
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={`text-[10px] font-mono font-bold ${cell.isToday ? 'text-[#D946C4] font-extrabold' : 'text-white/60'}`}>
                            {cell.date.getDate()}
                          </span>
                          {cell.isToday && (
                            <span className="text-[8px] font-bold font-mono text-[#D946C4] uppercase tracking-widest bg-[#D946C4]/20 px-1 rounded">
                              Today
                            </span>
                          )}
                        </div>

                        {/* Events list stack */}
                        <div className="flex-1 flex flex-col gap-1 justify-end">
                          {displayedEvents.map(evt => {
                            const cls = getEventClass(evt.type);
                            return (
                              <div
                                key={evt.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEventDetail(evt);
                                }}
                                className={`text-[9px] truncate px-1.5 py-0.5 rounded-md border font-medium ${cls.bg}`}
                                title={evt.title}
                              >
                                {evt.title}
                              </div>
                            );
                          })}

                          {overflowCount > 0 && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDayPopover({ date: cell.date, events: cellEvents });
                              }}
                              className="text-[8px] font-mono font-bold text-[#D946C4] text-right pr-1 hover:underline"
                            >
                              +{overflowCount} more...
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {selectedView === 'week' && (
              /* --- WEEK VIEW (TIMELINE) --- */
              <motion.div
                key="week-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col bg-white/2 border border-white/5 p-4 rounded-2xl overflow-x-auto"
              >
                <div className="min-w-[640px] flex flex-col flex-1">
                  {/* Header row with columns */}
                  <div className="grid grid-cols-8 gap-2 border-b border-white/5 pb-2.5">
                  <div className="text-[9px] font-mono uppercase text-white/30 self-end">Time</div>
                  {weekDays.map((wDate, idx) => {
                    const isToday = isSameDay(wDate, new Date('2026-07-06'));
                    return (
                      <div key={idx} className="text-center">
                        <span className="text-[10px] font-mono uppercase block text-white/40">
                          {wDate.toLocaleDateString('default', { weekday: 'short' })}
                        </span>
                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${isToday ? 'bg-[#D946C4] text-stone-950 font-black' : 'text-white/85'}`}>
                          {wDate.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Hourly slots rows */}
                <div className="divide-y divide-white/5 mt-1">
                  {HOURS.map(hour => {
                    const ampm = hour >= 12 ? (hour === 12 ? '12 PM' : `${hour - 12} PM`) : `${hour} AM`;
                    
                    return (
                      <div key={hour} className="grid grid-cols-8 gap-2 py-3 items-stretch min-h-[56px]">
                        {/* Time labels */}
                        <div className="text-[10px] font-mono text-white/30">{ampm}</div>

                        {/* 7 Columns for weekdays */}
                        {weekDays.map((wDate, dayIdx) => {
                          const slotEvents = allEvents.filter(ev => {
                            const evDate = new Date(ev.dateTime);
                            return isSameDay(evDate, wDate) && evDate.getHours() === hour;
                          });

                          return (
                            <div 
                              key={dayIdx} 
                              onClick={() => handleOpenAddModal(new Date(wDate.setHours(hour, 0)))}
                              className="bg-transparent hover:bg-white/2 rounded-md transition-all cursor-pointer relative min-h-[30px]"
                            >
                              {slotEvents.map(evt => {
                                const cls = getEventClass(evt.type);
                                return (
                                  <div
                                    key={evt.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEventDetail(evt);
                                    }}
                                    className={`absolute inset-x-0.5 top-0 bottom-0 p-1 rounded-md border-l-2 text-[9px] leading-tight truncate ${cls.bg} ${cls.border}`}
                                    title={`${evt.title} (${evt.duration})`}
                                  >
                                    <div className="font-bold truncate">{evt.title}</div>
                                    <div className="text-[8px] opacity-60 truncate">{evt.duration}</div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
                </div>
              </motion.div>
            )}

            {selectedView === 'day' && (
              /* --- DAY VIEW (TIMELINE) --- */
              <motion.div
                key="day-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col bg-white/2 border border-white/5 p-4 rounded-2xl"
              >
                {/* Day Header */}
                <div className="border-b border-white/5 pb-3 mb-4">
                  <h4 className="text-xs font-bold text-[#D946C4] font-mono tracking-wider uppercase">Active Dispatch Schedule</h4>
                  <span className="text-white/80 font-semibold text-xs mt-0.5 block">{currentDate.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>

                {/* Timeline display */}
                <div className="space-y-1 divide-y divide-white/5">
                  {HOURS.map(hour => {
                    const ampm = hour >= 12 ? (hour === 12 ? '12 PM' : `${hour - 12} PM`) : `${hour} AM`;
                    
                    const hourEvents = allEvents.filter(ev => {
                      const evDate = new Date(ev.dateTime);
                      return isSameDay(evDate, currentDate) && evDate.getHours() === hour;
                    });

                    return (
                      <div key={hour} className="grid grid-cols-12 gap-4 py-4 items-center min-h-[64px]">
                        {/* Time slot column */}
                        <div className="col-span-2 text-xs font-mono text-white/45 font-bold">{ampm}</div>
                        
                        {/* Interactive cell slot */}
                        <div 
                          className="col-span-10 min-h-[44px] bg-white/1 rounded-xl hover:bg-white/3 border border-transparent hover:border-white/5 p-1 transition-all cursor-pointer flex gap-2 overflow-x-auto"
                          onClick={() => {
                            const newD = new Date(currentDate);
                            newD.setHours(hour, 0);
                            handleOpenAddModal(newD);
                          }}
                        >
                          {hourEvents.length > 0 ? (
                            hourEvents.map(evt => {
                              const cls = getEventClass(evt.type);
                              return (
                                <div
                                  key={evt.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEventDetail(evt);
                                  }}
                                  className={`flex-1 min-w-[150px] p-2.5 rounded-lg border-l-3 text-left transition-all ${cls.bg} ${cls.border}`}
                                >
                                  <div className="text-xs font-bold truncate text-white">{evt.title}</div>
                                  <div className="flex items-center gap-1.5 text-[9px] opacity-75 mt-1 font-mono">
                                    <Clock size={10} />
                                    <span>{evt.duration}</span>
                                    {evt.linkedLabel && (
                                      <>
                                        <span>•</span>
                                        <span>{evt.linkedLabel}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-[10px] text-white/10 self-center pl-3">No bookings or meetings scheduled</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COMPONENT: UPCOMING EVENTS SIDEBAR PANEL (25% width) */}
        <div className="lg:col-span-1 bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Sidebar Title */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h4 className="text-xs font-bold text-white uppercase font-display tracking-wider">Upcoming (7 Days)</h4>
              <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10 text-white/40">
                {upcomingEventsList.length}
              </span>
            </div>

            {/* Upcoming List Scroll container */}
            <div className="space-y-3.5 max-h-[460px] overflow-y-auto scrollbar-none">
              {upcomingEventsList.length > 0 ? (
                upcomingEventsList.map(item => {
                  const cls = getEventClass(item.type);
                  const isToday = isSameDay(new Date(item.dateTime), new Date('2026-07-06'));
                  const displayDate = new Date(item.dateTime);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedEventDetail(item)}
                      className="p-3 bg-stone-900/60 hover:bg-stone-900/90 border border-white/5 hover:border-white/10 rounded-xl space-y-1.5 cursor-pointer transition-all duration-200"
                    >
                      {/* Event date row */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`font-mono font-bold ${isToday ? 'text-[#D946C4]' : 'text-white/50'}`}>
                          {isToday ? 'Today' : displayDate.toLocaleDateString('default', { month: 'short', day: 'numeric', weekday: 'short' })}
                        </span>
                        
                        {/* Time */}
                        <span className="text-white/40 font-mono">
                          {item.duration === 'All Day' ? 'All Day' : displayDate.toLocaleTimeString('default', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                      </div>

                      {/* Title */}
                      <h5 className="text-xs font-bold text-white/95 line-clamp-1">{item.title}</h5>

                      {/* Badge / Label */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${cls.dot}`} />
                        <span className="text-[9px] text-white/40 font-mono">{cls.label}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-white/20 space-y-2">
                  <AlertCircle size={20} className="mx-auto text-white/10" />
                  <p className="text-[10px]">No upcoming events or pickups for the next 7 days.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats banner */}
          <div className="mt-6 bg-[#D946C4]/5 border border-[#D946C4]/10 rounded-xl p-3 text-[10px] text-white/50 space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#D946C4] block uppercase">Operational Insight</span>
            <p>Active Shipments with valid pickup dates automatically populate as Signal Violet events.</p>
          </div>
        </div>

      </div>

      {/* --- ADD / EDIT EVENT FROSTED MODAL --- */}
      <AnimatePresence>
        {isEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEventModalOpen(false)}
              className="fixed inset-0 bg-stone-950/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-stone-950/95 border border-white/10 rounded-2xl p-6 shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/70 hover:text-white"
              >
                <X size={15} />
              </button>

              <h4 className="text-sm font-bold text-white mb-5 font-display flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D946C4]" />
                <span>{editingEvent ? 'Edit Calendar Event' : 'Schedule New Event'}</span>
              </h4>

              <form onSubmit={handleSaveEvent} className="space-y-4.5">
                {/* Event Title */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1.5">Event Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delivery Status follow-up or Client meeting"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-stone-900 border border-white/15 focus:border-[#D946C4]/40 focus:ring-1 focus:ring-[#D946C4]/20 rounded-xl h-10 px-3.5 text-xs text-white placeholder-white/30"
                  />
                </div>

                {/* Event Type Grid */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2">Category &amp; Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EVENT_TYPES.filter(t => t.value !== 'pickup').map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setFormType(t.value as CalendarEvent['type'])}
                        className={`p-2.5 rounded-xl border text-[10px] font-medium transition-all text-left flex items-center gap-2 ${
                          formType === t.value
                            ? 'bg-[#D946C4] text-stone-950 border-[#D946C4] font-bold'
                            : 'bg-white/3 text-white/70 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${formType === t.value ? 'bg-stone-950' : t.dot}`} />
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                  {formType === 'pickup' && (
                    <p className="text-[10px] text-[#D946C4] mt-1.5 italic">Note: Pickup events are locked &amp; auto-synchronized from shipments.</p>
                  )}
                </div>

                {/* Date / Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1.5">Date</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-stone-900 border border-white/15 focus:border-[#D946C4]/40 rounded-xl h-10 px-3.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Time &amp; Duration</label>
                      <label className="flex items-center gap-1.5 text-[10px] text-white/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formAllDay}
                          onChange={(e) => setFormAllDay(e.target.checked)}
                          className="rounded bg-stone-900 border-white/15 text-[#D946C4] focus:ring-0"
                        />
                        <span>All Day</span>
                      </label>
                    </div>

                    {!formAllDay ? (
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={formTime}
                          onChange={(e) => setFormTime(e.target.value)}
                          className="flex-1 bg-stone-900 border border-white/15 focus:border-[#D946C4]/40 rounded-xl h-10 px-2 text-xs text-white"
                        />
                        <select
                          value={formDuration}
                          onChange={(e) => setFormDuration(e.target.value)}
                          className="flex-1 bg-stone-900 border border-white/15 focus:border-[#D946C4]/40 rounded-xl h-10 px-2 text-xs text-white"
                        >
                          <option value="30 mins">30 mins</option>
                          <option value="1 hour">1 hour</option>
                          <option value="2 hours">2 hours</option>
                          <option value="3 hours">3 hours</option>
                          <option value="Half Day">Half Day</option>
                        </select>
                      </div>
                    ) : (
                      <div className="bg-white/2 border border-white/5 rounded-xl h-10 px-3.5 flex items-center text-xs text-white/40">
                        All-day event schedule
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional "Link to" dropdown search (Client / Shipment) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1.5">Link Association</label>
                    <select
                      value={formLinkedType}
                      onChange={(e) => {
                        setFormLinkedType(e.target.value as CalendarEvent['linkedType']);
                        setFormLinkedId('');
                        setFormLinkedLabel('');
                        setFormLinkedQuery('');
                      }}
                      className="w-full bg-stone-900 border border-white/15 focus:border-[#D946C4]/40 rounded-xl h-10 px-3 text-xs text-white cursor-pointer"
                    >
                      <option value="None">None</option>
                      <option value="Client">Client Profile</option>
                      <option value="Shipment">Active Shipment</option>
                    </select>
                  </div>

                  {formLinkedType !== 'None' && (
                    <div className="relative">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1.5">Search {formLinkedType}</label>
                      <input
                        type="text"
                        placeholder={`Search ${formLinkedType.toLowerCase()}...`}
                        value={formLinkedQuery}
                        onChange={(e) => {
                          setFormLinkedQuery(e.target.value);
                          setIsLinkDropdownOpen(true);
                        }}
                        onFocus={() => setIsLinkDropdownOpen(true)}
                        className="w-full bg-stone-900 border border-white/15 focus:border-[#D946C4]/40 rounded-xl h-10 px-3.5 text-xs text-white"
                      />

                      {/* Dropdown search overlay */}
                      {isLinkDropdownOpen && filteredLinkedItems.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 max-h-40 overflow-y-auto bg-stone-950 border border-white/10 rounded-xl z-50 p-1 shadow-2xl divide-y divide-white/5">
                          {filteredLinkedItems.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSelectLinkItem(item)}
                              className="p-2.5 hover:bg-white/5 text-xs text-white cursor-pointer transition-all rounded-lg"
                            >
                              {item.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Reminders section with option for MULTIPLE reminders */}
                <div className="bg-white/2 border border-white/5 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-[#D946C4] font-bold">Dispatch Reminders</span>
                    <button
                      type="button"
                      onClick={handleAddAnotherReminder}
                      className="text-[10px] text-[#D946C4] hover:text-[#c33eb0] font-bold hover:underline"
                    >
                      + Add another reminder
                    </button>
                  </div>

                  {formReminders.map((rem, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <select
                        value={rem}
                        onChange={(e) => handleUpdateReminderValue(idx, e.target.value)}
                        className="flex-1 bg-stone-900 border border-white/10 rounded-xl h-10 px-3 text-xs text-white cursor-pointer focus:border-[#D946C4]/40"
                      >
                        <option value="on-day">On the day of</option>
                        <option value="1day">1 day before</option>
                        <option value="2days">2 days before</option>
                        <option value="1week">1 week before</option>
                      </select>

                      {formReminders.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveReminder(idx)}
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-all flex items-center justify-center"
                          title="Remove reminder"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Notes textarea */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1.5">Consignment Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Enter secondary details, driver assignments, contact phone, loading dock warnings..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full bg-stone-900 border border-white/15 focus:border-[#D946C4]/40 rounded-xl p-3 text-xs text-white placeholder-white/30"
                  />
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                  {editingEvent ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(editingEvent.id)}
                      className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-semibold hover:underline"
                    >
                      <Trash2 size={14} />
                      <span>Delete Event</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEventModalOpen(false)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/85 hover:text-white text-xs font-semibold rounded-xl border border-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#D946C4] hover:bg-[#c33eb0] text-stone-950 text-xs font-semibold rounded-xl transition-all shadow-md"
                    >
                      {editingEvent ? 'Save Changes' : 'Create Event'}
                    </button>
                  </div>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EVENT DETAIL OVERLAY (POPOVER DRAWER CARD) --- */}
      <AnimatePresence>
        {selectedEventDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEventDetail(null)}
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm"
            />

            {/* Event detail card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-stone-950/95 border border-white/10 p-5 rounded-2xl shadow-2xl z-50 space-y-4"
            >
              {/* Card top bar */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider border ${getEventClass(selectedEventDetail.type).bg}`}>
                  {selectedEventDetail.type}
                </span>
                <div className="flex items-center gap-2">
                  {!selectedEventDetail.id.startsWith('shipment-event-') && (
                    <button
                      onClick={(e) => handleOpenEditModal(selectedEventDetail, e)}
                      className="p-1.5 bg-white/5 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                      title="Edit Event"
                    >
                      <Edit3 size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedEventDetail(null)}
                    className="p-1.5 bg-white/5 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Event Content */}
              <div className="space-y-2">
                <h4 className="text-sm font-extrabold text-white leading-tight font-display">{selectedEventDetail.title}</h4>
                
                {/* Date / Time rows */}
                <div className="flex items-center gap-2 text-xs text-white/60 font-mono pt-1">
                  <Calendar size={12} className="text-[#D946C4]" />
                  <span>{new Date(selectedEventDetail.dateTime).toLocaleDateString('default', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                {selectedEventDetail.duration !== 'All Day' && (
                  <div className="flex items-center gap-2 text-xs text-white/60 font-mono">
                    <Clock size={12} className="text-blue-400" />
                    <span>{new Date(selectedEventDetail.dateTime).toLocaleTimeString('default', { hour: 'numeric', minute: '2-digit', hour12: true })} ({selectedEventDetail.duration})</span>
                  </div>
                )}
              </div>

              {/* Association Tags */}
              {selectedEventDetail.linkedType && selectedEventDetail.linkedType !== 'None' && (
                <div className="bg-white/2 border border-white/5 p-3 rounded-xl space-y-1">
                  <span className="block text-[8px] text-white/30 uppercase tracking-widest font-mono">Linked Record</span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedEventDetail.linkedType === 'Client' ? (
                        <User size={13} className="text-[#D946C4]" />
                      ) : (
                        <MapPin size={13} className="text-emerald-400" />
                      )}
                      <span className="text-xs font-semibold text-white/95">{selectedEventDetail.linkedLabel}</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedEventDetail(null);
                        if (selectedEventDetail.linkedType === 'Client') {
                          setActivePage('clients');
                        } else if (selectedEventDetail.linkedType === 'Shipment') {
                          setActivePage('shipments');
                        }
                      }}
                      className="p-1 hover:bg-white/10 rounded text-[#D946C4] hover:text-[#c33eb0] transition-colors"
                      title="Inspect record files"
                    >
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedEventDetail.notes && (
                <div className="bg-stone-900/40 p-3.5 rounded-xl border border-white/5 text-xs text-white/70 italic leading-normal">
                  &ldquo;{selectedEventDetail.notes}&rdquo;
                </div>
              )}

              {/* Reminders list display */}
              <div className="space-y-1 bg-white/2 p-2.5 rounded-xl border border-white/5">
                <span className="text-[8px] text-white/35 font-mono uppercase tracking-widest block">Active Reminders</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedEventDetail.reminders && selectedEventDetail.reminders.map((r, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 text-[9px] bg-[#D946C4]/10 text-[#D946C4] px-2 py-0.5 rounded font-mono border border-[#D946C4]/20">
                      <Bell size={8} /> {r === 'on-day' ? 'on-day' : r === '1day' ? '1 day before' : r === '2days' ? '2 days before' : r === '1week' ? '1 week before' : r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom control delete button */}
              {!selectedEventDetail.id.startsWith('shipment-event-') && (
                <div className="flex justify-end pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleDeleteEvent(selectedEventDetail.id)}
                    className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-300 hover:underline"
                  >
                    <Trash2 size={12} /> Delete Event
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DAY POPOVER (For cells with > 2 events) --- */}
      <AnimatePresence>
        {activeDayPopover && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDayPopover(null)}
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-stone-950/95 border border-white/10 rounded-2xl p-5 shadow-2xl z-50 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h4 className="text-xs font-mono text-[#D946C4] uppercase tracking-wider font-bold">Daily Events Board</h4>
                  <span className="text-sm font-bold text-white block mt-0.5">
                    {activeDayPopover.date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <button
                  onClick={() => setActiveDayPopover(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 text-white/70"
                >
                  <X size={14} />
                </button>
              </div>

              {/* List stack */}
              <div className="space-y-2.5">
                {activeDayPopover.events.map(evt => {
                  const cls = getEventClass(evt.type);
                  const isShipment = evt.id.startsWith('shipment-event-');
                  const evDate = new Date(evt.dateTime);

                  return (
                    <div
                      key={evt.id}
                      onClick={() => {
                        setSelectedEventDetail(evt);
                        setActiveDayPopover(null);
                      }}
                      className="p-3 bg-stone-900/60 hover:bg-stone-900/95 border border-white/5 hover:border-white/15 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all duration-200"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${cls.dot}`} />
                          <span className="text-[9px] text-white/40 font-mono uppercase">{cls.label}</span>
                        </div>
                        <h5 className="text-xs font-bold text-white leading-snug line-clamp-1">{evt.title}</h5>
                        {evt.duration !== 'All Day' && (
                          <span className="text-[10px] text-white/40 block mt-0.5 font-mono">
                            Time: {evDate.toLocaleTimeString('default', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </span>
                        )}
                      </div>

                      <ChevronRight size={14} className="text-white/20" />
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center border-t border-white/5 pt-3.5 mt-2">
                <button
                  onClick={() => {
                    handleOpenAddModal(activeDayPopover.date);
                    setActiveDayPopover(null);
                  }}
                  className="text-xs font-semibold text-[#D946C4] hover:text-[#c33eb0] flex items-center gap-1 hover:underline"
                >
                  <Plus size={14} /> Add Event
                </button>
                <button
                  onClick={() => setActiveDayPopover(null)}
                  className="px-3.5 py-1.5 bg-white/5 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/10"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- FLOATING TOAST POP --- */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed bottom-6 right-6 px-4 py-3 bg-stone-950 border border-emerald-500/30 text-emerald-400 rounded-xl shadow-2xl flex items-center gap-2 z-50 text-xs font-mono font-medium"
          >
            <CheckCircle2 size={15} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
