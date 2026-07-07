import { 
  LayoutDashboard, 
  Truck, 
  Calendar,
  Users, 
  FileText, 
  DollarSign, 
  FileSpreadsheet, 
  Sparkles, 
  CheckSquare, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { PageId, NavItem, UserProfile } from '../types';
import { NAVIGATION_ITEMS, CURRENT_USER } from '../data';
import { motion } from 'motion/react';

// Map string icon names to Lucide icons
const iconMap: Record<string, any> = {
  LayoutDashboard,
  Truck,
  Calendar,
  Users,
  FileText,
  DollarSign,
  FileSpreadsheet,
  Sparkles,
  CheckSquare,
  Settings
};

interface SidebarProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onLogout?: () => void;
}

export default function Sidebar({
  activePage,
  setActivePage,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onLogout
}: SidebarProps) {
  
  const handleNavClick = (id: PageId) => {
    setActivePage(id);
    setIsMobileOpen(false); // Close mobile menu after selection
  };

  const sidebarContent = (
    <div className="flex flex-col h-full text-[#F2EEF9]">
      {/* Top Logo / Brand Section */}
      <div className={`p-6 flex items-center justify-between border-b border-[#D946C4]/12 h-20 ${isCollapsed ? 'justify-center px-2' : ''}`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D946C4]/20 flex items-center justify-center border border-[#D946C4]/30 shadow-lg shadow-[#D946C4]/10">
              <span className="text-[#D946C4] font-bold text-lg tracking-wider font-display">V</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-base tracking-tight text-[#F2EEF9]">VANGUARD</h1>
              <p className="text-[10px] uppercase font-semibold text-[#D946C4] tracking-widest leading-none">LOGISTICS</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-[#D946C4]/20 flex items-center justify-center border border-[#D946C4]/30">
            <span className="text-[#D946C4] font-bold text-xl font-display">V</span>
          </div>
        )}

        {/* Collapse toggle (Desktop/Tablet) */}
        {!isCollapsed && (
          <button 
            id="desktop-collapse-btn-expanded"
            onClick={() => setIsCollapsed(true)}
            className="hidden md:flex w-7 h-7 rounded-lg bg-white/5 hover:bg-[#D946C4]/15 text-[#B6B6C6] hover:text-[#F2EEF9] items-center justify-center transition-all duration-200 border border-white/5"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation Links with Section Headers */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {NAVIGATION_ITEMS.map((item, index) => {
          const IconComponent = iconMap[item.icon] || LayoutDashboard;
          const isActive = activePage === item.id;
          
          let sectionHeader = null;
          if (!isCollapsed) {
            if (index === 0) {
              sectionHeader = (
                <div className="px-3.5 pt-1.5 pb-2 text-[10px] font-bold tracking-[0.15em] text-[#9090A6] uppercase font-display">
                  Operations
                </div>
              );
            } else if (index === 4) {
              sectionHeader = (
                <div className="px-3.5 pt-5 pb-2 text-[10px] font-bold tracking-[0.15em] text-[#9090A6] uppercase font-display">
                  Business
                </div>
              );
            } else if (index === 8) {
              sectionHeader = (
                <div className="px-3.5 pt-5 pb-2 text-[10px] font-bold tracking-[0.15em] text-[#9090A6] uppercase font-display">
                  Workspace
                </div>
              );
            }
          } else {
            if (index === 4 || index === 8) {
              sectionHeader = (
                <div className="my-2.5 border-t border-[#D946C4]/12 mx-2" />
              );
            }
          }
          
          return (
            <div key={item.id} className="space-y-1">
              {sectionHeader}
              <button
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 min-h-[44px] rounded-xl transition-all duration-200 relative group text-left ${
                  isActive 
                    ? 'bg-[#D946C4]/18 text-[#F2EEF9] font-semibold shadow-[0_4px_16px_rgba(217,70,196,0.08)] border border-[#D946C4]/25' 
                    : 'text-[#B6B6C6] hover:text-[#F2EEF9] hover:bg-[#D946C4]/8'
                } ${isCollapsed ? 'justify-center px-2 py-2.5' : ''}`}
              >
                {/* Active thin left accent bar with glow */}
                {isActive && (
                  <span 
                    id={`nav-accent-${item.id}`}
                    className="absolute left-0 top-3 bottom-3 w-[3px] bg-[#D946C4] rounded-r-md shadow-[0_0_8px_rgba(217,70,196,0.6)]" 
                  />
                )}

                {/* Icon */}
                <div className={`transition-transform duration-300 ${!isActive ? 'group-hover:scale-110 group-hover:translate-x-0.5' : ''}`}>
                  <IconComponent 
                    size={20} 
                    className={isActive ? 'text-[#D946C4]' : 'text-[#B6B6C6] group-hover:text-[#F2EEF9]'} 
                  />
                </div>

                {/* Label */}
                {!isCollapsed && (
                  <div className="flex flex-col">
                    <span className="text-sm font-sans tracking-wide">{item.label}</span>
                    <span className="text-[10px] text-white/40 font-light hidden xl:block line-clamp-1">
                      {item.description}
                    </span>
                  </div>
                )}

                {/* Tooltip for collapsed sidebar */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-zinc-950/90 text-xs text-white rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-xl border border-white/10 z-50 whitespace-nowrap">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-[10px] text-white/50">{item.description}</p>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle for collapsed state (Desktop/Tablet) */}
      {isCollapsed && (
        <div className="hidden md:flex justify-center py-3 border-t border-[#D946C4]/12">
          <button 
            id="desktop-collapse-btn-collapsed"
            onClick={() => setIsCollapsed(false)}
            className="w-10 h-10 rounded-lg bg-white/5 hover:bg-[#D946C4]/15 text-[#B6B6C6] hover:text-[#F2EEF9] flex items-center justify-center transition-all duration-200 border border-white/5"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* User Profile Chip */}
      <div className={`p-4 border-t border-[#D946C4]/12 ${isCollapsed ? 'px-2 py-4' : ''}`}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-3 bg-[rgba(217,70,196,0.05)] p-3.5 rounded-2xl border border-[rgba(217,70,196,0.12)] hover:bg-[rgba(217,70,196,0.08)] transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
            <div className="flex items-center gap-3 overflow-hidden">
              <img 
                src={CURRENT_USER.avatarUrl} 
                alt={CURRENT_USER.name}
                className="w-9 h-9 rounded-lg object-cover ring-1 ring-[#D946C4]/30"
                referrerPolicy="no-referrer"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-[#F2EEF9] truncate">{CURRENT_USER.name}</p>
                <p className="text-[10px] text-[#9090A6] truncate font-mono">{CURRENT_USER.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button 
                id="user-profile-settings-btn"
                onClick={() => handleNavClick('settings')}
                className="text-[#B6B6C6] hover:text-[#F2EEF9] transition-colors p-1.5 hover:bg-white/5 rounded-lg"
                title="Settings"
              >
                <Settings size={15} className="hover:rotate-45 transition-transform duration-500" />
              </button>
              {onLogout && (
                <button 
                  id="user-profile-logout-btn"
                  onClick={onLogout}
                  className="text-[#B6B6C6] hover:text-red-400 transition-colors p-1.5 hover:bg-white/5 rounded-lg"
                  title="Log Out"
                >
                  <LogOut size={15} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div 
              id="user-avatar-collapsed"
              className="relative group focus:outline-none cursor-pointer"
            >
              <img 
                src={CURRENT_USER.avatarUrl} 
                alt={CURRENT_USER.name}
                onClick={() => handleNavClick('settings')}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#D946C4]/30 hover:ring-[#D946C4] transition-all duration-200 shadow-lg"
                referrerPolicy="no-referrer"
              />
              {/* Profile Tooltip */}
              <div className="absolute left-full ml-4 bottom-0 p-3 bg-stone-950/95 text-[#F2EEF9] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 shadow-2xl border border-[rgba(217,70,196,0.12)] z-50 min-w-[200px]">
                <p className="text-xs font-semibold">{CURRENT_USER.name}</p>
                <p className="text-[10px] text-[#D946C4] font-mono mt-0.5">{CURRENT_USER.role}</p>
                <p className="text-[10px] text-[#9090A6] mt-1 truncate border-t border-white/5 pt-1">{CURRENT_USER.email}</p>
                {onLogout && (
                  <button 
                    id="user-avatar-collapsed-logout-btn"
                    onClick={(e) => { e.stopPropagation(); onLogout(); }}
                    className="w-full mt-2 py-1 text-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] font-medium transition-colors border border-red-500/20 cursor-pointer"
                  >
                    Log Out
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop/Tablet Sidebar: Float fixed left - Frosted Glass Container */}
      <div 
        id="desktop-sidebar-container"
        className={`hidden md:block fixed left-0 top-0 bottom-0 z-40 bg-[rgba(217,70,196,0.04)] backdrop-blur-xl border-r border-[rgba(217,70,196,0.14)] shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-[280px]'
        }`}
      >
        {/* Soft inner highlighting at the top edge */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#D946C4]/25 to-transparent pointer-events-none" />
        {sidebarContent}
      </div>

      {/* Mobile Backdrop & Slide-out Drawer */}
      {isMobileOpen && (
        <div 
          id="mobile-sidebar-backdrop"
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        >
          <motion.div 
            id="mobile-sidebar-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-[280px] h-full bg-[rgba(217,70,196,0.06)] backdrop-blur-2xl border-r border-[rgba(217,70,196,0.16)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking drawer contents
          >
            {/* Top drawer close button */}
            <div className="absolute top-4 right-4 z-50">
              <button 
                id="mobile-close-sidebar-btn"
                onClick={() => setIsMobileOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#D946C4]/15 text-[#B6B6C6] hover:text-[#F2EEF9] flex items-center justify-center transition-all border border-white/5"
              >
                <X size={18} />
              </button>
            </div>
            {sidebarContent}
          </motion.div>
        </div>
      )}
    </>
  );
}
