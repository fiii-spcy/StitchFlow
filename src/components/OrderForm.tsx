import React, { useState, useEffect } from 'react';
import { ConvectionOrder, SewingComplexity, EmbroideryType, ProductionStatus } from '../types';
import { FABRICS, COMPLEXITY_COSTS, EMBROIDERY_COSTS } from './Estimator';
import { X, Save, AlertTriangle, HelpCircle } from 'lucide-react';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: Omit<ConvectionOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: ConvectionOrder | null;
  prefilledEstimate?: {
    fabricType: string;
    quantity: number;
    complexity: SewingComplexity;
    embroideryType: EmbroideryType;
    unitPrice: number;
    notes: string;
  } | null;
}

export default function OrderForm({ isOpen, onClose, onSubmit, initialData, prefilledEstimate }: OrderFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [skuTitle, setSkuTitle] = useState('');
  const [fabricType, setFabricType] = useState(FABRICS[0].name);
  const [quantity, setQuantity] = useState(50);
  const [unitPrice, setUnitPrice] = useState(65000);
  const [complexity, setComplexity] = useState<SewingComplexity>('standard');
  const [embroideryType, setEmbroideryType] = useState<EmbroideryType>('screenprint');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<ProductionStatus>('Design');
  const [notes, setNotes] = useState('');
  
  // New payment states
  const [downPayment, setDownPayment] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'dp_paid' | 'fully_paid'>('unpaid');

  const [formError, setFormError] = useState('');

  // Initializing state depending on whether editing, prefilled, or adding new
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit mode
        setCustomerName(initialData.customerName);
        setCustomerPhone(initialData.customerPhone);
        setSkuTitle(initialData.skuTitle);
        setFabricType(initialData.fabricType);
        setQuantity(initialData.quantity);
        setUnitPrice(initialData.unitPrice);
        setComplexity(initialData.complexity);
        setEmbroideryType(initialData.embroideryType);
        setDeadline(initialData.deadline);
        setStatus(initialData.status);
        setNotes(initialData.notes || '');
        setDownPayment(initialData.downPayment ?? 0);
        setPaymentStatus(initialData.paymentStatus ?? 'unpaid');
        setFormError('');
      } else if (prefilledEstimate) {
        // Prefilled from estimator
        setCustomerName('');
        setCustomerPhone('');
        setSkuTitle('');
        setFabricType(prefilledEstimate.fabricType);
        setQuantity(prefilledEstimate.quantity);
        setUnitPrice(prefilledEstimate.unitPrice);
        setComplexity(prefilledEstimate.complexity);
        setEmbroideryType(prefilledEstimate.embroideryType);
        
        // Set default deadline to +14 days from now
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 14);
        setDeadline(defaultDate.toISOString().split('T')[0]);
        setStatus('Design');
        setNotes(prefilledEstimate.notes);
        setDownPayment(0);
        setPaymentStatus('unpaid');
        setFormError('');
      } else {
        // Absolute fresh new order
        setCustomerName('');
        setCustomerPhone('');
        setSkuTitle('');
        setFabricType(FABRICS[0].name);
        setQuantity(50);
        setUnitPrice(75000);
        setComplexity('standard');
        setEmbroideryType('screenprint');
        
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 14);
        setDeadline(defaultDate.toISOString().split('T')[0]);
        setStatus('Design');
        setNotes('');
        setDownPayment(0);
        setPaymentStatus('unpaid');
        setFormError('');
      }
    }
  }, [isOpen, initialData, prefilledEstimate]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9+]/g, '');
    if (val.startsWith('0')) {
      val = '+62' + val.substring(1);
    } else if (val.length > 0 && !val.startsWith('+')) {
      val = '+' + val;
    }
    setCustomerPhone(val);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !skuTitle.trim() || !deadline) {
      setFormError('Semua kolom berlabel bintang (*) wajib diisi dengan valid!');
      return;
    }

    if (quantity < 12) {
      setFormError('Kuantitas minimum pesanan konveksi adalah 12 pcs!');
      return;
    }

    if (unitPrice < 5000) {
      setFormError('Harga satuan tidak realistis (minimum Rp 5.000)!');
      return;
    }

    const totalCalculated = quantity * unitPrice;
    if (downPayment > totalCalculated) {
      setFormError('Nilai Down Payment (DP) tidak boleh melebihi Total Nilai Kontrak!');
      return;
    }

    setFormError('');
    onSubmit({
      customerName,
      customerPhone,
      skuTitle,
      fabricType,
      quantity,
      unitPrice,
      totalAmount: totalCalculated,
      complexity,
      embroideryType,
      deadline,
      status,
      notes,
      downPayment,
      paymentStatus
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-up">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-lg">
              {initialData ? '✏️ EDIT DATA PESANAN' : '➕ BUAT PESANAN BARU'}
            </h3>
            <p className="text-xs text-slate-500">
              {initialData ? `Mengubah SKU: ${skuTitle}` : 'Input data pesanan konveksi real-time ke dalam server'}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-150 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 font-medium">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Pelanggan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="cth: Budi Santoso"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            {/* Customer WhatsApp Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nomor WhatsApp WA <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={handlePhoneChange}
                placeholder="cth: +628123456789"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
              <span className="text-[9px] text-slate-400 mt-1 block">Tulis format internasional (cth: +62812...)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SKU Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Judul Desain / SKU Pemesanan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={skuTitle}
                onChange={(e) => setSkuTitle(e.target.value)}
                placeholder="cth: Kaos Polos Reuni SMAN 1"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            {/* Fabric Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Jenis Bahan Kain
              </label>
              <select
                value={fabricType}
                onChange={(e) => setFabricType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {FABRICS.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name} (+{f.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kuantitas (Pcs) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="12"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Harga per Pcs (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="500"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            {/* Total Auto Display */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Total Nilai Kontrak
              </label>
              <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold font-mono text-indigo-700">
                Rp {(quantity * unitPrice).toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-rose-200/50">
              <span>💳 STATUS & RINCIAN PEMBAYARAN</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Payment Status Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                  Status Pembayaran
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => {
                    const statusVal = e.target.value as 'unpaid' | 'dp_paid' | 'fully_paid';
                    setPaymentStatus(statusVal);
                    if (statusVal === 'fully_paid') {
                      setDownPayment(quantity * unitPrice);
                    } else if (statusVal === 'unpaid') {
                      setDownPayment(0);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-250 bg-white rounded-lg text-xs"
                >
                  <option value="unpaid">❌ Belum Bayar</option>
                  <option value="dp_paid">💵 DP Masuk (Uang Muka)</option>
                  <option value="fully_paid">✅ Lunas (Lunas 100%)</option>
                </select>
              </div>

              {/* Down Payment (DP) Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                  Uang Muka / DP Masuk (Rp)
                </label>
                <input
                  type="number"
                  step="1000"
                  disabled={paymentStatus === 'unpaid'}
                  value={paymentStatus === 'unpaid' ? 0 : downPayment}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value) || 0);
                    setDownPayment(val);
                    const totalVal = quantity * unitPrice;
                    if (val >= totalVal) {
                      setPaymentStatus('fully_paid');
                    } else if (val > 0) {
                      setPaymentStatus('dp_paid');
                    } else {
                      setPaymentStatus('unpaid');
                    }
                  }}
                  placeholder="Rp 0"
                  className="w-full px-2.5 py-1.5 border border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 bg-white rounded-lg text-xs font-mono"
                />
              </div>

              {/* Sisa Pelunasan Display */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Sisa Pelunasan (Rp)
                </label>
                <div className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono border ${
                  (quantity * unitPrice - downPayment) <= 0 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  Rp {Math.max(0, (quantity * unitPrice) - downPayment).toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            {/* Complexity and Embroidery readonly indicators (or customizable) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Tingkat Jahit
              </label>
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value as SewingComplexity)}
                className="w-full px-2.5 py-1.5 border border-slate-250 bg-white rounded-lg text-xs"
              >
                <option value="simple">Simple (Obras Ringkas)</option>
                <option value="standard">Standard (Kancing/Krah)</option>
                <option value="premium">Premium (Uniform/Jaket)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Jenis Sablon & Bordir
              </label>
              <select
                value={embroideryType}
                onChange={(e) => setEmbroideryType(e.target.value as EmbroideryType)}
                className="w-full px-2.5 py-1.5 border border-slate-250 bg-white rounded-lg text-xs"
              >
                <option value="none">Sederhana / Polosan</option>
                <option value="screenprint">Sablon Plastisol CVC</option>
                <option value="embroidery_small">Bordir Dada Kiri</option>
                <option value="embroidery_large">Bordir Lebar Punggung</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deadline */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Deadline Pengiriman <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Proses Tahap Produksi
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductionStatus)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Design">Antrian Desain (Design)</option>
                <option value="Cutting">Pemotongan Bahan (Cutting)</option>
                <option value="Sewing">Proses Jahit (Sewing)</option>
                <option value="QC">Quality Control (QC)</option>
                <option value="Ready">Selesai & Siap Kirim (Ready)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Catatan Khusus (Instruksi Produksi, Ukuran, Logo, dll.)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="cth: Ukuran S/20, M/15, L/15. Sablon warna putih diletakkan di dada luar..."
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Buttons Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 -mx-6 -mb-6 p-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-250 hover:bg-slate-100 rounded-xl text-slate-650 font-medium text-sm transition-all cursor-pointer"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-medium text-sm shadow-md rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Simpan Perubahan' : 'Masukan ke Database'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
