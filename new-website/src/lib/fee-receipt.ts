import { FEE_CATEGORIES, FEE_PAYMENT_MODES, formatInr, feeStatusLabel, type StudentFeeSummary } from "@/types/student-fees";
import type { StudentProfile } from "@/types/student";

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

export function buildFeeReceiptHtml(
  account: StudentFeeSummary,
  student: Pick<StudentProfile, "name" | "loginId" | "standard" | "section">,
  academicYear: string
): string {
  const issued = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const feeRows = account.lineItems
    .map(
      (item) => `
    <tr>
      <td>${escapeHtml(item.label || categoryLabel(item.category))}</td>
      <td>${escapeHtml(categoryLabel(item.category))}</td>
      <td>${item.dueDate ? formatDate(item.dueDate) : "—"}</td>
      <td style="text-align:right">${formatInr(item.amount)}</td>
    </tr>`
    )
    .join("");

  const paymentRows = [...account.payments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(
      (p) => `
    <tr>
      <td>${formatDate(p.date)}</td>
      <td>${escapeHtml(modeLabel(p.mode))}</td>
      <td>${escapeHtml(p.reference || "—")}</td>
      <td style="text-align:right">${formatInr(p.amount)}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Fee Statement — ${escapeHtml(student.name)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #2D4A22; margin: 24px; line-height: 1.45; }
    h1 { font-size: 20px; margin: 0 0 4px; color: #2D4A22; }
    .sub { color: #6B7A62; font-size: 13px; margin-bottom: 20px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 20px; font-size: 13px; }
    .meta strong { display: block; font-size: 11px; text-transform: uppercase; color: #6B7A62; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .summary div { border: 1px solid #ddd; border-radius: 8px; padding: 12px; text-align: center; }
    .summary span { display: block; font-size: 11px; color: #6B7A62; text-transform: uppercase; }
    .summary strong { font-size: 16px; }
    h2 { font-size: 14px; margin: 20px 0 8px; border-bottom: 2px solid #FF8C00; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 8px; }
    th, td { border: 1px solid #e5e7e0; padding: 8px; text-align: left; }
    th { background: #F5FAEB; }
    .foot { margin-top: 28px; font-size: 11px; color: #6B7A62; text-align: center; }
    @media print { body { margin: 12mm; } }
  </style>
</head>
<body>
  <h1>Growing Minds English School</h1>
  <p class="sub">Fee statement · Academic year ${escapeHtml(academicYear)} · Issued ${issued}</p>
  <div class="meta">
    <div><strong>Student</strong>${escapeHtml(student.name)}</div>
    <div><strong>Student ID</strong>${escapeHtml(student.loginId)}</div>
    <div><strong>Class</strong>${escapeHtml(student.standard)}${student.section ? ` · Sec ${escapeHtml(student.section)}` : ""}</div>
    <div><strong>Status</strong>${escapeHtml(feeStatusLabel(account.status))}</div>
  </div>
  <div class="summary">
    <div><span>Total fees</span><strong>${formatInr(account.totalDue)}</strong></div>
    <div><span>Paid</span><strong>${formatInr(account.totalPaid)}</strong></div>
    <div><span>Balance</span><strong>${formatInr(account.balance)}</strong></div>
  </div>
  ${account.lineItems.length ? `<h2>Fee breakdown</h2><table><thead><tr><th>Description</th><th>Category</th><th>Due</th><th>Amount</th></tr></thead><tbody>${feeRows}</tbody></table>` : ""}
  ${account.payments.length ? `<h2>Payment history</h2><table><thead><tr><th>Date</th><th>Mode</th><th>Reference</th><th>Amount</th></tr></thead><tbody>${paymentRows}</tbody></table>` : ""}
  ${account.notes?.trim() ? `<p><strong>Note:</strong> ${escapeHtml(account.notes)}</p>` : ""}
  <p class="foot">Computer-generated statement. For queries contact the school office.</p>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function openFeeReceiptPrint(
  account: StudentFeeSummary,
  student: Pick<StudentProfile, "name" | "loginId" | "standard" | "section">,
  academicYear: string
): void {
  const html = buildFeeReceiptHtml(account, student, academicYear);
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) {
    alert("Please allow pop-ups to download or print the fee receipt.");
    return;
  }
  win.document.write(html);
  win.document.close();
}
