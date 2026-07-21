import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import midtransRouter from './midtrans.js';
import { sendReceiptEmail } from './emailService.js';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());

// ── API Routes ──
app.use('/api/midtrans', midtransRouter);

// ── Email Receipt Route ──
app.post('/api/email/send-receipt', async (req, res) => {
  try {
    const data = req.body;
    if (!data.email || !data.convectionName || !data.slug) {
      res.status(400).json({ error: 'Data tidak lengkap: email, convectionName, dan slug wajib diisi.' });
      return;
    }
    const result = await sendReceiptEmail(data);
    if (result.success) {
      res.json({ success: true, previewUrl: result.previewUrl, messageId: result.messageId });
    } else {
      res.status(500).json({ success: false, error: 'Gagal mengirim email.' });
    }
  } catch (err) {
    console.error('[Email Route] Error:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ── Serve built React app in production ──
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[StitchFlow Server] Running on port ${PORT}`);
  console.log(`[Midtrans] Mode: ${process.env.MIDTRANS_IS_PRODUCTION === 'true' ? 'PRODUCTION' : 'SANDBOX'}`);
});
