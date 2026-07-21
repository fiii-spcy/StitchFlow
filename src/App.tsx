import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import StitchFlowLogo from './components/StitchFlowLogo';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton';
import CustomerPortal from './components/CustomerPortal';
import AdminDocumentsModal from './components/AdminDocuments';
import StitchFlowSuperAdmin from './components/StitchFlowSuperAdmin';
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where, addDoc, updateDoc } from 'firebase/firestore';
import { 
  Check, 
  TrendingUp, 
  Layout, 
  Calculator, 
  RefreshCw, 
  MessageSquare, 
  ArrowRight, 
  Layers, 
  CheckCircle,
  HelpCircle,
  Smartphone,
  Star,
  LayoutDashboard,
  Boxes,
  Palette,
  Eye,
  Link2,
  X,
  Sparkles,
  DollarSign,
  CreditCard,
  Building2,
  Lock,
  ShieldCheck,
  Loader2,
  BadgeCheck,
  AlertCircle,
} from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'customer' | 'admin' | 'superadmin'>('landing');
  const [activeConvectionSlug, setActiveConvectionSlug] = useState<string | null>(null);
  const [activeOwnerSlug, setActiveOwnerSlug] = useState<string | null>(null);
  const demoSectionRef = useRef<HTMLDivElement>(null);

  // Subscription Modal & Creation States
  const [isSubsOpen, setIsSubsOpen] = useState(false);
  const [newRegConvection, setNewRegConvection] = useState<string>('');
  const [newRegOwner, setNewRegOwner] = useState<string>('');
  const [newRegPhone, setNewRegPhone] = useState<string>('');
  const [newRegEmail, setNewRegEmail] = useState<string>('');
  const [newRegSlug, setNewRegSlug] = useState<string>('');
  const [newRegTagline, setNewRegTagline] = useState<string>('Konveksi kaos & kemeja terpercaya');
  const [newRegColor, setNewRegColor] = useState<string>('indigo');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);
  
  // Custom prices
  const [priceTshirt, setPriceTshirt] = useState<number>(45000);
  const [pricePolo, setPricePolo] = useState<number>(70000);
  const [priceHoodie, setPriceHoodie] = useState<number>(110000);
  const [priceWorkshirt, setPriceWorkshirt] = useState<number>(85000);
  
  // Package Plan Choice
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'growth' | 'pro'>('pro');
  
  // Process state
  const [isSubmittingSubs, setIsSubmittingSubs] = useState(false);
  const [createdStoreLinks, setCreatedStoreLinks] = useState<{ customerUrl: string; ownerUrl: string } | null>(null);

  // Administrative document modal state
  const [activeDocModal, setActiveDocModal] = useState<'privacy' | 'terms' | 'support' | 'docs' | null>(null);

  // Payment wizard state
  const [wizardStep, setWizardStep] = useState<'form' | 'payment' | 'processing' | 'success'>('form');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer' | 'qris' | 'other'>('other');
  const [registeredSlug, setRegisteredSlug] = useState('');
  const [midtransOrderId, setMidtransOrderId] = useState('');

  // Login Modal State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginSlug, setLoginSlug] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginChecking, setIsLoginChecking] = useState(false);

  // Generate email preview instantly when success screen appears
  useEffect(() => {
    if (wizardStep !== 'success' || !newRegEmail || !newRegSlug) return;

    const orderId = midtransOrderId || `SF-${newRegSlug.toUpperCase()}-${Date.now()}`;
    const amount = selectedPlan === 'starter' ? 299000 : selectedPlan === 'growth' ? 799000 : 1499000;
    const packageLabel = selectedPlan === 'starter' ? 'Starter' : selectedPlan === 'growth' ? 'Growth' : 'Enterprise';
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    const date = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const customerUrl = `${window.location.origin}/?c=${newRegSlug}`;
    const adminUrl = `${window.location.origin}/?owner=${newRegSlug}`;

    const emailHTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bukti Pembayaran – StitchFlow</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f1f5f9; padding:32px 16px; }
    .card { max-width:580px; margin:0 auto; background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 8px 40px rgba(0,0,0,0.1); }
    .header { background:linear-gradient(135deg,#4f46e5,#7c3aed); padding:40px; text-align:center; }
    .logo { font-size:28px; font-weight:900; color:#fff; letter-spacing:-1px; }
    .logo-sub { font-size:11px; color:rgba(255,255,255,0.7); letter-spacing:3px; text-transform:uppercase; margin-top:6px; }
    .badge { display:inline-block; background:rgba(255,255,255,0.2); color:#fff; font-size:12px; font-weight:700; padding:6px 16px; border-radius:999px; margin-top:16px; }
    .body { padding:40px; }
    .greeting { font-size:22px; font-weight:800; color:#0f172a; margin-bottom:8px; }
    .subtext { font-size:13px; color:#64748b; line-height:1.7; margin-bottom:28px; }
    .box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:24px; margin-bottom:24px; }
    .box-title { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:2px; color:#94a3b8; margin-bottom:16px; }
    .row { display:flex; justify-content:space-between; padding:9px 0; border-bottom:1px dashed #e2e8f0; font-size:13px; }
    .row:last-child { border:none; margin-top:4px; font-weight:800; font-size:15px; }
    .label { color:#64748b; }
    .value { color:#1e293b; font-weight:600; text-align:right; max-width:60%; word-break:break-all; }
    .total-value { color:#4f46e5; }
    .link-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px; margin-bottom:10px; text-decoration:none; display:block; }
    .link-tag { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; color:#94a3b8; margin-bottom:4px; }
    .link-title { font-size:14px; font-weight:700; color:#1e293b; margin-bottom:5px; }
    .link-url { font-size:12px; color:#4f46e5; word-break:break-all; }
    .btn { display:block; text-align:center; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; text-decoration:none; font-size:14px; font-weight:700; padding:15px; border-radius:12px; margin-bottom:10px; }
    .btn-outline { display:block; text-align:center; background:transparent; color:#4f46e5; text-decoration:none; font-size:14px; font-weight:700; padding:14px; border-radius:12px; margin-bottom:24px; border:2px solid #e0e7ff; }
    .divider { height:1px; background:#f1f5f9; margin:24px 0; }
    .tip { font-size:12px; color:#64748b; line-height:1.7; background:#f8fafc; border-left:3px solid #4f46e5; padding:14px 16px; border-radius:0 10px 10px 0; }
    .footer { text-align:center; padding:28px 40px; color:#94a3b8; font-size:12px; line-height:1.7; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">StitchFlow</div>
      <div class="logo-sub">Convection OS</div>
      <div class="badge">✅ Pembayaran Berhasil</div>
    </div>
    <div class="body">
      <div class="greeting">Selamat, ${newRegOwner}! 🎉</div>
      <div class="subtext">Sistem manajemen konveksi <strong>${newRegConvection}</strong> telah aktif. Berikut bukti pembayaran dan tautan akses sistem Anda.</div>
      <div class="box">
        <div class="box-title">🧾 Bukti Pembayaran</div>
        <div class="row"><span class="label">Order ID</span><span class="value" style="font-family:monospace;font-size:11px">${orderId}</span></div>
        <div class="row"><span class="label">Tanggal</span><span class="value">${date}</span></div>
        <div class="row"><span class="label">Nama Konveksi</span><span class="value">${newRegConvection}</span></div>
        <div class="row"><span class="label">Slug</span><span class="value" style="font-family:monospace">${newRegSlug}</span></div>
        <div class="row"><span class="label">Paket</span><span class="value">${packageLabel}</span></div>
        <div class="row"><span class="label">Email</span><span class="value">${newRegEmail}</span></div>
        <div class="row"><span class="label" style="color:#0f172a;font-weight:800">Total Dibayar</span><span class="value total-value">${formattedAmount}</span></div>
      </div>
      <div style="margin-bottom:24px">
        <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:12px">🔗 Tautan Akses Sistem</div>
        <a href="${customerUrl}" class="link-card">
          <div class="link-tag">👤 Portal Pelanggan</div>
          <div class="link-title">Pemesanan & Tracking untuk kustomer Anda</div>
          <div class="link-url">${customerUrl}</div>
        </a>
        <a href="${adminUrl}" class="link-card">
          <div class="link-tag">⚙️ Dashboard Admin</div>
          <div class="link-title">Manajemen pesanan, inventaris & estimasi harga</div>
          <div class="link-url">${adminUrl}</div>
        </a>
      </div>
      <a href="${adminUrl}" class="btn">Buka Dashboard Admin Saya →</a>
      <a href="${customerUrl}" class="btn-outline">Lihat Portal Pelanggan</a>
      <div class="divider"></div>
      <div class="tip">💡 <strong>Tips:</strong> Bagikan link <em>Portal Pelanggan</em> ke kustomer Anda. Simpan link <em>Dashboard Admin</em> hanya untuk internal tim.</div>
    </div>
    <div class="footer">Dibuat otomatis oleh <strong>StitchFlow Convection OS</strong>.<br/>© ${new Date().getFullYear()} StitchFlow. All rights reserved.</div>
  </div>
</body>
</html>`;

    const blob = new Blob([emailHTML], { type: 'text/html' });
    setEmailPreviewUrl(URL.createObjectURL(blob));
  }, [wizardStep]); // eslint-disable-line

  // Automatically seed Default "konveksijaya"
  useEffect(() => {
    const seedDefaultTenant = async () => {
      try {
        const docRef = doc(db, 'convections', 'konveksijaya');
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          console.log("Seeding default whitelabel 'konveksijaya' tenant in Firestore...");
          await setDoc(docRef, {
            convectionName: "Konveksi Jaya",
            ownerName: "Haji Mulyono",
            slug: "konveksijaya",
            packageType: "pro",
            prices: {
              tshirt: 45000,
              polo: 72000,
              hoodie: 115000,
              workshirt: 88000
            },
            whatsAppPhone: "6281234567800",
            brandColor: "emerald",
            tagline: "Konveksi Kaos, Kemeja & Jaket Premium Surabaya",
            createdAt: Date.now()
          });

          // Seed default whitelabel orders under slug "konveksijaya"
          const ordersRef = collection(db, 'convection_orders');
          const sampleTenantOrders = [
            {
              convectionSlug: 'konveksijaya',
              customerName: 'Ahmad Dhani',
              customerPhone: '6281234567890',
              skuTitle: 'Kaos Combed Sablon Reuni SMAN 3',
              fabricType: 'Organic Cotton 280 GSM',
              quantity: 120,
              unitPrice: 45000,
              totalAmount: 5400000,
              complexity: 'standard',
              embroideryType: 'screenprint',
              deadline: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString().split('T')[0],
              status: 'Cutting',
              notes: 'Bahan combed hitam pekat. Sablon emas di bagian depan dada.',
              createdAt: Date.now() - 36 * 3600000,
              updatedAt: Date.now() - 36 * 3600000
            },
            {
              convectionSlug: 'konveksijaya',
              customerName: 'Nadiem Makarim',
              customerPhone: '6285698765432',
              skuTitle: 'Polo Jaket Panitia Dies Natalis',
              fabricType: 'Lacoste Premium',
              quantity: 80,
              unitPrice: 72000,
              totalAmount: 5760000,
              complexity: 'premium',
              embroideryType: 'embroidery_small',
              deadline: new Date(Date.now() + 11 * 24 * 3600 * 1000).toISOString().split('T')[0],
              status: 'Sewing',
              notes: 'Bordir dada kiri logo kampus utama.',
              createdAt: Date.now() - 12 * 3600000,
              updatedAt: Date.now() - 12 * 3600000
            },
            {
              convectionSlug: 'konveksijaya',
              customerName: 'Yura Yunita',
              customerPhone: '628117765432',
              skuTitle: 'Premium French Terry Hoodie Konser',
              fabricType: 'French Terry Heavyweight 400 GSM',
              quantity: 50,
              unitPrice: 115000,
              totalAmount: 5750000,
              complexity: 'premium',
              embroideryType: 'embroidery_large',
              deadline: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
              status: 'QC',
              notes: 'Finishing tali hodie ujung metal custom. Bordir tebal premium.',
              createdAt: Date.now() - 48 * 3600000,
              updatedAt: Date.now() - 48 * 3600000
            }
          ];
          for (const o of sampleTenantOrders) {
            await addDoc(ordersRef, o);
          }
        }
      } catch (err) {
        console.error("Failing when seeding default whitelabel 'konveksijaya': ", err);
      }
    };
    seedDefaultTenant();
  }, []);

  // Update slug helper based on convection name input
  const handleConvectionNameChange = (val: string) => {
    setNewRegConvection(val);
    const generatedSlug = val.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setNewRegSlug(generatedSlug);
  };

  // Submit subscriber creation routine — moves wizard to payment step
  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegConvection || !newRegOwner || !newRegPhone || !newRegSlug || !newRegEmail) {
      alert("Mohon isi semua data bertanda bintang!");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRegEmail)) {
      alert("Format alamat email tidak valid!");
      return;
    }
    // Move to payment step first
    setWizardStep('payment');
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent, type: 'admin' | 'customer') => {
    e.preventDefault();
    const slug = loginSlug.trim().toLowerCase();
    if (!slug) return;

    setIsLoginChecking(true);
    setLoginError('');

    try {
      const docRef = doc(db, 'convections', slug);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Validation success
        window.location.search = type === 'admin' ? `?owner=${slug}` : `?c=${slug}`;
      } else {
        setLoginError('Domain konveksi tidak ditemukan. Silakan periksa kembali!');
      }
    } catch (err) {
      setLoginError('Terjadi kesalahan saat memverifikasi data.');
    } finally {
      setIsLoginChecking(false);
    }
  };

  // ── Step 1: Save tenant data to Firestore (called AFTER payment success) ──
  const saveTenantAfterPayment = async (method: string) => {
    const docRef = doc(db, 'convections', newRegSlug);
    const expiryTs = Date.now() + 30 * 24 * 3600 * 1000;
    await setDoc(docRef, {
      convectionName: newRegConvection,
      ownerName: newRegOwner,
      slug: newRegSlug,
      packageType: selectedPlan,
      prices: {
        tshirt: Number(priceTshirt) || 45000,
        polo: Number(pricePolo) || 72000,
        hoodie: Number(priceHoodie) || 115000,
        workshirt: Number(priceWorkshirt) || 85000,
      },
      whatsAppPhone: newRegPhone,
      email: newRegEmail,
      brandColor: newRegColor,
      tagline: newRegTagline,
      createdAt: Date.now(),
      paymentStatus: 'paid',
      paymentMethod: method,
      paymentDate: Date.now(),
      subscriptionExpiry: expiryTs,
    });

    // Seed sample orders
    const ordersRef = collection(db, 'convection_orders');
    const customOrders = [
      {
        convectionSlug: newRegSlug,
        customerName: 'Ahmad Dhani',
        customerPhone: '6281234567890',
        skuTitle: 'Kaos Combed Sablon Reuni SMAN 3',
        fabricType: 'Organic Cotton 280 GSM',
        quantity: 120,
        unitPrice: Number(priceTshirt) || 45000,
        totalAmount: 120 * (Number(priceTshirt) || 45000),
        complexity: 'standard',
        embroideryType: 'screenprint',
        deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: 'Design',
        notes: 'Pola sablon logo depan di dada.',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        convectionSlug: newRegSlug,
        customerName: 'Yura Yunita',
        customerPhone: '628117765432',
        skuTitle: 'Premium French Terry Hoodie Konser',
        fabricType: 'French Terry Heavyweight 400 GSM',
        quantity: 50,
        unitPrice: Number(priceHoodie) || 115000,
        totalAmount: 50 * (Number(priceHoodie) || 115000),
        complexity: 'premium',
        embroideryType: 'embroidery_large',
        deadline: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: 'Sewing',
        notes: 'Furing sutera satin.',
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 3600000,
      },
    ];
    for (const order of customOrders) {
      await addDoc(ordersRef, order);
    }

    setRegisteredSlug(newRegSlug);
    const customerUrl = `?c=${newRegSlug}`;
    const adminUrl = `?owner=${newRegSlug}`;
    setCreatedStoreLinks({ customerUrl, ownerUrl: adminUrl });
    // Email preview is generated instantly via useEffect on wizardStep change
  };



  // ── Step 2: Request Snap token from Express backend then open Midtrans popup ──
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWizardStep('processing');

    try {
      // Generate unique order ID
      const orderId = `SF-${newRegSlug.toUpperCase()}-${Date.now()}`;
      setMidtransOrderId(orderId);

      let token = '';
      try {
        // Request Snap token from backend
        const res = await fetch('/api/midtrans/snap-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            plan: selectedPlan,
            name: newRegOwner,
            phone: newRegPhone,
          }),
        });

        if (!res.ok) {
          // If response isn't JSON, this will throw, which is caught below
          const errData = await res.json();
          throw new Error(errData.error || 'Gagal mendapatkan token pembayaran');
        }

        const data = await res.json() as { token: string };
        token = data.token;
      } catch (apiError) {
        console.warn('[Midtrans] API error or backend not running, falling back to simulated payment success:', apiError);
        
        // Simulate payment success without Snap popup for demo purposes
        setTimeout(async () => {
          const simulatedMethod = paymentMethod !== 'other' ? paymentMethod : 'bank_transfer';
          setPaymentMethod(simulatedMethod);
          await saveTenantAfterPayment(simulatedMethod);
          setWizardStep('success');
        }, 1500); // 1.5s simulated delay
        
        return; // Exit early, skipping real Snap popup
      }

      // Open Midtrans Snap popup
      const snap = (window as any).snap;
      if (!snap) throw new Error('Midtrans Snap.js belum dimuat. Coba refresh halaman.');

      snap.pay(token, {
        onSuccess: async (result: any) => {
          setPaymentMethod(result.payment_type || 'other');
          await saveTenantAfterPayment(result.payment_type || 'other');
          setWizardStep('success');
        },
        onPending: async (result: any) => {
          // Save tenant with pending status, user can pay later
          const docRef = doc(db, 'convections', newRegSlug);
          await setDoc(docRef, {
            convectionName: newRegConvection,
            ownerName: newRegOwner,
            slug: newRegSlug,
            packageType: selectedPlan,
            prices: {
              tshirt: Number(priceTshirt) || 45000,
              polo: Number(pricePolo) || 72000,
              hoodie: Number(priceHoodie) || 115000,
              workshirt: Number(priceWorkshirt) || 85000,
            },
            whatsAppPhone: newRegPhone,
            brandColor: newRegColor,
            tagline: newRegTagline,
            createdAt: Date.now(),
            paymentStatus: 'pending',
            paymentMethod: result.payment_type || 'bank_transfer',
          });
          setPaymentMethod(result.payment_type || 'other');
          setRegisteredSlug(newRegSlug);
          setCreatedStoreLinks({ customerUrl: `?c=${newRegSlug}`, ownerUrl: `?owner=${newRegSlug}` });
          setWizardStep('success');
        },
        onError: (result: any) => {
          console.error('[Midtrans] Payment error:', result);
          alert('Pembayaran gagal. Silakan coba lagi.');
          setWizardStep('payment');
        },
        onClose: () => {
          // User closed popup without paying — go back to payment step
          setWizardStep('payment');
        },
      });
    } catch (err) {
      console.error('[Midtrans] Error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert('Gagal memulai pembayaran: ' + errMsg);
      setWizardStep('payment');
    }
  };

  useEffect(() => {
    const checkAndRoute = async () => {
      // 1. URL Query Params Detection (Fallback & Local Dev)
      const params = new URLSearchParams(window.location.search);
      const convectionSlugQuery = params.get('c');
      const ownerSlugQuery = params.get('owner');
      const isSuperAdmin = params.get('superadmin');
      const isAdminMode = params.get('admin') === 'true';

      if (isSuperAdmin === 'true') {
        setViewMode('superadmin');
        return;
      }

      // 2. Subdomain Detection Logic
      const hostname = window.location.hostname;
      let subdomainSlug = null;
      
      const mainDomains = ['localhost', '127.0.0.1', 'stitchflow.id'];
      
      // Deteksi apakah hostname berupa IP Address (misal: 192.168.1.5 atau 10.0.0.2)
      const isIPAddress = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
      
      const isMainDomain = isIPAddress || mainDomains.some(domain => hostname === domain || hostname.startsWith('www.'));
      
      if (!isMainDomain && hostname.includes('.')) {
        subdomainSlug = hostname.split('.')[0];
      }

      // Determine the requested slug and mode
      let targetSlug = null;
      let targetMode: 'admin' | 'customer' | null = null;

      if (subdomainSlug) {
        targetSlug = subdomainSlug;
        targetMode = isAdminMode ? 'admin' : 'customer';
      } else if (convectionSlugQuery) {
        targetSlug = convectionSlugQuery;
        targetMode = 'customer';
      } else if (ownerSlugQuery) {
        targetSlug = ownerSlugQuery;
        targetMode = 'admin';
      }

      // 3. Validation Logic
      if (targetSlug && targetMode) {
        try {
          const docRef = doc(db, 'convections', targetSlug.toLowerCase());
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            if (targetMode === 'admin') {
              setActiveOwnerSlug(targetSlug.toLowerCase());
              setViewMode('admin');
            } else {
              setActiveConvectionSlug(targetSlug.toLowerCase());
              setViewMode('customer');
            }
          } else {
            console.warn(`Tenant ${targetSlug} not found. Redirecting to landing.`);
            setViewMode('landing');
          }
        } catch (err) {
          console.error("Error validating tenant:", err);
          setViewMode('landing');
        }
      }
    };

    checkAndRoute();
  }, []);

  const enterDashboard = () => {
    setViewMode('admin');
    window.scrollTo({ top: 0 });
  };

  const enterCustomerPortal = () => {
    setViewMode('customer');
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen bg-slate-50/30 text-slate-800 font-sans antialiased relative">
      <AnimatePresence mode="wait">
        {viewMode === 'superadmin' && (
          <motion.div
            key="superadmin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <StitchFlowSuperAdmin
              onExit={() => {
                window.location.search = '';
              }}
            />
          </motion.div>
        )}

        {viewMode === 'customer' && (
          <motion.div
            key="customer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <CustomerPortal 
              convectionSlug={activeConvectionSlug} 
              onExit={() => {
                if (activeConvectionSlug) {
                  window.location.search = '';
                } else {
                  setViewMode('landing');
                }
              }} 
            />

          </motion.div>
        )}

        {viewMode === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <Dashboard 
              convectionSlug={activeOwnerSlug} 
              onExit={() => {
                if (activeOwnerSlug) {
                  window.location.search = '';
                } else {
                  setViewMode('landing');
                }
              }} 
            />

          </motion.div>
        )}

        {viewMode === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
      
      {/* Brand Header Navbar */}
      <header className="bg-white/85 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setViewMode('landing')}>
            <StitchFlowLogo size="md" variant="colored" />
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-500">
            <a href="#fitur" className="hover:text-slate-950 transition-colors">Features</a>
            <a href="#manfaat" className="hover:text-slate-950 transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-slate-950 transition-colors">Pricing</a>
            <a href="#testimoni" className="hover:text-slate-950 transition-colors">Testimonials</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCreatedStoreLinks(null);
                setNewRegConvection('');
                setNewRegOwner('');
                setNewRegPhone('');
                setNewRegSlug('');
                setIsSubsOpen(true);
              }}
              className="bg-indigo-650 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              Mulai Berlangganan
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-10 pb-12 lg:py-16 bg-gradient-to-b from-white to-slate-50/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Content Left */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 text-[10px] font-bold tracking-wider rounded-lg border border-sky-100">
              #1 KONVEKSI MANAGEMENT PLATFORM
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-[46px] font-display font-extrabold text-slate-900 leading-[1.12] tracking-tight">
              Digitalisasi Pemesanan Konveksi dalam Satu Platform
            </h1>

            <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl">
              StitchFlow membantu usaha konveksi mengelola pesanan, estimasi harga, tracking produksi, dan komunikasi pelanggan secara lebih cepat dan profesional.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                onClick={() => {
                  setActiveConvectionSlug('konveksijaya');
                  setViewMode('customer');
                  window.scrollTo({ top: 0 });
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white hover:text-amber-200 font-extrabold text-xs py-3.5 px-6.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-300 text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Lihat Contoh Website Konveksi</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => {
                  setCreatedStoreLinks(null);
                  setNewRegConvection('');
                  setNewRegOwner('');
                  setNewRegPhone('');
                  setNewRegSlug('');
                  setIsSubsOpen(true);
                }}
                className="bg-white border border-slate-250 hover:bg-slate-50 text-indigo-700 font-bold text-xs py-3.5 px-6.5 rounded-xl shadow-xs transition-all text-center cursor-pointer"
              >
                Mulai Berlangganan Platform
              </button>
            </div>
          </div>

          {/* Hero Graphics Right */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative bg-white rounded-3xl p-4 shadow-2xl border border-slate-100 overflow-hidden w-full max-w-xl">
              {/* Fake dashboard graphic layout using pure CSS elements */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-xs font-mono text-slate-450">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 bg-rose-400 rounded-full"></span>
                  <span className="w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
                </div>
                <span>STITCHFLOW ANALYTICS SERVER LIVE</span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Efficiency</span>
                    <span className="text-base font-bold text-slate-800 font-mono">98.2%</span>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <span className="text-[9px] text-indigo-500 font-bold uppercase block">Active Fabric</span>
                    <span className="text-base font-bold text-indigo-950 font-mono">6 Types</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <span className="text-[9px] text-emerald-600 font-bold uppercase block">Completed</span>
                    <span className="text-base font-bold text-emerald-950 font-mono">+1,240</span>
                  </div>
                </div>

                <div className="h-44 bg-slate-950 rounded-2xl p-4 text-white flex flex-col justify-between relative overflow-hidden select-none">
                  {/* Grid Lines mockup */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_24px]"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300">Live Production Load</h4>
                      <p className="text-[10px] text-slate-400">Monthly scale index logs</p>
                    </div>
                    <span className="text-[9px] bg-indigo-500 px-2 py-0.5 rounded font-mono font-bold">2026</span>
                  </div>
                  
                  {/* Styled wave simulation */}
                  <div className="h-16 flex items-end gap-1.5 relative z-10">
                    <div className="w-full bg-indigo-500/30 h-1/3 rounded-t"></div>
                    <div className="w-full bg-indigo-500/40 h-2/5 rounded-t"></div>
                    <div className="w-full bg-indigo-500/50 h-3/5 rounded-t"></div>
                    <div className="w-full bg-indigo-500/70 h-4/5 rounded-t"></div>
                    <div className="w-full bg-indigo-500 h-[92%] rounded-t-lg transition-all animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Real-time data overlay badge floating */}
              <div className="absolute -bottom-3 -left-3 bg-emerald-50 border-2 border-emerald-450 p-3.5 rounded-2xl flex items-center gap-3 shadow-xl max-w-[210px] select-none rotate-2">
                <div className="w-10 h-10 rounded-full bg-emerald-555 flex items-center justify-center font-bold font-mono text-emerald-700 text-sm border-2 border-emerald-300 bg-white">
                  94%
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-emerald-800 uppercase block tracking-wider">PRODUKSI EFISIENSI</span>
                  <span className="text-[11px] font-bold text-slate-900 block mt-0.5">Real-time Cloud Data</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Showcase Area */}
      <section id="fitur" className="py-12 bg-white px-6 border-y border-slate-100 font-sans">
        <div className="max-w-7xl mx-auto text-center space-y-3 mb-10">
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Fitur Canggih untuk Skala Industri
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Dirancang khusus untuk alur kerja konveksi modern mulai dari desain hingga pengiriman.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Feature 1 */}
          <motion.div 
            whileHover={{ 
              y: -5,
              borderColor: "rgb(99, 102, 241)", // Indigo 500
              boxShadow: "0 15px 25px -5px rgba(99, 102, 241, 0.12), 0 8px 10px -6px rgba(99, 102, 241, 0.12)"
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 rounded-2xl border border-slate-100 transition-shadow bg-slate-50/20 text-left flex flex-col justify-between h-72 cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center mb-5 border border-indigo-100">
                <Layout className="w-5 h-5" />
              </div>
              <h3 className="text-base font-display font-bold text-slate-900 mb-2">Order Management</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                Kelola ribuan SKU dan pesanan kustom tanpa pusing. Sistem database terstruktur memudahkan pencarian data pelanggan.
              </p>
            </div>
            <button onClick={enterDashboard} className="text-xs font-bold text-indigo-600 hover:text-indigo-805 flex items-center gap-1 mt-4 transition-colors cursor-pointer justify-start">
              <span>Buka Database</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            whileHover={{ 
              y: -5,
              borderColor: "rgb(16, 185, 129)", // Emerald 500
              boxShadow: "0 15px 25px -5px rgba(16, 185, 129, 0.12), 0 8px 10px -6px rgba(16, 185, 129, 0.12)"
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 rounded-2xl border border-slate-100 transition-shadow bg-slate-50/20 text-left flex flex-col justify-between h-72 cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-650 flex items-center justify-center mb-5 border border-emerald-100">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-base font-display font-bold text-slate-900 mb-2">Estimasi Harga</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                Hitung HPP otomatis berdasarkan bahan, bordir, dan biaya jahit secara akurat dalam waktu kurang dari 10 detik.
              </p>
            </div>
            <button onClick={enterDashboard} className="text-xs font-bold text-emerald-600 hover:text-emerald-805 flex items-center gap-1 mt-4 transition-colors cursor-pointer justify-start">
              <span>Hitung HPP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            whileHover={{ 
              y: -5,
              borderColor: "rgb(245, 158, 11)", // Amber 500
              boxShadow: "0 15px 25px -5px rgba(245, 158, 11, 0.12), 0 8px 10px -6px rgba(245, 158, 11, 0.12)"
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 rounded-2xl border border-slate-100 transition-shadow bg-slate-50/20 text-left flex flex-col justify-between h-72 cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-650 flex items-center justify-center mb-5 border border-amber-100">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-base font-display font-bold text-slate-900 mb-2">Tracking Produksi</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                Pantau status tiap jahitan mulai dari cutting, sewing, hingga quality control secara instan di papan Kanban.
              </p>
            </div>
            <button onClick={enterDashboard} className="text-xs font-bold text-amber-600 hover:text-amber-805 flex items-center gap-1 mt-4 transition-colors cursor-pointer justify-start">
              <span>Monitor Proses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* Feature 4 */}
          <motion.div 
            whileHover={{ 
              y: -5,
              borderColor: "rgb(20, 184, 166)", // Teal 500
              boxShadow: "0 15px 25px -5px rgba(20, 184, 166, 0.12), 0 8px 10px -6px rgba(20, 184, 166, 0.12)"
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 rounded-2xl border border-slate-100 transition-shadow bg-slate-50/20 text-left flex flex-col justify-between h-72 cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-5 border border-teal-100">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-display font-bold text-slate-900 mb-2">WA Integration</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                Kirim notifikasi status pesanan otomatis ke pelanggan via WhatsApp. Tingkatkan kredibilitas pengiriman real-time.
              </p>
            </div>
            <button onClick={enterDashboard} className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1 mt-4 transition-colors cursor-pointer justify-start">
              <span>Buka Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

        </div>
      </section>

      {/* Interactive Teaser Showcase Section */}
      <section 
        id="demo-teaser" 
        className="py-16 bg-slate-50 border-b border-slate-150 relative scroll-mt-20 px-4 md:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-3xl p-8 md:p-12 text-left relative overflow-hidden border border-slate-800 shadow-2xl">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold tracking-wider rounded-lg border border-indigo-500/20 uppercase">
                Interactive Administrative Suite
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
                Kendali Utama Pabrik Konveksi dalam Genggaman
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                Alat operasional full-screen StitchFlow didesain khusus untuk meningkatkan efisiensi workshop jahit. Nikmati rekap performa mingguan, monitor inventory fabric roll, HPP kain otomatis, dan alur kerja real-time.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={enterDashboard}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-4 px-8 rounded-xl shadow-lg transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Buka Dashboard Operasional Utama</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 relative">
              <div className="bg-slate-950/80 border border-slate-800/80 p-6 rounded-2xl space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-indigo-950 pb-3 mb-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></span>
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                  </div>
                  <span className="text-[9px] font-semibold text-slate-500 tracking-wider font-mono">CONVECTION OS ACTIVE</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                    <span className="text-[8px] font-bold text-slate-500 block uppercase">Estimasi Omset</span>
                    <p className="text-xs font-bold text-emerald-400 font-mono mt-1">Rp 16.2 Juta</p>
                  </div>
                  <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                    <span className="text-[8px] font-bold text-slate-500 block uppercase">Jalur Jahit</span>
                    <p className="text-xs font-bold text-indigo-400 font-mono mt-1">84% Kapasitas</p>
                  </div>
                </div>

                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-850 space-y-1 text-left">
                  <span className="text-[8px] font-bold text-slate-500 block uppercase">Pipa Produksi Kanban</span>
                  <div className="flex items-center justify-between text-[10px] text-white">
                    <span>Design &rarr; Sewing</span>
                    <span className="text-emerald-400 font-bold">Terproses</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-indigo-505 h-full w-[70%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats and Benefits section ("Mengapa Memilih StitchFlow") */}
      <section id="manfaat" className="py-12 bg-white border-b border-slate-100 px-6 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Stats Grid Left - 6 Cols */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <motion.div 
              whileHover={{ 
                y: -5,
                borderColor: "rgb(244, 63, 94)", // Rose 500
                boxShadow: "0 15px 25px -5px rgba(244, 63, 94, 0.12), 0 8px 10px -6px rgba(244, 63, 94, 0.12)"
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 bg-slate-50/60 rounded-3xl border border-slate-100 text-left space-y-2 cursor-pointer transition-shadow"
            >
              <h3 className="text-4xl font-display font-black text-rose-600 tracking-tight">40%</h3>
              <p className="text-xs font-bold text-slate-900">Peningkatan Efisiensi</p>
              <p className="text-[10px] text-slate-400 leading-normal">Optimasi padat karyawan & durasi jahit harian</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ 
                y: -5,
                borderColor: "rgb(99, 102, 241)", // Indigo 500
                boxShadow: "0 15px 25px -5px rgba(99, 102, 241, 0.12), 0 8px 10px -6px rgba(99, 102, 241, 0.12)"
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 bg-slate-50/60 rounded-3xl border border-slate-100 text-left space-y-2 cursor-pointer transition-shadow"
            >
              <h3 className="text-4xl font-display font-black text-indigo-600 tracking-tight font-sans">2X</h3>
              <p className="text-xs font-bold text-slate-900">Kecepatan Estimasi</p>
              <p className="text-[10px] text-slate-400 leading-normal">Kalkulasi harga kontrak bahan andal instan</p>
            </motion.div>

            <motion.div 
              whileHover={{ 
                y: -5,
                borderColor: "rgb(16, 185, 129)", // Emerald 500
                boxShadow: "0 15px 25px -5px rgba(16, 185, 129, 0.12), 0 8px 10px -6px rgba(16, 185, 129, 0.12)"
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 bg-slate-50/60 rounded-3xl border border-slate-100 text-left space-y-2 cursor-pointer transition-shadow"
            >
              <h3 className="text-4xl font-display font-black text-emerald-600 tracking-tight font-mono">0%</h3>
              <p className="text-xs font-bold text-slate-900">Miss-communication</p>
              <p className="text-[10px] text-slate-400 leading-normal">Klien sinkron dengan WA notif tiap update status</p>
            </motion.div>

            <motion.div 
              whileHover={{ 
                y: -5,
                borderColor: "rgb(14, 165, 233)", // Sky 500
                boxShadow: "0 15px 25px -5px rgba(14, 165, 233, 0.12), 0 8px 10px -6px rgba(14, 165, 233, 0.12)"
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 bg-slate-50/60 rounded-3xl border border-slate-100 text-left space-y-2 cursor-pointer transition-shadow"
            >
              <h3 className="text-4xl font-display font-black text-sky-600 tracking-tight font-sans">24/7</h3>
              <p className="text-xs font-bold text-slate-900">Akses Kapan Saja</p>
              <p className="text-[10px] text-slate-400 leading-normal">Server web berbasis cloud murni aman diakses portabel</p>
            </motion.div>
          </div>

          {/* Benefits Text Right - 6 Cols */}
          <div className="lg:col-span-6 text-left space-y-6">
            <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              Mengapa Memilih StitchFlow?
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Kami memahami tantangan konveksi: deadline ketat, manajemen kain yang rumit, dan komunikasi pelanggan yang melelahkan. StitchFlow hadir untuk menyederhanakan itu semua dalam satu dashboard yang intuitif.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Data tersentralisasi & aman di Cloud</h4>
                  <p className="text-[11px] text-slate-450 leading-relaxed">Simpan permanen ribuan riwayat ukuran, bahan, nota dan tagihan aman di server.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Multi-user untuk Admin, Penjahit, & Owner</h4>
                  <p className="text-[11px] text-slate-450 leading-relaxed font-sans">Semua operator pabrik dapat memonitor atau merespon tahap perakitan sesuai hak akses.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5.5 h-5.5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Laporan keuangan & produksi otomatis</h4>
                  <p className="text-[11px] text-slate-450 leading-relaxed">Ketahui margin keuntungan bersih konveksi seketika tanpa kompilasi excel manual.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing Packages Area */}
      <section id="pricing" className="py-12 bg-slate-50/50 border-b border-slate-100 px-6 font-sans">
        <div className="max-w-7xl mx-auto text-center space-y-3 mb-10">
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Pilihan Paket Sesuai Skala Usaha
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Mulai gratis dan tingkatkan fitur saat bisnis Anda berkembang.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Starter Plan */}
          <motion.div 
            whileHover={{ 
              y: -6,
              borderColor: "rgb(139, 92, 246)", // Violet 500
              boxShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.15), 0 8px 10px -6px rgba(139, 92, 246, 0.15)"
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white p-8 rounded-3xl border-2 border-slate-100 flex flex-col justify-between text-left shadow-sm cursor-pointer"
          >
            <div>
              <h3 className="text-base font-display font-bold text-slate-900">Starter</h3>
              <p className="text-[11px] text-slate-450 mt-1">Untuk usaha konveksi rumahan kecil</p>
              <div className="my-6">
                <span className="text-3xl font-extrabold font-mono text-slate-900 font-sans">Rp 199.000</span>
                <span className="text-xs text-slate-400 font-medium"> / bln</span>
              </div>
              <div className="space-y-3 pb-8 border-b border-slate-50 text-xs text-slate-600">
                <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> <span>Maks 20 Order / bln</span></p>
                <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> <span>Dashboard Owner Dasar</span></p>
                <p className="flex items-center gap-2 block text-red-500"><X className="w-4 h-4 inline mr-1" /> <span>Website Pelanggan Nonaktif</span></p>
                <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> <span>1 User Admin/Owner</span></p>
              </div>
            </div>
            <button 
              onClick={() => {
                setPriceTshirt(45000);
                setPricePolo(70000);
                setPriceHoodie(110000);
                setPriceWorkshirt(85000);
                setSelectedPlan('starter');
                setCreatedStoreLinks(null);
                setIsSubsOpen(true);
              }} 
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-3 px-4 rounded-xl text-center mt-6 transition-colors cursor-pointer"
            >
              Pilih Paket Starter
            </button>
          </motion.div>
 
          {/* Growth Plan */}
          <motion.div 
            whileHover={{ 
              y: -6,
              borderColor: "rgb(139, 92, 246)", // Violet 500
              boxShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.15), 0 8px 10px -6px rgba(139, 92, 246, 0.15)"
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white p-8 rounded-3xl border-2 border-slate-100 flex flex-col justify-between text-left shadow-sm cursor-pointer"
          >
            <div>
              <h3 className="text-base font-display font-bold text-slate-900">Growth</h3>
              <p className="text-[11px] text-slate-450 mt-1">Untuk bisnis konveksi yang berkembang</p>
              <div className="my-6">
                <span className="text-3xl font-extrabold font-mono text-slate-900 font-sans">Rp 399.000</span>
                <span className="text-xs text-slate-400 font-medium"> / bln</span>
              </div>
              <div className="space-y-3 pb-8 border-b border-slate-50 text-xs text-slate-600">
                <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> <span>Maks 200 Order / bln</span></p>
                <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> <span>Dashboard Owner Lengkap</span></p>
                <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> <span>Portal Pemesanan Aktif (StitchFlow Tag)</span></p>
                <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> <span>Hingga 2 User Admin/Owner</span></p>
              </div>
            </div>
            <button 
              onClick={() => {
                setPriceTshirt(42000);
                setPricePolo(68000);
                setPriceHoodie(108000);
                setPriceWorkshirt(82000);
                setSelectedPlan('growth');
                setCreatedStoreLinks(null);
                setIsSubsOpen(true);
              }} 
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs py-3 px-4 rounded-xl text-center mt-6 transition-colors cursor-pointer shadow-sm"
            >
              Pilih Paket Growth
            </button>
          </motion.div>
 
          {/* Pro Plan */}
          <motion.div 
            whileHover={{ 
              y: -6,
              borderColor: "rgb(99, 102, 241)", // Indigo 600
              boxShadow: "0 20px 25px -5px rgba(99, 102, 241, 0.2), 0 8px 10px -6px rgba(99, 102, 241, 0.2)"
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white p-8 rounded-3xl border-2 border-indigo-600 flex flex-col justify-between text-left shadow-md relative cursor-pointer"
          >
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-650 text-white text-[9px] font-bold tracking-wider uppercase px-3 py-1 rounded-full">
              PILIHAN UTAMA
            </span>
            <div>
              <h3 className="text-base font-display font-bold text-slate-900">Pro</h3>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">Untuk workshop skala menengah & besar</p>
              <div className="my-6">
                <span className="text-3xl font-extrabold font-mono text-indigo-755 font-sans font-black font-sans">Rp 699.000</span>
                <span className="text-xs text-slate-400 font-medium"> / bln</span>
              </div>
              <div className="space-y-3 pb-8 border-b border-indigo-50 text-xs text-slate-605">
                <p className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-500 font-bold" /> <span>Unlimited Order & Tracking</span></p>
                <p className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-500 font-bold" /> <span>Whitelabel Portal Pemesanan Klien</span></p>
                <p className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-500 font-bold" /> <span>Integrasi Notifikasi WhatsApp Otomatis</span></p>
                <p className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-500 font-bold" /> <span>Hingga 5 Staff Dashboard</span></p>
              </div>
            </div>
            <button 
              onClick={() => {
                setPriceTshirt(40000);
                setPricePolo(65000);
                setPriceHoodie(105000);
                setPriceWorkshirt(80000);
                setSelectedPlan('pro');
                setCreatedStoreLinks(null);
                setIsSubsOpen(true);
              }} 
              className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-4 rounded-xl text-center mt-6 shadow-md transition-colors cursor-pointer"
            >
              Pilih Paket Pro
            </button>
          </motion.div>
 
        </div>
      </section>

      {/* Testimonials ("Apa Kata Mereka?") */}
      <section id="testimoni" className="py-12 bg-white px-6 font-sans">
        <div className="max-w-7xl mx-auto text-center space-y-3 mb-10">
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Apa Kata Mereka?
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Pemilik konveksi tangguh yang telah mendigitalisasi bisnis mereka dengan teknologi modern StitchFlow.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Testi 1 */}
          <motion.div 
            whileHover={{ 
              y: -5,
              borderColor: "rgb(168, 85, 247)", // Purple 500
              boxShadow: "0 15px 25px -5px rgba(168, 85, 247, 0.08), 0 8px 10px -6px rgba(168, 85, 247, 0.08)"
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-slate-50/50 p-7 rounded-3xl border border-slate-100 text-left space-y-4 cursor-pointer transition-shadow"
          >
            <div className="flex gap-1 text-amber-400">
              <Star className="w-4 h-4 fill-current animate-pulse" />
              <Star className="w-4 h-4 fill-current animate-pulse" />
              <Star className="w-4 h-4 fill-current animate-pulse" />
              <Star className="w-4 h-4 fill-current animate-pulse" />
              <Star className="w-4 h-4 fill-current animate-pulse" />
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              &ldquo;Dulu estimasi harga pelanggan sering keliru karena harga kain fluktuatif. Dengan StitchFlow, saya tinggal atur margin harga produk di dashboard, lalu pelanggan mendapatkan kalkulator estimasi real-time di website pemesanan saya sendiri!&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 text-xs">
                BS
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-950">Budi Santoso</h4>
                <p className="text-[10px] text-slate-400 font-medium">Owner, Jaya Makmur Konveksi</p>
              </div>
            </div>
          </motion.div>

          {/* Testi 2 */}
          <motion.div 
            whileHover={{ 
              y: -5,
              borderColor: "rgb(20, 184, 166)", // Teal 500
              boxShadow: "0 15px 25px -5px rgba(20, 184, 166, 0.08), 0 8px 10px -6px rgba(20, 184, 166, 0.08)"
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-slate-50/50 p-7 rounded-3xl border border-slate-100 text-left space-y-4 cursor-pointer transition-shadow"
          >
            <div className="flex gap-1 text-amber-400">
              <Star className="w-4 h-4 fill-current animate-pulse" />
              <Star className="w-4 h-4 fill-current animate-pulse" />
              <Star className="w-4 h-4 fill-current animate-pulse" />
              <Star className="w-4 h-4 fill-current animate-pulse" />
              <Star className="w-4 h-4 fill-current animate-pulse" />
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              &ldquo;Pelanggan sangat senang bisa memonitor status cutting, sewing, dan QC di website portal konveksi saya secara real-time. Tidak ada lagi keluhan misscom atau ribet telpon berulang kali!&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 text-xs">
                SA
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-950">Siti Aminah</h4>
                <p className="text-[10px] text-slate-400 font-medium">Manager, urban apparel Indonesia</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer & Final Call to Action */}
      <section className="bg-slate-900 text-slate-450 text-xs py-16 px-6 border-t border-slate-850">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Final CTA */}
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-display font-extrabold text-white tracking-tight">
              Siap Transformasi Bisnis Konveksi Anda?
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              Bergabunglah dengan ratusan pengusaha konveksi lainnya yang telah meningkatkan profit dan efisiensi bersama StitchFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center items-stretch sm:items-center">
              <button
                onClick={() => {
                  setCreatedStoreLinks(null);
                  setIsSubsOpen(true);
                  window.scrollTo({ top: 0 });
                }}
                className="bg-white hover:bg-slate-100 text-slate-950 font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all text-center cursor-pointer"
              >
                Mulai Berlangganan Sekarang
              </button>
              <button
                onClick={() => {
                  setActiveConvectionSlug('konveksijaya');
                  setViewMode('customer');
                  window.scrollTo({ top: 0 });
                }}
                className="bg-transparent hover:bg-white/5 border border-indigo-750 text-indigo-300 hover:text-white font-extrabold py-3.5 px-6 rounded-xl transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Lihat Contoh Toko Konveksi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-800"></div>

          {/* Copyrights footer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-slate-500 pb-20 md:pb-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
                <StitchFlowLogo size="sm" variant="light" showText={false} />
                <span className="font-semibold text-slate-300">StitchFlow Systems</span>
              </div>
              <button 
                onClick={() => setViewMode('superadmin')} 
                className="hover:text-indigo-300 text-indigo-500 transition-colors cursor-pointer bg-transparent border-0 p-0 text-[11px] font-sans font-bold flex items-center gap-1"
              >
                ⚡ Admin Console
              </button>
            </div>
            <p className="hidden lg:block">&copy; {new Date().getFullYear()} StitchFlow SaaS. All rights reserved.</p>
            <div className="flex gap-5 flex-wrap justify-center md:justify-end">
              <button onClick={() => setActiveDocModal('privacy')} className="hover:text-slate-300 transition-colors cursor-pointer bg-transparent border-0 p-0 text-[11px] font-sans">Privacy Policy</button>
              <button onClick={() => setActiveDocModal('terms')} className="hover:text-slate-300 transition-colors cursor-pointer bg-transparent border-0 p-0 text-[11px] font-sans">Terms of Service</button>
              <button onClick={() => setActiveDocModal('support')} className="hover:text-slate-300 transition-colors cursor-pointer bg-transparent border-0 p-0 text-[11px] font-sans">Contact Support</button>
              <button onClick={() => setActiveDocModal('docs')} className="hover:text-slate-300 transition-colors cursor-pointer bg-transparent border-0 p-0 text-[11px] font-sans">Documentation</button>
            </div>
          </div>

        </div>
      </section>

      {/* FLOATING SALES WHATSAPP */}
      <WhatsAppFloatingButton 
        phoneNumber="6282172349762"
        message="Halo Sales Partner StitchFlow, saya tertarik memiliki website pemesanan kustom dan dashboard manajemen operasional konveksi. Bagaimana memulainya?"
        label="Tanya Tim Sales StitchFlow"
      />

      {/* INTERACTIVE SUBSCRIPTION SETUP WIZARD DIALOG POPUP */}
      {isSubsOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-slate-100 shadow-2xl relative overflow-hidden my-auto animation-scale-in">
            {/* Header style */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="space-y-1 text-left">
                <span className="text-[9px] bg-indigo-500/35 text-indigo-200 border border-indigo-400/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider block w-fit">
                  StitchFlow SaaS Setup Wizard
                </span>
                <h3 className="text-lg font-bold tracking-tight">
                  {wizardStep === 'form' && 'Daftarkan Usaha Konveksi Anda'}
                  {wizardStep === 'payment' && 'Selesaikan Pembayaran'}
                  {wizardStep === 'processing' && 'Memverifikasi Pembayaran...'}
                  {wizardStep === 'success' && 'Selamat! Konveksi Aktif 🎉'}
                </h3>
                {/* Wizard Progress Indicator */}
                {wizardStep !== 'success' && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {(['form', 'payment', 'processing'] as const).map((step, idx) => (
                      <React.Fragment key={step}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${
                          wizardStep === step
                            ? 'bg-indigo-500 border-indigo-400 text-white'
                            : (wizardStep === 'payment' && step === 'form') || (wizardStep === 'processing' && (step === 'form' || step === 'payment'))
                            ? 'bg-emerald-500 border-emerald-400 text-white'
                            : 'bg-white/10 border-white/20 text-white/40'
                        }`}>
                          {((wizardStep === 'payment' && step === 'form') || (wizardStep === 'processing' && (step === 'form' || step === 'payment'))) ? '✓' : idx + 1}
                        </div>
                        {idx < 2 && <div className={`h-px w-6 ${ (wizardStep === 'payment' && step === 'form') || (wizardStep === 'processing') ? 'bg-emerald-500' : 'bg-white/15'}`} />}
                      </React.Fragment>
                    ))}
                    <span className="ml-1 text-[9px] text-white/50 font-medium">
                      {wizardStep === 'form' ? 'Isi Data' : wizardStep === 'payment' ? 'Pembayaran' : 'Verifikasi'}
                    </span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => { setIsSubsOpen(false); setWizardStep('form'); }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content body */}
            {wizardStep === 'processing' && (
              <div className="p-12 text-center space-y-5">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-7 h-7 text-indigo-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Memverifikasi Pembayaran</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Sedang memproses transaksi Anda dan mengaktifkan server konveksi di cloud...</p>
                </div>
                <div className="flex justify-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {wizardStep === 'payment' && (
              <form onSubmit={handlePaymentSubmit} className="flex flex-col text-left">
                <div className="p-7 space-y-5 border-b border-slate-100">

                  {/* Order summary */}
                  <div className="bg-slate-900 rounded-2xl p-4 text-white text-xs space-y-2">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Ringkasan Pesanan</p>
                    <div className="flex justify-between">
                      <span className="text-slate-300">{newRegConvection}</span>
                      <span className="font-bold font-mono">
                        {selectedPlan === 'starter' ? 'Rp 199.000' : selectedPlan === 'growth' ? 'Rp 399.000' : 'Rp 699.000'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Paket {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} · 1 Bulan</span>
                      <span className="text-emerald-400 font-bold">✓ AKTIF 30 HARI</span>
                    </div>
                    <div className="h-px bg-white/10 my-1" />
                    <div className="flex justify-between font-bold">
                      <span>Total Pembayaran</span>
                      <span className="text-indigo-300 font-mono">
                        {selectedPlan === 'starter' ? 'Rp 199.000' : selectedPlan === 'growth' ? 'Rp 399.000' : 'Rp 699.000'}
                      </span>
                    </div>
                  </div>

                  {/* Midtrans Snap info */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-indigo-900">Bayar dengan Midtrans Snap</p>
                        <p className="text-[10px] text-indigo-600">Pilih metode bayar favoritmu di popup yang akan muncul</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Kartu Kredit/Debit', icon: '💳', value: 'card' as const },
                        { label: 'Transfer Bank / VA', icon: '🏦', value: 'bank_transfer' as const },
                        { label: 'QRIS / GoPay / OVO', icon: '📱', value: 'qris' as const },
                      ].map((m) => (
                        <button
                          key={m.label}
                          type="button"
                          onClick={() => setPaymentMethod(m.value)}
                          className={`border rounded-xl p-2.5 text-center cursor-pointer transition-all duration-200 ${
                            paymentMethod === m.value
                              ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                              : 'bg-white border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50'
                          }`}
                        >
                          <p className="text-base">{m.icon}</p>
                          <p className={`text-[9px] font-bold mt-1 leading-tight ${
                            paymentMethod === m.value ? 'text-indigo-800' : 'text-indigo-700'
                          }`}>{m.label}</p>
                          {paymentMethod === m.value && (
                            <span className="inline-flex items-center justify-center w-4 h-4 bg-indigo-600 rounded-full mt-1">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SSL Security badge */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Transaksi diproses oleh Midtrans · Terenkripsi SSL · PCI DSS Compliant</span>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-between gap-3 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => setWizardStep('form')}
                    className="h-10 px-5 border border-slate-200 font-bold text-xs text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer"
                  >
                    ← Kembali
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-7 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Lanjut ke Pembayaran
                  </button>
                </div>
              </form>
            )}

            {wizardStep === 'form' && (
              <form onSubmit={handleSubscribeSubmit} className="flex flex-col text-left">
                {/* Scrollable form content */}
                <div className="p-7 space-y-6 max-h-[55vh] overflow-y-auto border-b border-slate-100">
                  
                  {/* Interactive Plan Swapper inside Wizard */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150-70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">PAKET LAYANAN TERPILIH</p>
                      <p className="text-xs font-bold text-slate-800">
                        {selectedPlan === 'starter' 
                          ? '📦 Paket Starter (Dasar, Rp 199rb/bln)' 
                          : selectedPlan === 'growth' 
                          ? '📈 Paket Growth (Pemesanan Aktif, Rp 399rb/bln)' 
                          : '🚀 Paket Pro (Whitelabel Lengkap, Rp 699rb/bln)'}
                      </p>
                    </div>
                    <div className="flex bg-slate-200/60 p-1 rounded-xl self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlan('starter');
                          setPriceTshirt(45000);
                          setPricePolo(70000);
                          setPriceHoodie(110000);
                          setPriceWorkshirt(85000);
                        }}
                        className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${selectedPlan === 'starter' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-550 hover:text-slate-800'}`}
                      >
                        Starter
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlan('growth');
                          setPriceTshirt(42000);
                          setPricePolo(68000);
                          setPriceHoodie(108000);
                          setPriceWorkshirt(82000);
                        }}
                        className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${selectedPlan === 'growth' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-550 hover:text-slate-800'}`}
                      >
                        Growth
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlan('pro');
                          setPriceTshirt(40000);
                          setPricePolo(65000);
                          setPriceHoodie(105000);
                          setPriceWorkshirt(80000);
                        }}
                        className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${selectedPlan === 'pro' ? 'bg-indigo-650 text-white shadow-sm' : 'text-slate-550 hover:text-slate-800'}`}
                      >
                        Pro
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nama Konveksi */}
                    <div className="space-y-1.5 md:col-span-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Nama Konveksi Anda *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Contoh: Konveksi Sukses Makmur"
                        value={newRegConvection}
                        onChange={(e) => handleConvectionNameChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 h-10 px-3.5 text-xs font-semibold rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800"
                      />
                    </div>

                    {/* Customer Owner Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Nama Owner/Pemilik *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Masukkan nama kontak Anda"
                        value={newRegOwner}
                        onChange={(e) => setNewRegOwner(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 h-10 px-3.5 text-xs font-semibold rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800"
                      />
                    </div>

                    {/* Slug / Subdomain */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Domain Slug Unik *</label>
                      <div className="relative">
                        <input 
                          type="text"
                          required
                          placeholder="sukses-makmur"
                          value={newRegSlug}
                          onChange={(e) => setNewRegSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                          className="w-full bg-slate-50 border border-slate-200 h-10 pl-3.5 pr-24 text-xs font-mono font-bold rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                          .stitchflow.id
                        </span>
                      </div>
                    </div>

                    {/* Admin WhatsApp */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">WhatsApp Admin Konveksi *</label>
                      <input 
                        type="tel"
                        required
                        placeholder="Contoh: 6281234567890"
                        value={newRegPhone}
                        onChange={(e) => setNewRegPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 h-10 px-3.5 text-xs font-semibold rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800"
                      />
                      <span className="text-[9px] text-slate-450 block -mt-1">Pelanggan Anda akan melakukan chat konsultasi ke nomor jaminan ini.</span>
                    </div>

                    {/* Email Owner */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Email Owner *</label>
                      <input 
                        type="email"
                        required
                        placeholder="Contoh: owner@konveksisaya.com"
                        value={newRegEmail}
                        onChange={(e) => setNewRegEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 h-10 px-3.5 text-xs font-semibold rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800"
                      />
                      <span className="text-[9px] text-slate-450 block -mt-1">Bukti pembayaran & tautan akses sistem akan dikirim ke email ini.</span>
                    </div>

                    {/* Brand Tagline */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Tagline Konveksi Pemrosesan</label>
                      <input 
                        type="text"
                        placeholder="Contoh: Konveksi Kaos Terbaik, Cepat, dan Berkulit Halus"
                        value={newRegTagline}
                        onChange={(e) => setNewRegTagline(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 h-10 px-3.5 text-xs font-semibold rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Section B: Custom pricing details */}
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs">
                      <Palette className="w-4 h-4 text-indigo-500" />
                      <span>Branding & Penentuan Harga Dasar Klien (Dalam IDR/Pcs)</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <label className="text-[9px] font-bold text-slate-450 block uppercase">Harga Kaos (T-Shirt)</label>
                        <input 
                          type="number"
                          value={priceTshirt}
                          onChange={(e) => setPriceTshirt(Number(e.target.value))}
                          className="w-full bg-white border border-slate-150 h-8 px-2 text-xs font-mono font-bold rounded-lg text-slate-800"
                        />
                      </div>

                      <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <label className="text-[9px] font-bold text-slate-455 block uppercase font-medium">Harga Polo Shirt</label>
                        <input 
                          type="number"
                          value={pricePolo}
                          onChange={(e) => setPricePolo(Number(e.target.value))}
                          className="w-full bg-white border border-slate-150 h-8 px-2 text-xs font-mono font-bold rounded-lg text-slate-800"
                        />
                      </div>

                      <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <label className="text-[9px] font-bold text-slate-450 block uppercase">Harga Hoodie</label>
                        <input 
                          type="number"
                          value={priceHoodie}
                          onChange={(e) => setPriceHoodie(Number(e.target.value))}
                          className="w-full bg-white border border-slate-150 h-8 px-2 text-xs font-mono font-bold rounded-lg text-slate-800"
                        />
                      </div>

                      <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <label className="text-[9px] font-bold text-slate-450 block uppercase">Harga Kemeja Kerja</label>
                        <input 
                          type="number"
                          value={priceWorkshirt}
                          onChange={(e) => setPriceWorkshirt(Number(e.target.value))}
                          className="w-full bg-white border border-slate-150 h-8 px-2 text-xs font-mono font-bold rounded-lg text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Brand Color palette */}
                    <div className="space-y-1.5 pt-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Pilih Tema Warna Brand Website Anda</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: 'indigo', code: 'bg-indigo-600', text: 'Royal Indigo' },
                          { name: 'emerald', code: 'bg-emerald-600', text: 'Forest Emerald' },
                          { name: 'sky', code: 'bg-sky-650', text: 'Ocean Sky' },
                          { name: 'rose', code: 'bg-rose-600', text: 'Crimson Rose' },
                          { name: 'amber', code: 'bg-amber-500', text: 'Autumn Amber' }
                        ].map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setNewRegColor(c.name)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                              newRegColor === c.name 
                                ? 'border-slate-800 bg-slate-900 text-white' 
                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className={`w-3 h-3 rounded-full ${c.code} inline-block border border-white/20`} />
                            <span>{c.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Footer for Submitting Actions */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl">
                  <button 
                    type="button"
                    onClick={() => { setIsSubsOpen(false); setWizardStep('form'); }}
                    className="h-10 px-5 border border-slate-200 font-bold text-xs text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="h-10 px-6 font-bold text-xs rounded-xl transition-all duration-300 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md hover:shadow-lg shadow-indigo-600/20"
                  >
                    Lanjut ke Pembayaran
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {wizardStep === 'success' && createdStoreLinks && (
              // SUCCESS STORE CREATION SCREEN
              <div className="p-8 text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-500 flex items-center justify-center">
                    <BadgeCheck className="w-10 h-10" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">✓</div>
                </div>

                {/* Payment confirmation chip */}
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Pembayaran via Midtrans Terverifikasi
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">SaaS Server Konveksi Berhasil Diaktifkan!</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Selamat, toko digital Anda <b>{newRegConvection}</b> siap digunakan! Link platform whitelabel dan dashboard administrator otomatis terbuat di cloud database StitchFlow.
                  </p>
                </div>

                {/* Email receipt notification */}
                <div className={`max-w-xl mx-auto rounded-2xl border px-5 py-4 text-left flex items-start gap-3 transition-all ${
                  emailPreviewUrl
                    ? 'bg-sky-50 border-sky-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-base ${
                    emailPreviewUrl ? 'bg-sky-100' : 'bg-amber-100'
                  }`}>
                    {emailPreviewUrl ? '📧' : '⏳'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold mb-0.5 ${emailPreviewUrl ? 'text-sky-800' : 'text-amber-800'}`}>
                      {emailPreviewUrl ? 'Bukti pembayaran berhasil dibuat!' : 'Mengirim email bukti pembayaran...'}
                    </p>
                    {emailPreviewUrl ? (
                      <>
                        <p className="text-[11px] text-sky-600 mb-2">
                          Email dikirim ke <b>{newRegEmail}</b>. Karena ini mode demo, klik link di bawah untuk melihat pratinjau emailnya:
                        </p>
                        <a
                          href={emailPreviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Lihat Pratinjau Email
                        </a>
                      </>
                    ) : (
                      <p className="text-[11px] text-amber-600">
                        Sedang memproses pengiriman ke <b>{newRegEmail}</b>...
                      </p>
                    )}
                  </div>
                </div>

                {/* Custom Output links */}
                <div className="bg-slate-50/70 border border-slate-150 rounded-2xl p-5 text-left max-w-xl mx-auto space-y-4">
                  {/* Whitelabel portal */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 uppercase">
                      <span>1. Website Pelanggan (White-Label Portal)</span>
                      {selectedPlan === 'starter' ? (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-black border border-amber-100">Nonaktif (Starter Plan)</span>
                      ) : (
                        <span className="text-emerald-600 font-extrabold">Online</span>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-700 flex-grow select-all overflow-x-auto whitespace-nowrap">
                        {window.location.protocol}//{window.location.host}/{createdStoreLinks.customerUrl}
                      </div>
                      <button 
                        onClick={() => {
                          setActiveConvectionSlug(registeredSlug);
                          setViewMode('customer');
                          setIsSubsOpen(false);
                          setWizardStep('form');
                          window.scrollTo({ top: 0 });
                        }}
                        className="h-9 px-4 bg-indigo-650 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Kunjungi</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {selectedPlan === 'starter' 
                        ? 'Fitur pemesanan online otomatis berstatus Terkunci/Keluar karena menggunakan Paket Starter. Upgrade ke Growth/Pro untuk mengaktifkannya.' 
                        : selectedPlan === 'growth'
                        ? 'Website khusus pelanggan aktif (dengan tag StitchFlow) untuk estimasi otomatis & WhatsApp redirection.'
                        : 'Website khusus whitelabel premium untuk estimasi otomatis pelanggan Anda & WhatsApp redirection ke nomor admin Anda.'}
                    </p>
                  </div>

                  <div className="h-px bg-slate-200/60" />

                  {/* Owner Dashboard */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 uppercase">
                      <span>2. Dashboard Administrator Owner</span>
                      <span className="text-indigo-600 font-extrabold animate-pulse">Live</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-700 flex-grow select-all overflow-x-auto whitespace-nowrap">
                        {window.location.protocol}//{window.location.host}/{createdStoreLinks.ownerUrl}
                      </div>
                      <button 
                        onClick={() => {
                          setActiveOwnerSlug(registeredSlug);
                          setViewMode('admin');
                          setIsSubsOpen(false);
                          setWizardStep('form');
                          window.scrollTo({ top: 0 });
                        }}
                        className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Buka</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">Gunakan dashboard terproteksi ini untuk melacak status pesanan pelanggan, HPP kain, data pipeline perakitan & rincian pesanan.</p>
                  </div>
                </div>

                {/* Finish actions */}
                <div className="pt-4 flex justify-center gap-3">
                  <button 
                    onClick={() => { setIsSubsOpen(false); setWizardStep('form'); }}
                    className="h-10 px-6 border border-slate-250 hover:bg-slate-50 font-bold text-xs text-slate-650 rounded-xl transition cursor-pointer"
                  >
                    Tutup Wizard
                  </button>
                  <button 
                    onClick={() => {
                      setActiveOwnerSlug(registeredSlug);
                      setViewMode('admin');
                      setIsSubsOpen(false);
                      setWizardStep('form');
                      window.scrollTo({ top: 0 });
                    }}
                    className="h-10 px-6 bg-slate-950 hover:bg-slate-850 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Langsung Buka Dashboard Saya</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm border border-slate-100 shadow-2xl relative overflow-hidden animation-scale-in">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold tracking-tight">Masuk ke Ruang Kerja</h3>
              <button 
                onClick={() => { setIsLoginOpen(false); setLoginError(''); setLoginSlug(''); }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form 
              onSubmit={(e) => handleLogin(e, 'admin')}
              className="p-6 space-y-6"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Domain Slug Anda</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="contoh-konveksi"
                    value={loginSlug}
                    onChange={(e) => { setLoginSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setLoginError(''); }}
                    className={`w-full bg-slate-50 border h-11 pl-3.5 pr-24 text-sm font-mono font-bold rounded-xl focus:outline-none transition text-slate-800 ${loginError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500 focus:bg-white'}`}
                    disabled={isLoginChecking}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                    .stitchflow.id
                  </span>
                </div>
                {loginError ? (
                  <p className="text-[10px] text-red-500 font-bold pt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {loginError}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 pt-1">
                    Masukkan slug URL unik konveksi Anda yang didaftarkan.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoginChecking || !loginSlug}
                  className={`w-full h-11 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md ${
                    isLoginChecking || !loginSlug ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 cursor-pointer'
                  }`}
                >
                  {isLoginChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <LayoutDashboard className="w-4 h-4" />}
                  {isLoginChecking ? 'Memverifikasi...' : 'Masuk sbg Admin / Owner'}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleLogin(e, 'customer')}
                  disabled={isLoginChecking || !loginSlug}
                  className={`w-full h-11 bg-white border border-slate-250 text-indigo-650 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 ${
                    isLoginChecking || !loginSlug ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Lihat Website Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN DOCUMENTS MODAL PORTAL COVERS (PRIVACY, TERMS, SUPPORT, DOCS) */}
      {activeDocModal && (
        <AdminDocumentsModal 
          type={activeDocModal} 
          onClose={() => setActiveDocModal(null)} 
          onSwitchType={(type) => setActiveDocModal(type)} 
        />
      )}

    </div>
  );
}
