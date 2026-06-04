const SCHOOL_NAME = "Growing Minds English School";
const ORANGE = "#FF8C00";
const LIME = "#AACC00";
const DARK = "#1a1a2e";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const BG = "#f8fafc";
const ADMIN_EMAIL = "growingmindsenglishschool@gmail.com";
const PHONE = "+91 97685 32431";
const ADDRESS = "Shop No. D1, Plot No. 17, Malwani, Malad West, Mumbai - 400095";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const DOCUMENT_LABELS: Record<string, string> = {
  birthCertificate: "Birth Certificate",
  studentPhoto: "Student Photo",
  studentAadhaar: "Student Aadhaar",
  fatherAadhaar: "Father's Aadhaar",
  fatherPhoto: "Father's Photo",
  motherAadhaar: "Mother's Aadhaar",
  motherPhoto: "Mother's Photo",
  electricityBill: "Electricity Bill",
  previousTC: "Previous School TC / LC",
};

function documentLabel(key: string): string {
  return DOCUMENT_LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function formatGender(gender: string): string {
  const g = gender.trim().toLowerCase();
  if (g === "male") return "Male";
  if (g === "female") return "Female";
  return gender.charAt(0).toUpperCase() + gender.slice(1);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function emailShell(options: {
  preheader: string;
  badge: string;
  title: string;
  subtitle?: string;
  body: string;
  footerNote?: string;
}) {
  const { preheader, badge, title, subtitle, body, footerNote } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${DARK};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BG};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${BORDER};box-shadow:0 4px 24px rgba(15,23,42,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${ORANGE} 0%,#e67e00 100%);padding:28px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.85);">${escapeHtml(badge)}</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">${escapeHtml(title)}</h1>
              ${subtitle ? `<p style="margin:10px 0 0;font-size:14px;color:rgba(255,255,255,0.9);line-height:1.5;">${escapeHtml(subtitle)}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:${LIME};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">${body}</td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f1f5f9;padding:24px 32px;border-top:1px solid ${BORDER};">
              ${footerNote ? `<p style="margin:0 0 16px;font-size:13px;color:${MUTED};line-height:1.6;">${footerNote}</p>` : ""}
              <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${DARK};">${SCHOOL_NAME}</p>
              <p style="margin:0 0 4px;font-size:12px;color:${MUTED};line-height:1.6;">${ADDRESS}</p>
              <p style="margin:0;font-size:12px;color:${MUTED};">
                <a href="tel:+919768532431" style="color:${ORANGE};text-decoration:none;">${PHONE}</a>
                &nbsp;·&nbsp;
                <a href="mailto:${ADMIN_EMAIL}" style="color:${ORANGE};text-decoration:none;">${ADMIN_EMAIL}</a>
              </p>
              <p style="margin:14px 0 0;font-size:11px;color:#94a3b8;">&copy; ${new Date().getFullYear()} ${SCHOOL_NAME}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function section(title: string, rows: Array<{ label: string; value: string; isLink?: boolean }>) {
  const rowsHtml = rows
    .map(
      (row, i) => `
      <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f8fafc"};">
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:${MUTED};width:38%;vertical-align:top;border-bottom:1px solid ${BORDER};">${escapeHtml(row.label)}</td>
        <td style="padding:12px 16px;font-size:14px;color:${DARK};vertical-align:top;border-bottom:1px solid ${BORDER};">
          ${
            row.isLink
              ? `<a href="${row.value}" style="color:${ORANGE};text-decoration:none;word-break:break-all;">${escapeHtml(row.value)}</a>`
              : escapeHtml(row.value)
          }
        </td>
      </tr>`
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding-bottom:10px;">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${ORANGE};">${escapeHtml(title)}</p>
        </td>
      </tr>
      <tr>
        <td>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${BORDER};border-radius:8px;overflow:hidden;">
            ${rowsHtml}
          </table>
        </td>
      </tr>
    </table>`;
}

function documentGrid(files: Record<string, string>) {
  const items = Object.entries(files)
    .map(
      ([key, url]) => `
      <tr>
        <td style="padding:8px 0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size:14px;color:${DARK};padding-right:12px;vertical-align:middle;">${escapeHtml(documentLabel(key))}</td>
              <td align="right" style="vertical-align:middle;white-space:nowrap;">
                <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"
                   style="display:inline-block;padding:8px 16px;background:${ORANGE};color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;border-radius:6px;">
                  View document
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:8px;">
      <tr>
        <td style="padding-bottom:10px;">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${ORANGE};">Uploaded Documents</p>
          <p style="margin:6px 0 0;font-size:13px;color:${MUTED};">All required documents were submitted with this application.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px;background:#f8fafc;border:1px solid ${BORDER};border-radius:8px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${items}</table>
        </td>
      </tr>
    </table>`;
}

function messageBox(text: string) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;">
      <tr>
        <td style="padding:16px 20px;background:#fff7ed;border-left:4px solid ${ORANGE};border-radius:0 8px 8px 0;">
          <p style="margin:0;font-size:14px;color:${DARK};line-height:1.7;white-space:pre-wrap;">${escapeHtml(text)}</p>
        </td>
      </tr>
    </table>`;
}

function infoBanner(text: string) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:14px 18px;background:#ecfccb;border:1px solid #d9f99d;border-radius:8px;font-size:14px;color:#365314;line-height:1.6;">
          ${text}
        </td>
      </tr>
    </table>`;
}

// ─── Admin notifications ───────────────────────────────────────────

export type AdmissionEmailData = {
  studentName: string;
  dateOfBirth: string;
  gender: string;
  standardLabel: string;
  parentEmail: string;
  fatherName: string;
  motherName: string;
  fatherContact: string;
  motherContact: string;
  currentAddress: string;
  permanentAddress: string;
  siblingName?: string;
  siblingSchool?: string;
  siblingStandard?: string;
  files: Record<string, string>;
};

export function admissionAdminNotification(data: AdmissionEmailData) {
  const body = `
    ${infoBanner(`<strong>New application received.</strong> Review the details below and open each document using the buttons provided. Reply to this email to contact the parent directly.`)}
    ${section("Student Details", [
      { label: "Full name", value: data.studentName },
      { label: "Date of birth", value: formatDate(data.dateOfBirth) },
      { label: "Gender", value: formatGender(data.gender) },
      { label: "Applying for", value: data.standardLabel },
    ])}
    ${section("Parent / Guardian", [
      { label: "Email", value: data.parentEmail, isLink: true },
      { label: "Father", value: `${data.fatherName} · ${data.fatherContact}` },
      { label: "Mother", value: `${data.motherName} · ${data.motherContact}` },
    ])}
    ${section("Address", [
      { label: "Current address", value: data.currentAddress },
      { label: "Permanent address", value: data.permanentAddress },
      ...(data.siblingName
        ? [{ label: "Sibling", value: `${data.siblingName}${data.siblingSchool ? ` · ${data.siblingSchool}` : ""}${data.siblingStandard ? ` (${data.siblingStandard})` : ""}` }]
        : []),
    ])}
    ${documentGrid(data.files)}`;

  return emailShell({
    preheader: `New admission application for ${data.studentName} — ${data.standardLabel}`,
    badge: "Admissions",
    title: "New Online Application",
    subtitle: `${data.studentName} · ${data.standardLabel}`,
    body,
    footerNote: "This notification was sent automatically from the Growing Minds website admission form.",
  });
}

export type ContactEmailData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export function contactAdminNotification(data: ContactEmailData) {
  const body = `
    ${infoBanner(`<strong>New enquiry received.</strong> Reply to this email to respond directly to ${escapeHtml(data.name)}.`)}
    ${section("Contact Details", [
      { label: "Name", value: data.name },
      { label: "Email", value: data.email, isLink: true },
      { label: "Phone", value: data.phone },
      { label: "Subject", value: data.subject },
    ])}
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${ORANGE};">Message</p>
    ${messageBox(data.message)}`;

  return emailShell({
    preheader: `Contact form: ${data.subject} from ${data.name}`,
    badge: "Contact Form",
    title: "New Enquiry",
    subtitle: data.subject,
    body,
    footerNote: "This notification was sent automatically from the Growing Minds website contact form.",
  });
}

// ─── Parent / visitor acknowledgments ──────────────────────────────

export function contactAcknowledgment(name: string) {
  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${DARK};">Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${DARK};">
      Thank you for reaching out to <strong>${SCHOOL_NAME}</strong>. We have received your message and our team will respond within <strong>1–2 working days</strong>.
    </p>
    ${infoBanner(`For urgent enquiries, call us at <a href="tel:+919768532431" style="color:#365314;font-weight:600;text-decoration:none;">${PHONE}</a>.`)}
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7;color:${DARK};">
      Warm regards,<br />
      <strong>Admissions Team</strong><br />
      ${SCHOOL_NAME}
    </p>`;

  return emailShell({
    preheader: "We received your message and will reply soon.",
    badge: "Confirmation",
    title: "Message Received",
    subtitle: "Thank you for contacting us",
    body,
  });
}

export function admissionAcknowledgment(studentName: string, standard: string, parentName: string) {
  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${DARK};">Dear <strong>${escapeHtml(parentName)}</strong>,</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${DARK};">
      Thank you for applying to <strong>${SCHOOL_NAME}</strong>. We have successfully received the admission application.
    </p>
    ${section("Application Summary", [
      { label: "Student name", value: studentName },
      { label: "Applying for", value: standard },
      { label: "Status", value: "Under review" },
    ])}
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${DARK};">
      Our admission team will review your application and documents. We will contact you on the phone number provided within <strong>3–5 working days</strong>.
    </p>
    ${infoBanner(`Questions? Call <a href="tel:+919768532431" style="color:#365314;font-weight:600;text-decoration:none;">${PHONE}</a> or reply to this email.`)}
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7;color:${DARK};">
      Warm regards,<br />
      <strong>Admissions Team</strong><br />
      ${SCHOOL_NAME}
    </p>`;

  return emailShell({
    preheader: `Application received for ${studentName} — ${standard}`,
    badge: "Confirmation",
    title: "Application Received",
    subtitle: `${studentName} · ${standard}`,
    body,
  });
}
