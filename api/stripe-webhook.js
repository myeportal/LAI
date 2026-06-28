const Stripe = require('stripe');
const { Resend } = require('resend');
const { getBaseUrl, signDownloadToken } = require('../lib/delivery');

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error('Missing STRIPE_SECRET_KEY');
  return new Stripe(apiKey);
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  return new Resend(apiKey);
}

async function sendDeliveryEmail({ req, email, sessionId, paymentIntentId }) {
  const resend = getResendClient();
  const token = signDownloadToken({
    email,
    sessionId,
    paymentIntentId,
  });
  const downloadUrl = `${getBaseUrl(req)}/api/download?token=${encodeURIComponent(token)}`;
  const from = process.env.RESEND_FROM_EMAIL || 'ebook@leashingai.com';

  return resend.emails.send({
    from,
    to: email,
    subject: 'Your Leashing AI ebook is ready',
    html: `
      <div style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #101010;">
        <h1 style="font-size: 24px; margin-bottom: 12px;">Thanks for purchasing Leashing AI.</h1>
        <p>Your private ebook link is ready. Use the button below to download your PDF.</p>
        <p style="margin: 24px 0;">
          <a href="${downloadUrl}" style="display: inline-block; background: #111827; color: #ffffff; padding: 14px 22px; border-radius: 999px; text-decoration: none; font-weight: 600;">Download the ebook</a>
        </p>
        <p>This link expires automatically for security. If you need a fresh copy later, reply to this email.</p>
        <p>— Leashing AI</p>
      </div>
    `,
    text: `Thanks for purchasing Leashing AI. Download your ebook here: ${downloadUrl}\n\nThis private link expires automatically for security.`,
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripe = getStripeClient();
    const rawBody = await readRawBody(req);
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    }

    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const email = session.customer_details?.email || session.customer_email;
      const isPaid = session.payment_status === 'paid';

      if (email && isPaid) {
        await sendDeliveryEmail({
          req,
          email,
          sessionId: session.id,
          paymentIntentId: session.payment_intent || null,
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook failed', error);
    return res.status(400).json({ error: error.message || 'Webhook error' });
  }
};
