import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  MessageSquare, 
  FileText, 
  Image, 
  Upload, 
  CheckSquare, 
  X, 
  ArrowRight, 
  CheckCircle, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  DollarSign, 
  Clock, 
  RefreshCw, 
  ArrowUpRight, 
  User, 
  Building, 
  MapPin, 
  Scale, 
  Calendar, 
  FileCheck,
  Languages,
  ChevronRight,
  Info,
  Check,
  Eye,
  AlertCircle,
  Search,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageId } from '../types';
import DottedWave from '../components/DottedWave';

interface AIAssistantProps {
  setActivePage?: (page: PageId) => void;
}

// Interfaces for Chat
interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  widgetType?: 'earnings' | 'pending_bookings' | 'top_client' | 'none';
}

// Interfaces for Extracted Data
interface ExtractedData {
  clientName: string;
  company: string;
  fromCity: string;
  toCity: string;
  truckSize: string;
  truckNo?: string;
  driverName?: string;
  driverPhone?: string;
  weight: string;
  pickupDate: string;
  notes: string;
  confidence: {
    clientName: 'high' | 'medium' | 'low';
    route: 'high' | 'medium' | 'low';
    truckSize: 'high' | 'medium' | 'low';
    weight: 'high' | 'medium' | 'low';
    pickupDate: 'high' | 'medium' | 'low';
  };
}

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

export default function AIAssistant({ setActivePage }: AIAssistantProps) {
  // Tabs: 'chat' | 'parser' | 'growth' | 'guide'
  const [activeTab, setActiveTab] = useState<'chat' | 'parser' | 'growth' | 'guide'>('chat');

  useEffect(() => {
    const handleNavigateTab = (e: Event) => {
      const customEvent = e as CustomEvent<'chat' | 'parser' | 'growth' | 'guide'>;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
      }
    };
    window.addEventListener('vanguard-navigate-tab', handleNavigateTab as EventListener);
    return () => window.removeEventListener('vanguard-navigate-tab', handleNavigateTab as EventListener);
  }, []);

  // Core global toast state
  const [toast, setToast] = useState<{ message: string; subText?: string } | null>(null);
  const triggerToast = (message: string, subText?: string) => {
    setToast({ message, subText });
    setTimeout(() => setToast(null), 4000);
  };

  // ==========================================
  // TAB 1: ASK ASSISTANT STATE & DATA
  // ==========================================
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: "Greetings Dispatcher! I am your Vanguard AI Assistant. I have real-time synchronization with your fleet manifests, client accounts, price matrices, and financial ledger.\n\nHow can I optimize your logistics operations today?",
      timestamp: '12:15 PM',
      widgetType: 'none'
    }
  ]);

  const promptChips = [
    { label: "How much did I earn this month?", query: "How much did I earn this month?" },
    { label: "Show pending bookings", query: "Show pending bookings" },
    { label: "Which client pays the most?", query: "Which client pays the most?" },
    { label: "Optimize Delhi route margins", query: "How do I optimize Delhi route margins?" }
  ];

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  // Handle Send Chat
  const handleSendChat = (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      widgetType: 'none'
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    // Simulated Response Logic based on input keywords
    setTimeout(() => {
      let replyText = "";
      let widget: 'earnings' | 'pending_bookings' | 'top_client' | 'none' = 'none';
      const cleanText = textToSend.toLowerCase();

      if (cleanText.includes('earn') || cleanText.includes('revenue') || cleanText.includes('profit') || cleanText.includes('finance')) {
        replyText = "Here is your dynamic financial performance summary for July 2026. Gross dispatch margins have expanded to 22.4% thanks to optimized return-lane matching on key commercial corridors.";
        widget = 'earnings';
      } else if (cleanText.includes('pending') || cleanText.includes('booking') || cleanText.includes('shipment')) {
        replyText = "I pulled the live freight pipeline status. We have 3 spot-market shipments awaiting active dispatcher approval. I recommend securing drivers for these before the afternoon loading cutoffs.";
        widget = 'pending_bookings';
      } else if (cleanText.includes('client') || cleanText.includes('pays') || cleanText.includes('customer') || cleanText.includes('most')) {
        replyText = "Analyzing high-value accounts. Your absolute highest revenue generator is Apex Foods International, contributing ₹5.80 Lakhs to your ledger this month. Here is their operational profile:";
        widget = 'top_client';
      } else if (cleanText.includes('delhi') || cleanText.includes('margin')) {
        replyText = "Your Delhi → Mumbai lane is running at a sub-optimal margin of 8.5% (Base Freight: ₹89,000), mainly due to a 32% increase in regional diesel tolls and lack of pre-negotiated backhaul cargo. I advise raising quotes by 12% or dispatching smaller 22ft container configurations.";
        widget = 'none';
      } else {
        replyText = "Understood. I've logged that inquiry. I'm actively checking our systems to give you a precise data response shortly. Let me know if you would like me to draft an invoice or verify driver compliance for those coordinates.";
        widget = 'none';
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        widgetType: widget
      };

      setIsTyping(false);
      setChatHistory(prev => [...prev, assistantMsg]);
    }, 1200);
  };

  // ==========================================
  // TAB 2: WHATSAPP PARSER STATE & DATA
  // ==========================================
  const [parserInputMode, setParserInputMode] = useState<'paste' | 'upload'>('paste');
  const [mobileParserView, setMobileParserView] = useState<'input' | 'result'>('input');
  const [pastedText, setPastedText] = useState('');
  
  // Screenshot Upload Simulated States
  const [uploadedFile, setUploadedFile] = useState<{ name: string; preview: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extraction Processing State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStep, setExtractionStep] = useState('');
  const [extractedResult, setExtractedResult] = useState<ExtractedData | null>(null);
  const [understoodAsText, setUnderstoodAsText] = useState('');

  // Post-Confirmation State
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [createBooking, setCreateBooking] = useState(true);
  const [createInvoice, setCreateInvoice] = useState(true);
  const [createLR, setCreateLR] = useState(true);

  // Load fleet trucks/drivers
  const fleetTrucks = useMemo(() => {
    const saved = localStorage.getItem('vanguard_fleet_trucks');
    return saved ? JSON.parse(saved) : INITIAL_TRUCKS_MOCK;
  }, [extractedResult]); // reload when result changes or quick-added

  const fleetDrivers = useMemo(() => {
    const saved = localStorage.getItem('vanguard_fleet_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS_MOCK;
  }, [extractedResult]); // reload when result changes or quick-added

  const recognizedFleetRecord = useMemo(() => {
    if (!extractedResult || !extractedResult.truckNo) return null;
    const plate = extractedResult.truckNo.replace(/\s+/g, '').replace(/-/g, '').toLowerCase();
    const truck = fleetTrucks.find((t: any) => t.truckNo.replace(/\s+/g, '').replace(/-/g, '').toLowerCase() === plate);
    if (truck) {
      const driver = fleetDrivers.find((d: any) => d.id === truck.assignedDriverId);
      return { truck, driver };
    }
    return null;
  }, [extractedResult?.truckNo, fleetTrucks, fleetDrivers]);

  const handleQuickAddToFleet = () => {
    if (!extractedResult || !extractedResult.truckNo) return;
    
    const savedTrucks = localStorage.getItem('vanguard_fleet_trucks');
    const savedDrivers = localStorage.getItem('vanguard_fleet_drivers');
    
    let currentTrucks = savedTrucks ? JSON.parse(savedTrucks) : INITIAL_TRUCKS_MOCK;
    let currentDrivers = savedDrivers ? JSON.parse(savedDrivers) : INITIAL_DRIVERS_MOCK;
    
    const driverId = `D-${Date.now()}`;
    const truckId = `T-${Date.now()}`;
    
    const newDriver = {
      id: driverId,
      name: extractedResult.driverName || 'Suresh Pal',
      phone: extractedResult.driverPhone || '+91 95400 12345',
      rating: 4.5,
      notes: 'Added via AI WhatsApp Parser onboarding.'
    };
    
    const newTruck = {
      id: truckId,
      truckNo: extractedResult.truckNo,
      truckType: extractedResult.truckSize || 'Eicher 19ft',
      assignedDriverId: driverId,
      notes: 'Added via AI WhatsApp Parser onboarding.'
    };
    
    currentTrucks.push(newTruck);
    currentDrivers.push(newDriver);
    
    localStorage.setItem('vanguard_fleet_trucks', JSON.stringify(currentTrucks));
    localStorage.setItem('vanguard_fleet_drivers', JSON.stringify(currentDrivers));
    
    // Dispatch events to notify other tabs
    window.dispatchEvent(new Event('vanguard_fleet_updated'));
    
    triggerToast("Fleet Onboarding Complete", `${extractedResult.truckNo} assigned to ${newDriver.name}`);
    
    // Re-trigger extraction result update to refresh recognizedFleetRecord memo
    setExtractedResult(prev => prev ? { ...prev } : null);
  };

  // Hardcoded High-fidelity Mock Scenarios for testing Hinglish, Hindi, English
  const whatsappPresets = [
    {
      label: "Hinglish Booking (Apex)",
      text: "sharma ji ko 20ft truck chahiye bhopal se indore kal, 8 ton load hai. urgent delivery hai",
      language: "Hinglish",
      understood: "Amit Sharma (Apex Foods International) requests a 22ft Container truck from Bhopal to Indore for July 7, 2026, carrying an 8-ton agricultural load. Marked as highly urgent dispatch.",
      data: {
        clientName: "Amit Sharma",
        company: "Apex Foods International",
        fromCity: "Bhopal",
        toCity: "Indore",
        truckSize: "22ft Container",
        weight: "8 Tons",
        pickupDate: "2026-07-07",
        notes: "Highly urgent delivery. Ensure driver phone is active for live dispatch updates.",
        confidence: {
          clientName: 'high',
          route: 'high',
          truckSize: 'medium',
          weight: 'high',
          pickupDate: 'high'
        }
      } as ExtractedData
    },
    {
      label: "English Cargo RFP (Titan)",
      text: "Need a 32ft multi-axle truck from Delhi to Mumbai tomorrow morning for 12 tons industrial gear cargo. Please quote best rate.",
      language: "English",
      understood: "Priya Patel (Titan Industrial Supply) requires a 32ft Multi-Axle carrier from Delhi to Mumbai on July 7, 2026, with a 12-ton load of industrial manufacturing gears. Requires best contract rate.",
      data: {
        clientName: "Priya Patel",
        company: "Titan Industrial Supply",
        fromCity: "Delhi",
        toCity: "Mumbai",
        truckSize: "32ft Multi-Axle",
        weight: "12 Tons",
        pickupDate: "2026-07-07",
        notes: "Best spot rate request. Pre-verify warehouse loading slot times before driver arrival.",
        confidence: {
          clientName: 'high',
          route: 'high',
          truckSize: 'high',
          weight: 'high',
          pickupDate: 'high'
        }
      } as ExtractedData
    },
    {
      label: "Hindi Logistics (Rajput Cold)",
      text: "भोपाल से इंदौर के लिए कल सुबह एक आयशर 19 फीट गाडी चाहिए। अमित शर्मा, अपैक्स फूड्स। ७ टन माल है।",
      language: "Hindi",
      understood: "Amit Sharma (Apex Foods International) requests an Eicher 19ft open-bed truck from Bhopal to Indore on July 7, 2026 (morning shift), with a 7-ton food cargo load.",
      data: {
        clientName: "Amit Sharma",
        company: "Apex Foods International",
        fromCity: "Bhopal",
        toCity: "Indore",
        truckSize: "Eicher 19ft",
        weight: "7 Tons",
        pickupDate: "2026-07-07",
        notes: "Morning shift arrival requested. Loading forklift available at Bhopal warehouse.",
        confidence: {
          clientName: 'high',
          route: 'high',
          truckSize: 'high',
          weight: 'high',
          pickupDate: 'medium'
        }
      } as ExtractedData
    },
    {
      label: "Fleet Match: MP04HE1234",
      text: "Booking for Apex Foods. Truck MP-04-HE-1234, driver Ramesh Kumar. Route Bhopal to Indore tomorrow.",
      language: "English",
      understood: "Amit Sharma (Apex Foods International) confirms shipment loading for vehicle MP-04-HE-1234. Driver Ramesh Kumar is assigned for Bhopal to Indore run on July 7, 2026.",
      data: {
        clientName: "Amit Sharma",
        company: "Apex Foods International",
        fromCity: "Bhopal",
        toCity: "Indore",
        truckSize: "Eicher 19ft",
        truckNo: "MP-04-HE-1234",
        driverName: "Ramesh Kumar",
        driverPhone: "+91 98765 43210",
        weight: "7 Tons",
        pickupDate: "2026-07-07",
        notes: "Driver Ramesh Kumar matches existing fleet record.",
        confidence: {
          clientName: 'high',
          route: 'high',
          truckSize: 'high',
          weight: 'high',
          pickupDate: 'high'
        }
      } as ExtractedData
    },
    {
      label: "Fleet New: UP16T9999",
      text: "New order: send truck UP-16-T-9999, driver Suresh Pal. Route Noida to Jaipur. 9 tons.",
      language: "English",
      understood: "Sanjay Dutt (Noida Freight Carriers) requests dispatch for truck UP-16-T-9999. Driver Suresh Pal is assigned for Noida to Jaipur run on July 7, 2026.",
      data: {
        clientName: "Sanjay Dutt",
        company: "Noida Freight Carriers",
        fromCity: "Noida",
        toCity: "Jaipur",
        truckSize: "Eicher 19ft",
        truckNo: "UP-16-T-9999",
        driverName: "Suresh Pal",
        driverPhone: "+91 95400 12345",
        weight: "9 Tons",
        pickupDate: "2026-07-07",
        notes: "Unregistered vehicle and driver contact profile. Needs onboarding.",
        confidence: {
          clientName: 'high',
          route: 'high',
          truckSize: 'high',
          weight: 'high',
          pickupDate: 'high'
        }
      } as ExtractedData
    }
  ];

  // Auto detect language based on input text
  const detectedLanguage = useMemo(() => {
    if (!pastedText.trim()) return null;
    const lower = pastedText.toLowerCase();
    
    // Check match presets
    const matchPreset = whatsappPresets.find(p => p.text.toLowerCase() === lower);
    if (matchPreset) return matchPreset.language;

    // Direct string keyword checking
    if (lower.includes('chahiye') || lower.includes('ko') || lower.includes('hai')) {
      return 'Hinglish';
    }
    if (/[\u0400-\u04FF\u0900-\u097F]/.test(pastedText)) {
      return 'Hindi';
    }
    return 'English';
  }, [pastedText]);

  // Handle Mock File Drop/Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile({
        name: file.name,
        preview: URL.createObjectURL(file)
      });
      triggerToast("Screenshot Uploaded", `${file.name} successfully registered.`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile({
        name: file.name,
        preview: URL.createObjectURL(file)
      });
      triggerToast("Screenshot Registered", `${file.name} dropped.`);
    }
  };

  // Simulate file select click
  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Run AI Extraction
  const handleRunExtraction = () => {
    setIsConfirmed(false);
    setIsExtracting(true);
    setMobileParserView('result');
    setExtractionStep('Reading message stream...');

    setTimeout(() => {
      setExtractionStep('Gemini OCR parsing text layers...');
      
      setTimeout(() => {
        setExtractionStep('Structuring shipment schema...');

        setTimeout(() => {
          setIsExtracting(false);
          
          // Match matching preset if exists, otherwise generate fallback
          const matchedPreset = whatsappPresets.find(p => 
            pastedText.toLowerCase().includes(p.text.toLowerCase().substring(0, 15))
          );

          if (matchedPreset) {
            setExtractedResult({ ...matchedPreset.data });
            setUnderstoodAsText(matchedPreset.understood);
          } else if (uploadedFile) {
            // Trigger Apex Foods pre-set for screenshot upload
            setExtractedResult({ ...whatsappPresets[0].data });
            setUnderstoodAsText(whatsappPresets[0].understood);
          } else {
            // Generic Fallback
            setExtractedResult({
              clientName: "Rajinder Pal",
              company: "Sharma Agri Logistics",
              fromCity: "Indore",
              toCity: "Mumbai",
              truckSize: "22ft Container",
              weight: "10 Tons",
              pickupDate: "2026-07-07",
              notes: "Parsed from manual custom entry. Pre-confirm gate entry fee restrictions.",
              confidence: {
                clientName: 'medium',
                route: 'high',
                truckSize: 'medium',
                weight: 'high',
                pickupDate: 'high'
              }
            });
            setUnderstoodAsText("Sharma Agri Logistics (Rajinder Pal) requests a 22ft Container truck from Indore to Mumbai on July 7, 2026, carrying a 10-ton agricultural shipment.");
          }

          triggerToast("AI Extraction Complete", "Review parsed values below before confirmation.");
        }, 1000);
      }, 900);
    }, 800);
  };

  // Edit fields inline in extracted card
  const handleExtractedFieldChange = (field: keyof ExtractedData, value: string) => {
    if (!extractedResult) return;
    setExtractedResult(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  // Confirm Extraction and Create Documents/Shipments
  const handleConfirmExtraction = () => {
    if (!extractedResult) return;
    setIsConfirmed(true);
    
    if (createBooking) {
      const savedShipments = localStorage.getItem('vanguard_shipments');
      let currentShipments = [];
      if (savedShipments) {
        try { currentShipments = JSON.parse(savedShipments); } catch (e) { currentShipments = []; }
      }
      
      const randomId = 'TRK-' + Math.floor(1000 + Math.random() * 9000);
      const newShipment = {
        id: randomId,
        clientName: extractedResult.clientName,
        companyName: extractedResult.company || 'Apex Foods International',
        routeFrom: extractedResult.fromCity,
        routeTo: extractedResult.toCity,
        truckSize: extractedResult.truckSize,
        truckNo: extractedResult.truckNo || 'MP-04-HE-1234',
        driverName: extractedResult.driverName || 'Ramesh Kumar',
        driverPhone: extractedResult.driverPhone || '+91 98765 43210',
        status: 'Pending Confirmation' as const,
        pickupDate: extractedResult.pickupDate,
        amount: extractedResult.truckSize === '22ft Container' ? 45000 : 28000,
        source: 'ai' as const,
        notes: extractedResult.notes,
        activityLog: [
          { time: '2026-07-06 09:30 AM', message: `Booking draft created via WhatsApp Parser.`, type: 'whatsapp' as const }
        ]
      };
      
      currentShipments = [newShipment, ...currentShipments];
      localStorage.setItem('vanguard_shipments', JSON.stringify(currentShipments));
      window.dispatchEvent(new Event('vanguard_shipments_updated'));
    }

    triggerToast("Success! Shipment Registered", "Manifest logs and invoices have been drafted.");
  };

  // Discard and reset
  const handleDiscardParser = () => {
    setExtractedResult(null);
    setPastedText('');
    setUploadedFile(null);
    setIsConfirmed(false);
  };

  // ==========================================
  // TAB 3: GROWTH ADVISOR STATE & DATA
  // ==========================================
  const [isRefreshingGrowth, setIsRefreshingGrowth] = useState(false);

  const growthInsights = [
    {
      id: 'growth-1',
      icon: <TrendingUp className="text-[#D946C4]" size={18} />,
      title: "Route Margin Optimization Alert",
      supportingData: "Delhi → Mumbai Route: 8.5% margin | Bhopal → Indore Route: 34.8% margin",
      description: "Your Delhi → Mumbai route margin (Base Freight: ₹89,000) is running low due to a 32% rise in interstate road taxes and empty-return deadhead kilometers. Bhopal → Indore continues to yield superior profitability.",
      actionLabel: "Establish pre-negotiated returning backhaul logistics with Mumbai-based brokers.",
      chatQuery: "How do I optimize Delhi route margins?"
    },
    {
      id: 'growth-2',
      icon: <AlertTriangle className="text-[#D946C4]" size={18} />,
      title: "Revenue Concentration Warning",
      supportingData: "62% of gross billings tied to Apex Foods & Titan Supply",
      description: "A substantial portion of your company cashflow relies on just two key enterprise accounts. A logistics delay or contract renegotiation with either poses a material balance sheet risk.",
      actionLabel: "Onboard 2-3 mid-tier manufacturers in the Ahmedabad/Pune region to diversify client mix.",
      chatQuery: "How do I diversify my client accounts and reduce concentration risk?"
    },
    {
      id: 'growth-3',
      icon: <Clock className="text-[#D946C4]" size={18} />,
      title: "Seasonal Agricultural Capacity Squeeze",
      supportingData: "Predicted +25% volume spike starting mid-July in MP",
      description: "Historical data shows peak harvesting shipping runs from Madhya Pradesh warehouses starting mid-July. Current operational vehicle utilization is at 85%, indicating potential driver shortfalls during high-tariff periods.",
      actionLabel: "Pre-allocate driver spot-bidding commitments now to lock in favorable lane tariffs.",
      chatQuery: "What is my capacity planning for the mid-July agricultural surge?"
    }
  ];

  const handleRefreshGrowth = () => {
    setIsRefreshingGrowth(true);
    setTimeout(() => {
      setIsRefreshingGrowth(false);
      triggerToast("Insights Refreshed", "Latest ledger and quotation records synchronized.");
    }, 1000);
  };

  // ==========================================
  // TAB 4: GUIDE & HELP WALKTHROUGH STATE & DATA
  // ==========================================
  const [guideSearchQuery, setGuideSearchQuery] = useState('');
  const [activeGuideSection, setActiveGuideSection] = useState('dashboard');
  const [guideChatInput, setGuideChatInput] = useState('');
  const [isGuideChatTyping, setIsGuideChatTyping] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const guideChatEndRef = useRef<HTMLDivElement>(null);

  const [guideChatHistory, setGuideChatHistory] = useState<ChatMessage[]>([
    {
      id: 'gmsg-1',
      sender: 'assistant',
      text: "Greetings! I am your Guide Companion AI. Scroll the user guide on the left to learn about our different panels, or select one of the suggested questions below to get quick help with key fields like 'Reference No.', 'Amount in Words', or 'Inclusive Checkbox'!",
      timestamp: '12:15 PM',
      widgetType: 'none'
    }
  ]);

  const GUIDE_QA: Record<string, string> = {
    "What does Reference No. do?": "The **Reference No.** serves as the unique identifier for documents (Invoices, Lorry Receipts, Cash Receipts) and shipments. It links billing items to dispatch records, preventing duplicate entries and ensuring chronological audit trails in your financial ledger.",
    "How do I confirm a booking?": "You can confirm a booking by clicking the **'Confirm Booking'** button on any pending ticket in the Dashboard or Shipments page. Alternatively, use the **WhatsApp Parser** tab to copy/paste client message streams and automatically extract shipment details into a draft dispatch order.",
    "What are pending bookings?": "Pending bookings are transport orders submitted by shippers that have not yet been approved or assigned a vehicle. These typically originate from digital message streams parsed via the WhatsApp AI Parser.",
    "What's the difference between Booked and In Transit?": "- **Booked**: The order is confirmed, rates are locked, and a specific vehicle/driver has been assigned, but loading or dispatch has not yet commenced.\n- **In Transit**: The vehicle has loaded, driver advances have been paid, and the cargo is actively moving along the route towards the destination.",
    "How do I drag cards on Kanban?": "Simply click and hold any shipment card on the **Shipments Kanban Board**, drag it horizontally to your desired status column (e.g., from 'In Transit' to 'Delivered'), and release. The system will automatically update the shipment's status and trigger any subsequent ledger logging.",
    "Can I cancel a shipment after dispatch?": "Yes, but any paid driver advances or fuel costs already logged under that shipment on the **Finance Ledger** must be manually reconciled as expenses. Toggle the status dropdown to 'Cancelled' inside the shipment details drawer to halt transit.",
    "How do I register a new client?": "Navigate to the **Clients** page and click the **'+ Add Client'** button in the header. Enter their primary contact info, corporate address, tax identification (GSTIN), and configure any default commercial routes to enable quick-fill when quoting.",
    "Where is Client Revenue Split calculated?": "The split is calculated dynamically in the **Clients** analytics panel. It aggregates all completed shipment invoice amounts, grouping them by client to render a visual donut chart showcasing your highest-volume accounts.",
    "What does commercial rate cover?": "The commercial rate is the pre-negotiated price charged to the client for transport. It covers basic freight charges (FRT), and does not include auxiliary line-item expenses like loading/unloading, green tax, or tolls unless specified as inclusive ('Incl').",
    "How is Amount in Words calculated?": "The **Amount in Words** is calculated dynamically using a decimal-to-text formatting algorithm. It takes the invoice grand total (base rate + additional charges + calculated GST) and instantly generates the corresponding formal English phrasing (e.g. *'Rupees Two Lakhs Fifteen Thousand Only'*).",
    "What does the 'Incl' checkbox mean?": "Checking the **'Incl' (Inclusive)** box on an invoice line item indicates that the specified rate already includes GST. The system will back out the tax portion from the total amount rather than adding tax on top, which prevents double-billing for flat-rate contracts.",
    "How is Profit Margin calculated?": "Profit Margin is calculated using the formula:\n\nMargin % = ((Total Revenue - Total Expenses) / Total Revenue) * 100\n\nExpenses include driver salary, fuel advances, tolls, and maintenance costs.",
    "Where do fuel advances show up?": "Fuel advances show up as chronological debit transactions on the **Finance Ledger** tagged under the 'Fuel & Maintenance' category. They are also factored directly into the shipment-level profitability card for that specific trip.",
    "How do I log a client payment?": "In the **Finance Ledger** panel, click **'+ Record Transaction'**. Choose 'Income' as the transaction type, select the client, enter the amount received, select the related shipment reference ID, and hit save.",
    "How is Distance rate calculated?": "The system multiplies the standard route distance (in km) by the vehicle size's per-kilometer rate configured in your settings. For example, a 500km trip in a 32ft Multi-Axle truck at ₹40/km yields a base rate of ₹20,000.",
    "How do I override base rate?": "Toggle the lock icon next to the rate in the **Quote Builder Form**. This unlocks the field, allowing you to manually input any customized spot-rate. The live quote PDF sheet will update instantly.",
    "What is the Price Matrix?": "The **Price Matrix** is a central lookup table storing your standard rates for repeat routes and truck types. When building a quote, selecting a source/destination route automatically retrieves these pre-approved matrix rates.",
    "How do I assign a driver from calendar?": "Double-click any unassigned shift block or pick-up slot in the weekly timeline. A dispatch window will open, allowing you to select an available driver and instantly create a booked shipment.",
    "Can I schedule recurring runs?": "Yes, when creating an event in the Calendar, select the 'Recurring' toggle and specify the frequency (e.g., Weekly, Bi-weekly) to populate the dispatcher schedule automatically.",
    "What do color codes represent?": "- **Purple (High Priority)**: Express shipments, tight delivery windows.\n- **Emerald (Active)**: In-transit shipments running on schedule.\n- **Amber (Pending)**: Pick-ups awaiting driver dispatch confirmation.",
    "How does priority auto-sorting work?": "Tasks are grouped dynamically: **High Priority** tasks (due today, or critical driver compliance tasks) rise to the top of the list, followed by **Medium** and **Low** tasks. Completed tasks are automatically archived below.",
    "Can I assign checklist to a driver?": "Yes! When creating or editing a To-Do item, you can select 'Driver KYC' or 'Vehicle Permit Checklist'. This links the item to the specific driver's profile, making it a prerequisite before their next dispatch.",
    "What are smart alerts?": "Smart alerts are automated red-flag notifications triggered when an action is near-due or overdue—such as an invoice outstanding for >15 days, or a vehicle whose national permit is expiring in under a week.",
    "Where is default GST rate configured?": "Navigate to the **Settings** page under the 'Operational Constants' section. You can set the default company-wide GST rate (5%, 12%, or 18%), which will be auto-selected for all newly created invoices.",
    "How do I update company bank details?": "In the **Settings -> Billing & Accounts** section, enter your bank name, account number, IFSC code, and branch. These details are dynamically injected into the footer of all generated invoices for easy client payouts.",
    "How are fallback rates applied?": "If a dispatcher builds a quote for a route not defined in the **Price Matrix**, the system applies the **fallback per-kilometer rate** configured in Settings for that specific vehicle class to calculate a draft price."
  };

  const SECTION_QUESTIONS: Record<string, string[]> = {
    dashboard: [
      "What are pending bookings?",
      "How do I confirm a booking?",
      "What does Reference No. do?"
    ],
    shipments: [
      "What's the difference between Booked and In Transit?",
      "How do I drag cards on Kanban?",
      "Can I cancel a shipment after dispatch?"
    ],
    calendar: [
      "How do I assign a driver from calendar?",
      "Can I schedule recurring runs?",
      "What do color codes represent?"
    ],
    clients: [
      "How do I register a new client?",
      "Where is Client Revenue Split calculated?",
      "What does commercial rate cover?"
    ],
    documents: [
      "What does Reference No. do?",
      "How is Amount in Words calculated?",
      "What does the 'Incl' checkbox mean?"
    ],
    finance: [
      "How is Profit Margin calculated?",
      "Where do fuel advances show up?",
      "How do I log a client payment?"
    ],
    quotations: [
      "How is Distance rate calculated?",
      "How do I override base rate?",
      "What is the Price Matrix?"
    ],
    todo: [
      "How does priority auto-sorting work?",
      "Can I assign checklist to a driver?",
      "What are smart alerts?"
    ],
    settings: [
      "Where is default GST rate configured?",
      "How do I update company bank details?",
      "How are fallback rates applied?"
    ]
  };

  const GUIDE_SECTIONS = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      summary: 'At-a-glance overview of vanguard logistics performance, revenue tracking, and immediate actions.',
      screenshotLabel: 'Dashboard screenshot — replace with actual app screenshot',
      callouts: [
        { number: 1, label: 'Net Profit', text: 'Shows your net income after subtracting driver advances, fuel, and all other operational expenses logged in the ledger.' },
        { number: 2, label: 'Revenue Chart', text: 'An interactive graph comparing trip billing vs inward payments weekly to monitor capital flow.' },
        { number: 3, label: 'Pending Confirmations', text: 'Lists transport requests extracted from chat message streams awaiting active dispatcher dispatch.' }
      ]
    },
    {
      id: 'shipments',
      title: 'Shipments',
      summary: 'Operational hub to dispatch fleet, track driver statuses, and update transit logs.',
      screenshotLabel: 'Shipments screenshot — replace with actual app screenshot',
      callouts: [
        { number: 1, label: 'Status Columns', text: 'Stages through which each shipment passes: Pending, Booked, In Transit, Delivered, and Cancelled.' },
        { number: 2, label: 'Kanban Board', text: 'Drag-and-drop shipment cards horizontally across columns to instantly update driver status and sync active transit stages.' },
        { number: 3, label: 'Quick Filters', text: 'Enables quick search by source city, destination, or assigned truck size to filter massive trip sheets instantly.' }
      ]
    },
    {
      id: 'calendar',
      title: 'Calendar',
      summary: 'Weekly scheduling grid for booking pick-ups, managing driver shifts, and coordinating deliveries.',
      screenshotLabel: 'Calendar screenshot — replace with actual app screenshot',
      callouts: [
        { number: 1, label: 'Timeline Grid', text: 'An hour-by-hour operational planner displaying truck arrivals, loading schedules, and driver shift assignments.' },
        { number: 2, label: 'Mini-Month Calendar', text: 'A small visual month picker to quickly jump to past records or look ahead at future dispatch volume.' },
        { number: 3, label: 'Interactive Booking Slots', text: 'Click directly on any empty hour slot to launch a pre-populated freight booking and truck dispatch drawer.' }
      ]
    },
    {
      id: 'clients',
      title: 'Clients',
      summary: 'Central directory for manager contact cards, contracted routes, and historical revenue.',
      screenshotLabel: 'Clients screenshot — replace with actual app screenshot',
      callouts: [
        { number: 1, label: 'Client Directory', text: 'Searchable database of registered commercial partner shippers, displaying key email, phone, and billing details.' },
        { number: 2, label: 'Revenue Split Chart', text: 'A dynamic donut visualization showcasing which corporate accounts yield the highest dispatch volume.' },
        { number: 3, label: 'Active Contracts', text: 'List of standard routes and locked rates pre-negotiated for repeat commercial agreements.' }
      ]
    },
    {
      id: 'documents',
      title: 'Documents',
      summary: 'Generate and store professional PDF Invoices, Lorry Receipts (LR), and cash receipts.',
      screenshotLabel: 'Documents screenshot — replace with actual app screenshot',
      callouts: [
        { number: 1, label: 'Document Type Selector', text: 'Toggle between building a professional Tax Invoice, standard Lorry Receipt (LR), or Cash Payment Receipt.' },
        { number: 2, label: 'Dynamic Live Preview', text: 'An instant high-fidelity sheet representation mimicking the printed PDF, refreshing instantly as fields are typed.' },
        { number: 3, label: 'Reference No. Autofill', text: 'Typing or choosing a shipment ID auto-populates client names, locations, truck details, and contracted commercial rates.' }
      ],
      logicCallout: {
        title: 'Important Billing Logic',
        text: 'To avoid errors on critical commercial documents, keep these dynamic behaviors in mind:',
        details: [
          'Reference No. Auto-fill: Selecting a shipment autofills details like client corporate credentials, cities, vehicle specs, and base rates to keep the ledger aligned.',
          'Amount in Words: On editing any financial values, a text formatter converts the grand total into formal text phrasing (e.g. "Rupees One Lakh Twenty-Five Thousand Only") dynamically.',
          'Tax-inclusive Checkbox (Incl): Checking this indicates that GST is included in the line rate. The system back-calculates and extracts the GST portion instead of adding it on top.'
        ]
      }
    },
    {
      id: 'finance',
      title: 'Finance',
      summary: 'Double-entry bookkeeping ledger, shipment profitability metrics, and category insights.',
      screenshotLabel: 'Finance screenshot — replace with actual app screenshot',
      callouts: [
        { number: 1, label: 'Ledger View', text: 'Chronological double-entry table of outward driver advances, fuel expenses, and client payments.' },
        { number: 2, label: 'Shipment Profitability', text: 'Analysis of profit margin per-trip (Revenue minus Fuel/Driver costs) to highlight low-performing routes.' },
        { number: 3, label: 'Financial Health Cards', text: 'Aggregated analytics displaying total outstanding receivables, current operational payables, and net margin %.' }
      ]
    },
    {
      id: 'quotations',
      title: 'Quotations',
      summary: 'Interactive spot-rate calculator, company-wide price matrices, and professional proposals.',
      screenshotLabel: 'Quotations screenshot — replace with actual app screenshot',
      callouts: [
        { number: 1, label: 'Base Rate Calculator', text: 'Calculates price automatically by multiplying distance by truck size rate (with custom multipliers in settings).' },
        { number: 2, label: 'Inline Rate Matrix', text: 'Directly click and edit cells in the route rate table for real-time price updates for active shipper RFPs.' },
        { number: 3, label: 'Export Proposal', text: 'Instantly compile and download professional multi-route commercial rate quotes as high-fidelity client PDFs.' }
      ]
    },
    {
      id: 'todo',
      title: 'To-Do',
      summary: 'Actionable dispatcher task manager with urgency categories, fleet reminders, and checklists.',
      screenshotLabel: 'To-Do screenshot — replace with actual app screenshot',
      callouts: [
        { number: 1, label: 'Priority Sorting', text: 'Urgency-based lists grouping critical tasks (driver KYC check, expired permits) at the top.' },
        { number: 2, label: 'Fleet Checklist', text: 'Quick operational checklist for driver verification, vehicle fitness certificates, and loading permits.' },
        { number: 3, label: 'Smart Notifications', text: 'Auto-alerts that warn you when an invoice is overdue or when a driver’s national permit is nearing expiry.' }
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      summary: 'Configure operational profile, GST rates, bank accounts, and fallback price tables.',
      screenshotLabel: 'Settings screenshot — replace with actual app screenshot',
      callouts: [
        { number: 1, label: 'GST Configuration', text: 'Define standard tax percentages (5%, 12%, 18%) used dynamically throughout the billing modules.' },
        { number: 2, label: 'Fallback Rates', text: 'Configure default per-kilometer rates for vehicles in case a specific route matrix rate is undefined.' },
        { number: 3, label: 'Profile Info', text: 'Manage dispatcher account details, corporate branding address, and bank account details for client invoice printouts.' }
      ]
    }
  ];

  const currentSuggestedQuestions = useMemo(() => {
    return SECTION_QUESTIONS[activeGuideSection] || SECTION_QUESTIONS.dashboard;
  }, [activeGuideSection]);

  const filteredGuideSections = useMemo(() => {
    if (!guideSearchQuery.trim()) return GUIDE_SECTIONS;
    const q = guideSearchQuery.toLowerCase();
    return GUIDE_SECTIONS.filter(sec => {
      return (
        sec.title.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        sec.callouts.some(c => c.label.toLowerCase().includes(q) || c.text.toLowerCase().includes(q)) ||
        (sec.logicCallout && (
          sec.logicCallout.title.toLowerCase().includes(q) ||
          sec.logicCallout.text.toLowerCase().includes(q) ||
          sec.logicCallout.details.some(d => d.toLowerCase().includes(q))
        ))
      );
    });
  }, [guideSearchQuery]);

  // Scroll to bottom of guide chat
  useEffect(() => {
    if (guideChatEndRef.current) {
      guideChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [guideChatHistory, isGuideChatTyping]);

  // Handle Quick Jump Clicking
  const handleQuickJump = (sectionId: string) => {
    const isMatched = filteredGuideSections.some(sec => sec.id === sectionId);
    if (!isMatched) {
      setGuideSearchQuery('');
    }
    setActiveGuideSection(sectionId);
    
    setTimeout(() => {
      const element = document.getElementById(`guide-section-${sectionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // IntersectionObserver to auto-update active suggested questions on scroll
  useEffect(() => {
    if (activeTab !== 'guide') return;

    const scrollContainer = document.getElementById('guide-scroll-container');
    if (!scrollContainer) return;

    const observerOptions = {
      root: scrollContainer,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id.replace('guide-section-', '');
          setActiveGuideSection(sectionId);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    GUIDE_SECTIONS.forEach(sec => {
      const el = document.getElementById(`guide-section-${sec.id}`);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [activeTab, filteredGuideSections]);

  const handleGuideChatSubmit = (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = {
      id: `gmsg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      widgetType: 'none'
    };
    
    setGuideChatHistory(prev => [...prev, userMsg]);
    setGuideChatInput('');
    setIsGuideChatTyping(true);
    
    setTimeout(() => {
      const query = text.toLowerCase();
      let bestMatchKey = "";
      let maxMatches = 0;
      
      Object.keys(GUIDE_QA).forEach(key => {
        const keywords = key.toLowerCase().split(/[^a-z0-9]+/);
        let matches = 0;
        keywords.forEach(word => {
          if (word.length > 2 && query.includes(word)) {
            matches++;
          }
        });
        if (matches > maxMatches) {
          maxMatches = matches;
          bestMatchKey = key;
        }
      });
      
      let answer = "";
      if (maxMatches > 0) {
        answer = GUIDE_QA[bestMatchKey];
      } else {
        // Fallback value-based match
        Object.entries(GUIDE_QA).forEach(([key, val]) => {
          const words = val.toLowerCase().split(/[^a-z0-9]+/);
          let matches = 0;
          words.forEach(word => {
            if (word.length > 3 && query.includes(word)) {
              matches++;
            }
          });
          if (matches > maxMatches) {
            maxMatches = matches;
            bestMatchKey = key;
          }
        });
        
        if (maxMatches > 1) {
          answer = `Regarding your question, here is what the guide says about **${bestMatchKey}**:\n\n${GUIDE_QA[bestMatchKey]}`;
        } else {
          answer = "I'm here to help you navigate Vanguard! Try asking about **'Reference No.'**, **'Amount in Words'**, **'Incl checkbox'**, **'margins'**, or scroll to a specific section on the left to see page-specific questions.";
        }
      }
      
      const replyMsg: ChatMessage = {
        id: `gmsg-${Date.now() + 1}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        widgetType: 'none'
      };
      
      setGuideChatHistory(prev => [...prev, replyMsg]);
      setIsGuideChatTyping(false);
    }, 850);
  };

  const handleJumpToChatWithQuery = (query: string) => {
    setActiveTab('chat');
    handleSendChat(query);
  };

  return (
    <div id="ai-assistant-root-container" className="space-y-6 flex flex-col flex-1 pb-16 relative">
      {/* 2. Signature Exception: Ambient Background Dotted Wave Texture */}
      <DottedWave />
      
      {/* Dynamic Floating Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-stone-900 border border-[#D946C4]/30 text-white rounded-2xl px-4 py-3.5 shadow-2xl flex items-center gap-3.5 z-50 w-full max-w-sm"
          >
            <div className="w-5.5 h-5.5 rounded-full bg-[#D946C4]/10 border border-[#D946C4]/20 flex items-center justify-center text-[#D946C4]">
              <CheckCircle size={14} />
            </div>
            <div className="text-xs flex-1">
              <p className="font-semibold text-[#D946C4]">{toast.message}</p>
              {toast.subText && <p className="text-[10px] text-white/50 mt-0.5">{toast.subText}</p>}
            </div>
            <button 
              onClick={() => setToast(null)} 
              className="text-white/30 hover:text-white p-0.5"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== UPPER CONTROL: HEADER & TABS ==================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-xl font-bold font-display text-[#F2EEF9] tracking-tight flex items-center gap-2">
            Vanguard Dispatch Intel
            <span className="text-[10px] font-mono font-semibold bg-[#D946C4]/15 border border-[#D946C4]/35 text-[#D946C4] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} className="animate-pulse" />
              Gemini Pro Active
            </span>
          </h1>
          <p className="text-xs text-[#B6B6C6] font-sans">Automate freight dispatching, parse informal WhatsApp orders, and analyze profit margins</p>
        </div>

        {/* Quad Segmented Switcher */}
        <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex flex-wrap gap-1 md:gap-0 self-start md:self-auto shadow-md">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chat' 
                ? 'bg-[#D946C4] text-stone-950 shadow-md shadow-[#D946C4]/15' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare size={13} />
            Ask Assistant
          </button>
          <button
            onClick={() => setActiveTab('parser')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'parser' 
                ? 'bg-[#D946C4] text-stone-950 shadow-md shadow-[#D946C4]/15' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Languages size={13} />
            WhatsApp Parser
          </button>
          <button
            onClick={() => setActiveTab('growth')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'growth' 
                ? 'bg-[#D946C4] text-stone-950 shadow-md shadow-[#D946C4]/15' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity size={13} />
            Growth Advisor
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide' 
                ? 'bg-[#D946C4] text-stone-950 shadow-md shadow-[#D946C4]/15' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen size={13} />
            Guide & Help
          </button>
        </div>
      </div>

      {/* ==========================================
          TAB 1: ASK ASSISTANT CHAT MODULE
          ========================================== */}
      <AnimatePresence mode="wait">
        {activeTab === 'chat' && (
          <motion.div
            key="chat-tab-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col bg-white/4 border border-white/8 rounded-2xl h-[580px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
          >
            {/* Embedded Chat Feed Panel */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4.5 scrollbar-thin scrollbar-thumb-white/10">
              {chatHistory.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div 
                    key={msg.id} 
                    className={`flex items-start gap-3 max-w-[85%] ${
                      isUser ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border ${
                      isUser 
                        ? 'bg-white/10 text-white border-white/10' 
                        : 'bg-[#D946C4]/15 text-white border-[#D946C4]/30'
                    }`}>
                      {isUser ? <User size={14} /> : <Sparkles size={14} />}
                    </div>

                    {/* Chat Bubble Container */}
                    <div className="space-y-2">
                      <div className={`p-4 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed shadow-lg ${
                        isUser 
                          ? 'bg-[#D946C4]/15 border border-[#D946C4]/25 text-white rounded-tr-sm' 
                          : 'bg-stone-900/90 border border-white/8 text-white/90 rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>

                      {/* --- CONDITIONAL INLINE DATA WIDGETS --- */}
                      {!isUser && msg.widgetType === 'earnings' && (
                        <div className="mt-2.5 bg-stone-900 border border-[#D946C4]/20 p-4 rounded-xl space-y-3 shadow-md animate-fade-in">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">MONTH-TO-DATE METRICS</span>
                            <span className="text-[9px] bg-[#D946C4]/10 text-[#D946C4] px-1.5 py-0.5 rounded font-mono border border-[#D946C4]/20">JULY 2026</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/2 border border-white/5 p-2.5 rounded-lg">
                              <span className="text-[10px] text-white/50 block font-sans">Gross Revenue</span>
                              <span className="text-sm font-mono font-bold text-white">₹8,40,000</span>
                              <span className="text-[9px] text-emerald-400 block mt-0.5 font-sans">▲ 14.2% MoM</span>
                            </div>
                            <div className="bg-white/2 border border-white/5 p-2.5 rounded-lg">
                              <span className="text-[10px] text-white/50 block font-sans">Net Profits</span>
                              <span className="text-sm font-mono font-bold text-[#D946C4]">₹2,45,000</span>
                              <span className="text-[9px] text-emerald-400 block mt-0.5 font-sans">▲ 11.5% Target</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-white/60">
                              <span>Monthly Target Progress</span>
                              <span className="font-mono">78%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                              <div className="bg-[#D946C4] h-full rounded-full" style={{ width: '78%' }} />
                            </div>
                          </div>
                        </div>
                      )}

                      {!isUser && msg.widgetType === 'pending_bookings' && (
                        <div className="mt-2.5 bg-stone-900 border border-[#D946C4]/20 p-3 rounded-xl space-y-2.5 shadow-md animate-fade-in w-full max-w-sm">
                          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Pending Confirmation</span>
                            <span className="text-[9px] text-white/50 font-mono">3 spot lanes</span>
                          </div>

                          <div className="space-y-2">
                            <div className="bg-white/2 border border-white/5 p-2.5 rounded-lg flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-1.5 text-[11px] text-white font-semibold">
                                  <span>Bhopal</span>
                                  <ArrowRight size={10} className="text-white/40" />
                                  <span>Indore</span>
                                </div>
                                <span className="text-[9px] text-white/40 font-mono">Apex Foods • 22ft Container</span>
                              </div>
                              <span className="text-[10px] text-[#D946C4] font-bold font-mono">₹21,000</span>
                            </div>

                            <div className="bg-white/2 border border-white/5 p-2.5 rounded-lg flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-1.5 text-[11px] text-white font-semibold">
                                  <span>Delhi</span>
                                  <ArrowRight size={10} className="text-white/40" />
                                  <span>Mumbai</span>
                                </div>
                                <span className="text-[9px] text-white/40 font-mono">Titan Supply • 32ft Multi-Axle</span>
                              </div>
                              <span className="text-[10px] text-[#D946C4] font-bold font-mono">₹1,28,000</span>
                            </div>

                            <div className="bg-white/2 border border-white/5 p-2.5 rounded-lg flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-1.5 text-[11px] text-white font-semibold">
                                  <span>Ahmedabad</span>
                                  <ArrowRight size={10} className="text-white/40" />
                                  <span>Pune</span>
                                </div>
                                <span className="text-[9px] text-white/40 font-mono">Rajput Cold • 407 LCV</span>
                              </div>
                              <span className="text-[10px] text-[#D946C4] font-bold font-mono">₹19,500</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => {
                              if(setActivePage) setActivePage('todo');
                              triggerToast("Redirecting...", "Opening Dispatcher Checklist Tab");
                            }}
                            className="w-full h-7 rounded bg-[#D946C4] hover:bg-[#D946C4]/80 text-white font-semibold text-[10px] tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            OPEN CHECKLISTS & DISPATCH QUEUE
                            <ArrowUpRight size={11} />
                          </button>
                        </div>
                      )}

                      {!isUser && msg.widgetType === 'top_client' && (
                        <div className="mt-2.5 bg-stone-900 border border-[#D946C4]/20 p-4 rounded-xl space-y-3 shadow-md animate-fade-in w-full max-w-sm">
                          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                            <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center text-[#D946C4]">
                              <Building size={13} />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-white">Apex Foods International</p>
                              <p className="text-[9px] text-white/40 font-mono">Account Manager: Amit Sharma</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white/2 p-2 rounded-lg">
                              <span className="text-[9px] text-white/40 block">Billings</span>
                              <span className="text-[11px] font-mono font-bold text-white">₹5.8L</span>
                            </div>
                            <div className="bg-white/2 p-2 rounded-lg">
                              <span className="text-[9px] text-white/40 block">Margin</span>
                              <span className="text-[11px] font-mono font-bold text-emerald-400">28.4%</span>
                            </div>
                            <div className="bg-white/2 p-2 rounded-lg">
                              <span className="text-[9px] text-white/40 block">Shipments</span>
                              <span className="text-[11px] font-mono font-bold text-white">14 Spot</span>
                            </div>
                          </div>

                          <div className="text-[10px] text-white/50 space-y-1 font-sans">
                            <div className="flex justify-between">
                              <span>Preferred Lane:</span>
                              <span className="text-white">Bhopal ⇄ Indore</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Payment Period:</span>
                              <span className="text-white">15 Days average</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => {
                              if(setActivePage) setActivePage('clients');
                              triggerToast("Redirecting...", "Opening Clients Panel");
                            }}
                            className="w-full h-7 rounded border border-white/10 hover:bg-white/5 text-white font-semibold text-[10px] tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            VIEW FULL CLIENT LEDGER
                            <ChevronRight size={11} />
                          </button>
                        </div>
                      )}

                      {/* Msg timestamp */}
                      <p className={`text-[9px] text-white/30 font-mono mt-1 ${isUser ? 'text-right' : ''}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Typing Loader dots */}
              {isTyping && (
                <div className="flex items-start gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-xl bg-[#D946C4]/15 text-white flex items-center justify-center font-bold text-xs shrink-0 border border-[#D946C4]/30">
                    <Sparkles size={14} />
                  </div>
                  <div className="bg-stone-900 border border-white/8 p-3.5 rounded-2xl rounded-tl-sm shadow-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#D946C4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#D946C4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#D946C4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Bottom Prompt suggestions chips */}
            <div className="px-5 py-3 border-t border-white/5 bg-stone-950/20 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
              {promptChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChat(chip.query)}
                  className="bg-white/5 hover:bg-white/10 border border-white/8 text-white/80 hover:text-white px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all shadow-sm flex items-center gap-1 cursor-pointer shrink-0 active:scale-95"
                >
                  <Sparkles size={10} className="text-[#D946C4] shrink-0" />
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Bar form panel */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat(chatInput);
              }}
              className="p-4 bg-stone-950/40 border-t border-white/8 flex items-center gap-2.5"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask dispatch intelligence (e.g., 'What are my earnings?' or ' Delhi route details')..."
                className="flex-1 bg-stone-900 border border-white/10 rounded-xl h-11 px-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D946C4]/40 focus:ring-1 focus:ring-[#D946C4]/10"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer border ${
                  chatInput.trim() 
                    ? 'bg-[#D946C4] text-white border-[#D946C4]/20 hover:bg-[#D946C4]/80' 
                    : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                }`}
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          TAB 2: WHATSAPP MESSAGES PARSER
          ========================================== */}
      <AnimatePresence mode="wait">
        {activeTab === 'parser' && (
          <motion.div
            key="parser-tab-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Quick Informational bar */}
            <div className="flex items-center gap-2.5 bg-white/3 border border-white/8 rounded-2xl p-4">
              <Info size={15} className="text-[#D946C4]" />
              <p className="text-xs text-white/70">
                <span className="font-semibold text-white">Parser Automation:</span> Paste messy conversational messages or drop driver screenshots. Gemini automatically translates dialects, reconciles routes, matches clients, and drafts documents.
              </p>
            </div>

            {/* Mobile Tab Switcher to switch between paste and result */}
            <div className="lg:hidden flex bg-stone-900/60 p-1 rounded-xl border border-white/5 w-full mb-2">
              <button
                type="button"
                onClick={() => setMobileParserView('input')}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all duration-200 ${
                  mobileParserView === 'input'
                    ? 'bg-[#D946C4] text-white font-bold'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                Source Message
              </button>
              <button
                type="button"
                onClick={() => setMobileParserView('result')}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all duration-200 ${
                  mobileParserView === 'result'
                    ? 'bg-[#D946C4] text-white font-bold'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                AI Extraction Result
              </button>
            </div>

            {/* Split Input + Extraction Block */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Input Methods Container (5 Cols) */}
              <div className={`lg:col-span-5 bg-white/4 border border-white/8 rounded-2xl p-5 space-y-4 shadow-lg ${mobileParserView === 'input' ? 'block' : 'hidden lg:block'}`}>
                
                {/* Method Switch Toggle */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-display">Source Message</span>
                  <div className="bg-stone-950 p-0.5 rounded-lg border border-white/10 flex">
                    <button
                      onClick={() => {
                        setParserInputMode('paste');
                        handleDiscardParser();
                      }}
                      className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                        parserInputMode === 'paste' ? 'bg-[#D946C4] text-white font-bold' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      Paste Text
                    </button>
                    <button
                      onClick={() => {
                        setParserInputMode('upload');
                        handleDiscardParser();
                      }}
                      className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                        parserInputMode === 'upload' ? 'bg-[#D946C4] text-white font-bold' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      Screenshot
                    </button>
                  </div>
                </div>

                {/* PASTE TEXT PANELS */}
                {parserInputMode === 'paste' && (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Text Presets */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-white/40 block">QUICK TEST PRESETS (CONVERSATIONAL DIALECTS):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {whatsappPresets.map((preset, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setPastedText(preset.text);
                              setExtractedResult(null);
                            }}
                            className="bg-white/5 hover:bg-white/10 border border-white/8 text-white/80 hover:text-white px-2.5 py-1 rounded text-[10px] transition-all cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Textarea Input */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] font-mono text-white/45 uppercase tracking-wider block">Raw Messaging Text</label>
                      <textarea
                        value={pastedText}
                        onChange={(e) => {
                          setPastedText(e.target.value);
                          setExtractedResult(null);
                        }}
                        rows={5}
                        placeholder='e.g., "sharma ji ko 20ft truck chahiye bhopal se indore kal, 8 ton load hai"'
                        className="w-full bg-stone-900 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D946C4]/40 focus:ring-1 focus:ring-[#D946C4]/10 leading-relaxed font-mono"
                      />

                      {/* Language Indicator */}
                      {detectedLanguage && (
                        <div className="absolute right-3.5 bottom-3 bg-stone-950 border border-white/10 rounded-lg px-2 py-0.5 text-[10px] text-[#D946C4] font-mono flex items-center gap-1 shadow-md">
                          <Languages size={10} />
                          Detected: <span className="font-bold">{detectedLanguage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* UPLOAD SCREENSHOT PANEL */}
                {parserInputMode === 'upload' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Drag & Drop Frame */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={triggerFileSelect}
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        dragOver 
                          ? 'border-[#D946C4] bg-[#D946C4]/5' 
                          : 'border-white/10 hover:border-[#D946C4]/30 bg-stone-950/10'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden" 
                      />
                      
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/60 mb-2.5">
                        <Upload size={16} />
                      </div>

                      <p className="text-xs text-white font-semibold">Drag screenshot here or click to browse</p>
                      <p className="text-[10px] text-white/40 mt-1 max-w-[200px]">Supports PNG, JPG WhatsApp message screen layouts in Hindi, English, Hinglish</p>
                    </div>

                    {/* Image Preview Thumbnail */}
                    {uploadedFile ? (
                      <div className="bg-stone-950 border border-white/8 rounded-xl p-2.5 flex items-center gap-3">
                        <div className="w-12 h-14 bg-stone-900 rounded border border-white/5 overflow-hidden flex items-center justify-center relative group shrink-0">
                          <img src={uploadedFile.preview} alt="Upload thumb" className="h-full object-cover" />
                          <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye size={12} className="text-white" />
                          </div>
                        </div>
                        <div className="flex-1 text-xs truncate">
                          <p className="font-semibold text-white truncate">{uploadedFile.name}</p>
                          <p className="text-[10px] text-emerald-400 mt-0.5">Ready for OCR Extraction</p>
                        </div>
                        <button 
                          onClick={() => setUploadedFile(null)} 
                          className="text-white/40 hover:text-white p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      // Clickable template placeholder mock screenshot selection to help testing
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-white/40 block">OR USE SAMPLE SCREENSHOT SIMULATOR:</span>
                        <button
                          onClick={() => {
                            setUploadedFile({
                              name: "whatsapp_hinglish_apex_foods.png",
                              preview: "https://images.unsplash.com/photo-1546074177-ffedd1d85d4c?w=100&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" // simple mock image url
                            });
                            setPastedText("sharma ji ko 20ft truck chahiye bhopal se indore kal, 8 ton load hai. urgent delivery hai");
                            setExtractedResult(null);
                          }}
                          className="w-full bg-white/3 hover:bg-white/5 border border-white/5 p-2 rounded-lg text-left text-[10px] text-white/80 transition-colors flex items-center justify-between"
                        >
                          <span className="font-semibold truncate">whatsapp_chat_hinglish_Apex.png</span>
                          <span className="text-[#D946C4] font-mono text-[9px]">Select Mock Screenshot</span>
                        </button>
                      </div>
                    )}

                    <p className="text-[10px] text-white/30 italic text-center">
                      *Note: Simulating screenshot OCR processes text through server-side OCR modules.
                    </p>
                  </div>
                )}

                {/* Extract Button */}
                <button
                  onClick={handleRunExtraction}
                  disabled={isExtracting || (parserInputMode === 'paste' ? !pastedText.trim() : !uploadedFile)}
                  className={`w-full h-10 rounded-xl font-bold tracking-wide transition-all text-xs flex items-center justify-center gap-2 cursor-pointer border ${
                    (isExtracting || (parserInputMode === 'paste' ? !pastedText.trim() : !uploadedFile))
                      ? 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                      : 'bg-[#D946C4] hover:bg-[#D946C4]/80 text-white border-[#D946C4]/20 shadow-md active:scale-95'
                  }`}
                >
                  <Sparkles size={14} />
                  {isExtracting ? 'Extracting...' : 'Extract Details'}
                </button>

              </div>

              {/* RIGHT COLUMN: Extraction Result (7 Cols) */}
              <div className={`lg:col-span-7 space-y-6 ${mobileParserView === 'result' ? 'block' : 'hidden lg:block'}`}>

                {/* LOADING STATE */}
                <AnimatePresence mode="wait">
                  {isExtracting && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white/4 border border-white/8 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[380px]"
                    >
                      <RefreshCw size={36} className="text-[#D946C4] animate-spin mb-4" />
                      <h4 className="text-sm font-semibold text-white animate-pulse">{extractionStep}</h4>
                      <p className="text-[11px] text-white/40 mt-1 max-w-sm">
                        Synchronizing parsed words against verified lanes, client spellings, and truck metrics...
                      </p>
                    </motion.div>
                  )}

                  {/* NO EXTRACTION YET PLACEHOLDER */}
                  {!isExtracting && !extractedResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white/2 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[380px] text-white/30"
                    >
                      <div className="w-12 h-12 rounded-full border border-white/5 bg-white/2 flex items-center justify-center text-white/30 mb-3">
                        <Languages size={18} />
                      </div>
                      <p className="text-xs font-semibold">Awaiting Extraction</p>
                      <p className="text-[10px] text-white/40 mt-1 max-w-[280px]">
                        Paste a WhatsApp message on the left or upload a driver screenshot, then click "Extract Details" to review structured outputs.
                      </p>
                    </motion.div>
                  )}

                  {/* EXTRACTION RESULT (PREMIUM GLOW CARD) */}
                  {!isExtracting && extractedResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`bg-gradient-to-b from-stone-900/95 to-stone-950 border rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all duration-300 ${
                        isConfirmed 
                          ? 'border-emerald-500/20 shadow-emerald-500/5' 
                          : 'border-[#D946C4]/30 shadow-[0_8px_32px_rgba(217,70,196,0.05)]'
                      }`}
                    >
                      
                      {/* Subtle header tag */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3.5">
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={14} className="text-[#D946C4]" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider font-display">Extracted Proposal Details</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase border ${
                          isConfirmed 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-[#D946C4]/10 text-[#D946C4] border-[#D946C4]/20'
                        }`}>
                          {isConfirmed ? 'CONFIRMED' : 'Awaiting Review'}
                        </span>
                      </div>

                      {/* Cleaned English interpretation */}
                      <div className="bg-white/3 border border-white/5 p-3 rounded-xl mb-4 text-xs italic text-white/70 relative">
                        <span className="text-[10px] font-mono text-[#D946C4] font-semibold uppercase block not-italic mb-1">Understood as:</span>
                        "{understoodAsText}"
                      </div>

                      {/* Fleet matching banners */}
                      {extractedResult.truckNo && (
                        <div className="mb-4">
                          {recognizedFleetRecord ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between text-xs text-white/90">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                  <Check size={12} />
                                </div>
                                <div className="text-left">
                                  <p className="font-semibold text-emerald-400">Verified Fleet Vehicle Matches</p>
                                  <p className="text-[10px] text-white/50 font-mono">Assigned: {recognizedFleetRecord.driver?.name} ({recognizedFleetRecord.driver?.phone})</p>
                                </div>
                              </div>
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono uppercase font-bold">MATCHED</span>
                            </div>
                          ) : (
                            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/90">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                  <Info size={12} className="shrink-0" />
                                </div>
                                <div className="text-left">
                                  <p className="font-semibold text-amber-400">Unrecognized Vehicle</p>
                                  <p className="text-[10px] text-white/50">New truck/driver — not in Fleet yet</p>
                                </div>
                              </div>
                              <button
                                onClick={handleQuickAddToFleet}
                                className="self-start sm:self-auto bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer uppercase active:scale-95"
                              >
                                + Add to Fleet
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Editable Extracted Fields List */}
                      <div className="space-y-3.5">
                        <span className="text-[10px] font-mono text-white/40 block">RECONCILED ATTRIBUTES (EDIT TO CORRECT):</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          
                          {/* Client / Contact */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] text-white/50 flex items-center gap-1">
                                <User size={10} className="text-white/40" />
                                Client Contact
                              </label>
                              <span className="flex items-center gap-1 text-[8px] font-mono text-emerald-400 uppercase">
                                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                high confidence
                              </span>
                            </div>
                            <input
                              type="text"
                              value={extractedResult.clientName}
                              onChange={(e) => handleExtractedFieldChange('clientName', e.target.value)}
                              disabled={isConfirmed}
                              className="w-full bg-stone-900 border border-white/10 rounded-lg h-8 px-2.5 text-xs text-white focus:outline-none focus:border-[#D946C4]/30 disabled:opacity-50"
                            />
                          </div>

                          {/* Company */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] text-white/50 flex items-center gap-1">
                                <Building size={10} className="text-white/40" />
                                Company Matching
                              </label>
                              <span className="flex items-center gap-1 text-[8px] font-mono text-emerald-400 uppercase">
                                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                high confidence
                              </span>
                            </div>
                            <input
                              type="text"
                              value={extractedResult.company}
                              onChange={(e) => handleExtractedFieldChange('company', e.target.value)}
                              disabled={isConfirmed}
                              className="w-full bg-stone-900 border border-white/10 rounded-lg h-8 px-2.5 text-xs text-white focus:outline-none focus:border-[#D946C4]/30 disabled:opacity-50"
                            />
                          </div>

                          {/* From City */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] text-white/50 flex items-center gap-1">
                                <MapPin size={10} className="text-white/40" />
                                From City
                              </label>
                              <span className="flex items-center gap-1 text-[8px] font-mono text-emerald-400 uppercase">
                                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                high confidence
                              </span>
                            </div>
                            <select
                              value={extractedResult.fromCity}
                              onChange={(e) => handleExtractedFieldChange('fromCity', e.target.value)}
                              disabled={isConfirmed}
                              className="w-full bg-stone-900 border border-white/10 rounded-lg h-8 px-2 text-xs text-white focus:outline-none focus:border-[#D946C4]/30 disabled:opacity-50"
                            >
                              {['Bhopal', 'Indore', 'Delhi', 'Mumbai', 'Ahmedabad', 'Pune', 'Amritsar', 'Noida', 'Jaipur', 'Gwalior'].map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>

                          {/* To City */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] text-white/50 flex items-center gap-1">
                                <MapPin size={10} className="text-white/40" />
                                To City
                              </label>
                              <span className="flex items-center gap-1 text-[8px] font-mono text-emerald-400 uppercase">
                                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                high confidence
                              </span>
                            </div>
                            <select
                              value={extractedResult.toCity}
                              onChange={(e) => handleExtractedFieldChange('toCity', e.target.value)}
                              disabled={isConfirmed}
                              className="w-full bg-stone-900 border border-white/10 rounded-lg h-8 px-2 text-xs text-white focus:outline-none focus:border-[#D946C4]/30 disabled:opacity-50"
                            >
                              {['Bhopal', 'Indore', 'Delhi', 'Mumbai', 'Ahmedabad', 'Pune', 'Amritsar', 'Noida', 'Jaipur', 'Gwalior'].map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>

                          {/* Truck Size */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] text-white/50 flex items-center gap-1">
                                <Scale size={10} className="text-white/40" />
                                Truck Type Size
                              </label>
                              <span className={`flex items-center gap-1 text-[8px] font-mono uppercase ${
                                extractedResult.confidence.truckSize === 'high' ? 'text-emerald-400' : 'text-[#D946C4]'
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${extractedResult.confidence.truckSize === 'high' ? 'bg-emerald-400' : 'bg-[#D946C4]'}`} />
                                {extractedResult.confidence.truckSize} confidence
                              </span>
                            </div>
                            <select
                              value={extractedResult.truckSize}
                              onChange={(e) => handleExtractedFieldChange('truckSize', e.target.value)}
                              disabled={isConfirmed}
                              className="w-full bg-stone-900 border border-white/10 rounded-lg h-8 px-2 text-xs text-white focus:outline-none focus:border-[#D946C4]/30 disabled:opacity-50"
                            >
                              {['407 LCV', 'Eicher 14ft', 'Eicher 19ft', '22ft Container', '32ft Multi-Axle'].map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>

                          {/* Truck No */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] text-white/50 flex items-center gap-1 font-mono">
                                <Scale size={10} className="text-white/40" />
                                Truck Plate No
                              </label>
                              <span className="flex items-center gap-1 text-[8px] font-mono text-emerald-400 uppercase">
                                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                high confidence
                              </span>
                            </div>
                            <input
                              type="text"
                              value={extractedResult.truckNo || ''}
                              onChange={(e) => handleExtractedFieldChange('truckNo', e.target.value)}
                              disabled={isConfirmed}
                              placeholder="e.g. MP-04-HE-1234"
                              className="w-full bg-stone-900 border border-white/10 rounded-lg h-8 px-2.5 text-xs text-white focus:outline-none focus:border-[#D946C4]/30 disabled:opacity-50 font-mono"
                            />
                          </div>

                          {/* Driver Name */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] text-white/50 flex items-center gap-1">
                                <User size={10} className="text-white/40" />
                                Driver Name
                              </label>
                              <span className="flex items-center gap-1 text-[8px] font-mono text-emerald-400 uppercase">
                                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                high confidence
                              </span>
                            </div>
                            <input
                              type="text"
                              value={extractedResult.driverName || ''}
                              onChange={(e) => handleExtractedFieldChange('driverName', e.target.value)}
                              disabled={isConfirmed}
                              placeholder="e.g. Ramesh Kumar"
                              className="w-full bg-stone-900 border border-white/10 rounded-lg h-8 px-2.5 text-xs text-white focus:outline-none focus:border-[#D946C4]/30 disabled:opacity-50"
                            />
                          </div>

                          {/* Driver Phone */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] text-white/50 flex items-center gap-1 font-mono">
                                <Info size={10} className="text-white/40" />
                                Driver Phone
                              </label>
                              <span className="flex items-center gap-1 text-[8px] font-mono text-emerald-400 uppercase">
                                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                high confidence
                              </span>
                            </div>
                            <input
                              type="text"
                              value={extractedResult.driverPhone || ''}
                              onChange={(e) => handleExtractedFieldChange('driverPhone', e.target.value)}
                              disabled={isConfirmed}
                              placeholder="e.g. +91 98765 43210"
                              className="w-full bg-stone-900 border border-white/10 rounded-lg h-8 px-2.5 text-xs text-white focus:outline-none focus:border-[#D946C4]/30 disabled:opacity-50 font-mono"
                            />
                          </div>

                          {/* Load weight */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] text-white/50 flex items-center gap-1">
                                <Scale size={10} className="text-white/40" />
                                Load Weight
                              </label>
                              <span className="flex items-center gap-1 text-[8px] font-mono text-emerald-400 uppercase">
                                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                high confidence
                              </span>
                            </div>
                            <input
                              type="text"
                              value={extractedResult.weight}
                              onChange={(e) => handleExtractedFieldChange('weight', e.target.value)}
                              disabled={isConfirmed}
                              className="w-full bg-stone-900 border border-white/10 rounded-lg h-8 px-2.5 text-xs text-white focus:outline-none focus:border-[#D946C4]/30 disabled:opacity-50"
                            />
                          </div>

                          {/* Pickup Date */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] text-white/50 flex items-center gap-1">
                                <Calendar size={10} className="text-white/40" />
                                Pickup Date
                              </label>
                              <span className={`flex items-center gap-1 text-[8px] font-mono uppercase ${
                                extractedResult.confidence.pickupDate === 'high' ? 'text-emerald-400' : 'text-[#D946C4]'
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${extractedResult.confidence.pickupDate === 'high' ? 'bg-emerald-400' : 'bg-[#D946C4]'}`} />
                                {extractedResult.confidence.pickupDate} confidence
                              </span>
                            </div>
                            <input
                              type="date"
                              value={extractedResult.pickupDate}
                              onChange={(e) => handleExtractedFieldChange('pickupDate', e.target.value)}
                              disabled={isConfirmed}
                              className="w-full bg-stone-900 border border-white/10 rounded-lg h-8 px-2 text-xs text-white focus:outline-none focus:border-[#D946C4]/30 disabled:opacity-50"
                            />
                          </div>

                          {/* Notes */}
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] text-white/50 flex items-center gap-1">
                              <Info size={10} className="text-white/40" />
                              Special Instructions
                            </label>
                            <input
                              type="text"
                              value={extractedResult.notes}
                              onChange={(e) => handleExtractedFieldChange('notes', e.target.value)}
                              disabled={isConfirmed}
                              className="w-full bg-stone-900 border border-white/10 rounded-lg h-8 px-2.5 text-xs text-white focus:outline-none focus:border-[#D946C4]/30 disabled:opacity-50"
                            />
                          </div>

                        </div>
                      </div>

                      {/* CONFIRMATION CHECKBOXES & BUTTONS */}
                      {!isConfirmed ? (
                        <div className="mt-5 pt-4 border-t border-white/5 space-y-4">
                          <span className="text-[10px] font-mono text-white/40 block">AUTOMATED PIPELINE ACTIONS:</span>
                          
                          <div className="flex flex-wrap gap-4 text-xs text-white/80">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={createBooking} 
                                onChange={(e) => setCreateBooking(e.target.checked)}
                                className="rounded border-white/15 bg-white/5 text-[#D946C4] focus:ring-[#D946C4]/30 w-4 h-4 text-xs"
                              />
                              <span className="flex items-center gap-1">
                                <Calendar size={12} className="text-[#D946C4]" />
                                Create Booking
                              </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={createInvoice} 
                                onChange={(e) => setCreateInvoice(e.target.checked)}
                                className="rounded border-white/15 bg-white/5 text-[#D946C4] focus:ring-[#D946C4]/30 w-4 h-4 text-xs"
                              />
                              <span className="flex items-center gap-1">
                                <FileText size={12} className="text-[#D946C4]" />
                                Generate Invoice Draft
                              </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={createLR} 
                                onChange={(e) => setCreateLR(e.target.checked)}
                                className="rounded border-white/15 bg-white/5 text-[#D946C4] focus:ring-[#D946C4]/30 w-4 h-4 text-xs"
                              />
                              <span className="flex items-center gap-1">
                                <FileCheck size={12} className="text-[#D946C4]" />
                                Generate Lorry Receipt (LR)
                              </span>
                            </label>
                          </div>

                          <div className="flex items-center gap-3 pt-1">
                            <button
                              onClick={handleConfirmExtraction}
                              className="flex-1 h-10 rounded-xl bg-[#D946C4] hover:bg-[#D946C4]/80 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
                            >
                              <CheckCircle size={14} />
                              Confirm & Create
                            </button>
                            <button
                              onClick={handleDiscardParser}
                              className="px-4 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs transition-all cursor-pointer"
                            >
                              Discard
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* SUCCESS CONFIRMED STATE */
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-5 pt-4 border-t border-emerald-500/20 bg-emerald-500/5 -mx-5 -mb-5 p-5 space-y-4 rounded-b-2xl"
                        >
                          <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle size={18} className="shrink-0" />
                            <div className="text-xs">
                              <p className="font-semibold text-emerald-300">Operations Pipeline Dispatched successfully!</p>
                              <p className="text-[10px] text-white/50 mt-0.5">Booking created. Invoice draft ready in Documents. LR draft ready in Documents.</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {createBooking && (
                              <button
                                onClick={() => {
                                  if(setActivePage) setActivePage('todo');
                                  triggerToast("Navigating to Checklist", "Spot confirmation task queued.");
                                }}
                                className="h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <CheckSquare size={12} className="text-[#D946C4]" />
                                View Checklist
                              </button>
                            )}
                            {(createInvoice || createLR) && (
                              <button
                                onClick={() => {
                                  if(setActivePage) setActivePage('documents');
                                  triggerToast("Navigating to Documents", "Opening Invoice / LR draft modules.");
                                }}
                                className="h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <FileText size={12} className="text-[#D946C4]" />
                                View Documents
                              </button>
                            )}
                            <button
                              onClick={handleDiscardParser}
                              className="h-8 px-3 rounded-lg bg-[#D946C4] hover:bg-[#D946C4]/80 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto"
                            >
                              Parse New Message
                              <ArrowRight size={11} />
                            </button>
                          </div>
                        </motion.div>
                      )}

                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          TAB 3: GROWTH ADVISOR FEED
          ========================================== */}
      <AnimatePresence mode="wait">
        {activeTab === 'growth' && (
          <motion.div
            key="growth-tab-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Refresh Action Bar */}
            <div className="flex items-center justify-between bg-white/3 border border-white/8 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#D946C4] shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white">Continuous Intelligence Audit</p>
                  <p className="text-[10px] text-white/50">Cross-referencing fleet ledger details with external commercial freight rates</p>
                </div>
              </div>

              <button
                onClick={handleRefreshGrowth}
                disabled={isRefreshingGrowth}
                className="flex items-center gap-1.5 h-8.5 px-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={12} className={isRefreshingGrowth ? 'animate-spin' : ''} />
                Refresh Insights
              </button>
            </div>

            {/* Grid of feed-style insight cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
              {isRefreshingGrowth && (
                <div className="absolute inset-0 bg-stone-950/20 backdrop-blur-xs flex items-center justify-center z-10 rounded-2xl" />
              )}
              
              {growthInsights.map((insight, idx) => {
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.1 }}
                    className="bg-white/4 border border-white/8 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-[#D946C4]/20 transition-all group"
                  >
                    <div className="space-y-3.5">
                      {/* Icon & Title Row */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-sm">
                          {insight.icon}
                        </div>
                        <h4 className="text-xs font-bold text-white tracking-tight leading-snug group-hover:text-[#D946C4] transition-colors">
                          {insight.title}
                        </h4>
                      </div>

                      {/* Supporting Data tag */}
                      <span className="inline-block text-[10px] font-mono bg-stone-950 border border-white/5 rounded px-2 py-0.5 text-white/60">
                        {insight.supportingData}
                      </span>

                      {/* Body Description */}
                      <p className="text-xs text-white/60 leading-relaxed font-sans">
                        {insight.description}
                      </p>
                    </div>

                    {/* Suggested Action & Bidding links */}
                    <div className="mt-5 pt-4 border-t border-white/5 space-y-4">
                      <div className="bg-[#D946C4]/5 border border-[#D946C4]/10 rounded-lg p-2.5">
                        <span className="text-[9px] font-mono text-[#D946C4] font-bold uppercase block mb-0.5">Vanguard Suggestion:</span>
                        <p className="text-[11px] text-white/80 leading-relaxed">{insight.actionLabel}</p>
                      </div>

                      <button
                        onClick={() => handleJumpToChatWithQuery(insight.chatQuery)}
                        className="w-full h-8.5 rounded-lg border border-white/10 hover:border-[#D946C4]/30 hover:bg-[#D946C4]/5 text-white font-semibold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <MessageSquare size={12} className="text-[#D946C4]" />
                        Ask Assistant about this
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          TAB 4: GUIDE & HELP WALKTHROUGH
          ========================================== */}
      <AnimatePresence mode="wait">
        {activeTab === 'guide' && (
          <motion.div
            key="guide-tab-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-auto lg:h-[650px] relative"
          >
            {/* Left Column: Scrollable Guide & Help Area */}
            <div className="lg:col-span-8 flex flex-col bg-white/4 border border-white/8 rounded-2xl h-[650px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              {/* Pinned Search & Jump Chips */}
              <div className="p-5 border-b border-white/5 bg-stone-950/20 space-y-4 shrink-0">
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={guideSearchQuery}
                    onChange={(e) => setGuideSearchQuery(e.target.value)}
                    placeholder="Search the guide..."
                    className="w-full h-11 pl-10 pr-4 bg-stone-950/60 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D946C4]/40 focus:ring-1 focus:ring-[#D946C4]/40 transition-all font-sans"
                  />
                  {guideSearchQuery && (
                    <button
                      onClick={() => setGuideSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap">
                  <span className="text-[10px] uppercase font-mono text-white/30 mr-1 shrink-0">Quick Jump:</span>
                  {GUIDE_SECTIONS.map((sec) => {
                    const isActive = activeGuideSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => handleQuickJump(sec.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide transition-all border shrink-0 ${
                          isActive
                            ? 'bg-[#D946C4]/15 text-[#D946C4] border-[#D946C4]/35 font-bold shadow-sm'
                            : 'bg-white/3 text-white/60 border-white/5 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {sec.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable Main Content */}
              <div
                id="guide-scroll-container"
                className="flex-1 p-5 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-white/10 scroll-smooth"
              >
                {filteredGuideSections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
                      <Search size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">No guide sections found</p>
                      <p className="text-[11px] text-white/40 max-w-xs mt-1">
                        We couldn't find matches for "{guideSearchQuery}". Try terms like "Reference No", "Invoice", "In Transit", or "Inclusive".
                      </p>
                    </div>
                    <button
                      onClick={() => setGuideSearchQuery('')}
                      className="text-xs text-[#D946C4] hover:underline font-semibold mt-2"
                    >
                      Clear search filter
                    </button>
                  </div>
                ) : (
                  filteredGuideSections.map((sec, idx) => (
                    <motion.section
                      key={sec.id}
                      id={`guide-section-${sec.id}`}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.2) }}
                      className="space-y-4 pt-4 first:pt-0 scroll-mt-6 border-b border-white/5 pb-6 last:border-b-0 last:pb-0"
                    >
                      {/* Section Title Header */}
                      <div className="border-b border-white/5 pb-2">
                        <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                          <span className="w-1.5 h-4 rounded bg-[#D946C4]" />
                          {sec.title}
                        </h3>
                        <p className="text-xs text-white/50 leading-relaxed mt-1 font-sans">{sec.summary}</p>
                      </div>

                      {/* Visual Mockup Area */}
                      <div className="relative w-full aspect-video rounded-xl border-2 border-dashed border-white/15 bg-stone-950/45 overflow-hidden flex flex-col items-center justify-center p-4">
                        {/* Background Grid Accent */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px]" />
                        
                        {/* Abstract Nodes */}
                        <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-[#D946C4]/25 border border-[#D946C4]/40 animate-pulse" />
                        <div className="absolute top-1/3 left-1/2 w-4 h-4 rounded-full bg-[#D946C4]/15 border border-[#D946C4]/30" />
                        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-white/10" />
                        <div className="absolute bottom-1/4 right-1/4 w-3.5 h-3.5 rounded-full bg-white/5 border border-white/10" />

                        <div className="text-center z-10 select-none">
                          <span className="font-mono text-[9px] uppercase tracking-widest text-[#D946C4] font-bold block mb-1">Vanguard System UI Mockup</span>
                          <p className="text-xs font-semibold text-white/90">[{sec.screenshotLabel}]</p>
                          <p className="text-[10px] text-white/30 mt-1 font-sans">Visual component layout reference guide</p>
                        </div>

                        {/* Absolutely Positioned Callout Markers */}
                        {sec.callouts.map((c) => {
                          let top = "50%";
                          let left = "50%";
                          if (c.number === 1) { top = "22%"; left = "18%"; }
                          else if (c.number === 2) { top = "42%"; left = "78%"; }
                          else if (c.number === 3) { top = "72%"; left = "45%"; }

                          return (
                            <div
                              key={c.number}
                              style={{ top, left }}
                              className="absolute w-6 h-6 rounded-full bg-[#D946C4] text-stone-950 font-bold flex items-center justify-center text-xs shadow-lg border border-white/20 select-none animate-bounce"
                            >
                              {c.number}
                            </div>
                          );
                        })}
                      </div>

                      {/* Numbered Callout Descriptions */}
                      <div className="space-y-2.5 bg-stone-950/20 border border-white/5 rounded-xl p-4">
                        {sec.callouts.map((c) => (
                          <div key={c.number} className="flex items-start gap-3 text-xs leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-[#D946C4] font-bold flex items-center justify-center text-[10px] shrink-0">
                              {c.number}
                            </span>
                            <div>
                              <span className="font-bold text-white mr-1.5">{c.label}</span>
                              <span className="text-white/60 font-sans">{c.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Optional Field-level Logic Box */}
                      {sec.logicCallout && (
                        <div className="bg-[#D946C4]/5 border border-[#D946C4]/20 rounded-xl p-4 space-y-2.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#D946C4]">
                            <Info size={14} />
                            {sec.logicCallout.title}
                          </div>
                          <p className="text-[11px] text-white/70 leading-relaxed font-sans">
                            {sec.logicCallout.text}
                          </p>
                          <ul className="space-y-1.5 pl-1">
                            {sec.logicCallout.details.map((detail, dIdx) => (
                              <li key={dIdx} className="text-[11px] text-white/60 leading-relaxed font-sans flex items-start gap-2">
                                <span className="text-[#D946C4] font-bold shrink-0 mt-0.5">•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.section>
                  ))
                )}

                {/* Still Need Help Footer */}
                <div className="border-t border-white/5 pt-6 mt-6 pb-2">
                  <div className="bg-white/3 border border-white/8 rounded-xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">Didn't find what you needed?</h4>
                      <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                        Ask the contextual assistant on the right, or switch to the main operational assistant.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('chat')}
                      className="text-xs font-bold text-[#D946C4] hover:text-[#D946C4]/80 flex items-center gap-1 bg-[#D946C4]/10 hover:bg-[#D946C4]/15 border border-[#D946C4]/30 px-3 py-1.5 rounded-lg transition-all self-start sm:self-auto cursor-pointer"
                    >
                      Start a fresh conversation
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Persistent Contextual AI Chat Panel (Desktop) */}
            <div className="hidden lg:flex lg:col-span-4 flex-col bg-white/4 border border-white/8 rounded-2xl h-[650px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              {/* Chat Panel Header */}
              <div className="p-4 border-b border-white/5 bg-stone-950/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#D946C4]" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Guide Companion AI</h4>
                    <span className="text-[9px] font-mono font-semibold bg-[#D946C4]/10 text-[#D946C4] px-1.5 py-0.5 rounded capitalize">
                      Focus: {activeGuideSection}
                    </span>
                  </div>
                </div>
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              </div>

              {/* Suggested Questions Chips */}
              <div className="px-4 py-3 bg-stone-950/40 border-b border-white/5 shrink-0">
                <span className="text-[9px] font-mono text-white/30 uppercase block mb-1.5">Suggested Questions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentSuggestedQuestions.map((q, qidx) => (
                    <button
                      key={qidx}
                      onClick={() => handleGuideChatSubmit(q)}
                      className="text-[10px] text-white/80 hover:text-white bg-white/3 hover:bg-[#D946C4]/10 border border-white/5 hover:border-[#D946C4]/20 rounded-lg px-2.5 py-1 text-left transition-all leading-snug cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                {guideChatHistory.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2 max-w-[90%] ${
                        isUser ? 'ml-auto flex-row-reverse' : ''
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 shadow-sm border ${
                        isUser 
                          ? 'bg-white/10 text-white border-white/10' 
                          : 'bg-[#D946C4]/15 text-white border-[#D946C4]/30'
                      }`}>
                        {isUser ? <User size={10} /> : <Sparkles size={10} />}
                      </div>
                      <div className="space-y-1">
                        <div className={`p-3 rounded-xl text-[11px] whitespace-pre-wrap leading-relaxed shadow-md ${
                          isUser 
                            ? 'bg-[#D946C4]/15 border border-[#D946C4]/25 text-white rounded-tr-none' 
                            : 'bg-stone-900/90 border border-white/8 text-white/90 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                        <p className="text-[8px] text-white/30 text-right px-1 font-mono">{msg.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
                {isGuideChatTyping && (
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#D946C4]/15 text-white border border-[#D946C4]/30 flex items-center justify-center shrink-0">
                      <Sparkles size={10} className="animate-pulse" />
                    </div>
                    <div className="bg-stone-900/90 border border-white/8 p-3 rounded-xl rounded-tl-none flex items-center gap-1 h-8 shadow-md">
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={guideChatEndRef} />
              </div>

              {/* Message input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGuideChatSubmit(guideChatInput);
                }}
                className="p-3 border-t border-white/5 bg-stone-950/20 flex gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={guideChatInput}
                  onChange={(e) => setGuideChatInput(e.target.value)}
                  placeholder="Ask about app logic..."
                  className="flex-1 h-9 bg-stone-950/60 border border-white/10 rounded-lg px-3 text-[11px] text-white placeholder-white/30 focus:outline-none focus:border-[#D946C4]/40 focus:ring-1 focus:ring-[#D946C4]/40 transition-all font-sans"
                />
                <button
                  type="submit"
                  disabled={!guideChatInput.trim()}
                  className="w-9 h-9 bg-[#D946C4] hover:bg-[#c33eb0] disabled:opacity-40 text-stone-950 font-bold rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0"
                >
                  <Send size={12} />
                </button>
              </form>
            </div>

            {/* MOBILE FLOATING CHAT TRIGGER (Visible only on mobile) */}
            <div className="lg:hidden fixed bottom-6 right-6 z-40">
              <button
                type="button"
                onClick={() => setIsMobileChatOpen(true)}
                className="w-12 h-12 rounded-full bg-[#D946C4] hover:bg-[#c33eb0] text-stone-950 flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer relative"
              >
                <HelpCircle size={22} />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-stone-950"></span>
                </span>
              </button>
            </div>

            {/* MOBILE FULL-SCREEN CHAT OVERLAY */}
            <AnimatePresence>
              {isMobileChatOpen && (
                <motion.div
                  key="mobile-guide-chat"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="lg:hidden fixed inset-0 z-50 flex flex-col bg-stone-950/95 backdrop-blur-md p-4"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#D946C4]" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Guide Companion AI</h4>
                        <span className="text-[10px] font-mono bg-[#D946C4]/10 text-[#D946C4] px-1.5 py-0.5 rounded capitalize">
                          Focus: {activeGuideSection}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMobileChatOpen(false)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Suggested questions */}
                  <div className="mb-3">
                    <span className="text-[9px] font-mono text-white/30 uppercase block mb-1">Suggested Questions:</span>
                    <div className="flex flex-wrap gap-1">
                      {currentSuggestedQuestions.map((q, qidx) => (
                        <button
                          key={qidx}
                          onClick={() => {
                            handleGuideChatSubmit(q);
                          }}
                          className="text-[10px] text-white/80 hover:text-white bg-white/3 hover:bg-[#D946C4]/10 border border-white/5 rounded-lg px-2.5 py-1 text-left transition-all leading-snug cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-3 pr-1">
                    {guideChatHistory.map((msg) => {
                      const isUser = msg.sender === 'user';
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2 max-w-[90%] ${
                            isUser ? 'ml-auto flex-row-reverse' : ''
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 shadow-sm border ${
                            isUser 
                              ? 'bg-white/10 text-white border-white/10' 
                              : 'bg-[#D946C4]/15 text-white border-[#D946C4]/30'
                          }`}>
                            {isUser ? <User size={10} /> : <Sparkles size={10} />}
                          </div>
                          <div className="space-y-1">
                            <div className={`p-3 rounded-xl text-xs whitespace-pre-wrap leading-relaxed shadow-md ${
                              isUser 
                                ? 'bg-[#D946C4]/15 border border-[#D946C4]/25 text-white rounded-tr-none' 
                                : 'bg-stone-900/90 border border-white/8 text-white/90 rounded-tl-none'
                            }`}>
                              {msg.text}
                            </div>
                            <p className="text-[8px] text-white/30 text-right px-1 font-mono">{msg.timestamp}</p>
                          </div>
                        </div>
                      );
                    })}
                    {isGuideChatTyping && (
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#D946C4]/15 text-white border border-[#D946C4]/30 flex items-center justify-center shrink-0">
                          <Sparkles size={10} className="animate-pulse" />
                        </div>
                        <div className="bg-stone-900/90 border border-white/8 p-3 rounded-xl rounded-tl-none flex items-center gap-1 h-8 shadow-md">
                          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    <div ref={(el) => {
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }} />
                  </div>

                  {/* Input Bar */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleGuideChatSubmit(guideChatInput);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={guideChatInput}
                      onChange={(e) => setGuideChatInput(e.target.value)}
                      placeholder="Ask about app logic..."
                      className="flex-1 h-10 bg-stone-900 border border-white/10 rounded-xl px-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D946C4]/40"
                    />
                    <button
                      type="submit"
                      disabled={!guideChatInput.trim()}
                      className="w-10 h-10 bg-[#D946C4] text-stone-950 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
