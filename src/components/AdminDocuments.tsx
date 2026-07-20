import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  HelpCircle, 
  BookOpen, 
  Send, 
  CheckCircle, 
  Search, 
  MessageSquare, 
  Mail, 
  Clock, 
  CornerDownRight, 
  ChevronRight,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';

interface AdminDocumentsModalProps {
  type: 'privacy' | 'terms' | 'support' | 'docs';
  onClose: () => void;
  onSwitchType: (type: 'privacy' | 'terms' | 'support' | 'docs') => void;
}

export default function AdminDocumentsModal({ type, onClose, onSwitchType }: AdminDocumentsModalProps) {
  // Support ticket form state
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportCategory, setSupportCategory] = useState('billing');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  // Doc search state
  const [docSearch, setDocSearch] = useState('');
  const [expandedDocSection, setExpandedDocSection] = useState<string | null>('get-started');

  // Support categories
  const categories = [
    { id: 'billing', label: '💳 Masalah Pembayaran & Paket' },
    { id: 'whatsapp', label: '💬 Integrasi Notifikasi WhatsApp' },
    { id: 'whitelabel', label: '🌐 Domain Kustom & Whitelabel' },
    { id: 'system', label: '🛠️ Bug atau Kendala Sistem' },
    { id: 'other', label: '📦 Pertanyaan Lainnya' },
  ];

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName || !supportEmail || !supportMessage) return;
    setSupportSubmitted(true);
    setTimeout(() => {
      // Auto-clear after success feedback
      setSupportName('');
      setSupportEmail('');
      setSupportMessage('');
    }, 4000);
  };

  // Documentation sections & items
  const docSections = [
    {
      id: 'get-started',
      title: '🎯 Memulai & Pendaftaran Toko',
      icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
      items: [
        {
          q: 'Bagaimana cara mendaftarkan workshop konveksi saya?',
          a: 'Cukup masukkan nama konveksi Anda pada form pendaftaran di landing page, pilih slug domain yang diinginkan (misalnya "syariagarmen"), dan tentukan tema warna brand Anda. Setelah mengisi rincian kontak WhatsApp dan memilih skema paket, klik tombol pendaftaran. Tautan portal pelanggan Anda dan portal admin akan langsung siap dipublikasikan!'
        },
        {
          q: 'Di mana saya bisa melihat tautan/link pemesanan pelanggan saya?',
          a: 'Setelah melakukan pendaftaran paket di halaman awal, tautan pelanggan Anda akan tersedia di Dashboard Owner di bagian widget "Tautan Operasional Aktif" (misalnya https://domain-anda/customer-portal). Anda dapat menyebarkan tautan ini di Bio Instagram, Profil TikTok, maupun membagikannya di chat WhatsApp pelanggan.'
        }
      ]
    },
    {
      id: 'calculator-config',
      title: '🧮 Cara Kerja Estimator Harga & HPP',
      icon: <BookOpen className="w-4 h-4 text-indigo-600" />,
      items: [
        {
          q: 'Bagaimana kalkulator dinamis menentukan harga jahit & bahan baku?',
          a: 'Sistem menggunakan algoritma estimasi bertingkat. Pelanggan memasukkan jumlah kuantitas pesanan, kerumitan desain, jenis variasi sablon/bordir, dan bahan baku fabric. Sistem akan menghitung harga per potong pakaian secara instan. Sebagai pemilik konveksi, Anda dapat mengedit harga dasar kain, biaya sablon, dan margin keuntungan langsung melalui database manajemen harga di dalam Dashboard Admin.'
        },
        {
          q: 'Apakah harga HPP kain fluktuatif bisa saya ubah sewaktu-waktu?',
          a: 'Benar! Buka portal Admin Anda, lalu masuk ke bagian "Daftar Harga Bahan Baku". Anda dapat mengubah HPP dasar kain Cotton Combed, Fleece, Polo Lacoste, Drill, dll. Semua perubahan harga dasar akan langsung meremajakan kalkulator estimasi di sisi portal pelanggan saat mereka menghitung ulang secara real-time.'
        }
      ]
    },
    {
      id: 'whatsapp-sync',
      title: '💬 Sinkronisasi Notifikasi WhatsApp',
      icon: <HelpCircle className="w-4 h-4 text-blue-600" />,
      items: [
        {
          q: 'Bagaimana cara mengaktifkan notifikasi otomatis ke WhatsApp pelanggan?',
          a: 'Notifikasi otomatis di-trigger di latar belakang oleh sistem cloud StitchFlow. Setiap kali pelanggan memasukkan order baju baru, sistem akan mengirimkan ringkasan faktur (invoice) dan instruksi bayar DP. Saat Anda memperbarui status pesanan pada papan Kanban (misal: masuk ke barisan "Sewing/Jahit"), WhatsApp otomatis dikirim agar pelanggan mengetahui proses perakitan pakaian telah berjalan.'
        },
        {
          q: 'Apakah saya perlu scan QR Code WhatsApp sendiri?',
          a: 'Untuk Paket Starter dan Growth, penyiapan dibantu server standar kami. Jika Anda berlangganan Paket Pro, Anda mendapatkan portal whitelabel eksklusif untuk menghubungkan nomor WhatsApp bisnis resmi milik konveksi Anda secara penuh.'
        }
      ]
    },
    {
      id: 'dp-payment',
      title: '💳 Alur Pembelian, DP (Down Payment) & Pelunasan',
      icon: <FileText className="w-4 h-4 text-indigo-600" />,
      items: [
        {
          q: 'Bagaimana status DP dan Pelunasan di-update?',
          a: 'Di dalam form tambah/edit pesanan baru di dashboard admin, Anda akan melihat bagian "RINCIAN PEMBAYARAN". Di sana Anda bisa menetapkan status pembayaran ("Belum Bayar", "DP Masuk", atau "Lunas 100%"). Sisa pelunasan dihitung otomatis berdasarkan sisa kontrak dikurangi uang muka (DP). Angka ini juga tersinkronisasi di portal lacak pesanan milik pelanggan.'
        },
        {
          q: 'Apakah pelanggan bisa melihat laporan sisa tagihan mereka?',
          a: 'Tentu. Saat pelanggan memasukkan nomor WhatsApp / Kode invoice transaksi mereka di portal pelacak pesanan, mereka akan langsung melihat status pengerjaan kain, biaya yang sudah dibayarkan sebagai DP, dan sisa jumlah pelunasan yang harus ditransfer sebelum barang didistribusikan.'
        }
      ]
    }
  ];

  // Search filter
  const filteredDocSections = docSections.map(section => {
    const matchedItems = section.items.filter(item => 
      item.q.toLowerCase().includes(docSearch.toLowerCase()) || 
      item.a.toLowerCase().includes(docSearch.toLowerCase())
    );
    return {
      ...section,
      items: matchedItems
    };
  }).filter(section => section.items.length > 0);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100" id="admin-doc-modal-container">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            {type === 'privacy' && (
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-inner">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
            {type === 'terms' && (
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 shadow-inner">
                <FileText className="w-5 h-5" />
              </div>
            )}
            {type === 'support' && (
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-inner">
                <HelpCircle className="w-5 h-5" />
              </div>
            )}
            {type === 'docs' && (
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner">
                <BookOpen className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight font-sans">
                {type === 'privacy' && 'Kebijakan Privasi StitchFlow'}
                {type === 'terms' && 'Syarat & Ketentuan Layanan'}
                {type === 'support' && 'Pusat Bantuan & Tiket Support'}
                {type === 'docs' && 'Dokumentasi Sistem Operasional'}
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold font-mono tracking-wider uppercase mt-0.5">
                {type === 'privacy' && 'DIPERBARUI: JUNI 2026 • VERSI PRIVASI 2.3'}
                {type === 'terms' && 'DIPERBARUI: JUNI 2026 • SISTEM WHITE-LABEL'}
                {type === 'support' && 'DAPATKAN BANTUAN OPERASIONAL CEPAT'}
                {type === 'docs' && 'PANDUAN LENGKAP PENGOPERASIAN PLATFORM'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
            id="close-doc-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Secondary Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-100/60 border-b border-slate-200/50 flex gap-1.5 overflow-x-auto">
          <button
            onClick={() => onSwitchType('docs')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
              type === 'docs' 
                ? 'bg-white text-indigo-650 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dokumentasi</span>
          </button>
          <button
            onClick={() => onSwitchType('support')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
              type === 'support' 
                ? 'bg-white text-indigo-650 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support Hub</span>
          </button>
          <button
            onClick={() => onSwitchType('privacy')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
              type === 'privacy' 
                ? 'bg-white text-indigo-650 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Kebijakan Privasi</span>
          </button>
          <button
            onClick={() => onSwitchType('terms')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
              type === 'terms' 
                ? 'bg-white text-indigo-650 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Syarat & Ketentuan</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* PRIVACY POLICY CONTENT */}
          {type === 'privacy' && (
            <div className="space-y-6 text-slate-650 text-xs leading-relaxed text-left">
              <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-4 flex gap-3">
                <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-805 text-xs">Jaminan Kerahasiaan Data Operasional</h4>
                  <p className="text-[11px] text-emerald-800 leading-normal">
                    StitchFlow berkomitmen melindungi seluruh data transaksi, harga HPP rahasia kain, informasi pelanggan, dan pola desain pakaian milik garmen Anda secara mutlak dengan enkripsi database Firestore.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-sm font-sans flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-emerald-500 rounded-full"></span> 1. Data yang Kami Kumpulkan
                </h3>
                <p>
                  Melalui pengoperasian platform, StitchFlow mengumpulkan beberapa kategori data dari Anda selaku pemilik usaha (Instansi/Workshop) dan pelanggan Anda:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="font-bold text-slate-800 mb-1">Data Owner & Profil Usaha:</p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[11px]">
                      <li>Nama Brand Konveksi dan Slug Tautan Kustom.</li>
                      <li>Nomor WhatsApp Admin & data penarikan notifikasi.</li>
                      <li>Konfigurasi rumus harga dasar HPP, jasanya, dan margin profit.</li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="font-bold text-slate-800 mb-1">Data Pesanan Pelanggan:</p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[11px]">
                      <li>Nama, Email, dan WhatsApp pembeli kustom baju.</li>
                      <li>Ukuran, pola, jumlah kuantitas pesanan, serta rincian desain.</li>
                      <li>Status transfer DP, bukti penyetoran, dan log pembayaran.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-sm font-sans flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-emerald-500 rounded-full"></span> 2. Penggunaan Informasi Usaha Anda
                </h3>
                <p>
                  Seluruh data yang terkumpul digunakan semata-mata untuk kelancaran kegiatan operasional konveksi:
                </p>
                <ul className="list-decimal pl-4 space-y-2 text-slate-550">
                  <li><strong>Kalkulasi Otomatis:</strong> Data harga kain digunakan untuk menghitung estimasi instan di halaman depan web pemesanan pelanggan.</li>
                  <li><strong>Notifikasi Real-time WhatsApp:</strong> Mengirim invoice link, update tahapan cutting/sewing, konfirmasi setoran DP, hingga struk akhir.</li>
                  <li><strong>Laporan Keuangan & Tren Produk:</strong> Menyusun grafik omset bulanan garmen dan peringkat bahan kain terlaris bagi owner.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-sm font-sans flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-emerald-500 rounded-full"></span> 3. Keamanan Database Firestore & Penyimpanan
                </h3>
                <p>
                  Sistem kami dibangun di atas ekosistem Firebase Firestore Cloud Infrastructure. Semua operasi didasari oleh <strong>Security Rules</strong> transaksional tingkat tinggi yang menolak akses tidak aman dari pihak luar:
                </p>
                <div className="bg-slate-100 p-4 rounded-xl font-mono text-[10px] text-indigo-750 line-clamp-3">
                  {`rules_version = '2'; \nservice cloud.firestore { \n  match /databases/{database}/documents { \n    match /convections/{convectionId} { ... } \n  } \n}`}
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  *Catatan: Kami menerapkan enkripsi SSL/TLS 256-bit selama pengiriman data antar browser pelanggan dan server database kami.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-sm font-sans flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-emerald-500 rounded-full"></span> 4. Kebijakan Tanpa Penjualan Data (Zero-Sharing)
                </h3>
                <p>
                  StitchFlow menjamin tidak akan menyebarkan, menaruh iklan, menyewakan, atau menjual basis data pesanan pelanggan Anda atau rincian keuntungan produksi konveksi kepada lembaga kompetitor, pialang data, atau pihak ketiga mana pun untuk tujuan promosi pemasaran luar.
                </p>
              </div>
            </div>
          )}

          {/* TERMS OF SERVICE CONTENT */}
          {type === 'terms' && (
            <div className="space-y-6 text-slate-650 text-xs leading-relaxed text-left">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3">
                <FileText className="w-5 h-5 text-indigo-650 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-805 text-xs">Persetujuan Hak Lisensi & Penggunaan</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Dengan membuat situs pemesanan kustom dan mendaftarkan workshop Anda di StitchFlow, Anda menyepakati aturan operasional di bawah ini guna menjaga keutuhan ekosistem bisnis konveksi.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-sm font-sans flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span> 1. Ketentuan Kelayakan & Akun Usaha
                </h3>
                <p>
                  Pemilik yang mendaftarkan konveksinya wajib memberikan informasi kontak WhatsApp dan nama badan konveksi yang sah. Anda bertanggung jawab penuh atas seluruh data invoice, persediaan stok kain, dan pesanan baju yang masuk melalui sistem whitelabel yang terikat pada slug domain Anda.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-sm font-sans flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span> 2. Skema Pembayaran & Kebijakan Masa Aktif Paket
                </h3>
                <p>
                  StitchFlow menyediakan opsi paket berlangganan fleksibel: <strong>Starter</strong>, <strong>Growth</strong>, dan <strong>Pro (Lengkap)</strong>.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10.5px] text-left border-collapse border border-slate-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="p-2.5 border-b border-slate-200">Jenis Paket</th>
                        <th className="p-2.5 border-b border-slate-200">Batasan Pemesanan</th>
                        <th className="p-2.5 border-b border-slate-200">Whitelabel Portal</th>
                        <th className="p-2.5 border-b border-slate-200">Kebijakan Akun</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      <tr>
                        <td className="p-2.5 font-bold">Starter</td>
                        <td className="p-2.5">Sampai 25 Order Aktif / bln</td>
                        <td className="p-2.5">❌ Tidak Tersedia</td>
                        <td className="p-2.5">Masa percobaan ditiadakan jika melebihi limit.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-indigo-600">Growth</td>
                        <td className="p-2.5">Sampai 120 Order Aktif / bln</td>
                        <td className="p-2.5">⭐ Standard Branding</td>
                        <td className="p-2.5">Notifikasi WhatsApp terkirim berkala.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-indigo-750">Pro</td>
                        <td className="p-2.5">♾️ Tanpa Batas (Unlimited)</td>
                        <td className="p-2.5">🟢 Full 100% Whitelabel Kustom</td>
                        <td className="p-2.5">Garansi uptime server 99.9% Cloud Run.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-sm font-sans flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span> 3. Disclaimer Tanggung Jawab Estimasi Harga
                </h3>
                <p>
                  Fitur kalkulator estimator yang disematkan di halaman pelanggan didesain untuk memudahkan visualisasi HPP bahan (kain fleece, katun, sablon, dll) dan margin keuntungan. Hasil hitungan calculator bersifat penawaran representatif. Semua penetapan harga akhir, kesepakatan desain, ketersediaan bahan jahit di gudang, dan kebijakan pemulangan barang cacat jahit tetap berada sepenuhnya di bawah kewenangan hukum workshop usaha Anda sendiri dengan pelanggan Anda.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-sm font-sans flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span> 4. Larangan Penyalahgunaan Platform
                </h3>
                <p>
                  Sistem Whitelabel StitchFlow dilarang keras digunakan untuk mendaftarkan konveksi fiktif yang sengaja didesain untuk melakukan penggalangan dana palsu, penipuan uang muka konsumen, mendistribusikan materi pornografi/intimidatif pada pola sablon pakaian, atau meretas basis data pengguna lain. StitchFlow berhak membekukan slug domain tanpa kompensasi refund jika ditemukan pelanggaran hukum siber yang terbukti.
                </p>
              </div>
            </div>
          )}

          {/* CONTACT SUPPORT HUBS */}
          {type === 'support' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
              
              {/* Form Side */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Send className="w-4 h-4 text-amber-500" />
                    Kirim Tiket Kendala Operasional Anda
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tim Support kami akan merespons langsung tiket kendala Anda melalui WhatsApp atau Email terdaftar dalam waktu maksimal 2 jam dalam jam kerja.
                  </p>
                </div>

                {supportSubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl space-y-3 text-center">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-lg">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Tiket Berhasil Terkirim!</h4>
                      <p className="text-[11px] text-emerald-800 leading-normal mt-1">
                        Terima kasih, tim Customer Experience StitchFlow telah menerima pesan Anda. Kami sedang memproses pengecekan sistem. Salinan konfirmasi tiket telah melesat ke kontak WhatsApp Anda.
                      </p>
                    </div>
                    <button 
                      onClick={() => setSupportSubmitted(false)}
                      className="text-[10px] font-bold text-emerald-700 hover:underline inline-block mt-1 cursor-pointer"
                    >
                      Kirim Tiket Baru Lagi
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSupportSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                          Nama Anda
                        </label>
                        <input 
                          type="text" 
                          required
                          value={supportName}
                          onChange={(e) => setSupportName(e.target.value)}
                          placeholder="Budi Setiawan" 
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                          Email Terdaftar
                        </label>
                        <input 
                          type="email" 
                          required
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          placeholder="budi@garmenjaya.com" 
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Kategori Masalah
                      </label>
                      <select 
                        value={supportCategory}
                        onChange={(e) => setSupportCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Rincian Masalah / Permohonan Bantuan
                      </label>
                      <textarea 
                        rows={4}
                        required
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        placeholder="Mohon jelaskan kendala operasional Anda (contoh: 'Saya baru mendaftar paket growth, tapi tombol whitelabel notifikasi WhatsApp saya tidak muncul di dashboard...')" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-medium"
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/15 transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Tiket Bantuan</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Info Side */}
              <div className="md:col-span-5 space-y-5 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">☎️ Saluran Kontak Resmi</h4>
                  <p className="text-[11px] text-slate-400">Hubungi Hotline pengembang kapan saja untuk konsultasi langsung.</p>
                </div>

                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">WhatsApp Hub Care (24/7)</p>
                      <p className="font-mono text-[11px] text-emerald-650 font-bold">+62 812-9000-1000</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Email Utama Korporat</p>
                      <p className="font-mono text-[11px] text-indigo-600 font-bold">support@stitchflow.co</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Hari & Jam Operasional</p>
                      <p className="text-[11px] text-slate-500">Senin - Sabtu: 08.00 - 17.00 WIB</p>
                      <p className="text-[9px] text-slate-400 italic">Chat di luar jam operasional diproses di pagi esok harinya.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 mt-2">
                  <p className="font-bold text-[11px] text-slate-800">Sertifikasi Server & Backup Keandalan</p>
                  <p className="text-[9.5px] text-slate-500 leading-normal">
                    Layanan server kami dimonitoring secara real-time pada port 3000 dan dioperasikan memakai Cloud Run Engine dengan jaminan backup snapshot otomatis data pesanan setiap 6 jam sekali.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENTATION VIEW */}
          {type === 'docs' && (
            <div className="space-y-6 text-left">
              
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input 
                  type="text"
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  placeholder="Cari kata kunci panduan jahit, HPP, Kanban, atau info DP / pembayaran..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-150 focus:border-indigo-500 font-medium bg-white"
                />
                {docSearch && (
                  <button 
                    onClick={() => setDocSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-650"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {/* Doc List Accordion */}
              <div className="space-y-4">
                {filteredDocSections.length > 0 ? (
                  filteredDocSections.map((sect) => (
                    <div 
                      key={sect.id} 
                      className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                        expandedDocSection === sect.id 
                          ? 'border-indigo-200 ring-2 ring-indigo-50/40 bg-indigo-50/5' 
                          : 'border-slate-150/80 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Section Toggle Accordion Header */}
                      <button 
                        onClick={() => setExpandedDocSection(expandedDocSection === sect.id ? null : sect.id)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                            expandedDocSection === sect.id
                              ? 'bg-indigo-100/50 border-indigo-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}>
                            {sect.icon}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{sect.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{sect.items.length} Topik Panduan Aktif</p>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          expandedDocSection === sect.id ? 'rotate-180 text-indigo-600' : ''
                        }`} />
                      </button>

                      {/* Accordion Body */}
                      {expandedDocSection === sect.id && (
                        <div className="px-5 pb-5 border-t border-slate-100 bg-white divide-y divide-slate-100 text-xs">
                          {sect.items.map((item, idx) => (
                            <div key={idx} className="py-4 space-y-2 first:pt-3 last:pb-1 text-left">
                              <h5 className="font-bold text-slate-805 flex items-start gap-2">
                                <span className="font-mono text-[9px] font-black text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">ASK</span>
                                <span className="leading-snug">{item.q}</span>
                              </h5>
                              <div className="pl-11 pr-2 text-slate-550 leading-relaxed text-[11.5px] flex items-start gap-2">
                                <CornerDownRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-0.5" />
                                <span>{item.a}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-450 border border-dashed border-slate-150 rounded-2xl space-y-2">
                    <p className="text-xs font-semibold">Tidak ditemukan hasil panduan untuk "{docSearch}"</p>
                    <p className="text-[10px] text-slate-400 max-w-sm mx-auto">Coba cari istilah lain yang umum seperti "jahit", "HPP", "cutting", "WhatsApp" atau "Sisa Pelunasan".</p>
                  </div>
                )}
              </div>

              {/* Help Quick Card */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
                <div>
                  <h4 className="font-bold text-xs text-indigo-200">Belum menemukan jawaban yang Anda cari?</h4>
                  <p className="text-[10px] text-slate-300 mt-1">Gunakan Support Hub kami untuk chat dengan Tim Pengonfigurasi Cloud System StitchFlow.</p>
                </div>
                <button
                  onClick={() => onSwitchType('support')}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-white text-white hover:text-indigo-950 font-bold text-[11px] rounded-lg shadow-sm transition-all text-center self-start md:self-auto cursor-pointer flex items-center gap-1"
                >
                  <span>Buka Support Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer / Fast navigation shortcuts */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400 font-semibold font-mono">
          <span>STITCHFLOW WEB-SYSTEM SUPPORT • PORTAL 3000</span>
          <span>BANTUAN SELALU TERSEDIA</span>
        </div>

      </div>
    </div>
  );
}
