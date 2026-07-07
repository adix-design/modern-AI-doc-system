import { PageId } from '../types';
import { Menu, Search, Bell, Sparkles, SlidersHorizontal, ArrowUpRight, AlertCircle, Clock, DollarSign, X, Check } from 'lucide-react';
import { NAVIGATION_ITEMS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import SearchModal from './SearchModal';
import DateRangePicker from './DateRangePicker';

interface MainPanelProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  isSidebarCollapsed: boolean;
  setIsMobileOpen: (open: boolean) => void;
  children: React.ReactNode;
}

interface Notification {
  id: string;
  type: 'overdue' | 'ai' | 'reminder' | 'payment';
  title: string;
  desc: string;
  time: string;
  timestamp: string;
  read: boolean;
}

interface ToastMessage {
  id: string;
  title: string;
  desc: string;
  type: 'overdue' | 'ai' | 'reminder' | 'payment';
}

export default function MainPanel({
  activePage,
  setActivePage,
  isSidebarCollapsed,
  setIsMobileOpen,
  children
}: MainPanelProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const currentPageItem = NAVIGATION_ITEMS.find((item) => item.id === activePage);
  const pageTitle = currentPageItem?.label || 'Dashboard';
  const pageDescription = currentPageItem?.description || '';

  // Listen for global command shortcuts (Ctrl+K, ⌘K, or / key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+K or ⌘+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Check for forward slash '/' unless inside input or textarea
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Synchronize notifications with localStorage
  useEffect(() => {
    const loadNotifs = () => {
      const saved = localStorage.getItem('vanguard_notifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        const initial: Notification[] = [
          {
            id: 'notif-1',
            type: 'overdue',
            title: 'Overdue Invoice Alert',
            desc: 'Invoice #1042 is 3 days overdue',
            time: '3 days ago',
            timestamp: '2026-07-03T16:00:00Z',
            read: false
          },
          {
            id: 'notif-2',
            type: 'ai',
            title: 'AI Margin Optimization',
            desc: 'AI Assistant suggests reviewing Delhi route pricing',
            time: '2 hours ago',
            timestamp: '2026-07-06T10:22:14-07:00',
            read: false
          },
          {
            id: 'notif-3',
            type: 'reminder',
            title: 'Task Reminder',
            desc: 'Reminder: Confirm booking for Sharma Transport — due today',
            time: '4 hours ago',
            timestamp: '2026-07-06T08:22:14-07:00',
            read: false
          },
          {
            id: 'notif-4',
            type: 'payment',
            title: 'Payment Received',
            desc: 'Payment of ₹18,500 received from ABC Traders',
            time: '1 day ago',
            timestamp: '2026-07-05T12:00:00Z',
            read: true
          }
        ];
        localStorage.setItem('vanguard_notifications', JSON.stringify(initial));
        setNotifications(initial);
      }
    };

    loadNotifs();

    window.addEventListener('vanguard-notifications-updated', loadNotifs);
    return () => window.removeEventListener('vanguard-notifications-updated', loadNotifs);
  }, []);

  // Handle toast notification triggers
  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; desc: string; type: 'overdue' | 'ai' | 'reminder' | 'payment' }>;
      if (customEvent.detail) {
        const newToast: ToastMessage = {
          id: `toast-${Date.now()}-${Math.random()}`,
          title: customEvent.detail.title,
          desc: customEvent.detail.desc,
          type: customEvent.detail.type
        };
        
        setToasts(prev => [...prev, newToast]);
        
        // Auto dismiss after 4 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, 4000);
      }
    };
    
    window.addEventListener('vanguard-new-notification-toast', handleToast);
    return () => window.removeEventListener('vanguard-new-notification-toast', handleToast);
  }, []);

  const notificationsCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('vanguard_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('vanguard-notifications-updated'));
  };

  const handleNotificationClick = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('vanguard_notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('vanguard-notifications-updated'));
  };

  return (
    <div 
      id="main-panel-root"
      className={`min-h-screen flex flex-col transition-all duration-300 relative z-10 ${
        isSidebarCollapsed ? 'md:pl-20' : 'md:pl-[280px]'
      } pl-0`}
    >
      {/* Top Header Bar */}
      <header 
        id="main-header"
        className="h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-white/5 relative z-20"
      >
        {/* MOBILE ONLY HEADER (below 768px) */}
        <div className="flex md:hidden items-center justify-between w-full relative">
          {/* Hamburger button (left) */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileOpen(true)}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all duration-200 border border-white/5"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          {/* Page title (center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <h2 className="font-display font-semibold text-sm sm:text-base text-white tracking-tight uppercase">
              {pageTitle}
            </h2>
          </div>

          {/* Notification Bell (right) */}
          <div className="relative">
            <button
              id="notifications-bell-btn-mobile"
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className={`w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all duration-200 border border-white/5 relative cursor-pointer ${
                showNotificationDropdown ? 'bg-white/12 border-[#D946C4]/20' : ''
              }`}
            >
              <Bell size={18} className={notificationsCount > 0 ? 'animate-pulse' : ''} />
              {notificationsCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#D946C4] ring-2 ring-stone-900 text-[9px] font-bold text-stone-950 flex items-center justify-center" style={{ fontSize: '8px' }}>
                  {notificationsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* DESKTOP/TABLET HEADER (768px and above) */}
        <div className="hidden md:flex items-center justify-between w-full">
          {/* Left Side: Breadcrumbs */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase text-white/50">
                <span className="hover:text-[#D946C4] cursor-pointer transition-colors" onClick={() => setActivePage('dashboard')}>
                  Command Center
                </span>
                <span>/</span>
                <span className="text-white/80 font-medium">{pageTitle}</span>
              </div>
              <h2 className="font-display font-semibold text-lg text-white leading-tight tracking-tight mt-0.5">
                {pageTitle}
              </h2>
            </div>
          </div>

          {/* Right Side: Search, Picker, Notifications, AI Assist */}
          <div className="flex items-center gap-3.5">
            <DateRangePicker id="global-date-range-picker" />

            <div 
              id="floating-search-bar"
              onClick={() => setIsSearchOpen(true)}
              className="relative hidden md:block w-64 lg:w-80 cursor-pointer group"
            >
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-[#D946C4] transition-colors duration-200">
                <Search size={16} />
              </span>
              <div className="w-full h-10 pl-10 pr-4 rounded-full bg-white/5 hover:bg-white/8 border border-white/5 group-hover:border-[#D946C4]/20 text-xs text-white/40 flex items-center justify-between transition-all duration-200 select-none">
                <span>Search command hub...</span>
                <span className="text-[9px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/30 uppercase">
                  ⌘K
                </span>
              </div>
            </div>

            <div className="relative">
              <button
                id="notifications-bell-btn"
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className={`w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all duration-200 border border-white/5 relative cursor-pointer ${
                  showNotificationDropdown ? 'bg-white/12 border-[#D946C4]/20' : ''
                }`}
              >
                <Bell size={18} className={notificationsCount > 0 ? 'animate-pulse' : ''} />
                {notificationsCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#D946C4] ring-2 ring-stone-900 text-[9px] font-bold text-stone-950 flex items-center justify-center" style={{ fontSize: '8px' }}>
                    {notificationsCount}
                  </span>
                )}
              </button>
            </div>

            <button
              id="ai-quick-assist-btn"
              onClick={() => setActivePage('ai-assistant')}
              className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-full bg-gradient-to-r from-[#D946C4]/15 to-[#7C6FE0]/15 hover:from-[#D946C4]/25 hover:to-[#7C6FE0]/25 border border-[#D946C4]/20 hover:border-[#D946C4]/35 text-[#D946C4] hover:text-[#F2EEF9] text-xs font-medium transition-all duration-300 shadow-lg shadow-[#D946C4]/5 active:scale-95"
            >
              <Sparkles size={13} className="animate-pulse text-[#D946C4]" />
              <span>AI Dispatcher</span>
            </button>
          </div>
        </div>

        {/* Floating Notification Dropdown */}
        <AnimatePresence>
          {showNotificationDropdown && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowNotificationDropdown(false)} />
              <motion.div
                id="notifications-dropdown-menu"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-4 md:right-6 lg:right-8 top-16 w-[calc(100vw-32px)] sm:w-80 rounded-2xl bg-stone-950/95 backdrop-blur-2xl border border-[rgba(217,70,196,0.15)] shadow-2xl z-40 overflow-hidden"
              >
                <div className="p-4 border-b border-[#D946C4]/12 flex items-center justify-between">
                  <h4 className="font-display font-medium text-xs uppercase tracking-wider text-[#F2EEF9]">Live Dispatches</h4>
                  {notificationsCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-[#D946C4] hover:text-[#e269d0] font-semibold transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="divide-y divide-[#D946C4]/8 max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => {
                      const IconComponent = 
                         notif.type === 'overdue' ? AlertCircle :
                         notif.type === 'ai' ? Sparkles :
                         notif.type === 'payment' ? DollarSign : Clock;
                      
                      const iconColorClass = 
                        notif.type === 'overdue' ? 'text-red-400 bg-red-500/10 border border-red-500/20' :
                        notif.type === 'ai' ? 'text-[#D946C4] bg-[#D946C4]/10 border border-[#D946C4]/20' :
                        notif.type === 'payment' ? 'text-[#7C6FE0] bg-[#7C6FE0]/10 border border-[#7C6FE0]/20' :
                        'text-[#9090A6] bg-white/5 border border-white/10';

                      return (
                        <div 
                          key={notif.id} 
                          onClick={() => handleNotificationClick(notif.id)}
                          className={`p-3.5 hover:bg-white/5 transition-colors cursor-pointer relative flex gap-3 ${
                            !notif.read ? 'bg-[#D946C4]/[0.02] border-l-2 border-l-[#D946C4]' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconColorClass}`}>
                            <IconComponent size={14} className={notif.type === 'ai' && !notif.read ? 'animate-pulse' : ''} />
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h5 className={`text-[11px] font-bold truncate ${!notif.read ? 'text-[#F2EEF9]' : 'text-[#B6B6C6]/60'}`}>
                                {notif.title}
                              </h5>
                              <span className="text-[9px] font-mono text-[#9090A6]/40 shrink-0 mt-0.5">{notif.time}</span>
                            </div>
                            <p className={`text-[10px] leading-relaxed break-words ${!notif.read ? 'text-[#F2EEF9]/85 font-medium' : 'text-[#B6B6C6]/50'}`}>
                              {notif.desc}
                            </p>
                          </div>

                          {!notif.read && (
                            <span className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-[#D946C4] shrink-0" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-[#B6B6C6]/40">
                      <p className="text-xs font-semibold text-[#B6B6C6]/60">No dispatch warnings or notifications</p>
                      <p className="text-[9px] text-[#9090A6]/40 mt-1">Operational checks are fully clear.</p>
                    </div>
                  )}
                </div>
                <div className="p-2.5 bg-stone-900/90 border-t border-[#D946C4]/12 text-center">
                  <button 
                    onClick={() => {
                      setActivePage('todo');
                      setShowNotificationDropdown(false);
                    }}
                    className="text-[10px] font-bold text-[#D946C4] hover:text-[#e269d0] transition-colors flex items-center justify-center gap-1 mx-auto w-full py-1 bg-white/2 hover:bg-white/5 border border-white/5 rounded-lg cursor-pointer"
                  >
                    View all in To-Do <ArrowUpRight size={12} />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area Container */}
      <main 
        id="main-content-scroll"
        className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 overflow-y-auto flex flex-col justify-start"
      >
        {/* Soft, beautiful, staggered animation for content entrance */}
        <motion.div
          id="main-glass-panel"
          initial={{ opacity: 0, y: 15, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 400, delay: 100, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 bg-[rgba(217,70,196,0.05)] backdrop-blur-xl border border-[rgba(217,70,196,0.15)] rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 xl:p-10 relative flex flex-col overflow-hidden min-h-[calc(100vh-140px)]"
        >
          {/* Subtle inside highlights at the corners */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#D946C4]/25 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-[#D946C4]/10 to-transparent pointer-events-none" />
          
          {/* Active Page Description Header */}
          <div className="mb-6 border-b border-[#D946C4]/12 pb-5">
            <h3 className="font-display font-semibold text-lg sm:text-xl lg:text-2xl text-[#F2EEF9] tracking-tight">
              {pageTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#B6B6C6] font-sans mt-1">
              {pageDescription}
            </p>
          </div>

          {/* Dynamic Component Content */}
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </motion.div>
      </main>

      {/* Global floating notification toasts stacked in the bottom-right */}
      <div id="toast-container" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const IconComp = 
              toast.type === 'overdue' ? AlertCircle :
              toast.type === 'ai' ? Sparkles :
              toast.type === 'payment' ? DollarSign : Clock;

            const toastBorderColor = 
              toast.type === 'overdue' ? 'border-red-500/30' :
              toast.type === 'ai' ? 'border-[#D946C4]/35' :
              toast.type === 'payment' ? 'border-[#7C6FE0]/30' :
              'border-white/10';

            const toastIconColor = 
              toast.type === 'overdue' ? 'text-red-400 bg-red-500/10' :
              toast.type === 'ai' ? 'text-[#D946C4] bg-[#D946C4]/10' :
              toast.type === 'payment' ? 'text-[#7C6FE0] bg-[#7C6FE0]/10' :
              'text-[#F2EEF9]/60 bg-white/5';

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20, stiffness: 250 }}
                className={`bg-stone-900/95 backdrop-blur-xl border ${toastBorderColor} text-[#F2EEF9] rounded-2xl p-4 shadow-2xl flex gap-3.5 pointer-events-auto select-none`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${toastIconColor}`}>
                  <IconComp size={15} />
                </div>
                
                <div className="flex-1 min-w-0 space-y-0.5 text-xs">
                  <p className="font-bold text-[#F2EEF9] flex items-center gap-1.5">
                    {toast.title}
                    {toast.type === 'ai' && <span className="text-[8px] bg-[#D946C4]/10 text-[#D946C4] px-1 rounded uppercase tracking-wider font-mono">Vanguard AI</span>}
                  </p>
                  <p className="text-[11px] text-[#B6B6C6] leading-normal font-sans">
                    {toast.desc}
                  </p>
                </div>

                <button
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="text-white/30 hover:text-white p-0.5 shrink-0 h-6 w-6 rounded-md hover:bg-white/5 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={13} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Global Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        setActivePage={setActivePage}
      />
    </div>
  );
}
