import { Resend } from "resend"

export const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM_EMAIL ?? "orders@melsplace.com"
const OWNER = process.env.STORE_OWNER_EMAIL ?? "mel@melsplace.com"

export async function sendOrderConfirmationEmail({
  to,
  customerName,
  orderNumber,
  orderTotal,
  items,
  fulfillmentType,
}: {
  to: string
  customerName: string
  orderNumber: string
  orderTotal: string
  items: Array<{ name: string; quantity: number; price: string }>
  fulfillmentType: "delivery" | "pickup"
}) {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;">${item.name} × ${item.quantity}</td>
          <td style="padding:8px 0;text-align:right;">${item.price}</td>
        </tr>`
    )
    .join("")

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://melsplaceonline.com"
  await resend.emails.send({
    from: `Mel's Place <${FROM}>`,
    to,
    subject: `Order Confirmed — ${orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <div style="background:#F59E0B;padding:24px;text-align:center;">
          <img src="${appUrl}/logo.png" alt="Mel's Place" width="60" height="60" style="border-radius:50%;border:3px solid rgba(255,255,255,0.8);margin-bottom:10px;" />
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Mel&apos;s Place</h1>
          <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">Order Confirmation</p>
        </div>
        <div style="padding:32px 24px;">
          <h2 style="color:#1c1c1c;">Hi ${customerName}, your order is confirmed!</h2>
          <p style="color:#555;">Order number: <strong>${orderNumber}</strong></p>
          <p style="color:#555;">
            ${fulfillmentType === "pickup"
              ? "You've chosen <strong>in-store pickup</strong> at our Charlotte, NC location. We'll notify you when it's ready."
              : "We'll contact you to arrange delivery."}
          </p>
          <table style="width:100%;border-top:1px solid #eee;margin-top:16px;">
            ${itemsHtml}
            <tr style="border-top:2px solid #F59E0B;">
              <td style="padding:12px 0;font-weight:bold;">Total</td>
              <td style="padding:12px 0;font-weight:bold;text-align:right;">${orderTotal}</td>
            </tr>
          </table>
          <p style="color:#555;margin-top:24px;">
            Questions? Reply to this email or visit our <a href="${appUrl}/contact" style="color:#F59E0B;">contact page</a>.
          </p>
        </div>
        <div style="background:#f5f5f5;padding:16px 24px;text-align:center;color:#999;font-size:12px;">
          <img src="${appUrl}/logo.png" alt="" width="24" height="24" style="border-radius:50%;vertical-align:middle;margin-right:6px;" />
          Mel&apos;s Place · Charlotte, NC · Authentic African Food
        </div>
      </div>
    `,
  })
}

export async function sendNewOrderNotification({
  orderNumber,
  customerName,
  orderTotal,
}: {
  orderNumber: string
  customerName: string
  orderTotal: string
}) {
  await resend.emails.send({
    from: `Mel's Place <${FROM}>`,
    to: OWNER,
    subject: `New Order: ${orderNumber}`,
    html: `
      <p>You have a new order from <strong>${customerName}</strong>.</p>
      <p>Order: <strong>${orderNumber}</strong> — Total: <strong>${orderTotal}</strong></p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders">View in dashboard →</a></p>
    `,
  })
}

export async function sendContactNotification({
  name,
  email,
  subject,
  type,
  message,
}: {
  name: string
  email: string
  subject: string
  type: string
  message: string
}) {
  await resend.emails.send({
    from: `Mel's Place <${FROM}>`,
    to: OWNER,
    subject: `[${type.toUpperCase()}] ${subject}`,
    html: `
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr/>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `,
  })
}
