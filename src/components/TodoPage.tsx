import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Sparkles, 
  User, 
  Clock, 
  Trash2, 
  Pencil, 
  ChevronDown, 
  ChevronUp, 
  CheckSquare, 
  Square, 
  X, 
  Check, 
  AlertCircle, 
  Search, 
  Info, 
  Briefcase, 
  Calendar,
  DollarSign,
  ArrowRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageId } from '../types';

interface TodoPageProps {
  setActivePage?: (page: PageId) => void;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:MM
  priority: 'high' | 'medium' | 'low';
  source: 'manual' | 'ai';
  linkedItem: { type: 'Invoice' | 'Shipment' | 'Client'; id: string } | null;
  notes: string;
  reminder: boolean;
  reminderTime: string;
  completed: boolean;
  completedAt?: string;
}

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Confirm rate lock with APX Food client on Spot #TRK-1823',
    dueDate: '2026-07-06', // Today (using the context date 2026-07-06)
    dueTime: '15:30',
    priority: 'high',
    source: 'manual',
    linkedItem: { type: 'Client', id: 'Apex Foods International' },
    notes: 'Verify the fuel price index matches the pre-negotiated Bhopal-Indore lane matrix.',
    reminder: true,
    reminderTime: '1 hour before',
    completed: false
  },
  {
    id: 'task-2',
    title: 'Review Delhi route pricing suggestions',
    dueDate: '2026-07-07', // Tomorrow
    dueTime: '10:00',
    priority: 'medium',
    source: 'ai',
    linkedItem: { type: 'Shipment', id: 'Route #DEL-MUM' },
    notes: 'Vanguard Assistant flagged sub-optimal margins (8.5%) due to a 32% rise in regional diesel tolls.',
    reminder: true,
    reminderTime: 'morning of',
    completed: false
  },
  {
    id: 'task-3',
    title: 'Audit signed Proof of Delivery (POD) scans from Seattle routes',
    dueDate: '2026-07-07', // Tomorrow
    dueTime: '17:00',
    priority: 'medium',
    source: 'manual',
    linkedItem: null,
    notes: 'Check for client signature stamp and timestamp matching.',
    reminder: false,
    reminderTime: 'on the day',
    completed: false
  },
  {
    id: 'task-4',
    title: 'Renew fuel card discount limits on Pilot Flying J stations',
    dueDate: '2026-07-10', // This Week
    dueTime: '12:00',
    priority: 'low',
    source: 'manual',
    linkedItem: null,
    notes: 'Required before the mid-month bulk billing cycle resets.',
    reminder: true,
    reminderTime: 'on the day',
    completed: false
  },
  {
    id: 'task-5',
    title: 'Verify client insurance coverage for Titan Industrial',
    dueDate: '2026-07-09', // This Week
    dueTime: '14:30',
    priority: 'medium',
    source: 'ai',
    linkedItem: { type: 'Client', id: 'Titan Industrial Supply' },
    notes: 'Check if their liability cert covers high-value industrial gear.',
    reminder: false,
    reminderTime: 'on the day',
    completed: false
  },
  {
    id: 'task-6',
    title: 'Collect outstanding payment for Invoice #1042',
    dueDate: '2026-07-03', // Overdue (due 3 days ago)
    dueTime: '16:00',
    priority: 'high',
    source: 'ai',
    linkedItem: { type: 'Invoice', id: '#1042' },
    notes: 'Invoice #1042 is 3 days overdue. Call Amit Sharma for immediate clearance.',
    reminder: true,
    reminderTime: 'morning of',
    completed: false
  }
];

export default function TodoPage({ setActivePage }: TodoPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [aiOnly, setAiOnly] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('2026-07-06');
  const [taskDueTime, setTaskDueTime] = useState('12:00');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [taskSource, setTaskSource] = useState<'manual' | 'ai'>('manual');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskReminder, setTaskReminder] = useState(false);
  const [taskReminderTime, setTaskReminderTime] = useState('1 hour before');
  
  // Link to dropdown states
  const [linkType, setLinkType] = useState<'none' | 'Invoice' | 'Shipment' | 'Client'>('none');
  const [linkId, setLinkId] = useState('');
  const [linkSearch, setLinkSearch] = useState('');
  const [showLinkDropdown, setShowLinkDropdown] = useState(false);

  // Snooze states
  const [snoozeTaskId, setSnoozeTaskId] = useState<string | null>(null);

  // Completed section state
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);

  // Global Toast Dispatcher inside page
  const [toast, setToast] = useState<{ message: string; subText?: string } | null>(null);
  const triggerPageToast = (message: string, subText?: string) => {
    setToast({ message, subText });
    setTimeout(() => setToast(null), 3000);
  };

  // Load and save tasks
  useEffect(() => {
    const saved = localStorage.getItem('vanguard_tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      localStorage.setItem('vanguard_tasks', JSON.stringify(INITIAL_TASKS));
      setTasks(INITIAL_TASKS);
    }

    // Listen to changes from outside (like checking notifications that sync here)
    const handleSync = () => {
      const current = localStorage.getItem('vanguard_tasks');
      if (current) setTasks(JSON.parse(current));
    };

    window.addEventListener('vanguard-todo-updated', handleSync);
    return () => window.removeEventListener('vanguard-todo-updated', handleSync);
  }, []);

  const saveTasksToStorage = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('vanguard_tasks', JSON.stringify(updatedTasks));
    // Dispatch custom event to let other modules (like MainPanel notification checkers) sync
    window.dispatchEvent(new Event('vanguard-todo-updated'));
  };

  // Mock list of database entities to link to
  const LINKABLE_ITEMS = [
    { type: 'Invoice', id: '#1042', label: 'Invoice #1042 - Apex Foods (₹89,000)' },
    { type: 'Invoice', id: '#1085', label: 'Invoice #1085 - Titan Supply (₹1,28,000)' },
    { type: 'Invoice', id: '#1120', label: 'Invoice #1120 - Rajput Cold (₹19,500)' },
    { type: 'Shipment', id: 'Route #DEL-MUM', label: 'Shipment Route Delhi → Mumbai (32ft Multi-Axle)' },
    { type: 'Shipment', id: 'Spot #TRK-1823', label: 'Spot #TRK-1823 Bhopal → Indore (22ft Container)' },
    { type: 'Shipment', id: 'Load #TRK-2901', label: 'Load #TRK-2901 Chicago Corridor (Flatbed)' },
    { type: 'Client', id: 'Apex Foods International', label: 'Client: Apex Foods International (Enterprise)' },
    { type: 'Client', id: 'Titan Industrial Supply', label: 'Client: Titan Industrial Supply (Contracted)' },
    { type: 'Client', id: 'Sharma Transport', label: 'Client: Sharma Transport (Broker)' },
    { type: 'Client', id: 'ABC Traders', label: 'Client: ABC Traders (Spot Market)' }
  ] as const;

  const filteredLinkableItems = LINKABLE_ITEMS.filter(item => {
    if (linkType !== 'none' && item.type !== linkType) return false;
    return item.label.toLowerCase().includes(linkSearch.toLowerCase());
  });

  // Toggle checkbox with animation
  const handleToggleComplete = (id: string) => {
    // We update task completed with a slight delay so they can see the checkmark & strikethrough animation
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const updated = [...tasks];
    const isNowCompleted = !updated[taskIndex].completed;
    updated[taskIndex].completed = isNowCompleted;
    if (isNowCompleted) {
      updated[taskIndex].completedAt = new Date().toISOString();
    }

    saveTasksToStorage(updated);
    
    if (isNowCompleted) {
      triggerPageToast("Task Completed", `"${updated[taskIndex].title}" moved to archive.`);
    } else {
      triggerPageToast("Task Reopened", `"${updated[taskIndex].title}" restored to active list.`);
    }
  };

  // Handle Edit click
  const handleStartEdit = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDueDate(task.dueDate);
    setTaskDueTime(task.dueTime);
    setTaskPriority(task.priority);
    setTaskSource(task.source);
    setTaskNotes(task.notes);
    setTaskReminder(task.reminder);
    setTaskReminderTime(task.reminderTime);
    if (task.linkedItem) {
      setLinkType(task.linkedItem.type);
      setLinkId(task.linkedItem.id);
    } else {
      setLinkType('none');
      setLinkId('');
    }
    setLinkSearch('');
    setIsModalOpen(true);
  };

  // Handle Save (Add or Update)
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const linkedItemObj = linkType !== 'none' && linkId 
      ? { type: linkType, id: linkId } 
      : null;

    if (editingTask) {
      // Update
      const updated = tasks.map(t => {
        if (t.id === editingTask.id) {
          return {
            ...t,
            title: taskTitle.trim(),
            dueDate: taskDueDate,
            dueTime: taskDueTime,
            priority: taskPriority,
            source: taskSource,
            notes: taskNotes.trim(),
            reminder: taskReminder,
            reminderTime: taskReminderTime,
            linkedItem: linkedItemObj
          };
        }
        return t;
      });
      saveTasksToStorage(updated);
      triggerPageToast("Task Updated Successfully");
    } else {
      // Add New
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskTitle.trim(),
        dueDate: taskDueDate,
        dueTime: taskDueTime,
        priority: taskPriority,
        source: taskSource,
        notes: taskNotes.trim(),
        reminder: taskReminder,
        reminderTime: taskReminderTime,
        completed: false,
        linkedItem: linkedItemObj
      };

      saveTasksToStorage([newTask, ...tasks]);
      triggerPageToast("New Task Created");
    }

    // Reset states & close modal
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDueDate('2026-07-06');
    setTaskDueTime('12:00');
    setTaskPriority('medium');
    setTaskSource('manual');
    setTaskNotes('');
    setTaskReminder(false);
    setTaskReminderTime('1 hour before');
    setLinkType('none');
    setLinkId('');
    setLinkSearch('');
  };

  // Handle Delete
  const handleDeleteTask = (id: string, title: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasksToStorage(updated);
    triggerPageToast("Task Deleted", `"${title}" removed.`);
  };

  // Handle Snooze
  const handleSnooze = (id: string, option: '1hour' | 'tomorrow' | 'nextweek') => {
    const updated = [...tasks];
    const idx = updated.findIndex(t => t.id === id);
    if (idx === -1) return;

    let newDate = updated[idx].dueDate;
    let newTime = updated[idx].dueTime;
    let description = "";

    const todayDateStr = "2026-07-06"; // Base today's context date

    if (option === '1hour') {
      const [h, m] = newTime.split(':').map(Number);
      const newH = (h + 1) % 24;
      newTime = `${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      description = "Snoozed for 1 hour.";
    } else if (option === 'tomorrow') {
      newDate = "2026-07-07"; // Tomorrow
      description = "Snoozed to tomorrow morning.";
    } else if (option === 'nextweek') {
      newDate = "2026-07-13"; // Next week
      description = "Snoozed to next week.";
    }

    updated[idx].dueDate = newDate;
    updated[idx].dueTime = newTime;
    // Ensure we mark it uncompleted if it was snoozed
    updated[idx].completed = false;

    saveTasksToStorage(updated);
    setSnoozeTaskId(null);
    triggerPageToast("Task Snoozed", description);
  };

  // Trigger Demo Notification Creator
  const handleTriggerDemoNotification = () => {
    // Array of potential notifications
    const choices = [
      {
        type: 'overdue' as const,
        title: 'Payment Overdue Alert',
        desc: 'Invoice #1042 is 3 days overdue. Request immediate follow-up.',
        time: 'Just now'
      },
      {
        type: 'ai' as const,
        title: 'Route Optimizer Hint',
        desc: 'AI Assistant suggests reviewing Delhi route pricing due to regional road taxes.',
        time: 'Just now'
      },
      {
        type: 'reminder' as const,
        title: 'Booking Dispatch Alert',
        desc: 'Reminder: Confirm booking for Sharma Transport — due today.',
        time: 'Just now'
      },
      {
        type: 'payment' as const,
        title: 'Invoice Payment Received',
        desc: 'Payment of ₹18,500 received from ABC Traders for Spot Lane Bhopal-Indore.',
        time: 'Just now'
      }
    ];

    const randomChoice = choices[Math.floor(Math.random() * choices.length)];
    const savedNotifs = localStorage.getItem('vanguard_notifications');
    let list = savedNotifs ? JSON.parse(savedNotifs) : [];
    
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: randomChoice.type,
      title: randomChoice.title,
      desc: randomChoice.desc,
      time: randomChoice.time,
      timestamp: new Date().toISOString(),
      read: false
    };

    list = [newNotif, ...list];
    localStorage.setItem('vanguard_notifications', JSON.stringify(list));
    
    // Dispatch notifications update event for Bell count syncing
    window.dispatchEvent(new Event('vanguard-notifications-updated'));
    
    // Dispatch custom toast notification event
    const toastEvent = new CustomEvent('vanguard-new-notification-toast', {
      detail: {
        title: randomChoice.title,
        desc: randomChoice.desc,
        type: randomChoice.type
      }
    });
    window.dispatchEvent(toastEvent);

    triggerPageToast("Demo Notification Dispatched", "Look at the bell icon or watch for the top-right popups!");
  };

  // Filter Tasks
  const isOverdue = (task: Task) => {
    if (task.completed) return false;
    // Context date is '2026-07-06'
    return task.dueDate < '2026-07-06';
  };

  const getFilteredTasks = () => {
    // Filter active items
    let list = tasks;

    // Filter by active/completed status
    if (activeFilter === 'completed') {
      list = tasks.filter(t => t.completed);
    } else {
      list = tasks.filter(t => !t.completed);
      
      if (activeFilter === 'today') {
        // Today or Overdue (so outstanding overdue doesn't hide)
        list = list.filter(t => t.dueDate === '2026-07-06' || isOverdue(t));
      } else if (activeFilter === 'upcoming') {
        // Due Tomorrow or later
        list = list.filter(t => t.dueDate > '2026-07-06');
      } else if (activeFilter === 'overdue') {
        list = list.filter(t => isOverdue(t));
      }
    }

    // AI Filter toggle
    if (aiOnly) {
      list = list.filter(t => t.source === 'ai');
    }

    return list;
  };

  // Group uncompleted filtered tasks by due date headings
  const getGroupedTasks = (taskList: Task[]) => {
    const today = '2026-07-06';
    const tomorrow = '2026-07-07';
    const groups: { [key: string]: Task[] } = {
      'Overdue': [],
      'Today': [],
      'Tomorrow': [],
      'This Week': [],
      'Later': []
    };

    taskList.forEach(task => {
      if (isOverdue(task)) {
        groups['Overdue'].push(task);
      } else if (task.dueDate === today) {
        groups['Today'].push(task);
      } else if (task.dueDate === tomorrow) {
        groups['Tomorrow'].push(task);
      } else if (task.dueDate > tomorrow && task.dueDate <= '2026-07-12') {
        groups['This Week'].push(task);
      } else {
        groups['Later'].push(task);
      }
    });

    // Remove empty groups to render cleanly
    return Object.keys(groups).reduce((acc, key) => {
      if (groups[key].length > 0) {
        acc[key] = groups[key];
      }
      return acc;
    }, {} as { [key: string]: Task[] });
  };

  const activeFilteredList = getFilteredTasks();
  const groupedTasks = getGroupedTasks(activeFilteredList);
  const completedTasks = tasks.filter(t => t.completed);

  // Quick Action triggers for page jump conceptual links
  const handleLinkedItemClick = (type: 'Invoice' | 'Shipment' | 'Client', id: string) => {
    if (!setActivePage) return;
    if (type === 'Invoice') {
      setActivePage('documents');
      triggerPageToast("Navigated to Documents Ledger", `Inspecting details for invoice ${id}`);
    } else if (type === 'Shipment') {
      setActivePage('shipments');
      triggerPageToast("Navigated to Shipments Board", `Tracing dispatch routes for ${id}`);
    } else if (type === 'Client') {
      setActivePage('clients');
      triggerPageToast("Navigated to Clients Panel", `Inspecting ledger profiles for ${id}`);
    }
  };

  return (
    <div id="todo-page-root" className="space-y-6 flex flex-col flex-1 pb-16 relative">
      
      {/* Dynamic Floating Page Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-stone-900 border border-[#D946C4]/30 text-white rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 z-50 w-full max-w-sm"
          >
            <div className="w-5.5 h-5.5 rounded-full bg-[#D946C4]/10 border border-[#D946C4]/20 flex items-center justify-center text-[#D946C4]">
              <Check size={12} />
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

      {/* ==================== HEADER ROW ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-white tracking-tight flex items-center gap-2">
            To-Do
            <span className="text-[10px] font-mono font-semibold bg-[#D946C4]/15 border border-[#D946C4]/35 text-[#D946C4] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              Tasks & Reminders
            </span>
          </h1>
          <p className="text-xs text-white/50 font-sans">Track operational priorities, legal compliance deadlines, and auto-generated AI recommendations</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Demo Dispatch trigger */}
          <button
            onClick={handleTriggerDemoNotification}
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs font-semibold tracking-wide transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={13} className="text-[#D946C4]" />
            Mock AI Warning
          </button>

          {/* Add Task Button */}
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="px-4 py-2 rounded-xl bg-[#D946C4] hover:bg-[#c33eb0] text-stone-950 text-xs font-bold tracking-wide transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Task
          </button>
        </div>
      </div>

      {/* ==================== FILTER/VIEW ROW ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white/3 p-2.5 rounded-2xl border border-white/5">
        
        {/* Segmented Filter Control */}
        <div className="flex bg-stone-950/40 p-1 rounded-xl border border-white/8 overflow-x-auto whitespace-nowrap scrollbar-none">
          {(['all', 'today', 'upcoming', 'overdue', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide capitalize transition-all cursor-pointer ${
                activeFilter === filter 
                  ? 'bg-[#D946C4] text-stone-950 font-bold' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {filter === 'all' ? 'All Tasks' : filter}
            </button>
          ))}
        </div>

        {/* AI suggested Toggle Chip */}
        <button
          onClick={() => setAiOnly(!aiOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide border transition-all cursor-pointer flex items-center gap-1.5 ${
            aiOnly 
              ? 'bg-[#D946C4]/15 border-[#D946C4]/40 text-[#D946C4]' 
              : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/60 hover:text-white'
          }`}
        >
          <Sparkles size={12} className={aiOnly ? 'text-[#D946C4]' : 'text-white/40'} />
          AI-Suggested Only
        </button>
      </div>

      {/* ==================== MAIN TASK LISTS ==================== */}
      <div className="space-y-6">
        {activeFilter === 'completed' ? (
          // IF filter is 'completed', show standard flat list
          <div className="space-y-3">
            {completedTasks.length > 0 ? (
              completedTasks.map((task) => (
                <TaskRow 
                  key={task.id} 
                  task={task} 
                  onToggle={handleToggleComplete} 
                  onEdit={handleStartEdit}
                  onDelete={handleDeleteTask}
                  snoozeTaskId={snoozeTaskId}
                  setSnoozeTaskId={setSnoozeTaskId}
                  onSnooze={handleSnooze}
                  onLinkClick={handleLinkedItemClick}
                />
              ))
            ) : (
              <EmptyState filter="completed" />
            )}
          </div>
        ) : (
          // Normal View: Grouped by date categories
          Object.keys(groupedTasks).length > 0 ? (
            Object.keys(groupedTasks).map((groupName) => (
              <div key={groupName} className="space-y-2.5">
                <h4 className="text-[10px] font-mono tracking-wider text-white/45 uppercase pl-1.5 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    groupName === 'Overdue' ? 'bg-red-500 animate-pulse' :
                    groupName === 'Today' ? 'bg-[#D946C4]' : 'bg-white/30'
                  }`} />
                  {groupName}
                  <span className="text-[9px] text-white/20 font-sans font-normal font-mono">
                    ({groupedTasks[groupName].length} task{groupedTasks[groupName].length > 1 ? 's' : ''})
                  </span>
                </h4>
                
                <div className="space-y-2">
                  {groupedTasks[groupName].map((task) => (
                    <TaskRow 
                      key={task.id} 
                      task={task} 
                      onToggle={handleToggleComplete} 
                      onEdit={handleStartEdit}
                      onDelete={handleDeleteTask}
                      snoozeTaskId={snoozeTaskId}
                      setSnoozeTaskId={setSnoozeTaskId}
                      onSnooze={handleSnooze}
                      onLinkClick={handleLinkedItemClick}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <EmptyState filter={activeFilter} aiOnly={aiOnly} />
          )
        )}
      </div>

      {/* ==================== COMPLETED SECTION (COLLAPSIBLE, COLLAPSED BY DEFAULT) ==================== */}
      {activeFilter !== 'completed' && completedTasks.length > 0 && (
        <div className="border-t border-white/5 pt-5 mt-4">
          <button
            onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
            className="flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white/80 transition-colors cursor-pointer pl-1.5 py-1"
          >
            {isCompletedExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>Archive: Recently Completed ({completedTasks.length})</span>
          </button>
          
          <AnimatePresence>
            {isCompletedExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3.5 space-y-2"
              >
                {completedTasks.map((task) => (
                  <TaskRow 
                    key={task.id} 
                    task={task} 
                    onToggle={handleToggleComplete} 
                    onEdit={handleStartEdit}
                    onDelete={handleDeleteTask}
                    snoozeTaskId={snoozeTaskId}
                    setSnoozeTaskId={setSnoozeTaskId}
                    onSnooze={handleSnooze}
                    onLinkClick={handleLinkedItemClick}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ==================== ADD/EDIT TASK MODAL ==================== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Dark glass background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-stone-900/95 border border-white/10 rounded-2xl p-6 shadow-2xl z-50 overflow-y-auto max-h-[90vh]"
            >
              {/* Subtle top reflection line */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-display uppercase tracking-wider">
                  {editingTask ? <Pencil size={14} className="text-[#D946C4]" /> : <Plus size={14} className="text-[#D946C4]" />}
                  {editingTask ? 'Edit Dispatch Priority' : 'Create New Priority Task'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/5 text-white/50 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Audit signed Proof of Delivery (POD) scans"
                    className="w-full bg-stone-950 border border-white/10 rounded-xl h-10 px-3.5 text-xs text-white focus:outline-none focus:border-[#D946C4]/40 focus:ring-1 focus:ring-[#D946C4]/10 placeholder-white/25"
                  />
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Due Date</label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full bg-stone-950 border border-white/10 rounded-xl h-10 px-3.5 text-xs text-white focus:outline-none focus:border-[#D946C4]/40 focus:ring-1 focus:ring-[#D946C4]/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Due Time</label>
                    <input
                      type="time"
                      value={taskDueTime}
                      onChange={(e) => setTaskDueTime(e.target.value)}
                      className="w-full bg-stone-950 border border-white/10 rounded-xl h-10 px-3.5 text-xs text-white focus:outline-none focus:border-[#D946C4]/40 focus:ring-1 focus:ring-[#D946C4]/10"
                    />
                  </div>
                </div>

                {/* Priority Toggle Option */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Priority Level</label>
                  <div className="grid grid-cols-3 bg-stone-950 p-1 rounded-xl border border-white/5">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                      <button
                        type="button"
                        key={level}
                        onClick={() => setTaskPriority(level)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          taskPriority === level 
                            ? level === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30 font-bold shadow-md' :
                              level === 'medium' ? 'bg-[#D946C4]/20 text-[#D946C4] border border-[#D946C4]/30 font-bold shadow-md' :
                              'bg-white/10 text-white border border-white/15 font-bold shadow-md'
                            : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Source Selection (Only shown when creating manually to choose AI tag if simulating, or keep standard) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Task Origin</label>
                  <div className="flex gap-4 p-1">
                    <label className="flex items-center gap-2 cursor-pointer text-white/80 select-none">
                      <input 
                        type="radio" 
                        name="taskSource" 
                        checked={taskSource === 'manual'} 
                        onChange={() => setTaskSource('manual')} 
                        className="text-[#D946C4] border-white/10"
                      />
                      <span>Dispatcher manual</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-white/80 select-none">
                      <input 
                        type="radio" 
                        name="taskSource" 
                        checked={taskSource === 'ai'} 
                        onChange={() => setTaskSource('ai')} 
                        className="text-[#D946C4] border-white/10"
                      />
                      <span className="flex items-center gap-1">
                        <Sparkles size={11} className="text-[#D946C4]" />
                        AI Agent auto-suggested
                      </span>
                    </label>
                  </div>
                </div>

                {/* Link to dropdown */}
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Link to Document/Ledger Item (Optional)</label>
                  <div className="flex gap-2">
                    {/* Choose category */}
                    <select
                      value={linkType}
                      onChange={(e) => {
                        setLinkType(e.target.value as any);
                        setLinkId('');
                      }}
                      className="bg-stone-950 border border-white/10 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/40 w-32"
                    >
                      <option value="none">No Link</option>
                      <option value="Invoice">Invoice</option>
                      <option value="Shipment">Shipment</option>
                      <option value="Client">Client</option>
                    </select>

                    {/* Choose matching entity if type selected */}
                    {linkType !== 'none' && (
                      <div className="flex-1 relative">
                        <button
                          type="button"
                          onClick={() => setShowLinkDropdown(!showLinkDropdown)}
                          className="w-full bg-stone-950 border border-white/10 rounded-xl h-10 px-3.5 text-left text-xs text-white/70 flex items-center justify-between hover:border-white/20"
                        >
                          <span className="truncate">{linkId ? linkId : 'Select Entity...'}</span>
                          <ChevronDown size={14} className="text-white/40" />
                        </button>

                        {/* Dropdown containing filtered link items */}
                        {showLinkDropdown && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowLinkDropdown(false)} />
                            <div className="absolute left-0 right-0 mt-1.5 bg-stone-950 border border-white/10 rounded-xl shadow-2xl z-50 p-2 space-y-1 max-h-48 overflow-y-auto">
                              <div className="px-2 py-1 border-b border-white/5 flex items-center gap-1.5">
                                <Search size={11} className="text-white/40" />
                                <input
                                  type="text"
                                  value={linkSearch}
                                  onChange={(e) => setLinkSearch(e.target.value)}
                                  placeholder="Search entries..."
                                  className="bg-transparent text-[11px] focus:outline-none text-white w-full"
                                />
                              </div>

                              {filteredLinkableItems.length > 0 ? (
                                filteredLinkableItems.map(item => (
                                  <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => {
                                      setLinkId(item.id);
                                      setShowLinkDropdown(false);
                                    }}
                                    className={`w-full text-left px-2 py-1.5 rounded hover:bg-white/5 text-[11px] font-mono transition-colors truncate block ${
                                      linkId === item.id ? 'bg-[#D946C4]/10 text-[#D946C4] font-bold' : 'text-white/70'
                                    }`}
                                  >
                                    {item.label}
                                  </button>
                                ))
                              ) : (
                                <p className="p-2 text-center text-[10px] text-white/30">No items found</p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Notes */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Notes & Special Guidance</label>
                  <textarea
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    rows={3}
                    placeholder="Provide compliance checks, broker numbers or other dispatch context..."
                    className="w-full bg-stone-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/40 focus:ring-1 focus:ring-[#D946C4]/10 placeholder-white/20"
                  />
                </div>

                {/* Reminder Option Toggle */}
                <div className="space-y-2 bg-stone-950/50 border border-white/5 p-3 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#D946C4]" />
                      <div>
                        <p className="font-semibold text-white">Set Pre-Arrival Warning</p>
                        <p className="text-[10px] text-white/40 mt-0.5">Draft automated push notification to dispatch portal</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={taskReminder}
                      onChange={(e) => setTaskReminder(e.target.checked)}
                      className="rounded border-white/10 text-[#D946C4] focus:ring-[#D946C4]"
                    />
                  </div>

                  {taskReminder && (
                    <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-2">
                      <span className="text-[10px] text-white/50">Remind dispatcher</span>
                      <select
                        value={taskReminderTime}
                        onChange={(e) => setTaskReminderTime(e.target.value)}
                        className="bg-stone-950 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none"
                      >
                        <option value="1 hour before">1 Hour before due time</option>
                        <option value="morning of">Morning of (08:00 AM)</option>
                        <option value="on the day">Right at due time</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Submit button row */}
                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-10 px-4 rounded-xl border border-white/10 text-white/80 hover:text-white hover:bg-white/5 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-[#D946C4] hover:bg-[#c33eb0] text-stone-950 font-bold text-xs shadow-lg cursor-pointer"
                  >
                    {editingTask ? 'Save Updates' : 'Add Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== AUXILIARY SUBCOMPONENTS ====================

interface TaskRowProps {
  key?: string | number;
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string, title: string) => void;
  snoozeTaskId: string | null;
  setSnoozeTaskId: (id: string | null) => void;
  onSnooze: (id: string, option: '1hour' | 'tomorrow' | 'nextweek') => void;
  onLinkClick: (type: 'Invoice' | 'Shipment' | 'Client', id: string) => void;
}

function TaskRow({ 
  task, 
  onToggle, 
  onEdit, 
  onDelete, 
  snoozeTaskId, 
  setSnoozeTaskId, 
  onSnooze,
  onLinkClick
}: TaskRowProps) {
  const isOverdueTask = !task.completed && task.dueDate < '2026-07-06';
  
  return (
    <div 
      className={`group relative flex items-start justify-between p-3.5 rounded-xl border transition-all ${
        task.completed 
          ? 'bg-white/[0.02] border-white/5 opacity-50' 
          : isOverdueTask 
            ? 'bg-red-500/[0.03] border-red-500/30 hover:border-red-500/40 border-l-4 border-l-red-500/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]' 
            : 'bg-white/[0.04] hover:bg-white/[0.06] border-white/10 hover:border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
      }`}
    >
      <div className="flex items-start gap-3.5 flex-1 pr-6">
        {/* Animated Checkbox Icon Button */}
        <button
          onClick={() => onToggle(task.id)}
          className="mt-0.5 text-white/50 hover:text-[#D946C4] transition-colors cursor-pointer focus:outline-none shrink-0"
        >
          {task.completed ? (
            <CheckSquare size={16} className="text-[#D946C4]" />
          ) : (
            <Square size={16} className="text-white/30 group-hover:text-white/50" />
          )}
        </button>

        <div className="space-y-1.5 flex-1 min-w-0">
          <p className={`text-xs font-semibold leading-relaxed break-words ${
            task.completed ? 'line-through text-white/30' : 'text-white'
          }`}>
            {task.title}
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Origin Icon badge */}
            <span className="text-[9px] font-mono font-medium text-white/40 flex items-center gap-1 bg-white/2 px-1.5 py-0.5 rounded border border-white/5">
              {task.source === 'ai' ? (
                <>
                  <Sparkles size={9} className="text-[#D946C4] animate-pulse" />
                  AI Suggested
                </>
              ) : (
                <>
                  <User size={9} className="text-white/40" />
                  Dispatcher
                </>
              )}
            </span>

            {/* Due date badge */}
            <span className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded flex items-center gap-1 ${
              task.completed 
                ? 'bg-white/2 text-white/30' 
                : isOverdueTask 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 font-semibold' 
                  : 'bg-white/5 text-white/50 border border-white/5'
            }`}>
              <Calendar size={9} className="opacity-60" />
              Due: {task.dueDate === '2026-07-06' ? 'Today' : task.dueDate === '2026-07-07' ? 'Tomorrow' : task.dueDate} • {task.dueTime}
            </span>

            {/* Linked Entity Pill Tag */}
            {task.linkedItem && (
              <button
                onClick={() => onLinkClick(task.linkedItem!.type, task.linkedItem!.id)}
                className="text-[9px] font-mono font-bold bg-[#D946C4]/10 hover:bg-[#D946C4]/20 text-[#D946C4] px-1.5 py-0.5 rounded border border-[#D946C4]/20 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Briefcase size={9} />
                {task.linkedItem.type}: {task.linkedItem.id}
              </button>
            )}

            {/* Reminder pill indicator if active */}
            {task.reminder && !task.completed && (
              <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/5 px-1 rounded flex items-center gap-0.5 border border-emerald-500/10">
                <Clock size={8} />
                Reminder set ({task.reminderTime})
              </span>
            )}
          </div>

          {/* Notes description expand text */}
          {task.notes && !task.completed && (
            <p className="text-[10px] text-white/45 italic font-sans leading-normal pl-1.5 border-l border-white/10 mt-1 max-w-xl">
              {task.notes}
            </p>
          )}
        </div>
      </div>

      {/* Right Side Control badges and hover actions */}
      <div className="flex items-center gap-2.5 shrink-0 relative">
        {/* Priority Badge Indicator dot */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[9px] font-semibold">
          <span className={`w-1.5 h-1.5 rounded-full ${
            task.priority === 'high' ? 'bg-red-500' :
            task.priority === 'medium' ? 'bg-[#D946C4]' : 'bg-stone-400'
          }`} />
          <span className="text-[9px] text-white/45 capitalize">{task.priority}</span>
        </div>

        {/* Action button triggers - Hover reveal in desktop, always visible in group for safety */}
        <div className="flex items-center gap-1.5 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          
          {/* Edit pencil */}
          {!task.completed && (
            <button
              onClick={() => onEdit(task)}
              className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Edit Task"
            >
              <Pencil size={12} />
            </button>
          )}

          {/* Snooze button & dropdown container */}
          {!task.completed && (
            <div className="relative">
              <button
                onClick={() => setSnoozeTaskId(snoozeTaskId === task.id ? null : task.id)}
                className={`w-7 h-7 rounded-lg hover:bg-white/10 text-white/50 hover:text-[#D946C4] flex items-center justify-center transition-colors cursor-pointer ${
                  snoozeTaskId === task.id ? 'bg-white/10 text-[#D946C4]' : ''
                }`}
                title="Snooze Task"
              >
                <Clock size={12} />
              </button>

              <AnimatePresence>
                {snoozeTaskId === task.id && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setSnoozeTaskId(null)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      className="absolute right-0 mt-1 w-32 rounded-xl bg-stone-950 border border-white/10 shadow-2xl z-40 p-1 space-y-0.5"
                    >
                      <button
                        onClick={() => onSnooze(task.id, '1hour')}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/5 text-[10px] text-white/80 hover:text-white font-medium transition-colors cursor-pointer"
                      >
                        In 1 Hour
                      </button>
                      <button
                        onClick={() => onSnooze(task.id, 'tomorrow')}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/5 text-[10px] text-white/80 hover:text-white font-medium transition-colors cursor-pointer"
                      >
                        Tomorrow morning
                      </button>
                      <button
                        onClick={() => onSnooze(task.id, 'nextweek')}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/5 text-[10px] text-white/80 hover:text-white font-medium transition-colors cursor-pointer"
                      >
                        Next week
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Delete trash */}
          <button
            onClick={() => onDelete(task.id, task.title)}
            className="w-7 h-7 rounded-lg hover:bg-red-500/10 text-white/35 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
            title="Delete Task"
          >
            <Trash2 size={12} />
          </button>

        </div>
      </div>
    </div>
  );
}

function EmptyState({ filter, aiOnly }: { filter: string; aiOnly?: boolean }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center text-white/30 h-44">
      <Briefcase size={24} className="opacity-40 mb-2.5 text-[#D946C4]" />
      <p className="text-xs font-semibold text-white/70">No tasks in this lane</p>
      <p className="text-[10px] text-white/40 mt-1 max-w-xs">
        {aiOnly 
          ? "There are no AI assistant-suggested items here." 
          : `All tasks filtered under "${filter}" have been fully dispatched.`}
      </p>
    </div>
  );
}
