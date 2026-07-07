import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Building2, 
  FileText, 
  Bell, 
  Sparkles, 
  Truck, 
  Palette, 
  ShieldAlert, 
  Camera, 
  Save, 
  Check, 
  ExternalLink, 
  Lock, 
  LogOut, 
  Database, 
  AlertTriangle, 
  Trash2, 
  Globe, 
  RefreshCw, 
  Sliders, 
  Plus,
  ArrowRight,
  Shield,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageId } from '../types';

interface SettingsPageProps {
  setActivePage: (page: PageId) => void;
}

interface ProfileState {
  avatar: string;
  name: string;
  role: string;
  phone: string;
  email: string;
}

interface BusinessState {
  companyName: string;
  companyLogo: string;
  gstNumber: string;
  registeredAddress: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankName: string;
}

interface DocPrefState {
  defaultGst: number;
  invoicePrefix: string;
  defaultTerms: string;
  autoIncrementInvoice: boolean;
}

interface NotificationState {
  overdueInvoices: boolean;
  paymentReceived: boolean;
  bookingReminders: boolean;
  aiInsights: boolean;
  defaultReminderTiming: string;
}

interface AiState {
  documentApproval: 'auto' | 'ask';
  translationLanguage: 'english' | 'hindi' | 'hinglish';
  advisorFrequency: 'daily' | 'weekly';
  connectedWhatsapp: string;
}

export default function SettingsPage({ setActivePage }: SettingsPageProps) {
  // Navigation Sections definition
  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'business', label: 'Business Details', icon: Building2 },
    { id: 'documents', label: 'Document Preferences', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles },
    { id: 'fleet', label: 'Fleet & Routes', icon: Truck },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'account', label: 'Account & Security', icon: ShieldAlert },
  ];

  const [activeSection, setActiveSection] = useState('profile');
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // Load States from LocalStorage or Defaults
  const [profile, setProfile] = useState<ProfileState>(() => {
    const saved = localStorage.getItem('vanguard_settings_profile');
    return saved ? JSON.parse(saved) : {
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
      name: 'Vikram Singh',
      role: 'Fleet Operator',
      phone: '+91 98765 43210',
      email: 'vikram.singh@vanguardlogistics.com'
    };
  });

  const [business, setBusiness] = useState<BusinessState>(() => {
    const saved = localStorage.getItem('vanguard_settings_business');
    return saved ? JSON.parse(saved) : {
      companyName: 'Vanguard Logistics Private Limited',
      companyLogo: '',
      gstNumber: '07AAAAV9821A1Z0',
      registeredAddress: 'Plot No. 42, Sector 18, Gurugram, Haryana - 122015',
      bankAccountName: 'Vanguard Logistics Pvt Ltd',
      bankAccountNumber: '50200049281034',
      bankIfsc: 'HDFC0000124',
      bankName: 'HDFC Bank Ltd'
    };
  });

  const [docPref, setDocPref] = useState<DocPrefState>(() => {
    const saved = localStorage.getItem('vanguard_settings_doc_pref');
    return saved ? JSON.parse(saved) : {
      defaultGst: 18,
      invoicePrefix: 'INV-',
      defaultTerms: '1. Goods are carried strictly at owner\'s risk.\n2. Demurrage charges of ₹2,000/day apply if truck is detained over 24 hours.\n3. Balance payment must be cleared within 15 days of unloading.\n4. All disputes are subject to Delhi jurisdiction only.',
      autoIncrementInvoice: true
    };
  });

  const [notifications, setNotifications] = useState<NotificationState>(() => {
    const saved = localStorage.getItem('vanguard_settings_notifications');
    return saved ? JSON.parse(saved) : {
      overdueInvoices: true,
      paymentReceived: true,
      bookingReminders: true,
      aiInsights: false,
      defaultReminderTiming: '1day'
    };
  });

  const [ai, setAi] = useState<AiState>(() => {
    const saved = localStorage.getItem('vanguard_settings_ai');
    return saved ? JSON.parse(saved) : {
      documentApproval: 'ask',
      translationLanguage: 'hinglish',
      advisorFrequency: 'weekly',
      connectedWhatsapp: '+91 98120 54321'
    };
  });

  const [fleetTypes, setFleetTypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('vanguard_settings_fleet_types');
    return saved ? JSON.parse(saved) : ['407', 'Eicher 14ft', 'Eicher 19ft', '22ft Container', '32ft Multi-Axle'];
  });

  const [glowIntensity, setGlowIntensity] = useState(() => {
    return localStorage.getItem('vanguard_glow_intensity') || 'balanced';
  });

  // Track Changes to show/enable "Save Changes" buttons dynamically
  const [savedProfile, setSavedProfile] = useState<ProfileState>(profile);
  const [savedBusiness, setSavedBusiness] = useState<BusinessState>(business);
  const [savedDocPref, setSavedDocPref] = useState<DocPrefState>(docPref);
  const [savedNotifications, setSavedNotifications] = useState<NotificationState>(notifications);
  const [savedAi, setSavedAi] = useState<AiState>(ai);
  const [savedFleetTypes, setSavedFleetTypes] = useState<string[]>(fleetTypes);

  // Password fields state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  // Custom Tag input for fleet types
  const [newFleetTag, setNewFleetTag] = useState('');

  // Confirmation Modals State
  const [activeModal, setActiveModal] = useState<'clear_data' | 'delete_account' | 'change_whatsapp' | null>(null);
  const [tempWhatsapp, setTempWhatsapp] = useState(ai.connectedWhatsapp);

  // Success states for Inline Save Animations (Brief checkmark next to the buttons)
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'saved'>>({
    profile: 'idle',
    business: 'idle',
    documents: 'idle',
    notifications: 'idle',
    ai: 'idle',
    fleet: 'idle',
    password: 'idle'
  });

  // Apply Background Glow effect instantly
  const updateGlowInDOM = (intensity: string) => {
    const root = document.documentElement;
    if (intensity === 'subtle') {
      root.style.setProperty('--bg-radial-opacity-1', '0.15');
      root.style.setProperty('--bg-radial-opacity-2', '0.25');
      root.style.setProperty('--bg-radial-opacity-3', '0.55');
      root.style.setProperty('--bg-glow-opacity', '0.05');
    } else if (intensity === 'vivid') {
      root.style.setProperty('--bg-radial-opacity-1', '0.55');
      root.style.setProperty('--bg-radial-opacity-2', '0.75');
      root.style.setProperty('--bg-radial-opacity-3', '0.95');
      root.style.setProperty('--bg-glow-opacity', '0.20');
    } else { // balanced
      root.style.setProperty('--bg-radial-opacity-1', '0.35');
      root.style.setProperty('--bg-radial-opacity-2', '0.55');
      root.style.setProperty('--bg-radial-opacity-3', '0.85');
      root.style.setProperty('--bg-glow-opacity', '0.10');
    }
  };

  // Trigger brief inline success animation
  const triggerSaveSuccess = (sectionKey: string) => {
    setSaveStatus(prev => ({ ...prev, [sectionKey]: 'saved' }));
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, [sectionKey]: 'idle' }));
    }, 2500);
  };

  // Scroll Spy: Highlight nav item based on scroll position of right side
  useEffect(() => {
    const panel = rightPanelRef.current;
    if (!panel) return;

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollPosition = panel.scrollTop + panel.clientHeight / 3;
      
      for (const section of sections) {
        const el = document.getElementById(`section-${section.id}`);
        if (el) {
          const offsetTop = el.offsetTop;
          const offsetHeight = el.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    panel.addEventListener('scroll', handleScroll, { passive: true });
    return () => panel.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll handler on section click
  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    const panel = rightPanelRef.current;
    
    if (element && panel) {
      isScrollingRef.current = true;
      panel.scrollTo({
        top: element.offsetTop - 16,
        behavior: 'smooth'
      });
      // Allow scroll spy to resume once scrolling finishes
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  };

  // Avatar Upload Handler (Base64 file reader)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Business Logo Upload Handler (Base64 file reader)
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusiness(prev => ({ ...prev, companyLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Individual Form Save Handlers
  const handleSaveProfile = () => {
    localStorage.setItem('vanguard_settings_profile', JSON.stringify(profile));
    setSavedProfile(profile);
    triggerSaveSuccess('profile');
  };

  const handleSaveBusiness = () => {
    localStorage.setItem('vanguard_settings_business', JSON.stringify(business));
    setSavedBusiness(business);
    triggerSaveSuccess('business');
  };

  const handleSaveDocuments = () => {
    localStorage.setItem('vanguard_settings_doc_pref', JSON.stringify(docPref));
    setSavedDocPref(docPref);
    triggerSaveSuccess('documents');
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('vanguard_settings_notifications', JSON.stringify(notifications));
    setSavedNotifications(notifications);
    triggerSaveSuccess('notifications');
  };

  const handleSaveAi = () => {
    localStorage.setItem('vanguard_settings_ai', JSON.stringify(ai));
    setSavedAi(ai);
    triggerSaveSuccess('ai');
  };

  const handleSaveFleet = () => {
    localStorage.setItem('vanguard_settings_fleet_types', JSON.stringify(fleetTypes));
    setSavedFleetTypes(fleetTypes);
    triggerSaveSuccess('fleet');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(prev => ({ ...prev, password: 'saving' }));
    
    setTimeout(() => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      triggerSaveSuccess('password');
    }, 1000);
  };

  // Custom fleet list modifications
  const handleAddFleetTag = () => {
    const tag = newFleetTag.trim();
    if (tag && !fleetTypes.includes(tag)) {
      setFleetTypes(prev => [...prev, tag]);
    }
    setNewFleetTag('');
  };

  const handleRemoveFleetTag = (tagToRemove: string) => {
    setFleetTypes(prev => prev.filter(t => t !== tagToRemove));
  };

  // Appearance glow intensity adjustments
  const handleGlowChange = (intensity: string) => {
    setGlowIntensity(intensity);
    localStorage.setItem('vanguard_glow_intensity', intensity);
    updateGlowInDOM(intensity);
  };

  // Mock Export Data (real file creation & dynamic browser download)
  const handleExportData = () => {
    const consolidatedState = {
      profile,
      business,
      docPref,
      notifications,
      ai,
      fleetTypes,
      glowIntensity,
      exportedAt: new Date().toISOString(),
      platform: 'Vanguard Logistics ERP'
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(consolidatedState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vanguard_settings_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Danger actions execution
  const handleClearAllData = () => {
    localStorage.removeItem('vanguard_settings_profile');
    localStorage.removeItem('vanguard_settings_business');
    localStorage.removeItem('vanguard_settings_doc_pref');
    localStorage.removeItem('vanguard_settings_notifications');
    localStorage.removeItem('vanguard_settings_ai');
    localStorage.removeItem('vanguard_settings_fleet_types');
    localStorage.removeItem('vanguard_glow_intensity');
    
    // Also reset App states back to pristine
    setProfile({
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
      name: 'Vikram Singh',
      role: 'Fleet Operator',
      phone: '+91 98765 43210',
      email: 'vikram.singh@vanguardlogistics.com'
    });
    setBusiness({
      companyName: 'Vanguard Logistics Private Limited',
      companyLogo: '',
      gstNumber: '07AAAAV9821A1Z0',
      registeredAddress: 'Plot No. 42, Sector 18, Gurugram, Haryana - 122015',
      bankAccountName: 'Vanguard Logistics Pvt Ltd',
      bankAccountNumber: '50200049281034',
      bankIfsc: 'HDFC0000124',
      bankName: 'HDFC Bank Ltd'
    });
    setDocPref({
      defaultGst: 18,
      invoicePrefix: 'INV-',
      defaultTerms: '1. Goods are carried strictly at owner\'s risk.\n2. Demurrage charges of ₹2,000/day apply if truck is detained over 24 hours.\n3. Balance payment must be cleared within 15 days of unloading.\n4. All disputes are subject to Delhi jurisdiction only.',
      autoIncrementInvoice: true
    });
    setNotifications({
      overdueInvoices: true,
      paymentReceived: true,
      bookingReminders: true,
      aiInsights: false,
      defaultReminderTiming: '1day'
    });
    setAi({
      documentApproval: 'ask',
      translationLanguage: 'hinglish',
      advisorFrequency: 'weekly',
      connectedWhatsapp: '+91 98120 54321'
    });
    setFleetTypes(['407', 'Eicher 14ft', 'Eicher 19ft', '22ft Container', '32ft Multi-Axle']);
    setGlowIntensity('balanced');
    updateGlowInDOM('balanced');
    setActiveModal(null);

    // Let the page fade in and highlight Saved
    alert("All settings and mock data have been successfully restored to factory defaults.");
    window.location.reload();
  };

  const handleDeleteAccount = () => {
    setActiveModal(null);
    alert("This account has been flagged for termination. Since this is a client demonstration instance, you will be automatically redirected to the dashboard.");
    setActivePage('dashboard');
  };

  const handleSaveWhatsapp = () => {
    setAi(prev => ({ ...prev, connectedWhatsapp: tempWhatsapp }));
    setActiveModal(null);
  };

  // Helper change detection values
  const hasProfileChanged = JSON.stringify(profile) !== JSON.stringify(savedProfile);
  const hasBusinessChanged = JSON.stringify(business) !== JSON.stringify(savedBusiness);
  const hasDocPrefChanged = JSON.stringify(docPref) !== JSON.stringify(savedDocPref);
  const hasNotificationsChanged = JSON.stringify(notifications) !== JSON.stringify(savedNotifications);
  const hasAiChanged = JSON.stringify(ai) !== JSON.stringify(savedAi);
  const hasFleetChanged = JSON.stringify(fleetTypes) !== JSON.stringify(savedFleetTypes);

  // Styling helpers
  const glassPanelClass = "bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all duration-300";
  const subHeadingClass = "text-[11px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2 mb-4 font-display";
  const inputContainerClass = "space-y-1";
  const labelClass = "block text-[10px] uppercase tracking-wider font-semibold text-white/50";
  const inputClass = "w-full bg-stone-950/60 border border-white/10 rounded-xl h-10 px-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D946C4]/40 focus:ring-1 focus:ring-[#D946C4]/10 font-sans transition-all";
  const textareaClass = "w-full bg-stone-950/60 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D946C4]/40 focus:ring-1 focus:ring-[#D946C4]/10 font-sans h-24 transition-all resize-none";

  return (
    <div className="flex flex-col flex-1 pb-16 relative h-full">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold font-display text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="text-[#D946C4]" size={20} /> System Configurations
          </h2>
          <p className="text-xs text-white/50">Manage operational, billing, and system parameters feeding document templates & AI insights</p>
        </div>
      </div>

      {/* Main Two-Column Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 h-auto lg:h-[calc(100vh-180px)] overflow-visible lg:overflow-hidden">
        
        {/* Left Sub-Navigation Sidebar */}
        <div className="lg:col-span-3 flex lg:flex-col gap-1 bg-white/[0.02] border border-white/5 rounded-2xl p-2.5 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto scrollbar-none h-fit lg:h-full">
          {sections.map((sect) => {
            const IconComponent = sect.icon;
            const isActive = activeSection === sect.id;
            return (
              <button
                key={sect.id}
                onClick={() => handleSectionClick(sect.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-medium whitespace-nowrap transition-all duration-200 relative group cursor-pointer ${
                  isActive 
                    ? 'text-white bg-white/[0.06] border-l-2 border-[#D946C4] shadow-md font-semibold' 
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.02]'
                }`}
              >
                <IconComponent 
                  size={16} 
                  className={`transition-colors duration-200 ${isActive ? 'text-[#D946C4]' : 'text-white/40 group-hover:text-white/60'}`} 
                />
                <span>{sect.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-[#D946C4]/80"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scrollable Settings Form panel */}
        <div 
          id="settings-right-panel"
          ref={rightPanelRef}
          className="lg:col-span-9 overflow-y-auto space-y-6 pr-1.5 scroll-smooth h-auto lg:h-full"
        >
          
          {/* 1. PROFILE SECTION */}
          <section id="section-profile" className={glassPanelClass}>
            <h4 className={subHeadingClass}>
              <User size={13} className="text-[#D946C4]" /> Operator Profile
            </h4>
            
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Circular Avatar Upload */}
              <div className="relative group cursor-pointer w-20 h-20 rounded-full border border-white/10 overflow-hidden shrink-0 self-center sm:self-start">
                <img 
                  src={profile.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 bg-stone-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer text-[10px] text-white/90">
                  <Camera size={16} className="text-[#D946C4] mb-1" />
                  <span>Update</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                  />
                </label>
              </div>

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
                <div className={inputContainerClass}>
                  <label className={labelClass}>Full Name</label>
                  <input 
                    type="text" 
                    className={inputClass}
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className={inputContainerClass}>
                  <label className={labelClass}>Role / Title</label>
                  <input 
                    type="text" 
                    className={inputClass}
                    value={profile.role}
                    onChange={(e) => setProfile(prev => ({ ...prev, role: e.target.value }))}
                  />
                </div>
                <div className={inputContainerClass}>
                  <label className={labelClass}>Phone Number</label>
                  <input 
                    type="text" 
                    className={inputClass}
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className={inputContainerClass}>
                  <label className={labelClass}>Email Address</label>
                  <input 
                    type="email" 
                    className={inputClass}
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Profile Action button */}
            <div className="mt-6 flex items-center justify-end border-t border-white/5 pt-4">
              <AnimatePresence mode="wait">
                {hasProfileChanged && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-[11px] text-white/40">You have unsaved changes</span>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saveStatus.profile === 'saving'}
                      className="h-9 px-4 rounded-xl bg-[#D946C4] hover:bg-[#D946C4]/80 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#D946C4]/10 cursor-pointer active:scale-95 transition-all"
                    >
                      <Save size={13} />
                      Save Changes
                    </button>
                  </motion.div>
                )}
                {!hasProfileChanged && saveStatus.profile === 'saved' && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"
                  >
                    <Check size={14} className="animate-bounce" />
                    Profile settings updated
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* 2. BUSINESS DETAILS SECTION */}
          <section id="section-business" className={glassPanelClass}>
            <h4 className={subHeadingClass}>
              <Building2 size={13} className="text-[#D946C4]" /> Business Details
            </h4>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`${inputContainerClass} sm:col-span-2`}>
                  <label className={labelClass}>Company Legal Name</label>
                  <input 
                    type="text" 
                    className={inputClass}
                    value={business.companyName}
                    onChange={(e) => setBusiness(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                <div className={inputContainerClass}>
                  <label className={labelClass}>GSTIN / Tax ID</label>
                  <input 
                    type="text" 
                    className={inputClass}
                    value={business.gstNumber}
                    onChange={(e) => setBusiness(prev => ({ ...prev, gstNumber: e.target.value }))}
                  />
                </div>
              </div>

              {/* Registered Address */}
              <div className={inputContainerClass}>
                <label className={labelClass}>Registered Office Address</label>
                <textarea 
                  className={textareaClass}
                  value={business.registeredAddress}
                  onChange={(e) => setBusiness(prev => ({ ...prev, registeredAddress: e.target.value }))}
                />
              </div>

              {/* Company Logo Upload & Live Letterhead Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center bg-stone-950/40 p-4 rounded-xl border border-white/5">
                <div className="md:col-span-1 space-y-2">
                  <label className={labelClass}>Company Logo</label>
                  <div className="flex items-center gap-3">
                    <button className="relative h-9 px-3.5 rounded-xl border border-white/15 hover:border-white/25 text-white/80 hover:text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all">
                      <Camera size={14} />
                      Choose Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoChange}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                    </button>
                    {business.companyLogo && (
                      <button 
                        onClick={() => setBusiness(prev => ({ ...prev, companyLogo: '' }))}
                        className="text-[10px] text-red-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-white/30">Used on all system-generated Invoice & LR letterheads</p>
                </div>

                <div className="md:col-span-2 border border-dashed border-white/10 rounded-lg p-3 bg-stone-950/80">
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-white/20 mb-1.5">Invoice Letterhead Preview</span>
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                      {business.companyLogo ? (
                        <img src={business.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-[#D946C4]/70 font-bold font-display">VL</span>
                      )}
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold text-white leading-tight truncate max-w-[200px]">{business.companyName || 'Your Company Name'}</h5>
                      <p className="text-[8px] text-white/40 leading-none mt-0.5 font-mono">GSTIN: {business.gstNumber || 'PENDING'}</p>
                      <p className="text-[8px] text-white/30 truncate max-w-[200px] mt-0.5">{business.registeredAddress || 'No Address registered'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Account Details */}
              <div className="space-y-3.5 pt-2 border-t border-white/5">
                <span className="block text-[10px] uppercase tracking-wider font-bold text-[#D946C4]/60">Bank Details for Ledger Collections</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={inputContainerClass}>
                    <label className={labelClass}>Account Holder</label>
                    <input 
                      type="text" 
                      className={inputClass}
                      value={business.bankAccountName}
                      onChange={(e) => setBusiness(prev => ({ ...prev, bankAccountName: e.target.value }))}
                    />
                  </div>
                  <div className={inputContainerClass}>
                    <label className={labelClass}>Account Number</label>
                    <input 
                      type="text" 
                      className={inputClass}
                      value={business.bankAccountNumber}
                      onChange={(e) => setBusiness(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                    />
                  </div>
                  <div className={inputContainerClass}>
                    <label className={labelClass}>Bank IFSC</label>
                    <input 
                      type="text" 
                      className={inputClass}
                      value={business.bankIfsc}
                      onChange={(e) => setBusiness(prev => ({ ...prev, bankIfsc: e.target.value }))}
                    />
                  </div>
                  <div className={inputContainerClass}>
                    <label className={labelClass}>Bank Name</label>
                    <input 
                      type="text" 
                      className={inputClass}
                      value={business.bankName}
                      onChange={(e) => setBusiness(prev => ({ ...prev, bankName: e.target.value }))}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-white/40 italic mt-1 font-sans">
                  * Note: These details are automatically appended onto all billing receipts, invoices, and LRs generated for clients.
                </p>
              </div>
            </div>

            {/* Business action save button */}
            <div className="mt-6 flex items-center justify-end border-t border-white/5 pt-4">
              <AnimatePresence mode="wait">
                {hasBusinessChanged && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-[11px] text-white/40">You have unsaved changes</span>
                    <button
                      onClick={handleSaveBusiness}
                      disabled={saveStatus.business === 'saving'}
                      className="h-9 px-4 rounded-xl bg-[#D946C4] hover:bg-[#D946C4]/80 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#D946C4]/10 cursor-pointer active:scale-95 transition-all"
                    >
                      <Save size={13} />
                      Save Details
                    </button>
                  </motion.div>
                )}
                {!hasBusinessChanged && saveStatus.business === 'saved' && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"
                  >
                    <Check size={14} className="animate-bounce" />
                    Business parameters preserved
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* 3. DOCUMENT PREFERENCES SECTION */}
          <section id="section-documents" className={glassPanelClass}>
            <h4 className={subHeadingClass}>
              <FileText size={13} className="text-[#D946C4]" /> Document Preferences
            </h4>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={inputContainerClass}>
                  <label className={labelClass}>Default GST Rate (%)</label>
                  <input 
                    type="number" 
                    className={inputClass}
                    value={docPref.defaultGst}
                    onChange={(e) => setDocPref(prev => ({ ...prev, defaultGst: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className={inputContainerClass}>
                  <label className={labelClass}>Invoice Number Prefix</label>
                  <input 
                    type="text" 
                    className={inputClass}
                    value={docPref.invoicePrefix}
                    onChange={(e) => setDocPref(prev => ({ ...prev, invoicePrefix: e.target.value }))}
                  />
                </div>
                <div className="bg-stone-950/60 border border-white/5 rounded-xl p-3 flex flex-col justify-center">
                  <span className="block text-[8px] uppercase tracking-wider font-semibold text-white/30 leading-none mb-1">Generated Sample Preview</span>
                  <div className="text-[13px] font-mono font-bold text-[#D946C4] flex items-center gap-1 leading-none mt-1">
                    {docPref.invoicePrefix || 'PREFIX-'}1043
                  </div>
                </div>
              </div>

              {/* Default Terms Textarea */}
              <div className={inputContainerClass}>
                <label className={labelClass}>Default Invoice Terms & Conditions</label>
                <textarea 
                  className={`${textareaClass} h-32`}
                  value={docPref.defaultTerms}
                  onChange={(e) => setDocPref(prev => ({ ...prev, defaultTerms: e.target.value }))}
                />
              </div>

              {/* Auto Increment Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-stone-950/40 border border-white/5 rounded-xl">
                <div>
                  <span className="block text-xs font-semibold text-white/95">Auto-increment invoice numbers</span>
                  <span className="block text-[10px] text-white/40">Keep sequentially numbering drafts automatically (e.g. 1043 → 1044)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDocPref(prev => ({ ...prev, autoIncrementInvoice: !prev.autoIncrementInvoice }))}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 flex items-center cursor-pointer ${
                    docPref.autoIncrementInvoice ? 'bg-[#D946C4]' : 'bg-white/10'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 rounded-full bg-stone-950 shadow-md transform transition-transform duration-300 ${
                      docPref.autoIncrementInvoice ? 'translate-x-5' : 'translate-x-0'
                    }`} 
                  />
                </button>
              </div>
            </div>

            {/* Document preferences action save */}
            <div className="mt-6 flex items-center justify-end border-t border-white/5 pt-4">
              <AnimatePresence mode="wait">
                {hasDocPrefChanged && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-[11px] text-white/40">You have unsaved changes</span>
                    <button
                      onClick={handleSaveDocuments}
                      className="h-9 px-4 rounded-xl bg-[#D946C4] hover:bg-[#D946C4]/80 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#D946C4]/10 cursor-pointer active:scale-95 transition-all"
                    >
                      <Save size={13} />
                      Save Preferences
                    </button>
                  </motion.div>
                )}
                {!hasDocPrefChanged && saveStatus.documents === 'saved' && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"
                  >
                    <Check size={14} className="animate-bounce" />
                    Billing parameters locked
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* 4. NOTIFICATIONS SECTION */}
          <section id="section-notifications" className={glassPanelClass}>
            <h4 className={subHeadingClass}>
              <Bell size={13} className="text-[#D946C4]" /> Notification Dispatchers
            </h4>

            <div className="space-y-4">
              <div className="space-y-3.5">
                {[
                  {
                    id: 'overdueInvoices',
                    label: 'Overdue invoice alerts',
                    desc: 'Receive alerts when an invoice remains outstanding past its custom due date.'
                  },
                  {
                    id: 'paymentReceived',
                    label: 'Payment received alerts',
                    desc: 'Instant notifications when clients clear outstanding balance ledgers.'
                  },
                  {
                    id: 'bookingReminders',
                    label: 'Booking & Dispatch reminders',
                    desc: 'Pre-dispatch warnings for pending fleet route slots and driver logs.'
                  },
                  {
                    id: 'aiInsights',
                    label: 'AI-suggested profit insights',
                    desc: 'Weekly rate optimization alerts generated by the Vanguard analysis engine.'
                  }
                ].map((item) => {
                  const key = item.id as keyof NotificationState;
                  return (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-stone-950/30 border border-white/5 rounded-xl hover:bg-stone-950/50 transition-all duration-200"
                    >
                      <div className="pr-4">
                        <span className="block text-xs font-semibold text-white/90">{item.label}</span>
                        <span className="block text-[10px] text-white/40">{item.desc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                        className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 flex items-center shrink-0 cursor-pointer ${
                          notifications[key] ? 'bg-[#D946C4]' : 'bg-white/15'
                        }`}
                      >
                        <div 
                          className={`w-4.5 h-4.5 rounded-full bg-stone-950 shadow-md transform transition-transform duration-300 ${
                            notifications[key] ? 'translate-x-4.5' : 'translate-x-0'
                          }`} 
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Default Reminder timing dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-stone-950/40 p-4 border border-white/5 rounded-xl mt-2">
                <div>
                  <span className="block text-xs font-semibold text-white/95">Default reminder timing</span>
                  <span className="block text-[10px] text-white/40">When schedule triggers should fire for bookings</span>
                </div>
                <div>
                  <select
                    className="w-full bg-stone-900 border border-white/10 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/40 font-medium cursor-pointer"
                    value={notifications.defaultReminderTiming}
                    onChange={(e) => setNotifications(prev => ({ ...prev, defaultReminderTiming: e.target.value }))}
                  >
                    <option value="1hour">1 hour before</option>
                    <option value="morning">Morning of</option>
                    <option value="1day">1 day before</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification save */}
            <div className="mt-6 flex items-center justify-end border-t border-white/5 pt-4">
              <AnimatePresence mode="wait">
                {hasNotificationsChanged && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-[11px] text-white/40">You have unsaved changes</span>
                    <button
                      onClick={handleSaveNotifications}
                      className="h-9 px-4 rounded-xl bg-[#D946C4] hover:bg-[#D946C4]/80 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#D946C4]/10 cursor-pointer active:scale-95 transition-all"
                    >
                      <Save size={13} />
                      Save Dispatchers
                    </button>
                  </motion.div>
                )}
                {!hasNotificationsChanged && saveStatus.notifications === 'saved' && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"
                  >
                    <Check size={14} className="animate-bounce" />
                    Alert thresholds customized
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* 5. AI ASSISTANT SECTION */}
          <section id="section-ai" className={glassPanelClass}>
            <h4 className={subHeadingClass}>
              <Sparkles size={13} className="text-[#D946C4]" /> AI Assistant Controls
            </h4>

            <div className="space-y-4">
              {/* Document Confirmation toggle (two options choice card) */}
              <div className="space-y-2">
                <label className={labelClass}>WhatsApp Document Generation Control</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setAi(prev => ({ ...prev, documentApproval: 'auto' }))}
                    className={`p-4 rounded-xl text-left border transition-all relative group cursor-pointer ${
                      ai.documentApproval === 'auto'
                        ? 'bg-[#D946C4]/10 border-[#D946C4]/50 text-white shadow-md'
                        : 'bg-stone-950/40 border-white/10 text-white/60 hover:text-white/80 hover:bg-stone-950/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-display">Auto-create from Chat</span>
                      {ai.documentApproval === 'auto' && <Check size={14} className="text-[#D946C4]" />}
                    </div>
                    <span className="block text-[10px] text-white/40 mt-1.5 font-sans leading-relaxed">
                      Frictionless automation. The Vanguard parser directly converts WhatsApp loads into pending drafts instantly.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAi(prev => ({ ...prev, documentApproval: 'ask' }))}
                    className={`p-4 rounded-xl text-left border transition-all relative group cursor-pointer ${
                      ai.documentApproval === 'ask'
                        ? 'bg-[#D946C4]/10 border-[#D946C4]/50 text-white shadow-md'
                        : 'bg-stone-950/40 border-white/10 text-white/60 hover:text-white/80 hover:bg-stone-950/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-display">Always Ask First</span>
                      {ai.documentApproval === 'ask' && <Check size={14} className="text-[#D946C4]" />}
                    </div>
                    <span className="block text-[10px] text-white/40 mt-1.5 font-sans leading-relaxed">
                      Maximum verification. Holds draft generation in the streams until you click confirm for each parsed load.
                    </span>
                  </button>
                </div>
              </div>

              {/* Understood As Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className={inputContainerClass}>
                  <label className={labelClass}>Default translation language</label>
                  <select
                    className="w-full bg-stone-900 border border-white/10 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/40 font-medium cursor-pointer"
                    value={ai.translationLanguage}
                    onChange={(e) => setAi(prev => ({ ...prev, translationLanguage: e.target.value as any }))}
                  >
                    <option value="english">English (Standard)</option>
                    <option value="hindi">Hindi (हिंदी)</option>
                    <option value="hinglish">Hinglish-as-is (Mix of Hindi & English)</option>
                  </select>
                </div>

                <div className={inputContainerClass}>
                  <label className={labelClass}>Growth Advisor refresh frequency</label>
                  <div className="grid grid-cols-2 bg-stone-950 p-1 rounded-xl border border-white/5 h-10">
                    <button
                      type="button"
                      onClick={() => setAi(prev => ({ ...prev, advisorFrequency: 'daily' }))}
                      className={`text-[10px] font-semibold uppercase tracking-wider rounded-lg cursor-pointer ${
                        ai.advisorFrequency === 'daily'
                          ? 'bg-[#D946C4] text-white font-bold'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      Daily
                    </button>
                    <button
                      type="button"
                      onClick={() => setAi(prev => ({ ...prev, advisorFrequency: 'weekly' }))}
                      className={`text-[10px] font-semibold uppercase tracking-wider rounded-lg cursor-pointer ${
                        ai.advisorFrequency === 'weekly'
                          ? 'bg-[#D946C4] text-white font-bold'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      Weekly
                    </button>
                  </div>
                </div>
              </div>

              {/* Whatsapp detail */}
              <div className="bg-stone-950/40 border border-white/5 rounded-xl p-3.5 flex items-center justify-between text-xs mt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-white/40">Connected WhatsApp Gateway:</span>
                  <span className="font-mono font-bold text-white/90">{ai.connectedWhatsapp}</span>
                </div>
                <button
                  onClick={() => {
                    setTempWhatsapp(ai.connectedWhatsapp);
                    setActiveModal('change_whatsapp');
                  }}
                  className="text-[#D946C4] hover:text-[#D946C4]/80 font-semibold text-[11px] underline cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>

            {/* AI save action */}
            <div className="mt-6 flex items-center justify-end border-t border-white/5 pt-4">
              <AnimatePresence mode="wait">
                {hasAiChanged && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-[11px] text-white/40">You have unsaved changes</span>
                    <button
                      onClick={handleSaveAi}
                      className="h-9 px-4 rounded-xl bg-[#D946C4] hover:bg-[#D946C4]/80 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#D946C4]/10 cursor-pointer active:scale-95 transition-all"
                    >
                      <Save size={13} />
                      Save AI Config
                    </button>
                  </motion.div>
                )}
                {!hasAiChanged && saveStatus.ai === 'saved' && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"
                  >
                    <Check size={14} className="animate-bounce" />
                    Neural parameters calibrated
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* 6. FLEET & ROUTES SECTION */}
          <section id="section-fleet" className={glassPanelClass}>
            <h4 className={subHeadingClass}>
              <Truck size={13} className="text-[#D946C4]" /> Active Fleet Models
            </h4>

            <div className="space-y-4">
              <p className="text-[11px] text-white/50">
                Configure the truck specifications you physically utilize. This regulates options populated in booking templates, quotations, and document selectors.
              </p>

              {/* Tag Selection container */}
              <div className="flex flex-wrap gap-2 bg-stone-950/40 p-4 rounded-xl border border-white/5">
                {fleetTypes.map((type) => (
                  <div
                    key={type}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono text-white transition-all group"
                  >
                    <span>{type}</span>
                    <button
                      onClick={() => handleRemoveFleetTag(type)}
                      className="text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove model"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Tag Inline addition form */}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="E.g. 10 Wheeler"
                    className="bg-stone-950 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D946C4]/30 w-32"
                    value={newFleetTag}
                    onChange={(e) => setNewFleetTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFleetTag();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddFleetTag}
                    className="p-1 rounded-xl bg-white/5 hover:bg-[#D946C4] hover:text-white text-white transition-all cursor-pointer"
                    title="Add truck type"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Quotations Shortcut Card */}
              <button
                onClick={() => setActivePage('quotations')}
                className="w-full text-left p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-[#D946C4]/20 rounded-xl flex items-center justify-between transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#D946C4]/10 flex items-center justify-center text-[#D946C4] group-hover:scale-110 transition-transform">
                    <Database size={16} />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-white/90">Manage Standard Rates (Price Matrix)</span>
                    <span className="block text-[10px] text-white/40">Adjust base costs, detention terms, and route rate parameters</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-white/30 group-hover:text-[#D946C4] group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            {/* Fleet action save */}
            <div className="mt-6 flex items-center justify-end border-t border-white/5 pt-4">
              <AnimatePresence mode="wait">
                {hasFleetChanged && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-[11px] text-white/40">You have unsaved changes</span>
                    <button
                      onClick={handleSaveFleet}
                      className="h-9 px-4 rounded-xl bg-[#D946C4] hover:bg-[#D946C4]/80 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#D946C4]/10 cursor-pointer active:scale-95 transition-all"
                    >
                      <Save size={13} />
                      Save Fleet Configuration
                    </button>
                  </motion.div>
                )}
                {!hasFleetChanged && saveStatus.fleet === 'saved' && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"
                  >
                    <Check size={14} className="animate-bounce" />
                    Fleet profiles standardized
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* 7. APPEARANCE SECTION */}
          <section id="section-appearance" className={glassPanelClass}>
            <h4 className={subHeadingClass}>
              <Palette size={13} className="text-[#D946C4]" /> Interface Appearance
            </h4>

            <div className="space-y-5">
              {/* Glow Intensity 3-step segment controller */}
              <div className="space-y-2">
                <div>
                  <span className="block text-xs font-semibold text-white/95">Background glow intensity</span>
                  <span className="block text-[10px] text-white/40">Controls the saturation and blooming of dynamic ambient light layers</span>
                </div>
                
                <div className="grid grid-cols-3 bg-stone-950 p-1 rounded-xl border border-white/5">
                  {[
                    { id: 'subtle', label: 'Subtle' },
                    { id: 'balanced', label: 'Balanced' },
                    { id: 'vivid', label: 'Vivid' }
                  ].map((option) => {
                    const isSelected = glowIntensity === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleGlowChange(option.id)}
                        className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'bg-[#D946C4] text-white shadow-md font-bold'
                            : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Light/Dark option pre-selected Coming soon */}
              <div className="flex items-center justify-between p-3.5 bg-stone-950/40 border border-white/5 rounded-xl opacity-60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="block text-xs font-semibold text-white/95">White Glass Theme (Light Mode)</span>
                    <span className="text-[8px] font-mono font-extrabold tracking-wider bg-white/10 text-white/50 px-1.5 py-0.5 rounded uppercase leading-none">Coming Soon</span>
                  </div>
                  <span className="block text-[10px] text-white/40">Switch layout colors to high-contrast paper whites with charcoal accents</span>
                </div>
                <button
                  type="button"
                  disabled
                  className="w-10 h-5.5 rounded-full p-0.5 bg-white/5 flex items-center cursor-not-allowed"
                >
                  <div className="w-4.5 h-4.5 rounded-full bg-stone-700" />
                </button>
              </div>
            </div>
          </section>

          {/* 8. ACCOUNT & SECURITY SECTION */}
          <section id="section-account" className={glassPanelClass}>
            <h4 className={subHeadingClass}>
              <ShieldAlert size={13} className="text-[#D946C4]" /> Account & Security
            </h4>

            {/* Change Password fields */}
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-[#D946C4]/60 leading-none">Change Password</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`${inputContainerClass} relative`}>
                  <label className={labelClass}>Current Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword.current ? "text" : "password"} 
                      className={inputClass}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 cursor-pointer"
                    >
                      {showPassword.current ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <div className={`${inputContainerClass} relative`}>
                  <label className={labelClass}>New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword.new ? "text" : "password"} 
                      className={inputClass}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 cursor-pointer"
                    >
                      {showPassword.new ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <div className={`${inputContainerClass} relative`}>
                  <label className={labelClass}>Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword.confirm ? "text" : "password"} 
                      className={inputClass}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 cursor-pointer"
                    >
                      {showPassword.confirm ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password update trigger */}
              <div className="flex items-center justify-end mt-2">
                <button
                  type="submit"
                  disabled={!passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword || saveStatus.password === 'saving'}
                  className="h-9 px-4 rounded-xl border border-white/15 hover:border-white/25 disabled:opacity-30 disabled:border-white/10 disabled:text-white/30 text-white hover:bg-white/[0.02] text-xs font-semibold cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Lock size={12} />
                  {saveStatus.password === 'saving' ? 'Verifying...' : 'Update Password'}
                </button>
              </div>

              {/* Inline success check */}
              <AnimatePresence>
                {saveStatus.password === 'saved' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="text-emerald-400 text-xs font-semibold text-right mt-1.5 flex items-center justify-end gap-1"
                  >
                    <Check size={14} className="animate-bounce" /> Password changed successfully
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Backups & Actions */}
            <div className="border-t border-white/5 pt-4 mt-6 space-y-4">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-[#D946C4]/60 leading-none">Security Actions</span>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-950/40 p-3.5 rounded-xl border border-white/5">
                <div>
                  <span className="block text-xs font-semibold text-white">Consolidated Data Backups</span>
                  <span className="block text-[10px] text-white/40">Securely download all local system profiles, companies, and custom parameters as a JSON archive.</span>
                </div>
                <button
                  onClick={handleExportData}
                  className="h-9 px-4 rounded-xl border border-dashed border-white/10 hover:border-white/30 text-white/80 hover:text-white text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-white/[0.01]"
                >
                  <Database size={13} />
                  Export All Data
                </button>
              </div>

              {/* Log out */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-stone-950/20">
                <div>
                  <span className="block text-xs font-semibold text-white/90">Sign Out of Session</span>
                  <span className="block text-[10px] text-white/40">Terminate the current secure access credentials and reset UI.</span>
                </div>
                <button
                  onClick={() => alert("Simulating Logout: Session cleared. Press OK to refresh the demonstration instance.")}
                  className="h-9 px-4 rounded-xl hover:bg-red-500/10 text-red-400 border border-red-500/20 hover:border-red-500/30 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <LogOut size={13} />
                  Log Out
                </button>
              </div>
            </div>
          </section>

          {/* 9. DANGER ZONE */}
          <section className="bg-red-500/[0.02] border border-red-500/15 rounded-2xl p-6 transition-all duration-300">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-2 mb-2 font-display">
              <AlertTriangle size={13} /> Danger Zone
            </h4>
            <p className="text-[10px] text-white/30 mb-5 leading-relaxed">
              Caution: The following adjustments are highly destructive. Performing these operations resets or cancels entire operational states permanently.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setActiveModal('clear_data')}
                className="flex-1 h-10 rounded-xl border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 text-red-300 hover:text-red-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13} />
                Clear All Data
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('delete_account')}
                className="flex-1 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <AlertTriangle size={13} />
                Delete Operator Account
              </button>
            </div>
          </section>

        </div>

      </div>

      {/* CONFIRMATION MODALS (AnimatePresence Overlay) */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-stone-900/95 border border-white/10 rounded-2xl p-6 shadow-2xl z-50 overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

              {/* Header */}
              {activeModal === 'clear_data' && (
                <>
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mb-4">
                    <Trash2 size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2 font-display">Confirm Local Data Reset</h3>
                  <p className="text-xs text-white/50 leading-relaxed mb-6">
                    Are you absolutely sure you want to clear all settings? This will instantly revert your business parameters, default GST, terms & conditions, and personalized layout preferences back to pristine factory defaults. This action cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="h-9 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-white/70 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearAllData}
                      className="h-9 px-4 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold cursor-pointer"
                    >
                      Clear All Settings
                    </button>
                  </div>
                </>
              )}

              {activeModal === 'delete_account' && (
                <>
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mb-4">
                    <AlertTriangle size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2 font-display">Confirm Account Deletion</h3>
                  <p className="text-xs text-white/50 leading-relaxed mb-6">
                    This action is highly critical. You are about to permanently delete the operator profile "<strong>{profile.name}</strong>". All saved loads, client ledgers, quotations, and active WhatsApp integration nodes will be immediately dropped.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="h-9 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-white/70 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="h-9 px-4 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold cursor-pointer"
                    >
                      Confirm Deletion
                    </button>
                  </div>
                </>
              )}

              {activeModal === 'change_whatsapp' && (
                <>
                  <div className="w-10 h-10 rounded-full bg-[#D946C4]/10 flex items-center justify-center text-[#D946C4] mb-4">
                    <Smartphone size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2 font-display">Configure WhatsApp Gateway</h3>
                  <p className="text-xs text-white/50 leading-relaxed mb-4">
                    Enter the operational mobile number linked to your WhatsApp Business app. This number serves as the ingestion stream parsed by the Vanguard intelligent engine.
                  </p>
                  
                  <div className="mb-6">
                    <label className={labelClass}>WhatsApp Mobile Number</label>
                    <input 
                      type="text" 
                      className={`${inputClass} mt-1`}
                      value={tempWhatsapp}
                      onChange={(e) => setTempWhatsapp(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="h-9 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-white/70 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveWhatsapp}
                      className="h-9 px-4 rounded-xl bg-[#D946C4] hover:bg-[#D946C4]/80 text-white text-xs font-bold cursor-pointer"
                    >
                      Update Connection
                    </button>
                  </div>
                </>
              )}

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
