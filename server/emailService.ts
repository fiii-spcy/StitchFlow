import nodemailer from 'nodemailer';

interface EmailReceiptData {
  convectionName: string;
  ownerName: string;
  email: string;
  slug: string;
  packageType: string;
  paymentMethod?: string;
  orderId: string;
  amount: number;
  customerUrl: string;
  adminUrl: string;
}

/**
 * Creates a Nodemailer transporter.
 * In development: uses Ethereal (fake SMTP) — no real emails are sent,
 * but a preview URL is printed in the console.
 * In production: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env
 */
async function createTransporter() {
  if (process.env.SMTP_HOST) {
    // Production SMTP (e.g. Gmail, Mailgun, Sendgrid, etc.)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development: use Ethereal fake SMTP
    const testAccount = await nodemailer.createTestAccount();
    console.log('[Email] Using Ethereal test account:', testAccount.user);
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
}

const PACKAGE_LABELS: Record<string, string> = {
  starter: 'Starter',
  growth: 'Growth',
  enterprise: 'Enterprise',
};

const PACKAGE_PRICES: Record<string, number> = {
  starter: 299000,
  growth: 799000,
  enterprise: 1499000,
};

function buildEmailHTML(data: EmailReceiptData): string {
  const packageLabel = PACKAGE_LABELS[data.packageType] || data.packageType;
  const amount = data.amount || PACKAGE_PRICES[data.packageType] || 0;
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

  const date = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
  const fullCustomerUrl = `${baseUrl}${data.customerUrl}`;
  const fullAdminUrl = `${baseUrl}${data.adminUrl}`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bukti Pembayaran & Akses Sistem – StitchFlow</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 32px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 40px 40px 32px; text-align: center; }
    .logo-text { font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; }
    .logo-sub { font-size: 11px; color: rgba(255,255,255,0.7); letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-top: 16px; letter-spacing: 1px; text-transform: uppercase; }
    .body { padding: 40px; }
    .greeting { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
    .subtext { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 28px; }
    .receipt-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 28px; }
    .receipt-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 16px; }
    .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
    .receipt-row:last-child { border-bottom: none; padding-top: 12px; font-weight: 800; font-size: 15px; color: #0f172a; }
    .receipt-label { color: #64748b; }
    .receipt-value { color: #1e293b; font-weight: 600; text-align: right; }
    .total-label { color: #0f172a; }
    .total-value { color: #4f46e5; }
    .links-section { margin-bottom: 28px; }
    .links-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .link-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 10px; text-decoration: none; display: block; }
    .link-card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 4px; }
    .link-card-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
    .link-card-url { font-size: 12px; color: #4f46e5; word-break: break-all; }
    .btn { display: block; text-align: center; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 10px; margin-bottom: 10px; }
    .btn-outline { display: block; text-align: center; background: transparent; color: #4f46e5; text-decoration: none; font-size: 14px; font-weight: 700; padding: 13px 28px; border-radius: 10px; margin-bottom: 24px; border: 2px solid #e0e7ff; }
    .divider { height: 1px; background: #f1f5f9; margin: 28px 0; }
    .footer { text-align: center; padding: 24px 40px 32px; color: #94a3b8; font-size: 12px; line-height: 1.6; }
    .footer a { color: #4f46e5; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo-text">StitchFlow</div>
      <div class="logo-sub">Convection OS</div>
      <div class="badge">✅ Pembayaran Berhasil</div>
    </div>

    <div class="body">
      <div class="greeting">Selamat datang, ${data.ownerName}! 🎉</div>
      <div class="subtext">
        Sistem manajemen konveksi Anda <strong>${data.convectionName}</strong> telah aktif. 
        Berikut adalah bukti pembayaran dan tautan akses ke sistem Anda.
      </div>

      <div class="receipt-box">
        <div class="receipt-title">🧾 Bukti Pembayaran</div>
        <div class="receipt-row">
          <span class="receipt-label">Order ID</span>
          <span class="receipt-value" style="font-family:monospace;font-size:12px;">${data.orderId}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Tanggal</span>
          <span class="receipt-value">${date}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Nama Konveksi</span>
          <span class="receipt-value">${data.convectionName}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Slug / ID Unik</span>
          <span class="receipt-value" style="font-family:monospace;">${data.slug}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Paket</span>
          <span class="receipt-value">${packageLabel}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Metode Pembayaran</span>
          <span class="receipt-value">${data.paymentMethod || 'Transfer Bank'}</span>
        </div>
        <div class="receipt-row">
          <span class="total-label">Total Dibayar</span>
          <span class="total-value">${formattedAmount}</span>
        </div>
      </div>

      <div class="links-section">
        <div class="links-title">🔗 Tautan Akses Sistem Anda</div>

        <div class="link-card">
          <div class="link-card-label">👤 Portal Pelanggan</div>
          <div class="link-card-title">Halaman Pemesanan & Tracking untuk kustomer Anda</div>
          <div class="link-card-url">${fullCustomerUrl}</div>
        </div>

        <div class="link-card">
          <div class="link-card-label">⚙️ Dashboard Admin</div>
          <div class="link-card-title">Manajemen pesanan, inventaris & estimasi harga</div>
          <div class="link-card-url">${fullAdminUrl}</div>
        </div>
      </div>

      <a href="${fullAdminUrl}" class="btn">Buka Dashboard Admin Saya →</a>
      <a href="${fullCustomerUrl}" class="btn-outline">Lihat Portal Pelanggan</a>

      <div class="divider"></div>

      <div class="subtext" style="font-size:12px;margin-bottom:0;">
        💡 <strong>Tips:</strong> Bagikan tautan <em>Portal Pelanggan</em> kepada pelanggan Anda agar mereka bisa estimasi harga dan tracking pesanan secara mandiri. Simpan tautan <em>Dashboard Admin</em> hanya untuk Anda dan tim internal.
      </div>
    </div>

    <div class="footer">
      Email ini dikirim secara otomatis oleh <a href="#">StitchFlow Convection OS</a>.<br />
      Jangan balas email ini. Hubungi kami melalui WhatsApp jika ada pertanyaan.<br />
      <br />
      © ${new Date().getFullYear()} StitchFlow. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

export async function sendReceiptEmail(data: EmailReceiptData): Promise<{ success: boolean; previewUrl?: string; messageId?: string }> {
  try {
    const transporter = await createTransporter();

    const fromName = 'StitchFlow Convection OS';
    const fromEmail = process.env.SMTP_FROM || 'noreply@stitchflow.app';

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: data.email,
      subject: `✅ Pembayaran Berhasil – Selamat datang di StitchFlow, ${data.convectionName}!`,
      html: buildEmailHTML(data),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

    if (previewUrl) {
      console.log('[Email] ✅ Email terkirim (Ethereal/Test)!');
      console.log('[Email] 👁️  Pratinjau email:', previewUrl);
    } else {
      console.log('[Email] ✅ Email terkirim! Message ID:', info.messageId);
    }

    return { success: true, previewUrl: previewUrl?.toString(), messageId: info.messageId };
  } catch (err) {
    console.error('[Email] ❌ Gagal mengirim email:', err);
    return { success: false };
  }
}
