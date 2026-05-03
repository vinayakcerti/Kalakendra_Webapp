import { Resend } from "resend";
import { logger } from "./logger";

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

// ─── Public API ──────────────────────────────────────────────────────────────

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
