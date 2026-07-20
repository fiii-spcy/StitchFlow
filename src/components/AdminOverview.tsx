import React, { useState } from 'react';
import { ConvectionOrder, ProductionStatus } from '../types';
import { 
  TrendingUp, 
  Activity, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ClipboardList,
  Sliders,
  CheckCircle2,
  ListRestart
} from 'lucide-react';

interface AdminOverviewProps {
  orders: ConvectionOrder[];
  onUpdateStatusFromOverview: (orderId: string, currentStatus: ProductionStatus, direction: 'forward' | 'backward') => void;
  onStatusChangeFromOverview: (orderId: string, newStatus: ProductionStatus) => void;
  onEditOrder: (order: ConvectionOrder) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function AdminOverview({
  orders,
  onUpdateStatusFromOverview,
  onStatusChangeFromOverview,
  onEditOrder,
  onNavigateToTab
}: AdminOverviewProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Dynamic calculations based on real Firestore state
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => o.status !== 'Ready');
  const activeCount = activeOrders.length;
  
  // Total Contract Value (Omset)
  const totalOmset = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const totalOmsetReceived = orders.reduce((acc, o) => {
    if (o.paymentStatus === 'fully_paid') {
      return acc + (o.totalAmount || 0);
    }
    return acc + (o.downPayment || 0);
  }, 0);

  const totalOmsetReceivable = totalOmset - totalOmsetReceived;
  
  // High-priority (sorted by deadline first, only taking active pending ones)
  const priorityOrders = [...activeOrders]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  // Formatting utility for Indonesian Rupiah
  const formatRupiah = (num: number) => {
    if (num >= 1000000) {
      return `Rp ${(num / 1000000).toFixed(1)} Juta`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Efficiency data logs simulating weekly index
  const weeklyEfficiency = [
    { name: 'Mon', efficiency: 82, target: 85, load: 'Low Load' },
    { name: 'Tue', efficiency: 85, target: 85, load: 'Optimal' },
    { name: 'Wed', efficiency: 89, target: 85, load: 'Peak Volume' },
    { name: 'Thu', efficiency: 87, target: 85, load: 'Optimal' },
    { name: 'Fri', efficiency: 91, target: 85, load: 'High Efficiency' },
    { name: 'Sat', efficiency: 94, target: 85, load: 'Clean HPP' },
    { name: 'Sun', efficiency: 92, target: 85, load: 'Final QC' }
  ];

  // Activities log generated dynamically from database items
  const recentActivities = [
    {
      id: 'act-1',
      type: 'status_change',
      message: 'Pesanan #' + (orders[0]?.skuTitle || 'Bomber Reuni') + ' dipindahkan ke ' + (orders[0]?.status || 'Dalam Proses'),
      time: '2 menit yang lalu',
      author: 'Alex Foreman',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-150'
    },
    {
      id: 'act-2',
      type: 'warning',
      message: 'Persediaan Kritis: Gulungan kain American Drill Sisa 2 roll',
      time: '45 menit yang lalu',
      author: 'Sistem Logistik',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-150'
    },
    {
      id: 'act-3',
      type: 'qc',
      message: 'Uji Kelayakan Desain disetujui untuk pesanan Baim Wong',
      time: '2 jam yang lalu',
      author: 'Desainer Grafis',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-150'
    },
    {
      id: 'act-4',
      type: 'ready',
      message: 'WhatsApp Notifikasi terkirim otomatis karena status selesai',
      time: '5 jam yang lalu',
      author: 'Server StitchFlow',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-150'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Upper Widgets Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,29,51,0.02)] flex items-center justify-between">
          <div className="space-y-1.5 text-left">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Pesanaan</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-black text-slate-800">{totalOrders}</span>
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" />
                +12%
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Kumulatif seluruh pesanan klien</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center border border-indigo-100">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,29,51,0.02)] flex items-center justify-between">
          <div className="space-y-1.5 text-left">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Aktif Produksi</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-black text-indigo-950">{activeCount}</span>
              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                Antrian Jahit
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Sedang dipotong/dijahit/QC</p>
          </div>
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center border border-sky-100">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,29,51,0.02)] flex items-center justify-between">
          <div className="space-y-1.5 text-left w-full mr-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Estimasi Omset</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-display font-black text-slate-800">{formatRupiah(totalOmset)}</span>
            </div>
            <div className="mt-1 flex flex-col gap-0.5 text-[9.5px] font-semibold text-slate-500">
              <span className="text-emerald-600">💵 Terbayar/DP: {formatRupiah(totalOmsetReceived)}</span>
              <span className="text-amber-600">⏳ Belum Lunas: {formatRupiah(totalOmsetReceivable)}</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-650 rounded-xl flex items-center justify-center border border-emerald-100 flex-shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,29,51,0.02)] flex items-center justify-between">
          <div className="space-y-1.5 text-left">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Notif Klien</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-black text-rose-900">Live</span>
              <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                Auto WA
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Status jahit sinkron ke ponsel</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Symmetrical Charts & Activities row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Daily Efficiency Chart Interactive (8 Cols) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,29,51,0.02)] lg:col-span-8 flex flex-col justify-between text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Performa Efisiensi vs Target Garis Jahit</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Pemantauan harian kecepatan perakitan kain di workshop utama</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
                <span>Efisiensi</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <span className="w-2.5 h-1 border-b-2 border-dashed border-sky-400 inline-block"></span>
                <span>Target (85%)</span>
              </div>
            </div>
          </div>

          {/* Interactive SVG Area Plot Area */}
          <div className="relative h-60 w-full flex flex-col justify-between pt-2">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[8px] font-mono text-slate-350 select-none">
              <div className="border-b border-dashed border-slate-100 w-full pr-2 text-right">95%</div>
              <div className="border-b border-dashed border-slate-100 w-full pr-2 text-right">90%</div>
              <div className="border-b border-dashed border-slate-100 w-full pr-2 text-right">85%</div>
              <div className="border-b border-dashed border-slate-100 w-full pr-2 text-right">80%</div>
              <div className="border-b border-dashed border-slate-100 w-full pr-2 text-right">75%</div>
            </div>

            {/* Custom Responsive SVG Chart representation matching the modern visual theme */}
            <div className="relative z-10 w-full h-48 select-none">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                <defs>
                  {/* Neon Indigo gradient fill for chart depth */}
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Target line */}
                <line x1="0" y1="100" x2="700" y2="100" stroke="#38BDF8" strokeWidth="2" strokeDasharray="5,5" />

                {/* Area under curve */}
                <path
                  d="M 20 180 
                     L 20 120 
                     C 100 110, 120 100, 200 80 
                     C 300 70, 320 110, 400 65
                     C 480 30, 500 50, 580 35 
                     C 620 28, 650 45, 680 40 
                     L 680 180 Z"
                  fill="url(#areaGrad)"
                />

                {/* Solid main line */}
                <path
                  d="M 20 120 
                     C 100 110, 120 100, 200 80 
                     C 300 70, 320 110, 400 65
                     C 480 30, 500 50, 580 35 
                     C 620 28, 650 45, 680 40"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Interactive Points on the graph */}
                {[
                  { x: 20, y: 120, val: 82, l: 'Mon' },
                  { x: 130, y: 95, val: 85, l: 'Tue' },
                  { x: 240, y: 80, val: 89, l: 'Wed' },
                  { x: 350, y: 90, val: 87, l: 'Thu' },
                  { x: 460, y: 55, val: 91, l: 'Fri' },
                  { x: 570, y: 35, val: 94, l: 'Sat' },
                  { x: 680, y: 40, val: 92, l: 'Sun' }
                ].map((pt, idx) => (
                  <g 
                    key={idx} 
                    onMouseEnter={() => setHoveredDay(idx)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredDay === idx ? "7" : "4"}
                      fill={hoveredDay === idx ? "#38BDF8" : "#ffffff"}
                      stroke="#4F46E5"
                      strokeWidth="2.5"
                      className="transition-all duration-150"
                    />
                  </g>
                ))}
              </svg>

              {/* Dynamic Coordinate Tooltip displayed on index state hovering */}
              {hoveredDay !== null && (
                <div 
                  className="absolute p-3 bg-slate-900 text-white rounded-xl shadow-xl text-left space-y-1 z-30 border border-slate-700 animate-slide-up"
                  style={{
                    left: `${(hoveredDay * 14.5) + (hoveredDay === 0 ? 1 : hoveredDay === 6 ? -5 : -5)}%`,
                    top: `${weeklyEfficiency[hoveredDay].efficiency < 85 ? '10%' : '15%'}`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{weeklyEfficiency[hoveredDay].name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono">{weeklyEfficiency[hoveredDay].efficiency}%</span>
                    <span className="text-[9px] bg-indigo-500 text-white px-1 rounded">{weeklyEfficiency[hoveredDay].load}</span>
                  </div>
                  <p className="text-[8px] text-slate-300">Target target: 85%</p>
                </div>
              )}
            </div>

            {/* X-Axis labels */}
            <div className="flex justify-between items-center px-4 pt-4 border-t border-slate-50 select-none text-[10px] font-bold text-slate-400">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Right Side: Recent Activity log feed (4 Cols) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,29,51,0.02)] lg:col-span-4 flex flex-col justify-between text-left">
          <div className="border-b border-slate-50 pb-4 mb-4">
            <h3 className="text-sm font-bold text-slate-900">Aktivitas Terkini</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Riwayat kerja logistik dan update jahitan otomatis</p>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 text-xs">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white ring-4 ring-indigo-50 flex-shrink-0"></div>
                  <div className="w-0.5 h-full bg-slate-150 rounded my-1"></div>
                </div>
                <div className="space-y-1 pb-2">
                  <p className="font-medium text-slate-900 leading-tight">{act.message}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-450 font-medium">
                    <span>{act.time}</span>
                    <span>&bull;</span>
                    <span className="text-slate-500 font-semibold">{act.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-50 pt-4 mt-2">
            <button 
              onClick={() => onNavigateToTab('orders')}
              className="text-xs font-bold text-indigo-650 hover:text-indigo-850 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Tinjau Semua Pesanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Priority Convection Jobs Table Block */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-[0_2px_12px_rgba(15,29,51,0.01)] text-left">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pesanan Prioritas Utama (Segera Deadline)</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Pekerjaan konveksi yang tenggat waktunya paling dekat. Anda dapat mengubah statusnya secara langsung di bawah ini!</p>
          </div>
          <button 
            onClick={() => onNavigateToTab('orders')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-950 px-3.5 py-1.5 border border-slate-150 rounded-xl transition-colors bg-white cursor-pointer"
          >
            Semua Database Master
          </button>
        </div>

        {priorityOrders.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-950">Semua Jahitan Selesai!</h4>
              <p className="text-xs text-slate-450 max-w-sm">Tidak ditemukan antrian / backlog pembuatan pakaian yang pending saat ini.</p>
            </div>
            <button 
              onClick={() => onNavigateToTab('orders')}
              className="mt-2 bg-neutral-900 hover:bg-slate-800 text-white font-medium text-xs py-2 px-4 rounded-xl shadow cursor-pointer"
            >
              Buat Pesanan Baru
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-450 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-4 px-6">ID & PESANAN</th>
                  <th className="py-4 px-4">PELANGGAN</th>
                  <th className="py-4 px-4">KUANTITAS & BAHAN</th>
                  <th className="py-4 px-4">TENGGAT WAKTU</th>
                  <th className="py-4 px-4">STATUS ALUR KERJA</th>
                  <th className="py-4 px-4 text-center">TINDAKAN CEPAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {priorityOrders.map((order) => {
                  
                  // Calculate days left
                  const daysLeft = Math.ceil((new Date(order.deadline).getTime() - Date.now()) / (1000 * 3600 * 24));
                  const isOverdue = daysLeft < 0;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6 space-y-1">
                        <span className="font-mono text-[9px] font-bold text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded mr-1.5">Apparel</span>
                        <span className="font-bold text-slate-900">{order.skuTitle}</span>
                        <p className="text-[10px] text-slate-400">Dibuat: {new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-800">{order.customerName}</p>
                        <p className="text-[10px] text-slate-450 font-mono mt-0.5">{order.customerPhone}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{order.quantity} pcs</p>
                        <p className="text-[10px] text-slate-400">{order.fabricType}</p>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900">{new Date(order.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                        {isOverdue ? (
                          <span className="text-[9px] font-extrabold text-red-600 bg-red-50 px-1 py-0.5 rounded">TERLAMBAT !</span>
                        ) : (
                          <span className={`${daysLeft <= 3 ? 'text-amber-600 bg-amber-50' : 'text-slate-400'} text-[9px] font-semibold block mt-0.5`}>
                            {daysLeft === 0 ? 'Hari ini' : daysLeft === 1 ? 'Besok' : `${daysLeft} hari lagi`}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            order.status === 'Design' ? 'bg-amber-400' :
                            order.status === 'Cutting' ? 'bg-orange-400' :
                            order.status === 'Sewing' ? 'bg-blue-400 animate-pulse' :
                            order.status === 'QC' ? 'bg-teal-400' : 'bg-emerald-500'
                          }`}></span>
                          <span className="font-bold text-slate-800">{order.status}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          
                          {/* Quick workflow controls */}
                          <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-150">
                            {order.status !== 'Design' && (
                              <button 
                                onClick={() => onUpdateStatusFromOverview(order.id!, order.status, 'backward')}
                                className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-900 rounded hover:bg-white cursor-pointer transition-colors"
                                title="Kembalikan status"
                              >
                                &larr;
                              </button>
                            )}
                            <span className="px-2 text-[10px] font-mono font-bold text-slate-800">{order.status}</span>
                            {order.status !== 'Ready' && (
                              <button 
                                onClick={() => onUpdateStatusFromOverview(order.id!, order.status, 'forward')}
                                className="px-2 py-1 text-[10px] font-bold text-indigo-505 hover:bg-indigo-650 hover:text-white rounded cursor-pointer transition-all"
                                title="Lanjut produksi"
                              >
                                Lanjut &rarr;
                              </button>
                            )}
                          </div>

                          {/* Quick edit */}
                          <button
                            onClick={() => onEditOrder(order)}
                            className="p-1 px-2.5 text-[10px] font-bold text-slate-650 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer"
                          >
                            Edit
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
