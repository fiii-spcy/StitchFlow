import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { WhatsAppNotification } from '../types';
import { Check, CheckCheck, Send, Phone, Video, MoreVertical, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function WhatsAppMockup() {
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read notification history from Firestore with real-time listening
    const q = query(
      collection(db, 'whatsapp_notifications'),
      orderBy('sentAt', 'desc'),
      limit(25)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: WhatsAppNotification[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as WhatsAppNotification);
      });
      // Sort in ascending order for display inside chat thread
      setNotifications(msgs.reverse());

      // If we don't have a selected chat, set it to the most recent customer phone
      if (msgs.length > 0) {
        // Find most recent unique phone
        const uniquePhones = Array.from(new Set(msgs.map(m => m.customerPhone)));
        if (uniquePhones.length > 0 && !selectedChat) {
          setSelectedChat(uniquePhones[uniquePhones.length - 1]);
        }
      }
    }, (error) => {
      console.error("Firestore loading error for notifications: ", error);
    });

    return () => unsubscribe();
  }, []);

  // Scroll to bottom when new messages stream in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [notifications, selectedChat]);

  // Group notifications by customer phone number
  interface ThreadDetails {
    customerName: string;
    customerPhone: string;
    lastMessage: string;
    lastTimestamp: number;
    messages: WhatsAppNotification[];
  }

  const chatThreads = notifications.reduce<Record<string, ThreadDetails>>((acc, msg) => {
    const key = msg.customerPhone;
    if (!acc[key]) {
      acc[key] = {
        customerName: msg.customerName,
        customerPhone: msg.customerPhone,
        lastMessage: msg.message,
        lastTimestamp: msg.sentAt,
        messages: []
      };
    }
    acc[key].messages.push(msg);
    // update newest fields
    if (msg.sentAt > acc[key].lastTimestamp) {
      acc[key].lastMessage = msg.message;
      acc[key].lastTimestamp = msg.sentAt;
    }
    return acc;
  }, {});

  const threadsList: ThreadDetails[] = Object.keys(chatThreads)
    .map(key => chatThreads[key])
    .sort((a, b) => b.lastTimestamp - a.lastTimestamp);

  const activeThread = selectedChat ? chatThreads[selectedChat] : threadsList[0];

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Design': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Cutting': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Sewing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'QC': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Ready': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-[560px] max-h-[560px]">
      {/* Threads list sidebar - 4 cols */}
      <div className="md:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden h-full">
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-900 text-sm">Target Notifikasi</h3>
            <p className="text-[10px] text-slate-500">Live synchronized WhatsApp threads</p>
          </div>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {threadsList.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
              <ShieldAlert className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Belum ada notifikasi terkirim.
              </p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[160px] text-center mx-auto">
                Silahkan buat atau ubah status pesanan untuk memicu pesan WhatsApp.
              </p>
            </div>
          ) : (
            threadsList.map((thread) => (
              <button
                key={thread.customerPhone}
                onClick={() => setSelectedChat(thread.customerPhone)}
                className={`w-full p-3.5 text-left transition-all flex items-start gap-3 ${
                  selectedChat === thread.customerPhone
                    ? 'bg-emerald-50/60 border-l-4 border-emerald-600'
                    : 'hover:bg-slate-50 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm tracking-wide flex-shrink-0">
                  {thread.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-medium text-slate-900 text-xs truncate max-w-[120px]">
                      {thread.customerName}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {formatTime(thread.lastTimestamp)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate tracking-tight mb-1">
                    {thread.customerPhone}
                  </p>
                  <p className="text-[10px] text-slate-600 truncate font-sans leading-normal">
                    {thread.lastMessage}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main smartphone frame - 8 cols */}
      <div className="md:col-span-8 bg-slate-900 rounded-3xl p-3 border-4 border-slate-950 shadow-2xl relative overflow-hidden flex flex-col h-full select-none">
        {/* Notch details */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4.5 bg-slate-950 rounded-b-2xl z-20 flex items-center justify-around px-4">
          <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800"></div>
          <div className="w-12 h-1 bg-slate-900 rounded"></div>
        </div>

        {activeThread ? (
          <div className="flex-1 rounded-2xl overflow-hidden flex flex-col bg-amber-50 bg-[radial-gradient(#dfdcd6_1px,transparent_1px)] [background-size:16px_16px] h-full relative">
            
            {/* WA Header */}
            <div className="bg-[#075e54] text-white p-3 pt-6 flex items-center justify-between z-10 flex-shrink-0 shadow-md">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedChat(null)} 
                  className="md:hidden text-white/80 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-8 h-8 rounded-full bg-white/20 text-white font-bold flex items-center justify-center text-xs">
                  {activeThread.customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-semibold leading-none">{activeThread.customerName}</h4>
                  <p className="text-[9px] text-teal-100 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span>Online / StitchFlow Realtime</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 text-white/90">
                <Video className="w-4 h-4 cursor-pointer hover:text-white" />
                <Phone className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
                <MoreVertical className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
              </div>
            </div>

            {/* WA Chat Feed Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 pt-14 pb-4"
              style={{ paddingBottom: '70px' }}
            >
              {/* Security Shield Label */}
              <div className="flex justify-center my-1">
                <span className="bg-amber-100 text-amber-800 text-[9px] px-3 py-1 rounded-md text-center max-w-[200px] border border-amber-200/50 leading-relaxed shadow-sm">
                  🔒 Info: Chat diamankan enkripsi StitchFlow. Sistem server secara otomatis memperbarui status rincian produksi konveksi.
                </span>
              </div>

              {activeThread.messages.map((msg) => (
                <div key={msg.id} className="flex flex-col items-end">
                  <div className="bg-[#dcf8c6] border border-[#ceddb4] p-3 rounded-2xl rounded-tr-none max-w-[85%] text-slate-800 text-xs shadow-sm shadow-slate-200 relative group animate-fade-in">
                    
                    {/* Status Target Pill inside WA */}
                    <div className="flex items-center justify-between gap-2 border-b border-dashed border-[#ceddb4]/70 pb-1.5 mb-1.5">
                      <span className="text-[10px] font-bold text-emerald-800 truncate">
                        🏷️ SKU: {msg.skuTitle}
                      </span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded border leading-none font-semibold ${getStatusBadgeColor(msg.status)}`}>
                        {msg.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="whitespace-pre-line text-xs leading-normal font-sans text-slate-800">
                      {msg.message}
                    </p>

                    <div className="flex items-center justify-end gap-1 text-[9px] text-slate-500 font-mono mt-1.5">
                      <span>{formatTime(msg.sentAt)}</span>
                      {msg.isSent ? (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated Keyboard Entry and Input Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#f0f0f0] p-2 border-t border-slate-200 flex items-center gap-1.5 z-10">
              <div className="flex-1 bg-white rounded-full px-3.5 py-2 border border-slate-200 text-slate-400 text-xs font-sans text-left flex items-center">
                Balasan dinonaktifkan (Simulasi Bot Log)
              </div>
              <button 
                type="button" 
                disabled
                className="w-9 h-9 text-white bg-[#075e54]/50 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          <div className="flex-1 rounded-2xl overflow-hidden flex flex-col justify-center items-center bg-slate-950 p-6 text-center select-none">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-slate-600 animate-pulse" />
            </div>
            <h4 className="text-sm font-semibold text-white font-display">Hubungkan Log WhatsApp</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[220px] leading-relaxed">
              Disini, Anda akan melihat simulasi obrolan WA pelanggan secara real-time saat status produksi diperbarui di Dashboard!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
