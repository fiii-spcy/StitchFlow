import React, { useState } from 'react';
import { 
  Package, 
  Layers, 
  Plus, 
  Minus, 
  AlertOctagon, 
  TrendingUp, 
  Bookmark, 
  MapPin, 
  Boxes,
  Scroll,
  Search,
  Check,
  RotateCcw
} from 'lucide-react';

interface MockInventoryItem {
  id: string;
  name: string;
  type: 'finished' | 'raw';
  quantity: number;
  unit: string;
  status: 'Optimal' | 'Low' | 'Critical';
  location: string;
  weightGsmOrDesc?: string;
  safetyMinimum: number;
}

const INITIAL_INVENTORY_ITEMS: MockInventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Premium Heavy Tee (Finished Garment)',
    type: 'finished',
    quantity: 89,
    unit: 'Pcs',
    status: 'Optimal',
    location: 'Jakarta Warehouse (Shelf A3)',
    weightGsmOrDesc: '235 GSM Cotton Overdyed',
    safetyMinimum: 40
  },
  {
    id: 'inv-2',
    name: 'Utility Chore Jacket (Finished Garment)',
    type: 'finished',
    quantity: 14,
    unit: 'Pcs',
    status: 'Low',
    location: 'Sewing Line B (Rack 5)',
    weightGsmOrDesc: '12oz Duck Canvas Cotton',
    safetyMinimum: 25
  },
  {
    id: 'inv-3',
    name: 'Raw Delvedge Denim Pants',
    type: 'finished',
    quantity: 42,
    unit: 'Pcs',
    status: 'Optimal',
    location: 'Main Rack (Shelf C1)',
    weightGsmOrDesc: '14.5oz Indigo Warp Twill',
    safetyMinimum: 20
  },
  {
    id: 'inv-4',
    name: 'Cotton Combed 30s Fabric Roll',
    type: 'raw',
    quantity: 45,
    unit: 'Rol (2400 kg)',
    status: 'Optimal',
    location: 'Rolling Room A',
    weightGsmOrDesc: 'Super-Soft Reactive Bio-wash',
    safetyMinimum: 15
  },
  {
    id: 'inv-5',
    name: 'Heavyweight Fleece Cotton Fabric',
    type: 'raw',
    quantity: 21,
    unit: 'Rol (1050 kg)',
    status: 'Optimal',
    location: 'Rolling Room B',
    weightGsmOrDesc: '330 GSM Brushed Backing',
    safetyMinimum: 10
  },
  {
    id: 'inv-6',
    name: 'Canvas Duck Fabric 12oz',
    type: 'raw',
    quantity: 8,
    unit: 'Rol (400 kg)',
    status: 'Critical',
    location: 'Storage Annex C',
    weightGsmOrDesc: 'Tan Brown Coarse Weave',
    safetyMinimum: 12
  },
  {
    id: 'inv-7',
    name: 'YKK Brass Zippers #5 (Aksesoris)',
    type: 'raw',
    quantity: 1200,
    unit: 'Pcs',
    status: 'Optimal',
    location: 'Drawers Suite 2',
    weightGsmOrDesc: 'Metal Zipper teeth, Black tape',
    safetyMinimum: 300
  },
  {
    id: 'inv-8',
    name: 'Spun Polyester Thread Cones',
    type: 'raw',
    quantity: 25,
    unit: 'Pcs',
    status: 'Critical',
    location: 'Desk Drawer B4',
    weightGsmOrDesc: 'Ticket 120 Thread Sewing cones',
    safetyMinimum: 60
  }
];

export default function InventoryManager() {
  const [items, setItems] = useState<MockInventoryItem[]>(INITIAL_INVENTORY_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'finished' | 'raw'>('all');
  
  // Create / add inventory state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'finished' | 'raw'>('raw');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('Rol');
  const [newItemLocation, setNewItemLocation] = useState('Rolling Room A');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemMin, setNewItemMin] = useState(10);

  // Helper status calculation
  const determineStatus = (qty: number, min: number): 'Optimal' | 'Low' | 'Critical' => {
    if (qty <= min / 2) return 'Critical';
    if (qty < min) return 'Low';
    return 'Optimal';
  };

  // Quantity adjusting counter
  const adjustQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = Math.max(0, item.quantity + delta);
        return {
          ...item,
          quantity: nextQty,
          status: determineStatus(nextQty, item.safetyMinimum)
        };
      }
      return item;
    }));
  };

  // Submit adding item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const addedItem: MockInventoryItem = {
      id: `inv-${Date.now()}`,
      name: newItemName,
      type: newItemType,
      quantity: newItemQty,
      unit: newItemUnit,
      status: determineStatus(newItemQty, newItemMin),
      location: newItemLocation || 'Rak Penyimpanan Utama',
      weightGsmOrDesc: newItemDesc || 'Regular Stock',
      safetyMinimum: newItemMin || 1
    };

    setItems(prev => [addedItem, ...prev]);
    setIsAddOpen(false);
    
    // Reset form fields
    setNewItemName('');
    setNewItemQty(1);
    setNewItemUnit('Rol');
    setNewItemLocation('');
    setNewItemDesc('');
    setNewItemMin(10);
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeFilter === 'all' || item.type === activeFilter;
    return matchesSearch && matchesCategory;
  });

  // Totals calculations
  const totalRawRolls = items.filter(i => i.type === 'raw' && i.unit.toLowerCase().includes('rol')).reduce((acc, i) => acc + i.quantity, 0);
  const totalGarments = items.filter(i => i.type === 'finished').reduce((acc, i) => acc + i.quantity, 0);
  const totalCritical = items.filter(i => i.status === 'Critical').length;

  return (
    <div className="space-y-6">
      
      {/* Header and stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 text-left">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">Manajemen Inventaris & Bahan Baku</h2>
          <p className="text-xs text-slate-500">Pantau ketersediaan kain, aksesoris benang/kancing, dan stock pakaian terassembly.</p>
        </div>
        
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-neutral-900 hover:bg-slate-800 text-white font-medium text-xs py-3 px-5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Item Inventaris</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 flex items-center justify-between text-left shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Stok Rol Kain Baku</span>
            <p className="text-2xl font-display font-black text-indigo-950">{totalRawRolls} Rol</p>
            <p className="text-[10px] text-slate-400">Total berat kain di Rolling Rooms</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-650 flex items-center justify-center">
            <Scroll className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 flex items-center justify-between text-left shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Barang Jadi Siap Kirim</span>
            <p className="text-2xl font-display font-black text-emerald-900">{totalGarments} Pcs</p>
            <p className="text-[10px] text-slate-400">Pakaian lolos QC & Packing rapi</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-650 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 flex items-center justify-between text-left shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Peringatan Kritis Stok</span>
            <p className="text-2xl font-display font-black text-rose-900">{totalCritical} Bahan</p>
            <p className="text-[10px] text-slate-400">Di bawah safety minimum limit</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-105 text-rose-650 flex items-center justify-center animate-pulse">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Actions and searching filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
        
        {/* Category triggers */}
        <div className="flex gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4.5 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-neutral-900 text-white'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            Semua Inventaris
          </button>
          <button
            onClick={() => setActiveFilter('finished')}
            className={`px-4.5 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'finished'
                ? 'bg-neutral-900 text-white'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            Pakaian Jadi (Finished Goods)
          </button>
          <button
            onClick={() => setActiveFilter('raw')}
            className={`px-4.5 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'raw'
                ? 'bg-neutral-900 text-white'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            Bahan Baku & Kain (Raw Materials)
          </button>
        </div>

        {/* Searching bar input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kain, aksesoris, atau rak..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-150 rounded-xl py-2.5 pl-9 pr-4 text-slate-800 focus:outline-indigo-505 placeholder-slate-400 transition-all text-left"
          />
        </div>

      </div>

      {/* Primary Inventory Items List */}
      <div className="bg-white border border-slate-150 rounded-xl shadow-xs text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-4 px-6 text-left">ITEM & DESKRIPSI BAHAN</th>
                <th className="py-4 px-4 text-left font-sans">KATEGORI</th>
                <th className="py-4 px-4 text-center">STOK SAAT INI</th>
                <th className="py-4 px-4 text-left">LOKASI RAK GEDUNG</th>
                <th className="py-4 px-4 text-center">SAFETY MIN</th>
                <th className="py-4 px-4 text-center">KONDISI STOK</th>
                <th className="py-4 px-6 text-center">PENYESUAIAN STOK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/20 transition-all">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.weightGsmOrDesc}</p>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-lg border uppercase ${
                      item.type === 'finished' 
                        ? 'bg-teal-50 text-teal-700 border-teal-100' 
                        : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                    }`}>
                      {item.type === 'finished' ? 'Barang Jadi' : 'Bahan Baku'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-slate-900 font-mono">
                    <span className="text-sm">{item.quantity}</span> {item.unit.split(' ')[0]}
                  </td>
                  <td className="py-4 px-4 text-slate-650">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.location}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center font-mono font-medium text-slate-405">
                    {item.safetyMinimum}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase ${
                      item.status === 'Optimal' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      item.status === 'Low'
                        ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-rose-50 text-rose-700 border-rose-100 animate-pulse'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'Optimal' ? 'bg-emerald-500' :
                        item.status === 'Low' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}></span>
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => adjustQuantity(item.id, -1)}
                        className="w-7 h-7 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer transition-colors"
                        title="Kurangi Persediaan Stock"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => adjustQuantity(item.id, 1)}
                        className="w-7 h-7 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer transition-colors"
                        title="Tambah Persediaan Stock"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                    <Package className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold">Tidak ditemukan item dengan kueri tersebut.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Inventory Item Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-150 p-6 max-w-md w-full shadow-2xl relative text-left animate-scale-up">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-3 mb-4">Tambah Item Inventaris Baru</h3>
            
            <form onSubmit={handleAddItem} className="space-y-4 text-xs font-medium text-slate-700">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase">Nama Barang / Kain</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kain Cotton Combed 24s Hitam"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-155 rounded-xl p-3 focus:outline-indigo-505 text-xs text-slate-800 placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Kategori</label>
                  <select
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value as 'finished' | 'raw')}
                    className="w-full bg-slate-50 border border-slate-155 rounded-xl p-3 focus:outline-indigo-505 text-xs"
                  >
                    <option value="raw">Bahan Baku (Raw)</option>
                    <option value="finished">Pakaian Jadi (Finished)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Lokasi Rak / Annex</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Annex Room B, Rak 3"
                    value={newItemLocation}
                    onChange={(e) => setNewItemLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-155 rounded-xl p-3 focus:outline-indigo-505 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-155 rounded-xl p-3 focus:outline-indigo-505 text-xs"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Satuan / Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rol (200 kg) atau Pcs"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-155 rounded-xl p-3 focus:outline-indigo-505 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Safety Minimum</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemMin}
                    onChange={(e) => setNewItemMin(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-155 rounded-xl p-3 focus:outline-indigo-505 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Benang / GSM / Spek</label>
                  <input
                    type="text"
                    placeholder="Contoh: 190 GSM Premium"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-155 rounded-xl p-3 focus:outline-indigo-505 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer"
                >
                  Simpan Item
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
