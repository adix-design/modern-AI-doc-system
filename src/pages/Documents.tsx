import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  Download, 
  Layers, 
  Link2, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  Check, 
  Printer, 
  CheckSquare, 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  HelpCircle,
  Clock,
  ArrowRight,
  Info,
  Calendar,
  Truck,
  User,
  Scale,
  Package,
  FileCheck,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Indian Number to Words Converter (Rupees & Lakhs Style)
function convertNumberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';
  if (isNaN(num)) return 'Zero Rupees Only';
  
  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const double = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const formatTens = (n: number): string => {
    if (n < 20) return single[n];
    return double[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : '');
  };
  
  const formatHundreds = (n: number): string => {
    if (n === 0) return '';
    let str = '';
    if (Math.floor(n / 100) > 0) {
      str += single[Math.floor(n / 100)] + ' Hundred';
    }
    const rem = n % 100;
    if (rem > 0) {
      str += (str ? ' and ' : '') + formatTens(rem);
    }
    return str;
  };

  let remainder = Math.floor(num);
  let str = '';
  
  const crore = Math.floor(remainder / 10000000);
  remainder %= 10000000;
  
  const lakh = Math.floor(remainder / 100000);
  remainder %= 100000;
  
  const thousand = Math.floor(remainder / 1000);
  remainder %= 1000;
  
  if (crore > 0) {
    str += formatHundreds(crore) + ' Crore ';
  }
  if (lakh > 0) {
    str += formatHundreds(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    str += formatHundreds(thousand) + ' Thousand ';
  }
  if (remainder > 0) {
    str += formatHundreds(remainder);
  }
  
  return str.trim() + ' Rupees Only';
}

// Available shipments for loading
const PRE_LOADED_SHIPMENTS = [
  { 
    id: 'LD-9821', 
    client: 'Apex Foods International', 
    routeFrom: 'Delhi', 
    routeTo: 'Mumbai', 
    truck: 'HR-55-A-8902', 
    rate: 45000, 
    consignor: 'Apex Foods Delhi Hub (GT Road)', 
    consignee: 'Apex Cold Storage Mumbai (Navi Mumbai)', 
    driver: 'Alex Singh', 
    weight: 14200, 
    packages: 280, 
    description: 'Processed Frozen Foods',
    paymentMode: 'Bank Transfer' as const
  },
  { 
    id: 'LD-8172', 
    client: 'Titan Industrial Supply', 
    routeFrom: 'Ahmedabad', 
    routeTo: 'Pune', 
    truck: 'GJ-01-Y-4109', 
    rate: 38000, 
    consignor: 'Titan Casting GIDC Ahmedabad', 
    consignee: 'Titan Parts Yard Pune', 
    driver: 'Gurpreet Singh', 
    weight: 21500, 
    packages: 120, 
    description: 'Forged Steel Machinery Parts',
    paymentMode: 'UPI' as const
  },
  { 
    id: 'LD-4029', 
    client: 'Sharma Agri Logistics', 
    routeFrom: 'Amritsar', 
    routeTo: 'Delhi', 
    truck: 'PB-02-C-5231', 
    rate: 32000, 
    consignor: 'Sharma Cold Storage (Amritsar)', 
    consignee: 'Azadpur Fruit Mandi (Delhi)', 
    driver: 'Rajinder Pal', 
    weight: 18000, 
    packages: 400, 
    description: 'Fresh Organic Apple Crates',
    paymentMode: 'Cash' as const
  },
  { 
    id: 'LD-5521', 
    client: 'Noida Freight Carriers', 
    routeFrom: 'Noida', 
    routeTo: 'Jaipur', 
    truck: 'UP-16-T-9812', 
    rate: 30000, 
    consignor: 'Noida Polymers Phase 3', 
    consignee: 'Jaipur Trading House', 
    driver: 'Devender Kumar', 
    weight: 8500, 
    packages: 180, 
    description: 'Polymer Sheets & Drums',
    paymentMode: 'Bank Transfer' as const
  },
  { 
    id: 'LD-3011', 
    client: 'Vanguard Express Co.', 
    routeFrom: 'Indore', 
    routeTo: 'Gwalior', 
    truck: 'MP-09-K-3341', 
    rate: 32400, 
    consignor: 'Vanguard Central Depot Indore', 
    consignee: 'Gwalior Industrial Estate', 
    driver: 'Madan Lal', 
    weight: 6200, 
    packages: 95, 
    description: 'Packaged Household FMCG Consumables',
    paymentMode: 'UPI' as const
  }
];

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

export default function Documents() {
  // Shared fields that are synced across docs
  const [sharedClient, setSharedClient] = useState('Apex Foods International');
  const [sharedRouteFrom, setSharedRouteFrom] = useState('Delhi');
  const [sharedRouteTo, setSharedRouteTo] = useState('Mumbai');
  const [sharedTruck, setSharedTruck] = useState('HR-55-A-8902');
  const [sharedDate, setSharedDate] = useState('2026-07-06');

  // Truck Search searchable dropdown states
  const [isTruckDropdownOpen, setIsTruckDropdownOpen] = useState(false);
  const [truckSearchText, setTruckSearchText] = useState('HR-55-A-8902');

  // Fleet database loaded from localStorage
  const fleetTrucks = useMemo(() => {
    const saved = localStorage.getItem('vanguard_fleet_trucks');
    return saved ? JSON.parse(saved) : INITIAL_TRUCKS_MOCK;
  }, []);

  const fleetDrivers = useMemo(() => {
    const saved = localStorage.getItem('vanguard_fleet_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS_MOCK;
  }, []);

  const filteredDropdownTrucks = useMemo(() => {
    if (!truckSearchText) return fleetTrucks;
    const query = truckSearchText.toLowerCase();
    return fleetTrucks.filter((t: any) => {
      const driver = fleetDrivers.find((d: any) => d.id === t.assignedDriverId);
      return (
        t.truckNo.toLowerCase().includes(query) ||
        t.truckType.toLowerCase().includes(query) ||
        (driver && driver.name.toLowerCase().includes(query))
      );
    });
  }, [fleetTrucks, fleetDrivers, truckSearchText]);

  // Selected Tab state: 'invoice' | 'lr' | 'receipt'
  const [activeTab, setActiveTab] = useState<'invoice' | 'lr' | 'receipt'>('invoice');

  // Mobile single-panel view state
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  // Zoom scale state for Right panel Preview
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Status variables for tabs
  const [invoiceStatus, setInvoiceStatus] = useState<'draft' | 'ready' | 'exported'>('ready');
  const [lrStatus, setLrStatus] = useState<'draft' | 'ready' | 'exported'>('ready');
  const [receiptStatus, setReceiptStatus] = useState<'draft' | 'ready' | 'exported'>('ready');

  // Merge check state
  const [includeInvoice, setIncludeInvoice] = useState(true);
  const [includeLr, setIncludeLr] = useState(true);
  const [includeReceipt, setIncludeReceipt] = useState(true);

  // Loading/Exporting feedback triggers
  const [exportingMessage, setExportingMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ----- Form-specific state -----
  // Invoice state fields
  const [invoiceNo, setInvoiceNo] = useState('INV-9821');
  const [gstPercent, setGstPercent] = useState(18);

  // New Form-specific state fields for Invoice
  const [clientPhone, setClientPhone] = useState('9876543210');
  const [pickupAddress, setPickupAddress] = useState('302-304 Transport Nagar');
  const [pickupCSP, setPickupCSP] = useState('New Delhi, DL 110043');
  const [deliveryAddress, setDeliveryAddress] = useState('Building 4, Sector 15');
  const [deliveryCSP, setDeliveryCSP] = useState('Mumbai, MH 400001');

  const [shipmentType, setShipmentType] = useState('Household');
  const [customShipmentType, setCustomShipmentType] = useState('');
  const [totalWeight, setTotalWeight] = useState('Full Truck Load');

  const [paymentModeInvoice, setPaymentModeInvoice] = useState('Online');
  const [invoiceReferenceNo, setInvoiceReferenceNo] = useState('9876543210');
  const [lastPaymentMode, setLastPaymentMode] = useState('Online');

  const [sealImage, setSealImage] = useState<string | null>(null);

  // Pre-populated line items
  const [invoiceLines, setInvoiceLines] = useState<({ id: string; description: string; value: number | 'Incl' })[]>([
    { id: 'f-1', description: 'Freight Charges', value: 45000 },
    { id: 'f-2', description: 'Packing Charges', value: 'Incl' },
    { id: 'f-3', description: 'Unpacking Charges', value: 'Incl' },
    { id: 'f-4', description: 'Loading Charges', value: 'Incl' },
    { id: 'f-5', description: 'Unloading Charges', value: 'Incl' },
    { id: 'f-6', description: 'Packing Material', value: 'Incl' },
    { id: 'f-7', description: 'Additional Charges', value: 'Incl' },
  ]);

  // Lorry Receipt fields
  const [lrNo, setLrNo] = useState('LR-9821');
  const [consignor, setConsignor] = useState('Apex Foods Delhi Hub (GT Road)');
  const [consignee, setConsignee] = useState('Apex Cold Storage Mumbai (Navi Mumbai)');
  const [driverName, setDriverName] = useState('Alex Singh');
  const [packagesCount, setPackagesCount] = useState(280);
  const [weightKg, setWeightKg] = useState(14200);
  const [goodsDescription, setGoodsDescription] = useState('Processed Frozen Foods');
  const [freightType, setFreightType] = useState<'Paid' | 'To Pay'>('Paid');

  // Money Receipt fields
  const [receiptNo, setReceiptNo] = useState('MR-9821');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Bank Transfer');
  const [referenceNo, setReferenceNo] = useState('UPI-TXN-9821-APX');

  // Auto-calculated fields for Live updates
  const [subtotal, setSubtotal] = useState(49000);
  const [gstAmount, setGstAmount] = useState(8820);
  const [grandTotal, setGrandTotal] = useState(57820);

  // Keep totals updated based on inputs
  useEffect(() => {
    const sub = invoiceLines.reduce((acc, curr) => {
      const val = curr.value;
      return acc + (typeof val === 'number' ? val : 0);
    }, 0);
    const gst = Math.round((sub * gstPercent) / 100);
    const total = sub + gst;

    setSubtotal(sub);
    setGstAmount(gst);
    setGrandTotal(total);
  }, [invoiceLines, gstPercent]);

  // Reference number auto-fill based on payment mode and phone number
  useEffect(() => {
    if (paymentModeInvoice !== lastPaymentMode) {
      setLastPaymentMode(paymentModeInvoice);
      if (paymentModeInvoice === 'Cash') {
        setInvoiceReferenceNo('N/A');
      } else {
        setInvoiceReferenceNo(clientPhone);
      }
    } else if (invoiceReferenceNo === '') {
      if (paymentModeInvoice === 'Cash') {
        setInvoiceReferenceNo('N/A');
      } else {
        setInvoiceReferenceNo(clientPhone);
      }
    }
  }, [paymentModeInvoice, lastPaymentMode, clientPhone, invoiceReferenceNo]);

  // Handle search navigation highlights for documents
  useEffect(() => {
    const handleSearchNavigate = () => {
      const targetTab = localStorage.getItem('vanguard_active_document_tab') as 'invoice' | 'lr' | 'receipt' | null;
      const targetNo = localStorage.getItem('vanguard_active_document_no');
      if (targetTab) {
        setActiveTab(targetTab);
        if (targetNo) {
          if (targetTab === 'invoice') {
            setInvoiceNo(targetNo);
          } else if (targetTab === 'lr') {
            setLrNo(targetNo);
          } else if (targetTab === 'receipt') {
            setReceiptNo(targetNo);
          }
        }
        localStorage.removeItem('vanguard_active_document_tab');
        localStorage.removeItem('vanguard_active_document_no');
      }
    };

    // Run on mount
    handleSearchNavigate();

    window.addEventListener('vanguard-search-navigate-document', handleSearchNavigate);
    return () => window.removeEventListener('vanguard-search-navigate-document', handleSearchNavigate);
  }, []);

  // Load from Shipment selector handler
  const handleLoadShipment = (shipmentId: string) => {
    if (!shipmentId) return;
    const selected = PRE_LOADED_SHIPMENTS.find(s => s.id === shipmentId);
    if (!selected) return;

    // Trigger feedback
    setExportingMessage(`Importing ${selected.id} details...`);
    setTimeout(() => {
      // Synced fields update
      setSharedClient(selected.client);
      setSharedRouteFrom(selected.routeFrom);
      setSharedRouteTo(selected.routeTo);
      setSharedTruck(selected.truck);
      
      // Invoice fields
      setInvoiceNo(`INV-${selected.id.split('-')[1]}`);
      setClientPhone('9876543210');
      setPickupAddress(selected.consignor);
      setPickupCSP('New Delhi, DL 110043');
      setDeliveryAddress(selected.consignee);
      setDeliveryCSP('Mumbai, MH 400001');
      setShipmentType('Household');
      setCustomShipmentType('');
      setTotalWeight(selected.weight ? `${selected.weight} kg` : 'Full Truck Load');
      setPaymentModeInvoice(selected.paymentMode);
      if (selected.paymentMode === 'Cash') {
        setInvoiceReferenceNo('N/A');
      } else {
        setInvoiceReferenceNo('9876543210');
      }

      setInvoiceLines([
        { id: 'f-1', description: 'Freight Charges', value: selected.rate },
        { id: 'f-2', description: 'Packing Charges', value: 'Incl' },
        { id: 'f-3', description: 'Unpacking Charges', value: 'Incl' },
        { id: 'f-4', description: 'Loading Charges', value: 'Incl' },
        { id: 'f-5', description: 'Unloading Charges', value: 'Incl' },
        { id: 'f-6', description: 'Packing Material', value: 'Incl' },
        { id: 'f-7', description: 'Additional Charges', value: 'Incl' },
      ]);
      
      // Lorry Receipt fields
      setLrNo(`LR-${selected.id.split('-')[1]}`);
      setConsignor(selected.consignor);
      setConsignee(selected.consignee);
      setDriverName(selected.driver);
      setPackagesCount(selected.packages);
      setWeightKg(selected.weight);
      setGoodsDescription(selected.description);

      // Money Receipt fields
      setReceiptNo(`MR-${selected.id.split('-')[1]}`);
      setPaymentMode(selected.paymentMode);
      setReferenceNo(`TXN-${selected.id.split('-')[1]}-OK`);

      setExportingMessage(null);
      setSuccessMessage(`Successfully synchronized with ${selected.id}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 500);
  };

  // Set individual line item values
  const handleSetLineValue = (id: string, value: number | 'Incl') => {
    setInvoiceLines(prev => prev.map(line => {
      if (line.id === id) {
        return { ...line, value };
      }
      return line;
    }));
  };

  // Update line item descriptions
  const handleUpdateInvoiceLineDescription = (id: string, description: string) => {
    setInvoiceLines(prev => prev.map(line => {
      if (line.id === id) {
        return { ...line, description };
      }
      return line;
    }));
  };

  // Add customized line item
  const handleAddInvoiceLine = () => {
    setInvoiceLines(prev => [
      ...prev,
      { id: `custom-${Date.now()}`, description: 'Extra Charge Item', value: 'Incl' }
    ]);
  };

  // Delete customized line item
  const handleRemoveInvoiceLine = (id: string) => {
    setInvoiceLines(prev => prev.filter(line => line.id !== id));
  };

  // Generate completely new blank document set
  const handleNewDocumentSet = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setInvoiceNo(`INV-${randomSuffix}`);
    setLrNo(`LR-${randomSuffix}`);
    setReceiptNo(`MR-${randomSuffix}`);
    
    setSharedClient('');
    setSharedRouteFrom('');
    setSharedRouteTo('');
    setSharedTruck('');

    setClientPhone('');
    setPickupAddress('');
    setPickupCSP('');
    setDeliveryAddress('');
    setDeliveryCSP('');
    setShipmentType('Household');
    setCustomShipmentType('');
    setTotalWeight('Full Truck Load');
    setPaymentModeInvoice('Online');
    setInvoiceReferenceNo('');
    setSealImage(null);

    setInvoiceLines([
      { id: 'f-1', description: 'Freight Charges', value: 'Incl' },
      { id: 'f-2', description: 'Packing Charges', value: 'Incl' },
      { id: 'f-3', description: 'Unpacking Charges', value: 'Incl' },
      { id: 'f-4', description: 'Loading Charges', value: 'Incl' },
      { id: 'f-5', description: 'Unloading Charges', value: 'Incl' },
      { id: 'f-6', description: 'Packing Material', value: 'Incl' },
      { id: 'f-7', description: 'Additional Charges', value: 'Incl' },
    ]);
    
    setConsignor('');
    setConsignee('');
    setDriverName('');
    setPackagesCount(0);
    setWeightKg(0);
    setGoodsDescription('');
    setReferenceNo('');

    setInvoiceStatus('draft');
    setLrStatus('draft');
    setReceiptStatus('draft');

    setSuccessMessage('Blank Document Workspace Initialized.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle Save draft
  const handleSaveAsDraft = () => {
    if (activeTab === 'invoice') setInvoiceStatus('draft');
    if (activeTab === 'lr') setLrStatus('draft');
    if (activeTab === 'receipt') setReceiptStatus('draft');

    setSuccessMessage(`${activeTab.toUpperCase()} draft saved successfully!`);
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  // Generate Preview action
  const handleGeneratePreview = () => {
    if (activeTab === 'invoice') setInvoiceStatus('ready');
    if (activeTab === 'lr') setLrStatus('ready');
    if (activeTab === 'receipt') setReceiptStatus('ready');

    setSuccessMessage(`${activeTab.toUpperCase()} layout generated successfully.`);
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  // Download Single document
  const triggerSingleDownload = (docType: 'invoice' | 'lr' | 'receipt') => {
    let filename = '';
    let content = '';

    if (docType === 'invoice') {
      filename = `${invoiceNo}_${sharedClient.replace(/\s+/g, '_')}.pdf`;
      let linesStr = '';
      invoiceLines.forEach((line) => {
        linesStr += ` - ${line.description}: ${line.value === 'Incl' ? 'Incl' : 'Rs. ' + line.value}\n`;
      });
      content = `VANGUARD INVOICE MANIFEST\n========================\nInvoice No: ${invoiceNo}\nDate: ${sharedDate}\nClient: ${sharedClient}\nPhone: ${clientPhone}\nPickup Address: ${pickupAddress}, ${pickupCSP}\nDelivery Address: ${deliveryAddress}, ${deliveryCSP}\nRoute: ${sharedRouteFrom} -> ${sharedRouteTo}\nTruck: ${sharedTruck}\nType of Shipment: ${shipmentType === 'Other' ? customShipmentType : shipmentType}\nTotal Weight: ${totalWeight}\nPayment Mode: ${paymentModeInvoice}\nReference No: ${invoiceReferenceNo}\n\nLINE ITEMS:\n${linesStr}\nGST: ${gstPercent}%\nTotal Earned: Rs. ${grandTotal}\nNotes: Valid printed copy.`;
      setInvoiceStatus('exported');
    } else if (docType === 'lr') {
      filename = `${lrNo}_Lorry_Receipt.pdf`;
      content = `VANGUARD LORRY RECEIPT (Bilty)\n========================\nLR No: ${lrNo}\nDate: ${sharedDate}\nConsignor: ${consignor}\nConsignee: ${consignee}\nDriver: ${driverName}\nRoute: ${sharedRouteFrom} -> ${sharedRouteTo}\nTruck: ${sharedTruck}\nDescription: ${goodsDescription}\nWeight: ${weightKg} KG\nPackages: ${packagesCount}\nFreight Type: ${freightType}`;
      setLrStatus('exported');
    } else {
      filename = `${receiptNo}_Money_Receipt.pdf`;
      content = `VANGUARD MONEY RECEIPT\n========================\nReceipt No: ${receiptNo}\nDate: ${sharedDate}\nReceived From: ${sharedClient}\nAmount: Rs. ${grandTotal} (${convertNumberToWords(grandTotal)})\nPayment Mode: ${paymentMode}\nRef No: ${referenceNo}`;
      setReceiptStatus('exported');
    }

    setExportingMessage(`Compiling high resolution PDF output: ${filename}...`);
    
    setTimeout(() => {
      // Create element and trigger real file download of simulated pdf bytes
      const element = document.createElement('a');
      const file = new Blob([content], {type: 'application/pdf'});
      element.href = URL.createObjectURL(file);
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      setExportingMessage(null);
      setSuccessMessage(`${filename} downloaded successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 1200);
  };

  // Merge & Download checked items
  const handleMergeDownload = () => {
    const listToMerge: string[] = [];
    if (includeInvoice) listToMerge.push('Invoice');
    if (includeLr) listToMerge.push('Lorry Receipt');
    if (includeReceipt) listToMerge.push('Money Receipt');

    if (listToMerge.length === 0) {
      alert('Please check at least one document to include in the merged export.');
      return;
    }

    setExportingMessage(`Merging [${listToMerge.join(' + ')}] into a single multi-page PDF document...`);

    setTimeout(() => {
      // Generate merged content block
      let combinedContent = `VANGUARD LOGISTICS - MERGED MULTI-PAGE MANIFEST\n`;
      combinedContent += `==============================================\n`;
      combinedContent += `Generated On: ${sharedDate}\n`;
      combinedContent += `Client Account: ${sharedClient}\n\n`;

      if (includeInvoice) {
        let linesStr = '';
        invoiceLines.forEach((line) => {
          linesStr += ` - ${line.description}: ${line.value === 'Incl' ? 'Incl' : 'Rs. ' + line.value}\n`;
        });
        combinedContent += `PAGE 1: COMMERCIAL TAX INVOICE (${invoiceNo})\n`;
        combinedContent += `----------------------------------------------\n`;
        combinedContent += `Invoice Date: ${sharedDate}\n`;
        combinedContent += `Client: ${sharedClient}\n`;
        combinedContent += `Phone: ${clientPhone}\n`;
        combinedContent += `Pickup Address: ${pickupAddress}, ${pickupCSP}\n`;
        combinedContent += `Delivery Address: ${deliveryAddress}, ${deliveryCSP}\n`;
        combinedContent += `Route: ${sharedRouteFrom} to ${sharedRouteTo}\n`;
        combinedContent += `Truck registration: ${sharedTruck}\n`;
        combinedContent += `Type of Shipment: ${shipmentType === 'Other' ? customShipmentType : shipmentType}\n`;
        combinedContent += `Total Weight: ${totalWeight}\n`;
        combinedContent += `Payment Mode: ${paymentModeInvoice}\n`;
        combinedContent += `Reference No: ${invoiceReferenceNo}\n\n`;
        combinedContent += `LINE ITEMS:\n${linesStr}`;
        combinedContent += `GST Charge: Rs. ${gstAmount} (${gstPercent}%)\n`;
        combinedContent += `Grand Bill Total: Rs. ${grandTotal}\n\n`;
      }
      if (includeLr) {
        combinedContent += `PAGE 2: LORRY RECEIPT BILTY CHALLAN (${lrNo})\n`;
        combinedContent += `----------------------------------------------\n`;
        combinedContent += `Consignor: ${consignor || sharedClient}\n`;
        combinedContent += `Consignee: ${consignee}\n`;
        combinedContent += `Driver details: ${driverName}\n`;
        combinedContent += `Cargo goods description: ${goodsDescription}\n`;
        combinedContent += `Weight registered: ${weightKg} KG\n`;
        combinedContent += `Total Packages count: ${packagesCount}\n`;
        combinedContent += `Surcharge designation: ${freightType}\n\n`;
      }
      if (includeReceipt) {
        combinedContent += `PAGE 3: OFFICIAL ACCOUNT CASH & MONEY RECEIPT (${receiptNo})\n`;
        combinedContent += `----------------------------------------------\n`;
        combinedContent += `Sponsor Client: ${sharedClient}\n`;
        combinedContent += `Total Volume Received: Rs. ${grandTotal}\n`;
        combinedContent += `Amount verbal translation: ${convertNumberToWords(grandTotal)}\n`;
        combinedContent += `Payment channel details: ${paymentMode} - ${referenceNo}\n\n`;
      }

      const element = document.createElement('a');
      const file = new Blob([combinedContent], {type: 'application/pdf'});
      element.href = URL.createObjectURL(file);
      element.download = `VANGUARD_COMBINED_${invoiceNo.replace('INV-', '')}.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      // Set all included states to exported
      if (includeInvoice) setInvoiceStatus('exported');
      if (includeLr) setLrStatus('exported');
      if (includeReceipt) setReceiptStatus('exported');

      setExportingMessage(null);
      setSuccessMessage('Merged PDF Document downloaded!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 1800);
  };

  // Indian currency formatting helper
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div id="documents-module-container" className="space-y-6 flex flex-col flex-1 pb-16 relative">
      
      {/* ==================== Feedback Toasts ==================== */}
      <AnimatePresence>
        {exportingMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-stone-900 border border-[#D946C4]/30 text-white rounded-xl p-4 shadow-2xl flex items-center gap-3 z-50 w-full max-w-sm"
          >
            <div className="w-5 h-5 rounded-full border-2 border-t-[#D946C4] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="text-xs">
              <p className="font-semibold">{exportingMessage}</p>
              <p className="text-[10px] text-white/40 mt-0.5">Please wait, compiling high-res assets...</p>
            </div>
          </motion.div>
        )}

        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-stone-900 border border-emerald-500/30 text-emerald-400 rounded-xl p-4 shadow-2xl flex items-center gap-3 z-50 w-full max-w-sm"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Check size={12} />
            </div>
            <div className="text-xs text-white">
              <p className="font-semibold text-emerald-400">{successMessage}</p>
              <p className="text-[10px] text-white/40 mt-0.5">Updated in local workspace memory.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 1. HEADER ROW ==================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-white text-sm font-semibold tracking-wider uppercase font-mono">Consignment Documentation Workspace</h4>
          <p className="text-xs text-white/50 font-sans">Generate, preview, and export standard Indian freight documents</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Load from Shipment selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40 font-mono uppercase">Load Shipment:</span>
            <select
              onChange={(e) => handleLoadShipment(e.target.value)}
              defaultValue=""
              className="bg-stone-900/80 hover:bg-stone-900 border border-white/10 text-white text-xs rounded-full px-4 h-9 focus:outline-none focus:border-[#D946C4]/40 font-mono transition-all cursor-pointer"
            >
              <option value="" disabled>-- Choose Active Load --</option>
              {PRE_LOADED_SHIPMENTS.map(s => (
                <option key={s.id} value={s.id}>{s.id} ({s.client.substring(0, 15)}...)</option>
              ))}
            </select>
          </div>

          {/* New Document Set */}
          <button
            onClick={handleNewDocumentSet}
            className="flex items-center gap-1.5 px-4 h-9 bg-[#D946C4] hover:bg-[#D946C4]/80 text-white text-xs font-semibold rounded-full transition-all duration-200 shadow-md shadow-[#D946C4]/10 active:scale-95 cursor-pointer"
          >
            <Plus size={14} />
            <span>New Document Set</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher to switch between form and preview */}
      <div className="lg:hidden flex bg-stone-900/60 p-1 rounded-xl border border-white/5 mb-4">
        <button
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all duration-200 ${
            mobileView === 'editor'
              ? 'bg-[#D946C4] text-white font-bold'
              : 'text-white/40 hover:text-white/80'
          }`}
        >
          Form Editor
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition-all duration-200 ${
            mobileView === 'preview'
              ? 'bg-[#D946C4] text-white font-bold'
              : 'text-white/40 hover:text-white/80'
          }`}
        >
          Document Preview
        </button>
      </div>

      {/* ==================== TWO-PANEL WORKSPACE GRID ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        
        {/* ==================== 2. LEFT PANEL (35% width / 3.5 cols) ==================== */}
        <div className={`lg:col-span-4 bg-white/4 border border-white/8 rounded-2xl p-4 flex flex-col space-y-4 shadow-xl ${mobileView === 'editor' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Header tabs segmented controls */}
          <div className="bg-stone-950/40 p-1 rounded-xl border border-white/5 flex">
            {[
              { id: 'invoice', label: 'Invoice', status: invoiceStatus },
              { id: 'lr', label: 'Lorry Receipt', status: lrStatus },
              { id: 'receipt', label: 'Money Receipt', status: receiptStatus }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-medium transition-all duration-200 relative ${
                  activeTab === tab.id 
                    ? 'bg-white/10 text-white font-semibold' 
                    : 'text-white/45 hover:text-white/80'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="flex items-center gap-1">
                    {/* Status Dot */}
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      tab.status === 'draft' ? 'bg-white/30' :
                      tab.status === 'ready' ? 'bg-[#D946C4]' : 'bg-emerald-400'
                    }`} />
                    {tab.label}
                  </span>
                  <span className="text-[8px] font-mono opacity-50 uppercase tracking-widest block">
                    {tab.status}
                  </span>
                </div>
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabUnderline" 
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#D946C4]" 
                  />
                )}
              </button>
            ))}
          </div>

          {/* Form Content panel */}
          <div className="space-y-4 pt-1">
            
            {/* INVOICE TAB FORM */}
            {activeTab === 'invoice' && (
              <div className="space-y-4 animate-fade-in text-white">
                {/* Visual synced warning */}
                <div className="flex items-center gap-1.5 text-[10px] text-violet-300 bg-violet-500/10 p-2 rounded-lg border border-violet-500/20 font-mono">
                  <Link2 size={12} className="flex-shrink-0 animate-pulse" />
                  <span>Variables sync in background across LR & Receipt tabs.</span>
                </div>

                {/* 1. DOCUMENT REFERENCE & DATE */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Invoice #</label>
                    <input
                      type="text"
                      value={invoiceNo}
                      onChange={(e) => setInvoiceNo(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-violet-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Date 🔗</label>
                    <input
                      type="date"
                      value={sharedDate}
                      onChange={(e) => setSharedDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-violet-500/40 font-mono"
                    />
                  </div>
                </div>

                {/* 2. CLIENT / CONTACT */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Client Name 🔗</label>
                    <input
                      type="text"
                      value={sharedClient}
                      onChange={(e) => setSharedClient(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-violet-500/40"
                      placeholder="e.g. Apex Foods"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Client Phone</label>
                    <input
                      type="tel"
                      pattern="[0-9]*"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-violet-500/40 font-mono"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                </div>

                {/* 3. PICKUP DETAILS */}
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider block">Pickup Details</span>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="text-[9px] font-mono text-white/30 block mb-0.5">Pickup Address (Street Level Only)</label>
                      <input
                        type="text"
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-violet-500/40"
                        placeholder="e.g. Plot No 12, Phase-II, Okhla Ind Area"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-white/30 block mb-0.5">City, State, Pincode</label>
                      <input
                        type="text"
                        value={pickupCSP}
                        onChange={(e) => setPickupCSP(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-violet-500/40 font-mono"
                        placeholder="e.g. New Delhi, DL 110020"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. DELIVERY DETAILS */}
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider block">Delivery Details</span>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="text-[9px] font-mono text-white/30 block mb-0.5">Delivery Address (Street Level Only)</label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-violet-500/40"
                        placeholder="e.g. Warehouse A, Port Road, JNPT"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-white/30 block mb-0.5">City, State, Pincode</label>
                      <input
                        type="text"
                        value={deliveryCSP}
                        onChange={(e) => setDeliveryCSP(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-violet-500/40 font-mono"
                        placeholder="e.g. Navi Mumbai, MH 400707"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. ROUTE & TRUCK SPECIFICATION */}
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider block">Route & Truck Specification</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-mono text-white/30 block mb-0.5">From City 🔗</label>
                      <input
                        type="text"
                        value={sharedRouteFrom}
                        onChange={(e) => setSharedRouteFrom(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-violet-500/40"
                        placeholder="Delhi"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-white/30 block mb-0.5">To City 🔗</label>
                      <input
                        type="text"
                        value={sharedRouteTo}
                        onChange={(e) => setSharedRouteTo(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-violet-500/40"
                        placeholder="Mumbai"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 overflow-visible">
                    <div className="relative">
                      <label className="text-[9px] font-mono text-white/30 block mb-0.5">Truck No 🔗</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={sharedTruck}
                          onChange={(e) => {
                            setSharedTruck(e.target.value);
                            setTruckSearchText(e.target.value);
                            setIsTruckDropdownOpen(true);
                          }}
                          onFocus={() => setIsTruckDropdownOpen(true)}
                          className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-violet-500/40 font-mono"
                          placeholder="Search or enter plate..."
                        />
                        
                        {isTruckDropdownOpen && (
                          <div className="absolute left-0 right-0 top-10 bg-stone-950 border border-white/15 rounded-xl z-20 shadow-2xl max-h-48 overflow-y-auto p-1 divide-y divide-white/5 text-white">
                            {filteredDropdownTrucks.map((truck, idx) => {
                              const driver = fleetDrivers.find(d => d.id === truck.assignedDriverId);
                              return (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    setSharedTruck(truck.truckNo);
                                    setTruckSearchText(truck.truckNo);
                                    if (driver) {
                                      setDriverName(driver.name);
                                    }
                                    setTotalWeight(truck.truckType);
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
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {filteredDropdownTrucks.length === 0 && (
                              <div className="p-3 text-[10px] text-white/40 text-center italic">
                                Custom vehicle plate number.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-white/30 block mb-0.5">Total Weight (Type/Cap)</label>
                      <input
                        type="text"
                        value={totalWeight}
                        onChange={(e) => setTotalWeight(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-violet-500/40"
                        placeholder="e.g. 15 Tons"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-mono text-white/30 block mb-0.5">Shipment Type</label>
                      <select
                        value={shipmentType}
                        onChange={(e) => setShipmentType(e.target.value)}
                        className="w-full bg-stone-900 border border-white/10 rounded-lg h-9 px-2 text-xs text-white focus:outline-none focus:border-violet-500/40"
                      >
                        <option value="Household">Household</option>
                        <option value="Industrial">Industrial</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other (Specify)</option>
                      </select>
                    </div>
                    {shipmentType === 'Other' && (
                      <div>
                        <label className="text-[9px] font-mono text-white/30 block mb-0.5">Specify Type</label>
                        <input
                          type="text"
                          value={customShipmentType}
                          onChange={(e) => setCustomShipmentType(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-violet-500/40"
                          placeholder="Specify custom type"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. PAYMENT AND RECONCILIATION */}
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider block">Payment & Reconciliation</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-mono text-white/30 block mb-0.5">Payment Mode</label>
                      <select
                        value={paymentModeInvoice}
                        onChange={(e) => setPaymentModeInvoice(e.target.value)}
                        className="w-full bg-stone-900 border border-white/10 rounded-lg h-9 px-2 text-xs text-white focus:outline-none focus:border-violet-500/40"
                      >
                        <option value="Online">Online</option>
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-white/30 block mb-0.5">Reference No / Txn ID</label>
                      <input
                        type="text"
                        value={invoiceReferenceNo}
                        onChange={(e) => setInvoiceReferenceNo(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-violet-500/40 font-mono"
                        placeholder="Reference No"
                      />
                    </div>
                  </div>
                </div>

                {/* 7. LINE ITEMS TABLE */}
                <div className="border-t border-white/5 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider">Line Items (Charges)</span>
                    <button
                      type="button"
                      onClick={handleAddInvoiceLine}
                      className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {invoiceLines.map((line, idx) => (
                      <div key={line.id} className="flex flex-col gap-1 bg-white/5 p-2 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={line.description}
                            onChange={(e) => handleUpdateInvoiceLineDescription(line.id, e.target.value)}
                            className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none font-medium"
                            placeholder="Description"
                          />
                          {idx >= 7 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveInvoiceLine(line.id)}
                              className="text-white/40 hover:text-rose-400 p-1 rounded hover:bg-white/5"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => handleSetLineValue(line.id, line.value === 'Incl' ? 0 : 'Incl')}
                            className={`px-2 py-0.5 text-[9px] rounded font-mono uppercase transition-all ${
                              line.value === 'Incl'
                                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                : 'bg-white/5 text-white/50 hover:bg-white/10'
                            }`}
                          >
                            {line.value === 'Incl' ? 'Included (Incl)' : 'Set to Included'}
                          </button>
                          {line.value !== 'Incl' && (
                            <div className="flex items-center gap-1">
                              <span className="text-white/40 text-[10px]">₹</span>
                              <input
                                type="number"
                                value={line.value}
                                onChange={(e) => handleSetLineValue(line.id, parseFloat(e.target.value) || 0)}
                                className="w-24 bg-white/10 border border-white/10 rounded h-6 px-1.5 text-xs text-white font-mono text-right focus:outline-none"
                                placeholder="Amount"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 8. SIGNATURE / SEAL UPLOAD */}
                <div className="border-t border-white/5 pt-3 space-y-2">
                  <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider block">Signature / Seal Image</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {/* Presets or custom upload */}
                    <button
                      type="button"
                      onClick={() => setSealImage('/assets/digital_seal.png')}
                      className={`h-16 rounded-lg border border-dashed flex flex-col items-center justify-center gap-1 transition-all text-center ${
                        sealImage === '/assets/digital_seal.png'
                          ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                          : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      <FileCheck size={16} />
                      <span className="text-[9px] font-sans">Use Official Stamp</span>
                    </button>

                    <div className="relative h-16 rounded-lg border border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-1 text-white/50 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setSealImage(event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      {sealImage && sealImage !== '/assets/digital_seal.png' ? (
                        <img src={sealImage} alt="Seal Preview" className="h-12 w-auto object-contain" />
                      ) : (
                        <>
                          <Upload size={16} />
                          <span className="text-[9px] font-sans">Upload Stamp</span>
                        </>
                      )}
                    </div>
                  </div>

                  {sealImage && (
                    <div className="flex items-center justify-between bg-violet-500/5 p-2 rounded-lg border border-violet-500/10">
                      <span className="text-[9px] text-violet-300 font-mono">Seal / Signature attached</span>
                      <button
                        type="button"
                        onClick={() => setSealImage(null)}
                        className="text-[9px] text-rose-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Live Auto calculations box */}
                <div className="bg-stone-950/50 rounded-xl p-3 border border-white/5 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-white/40">
                    <span>Subtotal Charges:</span>
                    <span className="font-mono text-white">{formatINR(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-white/40 flex items-center gap-1">
                      GST Percentage:
                      <select
                        value={gstPercent}
                        onChange={(e) => setGstPercent(parseInt(e.target.value))}
                        className="bg-stone-900 border border-white/10 rounded px-1 text-[10px] text-white/80 focus:outline-none"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </span>
                    <span className="font-mono text-white/70">+{formatINR(gstAmount)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold text-white border-t border-white/5 pt-1.5 mt-1">
                    <span className="flex items-center gap-1 text-violet-400">
                      <Sparkles size={11} className="text-violet-400" /> Total Invoice:
                    </span>
                    <span className="font-mono text-violet-400">{formatINR(grandTotal)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* LORRY RECEIPT TAB FORM */}
            {activeTab === 'lr' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-1.5 text-[10px] text-[#D946C4]/80 bg-[#D946C4]/5 p-2 rounded-lg border border-[#D946C4]/10 font-mono">
                  <Link2 size={12} className="flex-shrink-0" />
                  <span>Linked route and truck parameters shared automatically.</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Bilty/LR Number</label>
                    <input
                      type="text"
                      value={lrNo}
                      onChange={(e) => setLrNo(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/30"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Driver Name</label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/30"
                      placeholder="e.g. Alex Singh"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Consignor (Sender Location) 🔗</label>
                  <input
                    type="text"
                    value={consignor}
                    onChange={(e) => setConsignor(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/30"
                    placeholder="Enter sender address/office"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Consignee (Receiver Location)</label>
                  <input
                    type="text"
                    value={consignee}
                    onChange={(e) => setConsignee(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/30"
                    placeholder="Enter receiver delivery address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">No of Packages</label>
                    <input
                      type="number"
                      value={packagesCount || ''}
                      onChange={(e) => setPackagesCount(parseInt(e.target.value) || 0)}
                      className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/30 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Weight (KG)</label>
                    <input
                      type="number"
                      value={weightKg || ''}
                      onChange={(e) => setWeightKg(parseInt(e.target.value) || 0)}
                      className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/30 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Goods Description</label>
                  <input
                    type="text"
                    value={goodsDescription}
                    onChange={(e) => setGoodsDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/30"
                    placeholder="e.g. Industrial pipes, dry groceries"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-white/40 uppercase block mb-1.5">Freight Surcharge Mode</label>
                  <div className="flex gap-4">
                    {['Paid', 'To Pay'].map((mode) => (
                      <label key={mode} className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                        <input
                          type="radio"
                          name="freightType"
                          value={mode}
                          checked={freightType === mode}
                          onChange={() => setFreightType(mode as any)}
                          className="accent-[#D946C4]"
                        />
                        <span>{mode} (Shipper pays {mode === 'Paid' ? 'now' : 'upon delivery'})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MONEY RECEIPT TAB FORM */}
            {activeTab === 'receipt' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-1.5 text-[10px] text-[#D946C4]/80 bg-[#D946C4]/5 p-2 rounded-lg border border-[#D946C4]/10 font-mono">
                  <Link2 size={12} className="flex-shrink-0" />
                  <span>Synces customer data and date automatically with Invoice.</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Receipt Number</label>
                    <input
                      type="text"
                      value={receiptNo}
                      onChange={(e) => setReceiptNo(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/30 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Received From 🔗</label>
                    <input
                      type="text"
                      value={sharedClient}
                      onChange={(e) => setSharedClient(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Paid Amount (₹) 🔗</label>
                    <input
                      type="number"
                      value={grandTotal || ''}
                      readOnly
                      className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white/60 focus:outline-none font-mono cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1">Payment Reference ID</label>
                    <input
                      type="text"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-lg h-9 px-3 text-xs text-white focus:outline-none focus:border-[#D946C4]/30 font-mono"
                      placeholder="e.g. UPI-9281-OK"
                    />
                  </div>
                </div>

                {/* Payment Mode Selector Toggles */}
                <div>
                  <label className="text-[10px] font-mono text-white/40 uppercase block mb-1.5">Payment Mode</label>
                  <div className="grid grid-cols-3 gap-2 bg-stone-950/40 p-1 rounded-lg border border-white/5">
                    {[
                      { id: 'Cash', label: 'Cash', icon: DollarSign },
                      { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                      { id: 'Bank Transfer', label: 'NEFT/IMPS', icon: CreditCard }
                    ].map(mode => {
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setPaymentMode(mode.id as any)}
                          className={`py-1.5 text-center text-xs rounded-md transition-all flex items-center justify-center gap-1.5 ${
                            paymentMode === mode.id 
                              ? 'bg-[#D946C4] text-white font-semibold' 
                              : 'text-white/40 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon size={12} />
                          <span>{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount in words live generated */}
                <div className="bg-[#D946C4]/5 rounded-xl p-3 border border-[#D946C4]/10">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#D946C4] uppercase">
                    <Info size={11} />
                    <span>Auto-Generated Verbal translation</span>
                  </div>
                  <p className="text-xs text-white/80 font-serif italic mt-1 leading-relaxed">
                    "{convertNumberToWords(grandTotal)}"
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Form Action buttons */}
          <div className="flex gap-2 border-t border-white/5 pt-4">
            <button
              onClick={handleSaveAsDraft}
              className="flex-1 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/5 text-xs font-semibold transition-colors cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              onClick={handleGeneratePreview}
              className="flex-1 h-9 rounded-lg bg-[#D946C4] hover:bg-[#D946C4]/80 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Generate Preview
            </button>
          </div>

        </div>

        {/* ==================== 3. RIGHT PANEL (65% width / 6.6 cols) ==================== */}
        <div className={`lg:col-span-6 flex flex-col space-y-3 ${mobileView === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Zoom controls & Toolbar */}
          <div className="flex items-center justify-between bg-stone-900/60 p-2.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-1 bg-stone-950/40 p-0.5 rounded-lg border border-white/5">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.125))}
                className="w-7 h-7 rounded hover:bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="text-[10px] font-mono text-white/70 px-2 min-w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.25, prev + 0.125))}
                className="w-7 h-7 rounded hover:bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Checkbox: Include in merged export */}
              <label className="flex items-center gap-2 text-xs text-white/70 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    activeTab === 'invoice' ? includeInvoice :
                    activeTab === 'lr' ? includeLr : includeReceipt
                  }
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (activeTab === 'invoice') setIncludeInvoice(checked);
                    if (activeTab === 'lr') setIncludeLr(checked);
                    if (activeTab === 'receipt') setIncludeReceipt(checked);
                  }}
                  className="rounded border-white/20 bg-stone-900 text-[#D946C4] focus:ring-transparent focus:ring-offset-0 h-3.5 w-3.5 accent-[#D946C4]"
                />
                <span>Include in merged export</span>
              </label>

              {/* Single Download PDF trigger */}
              <button
                onClick={() => triggerSingleDownload(activeTab)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[11px] font-semibold transition-all cursor-pointer"
              >
                <Download size={12} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Paper Document Container with Scale animation & Cross-fade */}
          <div className="w-full flex justify-center bg-stone-950/20 border border-white/5 rounded-2xl p-6 min-h-[580px] overflow-x-auto relative">
            
            <motion.div
              id="printed-paper-preview"
              animate={{ scale: zoomLevel }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-full max-w-xl bg-[#FCFAF6] text-stone-900 p-8 rounded-sm shadow-2xl origin-top flex flex-col justify-between font-sans border-t-[6px] border-[#D946C4] min-h-[520px]"
            >
              <AnimatePresence mode="wait">
                
                {/* 1. COMMERCIAL TAX INVOICE */}
                {activeTab === 'invoice' && (
                  <motion.div
                    key="invoice-doc"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col h-full justify-between space-y-5"
                  >
                    {/* Invoice Letterhead */}
                    <div className="flex justify-between items-start border-b-2 border-stone-800 pb-3">
                      <div>
                        <h1 className="text-xs font-black tracking-wider text-stone-900 uppercase">Vanguard Freight Logistics</h1>
                        <p className="text-[8px] text-stone-500 mt-0.5 font-mono">302-304 Transport Nagar, New Delhi, DL 110043</p>
                        <p className="text-[8px] text-stone-400 font-mono">GSTIN: 07AAAAV9821A1Z0 • Tel: +91 11 4059 9821</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-stone-900 text-white text-[7px] font-mono uppercase tracking-widest font-bold rounded">
                          Tax Invoice
                        </span>
                        <h2 className="text-sm font-bold font-mono text-stone-900 mt-1">{invoiceNo}</h2>
                        <p className="text-[8px] text-stone-500 font-mono">Date: {sharedDate}</p>
                      </div>
                    </div>

                    {/* Client & Contact Info */}
                    <div className="grid grid-cols-2 gap-3 text-[9px] bg-stone-100/60 p-2 rounded border border-stone-200">
                      <div>
                        <span className="text-stone-400 font-mono text-[7px] uppercase tracking-wider block">Billed To (Shipper)</span>
                        <strong className="text-stone-800 block text-[10px] mt-0.5">{sharedClient || 'No Client Specified'}</strong>
                        {clientPhone && <span className="text-stone-500 font-mono text-[8px] mt-0.5 block">Phone: +91 {clientPhone}</span>}
                      </div>
                      <div className="text-right font-mono text-[8px] text-stone-500 flex flex-col justify-center">
                        <p><span className="text-stone-400">Payment Mode:</span> {paymentModeInvoice}</p>
                        <p><span className="text-stone-400">Reference No:</span> {invoiceReferenceNo || '-'}</p>
                      </div>
                    </div>

                    {/* Pickup & Delivery Addresses */}
                    <div className="grid grid-cols-2 gap-3 text-[9px]">
                      <div className="border border-stone-200 rounded p-2 bg-stone-50/50">
                        <span className="text-[7px] text-stone-400 font-mono uppercase tracking-wide block">Pickup Point</span>
                        <p className="text-stone-800 text-[8.5px] mt-0.5 leading-tight font-medium">{pickupAddress || 'Address not specified'}</p>
                        <p className="text-stone-500 text-[8px] mt-0.5 font-mono">{pickupCSP || '-'}</p>
                      </div>
                      <div className="border border-stone-200 rounded p-2 bg-stone-50/50">
                        <span className="text-[7px] text-stone-400 font-mono uppercase tracking-wide block">Delivery Point</span>
                        <p className="text-stone-800 text-[8.5px] mt-0.5 leading-tight font-medium">{deliveryAddress || 'Address not specified'}</p>
                        <p className="text-stone-500 text-[8px] mt-0.5 font-mono">{deliveryCSP || '-'}</p>
                      </div>
                    </div>

                    {/* Transit Specifications */}
                    <div className="grid grid-cols-4 gap-1.5 text-[8px] font-mono bg-stone-900 text-stone-100 p-2 rounded">
                      <div>
                        <span className="text-stone-400 block text-[7px] uppercase">Route:</span>
                        <strong className="text-white block truncate">{sharedRouteFrom || '-'} to {sharedRouteTo || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[7px] uppercase">Vehicle No:</span>
                        <strong className="text-white block truncate">{sharedTruck || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[7px] uppercase">Shipment Type:</span>
                        <strong className="text-white block truncate">{shipmentType === 'Other' ? customShipmentType : shipmentType}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[7px] uppercase">Total Weight:</span>
                        <strong className="text-white block truncate">{totalWeight}</strong>
                      </div>
                    </div>

                    {/* Itemized Table */}
                    <div className="flex-1">
                      <table className="w-full text-left text-[9px] border-collapse">
                        <thead>
                          <tr className="border-b border-stone-300 bg-stone-100 font-mono text-[7.5px] uppercase text-stone-500 font-bold">
                            <th className="py-1 px-2">S.No.</th>
                            <th className="py-1 px-2">Charge Description</th>
                            <th className="py-1 px-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {invoiceLines.map((line, idx) => (
                            <tr key={line.id} className="hover:bg-stone-50/50">
                              <td className="py-1.5 px-2 font-mono text-stone-400 text-[8px]">{(idx + 1).toString().padStart(2, '0')}</td>
                              <td className="py-1.5 px-2 text-stone-700">
                                <span className="font-medium text-stone-800">{line.description}</span>
                              </td>
                              <td className="py-1.5 px-2 text-right font-mono font-bold text-stone-900">
                                {line.value === 'Included' || line.value === 'Incl' ? (
                                  <span className="text-stone-400 font-mono text-[8px] uppercase">Included (Incl)</span>
                                ) : (
                                  formatINR(line.value as number)
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals Breakdown */}
                    <div className="border-t border-stone-200 pt-2 flex justify-between items-start">
                      <div className="text-[8px] text-stone-500 italic max-w-[50%] leading-relaxed font-serif">
                        Verbal translation: "{convertNumberToWords(grandTotal)}"
                      </div>
                      <div className="w-[45%] text-[9px] space-y-1 font-mono">
                        <div className="flex justify-between text-stone-500">
                          <span>Subtotal:</span>
                          <span>{formatINR(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-stone-500">
                          <span>GST ({gstPercent}%):</span>
                          <span>{formatINR(gstAmount)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-stone-900 border-t border-stone-300 pt-1 text-[10px]">
                          <span>Grand Total:</span>
                          <span className="text-stone-900 font-black">{formatINR(grandTotal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer declarations & Signatory (supports Stamp overlay) */}
                    <div className="border-t border-stone-200 pt-3 flex justify-between items-end text-[7px] text-stone-400">
                      <div>
                        <p className="font-bold text-stone-500 uppercase tracking-wider">Terms & Conditions</p>
                        <p className="mt-0.5">Please settle balance within 15 working days.</p>
                        <p>Subject to Delhi Jurisdiction courts only.</p>
                      </div>
                      <div className="text-center w-28 relative">
                        {sealImage && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none z-10 select-none">
                            <img
                              src={sealImage === '/assets/digital_seal.png' ? 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=200' : sealImage}
                              alt="Official Stamp"
                              className="h-14 w-auto object-contain opacity-85 rotate-[-8deg] mix-blend-multiply"
                            />
                          </div>
                        )}
                        <div className="h-6 border-b border-stone-300" />
                        <span className="block mt-1 font-mono uppercase text-[6.5px] tracking-wider text-stone-400 font-bold">Authorized Signatory</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. LORRY RECEIPT (Bilty) */}
                {activeTab === 'lr' && (
                  <motion.div
                    key="lr-doc"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col h-full justify-between space-y-4"
                  >
                    {/* Bilty Letterhead */}
                    <div className="flex justify-between items-start border-b border-stone-200 pb-3">
                      <div>
                        <h1 className="text-xs font-black tracking-widest text-stone-900 uppercase">Vanguard Freight Logistics</h1>
                        <p className="text-[8px] font-mono text-stone-500 uppercase">Lorry Receipt / Consignment Note (Bilty)</p>
                      </div>
                      <div className="text-right">
                        <span className="px-1.5 py-0.1 bg-stone-900 text-white text-[7px] font-mono uppercase tracking-widest font-bold rounded">
                          Triplicate copy
                        </span>
                        <h2 className="text-sm font-bold font-mono text-stone-900 mt-1">{lrNo}</h2>
                        <p className="text-[8px] text-stone-500 font-mono">Date: {sharedDate}</p>
                      </div>
                    </div>

                    {/* LR Grid details */}
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
                      <div className="border border-stone-200 rounded p-2 bg-stone-50/50">
                        <span className="text-[8px] text-stone-400 font-mono uppercase tracking-wide block">Consignor (Sender)</span>
                        <strong className="text-stone-800 block text-[10px] mt-0.5">{consignor || sharedClient || 'No Sender Specified'}</strong>
                        <span className="text-[9px] text-stone-500 block mt-0.5">Phone: +91 98765 43210</span>
                      </div>
                      <div className="border border-stone-200 rounded p-2 bg-stone-50/50">
                        <span className="text-[8px] text-stone-400 font-mono uppercase tracking-wide block">Consignee (Receiver)</span>
                        <strong className="text-stone-800 block text-[10px] mt-0.5">{consignee || 'No Receiver Specified'}</strong>
                        <span className="text-[9px] text-stone-500 block mt-0.5">Contact: Logistics Yard Desk</span>
                      </div>
                    </div>

                    {/* Logistics parameters */}
                    <div className="grid grid-cols-3 gap-2 text-[9px] font-mono bg-stone-100 p-2 rounded">
                      <div>
                        <span className="text-stone-400 block text-[8px] uppercase">Lorry No:</span>
                        <strong className="text-stone-700">{sharedTruck || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[8px] uppercase">Driver Name:</span>
                        <strong className="text-stone-700">{driverName || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[8px] uppercase">Route:</span>
                        <strong className="text-stone-700">{sharedRouteFrom} → {sharedRouteTo}</strong>
                      </div>
                    </div>

                    {/* Description table */}
                    <table className="w-full text-left text-[10px] border-collapse mt-1">
                      <thead>
                        <tr className="border-b border-stone-300 bg-stone-50 font-mono text-[8px] text-stone-500 font-bold">
                          <th className="py-1 px-2">No. of Packages</th>
                          <th className="py-1 px-2">Description of Goods</th>
                          <th className="py-1 px-2">Actual Weight (KG)</th>
                          <th className="py-1 px-2 text-right">Freight Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 text-stone-800">
                        <tr>
                          <td className="py-2 px-2 font-mono font-bold text-stone-900">{packagesCount || 0}</td>
                          <td className="py-2 px-2">
                            <span>{goodsDescription || 'No goods description added'}</span>
                            <p className="text-[8px] text-stone-400 italic">"Loaded in secure sealed condition"</p>
                          </td>
                          <td className="py-2 px-2 font-mono">{weightKg ? `${weightKg} kg` : '-'}</td>
                          <td className="py-2 px-2 text-right font-mono font-bold uppercase text-stone-700">
                            <span className={`px-1.5 py-0.5 rounded ${freightType === 'Paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                              {freightType}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Signatures bar */}
                    <div className="border-t border-stone-200 pt-4 flex justify-between text-[8px] text-stone-400">
                      <div>
                        <p className="font-bold text-stone-500">CONSIGNOR'S SIGNATURE</p>
                        <div className="h-6 border-b border-stone-200 w-32" />
                        <p className="mt-1">I certify packages are accurate.</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-stone-500">FOR VANGUARD LOGISTICS</p>
                        <div className="h-6 border-b border-stone-200 w-32" />
                        <p className="mt-1">Driver/Authorized agent signature</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. MONEY RECEIPT */}
                {activeTab === 'receipt' && (
                  <motion.div
                    key="receipt-doc"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col h-full justify-between space-y-6"
                  >
                    {/* Money Receipt Letterhead */}
                    <div className="flex justify-between items-start border-b border-stone-200 pb-4">
                      <div>
                        <h1 className="text-sm font-extrabold tracking-widest text-stone-900 uppercase">Vanguard Freight Logistics</h1>
                        <p className="text-[8px] text-stone-500 mt-0.5">302-304 Transport Nagar, New Delhi</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-800 text-[8px] font-mono uppercase tracking-widest font-bold rounded">
                          Official Receipt
                        </span>
                        <h2 className="text-base font-bold font-mono text-stone-900 mt-1">{receiptNo}</h2>
                        <p className="text-[8px] text-stone-500 font-mono">Date: {sharedDate}</p>
                      </div>
                    </div>

                    {/* Receipt Core verbal message */}
                    <div className="bg-stone-50 border border-stone-200 rounded p-5 space-y-4 font-serif text-stone-800 leading-loose">
                      <p className="text-xs">
                        Received with thanks from <strong className="text-stone-900 border-b border-dashed border-stone-300 pb-0.5 px-1">{sharedClient || '_________________________________'}</strong>,
                        a sum of rupees <strong className="text-stone-900 border-b border-dashed border-stone-300 pb-0.5 px-1 font-bold">{convertNumberToWords(grandTotal)}</strong>,
                        on account of logistics load services for vehicle <strong className="text-stone-900 font-mono">{sharedTruck || '______________'}</strong>,
                        covering route lane <strong className="text-stone-900 font-sans text-[11px] font-semibold">{sharedRouteFrom} → {sharedRouteTo}</strong>.
                      </p>
                    </div>

                    {/* Surcharge grid and reference mode */}
                    <div className="grid grid-cols-2 gap-4 text-[10px]">
                      <div className="p-3 bg-stone-100 rounded font-mono">
                        <span className="text-[8px] text-stone-400 uppercase tracking-wider block">Receipt amount (In figures)</span>
                        <strong className="text-lg text-[#D946C4] block mt-1">{formatINR(grandTotal)}</strong>
                      </div>
                      <div className="p-3 bg-stone-100 rounded font-mono text-stone-700 space-y-1">
                        <span className="text-[8px] text-stone-400 uppercase tracking-wider block">Payment Parameters</span>
                        <p className="text-[11px] mt-1"><span className="text-stone-400">Mode:</span> {paymentMode}</p>
                        <p className="text-[11px]"><span className="text-stone-400">Ref ID:</span> {referenceNo || 'None'}</p>
                      </div>
                    </div>

                    {/* Receipt footer */}
                    <div className="border-t border-stone-200 pt-5 flex justify-between items-end text-[8px] text-stone-400">
                      <div>
                        <p className="font-bold text-stone-500 uppercase tracking-wider">Stamp & Validity</p>
                        <p className="mt-0.5">This is a digitally logged payment certificate.</p>
                        <p>Requires no physical stamp.</p>
                      </div>
                      <div className="text-center w-28">
                        <div className="h-6 border-b border-stone-300" />
                        <span className="block mt-1 font-mono uppercase text-[7px] tracking-wider text-stone-400 font-bold">Received By Cashier</span>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>

          </div>

        </div>

      </div>

      {/* ==================== 4. BOTTOM BAR (sticky merge & export) ==================== */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-stone-950/90 backdrop-blur-md border-t border-white/10 z-40 px-6 flex items-center justify-between">
        
        {/* Toggle checkboxes check states */}
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-white/45 font-mono uppercase tracking-widest hidden md:inline">Include In Export:</span>
          
          <div className="flex items-center gap-2">
            {[
              { id: 'invoice', label: 'Invoice', active: includeInvoice, set: setIncludeInvoice },
              { id: 'lr', label: 'Lorry Receipt (Bilty)', active: includeLr, set: setIncludeLr },
              { id: 'receipt', label: 'Money Receipt', active: includeReceipt, set: setIncludeReceipt }
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => chip.set(!chip.active)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  chip.active 
                    ? 'bg-[#D946C4]/10 text-[#D946C4] border-[#D946C4]/30' 
                    : 'bg-white/2 text-white/30 border-white/5 hover:text-white/50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${chip.active ? 'bg-[#D946C4] animate-pulse' : 'bg-white/20'}`} />
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Merge action buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              // Trigger separate download of all checked files
              const queue: string[] = [];
              if (includeInvoice) queue.push('invoice');
              if (includeLr) queue.push('lr');
              if (includeReceipt) queue.push('receipt');

              if (queue.length === 0) {
                alert('Please select at least one document to export.');
                return;
              }

              setExportingMessage('Preparing separate files download queue...');
              queue.forEach((doc, idx) => {
                setTimeout(() => {
                  triggerSingleDownload(doc as any);
                }, idx * 1000);
              });
            }}
            className="text-xs text-white/50 hover:text-white underline cursor-pointer hidden sm:inline"
          >
            Export selected files separately
          </button>

          <button
            onClick={handleMergeDownload}
            className="flex items-center gap-1.5 px-5 h-10 bg-[#D946C4] hover:bg-[#D946C4]/80 text-white text-xs font-bold rounded-full transition-all duration-200 shadow-lg shadow-[#D946C4]/10 hover:shadow-[#D946C4]/25 active:scale-95 cursor-pointer"
          >
            <Layers size={14} />
            <span>Merge & Download PDF</span>
          </button>
        </div>

      </div>

    </div>
  );
}
