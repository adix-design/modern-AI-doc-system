import { PageId, NavItem, UserProfile } from './types';

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    description: 'Fleet and freight command hub'
  },
  {
    id: 'shipments',
    label: 'Shipments',
    icon: 'Truck',
    description: 'Active freight and transit routes'
  },
  {
    id: 'fleet-drivers',
    label: 'Fleet & Drivers',
    icon: 'Truck',
    description: 'Trucks, drivers & trip history'
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: 'Calendar',
    description: 'Dispatch schedule and meetings'
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: 'Users',
    description: 'Shipper and broker directories'
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: 'FileText',
    description: 'BOLs, rate confirmations, and PODs'
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: 'DollarSign',
    description: 'Invoicing, payouts, and margins'
  },
  {
    id: 'quotations',
    label: 'Quotations',
    icon: 'FileSpreadsheet',
    description: 'Instant bidding and RFP logs'
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    icon: 'Sparkles',
    description: 'Dispatch intelligence and routing advice'
  },
  {
    id: 'todo',
    label: 'To-Do',
    icon: 'CheckSquare',
    description: 'Dispatcher tasks and driver checklists'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    description: 'System integration and profile setup'
  }
];

export const CURRENT_USER: UserProfile = {
  name: 'Marcus Vance',
  role: 'Logistics Director',
  email: 'm.vance@vanguardfreight.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120' // Beautiful high-quality Unsplash portrait
};
