import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  X, 
  ChevronUp, 
  Calendar, 
  ListTodo, 
  Truck, 
  DollarSign, 
  AlertCircle, 
  ArrowRight, 
  Check, 
  ChevronDown, 
  CornerDownLeft,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageId } from '../types';

interface MascotAssistantProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
}

// Session history type
interface MascotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  // If the message contains a structured card, store its attributes here
  structuredData?: {
    type: 'todo' | 'calendar' | 'shipment' | 'finance' | 'error';
    title: string;
    fields: { label: string; value: string }[];
    rawData: any; // Raw parsed values to save on confirm
  };
  confirmed?: boolean;
  cancelled?: boolean;
}

function DropletMascot({ state, size = 120 }: { state: 'idle' | 'listening' | 'processing' | 'success' | 'shrug', size?: number }) {
  // Float sequence (Slow, gentle vertical float of 4.5px and subtle 0.4 degree rotation sway)
  const floatAnim = {
    y: [0, -4.5, 0],
    rotate: [0, 0.4, 0],
    scale: state === 'listening' ? [1, 1.04, 1] : 1,
    transition: {
      duration: state === 'listening' ? 2.5 : 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Shadow sequence (Shrinks and fades slightly less to match the smaller float distance)
  const shadowAnim = {
    scaleX: [1, 0.93, 1],
    scaleY: [1, 0.95, 1],
    opacity: [0.35, 0.27, 0.35],
    transition: {
      duration: state === 'listening' ? 2.5 : 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // State-based shake animation for shrug/cancelled or error
  const shrugAnim = state === 'shrug' ? {
    x: [0, -4, 4, -4, 4, 0],
    rotate: [0, -3, 3, -3, 3, 0],
    transition: {
      duration: 0.6,
      repeat: 2,
      ease: "easeInOut"
    }
  } : {};

  // State-based bounce for success
  const successAnim = state === 'success' ? {
    y: [0, -25, 0, -12, 0],
    scaleY: [1, 0.8, 1.1, 0.9, 1],
    scaleX: [1, 1.2, 0.9, 1.05, 1],
    transition: {
      duration: 1.0,
      ease: "easeOut"
    }
  } : {};

  // Processing eye rotation animation (very subtle rotating highlight dots)
  const eyeDotRotate = state === 'processing' ? {
    rotate: 360,
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear"
    }
  } : {};

  // Generate unique ID suffix to avoid SVG clipPath conflicts across multiple components
  const idSuffix = React.useId().replace(/:/g, "");

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size * 1.15 }}>
      {/* GLOWING AURA WHEN LISTENING */}
      {state === 'listening' && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#D946C4]/15 to-[#7C6FE0]/15 filter blur-xl animate-pulse scale-125 pointer-events-none" />
      )}

      {/* FLOATING DROPLET WRAPPER */}
      <motion.div
        animate={state === 'success' ? successAnim : state === 'shrug' ? shrugAnim : floatAnim}
        className="w-full h-full relative z-10 flex items-center justify-center pointer-events-none"
      >
        <svg 
          viewBox="0 0 260 300" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xl"
        >
          <defs>
            {/* Clip Path for Specular Highlight */}
            <clipPath id={`body-clip-${idSuffix}`}>
              <path d="M130 26 C170 78 212 132 214 178 C216 226 178 256 130 256 C82 256 44 226 46 178 C48 132 90 78 130 26 Z" />
            </clipPath>

            {/* Body Linear Gradient: Linear from top-left to bottom-right */}
            <linearGradient id={`body-grad-${idSuffix}`} x1="0.1" y1="0.1" x2="0.9" y2="0.9">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#F0EBFA" />
              <stop offset="70%" stopColor="#D9CDF2" />
              <stop offset="100%" stopColor="#C3B3E8" />
            </linearGradient>

            {/* Rim light gradient: Linear from muted pink to muted violet */}
            <linearGradient id={`rim-grad-${idSuffix}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E0A9D8" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#E0A9D8" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#9C90D8" stopOpacity="0.3" />
            </linearGradient>

            {/* Eye Glow Radial Gradient */}
            <radialGradient id={`eye-glow-${idSuffix}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F3DCF0" />
              <stop offset="50%" stopColor="#C77BC2" />
              <stop offset="100%" stopColor="#8A5E9E" />
            </radialGradient>
          </defs>

          {/* Left paw (fuzzy scalloped shape) */}
          <path 
            d="M28 172 C10 172 -2 188 4 204 C10 218 26 222 38 216 C46 224 60 224 66 214 C74 218 84 210 82 198 C88 190 84 176 72 174 C68 164 52 160 44 168 C38 164 30 166 28 172 Z" 
            fill={`url(#body-grad-${idSuffix})`}
            stroke="#D9CDF2"
            strokeWidth="1.5"
            className="transition-transform duration-300"
            style={{ 
              transformOrigin: "44px 198px",
              transform: state === 'listening' ? 'rotate(-10deg)' : state === 'success' ? 'rotate(15deg) translateY(-3px)' : 'none'
            }}
          />

          {/* Right paw (mirrored fuzzy scalloped shape) */}
          <path 
            d="M232 172 C250 172 262 188 256 204 C250 218 234 222 222 216 C214 224 200 224 194 214 C186 218 176 210 178 198 C172 190 176 176 188 174 C192 164 208 160 216 168 C222 164 230 166 232 172 Z" 
            fill={`url(#body-grad-${idSuffix})`}
            stroke="#D9CDF2"
            strokeWidth="1.5"
            className="transition-transform duration-300"
            style={{ 
              transformOrigin: "216px 198px",
              transform: state === 'listening' ? 'rotate(10deg)' : state === 'success' ? 'rotate(-15deg) translateY(-3px)' : 'none'
            }}
          />

          {/* Droplet Body */}
          <path 
            d="M130 26 C170 78 212 132 214 178 C216 226 178 256 130 256 C82 256 44 226 46 178 C48 132 90 78 130 26 Z" 
            fill={`url(#body-grad-${idSuffix})`}
          />

          {/* Rim light overlay: soft-glow rim/edge highlight */}
          <path 
            d="M130 26 C170 78 212 132 214 178 C216 226 178 256 130 256 C82 256 44 226 46 178 C48 132 90 78 130 26 Z" 
            stroke={`url(#rim-grad-${idSuffix})`}
            strokeWidth="4"
            fill="none"
          />

          {/* Specular highlight clipped inside droplet body outline */}
          <g clipPath={`url(#body-clip-${idSuffix})`}>
            {/* Soft white specular highlight patch on upper-left (at roughly 40% opacity) */}
            <ellipse 
              cx="92" 
              cy="80" 
              rx="28" 
              ry="45" 
              transform="rotate(-28 92 80)" 
              fill="#FFFFFF" 
              opacity="0.4" 
            />
          </g>

          {/* EYE DETAILS & GLOWS */}
          <g>
            {/* Left Eye Radial Glow */}
            <circle cx="107" cy="184" r="10" fill={`url(#eye-glow-${idSuffix})`} />
            {/* Rotating Left eye highlight dot */}
            <motion.circle 
              cx="104" 
              cy="181" 
              r="3.2" 
              fill="#FFFFFF" 
              style={{ originX: "107px", originY: "184px" }}
              animate={eyeDotRotate}
            />

            {/* Right Eye Radial Glow */}
            <circle cx="153" cy="184" r="10" fill={`url(#eye-glow-${idSuffix})`} />
            {/* Rotating Right eye highlight dot */}
            <motion.circle 
              cx="150" 
              cy="181" 
              r="3.2" 
              fill="#FFFFFF" 
              style={{ originX: "153px", originY: "184px" }}
              animate={eyeDotRotate}
            />
          </g>

          {/* EXPRESSIVE SMILE / MOUTH */}
          {state === 'shrug' ? (
            /* Gentle frowny curve for shrug / cancelled state */
            <path 
              d="M122 198 Q130 192 138 198" 
              stroke="#A98FC7" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              fill="none" 
            />
          ) : state === 'success' ? (
            /* Big excited happy curve for success state */
            <path 
              d="M118 193 Q130 203 142 193" 
              stroke="#A98FC7" 
              strokeWidth="4" 
              strokeLinecap="round" 
              fill="none" 
            />
          ) : (
            /* Standard cozy smile curve between the eyes */
            <path 
              d="M122 195 Q130 201 138 195" 
              stroke="#A98FC7" 
              strokeWidth="3" 
              strokeLinecap="round" 
              fill="none" 
            />
          )}
        </svg>
      </motion.div>

      {/* VERTICAL SYNCED SOFT SHADOW ELLIPSE */}
      <motion.div
        animate={shadowAnim}
        style={{ originX: "50%", originY: "50%" }}
        className="absolute bottom-1 w-[80%] h-3 bg-indigo-950/25 blur-[3px] rounded-full z-0 pointer-events-none"
      />
    </div>
  );
}

export default function MascotAssistant({ activePage, setActivePage }: MascotAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [input, setInput] = useState('');
  
  // States: 'idle' | 'listening' | 'processing' | 'success' | 'error' | 'shrug'
  const [mascotState, setMascotState] = useState<'idle' | 'listening' | 'processing' | 'success' | 'shrug'>('idle');
  
  const [hasUnread, setHasUnread] = useState(false);
  
  // Voice recording mock variables
  const [listeningTimer, setListeningTimer] = useState<NodeJS.Timeout | null>(null);
  const [waveformBars, setWaveformBars] = useState<number[]>([10, 20, 15, 30, 25, 40, 20, 15, 10]);

  // Chat conversation history inside this session
  const [messages, setMessages] = useState<MascotMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hey there! I'm Vanguard's Quick Dispatch mascot. Tell or show me anything—I can add tasks, schedule calendar loads, book shipments, or log trip cash. Try typing or speaking!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Responsive layout checker
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to bottom on updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, mascotState]);

  // Waveform animation when listening
  useEffect(() => {
    let animId: any;
    if (mascotState === 'listening') {
      const updateWaveform = () => {
        setWaveformBars(prev => prev.map(() => Math.floor(Math.random() * 35) + 5));
        animId = setTimeout(updateWaveform, 100);
      };
      updateWaveform();
    } else {
      setWaveformBars([10, 20, 15, 30, 25, 40, 20, 15, 10]);
    }
    return () => clearTimeout(animId);
  }, [mascotState]);

  // Auto-bounce mascot on mount
  useEffect(() => {
    setHasUnread(true);
    const timer = setTimeout(() => {
      setHasUnread(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Contextual chips depending on the current page
  const getContextualChips = () => {
    switch (activePage) {
      case 'shipments':
        return [
          { label: "Book: Amit Sharma, Delhi to Mumbai", text: "Create booking for Amit Sharma from Delhi to Mumbai, Eicher 14ft, ₹18,500" },
          { label: "Add load: Titan Supply, Jaipur to Noida", text: "New shipment for Titan Industrial Jaipur to Noida, 32ft Multi-Axle, ₹58,000" }
        ];
      case 'calendar':
        return [
          { label: "Meeting with Vikram on the 8th", text: "Add event Client Meeting with Vikram on July 8 at 11:00 AM" },
          { label: "Remind cargo pickup at 9am", text: "Schedule pickup load for July 12 at 09:00 AM" }
        ];
      case 'finance':
        return [
          { label: "Spent ₹12,500 on HP Fuel", text: "Log expense for Fuel, ₹12,500, HP Fuel Station refill" },
          { label: "Received ₹50,000 advance", text: "Log income for Freight Revenue, ₹50,000, Apex Foods advance" }
        ];
      case 'todo':
        return [
          { label: "Todo: Confirm rate lock tomorrow", text: "Add task Confirm rate lock with APX Food client tomorrow at 3 PM, Priority High" },
          { label: "Remind me to call Amit", text: "Add to-do Call Amit Sharma to clear overdue invoice #1042 today" }
        ];
      default:
        return [
          { label: "Add task: Call driver", text: "Add task Call driver Alex Singh about load placement tomorrow at 9 AM" },
          { label: "Spent ₹8,000 on toll", text: "Log expense for Tolls & Permits, ₹8,000, NH48 Corridor expressway" },
          { label: "Book truck: Delhi to Patna", text: "Book shipment Apex Foods from Delhi to Patna, 22ft Container" }
        ];
    }
  };

  // Parsing commands engine
  const parseCommand = (text: string): MascotMessage['structuredData'] => {
    const cleanText = text.toLowerCase().trim();

    // 1. Check for FINANCE log
    if (
      cleanText.includes('spent') || 
      cleanText.includes('spend') || 
      cleanText.includes('expense') || 
      cleanText.includes('income') || 
      cleanText.includes('received') || 
      cleanText.includes('log transaction') || 
      cleanText.includes('paid') || 
      cleanText.includes('cost') ||
      cleanText.includes('revenue') ||
      cleanText.match(/₹?\d+/) && (cleanText.includes('fuel') || cleanText.includes('toll') || cleanText.includes('driver') || cleanText.includes('salary') || cleanText.includes('freight'))
    ) {
      const isIncome = cleanText.includes('received') || cleanText.includes('income') || cleanText.includes('earned') || cleanText.includes('revenue');
      const amountMatch = text.match(/(?:₹|rs\.?|inr)?\s*([\d,]+)/i);
      const amountVal = amountMatch ? parseInt(amountMatch[1].replace(/,/g, ''), 10) : 5000;
      
      let category = isIncome ? 'Freight Revenue' : 'Fuel';
      if (cleanText.includes('toll')) category = 'Tolls & Permits';
      else if (cleanText.includes('driver')) category = 'Driver Payment';
      else if (cleanText.includes('maintain') || cleanText.includes('repair')) category = 'Maintenance';
      else if (cleanText.includes('load')) category = 'Loading/Unloading';

      let description = text;
      // Truncate some common prefixes for descriptive clarity
      description = description.replace(/log expense|log income|spent|received|add transaction/gi, '').trim();
      description = description.charAt(0).toUpperCase() + description.slice(1);

      return {
        type: 'finance',
        title: `Log ${isIncome ? 'Income' : 'Expense'} Transaction`,
        fields: [
          { label: 'Type', value: isIncome ? 'Income' : 'Expense' },
          { label: 'Category', value: category },
          { label: 'Amount', value: `₹${amountVal.toLocaleString('en-IN')}` },
          { label: 'Description', value: description || `${category} payment` },
          { label: 'Date', value: '2026-07-06' }
        ],
        rawData: {
          type: isIncome ? 'Income' : 'Expense',
          category,
          amount: amountVal,
          date: '2026-07-06',
          description: description || `${category} payment`
        }
      };
    }

    // 2. Check for CALENDAR event
    if (
      cleanText.includes('event') || 
      cleanText.includes('calendar') || 
      cleanText.includes('schedule') || 
      cleanText.includes('meeting') || 
      cleanText.includes('pickup') || 
      cleanText.includes('appointment')
    ) {
      // Date extraction helper
      let dateVal = '2026-07-06';
      if (cleanText.includes('tomorrow')) {
        dateVal = '2026-07-07';
      } else if (cleanText.includes('15th')) {
        dateVal = '2026-07-15';
      } else if (cleanText.includes('8th')) {
        dateVal = '2026-07-08';
      } else if (cleanText.includes('12th')) {
        dateVal = '2026-07-12';
      } else {
        // Look for month matching e.g. July 10
        const julMatch = cleanText.match(/july\s+(\d+)/);
        if (julMatch) dateVal = `2026-07-${julMatch[1].padStart(2, '0')}`;
      }

      // Time extraction helper
      let timeVal = '10:00';
      const timeMatch = cleanText.match(/(\d+)(?::(\d+))?\s*(am|pm)/);
      if (timeMatch) {
        let hr = parseInt(timeMatch[1], 10);
        const min = timeMatch[2] ? timeMatch[2] : '00';
        const meridian = timeMatch[3];
        if (meridian === 'pm' && hr < 12) hr += 12;
        if (meridian === 'am' && hr === 12) hr = 0;
        timeVal = `${hr.toString().padStart(2, '0')}:${min}`;
      }

      let title = text.replace(/create an event|add event|add to calendar|schedule/gi, '').trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);
      if (!title) title = 'Scheduled Load Pickup';

      let evType: 'pickup' | 'meeting' | 'reminder' | 'payment' | 'custom' = 'meeting';
      if (cleanText.includes('pickup') || cleanText.includes('delivery')) evType = 'pickup';
      else if (cleanText.includes('remind') || cleanText.includes('follow-up')) evType = 'reminder';
      else if (cleanText.includes('pay') || cleanText.includes('invoice')) evType = 'payment';

      return {
        type: 'calendar',
        title: 'Schedule Calendar Event',
        fields: [
          { label: 'Event Title', value: title },
          { label: 'Type', value: evType.toUpperCase() },
          { label: 'Date/Time', value: `${dateVal} at ${timeVal}` },
          { label: 'Duration', value: '1 hour' }
        ],
        rawData: {
          title,
          type: evType,
          dateTime: `${dateVal}T${timeVal}`,
          duration: '1 hour',
          reminders: ['1day']
        }
      };
    }

    // 3. Check for SHIPMENT / Booking
    if (
      cleanText.includes('shipment') || 
      cleanText.includes('booking') || 
      cleanText.includes('book shipment') || 
      cleanText.includes('book truck') || 
      cleanText.includes('load scheduled')
    ) {
      // Find client name in string
      let client = 'Apex Foods International';
      if (cleanText.includes('sharma') || cleanText.includes('amit')) client = 'Amit Sharma';
      else if (cleanText.includes('titan') || cleanText.includes('vikram')) client = 'Titan Industrial Supply';
      else if (cleanText.includes('sanjay') || cleanText.includes('noida freight')) client = 'Sanjay Dutt';

      // Route cities
      let routeFrom = 'Delhi';
      let routeTo = 'Mumbai';
      const routeMatch = text.match(/from\s+([a-zA-Z\s]+)\s+to\s+([a-zA-Z\s]+)/i);
      if (routeMatch) {
        routeFrom = routeMatch[1].trim();
        routeTo = routeMatch[2].split(',')[0].replace(/ Eicher| 22ft| ₹/gi, '').trim();
      }

      // Truck size
      let truckSize = '22ft Container';
      if (cleanText.includes('14ft') || cleanText.includes('eicher')) truckSize = 'Eicher 14ft';
      else if (cleanText.includes('32ft') || cleanText.includes('multi-axle')) truckSize = '32ft Multi-Axle';
      else if (cleanText.includes('lcv') || cleanText.includes('407')) truckSize = '407 LCV';

      // Amount calculation
      let amount = 45000;
      if (truckSize === 'Eicher 14ft') amount = 18500;
      else if (truckSize === '32ft Multi-Axle') amount = 58000;
      else if (truckSize === '407 LCV') amount = 12000;

      const amtMatch = text.match(/(?:₹|rs\.?|inr)?\s*([\d,]+)/i);
      if (amtMatch) {
        const parsed = parseInt(amtMatch[1].replace(/,/g, ''), 10);
        if (parsed > 1000) amount = parsed;
      }

      return {
        type: 'shipment',
        title: 'Create Pending Shipment',
        fields: [
          { label: 'Client Shipper', value: client },
          { label: 'Lane (Route)', value: `${routeFrom} → ${routeTo}` },
          { label: 'Truck Class', value: truckSize },
          { label: 'Estimated Rate', value: `₹${amount.toLocaleString('en-IN')}` },
          { label: 'Status', value: 'Pending Confirmation' }
        ],
        rawData: {
          clientName: client,
          companyName: client.includes('Sharma') ? 'Apex Foods International' : (client.includes('Titan') ? 'Titan Industrial Supply' : 'Noida Freight Carriers'),
          routeFrom,
          routeTo,
          truckSize,
          truckNo: 'TBD',
          status: 'Pending Confirmation',
          pickupDate: '2026-07-06',
          amount,
          source: 'ai'
        }
      };
    }

    // 4. Check for TO-DO task
    if (
      cleanText.includes('to-do') || 
      cleanText.includes('todo') || 
      cleanText.includes('task') || 
      cleanText.includes('remind') ||
      cleanText.includes('call') ||
      cleanText.includes('confirm') ||
      cleanText.includes('audit') ||
      cleanText.includes('verify')
    ) {
      let priority: 'high' | 'medium' | 'low' = 'medium';
      if (cleanText.includes('high') || cleanText.includes('urgent') || cleanText.includes('asap')) priority = 'high';
      else if (cleanText.includes('low') || cleanText.includes('later')) priority = 'low';

      let dueDate = '2026-07-06'; // Today
      if (cleanText.includes('tomorrow')) {
        dueDate = '2026-07-07';
      } else if (cleanText.includes('next week')) {
        dueDate = '2026-07-13';
      }

      let title = text.replace(/add to-do|add todo|add task|remind me to/gi, '').trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);
      if (!title) title = 'Confirm custom shipping requirement';

      return {
        type: 'todo',
        title: 'Create To-Do Task',
        fields: [
          { label: 'Task Name', value: title },
          { label: 'Due Date', value: dueDate === '2026-07-06' ? 'Today (July 6)' : 'Tomorrow (July 7)' },
          { label: 'Priority', value: priority.toUpperCase() },
          { label: 'Source', value: 'VANGUARD AI' }
        ],
        rawData: {
          title,
          dueDate,
          dueTime: '17:00',
          priority,
          source: 'ai',
          notes: 'Auto-created via Vanguard Global Mascot Assistant widget.',
          reminder: true,
          reminderTime: 'morning of',
          completed: false
        }
      };
    }

    // Default unrecognized fallback
    return {
      type: 'error',
      title: 'Action Unrecognized',
      fields: [
        { label: 'Query', value: text },
        { label: 'Reason', value: "I'm not sure how to dispatch that action yet. Let's try formatting it as a task, event, shipment, or financial log." }
      ],
      rawData: null
    };
  };

  // Submit typed command
  const handleSubmitCommand = (textSubmit: string) => {
    if (!textSubmit.trim()) return;

    // Add user message
    const userMsg: MascotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textSubmit,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setMascotState('processing');

    // Simulate understanding processing lag
    setTimeout(() => {
      const parsed = parseCommand(textSubmit);

      let assistMsg: MascotMessage;
      if (parsed.type === 'error') {
        setMascotState('shrug');
        assistMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: "I couldn't quite extract a structured logistical command from that. Could you try wording it clearly? E.g., 'Add task Call Sharma ji tomorrow' or 'Log expense ₹15000 for Fuel'.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          structuredData: parsed
        };
      } else {
        setMascotState('idle');
        assistMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: `Got it! I've analyzed your instructions. Here is the structured request I extracted. Shall I compile and deploy this to your database?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          structuredData: parsed
        };
      }

      setMessages(prev => [...prev, assistMsg]);
    }, 1200);
  };

  // Confirm Action
  const handleConfirmAction = (msgId: string, structuredData: NonNullable<MascotMessage['structuredData']>) => {
    setMascotState('processing');

    setTimeout(() => {
      // Execute local state update depending on type
      const data = structuredData.rawData;
      let targetPage: PageId = 'dashboard';
      let successMessage = '';

      if (structuredData.type === 'todo') {
        const existingStr = localStorage.getItem('vanguard_tasks');
        const existing: any[] = existingStr ? JSON.parse(existingStr) : [];
        const newTask = {
          ...data,
          id: `task-${Date.now()}`
        };
        const updated = [newTask, ...existing];
        localStorage.setItem('vanguard_tasks', JSON.stringify(updated));
        window.dispatchEvent(new Event('vanguard-todo-updated'));
        
        targetPage = 'todo';
        successMessage = "Task successfully queued on your To-Do list!";

        // Also post to global alerts feed
        triggerGlobalNotification('Task Created', `New Task: ${newTask.title}`, 'reminder');
      } 
      else if (structuredData.type === 'calendar') {
        const existingStr = localStorage.getItem('vanguard_events');
        const existing: any[] = existingStr ? JSON.parse(existingStr) : [];
        const newEvent = {
          ...data,
          id: `cust-${Date.now()}`
        };
        const updated = [newEvent, ...existing];
        localStorage.setItem('vanguard_events', JSON.stringify(updated));
        window.dispatchEvent(new Event('vanguard-calendar-updated'));

        targetPage = 'calendar';
        successMessage = "Event added! Real-time logistics dispatch timeline updated.";

        triggerGlobalNotification('Event Scheduled', `Calendar load event booked: ${newEvent.title}`, 'reminder');
      } 
      else if (structuredData.type === 'shipment') {
        const existingStr = localStorage.getItem('vanguard_shipments');
        const existing: any[] = existingStr ? JSON.parse(existingStr) : [];
        const newShipment = {
          ...data,
          id: `TRK-${Math.floor(Math.random() * 9000) + 1000}`,
          activityLog: [
            { time: '2026-07-06 14:28 PM', message: 'Mascot AI Assistant auto-created shipment in pending state.', type: 'status' }
          ]
        };
        const updated = [newShipment, ...existing];
        localStorage.setItem('vanguard_shipments', JSON.stringify(updated));
        window.dispatchEvent(new Event('vanguard_shipments_updated'));

        targetPage = 'shipments';
        successMessage = "Pending Booking registered! Ready for WhatsApp verification.";

        triggerGlobalNotification('Booking Registered', `Pending load ${newShipment.id} created for ${newShipment.clientName}`, 'ai');
      } 
      else if (structuredData.type === 'finance') {
        const existingStr = localStorage.getItem('vanguard_transactions');
        const existing: any[] = existingStr ? JSON.parse(existingStr) : [];
        const newTxn = {
          ...data,
          id: `TXN-${Date.now().toString().slice(-4)}`
        };
        const updated = [newTxn, ...existing];
        localStorage.setItem('vanguard_transactions', JSON.stringify(updated));
        window.dispatchEvent(new Event('vanguard-finance-updated'));

        targetPage = 'finance';
        successMessage = `Ledger entry posted: ₹${newTxn.amount.toLocaleString('en-IN')} logged under ${newTxn.category}.`;

        triggerGlobalNotification('Ledger Entry Posted', `${newTxn.type} logged: ₹${newTxn.amount} for ${newTxn.category}`, 'payment');
      }

      setMascotState('success');

      // Update message state as confirmed
      setMessages(prev => prev.map(m => {
        if (m.id === msgId) {
          return { ...m, confirmed: true };
        }
        return m;
      }));

      // Append success message with mascot reaction
      const successReply: MascotMessage = {
        id: `msg-success-${Date.now()}`,
        sender: 'assistant',
        text: `${successMessage} ✅`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredData: {
          type: 'todo', // neutral display
          title: 'Operation Confirmed',
          fields: [
            { label: 'Status', value: 'Successfully Posted' },
            { label: 'Hub Sync', value: '100% synchronized' }
          ],
          rawData: null
        },
        confirmed: true
      };

      setMessages(prev => [...prev, successReply]);

      // Reset mascot state to idle after feedback
      setTimeout(() => {
        setMascotState('idle');
      }, 2000);

    }, 1500);
  };

  // Helper to trigger global notifications top-right bell & toast
  const triggerGlobalNotification = (title: string, desc: string, type: 'overdue' | 'ai' | 'reminder' | 'payment') => {
    // 1. Toast Event
    window.dispatchEvent(new CustomEvent('vanguard-new-notification-toast', {
      detail: { title, desc, type }
    }));

    // 2. Add to notification list in storage
    const savedNotifs = localStorage.getItem('vanguard_notifications');
    const list = savedNotifs ? JSON.parse(savedNotifs) : [];
    const newNotif = {
      id: `notif-${Date.now()}`,
      type,
      title,
      desc,
      time: 'Just now',
      timestamp: new Date().toISOString(),
      read: false
    };
    localStorage.setItem('vanguard_notifications', JSON.stringify([newNotif, ...list]));
    window.dispatchEvent(new Event('vanguard-notifications-updated'));
  };

  // Cancel Action
  const handleCancelAction = (msgId: string) => {
    setMascotState('shrug');
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return { ...m, cancelled: true };
      }
      return m;
    }));

    const cancelReply: MascotMessage = {
      id: `msg-cancel-${Date.now()}`,
      sender: 'assistant',
      text: "Understood, operator. I've discarded those parsed values. Let me know if you want to try a different instruction!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, cancelReply]);

    setTimeout(() => {
      setMascotState('idle');
    }, 2000);
  };

  // Speak Voice Command (Mocked flow)
  const handleVoiceRecording = () => {
    if (mascotState === 'listening') return;

    setMascotState('listening');
    
    // Auto-record and transcribe after 3.5s delay
    const timer = setTimeout(() => {
      // Pick a random cool prewritten command to mock voice input
      const mocks = [
        "Confirm rate lock tomorrow at 3 PM with Apex Foods client, priority high",
        "Create client meeting with Vikram Singh on July 8 at 11 AM",
        "Log a HP Fuel card payment of ₹12,500 on route LD-9821",
        "Create shipment Amit Sharma from Delhi to Ahmedabad Eicher 14ft ₹18,500"
      ];
      const randomMockText = mocks[Math.floor(Math.random() * mocks.length)];
      
      // Update state to typing transition
      setMascotState('processing');
      
      // Show transcribed text as User chat bubble
      const transcribedUserMsg: MascotMessage = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        text: `🎙️ "${randomMockText}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, transcribedUserMsg]);

      // Parse and display structured output
      setTimeout(() => {
        const parsed = parseCommand(randomMockText);
        setMascotState('idle');
        
        const assistMsg: MascotMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: `Voila! I transcribed your speech successfully. Here are the structured parameters I locked in:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          structuredData: parsed
        };
        setMessages(prev => [...prev, assistMsg]);
      }, 1200);

    }, 3500);

    setListeningTimer(timer);
  };

  // Cancel voice recording before it transcribes
  const handleCancelVoice = () => {
    if (listeningTimer) {
      clearTimeout(listeningTimer);
      setListeningTimer(null);
    }
    setMascotState('idle');
  };

  return (
    <>
      {/* MASCOT BUTTON / COLLAPSED STATE */}
      <div 
        id="global-mascot-widget-wrapper" 
        className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none"
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              id="mascot-launcher-btn"
              onClick={() => { setIsOpen(true); setHasUnread(false); }}
              initial={{ scale: 0, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0, y: 50, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-[#D946C4] via-[#9F3CC7] to-[#7C6FE0] flex items-center justify-center cursor-pointer shadow-2xl shadow-[#D946C4]/30 pointer-events-auto border-2 border-white/20 select-none group"
            >
              {/* Outer Pulsing Glow Aura */}
              <div className="absolute inset-0 rounded-full bg-[#D946C4] opacity-25 group-hover:scale-125 transition-transform duration-1000 animate-ping pointer-events-none" />
              
              {/* Notification Dot */}
              {hasUnread && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 border border-white flex items-center justify-center animate-bounce">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </span>
              )}

              {/* mascot droplet visual representation */}
              <div className="relative z-10 flex items-center justify-center">
                <DropletMascot state={mascotState} size={46} />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* EXPANDED ASSISTANT PANEL */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mascot-expanded-panel"
              initial={isMobile ? { y: '100%', opacity: 0 } : { y: 100, scale: 0.8, opacity: 0 }}
              animate={isMobile ? { y: 0, opacity: 1 } : { y: 0, scale: 1, opacity: 1 }}
              exit={isMobile ? { y: '100%', opacity: 0 } : { y: 50, scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 220 }}
              className={`bg-stone-950/95 border border-[rgba(217,70,196,0.18)] flex flex-col overflow-hidden shadow-2xl pointer-events-auto select-none ${
                isMobile 
                  ? 'fixed inset-x-0 bottom-0 h-[85vh] rounded-t-3xl z-50' 
                  : 'w-[360px] h-[500px] rounded-2xl mb-2'
              }`}
            >
              {/* PANEL HEADER */}
              <div className="p-4 border-b border-[#D946C4]/12 flex items-center justify-between bg-white/3 shrink-0">
                <div className="flex items-center gap-3">
                  {/* Small Circular Avatar Mascot */}
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D946C4]/15 to-[#7C6FE0]/15 border border-[#D946C4]/20 flex items-center justify-center overflow-hidden shrink-0">
                    <DropletMascot state={mascotState} size={26} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#F2EEF9]">Vanguard Cadet</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${mascotState === 'listening' ? 'animate-ping' : ''}`} />
                      <span className="text-[9px] font-mono text-[#D946C4] tracking-wide uppercase">
                        {mascotState === 'idle' ? 'Standby' : mascotState === 'listening' ? 'Listening...' : mascotState === 'processing' ? 'Dispatching...' : 'Complete'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      setActivePage('ai-assistant');
                      setIsOpen(false);
                    }}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer"
                    title="Open full workspace assistant"
                  >
                    <Sparkles size={14} className="text-[#D946C4]" />
                  </button>
                  <button 
                    onClick={() => { setIsOpen(false); handleCancelVoice(); }}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* CHAT LOG AREA */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0 bg-stone-950/20">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`p-3 max-w-[85%] rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-r from-[#D946C4]/20 to-[#7C6FE0]/20 border border-[#D946C4]/25 text-[#F2EEF9] rounded-tr-none' 
                        : 'bg-white/5 text-stone-300 rounded-tl-none border border-white/5'
                    }`}>
                      {msg.text}

                      {/* STRUCTURED CONFIRMATION CARD */}
                      {msg.structuredData && (
                        <div className="mt-3 bg-stone-900/90 rounded-xl border border-[rgba(217,70,196,0.22)] p-3 space-y-2.5">
                          <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                            {msg.structuredData.type === 'todo' && <ListTodo size={13} className="text-[#D946C4]" />}
                            {msg.structuredData.type === 'calendar' && <Calendar size={13} className="text-[#7C6FE0]" />}
                            {msg.structuredData.type === 'shipment' && <Truck size={13} className="text-amber-400" />}
                            {msg.structuredData.type === 'finance' && <DollarSign size={13} className="text-emerald-400" />}
                            {msg.structuredData.type === 'error' && <AlertCircle size={13} className="text-red-400" />}
                            <span className="font-semibold text-[11px] text-[#F2EEF9]">{msg.structuredData.title}</span>
                          </div>

                          <div className="space-y-1.5">
                            {msg.structuredData.fields.map((f, i) => (
                              <div key={i} className="flex justify-between items-start text-[10px] gap-2">
                                <span className="text-[#9090A6]/80 shrink-0 font-mono">{f.label}:</span>
                                <span className="text-[#F2EEF9]/95 text-right font-medium break-all">{f.value}</span>
                              </div>
                            ))}
                          </div>

                          {/* ACTION BUTTONS (only active if not resolved) */}
                          {msg.structuredData.type !== 'error' && !msg.confirmed && !msg.cancelled && (
                            <div className="flex items-center gap-2 pt-2 border-t border-white/5 shrink-0">
                              <button
                                onClick={() => handleConfirmAction(msg.id, msg.structuredData!)}
                                className="flex-1 py-1 px-2.5 rounded-lg bg-[#D946C4] hover:bg-[#e652d1] text-stone-950 font-bold text-[10px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Check size={11} strokeWidth={3} /> Confirm
                              </button>
                              <button
                                onClick={() => handleCancelAction(msg.id)}
                                className="flex-1 py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 font-semibold text-[10px] cursor-pointer border border-white/10 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {msg.confirmed && (
                            <div className="pt-1.5 border-t border-white/5 flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-400">
                              <Check size={12} strokeWidth={3} /> Logged in Database
                            </div>
                          )}

                          {msg.cancelled && (
                            <div className="pt-1.5 border-t border-white/5 flex items-center justify-center gap-1 text-[10px] font-semibold text-white/30">
                              Discarded / Cancelled
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] text-white/30 mt-1 px-1 font-mono">{msg.timestamp}</span>
                  </div>
                ))}

                {/* PROCESSING THINKING WAVE */}
                {mascotState === 'processing' && (
                  <div className="flex items-center gap-2">
                    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none">
                      <div className="flex gap-1.5 items-center px-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D946C4] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D946C4] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D946C4] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* CONTEXTUAL CHIPS (ONLY visible on startup/idle) */}
              <div className="px-4 py-2 border-t border-[#D946C4]/8 bg-stone-950 shrink-0">
                <div className="flex items-center gap-1.5 text-[10px] text-[#D946C4]/80 font-mono font-medium mb-1.5">
                  <Sparkles size={11} /> Context Commands:
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
                  {getContextualChips().map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(chip.text)}
                      className="shrink-0 snap-start py-1 px-2.5 rounded-full bg-[#D946C4]/8 hover:bg-[#D946C4]/15 border border-[#D946C4]/15 hover:border-[#D946C4]/25 text-[10px] text-[#F2EEF9]/80 hover:text-white font-medium transition-all max-w-[220px] truncate cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* INPUT CONTAINER */}
              <div className="p-4 border-t border-[#D946C4]/12 bg-stone-900/90 shrink-0">
                {mascotState === 'listening' ? (
                  /* Listening visualizer overlay */
                  <div className="flex items-center justify-between bg-stone-950/80 rounded-xl p-2.5 border border-[#7C6FE0]/30">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#7C6FE0]/25 flex items-center justify-center animate-pulse">
                        <Volume2 size={14} className="text-[#7C6FE0] animate-bounce" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white leading-none">Listening to Operator...</p>
                        <p className="text-[8px] font-mono text-[#9090A6] mt-1">Speak clearly into microphone</p>
                      </div>
                    </div>
                    {/* Pulsing Waveform Visual */}
                    <div className="flex items-end gap-1 px-2 h-7">
                      {waveformBars.map((val, idx) => (
                        <motion.span 
                          key={idx}
                          style={{ height: `${val}px` }}
                          className="w-0.5 rounded-full bg-[#7C6FE0]"
                          transition={{ type: 'spring', damping: 10 }}
                        />
                      ))}
                    </div>
                    {/* Stop and process button */}
                    <button
                      onClick={handleCancelVoice}
                      className="py-1 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-[9px] border border-red-500/25 cursor-pointer transition-all"
                    >
                      Stop
                    </button>
                  </div>
                ) : (
                  /* Standard text/mic input interface */
                  <div className="flex items-center gap-2">
                    {/* Speech / Voice recording toggle */}
                    <button
                      onClick={handleVoiceRecording}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#D946C4]/10 hover:text-[#D946C4] text-white/40 flex items-center justify-center border border-white/5 shrink-0 cursor-pointer active:scale-95 transition-all"
                      title="Dictate voice command"
                    >
                      <Mic size={16} />
                    </button>

                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSubmitCommand(input);
                          }
                        }}
                        placeholder="Say or type 'Log expense' or 'Add to-do'..."
                        className="w-full h-10 pl-3 pr-10 rounded-xl bg-stone-950/80 border border-[#D946C4]/15 focus:border-[#D946C4]/40 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#D946C4]/40"
                      />
                      <button
                        onClick={() => handleSubmitCommand(input)}
                        disabled={!input.trim()}
                        className={`absolute right-1 top-1 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          input.trim() 
                            ? 'bg-[#D946C4] text-stone-950 cursor-pointer' 
                            : 'bg-white/3 text-white/20'
                        }`}
                      >
                        <Send size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center mt-2.5 text-[8px] text-white/30 px-0.5">
                  <span>Enter to dispatch command</span>
                  <button 
                    onClick={() => {
                      setActivePage('ai-assistant');
                      setIsOpen(false);
                      // Custom navigation to Ask Assistant
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('vanguard-navigate-tab', { detail: 'chat' }));
                      }, 100);
                    }}
                    className="hover:text-[#D946C4] underline cursor-pointer font-mono font-medium"
                  >
                    Open full AI Center
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
