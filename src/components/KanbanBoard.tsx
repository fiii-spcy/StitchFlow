import React from 'react';
import { ConvectionOrder, ProductionStatus } from '../types';
import { ChevronRight, ChevronLeft, Calendar, Layers, Trash, Edit, CheckCircle2 } from 'lucide-react';

interface KanbanBoardProps {
  orders: ConvectionOrder[];
  onUpdateStatus: (orderId: string, currentStatus: ProductionStatus, direction: 'forward' | 'backward') => Promise<void>;
  onEditOrder: (order: ConvectionOrder) => void;
  onDeleteOrder: (orderId: string) => Promise<void>;
}

const COLUMNS: { id: ProductionStatus; title: string; color: string; desc: string }[] = [
  { id: 'Design', title: 'Antrian Desain', color: 'border-t-4 border-purple-500 bg-purple-50/20', desc: 'Desain pola & approval' },
  { id: 'Cutting', title: 'Potong Bahan', color: 'border-t-4 border-blue-500 bg-blue-50/20', desc: 'Pemotongan kain sesuai pola' },
  { id: 'Sewing', title: 'Proses Jahit', color: 'border-t-4 border-amber-500 bg-amber-50/20', desc: 'Penjahitan & sablon/bordir' },
  { id: 'QC', title: 'Quality Control', color: 'border-t-4 border-indigo-500 bg-indigo-50/20', desc: 'Sortir kualitas & trimming' },
  { id: 'Ready', title: 'Siap Kirim', color: 'border-t-4 border-emerald-500 bg-emerald-50/20', desc: 'Disetrika, packing & selesai' }
];

export default function KanbanBoard({ orders, onUpdateStatus, onEditOrder, onDeleteOrder }: KanbanBoardProps) {
  
  const getOrdersInStatus = (status: ProductionStatus) => {
    return orders.filter(o => o.status === status);
  };

  const getDaysRemaining = (deadlineStr: string) => {
    const deadlineDate = new Date(deadlineStr);
    const today = new Date();
    // Zero out time
    today.setHours(0,0,0,0);
    deadlineDate.setHours(0,0,0,0);
    
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `Terlambat ${Math.abs(diffDays)} hari`, isLate: true };
    if (diffDays === 0) return { text: 'Hari ini!', isLate: true };
    return { text: `${diffDays} hari lagi`, isLate: false };
  };

  const formatRp = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 select-none">
      {COLUMNS.map((col) => {
        const colOrders = getOrdersInStatus(col.id);
        return (
          <div 
            key={col.id} 
            className={`flex flex-col bg-slate-50/80 rounded-2xl p-3 border border-slate-100 min-h-[460px] h-full ${col.color}`}
          >
            {/* Column Header */}
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-slate-800 text-xs tracking-wide uppercase">
                  {col.title}
                </h4>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-slate-200/60 rounded-full text-slate-600">
                  {colOrders.length}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">{col.desc}</p>
            </div>

            {/* Cards Container */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[480px]">
              {colOrders.length === 0 ? (
                <div className="h-28 border border-dashed border-slate-200/70 rounded-xl flex items-center justify-center text-[10px] text-slate-400 font-medium">
                  Kosong
                </div>
              ) : (
                colOrders.map((order) => {
                  const remaining = getDaysRemaining(order.deadline);
                  return (
                    <div 
                      key={order.id} 
                      className="bg-white p-3.5 rounded-xl border border-slate-150/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Title & Actions */}
                        <div className="flex justify-between items-start gap-1 pb-1">
                          <h5 className="font-semibold text-slate-900 text-xs leading-snug tracking-tight truncate max-w-[130px]" title={order.skuTitle}>
                            {order.skuTitle}
                          </h5>
                          <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditOrder(order)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                              title="Edit pesanan"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (order.id && confirm(`Apakah Anda yakin ingin menghapus pesanan ${order.skuTitle}?`)) {
                                  onDeleteOrder(order.id);
                                }
                              }}
                              className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Hapus pesanan"
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="text-[10px] text-slate-500 mt-1 flex items-baseline justify-between">
                          <span className="font-medium truncate max-w-[90px]">{order.customerName}</span>
                          <span className="font-mono text-slate-400">{order.customerPhone.substring(0, 8)}...</span>
                        </div>

                        {/* Order Details */}
                        <div className="mt-2.5 pt-2 border-t border-slate-50 space-y-1 text-[10px] text-slate-605">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Layers className="w-3 h-3 text-slate-350" />
                              <span>Bahan</span>
                            </span>
                            <span className="font-medium truncate max-w-[110px] text-slate-700">{order.fabricType}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Qty / Total</span>
                            <span className="font-medium text-slate-700 font-mono">
                              {order.quantity} pcs <span className="text-indigo-600 font-semibold">({formatRp(order.totalAmount)})</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-350" />
                              <span>Deadline</span>
                            </span>
                            <span className={`font-mono text-[9px] font-semibold flex items-center ${
                              remaining.isLate ? 'text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded' : 'text-slate-500'
                            }`}>
                              {remaining.text}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Direction Controls */}
                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-50">
                        {/* Move Back Button */}
                        {col.id !== 'Design' ? (
                          <button
                            onClick={() => order.id && onUpdateStatus(order.id, order.status, 'backward')}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-650 transition-all cursor-pointer flex items-center justify-center border border-slate-150"
                            title="Kembalikan proses"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="w-5"></div>
                        )}

                        <span className="text-[9px] font-bold text-slate-400 tracking-wider">
                          {col.id === 'Ready' ? (
                            <span className="text-emerald-600 flex items-center gap-1 uppercase">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selesai</span>
                            </span>
                          ) : (
                            'PROSES'
                          )}
                        </span>

                        {/* Move Forward Button */}
                        {col.id !== 'Ready' ? (
                          <button
                            onClick={() => order.id && onUpdateStatus(order.id, order.status, 'forward')}
                            className="p-1 px-2.5 bg-brand-primary hover:bg-indigo-650 rounded-lg text-white font-medium text-[10px] shadow-sm transition-all cursor-pointer flex items-center gap-1"
                            title="Lanjutkan tahapan"
                          >
                            <span>Lanjut</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <div className="w-5"></div>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
