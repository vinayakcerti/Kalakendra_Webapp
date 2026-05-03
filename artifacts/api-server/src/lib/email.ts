import { Resend } from "resend";
import { logger } from "./logger";

export interface PaymentNotificationParams {
  schoolContactEmail: string;
  studentName: string;
  feeDescription: string;
  amountOre: number;
  paymentReference: string;
  feeId: string;
}

export async function sendPaymentNotification(params: PaymentNotificationParams): Promise<void> {
  const client = getClient();
  if (!client) {
    logger.warn("RESEND_API_KEY not set — skipping payment notification email");
    return;
  }
  const { schoolContactEmail, studentName, feeDescription, amountOre, paymentReference, feeId } = params;
  const amount = (amountOre / 100).toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 });
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F4EBD9;font-family:'Georgia',serif;color:#1F1612;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EBD9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:#3D0A0C;padding:28px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#B8893A;">Payment Received</p>
          <h1 style="margin:8px 0 0;font-size:24px;font-weight:400;color:#F4EBD9;letter-spacing:1px;">Kala Kendra Sweden</h1>
        </td></tr>
        <tr><td style="background:#B8893A;height:2px;"></td></tr>
        <tr><td style="background:#ffffff;padding:36px 48px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">A student has submitted a payment notification and is awaiting confirmation.</p>
          <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:24px 0;">
            <tr style="border-bottom:1px solid #e8e0d6;">
              <td style="padding:10px 0;font-size:13px;color:#7a6a58;width:40%;">Student</td>
              <td style="padding:10px 0;font-size:14px;font-weight:600;">${studentName}</td>
            </tr>
            <tr style="border-bottom:1px solid #e8e0d6;">
              <td style="padding:10px 0;font-size:13px;color:#7a6a58;">Fee</td>
              <td style="padding:10px 0;font-size:14px;">${feeDescription}</td>
            </tr>
            <tr style="border-bottom:1px solid #e8e0d6;">
              <td style="padding:10px 0;font-size:13px;color:#7a6a58;">Amount</td>
              <td style="padding:10px 0;font-size:14px;font-weight:600;">${amount}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;font-size:13px;color:#7a6a58;">Reference</td>
              <td style="padding:10px 0;font-size:14px;font-family:monospace;">${paymentReference}</td>
            </tr>
          </table>
          <p style="margin:0;font-size:13px;color:#7a6a58;">Fee ID: <code>${feeId}</code></p>
          <p style="margin:20px 0 0;font-size:14px;line-height:1.7;color:#1F1612;">
            Please verify the payment in your bank account and then mark it as <strong>Paid</strong> in the admin portal.
          </p>
        </td></tr>
        <tr><td style="background:#B8893A;height:2px;"></td></tr>
        <tr><td style="background:#F4EBD9;padding:16px 48px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#7a6a58;">Kala Kendra Sweden · Administration</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  try {
    const r = await client.emails.send({
      from: FROM,
      to: schoolContactEmail,
      subject: `Payment notification: ${studentName} — ${feeDescription}`,
      html,
    });
    logger.info({ feeId, to: schoolContactEmail, id: r.data?.id }, "Payment notification email sent");
  } catch (err) {
    logger.error({ err, feeId }, "Failed to send payment notification email");
  }
}

export interface FeeReminderParams {
  to: string;
  studentName: string;
  feeDescription: string;
  amountOre: number;
  dueDate: string | null;
  portalUrl: string;
}

export async function sendFeeReminder(params: FeeReminderParams): Promise<void> {
  const client = getClient();
  if (!client) {
    logger.warn("RESEND_API_KEY not set — skipping fee reminder email");
    return;
  }
  const { to, studentName, feeDescription, amountOre, dueDate, portalUrl } = params;
  const amount = (amountOre / 100).toLocaleString("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 });
  const dueLine = dueDate
    ? `<tr style="border-bottom:1px solid #e8e0d6;"><td style="padding:10px 0;font-size:13px;color:#7a6a58;width:40%;">Due date</td><td style="padding:10px 0;font-size:14px;font-weight:600;color:#8B1A1C;">${new Date(dueDate).toLocaleDateString("en-SE", { day: "numeric", month: "long", year: "numeric" })}</td></tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F4EBD9;font-family:'Georgia',serif;color:#1F1612;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EBD9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:#3D0A0C;padding:28px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#B8893A;">Fee Reminder</p>
          <h1 style="margin:8px 0 0;font-size:24px;font-weight:400;color:#F4EBD9;letter-spacing:1px;">Kala Kendra Sweden</h1>
        </td></tr>
        <tr><td style="background:#B8893A;height:2px;"></td></tr>
        <tr><td style="background:#ffffff;padding:36px 48px;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;">Dear ${studentName},</p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#5a4a3a;">This is a gentle reminder that the following fee is outstanding on your account:</p>
          <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:24px 0;border:1px solid #e8e0d6;">
            <tr style="border-bottom:1px solid #e8e0d6;"><td style="padding:10px 14px;font-size:13px;color:#7a6a58;width:40%;background:#faf7f2;">Fee</td><td style="padding:10px 14px;font-size:14px;">${feeDescription}</td></tr>
            <tr style="border-bottom:1px solid #e8e0d6;"><td style="padding:10px 14px;font-size:13px;color:#7a6a58;background:#faf7f2;">Amount</td><td style="padding:10px 14px;font-size:15px;font-weight:700;color:#3D0A0C;">${amount}</td></tr>
            ${dueLine}
          </table>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#5a4a3a;">
            To settle this fee, please log in to your student portal and mark it as paid by entering your payment reference (Swish number, bank transfer reference, etc.).
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${portalUrl}" style="display:inline-block;background:#3D0A0C;color:#F4EBD9;text-decoration:none;padding:14px 40px;font-size:14px;letter-spacing:1px;">
              Open Student Portal &rarr;
            </a>
          </div>
          <p style="margin:24px 0 0;font-size:13px;color:#9a8a78;line-height:1.6;">
            If you have already made payment, please ignore this reminder or contact us to confirm.
          </p>
        </td></tr>
        <tr><td style="background:#B8893A;height:2px;"></td></tr>
        <tr><td style="background:#F4EBD9;padding:16px 48px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#7a6a58;">Kala Kendra Sweden · namaskaram@kalakendra.se</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  try {
    const r = await client.emails.send({
      from: FROM,
      to,
      subject: `Fee reminder: ${feeDescription} — ${amount}`,
      html,
    });
    logger.info({ to, id: r.data?.id }, "Fee reminder email sent");
  } catch (err) {
    logger.error({ err, to }, "Failed to send fee reminder email");
    throw err;
  }
}

export interface MagicLinkParams {
  to: string;
  studentName: string;
  link: string;
}

export interface PortalInviteParams {
  to: string;
  studentName: string;
  link: string;
}

export interface EmailVerificationParams {
  to: string;
  studentName: string;
  link: string;
}

export async function sendEmailVerification(params: EmailVerificationParams): Promise<void> {
  const client = getClient();
  if (!client) {
    logger.warn("RESEND_API_KEY not set — skipping email verification");
    return;
  }
  const { to, studentName, link } = params;
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F4EBD9;font-family:'Georgia',serif;color:#1F1612;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EBD9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:#3D0A0C;padding:36px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#B8893A;">Kala Kendra Sweden</p>
          <h1 style="margin:10px 0 4px;font-size:26px;font-weight:400;color:#F4EBD9;letter-spacing:1px;">Verify Your Email</h1>
          <p style="margin:0;font-size:13px;color:#F4EBD9;opacity:0.65;">Student Portal Registration</p>
        </td></tr>
        <tr><td style="background:#B8893A;height:3px;"></td></tr>
        <tr><td style="background:#ffffff;padding:44px 48px;">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#1F1612;">Namaskaram, ${studentName},</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#3a2e27;">
            We received a request to link this email address to your student record at Kala Kendra Sweden.
            Click the button below to confirm and gain access to the student portal.
          </p>
          <p style="margin:0 0 28px;font-size:14px;color:#7a6a58;line-height:1.6;">
            This link is valid for <strong>30 minutes</strong>. If you did not make this request, please ignore this email — your record will not be changed.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 36px;">
            <tr><td style="background:#3D0A0C;">
              <a href="${link}" style="display:block;padding:16px 36px;font-size:13px;color:#F4EBD9;text-decoration:none;font-family:Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;">
                Verify &amp; Sign In &rarr;
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 10px;font-size:13px;color:#7a6a58;">If the button doesn't work, paste this link into your browser:</p>
          <p style="margin:0;font-size:12px;color:#7a6a58;word-break:break-all;">${link}</p>
        </td></tr>
        <tr><td style="background:#B8893A;height:3px;"></td></tr>
        <tr><td style="background:#3D0A0C;padding:20px 48px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#F4EBD9;opacity:0.6;letter-spacing:1px;">Kala Kendra Sweden · Gothenburg</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  try {
    const r = await client.emails.send({
      from: FROM,
      to,
      subject: "Verify your email — Kala Kendra Sweden Student Portal",
      html,
    });
    logger.info({ to, id: r.data?.id }, "Email verification sent");
  } catch (err) {
    logger.error({ err, to }, "Failed to send email verification");
  }
}

export async function sendPortalInvite(params: PortalInviteParams): Promise<void> {
  const client = getClient();
  if (!client) {
    logger.warn("RESEND_API_KEY not set — skipping portal invite email");
    return;
  }
  const { to, studentName, link } = params;
  const html = _portalInviteHtml(studentName, link);
  try {
    const r = await client.emails.send({
      from: FROM,
      to,
      subject: "You're invited — Kala Kendra Sweden Student Portal",
      html,
    });
    logger.info({ to, id: r.data?.id }, "Portal invite email sent");
  } catch (err) {
    logger.error({ err, to }, "Failed to send portal invite email");
  }
}

function _portalInviteHtml(studentName: string, link: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Kala Kendra Sweden — Student Portal Invitation</title></head>
<body style="margin:0;padding:0;background:#F4EBD9;font-family:'Georgia',serif;color:#1F1612;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EBD9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#3D0A0C;padding:36px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#B8893A;">Kala Kendra Sweden</p>
          <h1 style="margin:10px 0 4px;font-size:28px;font-weight:400;color:#F4EBD9;letter-spacing:1px;">Student Portal</h1>
          <p style="margin:0;font-size:13px;color:#F4EBD9;opacity:0.65;">Your personal space to manage your enrolment</p>
        </td></tr>
        <tr><td style="background:#B8893A;height:3px;"></td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:44px 48px;">
          <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#1F1612;">Namaskaram, ${studentName},</p>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#3a2e27;">
            We have launched the <strong>Kala Kendra Sweden Student Portal</strong> — your personal space where you can:
          </p>

          <!-- Feature list -->
          <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 28px;">
            ${[
              ["View your attendance record and monthly summary", "#B8893A"],
              ["Check and manage your fee payments (pay via Swish)", "#B8893A"],
              ["Update your personal and contact details", "#B8893A"],
              ["See school announcements and term schedules", "#B8893A"],
            ].map(([text]) => `
            <tr>
              <td style="padding:7px 0;vertical-align:top;width:20px;">
                <span style="color:#B8893A;font-size:16px;">✦</span>
              </td>
              <td style="padding:7px 0 7px 12px;font-size:14px;color:#3a2e27;line-height:1.6;">${text}</td>
            </tr>`).join("")}
          </table>

          <!-- Divider -->
          <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 28px;">
            <tr>
              <td style="border-top:1px solid #e8e0d6;"></td>
              <td style="width:32px;text-align:center;padding:0 12px;font-size:16px;color:#B8893A;">✦</td>
              <td style="border-top:1px solid #e8e0d6;"></td>
            </tr>
          </table>

          <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#1F1612;">
            <strong>Click the button below to sign in and update your details.</strong>
          </p>
          <p style="margin:0 0 28px;font-size:14px;color:#7a6a58;line-height:1.6;">
            This link is valid for <strong>15 minutes</strong>. No password needed — just click to sign in instantly.
          </p>

          <!-- CTA button -->
          <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
            <tr><td style="background:#3D0A0C;">
              <a href="${link}" style="display:block;padding:16px 36px;font-size:13px;color:#F4EBD9;text-decoration:none;font-family:Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;">
                Sign In to Portal &rarr;
              </a>
            </td></tr>
          </table>

          <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:#7a6a58;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="margin:0 0 28px;font-size:12px;color:#7a6a58;word-break:break-all;">${link}</p>

          <p style="margin:0;font-size:13px;color:#7a6a58;line-height:1.7;">
            If you have any questions, contact us at
            <a href="mailto:kalakendrasweden@gmail.com" style="color:#5C1416;">kalakendrasweden@gmail.com</a>.
          </p>
        </td></tr>

        <tr><td style="background:#B8893A;height:3px;"></td></tr>
        <tr><td style="background:#3D0A0C;padding:20px 48px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#F4EBD9;opacity:0.6;letter-spacing:1px;">
            Kala Kendra Sweden · Gothenburg · kalakendrasweden@gmail.com
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendMagicLink(params: MagicLinkParams): Promise<void> {
  const client = getClient();
  if (!client) {
    logger.warn("RESEND_API_KEY not set — skipping magic link email");
    return;
  }
  const { to, studentName, link } = params;
  const html = _magicLinkHtml(studentName, link);
  try {
    const r = await client.emails.send({
      from: FROM,
      to,
      subject: "Your Kala Kendra student portal sign-in link",
      html,
    });
    logger.info({ to, id: r.data?.id }, "Magic link email sent");
  } catch (err) {
    logger.error({ err, to }, "Failed to send magic link email");
  }
}

function _magicLinkHtml(studentName: string, link: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Kala Kendra Sweden — Sign in</title></head>
<body style="margin:0;padding:0;background:#F4EBD9;font-family:'Georgia',serif;color:#1F1612;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EBD9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:#3D0A0C;padding:32px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#B8893A;font-family:'Georgia',serif;">Student Portal</p>
          <h1 style="margin:10px 0 0;font-size:28px;font-weight:400;color:#F4EBD9;font-family:'Georgia',serif;letter-spacing:1px;">Kala Kendra Sweden</h1>
        </td></tr>
        <tr><td style="background:#B8893A;height:2px;"></td></tr>
        <tr><td style="background:#ffffff;padding:40px 48px;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#1F1612;">Dear ${studentName},</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#1F1612;">
            Click the button below to sign in to your student portal. This link is valid for <strong>15 minutes</strong> and can only be used once.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:32px 0;">
            <tr><td style="background:#3D0A0C;border-radius:4px;">
              <a href="${link}" style="display:block;padding:14px 32px;font-size:14px;color:#F4EBD9;text-decoration:none;font-family:Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">
                Sign in to portal &rarr;
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#7a6a58;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="margin:0;font-size:12px;color:#7a6a58;word-break:break-all;">${link}</p>
          <p style="margin:28px 0 0;font-size:13px;color:#7a6a58;">If you didn't request this, you can safely ignore this email.</p>
        </td></tr>
        <tr><td style="background:#B8893A;height:2px;"></td></tr>
        <tr><td style="background:#F4EBD9;padding:20px 48px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#7a6a58;">© ${new Date().getFullYear()} Kala Kendra Sweden · Gothenburg</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const FROM = process.env["EMAIL_FROM"] ?? "Kala Kendra Sweden <onboarding@resend.dev>";

function getClient(): Resend | null {
  const key = process.env["RESEND_API_KEY"];
  if (!key) return null;
  return new Resend(key);
}

// ─── HTML templates ─────────────────────────────────────────────────────────

function baseTemplate(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kala Kendra Sweden</title>
</head>
<body style="margin:0;padding:0;background:#F4EBD9;font-family:'Georgia',serif;color:#1F1612;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EBD9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#3D0A0C;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#B8893A;font-family:'Georgia',serif;">
                Classical Indian Arts
              </p>
              <h1 style="margin:10px 0 0;font-size:28px;font-weight:400;color:#F4EBD9;font-family:'Georgia',serif;letter-spacing:1px;">
                Kala Kendra Sweden
              </h1>
            </td>
          </tr>

          <!-- Gold rule -->
          <tr>
            <td style="background:#B8893A;height:2px;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px 48px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F4EBD9;padding:28px 40px;text-align:center;border-top:1px solid #d4c5a9;">
              <p style="margin:0;font-size:12px;color:#7a6a58;font-family:Arial,sans-serif;">
                Kala Kendra Sweden · Gothenburg, Sweden<br/>
                <a href="mailto:namaskaram@kalakendra.se" style="color:#5C1416;text-decoration:none;">namaskaram@kalakendra.se</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function confirmationHtml(params: {
  recipientName: string;
  studentName: string;
  batchName: string;
  applicantType: string;
}): string {
  const { recipientName, studentName, batchName, applicantType } = params;
  const isChild = applicantType === "child";

  return baseTemplate(`
    <p style="margin:0 0 8px;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#B8893A;font-family:Arial,sans-serif;">
      Application Received
    </p>
    <h2 style="margin:0 0 24px;font-size:24px;font-weight:400;color:#3D0A0C;">
      Thank you, ${recipientName}
    </h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#1F1612;">
      We have received ${isChild ? `your application for <strong>${studentName}</strong>` : "your application"} for the
      <strong>${batchName}</strong> batch at Kala Kendra Sweden.
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#1F1612;">
      Our admissions team will review your application carefully. Classical arts education at Kala Kendra is a considered commitment, and we give every application the attention it deserves.
    </p>
    <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#1F1612;">
      We will be in touch via this email address once a decision has been made. In the meantime, if you have any questions, please do not hesitate to write to us at
      <a href="mailto:namaskaram@kalakendra.se" style="color:#5C1416;">namaskaram@kalakendra.se</a>.
    </p>
    <table cellpadding="0" cellspacing="0" style="border-left:3px solid #B8893A;padding-left:20px;margin:28px 0;">
      <tr>
        <td>
          <p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7a6a58;font-family:Arial,sans-serif;">Applied For</p>
          <p style="margin:0;font-size:17px;color:#3D0A0C;">${batchName}</p>
        </td>
      </tr>
    </table>
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7;color:#7a6a58;">
      Namaskaram,<br/>
      <em>The Kala Kendra Sweden Admissions Team</em>
    </p>
  `);
}

function adminNotificationHtml(params: {
  studentName: string;
  batchName: string;
  applicantType: string;
  contactEmail: string;
  admissionId: string;
}): string {
  const { studentName, batchName, applicantType, contactEmail, admissionId } = params;
  return baseTemplate(`
    <p style="margin:0 0 8px;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#B8893A;font-family:Arial,sans-serif;">
      New Application
    </p>
    <h2 style="margin:0 0 24px;font-size:24px;font-weight:400;color:#3D0A0C;">
      ${studentName}
    </h2>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e8dcc8;font-size:13px;color:#7a6a58;font-family:Arial,sans-serif;width:40%;">BATCH</td>
        <td style="padding:10px 0;border-bottom:1px solid #e8dcc8;font-size:14px;color:#1F1612;">${batchName}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e8dcc8;font-size:13px;color:#7a6a58;font-family:Arial,sans-serif;">APPLICANT TYPE</td>
        <td style="padding:10px 0;border-bottom:1px solid #e8dcc8;font-size:14px;color:#1F1612;">${applicantType === "child" ? "Child (parent/guardian)" : "Adult"}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e8dcc8;font-size:13px;color:#7a6a58;font-family:Arial,sans-serif;">CONTACT EMAIL</td>
        <td style="padding:10px 0;border-bottom:1px solid #e8dcc8;font-size:14px;color:#1F1612;">${contactEmail}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:13px;color:#7a6a58;font-family:Arial,sans-serif;">REFERENCE</td>
        <td style="padding:10px 0;font-size:12px;color:#7a6a58;font-family:monospace;">${admissionId}</td>
      </tr>
    </table>
    <p style="margin:28px 0 0;font-size:14px;color:#1F1612;">
      Log in to the admin portal to review this application.
    </p>
  `);
}

function acceptedHtml(params: {
  recipientName: string;
  studentName: string;
  batchName: string;
  applicantType: string;
}): string {
  const { recipientName, studentName, batchName, applicantType } = params;
  const isChild = applicantType === "child";
  return baseTemplate(`
    <p style="margin:0 0 8px;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#B8893A;font-family:Arial,sans-serif;">
      Application Decision
    </p>
    <h2 style="margin:0 0 24px;font-size:24px;font-weight:400;color:#3D0A0C;">
      You have been accepted
    </h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#1F1612;">
      Dear ${recipientName},
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#1F1612;">
      We are delighted to inform you that ${isChild ? `<strong>${studentName}</strong> has` : "you have"} been accepted into the
      <strong>${batchName}</strong> batch at Kala Kendra Sweden.
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#1F1612;">
      This is the beginning of a long and committed journey in the classical arts. We look forward to welcoming
      ${isChild ? studentName : "you"} to the school.
    </p>
    <table cellpadding="0" cellspacing="0" style="border-left:3px solid #B8893A;padding-left:20px;margin:28px 0;">
      <tr><td>
        <p style="margin:0 0 14px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#7a6a58;font-family:Arial,sans-serif;">What happens next</p>
        <p style="margin:0 0 10px;font-size:14px;line-height:1.7;color:#1F1612;">
          ✦&nbsp; A member of our team will be in touch shortly with details of class timings, fees, and any materials required.
        </p>
        <p style="margin:0 0 10px;font-size:14px;line-height:1.7;color:#1F1612;">
          ✦&nbsp; Please do not hesitate to write to us with any questions in the meantime.
        </p>
      </td></tr>
    </table>
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7;color:#7a6a58;">
      With warm regards,<br/>
      <em>The Kala Kendra Sweden Team</em>
    </p>
  `);
}

function rejectedHtml(params: {
  recipientName: string;
  studentName: string;
  batchName: string;
  applicantType: string;
}): string {
  const { recipientName, studentName, batchName, applicantType } = params;
  const isChild = applicantType === "child";
  return baseTemplate(`
    <p style="margin:0 0 8px;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#B8893A;font-family:Arial,sans-serif;">
      Application Decision
    </p>
    <h2 style="margin:0 0 24px;font-size:24px;font-weight:400;color:#3D0A0C;">
      Thank you for your application
    </h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#1F1612;">
      Dear ${recipientName},
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#1F1612;">
      Thank you for ${isChild ? `applying on behalf of <strong>${studentName}</strong>` : "your application"} to the
      <strong>${batchName}</strong> batch at Kala Kendra Sweden.
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#1F1612;">
      After careful consideration, we are unfortunately not able to offer a place at this time. Admissions are limited and the decision is always difficult to make.
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#1F1612;">
      We warmly encourage ${isChild ? studentName : "you"} to apply again in a future intake, or to write to us directly — we would be happy to discuss the best path forward.
    </p>
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7;color:#7a6a58;">
      With sincere regards,<br/>
      <em>The Kala Kendra Sweden Team</em><br/>
      <a href="mailto:namaskaram@kalakendra.se" style="color:#5C1416;">namaskaram@kalakendra.se</a>
    </p>
  `);
}

function underReviewHtml(params: {
  recipientName: string;
  studentName: string;
  batchName: string;
  applicantType: string;
}): string {
  const { recipientName, studentName, batchName, applicantType } = params;
  const isChild = applicantType === "child";
  return baseTemplate(`
    <p style="margin:0 0 8px;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#B8893A;font-family:Arial,sans-serif;">
      Application Update
    </p>
    <h2 style="margin:0 0 24px;font-size:24px;font-weight:400;color:#3D0A0C;">
      Your application is under review
    </h2>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#1F1612;">
      Dear ${recipientName},
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#1F1612;">
      We wanted to let you know that ${isChild ? `<strong>${studentName}</strong>'s` : "your"} application for
      <strong>${batchName}</strong> is currently being reviewed by our admissions team.
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#1F1612;">
      We will be in touch as soon as a decision has been reached. Thank you for your patience.
    </p>
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7;color:#7a6a58;">
      With warm regards,<br/>
      <em>The Kala Kendra Sweden Team</em>
    </p>
  `);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export type AdmissionStatus = "pending" | "under_review" | "accepted" | "rejected";

export interface StatusUpdateEmailParams {
  admissionId: string;
  newStatus: AdmissionStatus;
  studentName: string;
  applicantType: string;
  studentEmail?: string | null;
  parentEmail?: string | null;
  batchName: string;
}

export async function sendStatusUpdateEmail(params: StatusUpdateEmailParams): Promise<void> {
  const client = getClient();
  if (!client) {
    logger.warn("RESEND_API_KEY not set — skipping status update email");
    return;
  }

  const { admissionId, newStatus, studentName, applicantType, studentEmail, parentEmail, batchName } = params;

  // Only email for these statuses — skip "pending" (no change) and anything else
  if (!["accepted", "rejected", "under_review"].includes(newStatus)) return;

  const isChild = applicantType === "child";
  const recipientEmail = isChild ? parentEmail : studentEmail;
  if (!recipientEmail) return;

  const recipientName = isChild ? `${studentName}'s parent/guardian` : studentName;

  const subjectMap: Record<string, string> = {
    accepted: `Application accepted — ${batchName} · Kala Kendra Sweden`,
    rejected: `Regarding your application — ${batchName} · Kala Kendra Sweden`,
    under_review: `Your application is under review — Kala Kendra Sweden`,
  };

  const htmlMap: Record<string, string> = {
    accepted: acceptedHtml({ recipientName, studentName, batchName, applicantType }),
    rejected: rejectedHtml({ recipientName, studentName, batchName, applicantType }),
    under_review: underReviewHtml({ recipientName, studentName, batchName, applicantType }),
  };

  try {
    const r = await client.emails.send({
      from: FROM,
      to: recipientEmail,
      subject: subjectMap[newStatus],
      html: htmlMap[newStatus],
    });
    logger.info({ admissionId, newStatus, to: recipientEmail, id: r.data?.id }, "Status update email sent");
  } catch (err) {
    logger.error({ err, admissionId, newStatus }, "Failed to send status update email");
  }
}

export interface ApplicationEmailParams {
  admissionId: string;
  studentName: string;
  applicantType: string;
  studentEmail?: string | null;
  parentEmail?: string | null;
  batchCode: string;
  batchName: string;
  schoolContactEmail?: string | null;
}

export async function sendApplicationEmails(params: ApplicationEmailParams): Promise<void> {
  const client = getClient();
  if (!client) {
    logger.warn("RESEND_API_KEY not set — skipping confirmation email");
    return;
  }

  const {
    admissionId, studentName, applicantType,
    studentEmail, parentEmail, batchName,
    schoolContactEmail,
  } = params;

  const isChild = applicantType === "child";
  const recipientEmail = isChild ? parentEmail : studentEmail;

  const tasks: Promise<unknown>[] = [];

  // 1. Applicant confirmation
  if (recipientEmail) {
    const recipientName = isChild
      ? (params.studentName + "'s parent/guardian")
      : studentName;

    tasks.push(
      client.emails.send({
        from: FROM,
        to: recipientEmail,
        subject: `Application received — ${batchName} · Kala Kendra Sweden`,
        html: confirmationHtml({ recipientName, studentName, batchName, applicantType }),
      }).then((r) => {
        logger.info({ admissionId, to: recipientEmail, id: r.data?.id }, "Confirmation email sent");
      }).catch((err: unknown) => {
        logger.error({ err, admissionId }, "Failed to send confirmation email");
      })
    );
  }

  // 2. Admin notification
  if (schoolContactEmail) {
    tasks.push(
      client.emails.send({
        from: FROM,
        to: schoolContactEmail,
        subject: `New application: ${studentName} — ${batchName}`,
        html: adminNotificationHtml({
          studentName,
          batchName,
          applicantType,
          contactEmail: recipientEmail ?? "—",
          admissionId,
        }),
      }).then((r) => {
        logger.info({ admissionId, to: schoolContactEmail, id: r.data?.id }, "Admin notification email sent");
      }).catch((err: unknown) => {
        logger.error({ err, admissionId }, "Failed to send admin notification email");
      })
    );
  }

  await Promise.allSettled(tasks);
}

// ─── Consent Form Notification ───────────────────────────────────────────────

export interface ConsentFormNotificationParams {
  schoolContactEmail: string;
  participantName: string;
  programName: string;
  programYear: string;
  participantEmail: string | null;
  participantPhone: string | null;
  isMinor: boolean;
  guardianName: string | null;
  consentItemCount: number;
  totalClauses: number;
  medicalConditions: string | null;
  submittedAt: Date;
  adminUrl: string;
}

function consentFormAdminHtml(p: ConsentFormNotificationParams): string {
  const time = p.submittedAt.toLocaleString("sv-SE", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/Stockholm",
  });
  const allClauses = p.consentItemCount === p.totalClauses;
  const consentColour = allClauses ? "#16a34a" : "#d97706";
  const consentLabel = allClauses
    ? `All ${p.totalClauses} clauses acknowledged ✓`
    : `${p.consentItemCount} of ${p.totalClauses} clauses acknowledged`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F4EBD9;font-family:'Georgia',serif;color:#1F1612;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EBD9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#3D0A0C;padding:28px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#B8893A;">New Submission</p>
          <h1 style="margin:8px 0 0;font-size:24px;font-weight:400;color:#F4EBD9;letter-spacing:1px;">Participant Consent Form</h1>
        </td></tr>
        <tr><td style="background:#B8893A;height:2px;"></td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px 48px;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#1F1612;">
            A new consent form has been submitted for <strong>${p.programName}</strong>.
          </p>

          <!-- Details table -->
          <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 28px;">
            <tr style="border-bottom:1px solid #e8e0d6;">
              <td style="padding:10px 0;font-size:13px;color:#7a6a58;width:38%;">Participant</td>
              <td style="padding:10px 0;font-size:14px;font-weight:600;">${p.participantName}${p.isMinor ? ' <span style="font-size:11px;color:#b45309;font-weight:normal;">(minor)</span>' : ""}</td>
            </tr>
            ${p.isMinor && p.guardianName ? `
            <tr style="border-bottom:1px solid #e8e0d6;">
              <td style="padding:10px 0;font-size:13px;color:#7a6a58;">Guardian</td>
              <td style="padding:10px 0;font-size:14px;">${p.guardianName}</td>
            </tr>` : ""}
            <tr style="border-bottom:1px solid #e8e0d6;">
              <td style="padding:10px 0;font-size:13px;color:#7a6a58;">Programme</td>
              <td style="padding:10px 0;font-size:14px;">${p.programName}${p.programYear ? ` · ${p.programYear}` : ""}</td>
            </tr>
            ${p.participantEmail ? `
            <tr style="border-bottom:1px solid #e8e0d6;">
              <td style="padding:10px 0;font-size:13px;color:#7a6a58;">Email</td>
              <td style="padding:10px 0;font-size:14px;"><a href="mailto:${p.participantEmail}" style="color:#5C1416;">${p.participantEmail}</a></td>
            </tr>` : ""}
            ${p.participantPhone ? `
            <tr style="border-bottom:1px solid #e8e0d6;">
              <td style="padding:10px 0;font-size:13px;color:#7a6a58;">Phone</td>
              <td style="padding:10px 0;font-size:14px;">${p.participantPhone}</td>
            </tr>` : ""}
            <tr style="border-bottom:1px solid #e8e0d6;">
              <td style="padding:10px 0;font-size:13px;color:#7a6a58;">Consent</td>
              <td style="padding:10px 0;font-size:14px;font-weight:600;color:${consentColour};">${consentLabel}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;font-size:13px;color:#7a6a58;">Submitted</td>
              <td style="padding:10px 0;font-size:14px;">${time}</td>
            </tr>
          </table>

          ${p.medicalConditions ? `
          <!-- Medical alert -->
          <table cellpadding="0" cellspacing="0" style="width:100%;background:#fffbeb;border:1px solid #fbbf24;border-radius:2px;margin-bottom:28px;">
            <tr><td style="padding:14px 18px;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#92400e;font-weight:600;">Health Declaration — Review Required</p>
              <p style="margin:0;font-size:14px;color:#78350f;line-height:1.6;">${p.medicalConditions}</p>
            </td></tr>
          </table>` : ""}

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr><td style="background:#3D0A0C;padding:13px 32px;text-align:center;">
              <a href="${p.adminUrl}" style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#F4EBD9;text-decoration:none;font-family:Georgia,serif;">
                View in Admin Portal
              </a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Gold rule -->
        <tr><td style="background:#B8893A;height:2px;"></td></tr>

        <!-- Footer -->
        <tr><td style="background:#F4EBD9;padding:20px 48px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#7a6a58;line-height:1.8;">
            Kala Kendra Sweden · Administration<br/>
            This is an automated notification. Do not reply to this email.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ─── Consent Form Participant Confirmation ────────────────────────────────────

const CONSENT_LABELS: Record<string, string> = {
  photo_video:       "Photo & video use for promotional purposes (Clause 1)",
  financial:         "Personal financial responsibility for costumes & travel (Clause 2)",
  performance:       "Participation in the annual event / performance (Clause 3)",
  creative_direction:"Following choreography and creative direction (Clause 4)",
  attendance:        "Attendance and rehearsal commitment (Clause 5)",
  withdrawal:        "Withdrawal and refund policy (Clause 6)",
  conduct:           "Code of conduct and respectful behaviour (Clause 7)",
  communication:     "Communication protocol with the institute (Clause 8)",
  social_media:      "Social media and confidentiality guidelines (Clause 9)",
  liability:         "Liability waiver (Clause 10)",
  health:            "Health declaration (Clause 11)",
};

export interface ConsentFormConfirmationParams {
  to: string;
  participantName: string;
  programName: string;
  programYear: string;
  isMinor: boolean;
  guardianName: string | null;
  consentItems: string[];
  signatureName: string;
  submittedAt: Date;
  schoolContactEmail: string;
}

function consentFormConfirmationHtml(p: ConsentFormConfirmationParams): string {
  const recipientName = p.isMinor && p.guardianName ? p.guardianName : p.participantName;
  const time = p.submittedAt.toLocaleString("sv-SE", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/Stockholm",
  });

  const checkedRows = p.consentItems
    .map((id) => CONSENT_LABELS[id] ?? id)
    .map(
      (label) =>
        `<tr style="border-bottom:1px solid #f0ebe4;">
          <td style="padding:8px 12px 8px 0;font-size:13px;color:#3D0A0C;vertical-align:top;width:18px;">✓</td>
          <td style="padding:8px 0;font-size:13px;color:#1F1612;line-height:1.6;">${label}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F4EBD9;font-family:'Georgia',serif;color:#1F1612;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EBD9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#3D0A0C;padding:32px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#B8893A;">Kala Kendra Sweden</p>
          <h1 style="margin:10px 0 4px;font-size:26px;font-weight:400;color:#F4EBD9;letter-spacing:1px;">Consent Form Received</h1>
          <p style="margin:0;font-size:13px;color:#F4EBD9;opacity:0.7;">${p.programName}${p.programYear ? ` · ${p.programYear}` : ""}</p>
        </td></tr>
        <tr><td style="background:#B8893A;height:3px;"></td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:40px 48px;">

          <!-- Greeting -->
          <p style="margin:0 0 6px;font-size:16px;line-height:1.7;color:#1F1612;">Dear ${recipientName},</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#3a2e27;">
            Thank you for submitting the participant consent form for
            <strong>${p.participantName}</strong>${p.isMinor ? " (minor participant)" : ""}
            for <strong>${p.programName}</strong>.
            We have received your submission successfully.
          </p>

          <!-- Divider -->
          <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 28px;">
            <tr>
              <td style="border-top:1px solid #e8e0d6;"></td>
              <td style="width:32px;text-align:center;padding:0 12px;font-size:18px;color:#B8893A;">✦</td>
              <td style="border-top:1px solid #e8e0d6;"></td>
            </tr>
          </table>

          <!-- Submission summary -->
          <p style="margin:0 0 16px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#7a6a58;font-family:Helvetica,sans-serif;">Submission Summary</p>
          <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#faf8f5;border:1px solid #e8e0d6;margin:0 0 28px;">
            <tr style="border-bottom:1px solid #e8e0d6;">
              <td style="padding:10px 16px;font-size:13px;color:#7a6a58;width:38%;vertical-align:top;">Participant</td>
              <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#1F1612;">${p.participantName}</td>
            </tr>
            ${p.isMinor && p.guardianName ? `
            <tr style="border-bottom:1px solid #e8e0d6;">
              <td style="padding:10px 16px;font-size:13px;color:#7a6a58;vertical-align:top;">Parent / Guardian</td>
              <td style="padding:10px 16px;font-size:13px;color:#1F1612;">${p.guardianName}</td>
            </tr>` : ""}
            <tr style="border-bottom:1px solid #e8e0d6;">
              <td style="padding:10px 16px;font-size:13px;color:#7a6a58;vertical-align:top;">Programme</td>
              <td style="padding:10px 16px;font-size:13px;color:#1F1612;">${p.programName}${p.programYear ? ` · ${p.programYear}` : ""}</td>
            </tr>
            <tr style="border-bottom:1px solid #e8e0d6;">
              <td style="padding:10px 16px;font-size:13px;color:#7a6a58;vertical-align:top;">Signed by</td>
              <td style="padding:10px 16px;font-size:13px;color:#1F1612;">${p.signatureName}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#7a6a58;vertical-align:top;">Submitted</td>
              <td style="padding:10px 16px;font-size:13px;color:#1F1612;">${time}</td>
            </tr>
          </table>

          <!-- Consent items acknowledged -->
          <p style="margin:0 0 14px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#7a6a58;font-family:Helvetica,sans-serif;">
            Clauses Acknowledged (${p.consentItems.length})
          </p>
          <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 32px;">
            ${checkedRows}
          </table>

          <!-- Divider -->
          <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 28px;">
            <tr>
              <td style="border-top:1px solid #e8e0d6;"></td>
              <td style="width:32px;text-align:center;padding:0 12px;font-size:18px;color:#B8893A;">✦</td>
              <td style="border-top:1px solid #e8e0d6;"></td>
            </tr>
          </table>

          <!-- Next steps -->
          <p style="margin:0 0 12px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#7a6a58;font-family:Helvetica,sans-serif;">What Happens Next</p>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.8;color:#3a2e27;">
            Our team will review your submission and be in touch with further details about rehearsal schedules,
            costume requirements, and any other information relevant to your participation.
          </p>
          <p style="margin:0 0 28px;font-size:14px;line-height:1.8;color:#3a2e27;">
            If you have any questions in the meantime, please contact us at
            <a href="mailto:${p.schoolContactEmail}" style="color:#5C1416;">${p.schoolContactEmail}</a>.
          </p>

          <!-- Closing -->
          <p style="margin:0;font-size:14px;line-height:1.8;color:#1F1612;">
            With warm regards,<br/>
            <strong>Kala Kendra Sweden</strong><br/>
            <span style="font-size:13px;color:#7a6a58;">Gothenburg, Sweden</span>
          </p>

        </td></tr>

        <!-- Gold rule -->
        <tr><td style="background:#B8893A;height:3px;"></td></tr>

        <!-- Footer -->
        <tr><td style="background:#3D0A0C;padding:20px 48px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#F4EBD9;opacity:0.6;line-height:1.8;letter-spacing:1px;">
            Kala Kendra Sweden · Gothenburg<br/>
            Please retain this email as a record of your consent form submission.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendConsentFormConfirmation(params: ConsentFormConfirmationParams): Promise<void> {
  const client = getClient();
  if (!client) {
    logger.warn("RESEND_API_KEY not set — skipping consent form confirmation email");
    return;
  }
  const recipientName = params.isMinor && params.guardianName ? params.guardianName : params.participantName;
  try {
    const r = await client.emails.send({
      from: FROM,
      to: params.to,
      subject: `Consent form received — ${params.programName} · Kala Kendra Sweden`,
      html: consentFormConfirmationHtml(params),
    });
    logger.info(
      { to: params.to, participantName: params.participantName, recipientName, id: r.data?.id },
      "Consent form confirmation email sent to participant",
    );
  } catch (err) {
    logger.error({ err, participantName: params.participantName }, "Failed to send consent form confirmation email");
  }
}

export async function sendConsentFormNotification(params: ConsentFormNotificationParams): Promise<void> {
  const client = getClient();
  if (!client) {
    logger.warn("RESEND_API_KEY not set — skipping consent form notification email");
    return;
  }
  try {
    const r = await client.emails.send({
      from: FROM,
      to: params.schoolContactEmail,
      subject: `New consent form: ${params.participantName} — ${params.programName}`,
      html: consentFormAdminHtml(params),
    });
    logger.info(
      { to: params.schoolContactEmail, participantName: params.participantName, id: r.data?.id },
      "Consent form notification email sent",
    );
  } catch (err) {
    logger.error({ err, participantName: params.participantName }, "Failed to send consent form notification email");
  }
}
