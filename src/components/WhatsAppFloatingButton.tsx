import React, { useState } from "react";

interface WhatsAppFloatingButtonProps {
  phoneNumber?: string;
  message?: string;
  label?: string;
}

export default function WhatsAppFloatingButton({
  phoneNumber = "6282172349762",
  message = "Halo StitchFlow, saya tertarik dengan platform digital untuk usaha konveksi dan ingin mendapatkan informasi lebih lanjut.",
  label = "Konsultasi Gratis via WhatsApp",
}: WhatsAppFloatingButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2.5 text-left"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Dynamic Floating Tooltip */}
      <div
        className={`bg-slate-900 text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg shadow-xl border border-slate-800 transition-all duration-300 transform flex items-center gap-1.5 whitespace-nowrap ${
          showTooltip
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
        <span>{label}</span>
      </div>

      {/* Floating Circular Green Action Button with pulse states */}
      <div className="relative group">
        {/* Subtle Outer Pulse Ring */}
        <span className="absolute -inset-1.5 bg-[#25D366]/40 rounded-full blur-md opacity-75 group-hover:scale-110 transition-transform duration-300 animate-pulse duration-[2000ms]"></span>

        {/* Real-time Indicator notification ping */}
        <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-rose-500 border-2 border-white rounded-full z-10 animate-bounce"></span>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:rotate-6 active:scale-95 cursor-pointer border border-[#25D366]/20"
          id="stitchflow-whatsapp-floating-btn"
          aria-label="Contact us on WhatsApp"
        >
          {/* Authentic WhatsApp SVG Logo */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-7 h-7 fill-white"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.173.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
