const { Resend } = require('resend');
const env = require('../config/env');
const supabase = require('../db/supabase');

const resend = new Resend(env.RESEND_API_KEY);

/**
 * Send a shipment notification email to the customer.
 *
 * @param {Object} params
 * @param {string} params.to                - Customer email address
 * @param {string} params.customerName
 * @param {string} params.externalId        - Our order reference
 * @param {string} params.trackingNumber
 * @param {string} params.carrier
 * @param {Array}  params.lineItems         - [{ name, colorway, quantity, price }]
 */
async function sendShipmentNotification(params) {
  const {
    to,
    customerName,
    externalId,
    trackingNumber,
    carrier,
    lineItems = [],
  } = params;

  const firstName = customerName.split(' ')[0] || customerName;

  const carrierTrackingUrls = {
    USPS:  `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    UPS:   `https://www.ups.com/track?tracknum=${trackingNumber}`,
    FedEx: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    DHL:   `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${trackingNumber}`,
  };
  const trackingUrl =
    carrierTrackingUrls[carrier?.toUpperCase()] ||
    `https://www.google.com/search?q=${encodeURIComponent(`${carrier} tracking ${trackingNumber}`)}`;

  const itemsHtml = lineItems
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#374151;font-family:'Inter',sans-serif;">${item.name} — ${item.colorway || ''}</td>
          <td style="padding:8px 0;font-size:13px;color:#374151;text-align:center;font-family:'Inter',sans-serif;">×${item.quantity}</td>
          <td style="padding:8px 0;font-size:13px;color:#111827;text-align:right;font-weight:600;font-family:'Inter',sans-serif;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your AYITI Heritage order has shipped!</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Inter',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;text-transform:uppercase;">
                AYITI<span style="color:#C8102E;">.</span><span style="color:#002060;">H</span>
              </p>
              <p style="margin:8px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9ca3af;">Heritage Studio</p>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background:#C8102E;padding:16px 40px;text-align:center;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;">
                📦 Your Order Has Shipped
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">

              <p style="margin:0 0 16px;font-size:16px;color:#111827;font-weight:600;">Hi ${firstName},</p>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
                Great news — your AYITI Heritage order is on its way! Your hat has been carefully packed and handed over to ${carrier || 'the carrier'}.
              </p>

              <!-- Tracking Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">Tracking Number</p>
                    <p style="margin:0 0 16px;font-size:20px;font-weight:800;color:#111827;letter-spacing:1px;">${trackingNumber}</p>
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">Carrier</p>
                    <p style="margin:0 0 20px;font-size:14px;color:#374151;font-weight:600;">${carrier || 'Standard Carrier'}</p>
                    <a href="${trackingUrl}" style="display:inline-block;background:#111827;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:12px 28px;border-radius:999px;text-decoration:none;">
                      Track Your Package →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Order Summary -->
              <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">Order Summary — #${externalId.slice(0, 8).toUpperCase()}</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;margin-bottom:32px;">
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;line-height:1.6;">
                Questions? Reply to this email or reach us at <a href="mailto:support@ayitiheritage.com" style="color:#C8102E;">support@ayitiheritage.com</a>
              </p>
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                Thank you for carrying your heritage. <strong style="color:#111827;">L'Union Fait la Force.</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">© ${new Date().getFullYear()} AYITI Heritage. All rights reserved.</p>
              <p style="margin:4px 0 0;font-size:11px;color:#d1d5db;">Powered by Printful API + Headless Commerce</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const { data, error } = await resend.emails.send({
    from:    env.RESEND_FROM_EMAIL,
    to:      [to],
    subject: `Your AYITI Heritage order has shipped! 📦 Tracking: ${trackingNumber}`,
    html,
  });

  try {
    await supabase.from('email_logs').insert({
      external_id: externalId,
      email_type:  'shipment_notification',
      recipient:   to,
      resend_id:   data?.id || null,
      status:      error ? 'failed' : 'sent',
      error:       error ? error.message : null,
    });
  } catch (_) {}

  if (error) {
    console.error('[Email] Resend failed:', error);
    throw new Error(`Failed to send shipment email: ${error.message}`);
  }

  return data;
}

/**
 * Send an order confirmation email right after payment is captured.
 *
 * @param {Object} params
 * @param {string} params.to
 * @param {string} params.customerName
 * @param {string} params.externalId
 * @param {Array}  params.lineItems
 * @param {number} params.totalAmount
 */
async function sendOrderConfirmation(params) {
  const { to, customerName, externalId, lineItems = [], totalAmount } = params;
  const firstName = customerName.split(' ')[0] || customerName;

  const itemsHtml = lineItems
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#374151;">${item.name} — ${item.colorway || ''}</td>
          <td style="padding:8px 0;font-size:13px;color:#374151;text-align:center;">×${item.quantity}</td>
          <td style="padding:8px 0;font-size:13px;color:#111827;text-align:right;font-weight:600;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Order Confirmed — AYITI Heritage</title></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Inter',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:#111827;padding:32px 40px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;text-transform:uppercase;">AYITI<span style="color:#C8102E;">.</span><span style="color:#002060;">H</span></p>
          <p style="margin:8px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9ca3af;">Heritage Studio</p>
        </td></tr>
        <tr><td style="background:#18453B;padding:16px 40px;text-align:center;">
          <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffffff;">✅ Order Confirmed</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 16px;font-size:16px;color:#111827;font-weight:600;">Hi ${firstName},</p>
          <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">Your order has been confirmed and sent to our Printful fulfillment center for production. We'll send you another email with tracking info once it ships.</p>
          <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">Order #${externalId.slice(0, 8).toUpperCase()}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;margin-bottom:16px;"><tbody>${itemsHtml}</tbody></table>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #111827;padding-top:12px;">
            <tr>
              <td style="font-size:14px;font-weight:700;color:#111827;">Total Charged</td>
              <td style="font-size:16px;font-weight:900;color:#111827;text-align:right;">$${totalAmount.toFixed(2)}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9ca3af;">© ${new Date().getFullYear()} AYITI Heritage. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from:    env.RESEND_FROM_EMAIL,
    to:      [to],
    subject: `Order Confirmed — AYITI Heritage #${externalId.slice(0, 8).toUpperCase()}`,
    html,
  });

  try {
    await supabase.from('email_logs').insert({
      external_id: externalId,
      email_type:  'order_confirmation',
      recipient:   to,
      resend_id:   data?.id || null,
      status:      error ? 'failed' : 'sent',
      error:       error ? error.message : null,
    });
  } catch (_) {}

  if (error) {
    console.error('[Email] Order confirmation send failed:', error);
  }

  return data;
}

module.exports = {
  sendShipmentNotification,
  sendOrderConfirmation,
};
