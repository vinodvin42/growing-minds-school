import { defaultContent } from "@/data/default-content";
import { images } from "@/data/images";
import { PWA } from "@/lib/pwa";
import {
  FEE_CATEGORIES,
  FEE_PAYMENT_MODES,
  formatInr,
  feeStatusLabel,
  type FeePayment,
  type StudentFeeSummary,
} from "@/types/student-fees";
import type { StudentProfile } from "@/types/student";

export type FeeReceiptBuildOptions = {
  /** Origin for logo URL, e.g. https://www.growingmindsschool.org */
  baseUrl?: string;
};

function categoryLabel(value: string): string {
  return FEE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function modeLabel(value: string): string {
  return FEE_PAYMENT_MODES.find((m) => m.value === value)?.label ?? value;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function receiptLogoUrl(baseUrl?: string): string {
  const origin = (baseUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${origin}${images.logo}`;
}

function receiptNumber(student: Pick<StudentProfile, "loginId">, academicYear: string): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `GMS/${academicYear}/${student.loginId}/${stamp}`;
}

function paymentReceiptNumber(
  student: Pick<StudentProfile, "loginId">,
  academicYear: string,
  payment: FeePayment
): string {
  const idPart = payment.id.replace(/^pay_/, "").slice(0, 8).toUpperCase();
  const datePart = payment.date.replace(/-/g, "");
  return `GMS/PAY/${academicYear}/${student.loginId}/${datePart}/${idPart}`;
}

function receiptStyles(extra = ""): string {
  return `
    * { box-sizing: border-box; }
    @page { size: A4; margin: 12mm; }
    body {
      margin: 0;
      padding: 24px;
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      font-size: 13px;
      color: #2D4A22;
      background: #e8ece4;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .receipt-sheet {
      position: relative;
      max-width: 210mm;
      min-height: 277mm;
      margin: 0 auto;
      background: #fff;
      border-radius: 4px;
      box-shadow: 0 8px 32px rgba(45, 74, 34, 0.12);
      overflow: hidden;
    }
    .receipt-sheet--compact { min-height: auto; }
    .watermark {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 0;
    }
    .watermark img {
      width: 72%;
      max-width: 420px;
      opacity: 0.07;
      filter: grayscale(20%);
    }
    .receipt-body {
      position: relative;
      z-index: 1;
      padding: 28px 32px 32px;
    }
    .rainbow {
      height: 5px;
      background: linear-gradient(90deg, #AACC00 0%, #FFCC00 25%, #FF8C00 50%, #0066CC 75%, #92278F 100%);
    }
    .header {
      display: flex;
      gap: 20px;
      align-items: flex-start;
      padding-bottom: 18px;
      border-bottom: 2px solid #F5FAEB;
    }
    .header__logo {
      width: 88px;
      height: 88px;
      object-fit: contain;
      border-radius: 12px;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(45, 74, 34, 0.1);
    }
    .header__text h1 {
      margin: 0 0 4px;
      font-size: 22px;
      font-weight: 800;
      color: #2D4A22;
      letter-spacing: -0.02em;
    }
    .header__text .tagline {
      margin: 0 0 8px;
      font-size: 12px;
      font-weight: 600;
      color: #FF8C00;
    }
    .header__text .address {
      margin: 0;
      font-size: 11px;
      color: #6B7A62;
      max-width: 420px;
      line-height: 1.45;
    }
    .header__text .contact {
      margin: 6px 0 0;
      font-size: 11px;
      color: #5C6B52;
    }
    .doc-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      margin: 20px 0 16px;
    }
    .doc-title h2 {
      margin: 0;
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #2D4A22;
    }
    .doc-title__meta {
      text-align: right;
      font-size: 11px;
      color: #6B7A62;
    }
    .doc-title__meta strong {
      display: block;
      color: #2D4A22;
      font-size: 12px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .badge--paid { background: #F0F8D8; color: #5a7300; }
    .badge--partial { background: #FFF0E0; color: #c46800; }
    .badge--overdue { background: #FDE8E9; color: #b91c1c; }
    .badge--pending { background: #F5FAEB; color: #2D4A22; }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 24px;
      padding: 16px 18px;
      background: linear-gradient(135deg, #F5FAEB 0%, #FFFCF7 100%);
      border: 1px solid rgba(45, 74, 34, 0.1);
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .info-grid dt {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #6B7A62;
      margin: 0 0 2px;
    }
    .info-grid dd {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: #2D4A22;
    }
    .amount-hero {
      text-align: center;
      padding: 22px 16px;
      margin-bottom: 22px;
      background: linear-gradient(135deg, #F0F8D8 0%, #FAFDF5 100%);
      border: 2px solid #AACC00;
      border-radius: 16px;
    }
    .amount-hero span {
      display: block;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6B7A62;
      margin-bottom: 6px;
    }
    .amount-hero strong {
      font-size: 32px;
      font-weight: 800;
      color: #2D4A22;
      letter-spacing: -0.02em;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .summary-card {
      text-align: center;
      padding: 14px 10px;
      border-radius: 12px;
      border: 1px solid rgba(45, 74, 34, 0.08);
      background: #fff;
    }
    .summary-card span {
      display: block;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6B7A62;
      margin-bottom: 4px;
    }
    .summary-card strong {
      font-size: 18px;
      font-weight: 800;
      color: #2D4A22;
    }
    .summary-card--due { border-top: 3px solid #2D4A22; }
    .summary-card--paid { border-top: 3px solid #AACC00; background: #FAFDF5; }
    .summary-card--balance { border-top: 3px solid #FF8C00; background: #FFFCF9; }
    .summary-card--balance strong { color: #E67E00; }
    .block { margin-bottom: 22px; }
    .block__title {
      margin: 0 0 10px;
      font-size: 13px;
      font-weight: 800;
      color: #2D4A22;
      padding-left: 10px;
      border-left: 3px solid #FF8C00;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th {
      background: #2D4A22;
      color: #fff;
      font-weight: 600;
      text-align: left;
      padding: 9px 10px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    th:first-child { border-radius: 8px 0 0 0; }
    th:last-child { border-radius: 0 8px 0 0; }
    td {
      padding: 9px 10px;
      border-bottom: 1px solid #eef2e8;
      vertical-align: top;
    }
    tr.row-alt td { background: #FAFCF7; }
    td.num, th.num { text-align: right; white-space: nowrap; }
    tbody th[scope="row"] {
      background: #F5FAEB;
      color: #2D4A22;
      font-weight: 600;
      width: 42%;
      text-transform: none;
      letter-spacing: 0;
      font-size: 12px;
    }
    tbody th[scope="row"]:first-child { border-radius: 0; }
    tfoot .total-row td {
      font-weight: 800;
      background: #F5FAEB;
      border-top: 2px solid #AACC00;
      color: #2D4A22;
      padding: 10px;
    }
    tfoot .total-row--paid td {
      border-top-color: #AACC00;
      background: #F0F8D8;
    }
    .note-box {
      padding: 12px 14px;
      background: #FFF8EB;
      border: 1px solid rgba(255, 140, 0, 0.25);
      border-radius: 10px;
      margin-bottom: 20px;
      font-size: 12px;
    }
    .note-box strong {
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      color: #E67E00;
      margin-bottom: 4px;
    }
    .note-box p { margin: 0; color: #4A6741; }
    .footer {
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1px dashed rgba(45, 74, 34, 0.2);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      align-items: end;
    }
    .footer__sign {
      font-size: 11px;
      color: #6B7A62;
    }
    .footer__sign .line {
      margin-top: 36px;
      border-top: 1px solid #2D4A22;
      padding-top: 6px;
      font-weight: 600;
      color: #2D4A22;
    }
    .footer__legal {
      text-align: right;
      font-size: 10px;
      color: #8A9A7E;
      line-height: 1.5;
    }
    .footer__legal strong {
      display: block;
      font-size: 11px;
      color: #6B7A62;
      margin-bottom: 4px;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .receipt-sheet { box-shadow: none; border-radius: 0; min-height: auto; }
      .no-print { display: none; }
    }
    .print-bar {
      max-width: 210mm;
      margin: 0 auto 16px;
      text-align: center;
    }
    .print-bar button {
      background: #FF8C00;
      color: #fff;
      border: none;
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 14px;
    }
    ${extra}`;
}

function renderReceiptDocument(
  title: string,
  logoUrl: string,
  bodyContent: string,
  options?: { compact?: boolean }
): string {
  const settings = defaultContent.settings;
  const sheetClass = options?.compact ? "receipt-sheet receipt-sheet--compact" : "receipt-sheet";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>${receiptStyles()}</style>
</head>
<body>
  <div class="print-bar no-print">
    <button type="button" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="${sheetClass}">
    <div class="rainbow"></div>
    <div class="watermark" aria-hidden="true">
      <img src="${escapeHtml(logoUrl)}" alt="" />
    </div>
    <div class="receipt-body">
      <header class="header">
        <img class="header__logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(settings.schoolName)}" />
        <div class="header__text">
          <h1>${escapeHtml(settings.schoolName)}</h1>
          <p class="tagline">${escapeHtml(settings.tagline)}</p>
          <p class="address">${escapeHtml(settings.address)}</p>
          <p class="contact">${escapeHtml(settings.phone)} · ${escapeHtml(settings.email)}</p>
        </div>
      </header>
      ${bodyContent}
    </div>
  </div>
  <script>
    if (window.location.search.includes("autoprint=1")) {
      window.onload = function() { window.print(); };
    }
  </script>
</body>
</html>`;
}

function receiptFooterHtml(legalTitle: string, legalBody: string): string {
  const settings = defaultContent.settings;
  return `<footer class="footer">
    <div class="footer__sign">
      <div class="line">Authorised signatory<br />${escapeHtml(PWA.shortName)}</div>
    </div>
    <div class="footer__legal">
      <strong>${escapeHtml(legalTitle)}</strong>
      ${legalBody}<br />
      ${escapeHtml(settings.phone)}
    </div>
  </footer>`;
}

function openReceiptHtml(html: string): void {
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) {
    alert("Please allow pop-ups to download or print the receipt.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

function statusBadgeClass(status: StudentFeeSummary["status"]): string {
  if (status === "paid") return "badge badge--paid";
  if (status === "overdue") return "badge badge--overdue";
  if (status === "partial") return "badge badge--partial";
  return "badge badge--pending";
}

export function buildFeeReceiptHtml(
  account: StudentFeeSummary,
  student: Pick<StudentProfile, "name" | "loginId" | "standard" | "section">,
  academicYear: string,
  options?: FeeReceiptBuildOptions
): string {
  const logoUrl = receiptLogoUrl(options?.baseUrl);
  const issued = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const receiptNo = receiptNumber(student, academicYear);

  const feeRows = account.lineItems
    .map(
      (item, i) => `
    <tr class="${i % 2 === 1 ? "row-alt" : ""}">
      <td>${escapeHtml(item.label || categoryLabel(item.category))}</td>
      <td>${escapeHtml(categoryLabel(item.category))}</td>
      <td>${item.dueDate ? formatDate(item.dueDate) : "—"}</td>
      <td class="num">${formatInr(item.amount)}</td>
    </tr>`
    )
    .join("");

  const paymentRows = [...account.payments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(
      (p, i) => `
    <tr class="${i % 2 === 1 ? "row-alt" : ""}">
      <td>${formatDate(p.date)}</td>
      <td>${escapeHtml(modeLabel(p.mode))}</td>
      <td>${escapeHtml(p.reference || "—")}</td>
      <td class="num">${formatInr(p.amount)}</td>
    </tr>`
    )
    .join("");

  const feeTable = account.lineItems.length
    ? `<section class="block">
        <h2 class="block__title">Fee breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Due date</th>
              <th class="num">Amount</th>
            </tr>
          </thead>
          <tbody>${feeRows}</tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3">Total fees</td>
              <td class="num">${formatInr(account.totalDue)}</td>
            </tr>
          </tfoot>
        </table>
      </section>`
    : "";

  const paymentTable = account.payments.length
    ? `<section class="block">
        <h2 class="block__title">Payment history</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Mode</th>
              <th>Reference</th>
              <th class="num">Amount</th>
            </tr>
          </thead>
          <tbody>${paymentRows}</tbody>
          <tfoot>
            <tr class="total-row total-row--paid">
              <td colspan="3">Total paid</td>
              <td class="num">${formatInr(account.totalPaid)}</td>
            </tr>
          </tfoot>
        </table>
      </section>`
    : "";

  const notesBlock = account.notes?.trim()
    ? `<div class="note-box">
        <strong>School note</strong>
        <p>${escapeHtml(account.notes)}</p>
      </div>`
    : "";

  const bodyContent = `
      <div class="doc-title">
        <div>
          <h2>Fee statement</h2>
          <span class="${statusBadgeClass(account.status)}">${escapeHtml(feeStatusLabel(account.status))}</span>
        </div>
        <div class="doc-title__meta">
          <strong>Receipt no. ${escapeHtml(receiptNo)}</strong>
          Academic year ${escapeHtml(academicYear)}<br />
          Issued ${escapeHtml(issued)}
        </div>
      </div>

      <dl class="info-grid">
        <div><dt>Student name</dt><dd>${escapeHtml(student.name)}</dd></div>
        <div><dt>Student ID</dt><dd>${escapeHtml(student.loginId)}</dd></div>
        <div><dt>Class</dt><dd>${escapeHtml(student.standard)}${student.section ? ` · Section ${escapeHtml(student.section)}` : ""}</dd></div>
        <div><dt>Document</dt><dd>Official fee statement</dd></div>
      </dl>

      <div class="summary">
        <div class="summary-card summary-card--due">
          <span>Total fees</span>
          <strong>${formatInr(account.totalDue)}</strong>
        </div>
        <div class="summary-card summary-card--paid">
          <span>Amount paid</span>
          <strong>${formatInr(account.totalPaid)}</strong>
        </div>
        <div class="summary-card summary-card--balance">
          <span>Balance due</span>
          <strong>${formatInr(account.balance)}</strong>
        </div>
      </div>

      ${notesBlock}
      ${feeTable}
      ${paymentTable}

      ${receiptFooterHtml(
        "Computer-generated statement",
        `This document is issued through the ${escapeHtml(PWA.shortName)} student portal.<br />For fee queries contact the school office.`
      )}`;

  return renderReceiptDocument(`Fee Statement — ${student.name}`, logoUrl, bodyContent);
}

export function buildPaymentReceiptHtml(
  account: StudentFeeSummary,
  payment: FeePayment,
  student: Pick<StudentProfile, "name" | "loginId" | "standard" | "section">,
  academicYear: string,
  options?: FeeReceiptBuildOptions
): string {
  const logoUrl = receiptLogoUrl(options?.baseUrl);
  const issued = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const receiptNo = paymentReceiptNumber(student, academicYear, payment);

  const notesBlock = payment.notes?.trim()
    ? `<div class="note-box">
        <strong>Payment note</strong>
        <p>${escapeHtml(payment.notes)}</p>
      </div>`
    : "";

  const bodyContent = `
      <div class="doc-title">
        <div>
          <h2>Payment receipt</h2>
          <span class="badge badge--paid">Payment received</span>
        </div>
        <div class="doc-title__meta">
          <strong>Receipt no. ${escapeHtml(receiptNo)}</strong>
          Payment date ${escapeHtml(formatDate(payment.date))}<br />
          Issued ${escapeHtml(issued)}
        </div>
      </div>

      <dl class="info-grid">
        <div><dt>Student name</dt><dd>${escapeHtml(student.name)}</dd></div>
        <div><dt>Student ID</dt><dd>${escapeHtml(student.loginId)}</dd></div>
        <div><dt>Class</dt><dd>${escapeHtml(student.standard)}${student.section ? ` · Section ${escapeHtml(student.section)}` : ""}</dd></div>
        <div><dt>Academic year</dt><dd>${escapeHtml(academicYear)}</dd></div>
      </dl>

      <div class="amount-hero">
        <span>Amount received</span>
        <strong>${formatInr(payment.amount)}</strong>
      </div>

      <section class="block">
        <h2 class="block__title">Payment details</h2>
        <table>
          <tbody>
            <tr>
              <th scope="row">Payment date</th>
              <td>${formatDate(payment.date)}</td>
            </tr>
            <tr class="row-alt">
              <th scope="row">Payment mode</th>
              <td>${escapeHtml(modeLabel(payment.mode))}</td>
            </tr>
            <tr>
              <th scope="row">Reference / UTR</th>
              <td>${escapeHtml(payment.reference || "—")}</td>
            </tr>
            <tr class="row-alt">
              <th scope="row">Amount</th>
              <td class="num"><strong>${formatInr(payment.amount)}</strong></td>
            </tr>
          </tbody>
        </table>
      </section>

      ${notesBlock}

      <div class="summary">
        <div class="summary-card summary-card--due">
          <span>Total fees</span>
          <strong>${formatInr(account.totalDue)}</strong>
        </div>
        <div class="summary-card summary-card--paid">
          <span>Total paid</span>
          <strong>${formatInr(account.totalPaid)}</strong>
        </div>
        <div class="summary-card summary-card--balance">
          <span>Balance due</span>
          <strong>${formatInr(account.balance)}</strong>
        </div>
      </div>

      ${receiptFooterHtml(
        "Official payment receipt",
        `This receipt confirms fee payment recorded in the ${escapeHtml(PWA.shortName)} student portal.<br />Please retain for your records.`
      )}`;

  return renderReceiptDocument(
    `Payment Receipt — ${student.name}`,
    logoUrl,
    bodyContent,
    { compact: true }
  );
}

export function openFeeReceiptPrint(
  account: StudentFeeSummary,
  student: Pick<StudentProfile, "name" | "loginId" | "standard" | "section">,
  academicYear: string
): void {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : undefined;
  const html = buildFeeReceiptHtml(account, student, academicYear, { baseUrl });
  openReceiptHtml(html);
}

export function openPaymentReceiptPrint(
  account: StudentFeeSummary,
  payment: FeePayment,
  student: Pick<StudentProfile, "name" | "loginId" | "standard" | "section">,
  academicYear: string
): void {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : undefined;
  const html = buildPaymentReceiptHtml(account, payment, student, academicYear, { baseUrl });
  openReceiptHtml(html);
}
