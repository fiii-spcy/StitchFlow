import React, { useState, useEffect } from 'react';
import { Award, Calculator, Layers, PenTool, TrendingUp, CheckCircle, Plus } from 'lucide-react';
import { SewingComplexity, EmbroideryType, EstimatorInputs } from '../types';

interface EstimatorProps {
  onAddOrderFromEstimate: (estimate: {
    fabricType: string;
    quantity: number;
    complexity: SewingComplexity;
    embroideryType: EmbroideryType;
    unitPrice: number;
    notes: string;
  }) => void;
}

export const FABRICS = [
  { name: 'Cotton Combed 30s', type: 'Kaos / T-Shirt', cost: 42000 },
  { name: 'Fleece Premium', type: 'Hoodie / Jaket', cost: 68000 },
  { name: 'Lacoste CVC', type: 'Polo Shirt', cost: 55000 },
  { name: 'American Drill', type: 'Kemeja PDH / Seragam', cost: 58000 },
  { name: 'Jersey Dry-Fit', type: 'Jersey Olahraga', cost: 38000 },
  { name: 'Satin Silk Corduroy', type: 'Jaket Bomber / Premium', cost: 72000 }
];

export const COMPLEXITY_COSTS: Record<SewingComplexity, { name: string; cost: number; desc: string }> = {
  simple: { name: 'Simple (Kaos/Tote Bag)', cost: 12000, desc: 'Jahitan lurus, obras ringkas' },
  standard: { name: 'Standard (Polo/Jersey)', cost: 18000, desc: 'Manset kra, kancing depan' },
  premium: { name: 'Premium (Uniform/Jaket)', cost: 30000, desc: 'Furing dalam, resleting, saku bobok' }
};

export const EMBROIDERY_COSTS: Record<EmbroideryType, { name: string; cost: number; desc: string }> = {
  none: { name: 'Sederhana (Tanpa Sablon/Bordir)', cost: 0, desc: 'Bahan polosan tanpa sablon' },
  screenprint: { name: 'Sablon Plastisol / DST', cost: 9000, desc: 'Sablon awet & handfeel halus' },
  embroidery_small: { name: 'Bordir Komputer Kecil (Dada)', cost: 7000, desc: 'Bordir teks/logo mini' },
  embroidery_large: { name: 'Bordir Komputer Lebar (Punggung)', cost: 15000, desc: 'Desain punggung penuh' }
};

export default function Estimator({ onAddOrderFromEstimate }: EstimatorProps) {
  const [inputs, setInputs] = useState<EstimatorInputs>({
    fabricType: FABRICS[0].name,
    quantity: 50,
    complexity: 'standard',
    embroideryType: 'screenprint',
    markupPercent: 35
  });

  const [costs, setCosts] = useState({
    fabricCost: 0,
    sewingCost: 0,
    embroideryCost: 0,
    totalHppUnit: 0,
    totalProductionCost: 0,
    suggestedUnitPrice: 0,
    totalAmount: 0,
    potentialProfit: 0
  });

  useEffect(() => {
    const selectedFabric = FABRICS.find(f => f.name === inputs.fabricType) || FABRICS[0];
    const fabricCostUnit = selectedFabric.cost;
    const sewingCostUnit = COMPLEXITY_COSTS[inputs.complexity].cost;
    const embroideryCostUnit = EMBROIDERY_COSTS[inputs.embroideryType].cost;

    // Direct Cost baseline per item
    const rawCostPerUnit = fabricCostUnit + sewingCostUnit + embroideryCostUnit;
    
    // Bulk discounts based on order quantity:
    // > 100 pcs: 5% discount on HPP
    // > 250 pcs: 10% discount on HPP
    // > 500 pcs: 15% discount on HPP
    let discountMultiplier = 1;
    if (inputs.quantity >= 500) {
      discountMultiplier = 0.85;
    } else if (inputs.quantity >= 250) {
      discountMultiplier = 0.90;
    } else if (inputs.quantity >= 100) {
      discountMultiplier = 0.95;
    }

    const totalHppUnit = Math.round(rawCostPerUnit * discountMultiplier);
    const totalProductionCost = totalHppUnit * inputs.quantity;
    
    // Calculate final pricing based on markup target
    const suggestedUnitPrice = Math.round(totalHppUnit * (1 + inputs.markupPercent / 100));
    const totalAmount = suggestedUnitPrice * inputs.quantity;
    const potentialProfit = totalAmount - totalProductionCost;

    setCosts({
      fabricCost: fabricCostUnit,
      sewingCost: sewingCostUnit,
      embroideryCost: embroideryCostUnit,
      totalHppUnit,
      totalProductionCost,
      suggestedUnitPrice,
      totalAmount,
      potentialProfit
    });
  }, [inputs]);

  // Format currency
  const formatRp = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const handleCreateOrder = () => {
    const defaultNotes = `Estimasi HPP: ${formatRp(costs.totalHppUnit)} per pcs. Bahan: ${inputs.fabricType}, Sablon/Bordir: ${EMBROIDERY_COSTS[inputs.embroideryType].name}. target profit margin: ${inputs.markupPercent}%.`;
    onAddOrderFromEstimate({
      fabricType: inputs.fabricType,
      quantity: inputs.quantity,
      complexity: inputs.complexity,
      embroideryType: inputs.embroideryType,
      unitPrice: costs.suggestedUnitPrice,
      notes: defaultNotes
    });
  };

  return (
    <div id="estimator-panel" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
      {/* Parameters Panel - 7 Cols */}
      <div className="p-6 lg:p-8 lg:col-span-7 border-b lg:border-b-0 lg:border-r border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-brand-primary text-white rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-slate-900">Kalkulator Estimasi HPP & Harga Jual</h2>
            <p className="text-xs text-slate-500">Hitung otomatis estimasi modal, markup untung, dan diskon kuantitas bulk order</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Fabric Option */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center justify-between">
              <span>1. Jenis Bahan Kain</span>
              <span className="text-xs font-mono text-brand-accent font-semibold">Tiap fabric punya cost beda</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FABRICS.map((fabric) => (
                <button
                  key={fabric.name}
                  onClick={() => setInputs({ ...inputs, fabricType: fabric.name })}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    inputs.fabricType === fabric.name
                      ? 'border-brand-primary bg-indigo-50/40 font-medium text-slate-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <p className="text-xs font-bold leading-tight line-clamp-1">{fabric.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{fabric.type}</p>
                  <p className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-500 mt-1">{formatRp(fabric.cost)}/m</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quantity Option */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center justify-between">
                <span>2. Kuantitas Pesanan (Pcs)</span>
                <span className="text-xs font-mono text-slate-400">Min. 12 pcs</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="12"
                  max="1000"
                  step="1"
                  value={inputs.quantity}
                  onChange={(e) => setInputs({ ...inputs, quantity: parseInt(e.target.value) || 12 })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <input
                  type="number"
                  min="12"
                  max="10000"
                  value={inputs.quantity}
                  onChange={(e) => setInputs({ ...inputs, quantity: Math.max(12, parseInt(e.target.value) || 12) })}
                  className="w-20 px-3 py-1.5 border border-slate-200 rounded-md text-sm font-mono text-center focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                <span>12 pcs</span>
                <span className={inputs.quantity >= 100 ? 'text-indigo-600 font-semibold' : ''}>&ge;100 pcs (-5%)</span>
                <span className={inputs.quantity >= 250 ? 'text-indigo-600 font-semibold' : ''}>&ge;250 pcs (-10%)</span>
                <span className={inputs.quantity >= 500 ? 'text-emerald-600 font-bold' : ''}>&ge;500 pcs (-15%)</span>
              </div>
            </div>

            {/* Markup Slider */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center justify-between">
                <span>5. Target Profit Margin (%)</span>
                <span className="text-xs font-mono text-slate-500 font-semibold">Markup: +{inputs.markupPercent}%</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="150"
                  step="5"
                  value={inputs.markupPercent}
                  onChange={(e) => setInputs({ ...inputs, markupPercent: parseInt(e.target.value) || 10 })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="w-16 text-center font-mono font-medium text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-md py-1.5">
                  {inputs.markupPercent}%
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                <span>10% Low Margin</span>
                <span>35% Standar</span>
                <span>80% Premium Brand</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Complexity Option */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>3. Tingkat Kerumitan Jahit</span>
              </label>
              <div className="space-y-2">
                {(Object.keys(COMPLEXITY_COSTS) as SewingComplexity[]).map((key) => (
                  <label
                    key={key}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      inputs.complexity === key
                        ? 'border-indigo-600 bg-indigo-50/20'
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="complexity"
                      checked={inputs.complexity === key}
                      onChange={() => setInputs({ ...inputs, complexity: key })}
                      className="mt-1 text-indigo-600 accent-indigo-600"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">{COMPLEXITY_COSTS[key].name}</span>
                        <span className="text-[10px] text-indigo-600 font-mono">+{formatRp(COMPLEXITY_COSTS[key].cost)}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">{COMPLEXITY_COSTS[key].desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Embroidery/Logo Option */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-indigo-500" />
                <span>4. Proses Variasi Sablon / Bordir</span>
              </label>
              <div className="space-y-2">
                {(Object.keys(EMBROIDERY_COSTS) as EmbroideryType[]).map((key) => (
                  <label
                    key={key}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      inputs.embroideryType === key
                        ? 'border-indigo-600 bg-indigo-50/20'
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="embroidery"
                      checked={inputs.embroideryType === key}
                      onChange={() => setInputs({ ...inputs, embroideryType: key })}
                      className="mt-1 text-indigo-600 accent-indigo-600"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">{EMBROIDERY_COSTS[key].name}</span>
                        {EMBROIDERY_COSTS[key].cost > 0 && (
                          <span className="text-[10px] text-indigo-600 font-mono">+{formatRp(EMBROIDERY_COSTS[key].cost)}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">{EMBROIDERY_COSTS[key].desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Display Panel - 5 Cols */}
      <div className="p-6 lg:p-8 lg:col-span-12 xl:col-span-5 bg-slate-50 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Kalkulasi Struktur Harga</span>
          </h3>

          <div className="space-y-3.5">
            {/* Cost breakdowns */}
            <div className="flex justify-between text-xs text-slate-600">
              <span>Bahan Dasar ({inputs.fabricType})</span>
              <span className="font-mono">{formatRp(costs.fabricCost)}/pc</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Biaya Jahit ({inputs.complexity === 'simple' ? 'Simple' : inputs.complexity === 'standard' ? 'Standard' : 'Premium'})</span>
              <span className="font-mono">{formatRp(costs.sewingCost)}/pc</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Proses Sablon/Bordir</span>
              <span className="font-mono">{formatRp(costs.embroideryCost)}/pc</span>
            </div>

            {/* Bulk Discount visualizer */}
            {inputs.quantity >= 100 && (
              <div className="flex justify-between text-xs text-emerald-600 font-medium">
                <span>Diskon Bulk Kuantitas ({inputs.quantity >= 500 ? '15%' : inputs.quantity >= 250 ? '10%' : '5%'})</span>
                <span className="font-mono">
                  -{formatRp(Math.round((costs.fabricCost + costs.sewingCost + costs.embroideryCost) * (1 - (inputs.quantity >= 500 ? 0.85 : inputs.quantity >= 250 ? 0.90 : 0.95))))}/pc
                </span>
              </div>
            )}

            <div className="h-px bg-slate-200 my-2"></div>

            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-900">Total HPP per Item</span>
              <span className="font-mono font-bold text-slate-950">{formatRp(costs.totalHppUnit)}</span>
            </div>

            <div className="flex justify-between text-xs text-slate-400">
              <span>Total Modal Produksi</span>
              <span className="font-mono">{formatRp(costs.totalProductionCost)}</span>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 my-4">
              <div className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase mb-1">REKOMENDASI HARGA JUAL</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-extrabold text-emerald-950">{formatRp(costs.suggestedUnitPrice)}</span>
                <span className="text-xs text-emerald-600 font-semibold font-mono">/ pcs</span>
              </div>
              <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 flex-shrink-0" />
                <span>Sudah termasuk laba profit {inputs.markupPercent}% di setiap pcs.</span>
              </p>
            </div>

            {/* Total Invoice & Profit Projection */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Total Kontrak</span>
                <p className="text-[13px] font-mono font-bold text-slate-800 mt-0.5">{formatRp(costs.totalAmount)}</p>
                <span className="text-[9px] text-slate-400">untuk {inputs.quantity} pcs</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] text-emerald-600 uppercase tracking-wide">Estimasi Laba</span>
                <p className="text-[13px] font-mono font-bold text-emerald-700 mt-0.5">+{formatRp(costs.potentialProfit)}</p>
                <span className="text-[9px] text-emerald-500">Margin Bersih</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreateOrder}
          className="mt-6 w-full bg-brand-primary hover:bg-brand-600 text-white font-medium text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer group"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:scale-125" />
          <span>Buat Pesanan dengan Estimasi Ini</span>
        </button>
      </div>
    </div>
  );
}
