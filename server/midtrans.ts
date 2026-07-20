import 'dotenv/config';
import express from 'express';
import https from 'https';

const router = express.Router();

// ── Midtrans config from environment ──
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

const MIDTRANS_SNAP_URL = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

const PLAN_PRICE: Record<string, number> = {
  starter: 199000,
  growth: 399000,
  pro: 699000,
};

// ── POST /api/midtrans/snap-token ──
// Body: { orderId, plan, name, phone }
router.post('/snap-token', async (req: express.Request, res: express.Response) => {
  try {
    const { orderId, plan, name, phone } = req.body as {
      orderId: string;
      plan: string;
      name: string;
      phone: string;
    };

    if (!orderId || !plan || !name) {
      res.status(400).json({ error: 'Missing required fields: orderId, plan, name' });
      return;
    }

    const amount = PLAN_PRICE[plan] ?? 199000;

    // Build Midtrans Snap payload
    const payload = JSON.stringify({
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: name,
        phone: phone || '',
      },
      item_details: [
        {
          id: `stitchflow-${plan}`,
          price: amount,
          quantity: 1,
          name: `StitchFlow Paket ${plan.charAt(0).toUpperCase() + plan.slice(1)} (1 Bulan)`,
        },
      ],
      callbacks: {
        finish: process.env.APP_URL ? `${process.env.APP_URL}/` : '/',
      },
    });

    // Base64-encode the server key (Basic Auth)
    const authHeader = `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')}`;

    const url = new URL(MIDTRANS_SNAP_URL);

    const snapToken = await new Promise<string>((resolve, reject) => {
      const options: https.RequestOptions = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authHeader,
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const request = https.request(options, (midtransRes) => {
        let data = '';
        midtransRes.on('data', (chunk) => (data += chunk));
        midtransRes.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.token) {
              resolve(parsed.token);
            } else {
              reject(new Error(parsed.error_messages?.join(', ') || 'No token returned from Midtrans'));
            }
          } catch {
            reject(new Error('Failed to parse Midtrans response'));
          }
        });
      });

      request.on('error', reject);
      request.write(payload);
      request.end();
    });

    res.json({ token: snapToken, orderId });
  } catch (err: any) {
    console.error('[Midtrans] snap-token error:', err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
