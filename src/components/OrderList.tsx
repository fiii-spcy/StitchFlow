import React, { useState } from 'react';
import { ConvectionOrder, ProductionStatus } from '../types';
import { Search, Filter, Layers, CreditCard, Calendar, CheckCircle, Trash2, Edit3, MessageCircle } from 'lucide-react';

interface OrderListProps {
  orders: ConvectionOrder[];
  onEditOrder: (order: ConvectionOrder) => void;
  onDeleteOrder: (id: string) => Promise<void>;
  onStatusChange: (id: string, nextStatus: ProductionStatus) => Promise<void>;
}

export default function OrderList({ orders, onEditOrder, onDeleteOrder, onStatusChange }: OrderListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const formatRp = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const getStatusBadgeClass = (status: ProductionStatus) => {
    switch (status) {
      case 'Design': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Cutting': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Sewing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'QC': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Ready': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabelText = (status: ProductionStatus) => {
    switch (status) {
      case 'Design': return 'Desain';
      case 'Cutting': return 'Potong Kain';
      case 'Sewing': return 'Proses Jahit';
      case 'QC': return 'Quality Control';
      case 'Ready': return 'Siap Kirim';
      default: return status;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.customerName.toLowerCase().includes(search.toLowerCase()) || 
      o.skuTitle.toLowerCase().includes(search.toLowerCase()) || 
      o.fabricType.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalContractValue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalQuantitySum = filteredOrders.reduce((sum, o) => sum + o.quantity, 0);

  const totalReceived = filteredOrders.reduce((sum, o) => {
    if (o.paymentStatus === 'fully_paid') {
      return sum + o.totalAmount;
    }
    return sum + (o.downPayment || 0);
  }, 0);
  const totalReceivables = totalContractValue - totalReceived;

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-50/70 p-4 rounded-xl border border-slate-100">
        <div className="relative w-full md:w-80">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pelanggan, SKU, nama desain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-44 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Semua Proses status</option>
            <option value="Design">Antrian Desain (Design)</option>
            <option value="Cutting">Potong Kain (Cutting)</option>
            <option value="Sewing">Proses Jahit (Sewing)</option>
            <option value="QC">Quality Control (QC)</option>
            <option value="Ready">Selesai (Ready)</option>
          </select>
        </div>
      </div>

      {/* Aggregate Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Nilai Finansial</p>
            <h4 className="text-lg font-mono font-bold text-slate-900 mt-1">{formatRp(totalContractValue)}</h4>
            <div className="mt-1.5 flex gap-2.5 text-[9px] text-slate-550 font-medium">
              <span className="text-emerald-600 font-bold">Masuk: {formatRp(totalReceived)}</span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-600 font-semibold">Sisa: {formatRp(totalReceivables)}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kapasitas Produksi Aktif</p>
            <h4 className="text-lg font-mono font-bold text-slate-900 mt-1">{totalQuantitySum.toLocaleString()} pcs</h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Proyek Konveksi</p>
            <h4 className="text-lg font-mono font-bold text-slate-900 mt-1">{filteredOrders.length} Pesanan</h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table Data list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden select-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Pemesanan / SKU</th>
                <th className="px-6 py-4">Bahan Kain</th>
                <th className="px-4 py-4 text-center">Jumlah (Pcs)</th>
                <th className="px-5 py-4">Nilai & Pembayaran</th>
                <th className="px-5 py-4">Target Deadline</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150/70 text-slate-700 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <p className="font-semibold text-xs text-slate-500">Tidak ada pesanan ditemukan</p>
                    <p className="text-[10px] text-slate-400 mt-1">Coba sesuaikan filter atau tambahkan pesanan baru.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-slate-900 text-xs leading-snug">{order.skuTitle}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-2">
                          <span className="font-sans text-slate-500 font-semibold">{order.customerName}</span>
                          <span>|</span>
                          <span>{order.customerPhone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-700 font-medium">{order.fabricType}</div>
                      <div className="text-[9px] text-slate-450 uppercase mt-0.5">{order.complexity === 'simple' ? 'Simple' : order.complexity === 'standard' ? 'Standard' : 'Premium'} Layout</div>
                    </td>
                    <td className="px-4 py-4 text-center font-mono text-xs font-bold text-slate-800">
                      {order.quantity}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-indigo-700">
                      {formatRp(order.totalAmount)}
                      <div className="text-[9px] text-slate-400 font-normal font-sans mt-0.5">@{formatRp(order.unitPrice)}/pc</div>
                      
                      {/* Payment Detail indicators */}
                      <div className="mt-1.5 flex flex-col gap-0.5 font-sans">
                        {order.paymentStatus === 'fully_paid' ? (
                          <div className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 rounded px-1.5 py-0.5 w-max">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            <span>Lunas</span>
                          </div>
                        ) : order.paymentStatus === 'dp_paid' ? (
                          <div className="flex flex-col">
                            <div className="inline-flex items-center gap-1 text-[9px] bg-blue-50 text-blue-800 border border-blue-100 rounded px-1.5 py-0.5 w-max">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              <span>DP: {formatRp(order.downPayment || 0)}</span>
                            </div>
                            <span className="text-[9px] text-amber-600 font-semibold font-mono mt-0.5">Sisa: {formatRp(order.totalAmount - (order.downPayment || 0))}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-[9px] bg-rose-50 text-rose-800 border border-rose-100 rounded px-1.5 py-0.5 w-max">
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                            <span>Belum Bayar</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.deadline}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => order.id && onStatusChange(order.id, e.target.value as ProductionStatus)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full border cursor-pointer focus:outline-none transition-all ${getStatusBadgeClass(order.status)}`}
                      >
                        <option value="Design">Antrian Desain</option>
                        <option value="Cutting">Pemotongan Bahan</option>
                        <option value="Sewing">Proses Jahit</option>
                        <option value="QC">Quality Control</option>
                        <option value="Ready">Selesai & Siap</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          onClick={() => onEditOrder(order)}
                          className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium text-[10px] transition-all cursor-pointer flex items-center gap-1"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (order.id && confirm(`Hapus pesanan SKU '${order.skuTitle}' dari database?`)) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 border border-rose-150 rounded-lg text-rose-600/90 hover:text-rose-700 font-medium text-[10px] transition-all cursor-pointer flex items-center gap-1"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
