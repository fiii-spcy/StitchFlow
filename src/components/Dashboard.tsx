import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  getDoc,
  where
} from 'firebase/firestore';
import { ConvectionOrder, ProductionStatus, SewingComplexity, EmbroideryType, WhatsAppNotification } from '../types';
import KanbanBoard from './KanbanBoard';
import OrderList from './OrderList';
import Estimator from './Estimator';
import WhatsAppMockup from './WhatsAppMockup';
import OrderForm from './OrderForm';
import AdminOverview from './AdminOverview';
import InventoryManager from './InventoryManager';
import StitchFlowLogo from './StitchFlowLogo';
import { 
  Plus, 
  LayoutGrid, 
  TableProperties, 
  Calculator, 
  MessageSquare, 
  FolderSync, 
  Activity,
  CheckCircle,
  LayoutDashboard,
  Boxes,
  LogOut,
  Bell,
  Search,
  Calendar,
  Sparkles,
  User,
  Sliders,
  SlidersHorizontal,
  Workflow,
  Lock,
  Zap,
  Sun,
  Moon
} from 'lucide-react';

const STATUS_ORDER: ProductionStatus[] = ['Design', 'Cutting', 'Sewing', 'QC', 'Ready'];

interface DashboardProps {
  onExit?: () => void;
  convectionSlug?: string | null;
}

export default function Dashboard({ onExit, convectionSlug }: DashboardProps) {
  const [orders, setOrders] = useState<ConvectionOrder[]>([]);
  const [convectionInfo, setConvectionInfo] = useState<any | null>(null);
  const [activeTab, setActiveTab ] = useState<'overview' | 'kanban' | 'list' | 'inventory' | 'estimator'>('overview');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ConvectionOrder | null>(null);
  const [prefilledEstimate, setPrefilledEstimate] = useState<{
    fabricType: string;
    quantity: number;
    complexity: SewingComplexity;
    embroideryType: EmbroideryType;
    unitPrice: number;
    notes: string;
  } | null>(null);

  const [syncStatus, setSyncStatus] = useState<'synced' | 'disconnected'>('synced');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('stitchflow-dark') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('stitchflow-dark', String(darkMode));
    } catch (e) {
      console.error("Failed to save dark mode choice: ", e);
    }
  }, [darkMode]);

  const handleUpgradePackage = async (type: 'growth' | 'pro') => {
    if (convectionSlug) {
      try {
        const docRef = doc(db, 'convections', convectionSlug);
        await updateDoc(docRef, { packageType: type });
        setConvectionInfo((prev: any) => prev ? { ...prev, packageType: type } : null);
        setIsUpgradeOpen(false);
        const planName = type === 'growth' ? 'PAKET GROWTH' : 'PAKET PRO';
        alert(`Selamat! Usaha konveksi Anda telah sukses di-upgrade ke ${planName}. Fitur baru Anda sekarang telah aktif sepenuhnya!`);
      } catch (err) {
        console.error("Upgrade error: ", err);
        alert("Gagal melakukan upgrade. Silakan hubungi dukungan teknis StitchFlow.");
      }
    }
  };

  // Load specialized tenant settings if they exist
  useEffect(() => {
    if (convectionSlug) {
      const loadConvection = async () => {
        try {
          const docRef = doc(db, 'convections', convectionSlug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setConvectionInfo(docSnap.data());
          }
        } catch (err) {
          console.error("Error loading convection: ", err);
        }
      };
      loadConvection();
    }
  }, [convectionSlug]);

  // Real-time listen to Firestore database
  useEffect(() => {
    const ordersRef = collection(db, 'convection_orders');
    const q = convectionSlug 
      ? query(ordersRef, where('convectionSlug', '==', convectionSlug))
      : query(ordersRef);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData: ConvectionOrder[] = [];
      snapshot.forEach((doc) => {
        orderData.push({ id: doc.id, ...doc.data() } as ConvectionOrder);
      });
      
      // Sort in JavaScript memory safely
      orderData.sort((a, b) => b.createdAt - a.createdAt);
      
      setOrders(orderData);
      setSyncStatus('synced');

      // Auto-populate with sample telemetry if the Firestore database is completely empty
      if (snapshot.empty && !convectionSlug) {
        seedDatabase();
      }
    }, (error) => {
      console.error("Firestore listening failed: ", error);
      setSyncStatus('disconnected');
    });

    return () => unsubscribe();
  }, [convectionSlug]);

  // Self-seeding database helper
  const seedDatabase = async () => {
    console.log("Seeding Database with beautiful initial demo items...");
    const sampleOrders: Omit<ConvectionOrder, 'id'>[] = [
      {
        customerName: 'Baim Wong',
        customerPhone: '+628117765432',
        skuTitle: 'Jaket Bomber Reuni SMAN 1',
        fabricType: 'Fleece Premium',
        quantity: 80,
        unitPrice: 125000,
        totalAmount: 10000000,
        complexity: 'premium',
        embroideryType: 'embroidery_large',
        deadline: new Date(Date.now() + 8 * 24 * 60 * 65 * 1000).toISOString().split('T')[0],
        status: 'Sewing',
        notes: 'Pola bordir besar diletakkan di punggung belakang. Furing menggunakan satin lembut.',
        createdAt: Date.now() - 3600000 * 5,
        updatedAt: Date.now() - 3600000 * 5
      },
      {
        customerName: 'Siti Aminah',
        customerPhone: '+6285698765432',
        skuTitle: 'Kemeja PDH Mahasiswa KKN',
        fabricType: 'American Drill',
        quantity: 45,
        unitPrice: 95000,
        totalAmount: 4275000,
        complexity: 'standard',
        embroideryType: 'embroidery_small',
        deadline: new Date(Date.now() + 12 * 24 * 60 * 65 * 1000).toISOString().split('T')[0],
        status: 'Cutting',
        notes: 'Gunakan kancing kemeja flat putih. Bordir logo kelurahan disematkan di lengan kanan.',
        createdAt: Date.now() - 3600000 * 12,
        updatedAt: Date.now() - 3600000 * 12
      },
      {
        customerName: 'Budi Santoso',
        customerPhone: '+6281298765432',
        skuTitle: 'Polo Shirt Panitia Ramadhan',
        fabricType: 'Lacoste CVC',
        quantity: 25,
        unitPrice: 75000,
        totalAmount: 1875000,
        complexity: 'standard',
        embroideryType: 'screenprint',
        deadline: new Date(Date.now() + 4 * 24 * 60 * 65 * 1000).toISOString().split('T')[0],
        status: 'Design',
        notes: 'Sablon menggunakan tinta plastisol tahan luntur. Warna polos krah hijau daun muda.',
        createdAt: Date.now() - 3650000 * 20,
        updatedAt: Date.now() - 3650000 * 20
      }
    ];

    try {
      for (const order of sampleOrders) {
        const orderRef = await addDoc(collection(db, 'convection_orders'), order);
        await triggerWhatsAppMock(orderRef.id, order.customerName, order.customerPhone, order.skuTitle, order.status, order.quantity, order.fabricType);
      }
    } catch (e) {
      console.error("Failing when seeding database: ", e);
    }
  };

  // Helper utility to write a WhatsApp alert notification directly in Firestore
  const triggerWhatsAppMock = async (
    orderId: string, 
    customerName: string, 
    customerPhone: string, 
    skuTitle: string, 
    status: ProductionStatus,
    quantity?: number,
    fabricType?: string
  ) => {
    let message = '';
    
    switch (status) {
      case 'Design':
        message = `Halo *${customerName}*,\n\nTerima kasih! Pesanan konveksi Anda *${skuTitle}* (Kuantitas: ${quantity || 50} pcs) saat ini statusnya telah masuk dalam tahapan *ANTRIAN DESAIN* di StitchFlow 🎨.\n\nTim desainer grafis kami sedang merancang layout pola mockup jahit terbaik untuk Anda saksikan. Kami akan mengabari Anda setelah draf siap disetujui!`;
        break;
      case 'Cutting':
        message = `Halo *${customerName}*,\n\nKabar proses dari pabrik! Pesanan *${skuTitle}* Anda saat ini memasuki proses *POTONG BAHAN (CUTTING)* ✂️.\n\nBahan berkualitas tinggi (${fabricType || 'Pilihan'}) sedang dipotong presisi mengikuti ukuran yang Anda tentukan. Kami meminimalkan residu kain demi kecepatan finishing!`;
        break;
      case 'Sewing':
        message = `Halo *${customerName}*,\n\nProgress berjalan seru! Pesanan *${skuTitle}* saat ini berada di baris meja jahit utama (*PROSES JAHIT / SEWING*) oleh penjahit profesional kami 🪡.\n\nTiap detail kancing, saku, dan sablon/bordir juga mulai diaplikasikan dengan standar presisi tinggi.`;
        break;
      case 'QC':
        message = `Halo *${customerName}*,\n\nPesanan *${skuTitle}* Anda telah selesai dirangkai! Sekarang giliran tim ahli *QUALITY CONTROL (QC)* melakukan sortir kelayakan jahit 🔍.\n\nKami merapikan sisa benang (trimming) dan meninjau keakuratan ukuran agar dipastikan 100% sempurna sebelum diserahkan ke kurir pengiriman.`;
        break;
      case 'Ready':
        message = `Halo *${customerName}*,\n\nKabar luar biasa! Pesanan *${skuTitle}* statusnya dinyatakan: *SELESAI & SIAP DIKIRIM* 🎉!\n\nSeluruh barang telah disetrika uap wangi, disortir bersih, dan dipacking eksklusif dalam kardus pengaman. Driver / agen ekspedisi akan menjemput paket Anda sebentar lagi. Terima kasih banyak telah berkolaborasi dengan StitchFlow!`;
        break;
    }

    const payload: WhatsAppNotification = {
      orderId,
      customerName,
      customerPhone,
      skuTitle,
      status,
      message,
      sentAt: Date.now(),
      isSent: true
    };

    try {
      await addDoc(collection(db, 'whatsapp_notifications'), payload);
    } catch (e) {
      console.warn("Failing triggering simulated whatsapp log: ", e);
    }
  };

  // Add or update convection order
  const handleFormSubmit = async (orderInputs: Omit<ConvectionOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsFormOpen(false);
    
    if (editingOrder && editingOrder.id) {
      // Edit Mode
      try {
        const docRef = doc(db, 'convection_orders', editingOrder.id);
        const hasStatusChanged = editingOrder.status !== orderInputs.status;
        
        await updateDoc(docRef, {
          ...orderInputs,
          updatedAt: Date.now()
        });

        // Trigger WhatsApp reminder if edit yields a new status
        if (hasStatusChanged) {
          await triggerWhatsAppMock(editingOrder.id, orderInputs.customerName, orderInputs.customerPhone, orderInputs.skuTitle, orderInputs.status, orderInputs.quantity, orderInputs.fabricType);
        }

        setEditingOrder(null);
      } catch (err) {
        console.error("Error editing document in Firestore: ", err);
      }
    } else {
      // Fresh creation mode
      try {
        const payload = {
          ...orderInputs,
          convectionSlug: convectionSlug || '',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const docRef = await addDoc(collection(db, 'convection_orders'), payload);
        
        // Push newly created template whatsapp message
        await triggerWhatsAppMock(docRef.id, orderInputs.customerName, orderInputs.customerPhone, orderInputs.skuTitle, orderInputs.status, orderInputs.quantity, orderInputs.fabricType);
        setPrefilledEstimate(null);
      } catch (err) {
        console.error("Error adding document to Firestore: ", err);
      }
    }
  };

  // Manage status transition (Forward / Backward) from Kanban Columns
  const handleUpdateStatus = async (orderId: string, currentStatus: ProductionStatus, direction: 'forward' | 'backward') => {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    let nextIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex >= 0 && nextIndex < STATUS_ORDER.length) {
      const newStatus = STATUS_ORDER[nextIndex];
      const targetOrder = orders.find(o => o.id === orderId);
      
      if (targetOrder) {
        try {
          const docRef = doc(db, 'convection_orders', orderId);
          await updateDoc(docRef, {
            status: newStatus,
            updatedAt: Date.now()
          });

          // Create matching WhatsApp simulated notification message!
          await triggerWhatsAppMock(orderId, targetOrder.customerName, targetOrder.customerPhone, targetOrder.skuTitle, newStatus, targetOrder.quantity, targetOrder.fabricType);
        } catch (err) {
          console.error("Error updating status in Firestore: ", err);
        }
      }
    }
  };

  // Switch status inside grid table selector
  const handleStatusChangeFromList = async (orderId: string, newStatus: ProductionStatus) => {
    const targetOrder = orders.find(o => o.id === orderId);
    
    if (targetOrder && targetOrder.status !== newStatus) {
      try {
        const docRef = doc(db, 'convection_orders', orderId);
        await updateDoc(docRef, {
          status: newStatus,
          updatedAt: Date.now()
        });

        await triggerWhatsAppMock(orderId, targetOrder.customerName, targetOrder.customerPhone, targetOrder.skuTitle, newStatus, targetOrder.quantity, targetOrder.fabricType);
      } catch (err) {
        console.error("Error changing status in table: ", err);
      }
    }
  };

  // Delete convection order
  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'convection_orders', orderId));
    } catch (err) {
      console.error("Error deleting order document: ", err);
    }
  };

  // Prefill order creation modal from cost estimator
  const handleAddOrderFromEstimate = (estimate: {
    fabricType: string;
    quantity: number;
    complexity: SewingComplexity;
    embroideryType: EmbroideryType;
    unitPrice: number;
    notes: string;
  }) => {
    setPrefilledEstimate(estimate);
    setEditingOrder(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (order: ConvectionOrder) => {
    setPrefilledEstimate(null);
    setEditingOrder(order);
    setIsFormOpen(true);
  };

  return (
    <div id="stitchflow-dashboard-root" className={`min-h-screen bg-slate-50/50 flex text-slate-800 antialiased font-sans ${darkMode ? 'dark' : ''}`}>
      
      {/* 1. Symmetrical Left Dashboard Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 flex-shrink-0 relative z-30">
        
        <div className="flex-1 flex flex-col pt-6 overflow-y-auto">
          {/* Logo & Brand tagline */}
          <div className="px-6 pb-6 border-b border-slate-800/60 flex flex-col items-start gap-1.5">
            <div className="flex items-center gap-2.5">
              {convectionInfo ? (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-sm text-white border border-indigo-500">
                  {convectionInfo.convectionName.charAt(0).toUpperCase()}
                </div>
              ) : (
                <StitchFlowLogo size="sm" variant="colored" showText={false} />
              )}
              <span className="text-sm font-black text-white tracking-tight leading-tight max-w-[140px] truncate">
                {convectionInfo ? convectionInfo.convectionName : 'StitchFlow'}
              </span>
            </div>
            <span className="text-[9px] font-black tracking-widest text-indigo-400 uppercase bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-900/60 mt-1">
              {convectionInfo ? 'MANAJEMEN AKTIF' : 'CONVECTION OS v2.6'}
            </span>
          </div>

          {/* Nav list */}
          <nav className="p-4 space-y-1.5 flex-1 mt-4 text-left">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full px-4 py-3 text-xs font-semibold rounded-xl flex items-center gap-3 transition-colors text-left cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Pusat Ikhtisar</span>
            </button>

            <button
              onClick={() => setActiveTab('kanban')}
              className={`w-full px-4 py-3 text-xs font-semibold rounded-xl flex items-center gap-3 transition-colors text-left cursor-pointer ${
                activeTab === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Alur Kerja Kanban</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`w-full px-4 py-3 text-xs font-semibold rounded-xl flex items-center gap-3 transition-colors text-left cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-100'
              }`}
            >
              <TableProperties className="w-4 h-4" />
              <span>Database Pesanan</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full px-4 py-3 text-xs font-semibold rounded-xl flex items-center gap-3 transition-colors text-left cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-100'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Stok & Inventaris</span>
            </button>

            <button
              onClick={() => setActiveTab('estimator')}
              className={`w-full px-4 py-3 text-xs font-semibold rounded-xl flex items-center gap-3 transition-colors text-left cursor-pointer ${
                activeTab === 'estimator'
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-100'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Kalkulator HPP</span>
            </button>
          </nav>
        </div>

        {/* Package Plan Upgrade Action Widget */}
        {convectionInfo && (
          <div className="mx-4 mb-4 p-3.5 rounded-2xl bg-slate-950/45 border border-slate-800/80 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">PAKET LAYANAN</span>
              {convectionInfo.packageType === 'starter' ? (
                <span className="text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">STARTER (Rp199.000)</span>
              ) : convectionInfo.packageType === 'growth' ? (
                <span className="text-[9px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded">GROWTH (Rp399.000)</span>
              ) : (
                <span className="text-[9px] font-black bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">PRO ACTIVE (Rp699.000)</span>
              )}
            </div>
            
            {convectionInfo.packageType === 'starter' ? (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 leading-tight">
                  Website Pemesanan pelanggan Dinonaktifkan. Upgrade untuk membuka fungsionalitas pemesanan klien kustom.
                </p>
                <button
                  onClick={() => setIsUpgradeOpen(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-300 fill-amber-300 animate-pulse" />
                  Upgrade Fitur Sekarang
                </button>
              </div>
            ) : convectionInfo.packageType === 'growth' ? (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 leading-tight">
                  Website Pemesanan Klien Aktif dengan branding Standard. Upgrade ke Pro untuk whitelabel 100% & tanpa limit.
                </p>
                <button
                  onClick={() => setIsUpgradeOpen(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-300 fill-amber-300 animate-pulse" />
                  Upgrade Ke Pro Sekarang
                </button>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 leading-tight">
                Semua fitur aktif! URL website whitelabel pemesanan pelanggan berjalan optimal & Sinkronisasi WA aktif penuh.
              </p>
            )}
          </div>
        )}

        {/* Profile and Logout Exit Action */}
        <div className="p-4 border-t border-slate-800 space-y-3.5 bg-slate-950/20 text-left">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-indigo-650 flex items-center justify-center font-bold text-xs text-white uppercase border border-indigo-500">
              {convectionInfo ? convectionInfo.ownerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">{convectionInfo ? convectionInfo.ownerName : 'Baim Wong'}</p>
              <p className="text-[10px] text-slate-500 font-bold">Owner Konveksi</p>
            </div>
          </div>
          {!convectionSlug && onExit && (
            <button
              onClick={onExit}
              className="w-full py-2.5 px-4 text-xs font-bold rounded-xl text-red-400 hover:text-red-350 hover:bg-red-950/30 border border-slate-850 hover:border-red-900 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar ke Website</span>
            </button>
          )}
        </div>
      </aside>

      {/* 2. Main content area on the right */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Workspace Top Bar Header */}
        <header className="bg-white border-b border-slate-150 h-18 px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <span className="text-slate-800 font-bold uppercase tracking-wider text-[10px] bg-slate-100 px-2.5 py-1 rounded">
              {activeTab === 'overview' ? 'DASHBOARD IKHTISAR' :
               activeTab === 'kanban' ? 'PAPAN ALUR KERJA' :
               activeTab === 'list' ? 'DATABASE CLIENT MASTER' :
               activeTab === 'inventory' ? 'INVENTARIS & ROLLS KAIN' :
               'ESTIMATOR HARGA HPP'}
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Live Clock indicator representing actual time connected */}
            <div className="hidden md:flex items-center gap-2 text-[11px] font-bold text-slate-500 font-mono bg-slate-50/85 px-3.5 py-1.5 rounded-xl border border-slate-100">
              <Calendar className="w-3.5 h-3.5 text-indigo-505" />
              <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>

            <div className="relative">
              <button className="p-2 border border-slate-150 hover:bg-slate-50 rounded-xl relative transition-colors cursor-pointer text-slate-500 hover:text-slate-800">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              </button>
            </div>

            {/* Dark Mode Ergonomic Toggle */}
            <div className="relative">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? "Aktifkan Mode Terang (Shift Siang)" : "Aktifkan Mode Gelap (Shift Malam)"}
                className="p-2 border border-slate-150 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-400 rotate-0 transition-transform duration-500" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-650 -rotate-12 transition-transform duration-500" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
              <button 
                onClick={() => {
                  setEditingOrder(null);
                  setPrefilledEstimate(null);
                  setIsFormOpen(true);
                }}
                className="bg-neutral-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pesanan</span>
              </button>
            </div>
          </div>
        </header>

        {/* Workspace Central View body contents */}
        <div className="p-8 max-w-7xl w-full mx-auto pb-24">
          
          {activeTab === 'overview' && (
            <AdminOverview 
              orders={orders}
              onUpdateStatusFromOverview={handleUpdateStatus}
              onStatusChangeFromOverview={handleStatusChangeFromList}
              onEditOrder={handleEditClick}
              onNavigateToTab={(tab: string) => {
                if (tab === 'orders') setActiveTab('list');
              }}
            />
          )}

          {activeTab === 'kanban' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-2 text-left">
                <span className="flex items-center gap-1.5 font-medium">
                  <FolderSync className="w-3.5 h-3.5 text-indigo-505 animate-spin" />
                  <span>Tekan tombol 'Lanjut' di tiap kartu pesanan untuk melangkah ke kolom tahap produksi berikutnya secara real-time.</span>
                </span>
              </div>
              <KanbanBoard 
                orders={orders} 
                onUpdateStatus={handleUpdateStatus} 
                onEditOrder={handleEditClick} 
                onDeleteOrder={handleDeleteOrder} 
              />
            </div>
          )}

          {activeTab === 'list' && (
            <OrderList 
              orders={orders} 
              onEditOrder={handleEditClick} 
              onDeleteOrder={handleDeleteOrder} 
              onStatusChange={handleStatusChangeFromList}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryManager />
          )}

          {activeTab === 'estimator' && (
            <Estimator onAddOrderFromEstimate={handleAddOrderFromEstimate} />
          )}

        </div>

      </main>

      {/* Form modal */}
      <OrderForm 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setEditingOrder(null);
          setPrefilledEstimate(null);
        }} 
        onSubmit={handleFormSubmit}
        initialData={editingOrder}
        prefilledEstimate={prefilledEstimate}
      />

      {/* Upgrade to Pro Modal */}
      {isUpgradeOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-100 shadow-2xl overflow-hidden relative text-left p-7 space-y-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 px-2.5 text-[9px] font-black bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-full uppercase tracking-wider">Upgrade Wizard</span>
                <span className="p-1 px-2 text-[9px] font-black bg-slate-900 text-amber-300 rounded uppercase tracking-wider flex items-center gap-0.5"><Zap className="w-2.5 h-2.5 fill-amber-300 text-amber-300" /> Premium</span>
              </div>
              <button 
                onClick={() => setIsUpgradeOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition text-slate-500 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Tingkatkan Layanan StitchFlow Anda</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pilih paket premium yang paling cocok dengan perkembangan bisnis konveksi Anda saat ini.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Growth Box */}
              <div className="border border-slate-200 hover:border-sky-500/80 p-5 rounded-2xl bg-slate-50/50 space-y-4 flex flex-col justify-between transition-all">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-800">Growth Plan</span>
                    <span className="text-[8px] font-bold bg-sky-50 text-sky-600 border border-sky-100 px-1.5 py-0.5 rounded">Recomended</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Untuk bisnis konveksi yang sedang bertumbuh pesat.</p>
                  <p className="text-sm font-black text-slate-900">Rp 399.000 <span className="text-[9px] text-slate-400 font-normal">/ bln</span></p>
                  <div className="space-y-1 text-[10px] text-slate-600 pt-2 border-t border-slate-150">
                    <p className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> Maks 200 order/bln</p>
                    <p className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> Portal Pemesanan Aktif</p>
                    <p className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✓</span> Standard Customer Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUpgradePackage('growth')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] py-2.5 rounded-xl transition-all cursor-pointer mt-3"
                >
                  Pilih Growth
                </button>
              </div>

              {/* Pro Box */}
              <div className="border-2 border-indigo-600 p-5 rounded-2xl bg-indigo-50/10 space-y-4 flex flex-col justify-between relative">
                <span className="absolute -top-2.5 right-4 bg-indigo-650 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">TERBAIK</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-indigo-950">Pro Plan</span>
                  </div>
                  <p className="text-[10px] text-indigo-650/80">Solusi whitelabel lengkap & sinkronisasi otomatis.</p>
                  <p className="text-sm font-black text-indigo-950">Rp 699.000 <span className="text-[9px] text-indigo-600 font-normal">/ bln</span></p>
                  <div className="space-y-1 text-[10px] text-slate-600 pt-2 border-t border-indigo-100">
                    <p className="flex items-center gap-1.5"><span className="text-indigo-600 font-bold">✓</span> Laporan & Order Tanpa Batas</p>
                    <p className="flex items-center gap-1.5"><span className="text-indigo-600 font-bold">✓</span> Whitelabel Portal 100%</p>
                    <p className="flex items-center gap-1.5"><span className="text-indigo-600 font-bold">✓</span> Real-time Sync WhatsApp</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUpgradePackage('pro')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-2.5 rounded-xl shadow-lg shadow-indigo-650/10 transition-all cursor-pointer mt-3"
                >
                  Pilih Pro
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsUpgradeOpen(false)}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider cursor-pointer"
              >
                Batal & Tetap di Paket Saat Ini
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
