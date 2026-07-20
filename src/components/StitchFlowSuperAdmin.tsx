import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { ConvectionConfig } from '../types';
import StitchFlowLogo from './StitchFlowLogo';
import {
  Users,
  TrendingUp,
  CreditCard,
  Package,
  Search,
  Filter,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  DollarSign,
  Building2,
  Crown,
  Zap,
  Star,
  Eye,
  ExternalLink,
  Calendar,
  Activity,
  Layers,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  AlertTriangle,
} from 'lucide-react';

interface TenantWithStats extends ConvectionConfig {
  id: string;
  totalOrderRevenue: number;
  totalOrders: number;
  subscriptionRevenue: number;
}

interface StitchFlowSuperAdminProps {
  onExit: () => void;
}

// ── Form state shape for Create / Edit ──
interface TenantFormState {
  convectionName: string;
  ownerName: string;
  slug: string;
  packageType: 'starter' | 'growth' | 'pro';
  whatsAppPhone: string;
  brandColor: string;
  tagline: string;
  paymentStatus: 'pending' | 'paid' | 'expired';
  paymentMethod: 'card' | 'bank_transfer';
  priceTshirt: string;
  pricePolo: string;
  priceHoodie: string;
  priceWorkshirt: string;
}

const EMPTY_FORM: TenantFormState = {
  convectionName: '',
  ownerName: '',
  slug: '',
  packageType: 'starter',
  whatsAppPhone: '',
  brandColor: 'indigo',
  tagline: '',
  paymentStatus: 'pending',
  paymentMethod: 'bank_transfer',
  priceTshirt: '',
  pricePolo: '',
  priceHoodie: '',
  priceWorkshirt: '',
};

const PLAN_PRICE: Record<string, number> = {
  starter: 199000,
  growth: 399000,
  pro: 699000,
};

const PLAN_COLOR: Record<string, string> = {
  starter: 'text-violet-400 bg-violet-500/15 border-violet-500/30',
  growth: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
  pro: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
};

const PLAN_ICON: Record<string, React.ReactNode> = {
  starter: <Package className="w-3 h-3" />,
  growth: <Zap className="w-3 h-3" />,
  pro: <Crown className="w-3 h-3" />,
};

function formatRp(num: number) {
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)}M`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1)}Jt`;
  if (num >= 1_000) return `Rp ${(num / 1_000).toFixed(0)}rb`;
  return `Rp ${num.toLocaleString('id-ID')}`;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Shared input class ──
const inputCls =
  'w-full bg-slate-50 border border-slate-200 h-9 px-3 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition';
const labelCls = 'block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1';

export default function StitchFlowSuperAdmin({ onExit }: StitchFlowSuperAdminProps) {
  const [tenants, setTenants] = useState<TenantWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'starter' | 'growth' | 'pro'>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'pending' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'revenue' | 'orders'>('date');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // ── CRUD Modal State ──
  const [crudModal, setCrudModal] = useState<'create' | 'edit' | null>(null);
  const [editingTenant, setEditingTenant] = useState<TenantWithStats | null>(null);
  const [formState, setFormState] = useState<TenantFormState>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<TenantWithStats | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Data Fetching ──
  const fetchData = async () => {
    setLoading(true);
    try {
      const convSnap = await getDocs(collection(db, 'convections'));
      const convList: (ConvectionConfig & { id: string })[] = convSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as ConvectionConfig),
      }));

      const ordersSnap = await getDocs(collection(db, 'convection_orders'));
      const allOrders = ordersSnap.docs.map((d) => d.data() as {
        convectionSlug?: string;
        totalAmount?: number;
      });

      const tenantsWithStats: TenantWithStats[] = convList.map((c) => {
        const myOrders = allOrders.filter((o) => o.convectionSlug === c.slug);
        const totalOrderRevenue = myOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const subscriptionRevenue = PLAN_PRICE[c.packageType || 'starter'] || 199000;
        return { ...c, totalOrderRevenue, totalOrders: myOrders.length, subscriptionRevenue };
      });

      setTenants(tenantsWithStats);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('StitchFlow SuperAdmin: fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  // ── CRUD Helpers ──
  const openCreate = () => {
    setFormState(EMPTY_FORM);
    setFormError('');
    setEditingTenant(null);
    setCrudModal('create');
  };

  const openEdit = (t: TenantWithStats) => {
    setFormState({
      convectionName: t.convectionName || '',
      ownerName: t.ownerName || '',
      slug: t.slug || '',
      packageType: t.packageType || 'starter',
      whatsAppPhone: t.whatsAppPhone || '',
      brandColor: t.brandColor || 'indigo',
      tagline: t.tagline || '',
      paymentStatus: t.paymentStatus || 'pending',
      paymentMethod: t.paymentMethod || 'bank_transfer',
      priceTshirt: String(t.prices?.tshirt || ''),
      pricePolo: String(t.prices?.polo || ''),
      priceHoodie: String(t.prices?.hoodie || ''),
      priceWorkshirt: String(t.prices?.workshirt || ''),
    });
    setFormError('');
    setEditingTenant(t);
    setCrudModal('edit');
  };

  const closeModal = () => {
    setCrudModal(null);
    setEditingTenant(null);
    setFormError('');
  };

  const validateForm = (): string | null => {
    if (!formState.convectionName.trim()) return 'Nama konveksi wajib diisi.';
    if (!formState.ownerName.trim()) return 'Nama pemilik wajib diisi.';
    if (!formState.slug.trim()) return 'Slug wajib diisi.';
    if (!/^[a-z0-9-]+$/.test(formState.slug.trim()))
      return 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.';
    return null;
  };

  const buildDocData = (): Partial<ConvectionConfig> => ({
    convectionName: formState.convectionName.trim(),
    ownerName: formState.ownerName.trim(),
    slug: formState.slug.trim(),
    packageType: formState.packageType,
    whatsAppPhone: formState.whatsAppPhone.trim(),
    brandColor: formState.brandColor.trim(),
    tagline: formState.tagline.trim(),
    paymentStatus: formState.paymentStatus,
    paymentMethod: formState.paymentMethod,
    prices: {
      tshirt: Number(formState.priceTshirt) || 0,
      polo: Number(formState.pricePolo) || 0,
      hoodie: Number(formState.priceHoodie) || 0,
      workshirt: Number(formState.priceWorkshirt) || 0,
    },
  });

  const handleCreateTenant = async () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    // Check slug uniqueness
    const slugExists = tenants.some((t) => t.slug === formState.slug.trim());
    if (slugExists) { setFormError('Slug sudah digunakan oleh tenant lain.'); return; }

    setFormLoading(true);
    setFormError('');
    try {
      await addDoc(collection(db, 'convections'), {
        ...buildDocData(),
        createdAt: Date.now(),
      });
      closeModal();
      await fetchData();
    } catch (e: any) {
      setFormError(`Gagal membuat tenant: ${e.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTenant = async () => {
    if (!editingTenant) return;
    const err = validateForm();
    if (err) { setFormError(err); return; }
    // Check slug uniqueness (excluding self)
    const slugExists = tenants.some(
      (t) => t.slug === formState.slug.trim() && t.id !== editingTenant.id
    );
    if (slugExists) { setFormError('Slug sudah digunakan oleh tenant lain.'); return; }

    setFormLoading(true);
    setFormError('');
    try {
      await updateDoc(doc(db, 'convections', editingTenant.id), buildDocData());
      closeModal();
      await fetchData();
    } catch (e: any) {
      setFormError(`Gagal memperbarui tenant: ${e.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTenant = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, 'convections', deleteTarget.id));
      setDeleteTarget(null);
      await fetchData();
    } catch (e: any) {
      console.error('Delete error:', e);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Derived Stats ──
  const totalRevenueSubs = tenants.reduce((s, t) => s + t.subscriptionRevenue, 0);
  const totalRevenueOrders = tenants.reduce((s, t) => s + t.totalOrderRevenue, 0);
  const paidCount = tenants.filter((t) => t.paymentStatus === 'paid').length;
  const pendingCount = tenants.filter((t) => !t.paymentStatus || t.paymentStatus === 'pending').length;
  const planDistribution = {
    starter: tenants.filter((t) => t.packageType === 'starter').length,
    growth: tenants.filter((t) => t.packageType === 'growth').length,
    pro: tenants.filter((t) => !t.packageType || t.packageType === 'pro').length,
  };

  // ── Filtering / Sorting ──
  const filtered = tenants
    .filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        t.convectionName?.toLowerCase().includes(q) ||
        t.ownerName?.toLowerCase().includes(q) ||
        t.slug?.toLowerCase().includes(q);
      const matchPlan = filterPlan === 'all' || (t.packageType || 'pro') === filterPlan;
      const effectivePayment = t.paymentStatus || 'pending';
      const matchPayment = filterPayment === 'all' || effectivePayment === filterPayment;
      return matchSearch && matchPlan && matchPayment;
    })
    .sort((a, b) => {
      let va = 0, vb = 0;
      if (sortBy === 'date') { va = a.createdAt; vb = b.createdAt; }
      if (sortBy === 'revenue') { va = a.totalOrderRevenue; vb = b.totalOrderRevenue; }
      if (sortBy === 'orders') { va = a.totalOrders; vb = b.totalOrders; }
      return sortDir === 'desc' ? vb - va : va - vb;
    });

  const toggleSort = (col: 'date' | 'revenue' | 'orders') => {
    if (sortBy === col) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortBy(col); setSortDir('desc'); }
  };

  // ── Form field updater helper ──
  const setField = (key: keyof TenantFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormState((prev) => ({ ...prev, [key]: e.target.value }));
      setFormError('');
    };

  // ────────────────────────────────────────────
  // PIN Screen
  // ────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 font-sans relative overflow-hidden">
        <div className="w-full max-w-sm bg-white border border-slate-200 p-8 rounded-3xl text-center relative z-10 shadow-xl">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-100">
            <Crown className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold mb-2 text-slate-900">Admin Console</h1>
          <p className="text-sm text-slate-500 mb-8">Masukkan PIN keamanan untuk mengakses data platform StitchFlow.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pinInput === 'admin123') {
                setIsAuthenticated(true);
              } else {
                setPinError(true);
                setPinInput('');
              }
            }}
            className="space-y-4"
          >
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
                className={`w-full bg-slate-50 border h-12 px-4 rounded-xl text-center tracking-[0.5em] text-lg text-slate-900 focus:outline-none focus:bg-white transition-all ${pinError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'}`}
                autoFocus
              />
              {pinError && <p className="text-red-500 text-xs mt-2 font-bold flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3" /> PIN tidak valid.</p>}
            </div>

            <button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-md">
              Buka Kunci
            </button>
            <button type="button" onClick={onExit} className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer mt-2">
              ← Kembali ke Halaman Utama
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────
  // Main Dashboard
  // ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Landing</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <StitchFlowLogo size="sm" variant="colored" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
              SUPER ADMIN CONSOLE
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Last updated: {lastRefreshed.toLocaleTimeString('id-ID')}</span>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer text-slate-700 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">

        {/* ── PAGE TITLE ── */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Overview</h1>
          <p className="text-sm text-slate-500">Monitoring semua tenant konveksi yang berlangganan StitchFlow SaaS.</p>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Subscriber',
              value: loading ? '—' : `${tenants.length}`,
              sub: `${paidCount} aktif · ${pendingCount} pending`,
              icon: <Users className="w-5 h-5" />,
              color: 'from-indigo-600/20 to-indigo-600/5 border-indigo-500/20',
              iconColor: 'text-indigo-400',
            },
            {
              label: 'Monthly Sub Revenue',
              value: loading ? '—' : formatRp(totalRevenueSubs),
              sub: 'Total langganan aktif/bln',
              icon: <CreditCard className="w-5 h-5" />,
              color: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20',
              iconColor: 'text-emerald-400',
            },
            {
              label: 'Total Order Value',
              value: loading ? '—' : formatRp(totalRevenueOrders),
              sub: 'Aggregate dari semua tenant',
              icon: <TrendingUp className="w-5 h-5" />,
              color: 'from-amber-600/20 to-amber-600/5 border-amber-500/20',
              iconColor: 'text-amber-400',
            },
            {
              label: 'Total Order Volume',
              value: loading ? '—' : `${tenants.reduce((s, t) => s + t.totalOrders, 0)}`,
              sub: 'Across all convection tenants',
              icon: <BarChart3 className="w-5 h-5" />,
              color: 'from-violet-600/20 to-violet-600/5 border-violet-500/20',
              iconColor: 'text-violet-400',
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`bg-white shadow-sm border border-slate-200 rounded-2xl p-5 space-y-3`}
            >
              <div className={`w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center ${card.iconColor}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-slate-900">{card.value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold mt-0.5">{card.label}</p>
                <p className="text-[11px] text-slate-400 mt-1">{card.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── PLAN DISTRIBUTION BAR ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Distribusi Paket Berlangganan</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Breakdown semua tenant aktif berdasarkan tier</p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          {loading ? (
            <div className="h-8 bg-slate-100 rounded-full animate-pulse" />
          ) : (
            <div className="space-y-3">
              {tenants.length > 0 && (
                <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                  {planDistribution.starter > 0 && (
                    <div
                      style={{ width: `${(planDistribution.starter / tenants.length) * 100}%` }}
                      className="bg-violet-500 h-full rounded-l-full transition-all"
                      title={`Starter: ${planDistribution.starter}`}
                    />
                  )}
                  {planDistribution.growth > 0 && (
                    <div
                      style={{ width: `${(planDistribution.growth / tenants.length) * 100}%` }}
                      className="bg-sky-500 h-full transition-all"
                      title={`Growth: ${planDistribution.growth}`}
                    />
                  )}
                  {planDistribution.pro > 0 && (
                    <div
                      style={{ width: `${(planDistribution.pro / tenants.length) * 100}%` }}
                      className="bg-indigo-500 h-full rounded-r-full transition-all"
                      title={`Pro: ${planDistribution.pro}`}
                    />
                  )}
                </div>
              )}

              <div className="flex gap-6 text-xs">
                {[
                  { label: 'Starter', count: planDistribution.starter, color: 'bg-violet-500', price: 'Rp 199rb/bln' },
                  { label: 'Growth', count: planDistribution.growth, color: 'bg-sky-500', price: 'Rp 399rb/bln' },
                  { label: 'Pro', count: planDistribution.pro, color: 'bg-indigo-500', price: 'Rp 699rb/bln' },
                ].map((p) => (
                  <div key={p.label} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-sm ${p.color}`} />
                    <span className="text-slate-800 font-semibold">{p.label}</span>
                    <span className="text-slate-500">{p.count} tenant · {p.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── SUBSCRIBER TABLE ── */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">

          {/* Table toolbar */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2 text-slate-900">
                <Building2 className="w-4 h-4 text-slate-400" />
                Daftar Tenant Konveksi
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">{filtered.length} dari {tenants.length} konveksi terdaftar</p>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama / slug..."
                  className="bg-slate-50 border border-slate-200 h-8 pl-8 pr-3 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white w-44 transition"
                />
              </div>

              {/* Plan filter */}
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value as typeof filterPlan)}
                className="bg-slate-50 border border-slate-200 h-8 px-3 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer"
              >
                <option value="all">Semua Paket</option>
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="pro">Pro</option>
              </select>

              {/* Payment filter */}
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value as typeof filterPayment)}
                className="bg-slate-50 border border-slate-200 h-8 px-3 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="paid">Lunas</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>

              {/* ── + Tambah Tenant button ── */}
              <button
                id="btn-tambah-tenant"
                onClick={openCreate}
                className="flex items-center gap-1.5 h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 rounded-lg transition cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Tenant
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Memuat data tenant...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Tidak ada tenant ditemukan</p>
              <button
                onClick={openCreate}
                className="mt-4 flex items-center gap-1.5 mx-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Tenant Pertama
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Konveksi</th>
                    <th className="px-4 py-3 text-left">Paket</th>
                    <th className="px-4 py-3 text-left">Pembayaran</th>
                    <th
                      className="px-4 py-3 text-right cursor-pointer hover:text-slate-800 transition select-none"
                      onClick={() => toggleSort('date')}
                    >
                      <span className="flex items-center justify-end gap-1">
                        Tgl Daftar
                        {sortBy === 'date' ? (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />) : null}
                      </span>
                    </th>
                    <th
                      className="px-4 py-3 text-right cursor-pointer hover:text-slate-800 transition select-none"
                      onClick={() => toggleSort('orders')}
                    >
                      <span className="flex items-center justify-end gap-1">
                        Total Order
                        {sortBy === 'orders' ? (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />) : null}
                      </span>
                    </th>
                    <th
                      className="px-4 py-3 text-right cursor-pointer hover:text-slate-800 transition select-none"
                      onClick={() => toggleSort('revenue')}
                    >
                      <span className="flex items-center justify-end gap-1">
                        Omset Tenant
                        {sortBy === 'revenue' ? (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />) : null}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-right">Sub Revenue</th>
                    <th className="px-5 py-3 text-center">Detail</th>
                    {/* ── Aksi column ── */}
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((tenant, i) => {
                      const plan = tenant.packageType || 'pro';
                      const payStatus = tenant.paymentStatus || 'pending';
                      const isExpanded = expandedTenant === tenant.id;

                      return (
                        <React.Fragment key={tenant.id}>
                          <motion.tr
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                          >
                            {/* Konveksi Info */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-[10px] flex-shrink-0">
                                  {(tenant.convectionName || '?').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{tenant.convectionName}</p>
                                  <p className="text-[10px] text-slate-500">{tenant.ownerName} · <span className="font-mono text-slate-600">{tenant.slug}</span></p>
                                </div>
                              </div>
                            </td>

                            {/* Plan Badge */}
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${PLAN_COLOR[plan]}`}>
                                {PLAN_ICON[plan]}
                                {plan.charAt(0).toUpperCase() + plan.slice(1)}
                              </span>
                            </td>

                            {/* Payment Status */}
                            <td className="px-4 py-4">
                              {payStatus === 'paid' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                                  <CheckCircle className="w-3 h-3" />
                                  Lunas
                                </span>
                              ) : payStatus === 'expired' ? (
                                <span className="inline-flex items-center gap-1 text-rose-600 text-[10px] font-bold">
                                  <AlertCircle className="w-3 h-3" />
                                  Expired
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </span>
                              )}
                              {tenant.paymentMethod && (
                                <p className="text-[9px] text-slate-500 mt-0.5 capitalize">
                                  {tenant.paymentMethod === 'card' ? '💳 Kartu' : '🏦 Transfer'}
                                </p>
                              )}
                            </td>

                            {/* Date */}
                            <td className="px-4 py-4 text-right text-slate-500 font-mono text-[11px]">
                              {formatDate(tenant.createdAt)}
                            </td>

                            {/* Order count */}
                            <td className="px-4 py-4 text-right">
                              <span className="text-slate-900 font-bold">{tenant.totalOrders}</span>
                              <span className="text-slate-500 ml-1 text-[10px]">order</span>
                            </td>

                            {/* Omset tenant */}
                            <td className="px-4 py-4 text-right">
                              <span className="text-emerald-600 font-bold font-mono">{formatRp(tenant.totalOrderRevenue)}</span>
                            </td>

                            {/* Sub revenue */}
                            <td className="px-4 py-4 text-right">
                              <span className="text-indigo-600 font-mono font-bold text-[11px]">
                                {formatRp(tenant.subscriptionRevenue)}/bln
                              </span>
                            </td>

                            {/* Expand button */}
                            <td className="px-5 py-4 text-center">
                              <button
                                onClick={() => setExpandedTenant(isExpanded ? null : tenant.id)}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center mx-auto transition cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-indigo-600" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                              </button>
                            </td>

                            {/* ── Aksi: Edit + Delete ── */}
                            <td className="px-4 py-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  id={`btn-edit-${tenant.id}`}
                                  onClick={() => openEdit(tenant)}
                                  title="Edit tenant"
                                  className="w-7 h-7 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 flex items-center justify-center transition cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-sky-600" />
                                </button>
                                <button
                                  id={`btn-delete-${tenant.id}`}
                                  onClick={() => setDeleteTarget(tenant)}
                                  title="Hapus tenant"
                                  className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-center transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>

                          {/* Expanded detail row */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.tr
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                key={`${tenant.id}-expanded`}
                              >
                                <td colSpan={9} className="px-0 py-0">
                                  <div className="bg-indigo-50/50 border-t border-b border-indigo-100 px-6 py-5">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                      <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">WhatsApp Admin</p>
                                        <p className="text-slate-700 font-mono">+{tenant.whatsAppPhone || '—'}</p>
                                      </div>
                                      <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Brand Color</p>
                                        <p className="text-slate-700 capitalize">{tenant.brandColor || 'indigo'}</p>
                                      </div>
                                      <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Tgl Bayar</p>
                                        <p className="text-slate-700 font-mono">{tenant.paymentDate ? formatDate(tenant.paymentDate) : '—'}</p>
                                      </div>
                                      <div className="space-y-0.5">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Aktif Hingga</p>
                                        <p className="text-emerald-600 font-mono font-bold">
                                          {tenant.subscriptionExpiry ? formatDate(tenant.subscriptionExpiry) : '—'}
                                        </p>
                                      </div>
                                      <div className="space-y-0.5 md:col-span-4">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Tagline</p>
                                        <p className="text-slate-600 italic">"{tenant.tagline || 'Tidak ada tagline'}"</p>
                                      </div>
                                      <div className="space-y-1.5 md:col-span-4">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Harga Produk (IDR/pcs)</p>
                                        <div className="flex flex-wrap gap-3">
                                          {[
                                            { label: 'T-Shirt', val: tenant.prices?.tshirt },
                                            { label: 'Polo', val: tenant.prices?.polo },
                                            { label: 'Hoodie', val: tenant.prices?.hoodie },
                                            { label: 'Kemeja', val: tenant.prices?.workshirt },
                                          ].map((p) => (
                                            <div key={p.label} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                                              <span className="text-slate-500">{p.label}: </span>
                                              <span className="font-mono font-bold text-slate-800">Rp {p.val?.toLocaleString('id-ID') || '—'}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="flex gap-3 md:col-span-4 pt-1">
                                        <a
                                          href={`?c=${tenant.slug}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          Buka Portal Pelanggan
                                        </a>
                                        <span className="text-slate-300">|</span>
                                        <a
                                          href={`?owner=${tenant.slug}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-800 transition"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          Buka Dashboard Owner
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Table footer summary */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 bg-slate-50">
              <span>{filtered.length} tenant ditampilkan</span>
              <div className="flex gap-6">
                <span>
                  Total Omset Semua Tenant:{' '}
                  <span className="text-emerald-600 font-bold font-mono">
                    {formatRp(filtered.reduce((s, t) => s + t.totalOrderRevenue, 0))}
                  </span>
                </span>
                <span>
                  Sub Revenue Terfilter:{' '}
                  <span className="text-indigo-600 font-bold font-mono">
                    {formatRp(filtered.reduce((s, t) => s + t.subscriptionRevenue, 0))}/bln
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="text-center text-[11px] text-slate-400 pb-8">
          StitchFlow Super Admin Console · Internal Use Only · {new Date().getFullYear()}
        </div>
      </main>

      {/* ═══════════════════════════════════════════
          CRUD MODAL — Create / Edit
      ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {crudModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${crudModal === 'create' ? 'bg-indigo-50' : 'bg-sky-50'}`}>
                    {crudModal === 'create'
                      ? <Plus className="w-4 h-4 text-indigo-600" />
                      : <Edit2 className="w-4 h-4 text-sky-600" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {crudModal === 'create' ? 'Tambah Tenant Baru' : 'Edit Tenant'}
                    </h3>
                    {crudModal === 'edit' && editingTenant && (
                      <p className="text-[10px] text-slate-500">{editingTenant.convectionName} · <span className="font-mono">{editingTenant.slug}</span></p>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Modal Body — scrollable */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                {/* Error Banner */}
                {formError && (
                  <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-xs text-rose-700">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    {formError}
                  </div>
                )}

                {/* Section: Identitas */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Identitas Konveksi</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Nama Konveksi *</label>
                      <input id="form-convectionName" value={formState.convectionName} onChange={setField('convectionName')} placeholder="Konveksi Maju Jaya" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Nama Pemilik *</label>
                      <input id="form-ownerName" value={formState.ownerName} onChange={setField('ownerName')} placeholder="Budi Santoso" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Slug * (unik, huruf kecil)</label>
                      <input
                        id="form-slug"
                        value={formState.slug}
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                          setFormState((p) => ({ ...p, slug: val }));
                          setFormError('');
                        }}
                        placeholder="konveksi-maju-jaya"
                        className={`${inputCls} font-mono`}
                        disabled={crudModal === 'edit'} // Slug immutable after create
                      />
                      {crudModal === 'edit' && (
                        <p className="text-[9px] text-amber-600 mt-1">Slug tidak dapat diubah setelah dibuat.</p>
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>Tagline</label>
                      <input id="form-tagline" value={formState.tagline} onChange={setField('tagline')} placeholder="Kualitas terbaik, harga bersahabat" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>WhatsApp Admin</label>
                      <input id="form-whatsAppPhone" value={formState.whatsAppPhone} onChange={setField('whatsAppPhone')} placeholder="628123456789" className={`${inputCls} font-mono`} />
                    </div>
                    <div>
                      <label className={labelCls}>Brand Color</label>
                      <select id="form-brandColor" value={formState.brandColor} onChange={setField('brandColor')} className={inputCls}>
                        {['indigo', 'sky', 'emerald', 'rose', 'amber', 'violet', 'slate'].map((c) => (
                          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                {/* Section: Berlangganan */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Paket & Pembayaran</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Paket</label>
                      <select id="form-packageType" value={formState.packageType} onChange={setField('packageType')} className={inputCls}>
                        <option value="starter">Starter — Rp 199rb/bln</option>
                        <option value="growth">Growth — Rp 399rb/bln</option>
                        <option value="pro">Pro — Rp 699rb/bln</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Status Pembayaran</label>
                      <select id="form-paymentStatus" value={formState.paymentStatus} onChange={setField('paymentStatus')} className={inputCls}>
                        <option value="pending">Pending</option>
                        <option value="paid">Lunas</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Metode Bayar</label>
                      <select id="form-paymentMethod" value={formState.paymentMethod} onChange={setField('paymentMethod')} className={inputCls}>
                        <option value="bank_transfer">🏦 Transfer Bank</option>
                        <option value="card">💳 Kartu</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                {/* Section: Harga Produk */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Harga Produk (IDR/pcs)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'priceTshirt' as const, label: 'T-Shirt', placeholder: '75000' },
                      { key: 'pricePolo' as const, label: 'Polo Shirt', placeholder: '85000' },
                      { key: 'priceHoodie' as const, label: 'Hoodie', placeholder: '130000' },
                      { key: 'priceWorkshirt' as const, label: 'Kemeja', placeholder: '95000' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className={labelCls}>{label}</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span>
                          <input
                            id={`form-${key}`}
                            type="number"
                            min="0"
                            value={formState[key]}
                            onChange={setField(key)}
                            placeholder={placeholder}
                            className={`${inputCls} pl-8`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
                <button
                  onClick={closeModal}
                  disabled={formLoading}
                  className="h-9 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  id={crudModal === 'create' ? 'btn-save-create' : 'btn-save-edit'}
                  onClick={crudModal === 'create' ? handleCreateTenant : handleUpdateTenant}
                  disabled={formLoading}
                  className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {formLoading
                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    : <Save className="w-3.5 h-3.5" />}
                  {crudModal === 'create' ? 'Buat Tenant' : 'Simpan Perubahan'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget && !deleteLoading) setDeleteTarget(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 pb-0 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hapus Tenant?</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Anda akan menghapus <span className="font-bold text-slate-800">{deleteTarget.convectionName}</span> secara permanen.
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>

              {/* Info box */}
              <div className="mx-6 mt-4 bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-700 space-y-1">
                <p className="font-bold">Data yang akan dihapus:</p>
                <ul className="list-disc list-inside space-y-0.5 text-rose-600">
                  <li>Profil konveksi: <span className="font-mono">{deleteTarget.slug}</span></li>
                  <li>Pemilik: {deleteTarget.ownerName}</li>
                  <li>Paket: {deleteTarget.packageType || 'starter'}</li>
                </ul>
                <p className="text-rose-500 text-[10px] mt-2">
                  ⚠️ Data order yang sudah ada tidak akan ikut terhapus.
                </p>
              </div>

              {/* Footer */}
              <div className="p-6 flex items-center justify-end gap-3">
                <button
                  id="btn-cancel-delete"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleteLoading}
                  className="h-9 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  id="btn-confirm-delete"
                  onClick={handleDeleteTenant}
                  disabled={deleteLoading}
                  className="h-9 px-5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {deleteLoading
                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />}
                  Ya, Hapus Permanen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
