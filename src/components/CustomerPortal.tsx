import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Upload, 
  Plus, 
  Minus, 
  ChevronRight, 
  Check, 
  Clock, 
  MapPin, 
  MessageCircle, 
  ShoppingBag, 
  Award, 
  ArrowRight, 
  Truck, 
  Layers, 
  FileText, 
  User, 
  History, 
  Mail, 
  Phone, 
  Heart,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { collection, addDoc, getDocs, doc, query, where, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import StitchFlowLogo from './StitchFlowLogo';
import { ConvectionOrder, SewingComplexity, EmbroideryType } from '../types';

interface CustomerPortalProps {
  onExit: () => void;
  convectionSlug?: string | null;
}

export default function CustomerPortal({ onExit, convectionSlug }: CustomerPortalProps) {
  const [convectionData, setConvectionData] = useState<any | null>(null);
  const [isLoadingConvection, setIsLoadingConvection] = useState<boolean>(false);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'estimator' | 'track' | 'history'>('home');
  
  // Local active orders history (from localStorage & synced from firebase)
  const [localHistoryIds, setLocalHistoryIds] = useState<string[]>([]);
  const [historicalOrders, setHistoricalOrders] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // --- Price Estimator State ---
  const [estimatorStep, setEstimatorStep] = useState<1 | 2 | 3>(1);
  const [productType, setProductType] = useState<string>('Premium Heavyweight Hoodie');
  const [selectedMaterial, setSelectedMaterial] = useState<'cotton' | 'perf' | 'terry'>('cotton');
  const [quantity, setQuantity] = useState<number>(50);
  const [finishingStyle, setFinishingStyle] = useState<'screen' | 'embroidery' | 'dtg'>('screen');
  
  // Premium Add-ons
  const [addonNeckLabels, setAddonNeckLabels] = useState<boolean>(true);
  const [addonEcoPack, setAddonEcoPack] = useState<boolean>(false);

  // Step 2 Form Details
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  // --- Order Tracking State ---
  const [trackingId, setTrackingId] = useState('SF-8422-TX');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);

  // Standard/Demo Order used as fallback for "SF-8422-TX"
  const demoTrackedOrder = {
    id: 'SF-8422-TX',
    customerName: 'CV Jasa Busana',
    customerPhone: '081290001000',
    skuTitle: 'Premium Cotton Polo & Chinos Custom',
    fabricType: 'Pique Cotton Premium',
    quantity: 500,
    unitPrice: 15900,
    totalAmount: 7950000,
    status: 'Sewing', // Map to production state
    deadline: '2026-07-28',
    notes: 'Custom embroidered logo on chest pocket.',
    createdAt: Date.now() - 5 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 1 * 24 * 3600 * 1000,
  };

  // Load custom convection settings from database if slug is provided
  useEffect(() => {
    if (convectionSlug) {
      const loadConvection = async () => {
        setIsLoadingConvection(true);
        try {
          const docRef = doc(db, 'convections', convectionSlug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setConvectionData(docSnap.data());
          }
        } catch (err) {
          console.error("Error loading convection: ", err);
        } finally {
          setIsLoadingConvection(false);
        }
      };
      loadConvection();
    }
  }, [convectionSlug]);

  // Load localStorage tracking IDs on load
  useEffect(() => {
    const saved = localStorage.getItem('stitchflow_customer_orders');
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        setLocalHistoryIds(ids);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync historical orders from Firestore
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, localHistoryIds]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const list: any[] = [];
      // Always add the simulated demo order only on general demo, not on custom convection tenants
      if (!convectionSlug) {
        list.push({
          id: 'SF-8422-TX',
          skuTitle: 'Premium Cotton Polo Plus',
          quantity: 500,
          totalAmount: 7950000,
          status: 'Sewing',
          createdAt: Date.now() - 5 * 24 * 3600 * 1000,
        });
      }

      // Fetch user's placed orders from db
      if (localHistoryIds.length > 0) {
        const ordersRef = collection(db, 'convection_orders');
        const q = convectionSlug
          ? query(ordersRef, where('convectionSlug', '==', convectionSlug))
          : query(ordersRef);
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const docId = docSnap.id;
          // Matches if ID is in local storage list or same phone number
          if (localHistoryIds.includes(docId)) {
            list.push({
              id: docId,
              ...data,
            });
          }
        });
      }
      
      // Sort desc by date
      list.sort((a, b) => b.createdAt - a.createdAt);
      setHistoricalOrders(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Base pricing logic for Estimator
  const getProductBasePrice = () => {
    switch (productType) {
      case 'Premium Heavyweight Hoodie': return 34.00;
      case 'Classic Pique Polo Shirt': return 18.90;
      case 'Standard Combed Cotton T-shirt': return 12.50;
      case 'Tough Twill Workshirt': return 28.50;
      default: return 15.00;
    }
  };

  const getMaterialPremium = () => {
    switch (selectedMaterial) {
      case 'cotton': return 0.00; // standard base
      case 'perf': return 2.50;
      case 'terry': return 4.50;
      default: return 0.00;
    }
  };

  const getFinishingPremium = () => {
    switch (finishingStyle) {
      case 'screen': return 0.00;
      case 'embroidery': return 1.50;
      case 'dtg': return 3.00;
      default: return 0.00;
    }
  };

  // Live Pricing computations
  const unitPrice = getProductBasePrice() + getMaterialPremium() + getFinishingPremium() + (addonNeckLabels ? 1.50 : 0) + (addonEcoPack ? 0.85 : 0);
  const subtotal = unitPrice * quantity;
  const discountRate = quantity >= 50 ? 0.15 : 0; // 15% discount for bulk 50+ structures
  const bulkDiscount = subtotal * discountRate;
  const addonsTotalAmount = ((addonNeckLabels ? 1.50 : 0) + (addonEcoPack ? 0.85 : 0)) * quantity;
  const totalPrice = subtotal - bulkDiscount;

  // Custom IDR Multi-Tenant pricing
  const isCustomTenant = !!convectionData;
  const getProductBasePriceIDR = () => {
    if (convectionData && convectionData.prices) {
      switch (productType) {
        case 'Premium Heavyweight Hoodie': return Number(convectionData.prices.hoodie) || 110000;
        case 'Classic Pique Polo Shirt': return Number(convectionData.prices.polo) || 70000;
        case 'Standard Combed Cotton T-shirt': return Number(convectionData.prices.tshirt) || 45000;
        case 'Tough Twill Workshirt': return Number(convectionData.prices.workshirt) || 85000;
        default: return 50000;
      }
    }
    return 0;
  };

  const getMaterialPremiumIDR = () => {
    switch (selectedMaterial) {
      case 'cotton': return 0;
      case 'perf': return 15000;
      case 'terry': return 25000;
      default: return 0;
    }
  };

  const getFinishingPremiumIDR = () => {
    switch (finishingStyle) {
      case 'screen': return 0;
      case 'embroidery': return 10000;
      case 'dtg': return 20000;
      default: return 0;
    }
  };

  const basePriceIDR = getProductBasePriceIDR();
  const materialPremiumIDR = getMaterialPremiumIDR();
  const finishingPremiumIDR = getFinishingPremiumIDR();
  const addonLabelsIDR = addonNeckLabels ? 5000 : 0;
  const addonEcoIDR = addonEcoPack ? 3500 : 0;

  const unitPriceIDR = basePriceIDR + materialPremiumIDR + finishingPremiumIDR + addonLabelsIDR + addonEcoIDR;
  const subtotalIDR = unitPriceIDR * quantity;
  const discountRateIDR = quantity >= 50 ? 0.10 : 0; // 10% bulk discount for IDR flow
  const bulkDiscountIDR = subtotalIDR * discountRateIDR;
  const addonsTotalAmountIDR = (addonLabelsIDR + addonEcoIDR) * quantity;
  const totalPriceIDR = subtotalIDR - bulkDiscountIDR;

  // Handler for custom order submissions
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert('Mohon isi nama lengkap dan nomor WhatsApp Anda.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const generatedCode = 'SF-' + Math.floor(1000 + Math.random() * 9000) + '-TX';
      
      // Standardize payload fields to fit in ConvectionOrder
      const newOrder: any = {
        convectionSlug: convectionSlug || '',
        customerName: clientName,
        customerPhone: clientPhone,
        skuTitle: `${productType} (${finishingStyle === 'screen' ? 'Sablon' : finishingStyle === 'embroidery' ? 'Bordir' : 'DTG Direct'})`,
        fabricType: selectedMaterial === 'cotton' ? 'Organic Cotton 280 GSM' : selectedMaterial === 'perf' ? 'Performance Blend Moisture-wicking' : 'French Terry Heavyweight 400 GSM',
        quantity: quantity,
        unitPrice: isCustomTenant ? Math.round(unitPriceIDR) : Math.round(unitPrice * 15000), 
        totalAmount: isCustomTenant ? Math.round(totalPriceIDR) : Math.round(totalPrice * 15000),
        complexity: 'standard' as SewingComplexity,
        embroideryType: finishingStyle === 'embroidery' ? 'embroidery_small' : finishingStyle === 'screen' ? 'screenprint' : 'none' as EmbroideryType,
        deadline: deadlineDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: 'Design', // Starts at Design phase
        notes: `${clientNotes}. Addons: ${addonNeckLabels ? 'Label Leher' : ''} ${addonEcoPack ? 'Eco Pack' : ''}`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Set explicit ID to allow instant tracking from generator
      const ordersRef = collection(db, 'convection_orders');
      const docRef = await addDoc(ordersRef, newOrder);
      const newlyPlacedId = docRef.id;

      // Update storage lists
      const updatedHistoryIds = [newlyPlacedId, ...localHistoryIds];
      setLocalHistoryIds(updatedHistoryIds);
      localStorage.setItem('stitchflow_customer_orders', JSON.stringify(updatedHistoryIds));

      setPlacedOrderId(generatedCode); // Custom display ID
      setEstimatorStep(3);
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat menyimpan pesanan. Silakan coba kembali.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Tracking query lookup code
  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setIsSearchingTrack(true);
    setTrackingError(null);
    setTrackedOrder(null);

    try {
      // If client is searching our simulated code
      if (trackingId.trim().toUpperCase() === 'SF-8422-TX') {
         setTrackedOrder(demoTrackedOrder);
         setIsSearchingTrack(false);
         return;
      }

      // Check firebase custom order snaps
      const ordersRef = collection(db, 'convection_orders');
      const q = query(ordersRef);
      const querySnapshot = await getDocs(q);
      
      let foundData: any = null;
      querySnapshot.forEach((docSnap) => {
        // match on Firestore ID directly
        if (docSnap.id === trackingId.trim()) {
          foundData = { id: docSnap.id, ...docSnap.data() };
        }
      });

      if (foundData) {
        setTrackedOrder(foundData);
      } else {
        setTrackingError(`Format Nomor ID "${trackingId}" tidak ditemukan. Silakan masukkan ID yang valid.`);
      }
    } catch (e) {
      console.error(e);
      setTrackingError('Terjadi kesalahan koneksi server saat mencari pesanan.');
    } finally {
      setIsSearchingTrack(false);
    }
  };

  // Quick tracker shortcut click
  const quickTrackOrder = (id: string, fullOrderData?: any) => {
    setTrackingId(id);
    if (id === 'SF-8422-TX') {
      setTrackedOrder(demoTrackedOrder);
    } else if (fullOrderData) {
      setTrackedOrder(fullOrderData);
    } else {
      // Trigger search programmatically
      setTrackedOrder(null);
      setTimeout(() => {
        const dummyEvent = { preventDefault: () => {} } as React.FormEvent;
        // set dynamic check
        const runQuery = async () => {
          try {
            const docRef = doc(db, 'convection_orders', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setTrackedOrder({ id: docSnap.id, ...docSnap.data() });
            }
          } catch(err) {
            console.error(err);
          }
        };
        runQuery();
      }, 50);
    }
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startCustomizationFromCatalog = (pType: string) => {
    setProductType(pType);
    setEstimatorStep(1);
    setActiveTab('estimator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // WhatsApp helper link
  const openSupportWhatsApp = () => {
    const phoneNumber = convectionData?.whatsAppPhone || '6281290001000';
    const msg = convectionData 
      ? `Halo Admin ${convectionData.convectionName}, saya ingin berkonsultasi mengenai pesanan pakaian kustom di konveksi Anda.`
      : 'Halo StitchFlow, saya tertarik dengan platform digital untuk usaha konveksi dan ingin berkonsultasi mengenai pesanan kustom baju.';
    window.open(`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (isLoadingConvection) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-450 font-bold tracking-widest uppercase">Memuat Portal Konveksi...</p>
        </div>
      </div>
    );
  }

  const isStarterPlan = convectionData && convectionData.packageType === 'starter';

  if (isStarterPlan) {
    return (
      <div className="min-h-screen bg-slate-50/30 text-slate-800 font-sans antialiased flex flex-col justify-between">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-50 px-6 py-4 animate-fade-in">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-7">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black text-white text-sm">
                  {convectionData.convectionName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-black text-indigo-950 uppercase tracking-wide">
                  {convectionData.convectionName}
                </span>
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Starter Plan
                </span>
              </div>
            </div>
            {!convectionSlug && (
              <button 
                onClick={onExit}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Kembali ke StitchFlow
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center py-10 px-6">
          <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-150 shadow-[0_4px_24px_rgba(15,29,51,0.015)] p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-display font-black text-slate-900 tracking-tight">
                Online Ordering Page Nonaktif
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Layanan pemesanan interaktif, kalkulator harga otomatis, dan pelacakan order mandiri untuk <span className="font-extrabold text-slate-800">{convectionData.convectionName}</span> tidak tersedia karena berada di <span className="font-extrabold text-indigo-650">StitchFlow Starter Plan</span>.
              </p>
            </div>

            {/* Comparison Details */}
            <div className="bg-slate-50 border border-slate-150/70 p-5 rounded-2xl text-left space-y-3.5">
              <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">MENGAPA HALAMAN INI DIKUNCI?</p>
              
              <div className="space-y-3 text-xs text-slate-650">
                <div className="flex items-start gap-2.5">
                  <span className="text-red-500 font-extrabold text-sm leading-none mt-0.5">✕</span>
                  <div>
                    <strong className="text-slate-800 font-bold block">Kalkulator Estimasi Publik Dinonaktifkan</strong>
                    Harga belum tersinkronisasi otomatis dengan formulir digital interaktif.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-red-500 font-extrabold text-sm leading-none mt-0.5">✕</span>
                  <div>
                    <strong className="text-slate-800 font-bold block">Sistem Tracking Order Nonaktif</strong>
                    Pelanggan tidak dapat memantau alur potong, jahit, dan QC secara real-time.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-red-500 font-extrabold text-sm leading-none mt-0.5">✕</span>
                  <div>
                    <strong className="text-slate-800 font-bold block">Tanpa Katalog Kain Digital</strong>
                    Opsi visualisasi bahan premium tidak tersemat secara interaktif.
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={openSupportWhatsApp}
                className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg shadow-emerald-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Hubungi Konveksi (WhatsApp)
              </button>
              {!convectionSlug && (
                <button
                  onClick={onExit}
                  className="w-full sm:w-fit bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-3.5 px-6 rounded-xl transition-colors cursor-pointer"
                >
                  Kembali
                </button>
              )}
            </div>

            {/* Owner Section */}
            <div className="border-t border-slate-100 pt-5 text-center">
              <p className="text-[10px] text-slate-450 leading-relaxed">
                Apakah Anda pemilik <span className="font-bold text-slate-700">{convectionData.convectionName}</span>? <br />
                Aktifkan online-portal ini dengan meng-upgrade ke <span className="text-indigo-600 font-bold">Paket Pro</span> dari dashboard Anda!
              </p>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-slate-100 text-center text-[10px] text-slate-400">
          Powered by StitchFlow Convection OS. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans antialiased flex flex-col justify-between">
      
      {/* 1. Header Navigation matching UI */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-7">
            <div onClick={() => setActiveTab('home')} className="cursor-pointer">
              {convectionData ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-sm">
                    {convectionData.convectionName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-black text-indigo-950 uppercase tracking-wide">
                    {convectionData.convectionName}
                  </span>
                </div>
              ) : (
                <StitchFlowLogo size="sm" variant="colored" />
              )}
            </div>

            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-500">
              <button 
                onClick={() => setActiveTab('catalog')} 
                className={`py-1 relative transition-colors cursor-pointer ${activeTab === 'catalog' ? 'text-slate-900 border-b-2 border-slate-900 font-bold' : 'hover:text-slate-900'}`}
              >
                Catalog
              </button>
              <button 
                onClick={() => { setEstimatorStep(1); setActiveTab('estimator'); }} 
                className={`py-1 relative transition-colors cursor-pointer ${activeTab === 'estimator' ? 'text-indigo-650 border-b-2 border-indigo-650 font-bold' : 'hover:text-slate-900'}`}
              >
                Price Estimator
              </button>
              <button 
                onClick={() => setActiveTab('track')} 
                className={`py-1 relative transition-colors cursor-pointer ${activeTab === 'track' ? 'text-slate-900 border-b-2 border-slate-900 font-bold' : 'hover:text-slate-900'}`}
              >
                Track Order
              </button>
              <button 
                onClick={() => setActiveTab('history')} 
                className={`py-1 relative transition-colors cursor-pointer ${activeTab === 'history' ? 'text-slate-900 border-b-2 border-slate-900 font-bold' : 'hover:text-slate-900'}`}
              >
                My History
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {!convectionSlug && (
              <button 
                onClick={onExit} 
                className="text-xs h-9 px-4 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 text-slate-700 transition"
              >
                {convectionData ? 'Website Utama StitchFlow' : 'Dashboard Owner'}
              </button>
            )}
            <button 
              onClick={() => { setEstimatorStep(1); setActiveTab('estimator'); }} 
              className="bg-neutral-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4.5 rounded-xl transition cursor-pointer"
            >
              Start Order
            </button>
          </div>
        </div>
      </header>

      {/* Main Pages Content container */}
      <main className="flex-grow">

        {/* =====================================
            SCREEN 1: HOME/LANDING TAB
           ===================================== */}
        {activeTab === 'home' && (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="px-6 py-8 md:py-12 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left Hero */}
                <div className="lg:col-span-6 space-y-7 text-left">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold tracking-wider rounded-lg border border-indigo-100">
                    <ShieldCheck className="w-3.5 h-3.5" /> Professional Grade Manufacturing ({convectionData ? 'Whitelabel Portal Active' : 'StitchFlow Client'})
                  </span>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-[46px] font-extrabold text-slate-900 leading-[1.12] tracking-tight">
                    {convectionData ? (
                      <>Pesan Pakaian Kustom <br /> di <span className="text-indigo-650 bg-gradient-to-r from-indigo-600 to-sky-650 bg-clip-text text-transparent">{convectionData.convectionName}</span></>
                    ) : (
                      <>Order Custom Apparel <br className="hidden sm:inline" /> with Precision</>
                    )}
                  </h1>
                  
                  <p className="text-base text-slate-500 leading-relaxed max-w-xl font-sans font-medium">
                    {convectionData ? (
                      convectionData.tagline || 'Pengerjaan cepat, rapi, dan tepercaya untuk kaos, jaket, almamater, dan pakaian kerja.'
                    ) : (
                      'From prototype to bulk production, StitchFlow streamlines your apparel manufacturing with real-time tracking.'
                    )}
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <button 
                      onClick={() => { setEstimatorStep(1); setActiveTab('estimator'); }}
                      className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-650/10 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>{convectionData ? 'Mulai Estimasi Harga' : 'Start Your Order'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setActiveTab('catalog')}
                      className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3.5 px-6 rounded-xl border border-slate-200 transition-all text-center cursor-pointer"
                    >
                      {convectionData ? 'Lihat Katalog Kain' : 'View Fabric Catalog'}
                    </button>
                  </div>
                </div>

                {/* Right Hero Image with overlay cards */}
                <div className="lg:col-span-6 relative flex justify-center">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 max-w-lg aspect-video sm:aspect-square w-full">
                    {/* Sewing Machine image */}
                    <img 
                      src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1000" 
                      alt="Premium Manufacturing Stitching" 
                      className="w-full h-full object-cover transform hover:scale-105 duration-700"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark gradient blur banner overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>

                    {/* Active Production Badge Overlays matches UI mockup Screen 1 */}
                    <div className="absolute bottom-5 left-5 right-5 bg-white p-4.5 rounded-2xl shadow-xl border border-slate-100 flex items-start gap-3 max-w-xs transition hover:translate-y-[-2px]">
                      <div className="self-center">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                      </div>
                      <div className="text-left space-y-0.5">
                        <h4 className="text-[11px] font-extrabold text-emerald-600 block uppercase tracking-wider">Active Production</h4>
                        <p className="text-xs text-slate-800 font-bold">Batch #SF-2024</p>
                        <p className="text-[10px] text-slate-400">Currently in the Precision Stitching phase.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Steps Workflow section */}
            <section className="bg-white border-y border-slate-100 py-16 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="text-center space-y-3 mb-12">
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">The StitchFlow Process</h2>
                  <p className="text-sm text-slate-500">Transparent, efficient manufacturing from day one.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Step 1 */}
                  <div className="bg-slate-50/40 p-8 rounded-2xl border border-slate-100 text-center space-y-4 hover:border-slate-200 transition">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center mx-auto border border-indigo-100">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">1. Instant Estimate</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                      Upload your designs and select materials to receive an immediate, transparent price quote.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-50/40 p-8 rounded-2xl border border-slate-100 text-center space-y-4 hover:border-slate-200 transition">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center mx-auto border border-indigo-100">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">2. Confirm Order</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                      Finalize specifications with our design experts and initiate the production line.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-50/40 p-8 rounded-2xl border border-slate-100 text-center space-y-4 hover:border-slate-200 transition">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center mx-auto border border-indigo-100">
                      <Truck className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">3. Track Production</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                      Monitor every stage of manufacturing and shipping in real-time through your portal dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Product categories grid view matching Screen 1 layout */}
            <section className="py-16 px-6 bg-slate-50/40">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-10">
                  <div className="text-left space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Product Categories</h2>
                    <p className="text-xs text-slate-500">Premium blanks ready for your customization.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('catalog')} 
                    className="text-xs font-bold text-indigo-650 hover:text-indigo-850 flex items-center gap-1 cursor-pointer transition"
                  >
                    <span>Explore Full Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[550px]">
                  {/* Left big card - Outerwear */}
                  <div 
                    onClick={() => startCustomizationFromCatalog('Premium Heavyweight Hoodie')}
                    className="relative rounded-2xl overflow-hidden shadow-md group cursor-pointer border border-slate-150 h-full"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600" 
                      alt="Premium Outerwear" 
                      className="w-full h-full object-cover transform group-hover:scale-105 duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-left text-white">
                      <h3 className="text-lg font-bold">Premium Outerwear</h3>
                      <p className="text-xs text-slate-300">Hoodies, Jackets & Techwear</p>
                    </div>
                  </div>

                  {/* Right layout column */}
                  <div className="grid grid-rows-2 gap-6 h-full">
                    {/* Top basics */}
                    <div 
                      onClick={() => startCustomizationFromCatalog('Standard Combed Cotton T-shirt')}
                      className="relative rounded-2xl overflow-hidden shadow-sm group cursor-pointer border border-slate-150 h-full min-h-[160px]"
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600" 
                        alt="Performance Basics" 
                        className="w-full h-full object-cover transform group-hover:scale-105 duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 text-left text-white">
                        <h3 className="text-lg font-bold">Performance Basics</h3>
                        <p className="text-xs text-slate-300">Tees & Polos</p>
                      </div>
                    </div>

                    {/* Bottom grid (nested row) */}
                    <div className="grid grid-cols-2 gap-6 h-full">
                      {/* Left corporate */}
                      <div 
                        onClick={() => startCustomizationFromCatalog('Classic Pique Polo Shirt')}
                        className="relative rounded-2xl overflow-hidden shadow-sm group cursor-pointer border border-slate-150 h-full min-h-[160px]"
                      >
                        <img 
                          src="https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=300" 
                          alt="Corporate" 
                          className="w-full h-full object-cover transform group-hover:scale-105 duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-left text-white">
                          <h3 className="text-sm font-bold">Corporate</h3>
                        </div>
                      </div>

                      {/* Right accessories */}
                      <div 
                        onClick={() => startCustomizationFromCatalog('Premium Heavyweight Hoodie')}
                        className="relative rounded-2xl overflow-hidden shadow-sm group cursor-pointer border border-slate-150 h-full min-h-[160px]"
                      >
                        <img 
                          src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=300" 
                          alt="Accessories" 
                          className="w-full h-full object-cover transform group-hover:scale-105 duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-left text-white">
                          <h3 className="text-sm font-bold">Accessories</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom CTA Card Banner matches exactly */}
            <section className="py-12 px-6">
              <div className="max-w-4xl mx-auto bg-black text-white p-12 rounded-3xl text-center space-y-6 relative overflow-hidden shadow-2xl">
                {/* Visual backdrops */}
                <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl"></div>
                <div className="absolute -right-10 -top-10 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl"></div>

                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Ready to bring your designs to life?</h2>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">
                  Join over 500+ brands that trust StitchFlow for their manufacturing needs. Start your first order estimate in under 5 minutes.
                </p>
                
                <div className="pt-2">
                  <button 
                    onClick={() => { setEstimatorStep(1); setActiveTab('estimator'); }}
                    className="bg-indigo-400 hover:bg-indigo-300 text-slate-950 font-bold text-xs py-3.5 px-7 rounded-xl transition inline-block cursor-pointer shadow-lg shadow-indigo-500/15"
                  >
                    Start Order Now
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}


        {/* =====================================
            SCREEN 2: PRICE ESTIMATOR TAB
           ===================================== */}
        {activeTab === 'estimator' && (
          <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
            {/* Elegant Steps bar top of Section 2 */}
            <div className="max-w-md mx-auto flex items-center justify-between mb-10 relative">
              <div className="absolute left-4 right-4 top-1/2 h-0.5 bg-slate-200 -z-10"></div>
              
              {/* Step 1 indicator */}
              <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                  estimatorStep >= 1 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-250 text-slate-400'
                }`}>
                  1
                </span>
                <span className="text-[10px] font-bold text-slate-500">Configure</span>
              </div>

              {/* Step 2 indicator */}
              <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                  estimatorStep >= 2 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-250 text-slate-400'
                }`}>
                  2
                </span>
                <span className="text-[10px] font-bold text-slate-500">Upload Art</span>
              </div>

              {/* Step 3 indicator */}
              <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                  estimatorStep >= 3 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-250 text-slate-400'
                }`}>
                  3
                </span>
                <span className="text-[10px] font-bold text-slate-500">Review</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Form column */}
              <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6.5 shadow-sm space-y-7">
                
                {estimatorStep === 1 && (
                  <div className="space-y-6 text-left">
                    {/* select product */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">1. Select Product Type</label>
                      <div className="relative">
                        <select 
                          value={productType}
                          onChange={(e) => setProductType(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 px-4 py-3 rounded-xl text-xs font-medium appearance-none cursor-pointer focus:outline-none transition-all text-slate-800"
                        >
                          <option value="Premium Heavyweight Hoodie">Premium Heavyweight Hoodie (IDR equivalent approx: {Math.round(34.00 * 15000).toLocaleString()}/unit)</option>
                          <option value="Classic Pique Polo Shirt">Classic Pique Polo Shirt (IDR equivalent approx: {Math.round(18.90 * 15000).toLocaleString()}/unit)</option>
                          <option value="Standard Combed Cotton T-shirt">Standard Combed Cotton T-shirt (IDR equivalent approx: {Math.round(12.50 * 15000).toLocaleString()}/unit)</option>
                          <option value="Tough Twill Workshirt">Tough Twill Workshirt (IDR equivalent approx: {Math.round(28.50 * 15000).toLocaleString()}/unit)</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* choose material */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">2. Choose Material</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        
                        {/* Cotton */}
                        <div 
                          onClick={() => setSelectedMaterial('cotton')}
                          className={`border rounded-xl p-4.5 cursor-pointer relative flex flex-col justify-between h-40 transition-all ${
                            selectedMaterial === 'cotton' 
                              ? 'border-indigo-600 bg-indigo-50/20 shadow-xs' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {selectedMaterial === 'cotton' && (
                            <span className="absolute top-3 right-3 bg-indigo-600 text-white rounded-full p-0.5 z-10">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <img 
                            src="https://images.unsplash.com/photo-1528570c34121-6e3e4cb6076c?auto=format&fit=crop&q=80&w=200" 
                            alt="Organic Cotton" 
                            className="w-full h-16 object-cover rounded-lg mb-2 opacity-85"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">Organic Cotton</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Soft, breathable, 280 GSM</span>
                          </div>
                        </div>

                        {/* Perf */}
                        <div 
                          onClick={() => setSelectedMaterial('perf')}
                          className={`border rounded-xl p-4.5 cursor-pointer relative flex flex-col justify-between h-40 transition-all ${
                            selectedMaterial === 'perf' 
                              ? 'border-indigo-600 bg-indigo-50/20 shadow-xs' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {selectedMaterial === 'perf' && (
                            <span className="absolute top-3 right-3 bg-indigo-600 text-white rounded-full p-0.5 z-10">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <img 
                            src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200" 
                            alt="Performance Blend" 
                            className="w-full h-16 object-cover rounded-lg mb-2 opacity-85"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">Performance Blend</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Moisture-wicking, recycled</span>
                          </div>
                        </div>

                        {/* Terry */}
                        <div 
                          onClick={() => setSelectedMaterial('terry')}
                          className={`border rounded-xl p-4.5 cursor-pointer relative flex flex-col justify-between h-40 transition-all ${
                            selectedMaterial === 'terry' 
                              ? 'border-indigo-600 bg-indigo-50/20 shadow-xs' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {selectedMaterial === 'terry' && (
                            <span className="absolute top-3 right-3 bg-indigo-600 text-white rounded-full p-0.5 z-10">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <img 
                            src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=200" 
                            alt="French Terry" 
                            className="w-full h-16 object-cover rounded-lg mb-2 opacity-85"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">French Terry</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Premium heavyweight, 400 GSM</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Quantity Selector & Finishing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Quantity counter */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">3. Quantity</label>
                        <div className="flex items-center gap-3">
                          <button 
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 5))}
                            className="w-11 h-11 border border-slate-200 flex items-center justify-center rounded-xl hover:bg-slate-50 transition text-slate-600 cursor-pointer"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input 
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full border border-slate-200 h-11 text-center font-bold rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                          />
                          <button 
                            type="button"
                            onClick={() => setQuantity(quantity + 5)}
                            className="w-11 h-11 border border-slate-200 flex items-center justify-center rounded-xl hover:bg-slate-50 transition text-slate-600 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600 block mt-1.5 bg-emerald-50 py-0.5 px-2 rounded-lg w-max">
                          {quantity >= 50 ? '🎉 Bulk discount: 15% applied automatically!' : 'INFO: Order >= 50 units for a 15% volume discount.'}
                        </span>
                      </div>

                      {/* Finishing style selectors */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">4. Finishing Style</label>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          <button 
                            type="button"
                            onClick={() => setFinishingStyle('screen')}
                            className={`px-4.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                              finishingStyle === 'screen' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            Screen Printing
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFinishingStyle('embroidery')}
                            className={`px-4.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                              finishingStyle === 'embroidery' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            Embroidery
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFinishingStyle('dtg')}
                            className={`px-4.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                              finishingStyle === 'dtg' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            DTG Print
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Premium Add-ons checks */}
                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider">5. Premium Add-ons</label>
                      <div className="space-y-2">
                        
                        <label className="flex items-center gap-3 p-3.5 border border-slate-150 rounded-xl hover:bg-slate-50/50 transition duration-200 cursor-pointer text-left">
                          <input 
                            type="checkbox"
                            checked={addonNeckLabels}
                            onChange={(e) => setAddonNeckLabels(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Custom Neck Labels (+{Math.round(1.50 * 15000).toLocaleString()}/unit equivalent)</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Woven or heat-transfer brand logo tag layout inside collar fabric lines.</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-3.5 border border-slate-150 rounded-xl hover:bg-slate-50/50 transition duration-200 cursor-pointer text-left">
                          <input 
                            type="checkbox"
                            checked={addonEcoPack}
                            onChange={(e) => setAddonEcoPack(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Eco-Friendly Packaging (+{Math.round(0.85 * 15000).toLocaleString()}/unit equivalent)</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Compostable shipping bags with recycled tissue wraps and custom box seals.</span>
                          </div>
                        </label>

                      </div>
                    </div>

                    {/* Next step CTA */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button 
                        type="button"
                        onClick={() => setEstimatorStep(2)}
                        className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Selanjutnya: Upload Desain & Detail</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}


                {/* STEP 2: UPLOAD ARTWORK & CLIENT DETAILS */}
                {estimatorStep === 2 && (
                  <form onSubmit={handlePlaceOrder} className="space-y-6 text-left">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Informasi & Desain Kostum Selesai</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">Berikan sketsa desain, posisi logo, serta informasi kontak Anda untuk memproses pesanan kustom ini.</p>
                    </div>

                    {/* Drag and drop mockup block */}
                    <div className="border-2 border-dashed border-slate-200 bg-slate-50/40 rounded-2xl p-7 text-center space-y-3 relative hover:bg-slate-50 transition duration-300 select-none">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-650 flex items-center justify-center mx-auto border border-indigo-100">
                        <Upload className="w-5 h-5 animate-bounce" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">Drag & drop berkas gambar logo / mockup disini</span>
                        <span className="text-[10px] text-slate-400 block">Format PNG, JPG, PDF atau SVG hingga 10MB</span>
                      </div>
                      <input 
                        type="file" 
                        disabled
                        className="absolute inset-0 opacity-0 cursor-not-allowed" 
                      />
                    </div>

                    {/* Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nama Lengkap Anda *</label>
                        <input 
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Masukkan nama kontak Anda"
                          className="w-full bg-slate-50 border border-slate-200 h-11 px-4 text-xs font-medium rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                        />
                      </div>

                      {/* Whatsapp */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nomor WhatsApp *</label>
                        <input 
                          type="tel"
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="Contoh: 081290001000"
                          className="w-full bg-slate-50 border border-slate-200 h-11 px-4 text-xs font-medium rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                        />
                      </div>

                      {/* Request Date */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Target Pengiriman (Deadline)</label>
                        <input 
                          type="date"
                          value={deadlineDate}
                          onChange={(e) => setDeadlineDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 h-11 px-4 text-xs font-medium rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                        />
                      </div>

                      {/* Notes / Remarks */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Catatan Detail Jahitan (Notes)</label>
                        <textarea 
                          rows={3}
                          value={clientNotes}
                          onChange={(e) => setClientNotes(e.target.value)}
                          placeholder="Tulis instruksi tambahan, warna dominan, detail bordir dada, dsb."
                          className="w-full bg-slate-50 border border-slate-200 p-4 text-xs font-medium rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                        />
                      </div>

                    </div>

                    {/* Nav Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <button 
                        type="button"
                        onClick={() => setEstimatorStep(1)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer h-10 px-4 flex items-center gap-1"
                      >
                        Kembali Ke Konfigurasi
                      </button>
                      
                      <button 
                        type="submit"
                        disabled={isSubmittingOrder}
                        className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {isSubmittingOrder ? 'Menyimpan ke Cloud...' : 'Proses Pesanan Sekarang'}
                      </button>
                    </div>
                  </form>
                )}


                {/* STEP 3: ORDER SUCCESS / COMPLETE */}
                {estimatorStep === 3 && (
                  <div className="py-8 px-4 text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-100 animate-pulse">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>

                    <div className="space-y-2.5 max-w-sm mx-auto">
                      <h3 className="text-xl font-bold text-slate-900">Pesanan Kustom Berhasil Dikirim!</h3>
                      <p className="text-xs text-slate-550 leading-relaxed">
                        Data penawaran Anda telah tersimpan di cloud database StitchFlow. Desainer kami akan menghubungi WhatsApp Anda dalam lusa waktu.
                      </p>
                    </div>

                    {/* Tracking box info matches track page inputs */}
                    <div className="bg-slate-50 p-5 rounded-2xl max-w-md mx-auto space-y-3.5 border border-slate-150 relative overflow-hidden text-left">
                      <div className="absolute top-0 right-0 py-1.5 px-3 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase rounded-bl-xl tracking-wider">
                        ACTIVE PRODUCTION
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold tracking-wider block">ID PELACAKAN PESANAN (ORDER ID):</span>
                        <span className="text-lg font-mono font-extrabold text-slate-900 block tracking-tight">
                          {placedOrderId || 'SF-8422-TX'}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-normal border-t border-slate-200/60 pt-3">
                        Gunakan kode ID di atas di dalam tab <b>Track Order</b> untuk melihat info pengiriman, cutting, sewing, dan progress QC real-time 24 jam.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 pt-3">
                      <button 
                        type="button"
                        onClick={() => {
                          const lookupId = placedOrderId || 'SF-8422-TX';
                          quickTrackOrder(lookupId);
                        }}
                        className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-md transition cursor-pointer"
                      >
                        Lacak Pesanan Saya Sekarang
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setEstimatorStep(1);
                          setActiveTab('home');
                        }}
                        className="bg-white hover:bg-slate-50 text-slate-600 font-bold border border-slate-200 text-xs py-3.5 px-6 rounded-xl transition cursor-pointer"
                      >
                        Kembali Ke Halaman Utama
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Right Quote sidebar matches Live Quote Screen 2 layout perfectly */}
              <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6 text-left relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-105 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Live Quote</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Dynamic price calculations</p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                    Estimate
                  </span>
                </div>

                <div className="space-y-4 text-xs font-medium text-slate-500">
                  <div className="flex justify-between items-center">
                    <span>Unit Price</span>
                    <span className="text-slate-900 font-bold">
                      {isCustomTenant ? `Rp ${Math.round(unitPriceIDR).toLocaleString('id-ID')}` : `$${unitPrice.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Subtotal ({quantity} units)</span>
                    <span className="text-slate-900 font-bold">
                      {isCustomTenant ? `Rp ${Math.round(subtotalIDR).toLocaleString('id-ID')}` : `$${subtotal.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-rose-550 font-semibold">
                    <span>Bulk Discount</span>
                    <span>
                      {isCustomTenant ? `-Rp ${Math.round(bulkDiscountIDR).toLocaleString('id-ID')}` : `-$${bulkDiscount.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Add-ons Total</span>
                    <span className="text-slate-900 font-bold">
                      {isCustomTenant ? `Rp ${Math.round(addonsTotalAmountIDR).toLocaleString('id-ID')}` : `$${addonsTotalAmount.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                    <span className="text-slate-900 font-bold text-sm">Total</span>
                    <div className="text-right">
                      <span className="text-indigo-650 font-black text-2xl tracking-tight">
                        {isCustomTenant ? `Rp ${Math.round(totalPriceIDR).toLocaleString('id-ID')}` : `$${totalPrice.toFixed(2)}`}
                      </span>
                      <p className="text-[9px] text-slate-400 mt-0.5">Excluding VAT & Shipping</p>
                    </div>
                  </div>
                </div>

                {/* dynamic specs display inside sidebar */}
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Current Specifications</span>
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px] font-bold text-slate-800">
                    <div>Product:</div>
                    <div className="text-indigo-650 font-semibold text-right truncate">{productType.replace('Premium ', '')}</div>
                    <div>Material:</div>
                    <div className="text-right truncate">{selectedMaterial === 'cotton' ? 'Organic Cotton' : selectedMaterial === 'perf' ? 'Performance' : 'French Terry'}</div>
                    <div>Style:</div>
                    <div className="text-right uppercase">{finishingStyle}</div>
                    <div>Necktag:</div>
                    <div className="text-right">{addonNeckLabels ? 'Yes' : 'No'}</div>
                  </div>
                </div>

                {/* production delivery info matches Screen 2 */}
                <div className="space-y-2 bg-indigo-50/30 p-4 rounded-xl border border-indigo-150 text-[10px] text-indigo-950 font-semibold">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Production: 10-14 Business Days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Estimated Delivery: Oct 24 - 28</span>
                  </div>
                </div>

                {estimatorStep < 2 ? (
                  <button 
                    onClick={() => setEstimatorStep(2)}
                    className="w-full bg-[#008080] hover:bg-[#006666] text-white font-bold py-3 px-4 rounded-xl text-center text-xs transition shadow-md flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : estimatorStep === 2 ? (
                  <button 
                    onClick={handlePlaceOrder}
                    className="w-full bg-[#008080] hover:bg-[#006666] text-white font-bold py-3 px-4 rounded-xl text-center text-xs transition shadow-md flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Submit & Purchase</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    disabled
                    className="w-full bg-slate-100 text-slate-400 font-bold py-3 px-4 rounded-xl text-center text-xs cursor-not-allowed"
                  >
                    Selesai
                  </button>
                )}

                <p className="text-[10px] text-slate-400 text-center leading-normal">
                  Secure SSL Encryption. No charges until final review.
                </p>
              </div>

            </div>
          </div>
        )}


        {/* =====================================
            SCREEN 3: CATALOG TAB
           ===================================== */}
        {activeTab === 'catalog' && (
          <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-fade-in">
            {/* Header matches Screen 3 */}
            <div className="text-left space-y-4 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Premium Custom Apparel <br />
                <span className="text-indigo-650 bg-gradient-to-r from-indigo-600 to-sky-650 bg-clip-text text-transparent">Tailored for You.</span>
              </h1>
              
              <p className="text-sm text-slate-500 leading-relaxed">
                Select from our curated range of high-quality base garments and start your customization journey with professional precision.
              </p>

              <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-slate-600">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=40" className="w-7 h-7 rounded-full border-2 border-white" alt="Avatar1" referrerPolicy="no-referrer" />
                  <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=40" className="w-7 h-7 rounded-full border-2 border-white" alt="Avatar2" referrerPolicy="no-referrer" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=40" className="w-7 h-7 rounded-full border-2 border-white" alt="Avatar3" referrerPolicy="no-referrer" />
                </div>
                <span>Trusted by 2,000+ organizations</span>
              </div>
            </div>

            {/* Filter controls section matching design Screen 3 */}
            <div className="flex items-center justify-between border-t border-b border-slate-150 py-4">
              <span className="text-xs font-bold text-slate-800">Browse Categories</span>
              
              <div className="flex items-center gap-2">
                <button className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Product card grid layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Product Card 1: T-shirt */}
              <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col justify-between hover:shadow-xl transition duration-300">
                <div className="relative rounded-2xl overflow-hidden bg-slate-50 aspect-square mb-4.5 group">
                  <img 
                    src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400" 
                    alt="Standard Combed Cotton T-shirt" 
                    className="w-full h-full object-cover transform group-hover:scale-105 duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs py-1 px-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-slate-800 shadow-sm">
                    Bestseller
                  </div>
                </div>

                <div className="text-left space-y-1 mb-5">
                  <h3 className="text-sm font-extrabold text-slate-900">T-shirt</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    Premium 180gsm combed cotton with reinforced stitching.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-left">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Starting at</span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {convectionData ? `Rp ${(convectionData.prices?.tshirt || 45000).toLocaleString('id-ID')}` : '$12.50'}
                    </span>
                  </div>
                  <button 
                    onClick={() => startCustomizationFromCatalog('Standard Combed Cotton T-shirt')}
                    className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] py-2 px-3 rounded-xl transition cursor-pointer"
                  >
                    Customize Now
                  </button>
                </div>
              </div>

              {/* Product Card 2: Polo shirt */}
              <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col justify-between hover:shadow-xl transition duration-300">
                <div className="relative rounded-2xl overflow-hidden bg-slate-50 aspect-square mb-4.5 group">
                  <img 
                    src="https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=400" 
                    alt="Classic Pique Polo Shirt" 
                    className="w-full h-full object-cover transform group-hover:scale-105 duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="text-left space-y-1 mb-5">
                  <h3 className="text-sm font-extrabold text-slate-900">Polo Shirt</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    Classic pique knit with moisture-wicking technology.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-left">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Starting at</span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {convectionData ? `Rp ${(convectionData.prices?.polo || 72000).toLocaleString('id-ID')}` : '$18.90'}
                    </span>
                  </div>
                  <button 
                    onClick={() => startCustomizationFromCatalog('Classic Pique Polo Shirt')}
                    className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] py-2 px-3 rounded-xl transition cursor-pointer"
                  >
                    Customize Now
                  </button>
                </div>
              </div>

              {/* Product Card 3: Hoodie */}
              <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col justify-between hover:shadow-xl transition duration-300">
                <div className="relative rounded-2xl overflow-hidden bg-slate-50 aspect-square mb-4.5 group">
                  <img 
                    src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=400" 
                    alt="Premium Heavyweight Hoodie" 
                    className="w-full h-full object-cover transform group-hover:scale-105 duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs py-1 px-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-indigo-700 shadow-sm">
                    Premium
                  </div>
                </div>

                <div className="text-left space-y-1 mb-5">
                  <h3 className="text-sm font-extrabold text-slate-900">Hoodie</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    Heavyweight fleece with double-lined hood and metal tips.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-left">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Starting at</span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {convectionData ? `Rp ${(convectionData.prices?.hoodie || 115000).toLocaleString('id-ID')}` : '$34.00'}
                    </span>
                  </div>
                  <button 
                    onClick={() => startCustomizationFromCatalog('Premium Heavyweight Hoodie')}
                    className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] py-2 px-3 rounded-xl transition cursor-pointer"
                  >
                    Customize Now
                  </button>
                </div>
              </div>

              {/* Product Card 4: Workshirt */}
              <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col justify-between hover:shadow-xl transition duration-300">
                <div className="relative rounded-2xl overflow-hidden bg-slate-50 aspect-square mb-4.5 group">
                  <img 
                    src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=400" 
                    alt="Tough Twill Workshirt" 
                    className="w-full h-full object-cover transform group-hover:scale-105 duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-neutral-900 text-white py-1 px-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-sm">
                    Durable
                  </div>
                </div>

                <div className="text-left space-y-1 mb-5">
                  <h3 className="text-sm font-extrabold text-slate-900">Workshirt</h3>
                  <p className="text-[11px] text-slate-450 line-clamp-2">
                    Tough twill fabric with stain-release and utility pockets.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-left">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Starting at</span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {convectionData ? `Rp ${(convectionData.prices?.workshirt || 88000).toLocaleString('id-ID')}` : '$28.50'}
                    </span>
                  </div>
                  <button 
                    onClick={() => startCustomizationFromCatalog('Tough Twill Workshirt')}
                    className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] py-2 px-3 rounded-xl transition cursor-pointer"
                  >
                    Customize Now
                  </button>
                </div>
              </div>

            </div>

            {/* Down catalog bottom block matches Screen 3 */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6.5 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
              <div className="space-y-1 max-w-md pb-4 sm:pb-0 text-left">
                <h4 className="text-sm font-bold text-slate-900">Ready for a Custom Batch?</h4>
                <p className="text-xs text-slate-500">Download our corporate catalog or get a custom quote for orders over 100 units.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button className="h-10 px-5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1 cursor-pointer">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Download Catalog</span>
                </button>
                <button 
                  onClick={() => { setEstimatorStep(1); setActiveTab('estimator'); }}
                  className="h-10 px-5 bg-[#005a70] text-white rounded-xl font-bold text-xs hover:bg-[#004b5c] transition cursor-pointer"
                >
                  Bulk Quote Request
                </button>
              </div>
            </div>

          </div>
        )}


        {/* =====================================
            SCREEN 4: TRACK ORDER TAB
           ===================================== */}
        {activeTab === 'track' && (
          <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
            {/* Heading matches Screen 4 */}
            <div className="max-w-xl mx-auto text-center space-y-4 mb-9">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Track Your Craftsmanship</h1>
              <p className="text-xs text-slate-500 leading-normal">
                Enter your Order ID to see real-time updates from our manufacturing floor.
              </p>

              {/* tracking search bar form matches */}
              <form onSubmit={handleTrackSearch} className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-md max-w-md mx-auto items-center mt-6">
                <div className="relative flex-grow flex items-center px-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input 
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="Enter Order ID: e.g. SF-8422-TX"
                    className="w-full bg-transparent outline-none border-none py-2 text-xs font-bold text-slate-800 placeholder-slate-400 pl-8 focus:ring-0 focus:outline-none"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSearchingTrack}
                  className="bg-[#00667e] hover:bg-[#005265] text-white font-bold text-xs h-9.5 px-5.5 rounded-xl transition cursor-pointer"
                >
                  {isSearchingTrack ? 'Searching...' : 'Track'}
                </button>
              </form>

              {trackingError && (
                <div className="text-xs bg-rose-50 text-rose-700 animate-slide-up border border-rose-100 p-3 rounded-xl max-w-md mx-auto mt-2 font-semibold">
                  ⚠️ {trackingError}
                </div>
              )}
            </div>

            {/* Details panel representation (Left Status stepper, Right summary) */}
            {trackedOrder ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in text-left">
                
                {/* Left Panel: Track Card */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6.5 shadow-sm space-y-8">
                  {/* header identifiers */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider">ACTIVE ORDER</span>
                      <h2 className="text-xl font-extrabold text-slate-900">
                        Order ID: <span className="font-mono tracking-tight text-indigo-650">{trackedOrder.id || 'N/A'}</span>
                      </h2>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider">Est. Delivery</span>
                      <span className="text-sm font-bold text-slate-800">{trackedOrder.deadline || 'Oct 24, 2026'}</span>
                    </div>
                  </div>

                  {/* STEPPER TRACKING STATUS BAR (Design -> Cutting -> Sewing -> QC -> Ready/Shipped) */}
                  <div className="relative pt-2 pb-6.5">
                    {/* Background line connecting stepped states */}
                    <div className="absolute left-4 sm:left-6.5 right-4 sm:right-6.5 top-8.5 h-1.5 bg-slate-100 -z-10 rounded"></div>
                    <div 
                      className="absolute left-4 sm:left-6.5 top-8.5 h-1.5 bg-indigo-650 -z-10 rounded transition-all duration-700"
                      style={{ 
                        width: trackedOrder.status === 'Design' ? '0%' : 
                               trackedOrder.status === 'Cutting' ? '25%' : 
                               trackedOrder.status === 'Sewing' ? '50%' : 
                               trackedOrder.status === 'QC' ? '75%' : '100%' 
                      }}
                    ></div>

                    <div className="flex justify-between items-start text-xs font-semibold text-slate-400">
                      
                      {/* Step 1: Received / Design */}
                      <div className="flex flex-col items-center text-center space-y-2 flex-1 relative">
                        <div className={`w-9.5 h-9.5 rounded-full flex items-center justify-center transition border ${
                          ['Design', 'Cutting', 'Sewing', 'QC', 'Ready'].includes(trackedOrder.status)
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                            : 'bg-white border-slate-200'
                        }`}>
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-extrabold block uppercase tracking-wider leading-none ${
                            ['Design', 'Cutting', 'Sewing', 'QC', 'Ready'].includes(trackedOrder.status) ? 'text-indigo-650 font-black' : ''
                          }`}>
                            Received
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium block">Completed</span>
                        </div>
                      </div>

                      {/* Step 2: Cutting */}
                      <div className="flex flex-col items-center text-center space-y-2 flex-1 relative">
                        <div className={`w-9.5 h-9.5 rounded-full flex items-center justify-center transition border ${
                          ['Cutting', 'Sewing', 'QC', 'Ready'].includes(trackedOrder.status)
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                            : trackedOrder.status === 'Design' 
                            ? 'bg-white border-indigo-150 text-indigo-600 font-bold border-2 animate-pulse'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                          {['Cutting', 'Sewing', 'QC', 'Ready'].includes(trackedOrder.status) ? (
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          ) : (
                            <span className="text-[10px]">2</span>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-extrabold block uppercase tracking-wider leading-none ${
                            ['Cutting', 'Sewing', 'QC', 'Ready'].includes(trackedOrder.status) ? 'text-indigo-650 font-black' : ''
                          }`}>
                            Cutting
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium block">
                            {['Cutting', 'Sewing', 'QC', 'Ready'].includes(trackedOrder.status) ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Step 3: Sewing */}
                      <div className="flex flex-col items-center text-center space-y-2 flex-1 relative">
                        <div className={`w-9.5 h-9.5 rounded-full flex items-center justify-center transition border ${
                          ['Sewing', 'QC', 'Ready'].includes(trackedOrder.status)
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                            : trackedOrder.status === 'Cutting'
                            ? 'bg-white border-indigo-150 text-indigo-600 font-bold border-2 animate-pulse'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                          {['Sewing', 'QC', 'Ready'].includes(trackedOrder.status) ? (
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          ) : (
                            <span className="text-[10px]">3</span>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-extrabold block uppercase tracking-wider leading-none ${
                            ['Sewing', 'QC', 'Ready'].includes(trackedOrder.status) ? 'text-indigo-650 font-black' : ''
                          }`}>
                            Sewing
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium block">
                            {trackedOrder.status === 'Sewing' ? 'In Progress' : ['QC', 'Ready'].includes(trackedOrder.status) ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Step 4: QC */}
                      <div className="flex flex-col items-center text-center space-y-2 flex-1 relative">
                        <div className={`w-9.5 h-9.5 rounded-full flex items-center justify-center transition border ${
                          ['QC', 'Ready'].includes(trackedOrder.status)
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                            : trackedOrder.status === 'Sewing'
                            ? 'bg-white border-indigo-150 text-indigo-600 font-bold border-2 animate-pulse'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                          {['QC', 'Ready'].includes(trackedOrder.status) ? (
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          ) : (
                            <span className="text-[10px]">4</span>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-extrabold block uppercase tracking-wider leading-none ${
                            ['QC', 'Ready'].includes(trackedOrder.status) ? 'text-indigo-650' : ''
                          }`}>
                            QC
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium block">
                            {trackedOrder.status === 'QC' ? 'In Progress' : trackedOrder.status === 'Ready' ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Step 5: Shipped (Ready) */}
                      <div className="flex flex-col items-center text-center space-y-2 flex-1 relative">
                        <div className={`w-9.5 h-9.5 rounded-full flex items-center justify-center transition border ${
                          trackedOrder.status === 'Ready'
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                            : trackedOrder.status === 'QC'
                            ? 'bg-white border-indigo-150 text-indigo-600 font-bold border-2 animate-pulse'
                            : 'bg-white border-slate-200'
                        }`}>
                          <Truck className="w-4.5 h-4.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-extrabold block uppercase tracking-wider leading-none ${
                            trackedOrder.status === 'Ready' ? 'text-indigo-650' : ''
                          }`}>
                            Shipped
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium block">
                            {trackedOrder.status === 'Ready' ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Factory Floor Manufacturing illustration matches Screen 4 */}
                  <div className="relative rounded-2xl overflow-hidden aspect-video w-full border border-slate-200">
                    <img 
                      src="https://images.unsplash.com/photo-1528570c34121-6e3e4cb6076c?auto=format&fit=crop&q=80&w=1000" 
                      alt="StitchFlow Production Line" 
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark gradient blur banner overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-black/75 p-4 text-left backdrop-blur-xs flex items-center gap-3">
                      <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping shrink-0"></span>
                      <p className="text-[11px] text-white font-medium">
                        <b>Current Stage:</b> Our lead tailors are currently assembling on-spec your custom order garments using high density organic yarns.
                      </p>
                    </div>
                  </div>

                  {/* Status updates log timeline */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-indigo-50/50 pb-2 uppercase tracking-wide">Status Updates</h3>
                    
                    <div className="space-y-5 text-left text-xs font-medium text-slate-700">
                      
                      {/* Updates 1 */}
                      <div className="flex gap-4">
                        <div className="text-[11px] font-bold text-slate-400 w-24 shrink-0">Hari ini, 10:20</div>
                        <div className="space-y-1">
                          <p className="text-slate-800 font-bold">Fabric quality check passed for {trackedOrder.quantity} units of "{trackedOrder.skuTitle}".</p>
                          <p className="text-[10px] text-slate-400">Moving to Active Production lines under Supervisor Staff.</p>
                        </div>
                      </div>

                      {/* Updates 2 */}
                      <div className="flex gap-4">
                        <div className="text-[11px] font-bold text-slate-400 w-24 shrink-0">Kemarin</div>
                        <div className="space-y-1">
                          <p className="text-slate-800 font-bold">Laser cutting phase completed for main torso panels.</p>
                          <p className="text-[10px] text-slate-400">Precision variance index analyzed: &lt;0.1% variance error limits.</p>
                        </div>
                      </div>

                      {/* Updates 3 */}
                      <div className="flex gap-4">
                        <div className="text-[11px] font-bold text-slate-400 w-24 shrink-0">12 Okt, 2026</div>
                        <div className="space-y-1">
                          <p className="text-slate-800 font-bold">Custom order received, contract lock confirmed.</p>
                          <p className="text-[10px] text-slate-400">Inventory and raw rolls allocated from the central StitchFlow warehouse.</p>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Right Panel: Side summary */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Order summary card info */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6.5 shadow-sm text-left space-y-5">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Order Summary</h3>
                    
                    <div className="space-y-4 border-b border-slate-100 pb-4">
                      
                      {/* item */}
                      <div className="flex items-start gap-3 text-xs">
                        <div className="w-11 h-11 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-5 h-5 text-indigo-650" />
                        </div>
                        <div className="space-y-0.5 flex-grow">
                          <span className="font-bold text-slate-800 block line-clamp-1">{trackedOrder.skuTitle}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">Qty: {trackedOrder.quantity} units</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-800 block">IDR {(trackedOrder.totalAmount || 0).toLocaleString()}</span>
                        </div>
                      </div>

                    </div>

                    <div className="space-y-2.5 text-xs font-semibold text-slate-500">
                      <div className="flex justify-between">
                        <span>Subtotal (Net)</span>
                        <span className="text-slate-900">IDR {Math.round(trackedOrder.totalAmount * 0.9).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping Cost</span>
                        <span className="text-emerald-600 font-bold">Free</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (PPN 11%)</span>
                        <span className="text-slate-900">IDR {Math.round(trackedOrder.totalAmount * 0.1).toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between pt-3 border-t border-slate-100 font-bold text-slate-900">
                        <span>Total Price</span>
                        <span className="text-indigo-650 font-black text-lg">Rp {(trackedOrder.totalAmount || 0).toLocaleString('id-ID')}</span>
                      </div>

                      {/* DP and Remaining balance detail block */}
                      <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-2.5 mt-3 text-[11px] font-sans">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-bold">Status Pembayaran:</span>
                          {trackedOrder.paymentStatus === 'fully_paid' ? (
                            <span className="text-emerald-700 font-black bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">LUNAS</span>
                          ) : trackedOrder.paymentStatus === 'dp_paid' ? (
                            <span className="text-blue-700 font-black bg-blue-105/80 border border-blue-200 px-2 py-0.5 rounded text-[10px]">DP MASUK</span>
                          ) : (
                            <span className="text-rose-700 font-black bg-rose-100/80 border border-rose-200 px-2 py-0.5 rounded text-[10px]">BELUM BAYAR</span>
                          )}
                        </div>

                        {trackedOrder.paymentStatus === 'dp_paid' && (
                          <>
                            <div className="flex justify-between text-slate-505 pt-1 border-t border-slate-200/50">
                              <span>Uang Muka (DP Paid)</span>
                              <span className="font-mono font-bold text-slate-800">Rp {(trackedOrder.downPayment || 0).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between pt-1.5 border-t border-dashed border-slate-200 font-bold text-amber-700">
                              <span>Sisa Pelunasan</span>
                              <span className="font-mono font-black">Rp {Math.max(0, trackedOrder.totalAmount - (trackedOrder.downPayment || 0)).toLocaleString('id-ID')}</span>
                            </div>
                          </>
                        )}

                        {trackedOrder.paymentStatus === 'unpaid' && (
                          <div className="flex justify-between pt-1.5 border-t border-dashed border-slate-200 font-bold text-rose-700">
                            <span>Tagihan Pelunasan</span>
                            <span className="font-mono font-black">Rp {(trackedOrder.totalAmount || 0).toLocaleString('id-ID')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Address panel matches Screen 4 */}
                    <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl space-y-2">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                        <MapPin className="w-3 h-3 inline mr-1 text-slate-500" /> Delivery Address
                      </span>
                      <div className="text-[11px] font-bold text-slate-800 leading-normal">
                        CV Jasa Busana Logistics Way<br />
                        Suite 500, Austin, TX 78701<br />
                        United States (Warehouse Hub)
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp contact banner box matches */}
                  <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-md text-center space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl"></div>
                    
                    <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                      <MessageCircle className="w-5 h-5 fill-emerald-400/10 stroke-[2.2]" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold">Need Assistance?</h4>
                      <p className="text-[10px] text-slate-400 leading-normal">Our support team is online and ready to help with your order questions.</p>
                    </div>

                    <button 
                      onClick={openSupportWhatsApp}
                      className="w-full bg-[#34e073] hover:bg-[#2bc462] text-slate-950 font-extrabold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                    >
                      <MessageCircle className="w-4 h-4 fill-slate-950" />
                      <span>Consult via WhatsApp</span>
                    </button>
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 shadow-sm text-center max-w-lg mx-auto space-y-4">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">Uji Tracking Pesanan StitchFlow</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ketik ID pesanan Anda dari database di atas atau gunakan ID demonstrasi <b>SF-8422-TX</b> untuk melacak simulasi alur jahitan konveksi.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setTrackingId('SF-8422-TX'); setTrackedOrder(demoTrackedOrder); }}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold py-2 px-4 rounded-xl transition text-indigo-650"
                >
                  Gunakan ID Demo "SF-8422-TX"
                </button>
              </div>
            )}

          </div>
        )}


        {/* =====================================
            SCREEN 5: MY HISTORY TAB
           ===================================== */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-fade-in text-left">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Riwayat Pemesanan Anda</h1>
              <p className="text-xs text-slate-500">Berikut adalah daftar pesanan kustom baju dan status pengerjaan yang tersimpan di peramban lokal Anda.</p>
            </div>

            {isLoadingHistory ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                Mengambil data riwayat pesanan dari cloud database...
              </div>
            ) : historicalOrders.length > 0 ? (
              <div className="space-y-4">
                {historicalOrders.map((ord, idx) => (
                  <div key={idx} className="bg-white border border-slate-150 p-5 rounded-2xl shadow-sm hover:border-indigo-200 transition duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2 flex-grow text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-xs text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded">
                          {ord.id}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru Saja'}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-slate-900">{ord.skuTitle}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <span>Kuantitas: <b>{ord.quantity} Pcs</b></span>
                          <span>•</span>
                          <span>Bahan: <b className="text-indigo-600">{ord.fabricType || 'Organic Cotton'}</b></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Status Produksi</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          ord.status === 'Ready' ? 'bg-emerald-50 text-emerald-700' :
                          ord.status === 'QC' ? 'bg-indigo-50 text-indigo-700' :
                          ord.status === 'Sewing' ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-100 text-slate-650'
                        }`}>
                          ● {ord.status || 'Design'}
                        </span>
                      </div>

                      <div className="space-y-1 text-right">
                        <button 
                          onClick={() => quickTrackOrder(ord.id || '', ord)}
                          className="text-xs font-bold text-indigo-650 hover:text-indigo-850 flex items-center gap-0.5 transition cursor-pointer"
                        >
                          <span>Lacak Progress</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400 space-y-3">
                <History className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs">Belum ada riwayat pesanan kustom baju terdaftar.</p>
                <button 
                  onClick={() => { setEstimatorStep(1); setActiveTab('estimator'); }}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition"
                >
                  Buat Estimasi Pertama
                </button>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer matching standard elegant design layout */}
      <footer className="bg-slate-900 text-white px-6 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-slate-800 pb-12 mb-8">
          
          <div className="md:col-span-4 space-y-4 text-left">
            <StitchFlowLogo size="sm" variant="light" />
            <p className="text-xs text-slate-400 leading-normal max-w-sm">
              Precision apparel manufacturing for the modern brand owner. High-grade stitching lines, premium fabric weights, and fully integrated real-time logistics.
            </p>
          </div>

          <div className="md:col-span-3 text-left space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">Company</h5>
            <ul className="text-xs text-slate-400 space-y-2 font-medium">
              <li><button onClick={openSupportWhatsApp} className="hover:text-white transition">Contact Us</button></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>

          <div className="md:col-span-3 text-left space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">Support</h5>
            <ul className="text-xs text-slate-400 space-y-2 font-medium">
              <li><button onClick={openSupportWhatsApp} className="hover:text-white transition">WhatsApp Support</button></li>
              <li><button onClick={() => setActiveTab('track')} className="hover:text-white transition">Order Status</button></li>
              <li><a href="#" className="hover:text-white transition">Returns Policy</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 text-left space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Newsletter</h5>
            <div className="flex gap-1.5 pt-1">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-slate-850 border border-slate-800 rounded-lg p-2 text-xs text-white max-w-[140px] focus:outline-none focus:border-indigo-500" 
              />
              <button className="bg-indigo-600 p-2 rounded-lg text-white font-bold hover:bg-slate-705 transition">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[9px] text-slate-500">© 2026 StitchFlow Manufacturing.</p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 font-medium font-mono">
          <span>STITCHFLOW HUB CLOUD SERVERS CONNECTED</span>
          <span>PLATFORM PORTAL ACTIVE V1.0-TS</span>
        </div>
      </footer>

    </div>
  );
}
