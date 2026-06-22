"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminBadge,
  AdminCellText,
  AdminCollapsibleSection,
  AdminEditModal,
  AdminTable,
  AdminTableActions,
  AdminFloatingSaveBar,
  AdminBulkCsvPanel,
} from "@/components/admin/AdminListUi";
import {
  downloadFeeLineCsvTemplate,
  exportFeeSummaryCsv,
  mergeImportedFeeLines,
  parseFeeLineCsv,
} from "@/lib/fee-csv";
import {
  openReceiptInNewTab,
  adminFeeStatementReceiptUrl,
  adminPaymentReceiptUrl,
} from "@/lib/fee-receipt";
import {
  emptyFeeAccount,
  FEE_CATEGORIES,
  FEE_PAYMENT_MODES,
  feeUid,
  formatInr,
  feeStatusLabel,
  type FeeAccountStatus,
  type FeeLineItem,
  type FeePayment,
  type StudentFeeAccount,
  type StudentFeeSummary,
} from "@/types/student-fees";
import { STUDENT_STANDARDS } from "@/types/student";

type StudentRow = {
  id: string;
  loginId: string;
  name: string;
  standard: string;
  section?: string;
  rollNumber?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>
      {children}
    </div>
  );
}

function statusTone(status: StudentFeeSummary["status"]): "success" | "warning" | "muted" {
  if (status === "paid") return "success";
  if (status === "overdue" || status === "partial") return "warning";
  return "muted";
}

function parseAmount(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
}

export default function StudentFeesEditor() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [accounts, setAccounts] = useState<StudentFeeAccount[]>([]);
  const [academicYear, setAcademicYear] = useState(String(new Date().getFullYear()));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStandard, setFilterStandard] = useState("all");
  const [filterFeeStatus, setFilterFeeStatus] = useState<"all" | FeeAccountStatus>("all");
  const [importing, setImporting] = useState(false);
  const [bulkStandard, setBulkStandard] = useState("all");
  const [bulkLabel, setBulkLabel] = useState("");
  const [bulkCategory, setBulkCategory] = useState<FeeLineItem["category"]>("tuition");
  const [bulkAmount, setBulkAmount] = useState("");
  const [bulkDueDate, setBulkDueDate] = useState("");

  const summaries = useMemo(() => {
    const map = new Map(accounts.map((a) => [a.studentId, a]));
    return students.map((student) => {
      const account = map.get(student.id) ?? emptyFeeAccount(student.id, academicYear);
      const totalDue = account.lineItems.reduce((s, i) => s + i.amount, 0);
      const totalPaid = account.payments.reduce((s, p) => s + p.amount, 0);
      const balance = Math.max(0, totalDue - totalPaid);
      let feeStatus: StudentFeeSummary["status"] = "pending";
      if (totalDue <= 0) feeStatus = "pending";
      else if (balance <= 0) feeStatus = "paid";
      else if (totalPaid > 0) feeStatus = "partial";
      return { student, account, totalDue, totalPaid, balance, status: feeStatus };
    });
  }, [accounts, students, academicYear]);

  const filteredSummaries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return summaries.filter(({ student, status: feeStatus }) => {
      if (filterStandard !== "all" && student.standard !== filterStandard) return false;
      if (filterFeeStatus !== "all" && feeStatus !== filterFeeStatus) return false;
      if (!q) return true;
      const haystack = [
        student.name,
        student.loginId,
        student.rollNumber,
        student.parentName,
        student.parentPhone,
        student.standard,
        student.section,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [summaries, searchQuery, filterStandard, filterFeeStatus]);

  const filtersActive =
    searchQuery.trim() !== "" || filterStandard !== "all" || filterFeeStatus !== "all";

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/student-fees", { cache: "no-store" });
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    if (data.success) {
      setStudents(data.students ?? []);
      setAcademicYear(data.academicYear ?? String(new Date().getFullYear()));
      setAccounts(
        (data.accounts as StudentFeeSummary[]).map(({ studentId, academicYear: year, lineItems, payments, notes, updatedAt }) => ({
          studentId,
          academicYear: year,
          lineItems,
          payments,
          notes,
          updatedAt,
        }))
      );
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(next?: StudentFeeAccount[]) {
    const payload = next ?? accounts;
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/student-fees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accounts: payload }),
      });
      const data = await res.json();
      if (data.success) {
        setAccounts(
          (data.accounts as StudentFeeSummary[]).map(({ studentId, academicYear: year, lineItems, payments, notes, updatedAt }) => ({
            studentId,
            academicYear: year,
            lineItems,
            payments,
            notes,
            updatedAt,
          }))
        );
        setStatus("Fee accounts saved!");
        return true;
      }
      setStatus(data.message || "Save failed");
      return false;
    } finally {
      setSaving(false);
    }
  }

  const editing = accounts.find((a) => a.studentId === editingId);
  const editingStudent = students.find((s) => s.id === editingId);

  function getOrCreateAccount(studentId: string): StudentFeeAccount {
    return accounts.find((a) => a.studentId === studentId) ?? emptyFeeAccount(studentId, academicYear);
  }

  function patchAccount(studentId: string, patch: Partial<StudentFeeAccount>) {
    setAccounts((list) => {
      const existing = list.find((a) => a.studentId === studentId);
      if (existing) {
        return list.map((a) => (a.studentId === studentId ? { ...a, ...patch } : a));
      }
      return [...list, { ...emptyFeeAccount(studentId, academicYear), ...patch }];
    });
  }

  function addLineItem(studentId: string) {
    const account = getOrCreateAccount(studentId);
    const item: FeeLineItem = {
      id: feeUid("fee"),
      label: "",
      category: "tuition",
      amount: 0,
      dueDate: "",
      notes: "",
    };
    patchAccount(studentId, { lineItems: [...account.lineItems, item] });
  }

  function patchLineItem(studentId: string, itemId: string, patch: Partial<FeeLineItem>) {
    const account = getOrCreateAccount(studentId);
    patchAccount(studentId, {
      lineItems: account.lineItems.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    });
  }

  function removeLineItem(studentId: string, itemId: string) {
    const account = getOrCreateAccount(studentId);
    patchAccount(studentId, { lineItems: account.lineItems.filter((item) => item.id !== itemId) });
  }

  function addPayment(studentId: string) {
    const account = getOrCreateAccount(studentId);
    const payment: FeePayment = {
      id: feeUid("pay"),
      date: new Date().toISOString().slice(0, 10),
      amount: 0,
      mode: "upi",
      reference: "",
      notes: "",
    };
    patchAccount(studentId, { payments: [...account.payments, payment] });
  }

  function patchPayment(studentId: string, paymentId: string, patch: Partial<FeePayment>) {
    const account = getOrCreateAccount(studentId);
    patchAccount(studentId, {
      payments: account.payments.map((p) => (p.id === paymentId ? { ...p, ...patch } : p)),
    });
  }

  function removePayment(studentId: string, paymentId: string) {
    const account = getOrCreateAccount(studentId);
    patchAccount(studentId, { payments: account.payments.filter((p) => p.id !== paymentId) });
  }

  function openEditor(studentId: string) {
    if (!accounts.find((a) => a.studentId === studentId)) {
      setAccounts((list) => [...list, emptyFeeAccount(studentId, academicYear)]);
    }
    setEditingId(studentId);
  }

  function applyBulkFeeToClass() {
    const label = bulkLabel.trim();
    const amount = parseAmount(bulkAmount);
    if (!label) {
      setStatus("Enter a fee name for bulk assign.");
      return;
    }
    if (amount <= 0) {
      setStatus("Enter a valid amount for bulk assign.");
      return;
    }
    const targets = students.filter((s) => bulkStandard === "all" || s.standard === bulkStandard);
    if (targets.length === 0) {
      setStatus("No students in the selected class.");
      return;
    }
    const targetIds = new Set(targets.map((s) => s.id));
    setAccounts((list) => {
      const byId = new Map(list.map((a) => [a.studentId, a]));
      for (const id of targetIds) {
        const account = byId.get(id) ?? emptyFeeAccount(id, academicYear);
        const item: FeeLineItem = {
          id: feeUid("fee"),
          label,
          category: bulkCategory,
          amount,
          dueDate: bulkDueDate || undefined,
        };
        byId.set(id, { ...account, lineItems: [...account.lineItems, item] });
      }
      const merged = list.map((a) => byId.get(a.studentId) ?? a);
      for (const id of targetIds) {
        if (!list.some((a) => a.studentId === id)) {
          merged.push(byId.get(id)!);
        }
      }
      return merged;
    });
    setStatus(`Added "${label}" to ${targets.length} student(s). Click Save All Fee Accounts.`);
  }

  async function handleFeeCsvImport(file: File) {
    setImporting(true);
    setStatus("");
    try {
      const text = await file.text();
      const { rows, errors } = parseFeeLineCsv(text);
      if (errors.length) {
        setStatus(errors.slice(0, 5).join(" ") + (errors.length > 5 ? ` (+${errors.length - 5} more)` : ""));
        return;
      }
      if (rows.length === 0) {
        setStatus("No fee rows found in file.");
        return;
      }
      const { merged, added, skipped, unknownLogins } = mergeImportedFeeLines(accounts, students, academicYear, rows);
      setAccounts(merged);
      let msg = `Imported ${added} fee item(s).`;
      if (skipped) msg += ` Skipped ${skipped} (unknown loginId).`;
      if (unknownLogins.length) {
        msg += ` Unknown IDs: ${unknownLogins.slice(0, 3).join(", ")}${unknownLogins.length > 3 ? "…" : ""}.`;
      }
      msg += " Click Save All Fee Accounts.";
      setStatus(msg);
    } catch {
      setStatus("Could not read CSV file.");
    } finally {
      setImporting(false);
    }
  }

  function exportFeeSummary() {
    exportFeeSummaryCsv(
      summaries.map(({ student, totalDue, totalPaid, balance, status: feeStatus }) => ({
        loginId: student.loginId,
        name: student.name,
        standard: student.standard,
        totalDue,
        totalPaid,
        balance,
        status: feeStatus,
      }))
    );
  }

  const editingDue = editing?.lineItems.reduce((s, i) => s + i.amount, 0) ?? 0;
  const editingPaid = editing?.payments.reduce((s, p) => s + p.amount, 0) ?? 0;
  const editingBalance = Math.max(0, editingDue - editingPaid);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-orange" role="status" />
      </div>
    );
  }

  return (
    <>
      <AdminCollapsibleSection
        title="Student Fees & Accounts"
        hint={`Academic year ${academicYear}. Saved per student in portal/${academicYear}/accounts/{studentId}.json`}
        count={filtersActive ? filteredSummaries.length : students.length}
        defaultOpen
      >
        {students.length > 0 && (
          <div className="admin-student-toolbar mb-3">
            <div className="row g-2 align-items-end">
              <div className="col-md-4">
                <label className="form-label small mb-1">Search</label>
                <input
                  type="search"
                  className="form-control form-control-sm"
                  placeholder="Name, ID, roll, parent, phone…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small mb-1">Class</label>
                <select
                  className="form-select form-select-sm"
                  value={filterStandard}
                  onChange={(e) => setFilterStandard(e.target.value)}
                >
                  <option value="all">All classes</option>
                  {STUDENT_STANDARDS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small mb-1">Fee status</label>
                <select
                  className="form-select form-select-sm"
                  value={filterFeeStatus}
                  onChange={(e) => setFilterFeeStatus(e.target.value as "all" | FeeAccountStatus)}
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="col-md-2">
                {filtersActive && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm w-100"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStandard("all");
                      setFilterFeeStatus("all");
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            {filtersActive && (
              <p className="small text-muted mb-0 mt-2">
                Showing {filteredSummaries.length} of {students.length} students
              </p>
            )}

            <div className="admin-bulk-panel mt-3 p-3 border rounded bg-light">
              <p className="small fw-semibold mb-2">
                <i className="fas fa-layer-group me-1 text-orange" />
                Bulk assign fee
              </p>
              <p className="small text-muted mb-2">
                Add the same fee item to every student in a class (or all students). Save when done.
              </p>
              <div className="row g-2 align-items-end">
                <div className="col-md-2">
                  <label className="form-label small mb-1">Class</label>
                  <select
                    className="form-select form-select-sm"
                    value={bulkStandard}
                    onChange={(e) => setBulkStandard(e.target.value)}
                  >
                    <option value="all">All students</option>
                    {STUDENT_STANDARDS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small mb-1">Fee name</label>
                  <input
                    className="form-control form-control-sm"
                    value={bulkLabel}
                    onChange={(e) => setBulkLabel(e.target.value)}
                    placeholder="Term 1 Tuition"
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label small mb-1">Category</label>
                  <select
                    className="form-select form-select-sm"
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value as FeeLineItem["category"])}
                  >
                    {FEE_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label small mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    className="form-control form-control-sm"
                    value={bulkAmount}
                    onChange={(e) => setBulkAmount(e.target.value)}
                    placeholder="15000"
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label small mb-1">Due date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm admin-date-input"
                    value={bulkDueDate}
                    onChange={(e) => setBulkDueDate(e.target.value)}
                  />
                </div>
                <div className="col-md-1">
                  <button
                    type="button"
                    className="btn btn-orange btn-sm w-100"
                    disabled={saving || importing}
                    onClick={applyBulkFeeToClass}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            <AdminBulkCsvPanel
              hint={
                <>
                  Import fee line items by student login ID, or export a summary of all balances. Unknown login IDs are
                  skipped.
                </>
              }
              uploading={importing}
              uploadDisabled={saving}
              onDownloadTemplate={downloadFeeLineCsvTemplate}
              onExport={exportFeeSummary}
              exportDisabled={students.length === 0}
              onFileSelected={(file) => void handleFeeCsvImport(file)}
            />
          </div>
        )}

        {students.length === 0 ? (
          <div className="admin-empty-list">
            <i className="fas fa-wallet d-block" />
            <p className="mb-0">Add students first, then set up their fee accounts here.</p>
          </div>
        ) : filteredSummaries.length === 0 ? (
          <div className="admin-empty-list">
            <i className="fas fa-search d-block" />
            <p className="mb-0">No students match your search or filters.</p>
          </div>
        ) : (
          <AdminTable>
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Total due</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filteredSummaries.map(({ student, totalDue, totalPaid, balance, status: feeStatus }) => (
                <tr key={student.id}>
                  <AdminCellText primary={student.name} secondary={student.loginId} />
                  <td>
                    {student.standard}
                    {student.section ? ` · ${student.section}` : ""}
                  </td>
                  <td>{formatInr(totalDue)}</td>
                  <td>{formatInr(totalPaid)}</td>
                  <td>{formatInr(balance)}</td>
                  <td>
                    <AdminBadge tone={statusTone(feeStatus)}>{feeStatusLabel(feeStatus)}</AdminBadge>
                  </td>
                  <AdminTableActions
                    onEdit={() => openEditor(student.id)}
                    onDelete={() => patchAccount(student.id, emptyFeeAccount(student.id, academicYear))}
                    onReceipt={() => openReceiptInNewTab(adminFeeStatementReceiptUrl(student.id))}
                    editLabel="Manage"
                  />
                </tr>
              ))}
            </tbody>
          </AdminTable>
        )}
      </AdminCollapsibleSection>

      <AdminFloatingSaveBar
        label="Save All Fee Accounts"
        saving={saving}
        disabled={students.length === 0}
        onSave={() => save()}
        status={status}
      />

      <AdminEditModal
        open={!!editing && !!editingStudent}
        title={editingStudent ? `Fees: ${editingStudent.name}` : "Fee account"}
        onClose={() => setEditingId(null)}
        size="xl"
        footer={
          <button type="button" className="btn btn-orange" disabled={saving} onClick={() => save()}>
            {saving ? "Saving…" : "Save Fee Account"}
          </button>
        }
      >
        {editing && editingStudent && (
          <div className="row g-3">
            <div className="col-12">
              <div className="admin-fee-toolbar">
                <div className="admin-fee-summary">
                  <div>
                    <span className="admin-fee-summary__label">Total due</span>
                    <strong>{formatInr(editingDue)}</strong>
                  </div>
                  <div>
                    <span className="admin-fee-summary__label">Paid</span>
                    <strong>{formatInr(editingPaid)}</strong>
                  </div>
                  <div>
                    <span className="admin-fee-summary__label">Balance</span>
                    <strong className="text-orange">{formatInr(editingBalance)}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary admin-fee-toolbar__statement"
                  onClick={() => openReceiptInNewTab(adminFeeStatementReceiptUrl(editing.studentId))}
                >
                  <i className="fas fa-file-pdf me-1" aria-hidden="true" />
                  Fee statement
                </button>
              </div>
            </div>

            <div className="col-12">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h3 className="admin-subheading mb-0">Fee items</h3>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => addLineItem(editing.studentId)}>
                  <i className="fas fa-plus me-1" aria-hidden="true" />
                  Add fee
                </button>
              </div>
              {editing.lineItems.length === 0 ? (
                <p className="small text-muted mb-0">No fee items yet. Add tuition, transport, etc.</p>
              ) : (
                <>
                  <div className="admin-fee-row admin-fee-row--head admin-fee-row--items" aria-hidden="true">
                    <span>Fee name</span>
                    <span>Category</span>
                    <span>Amount</span>
                    <span>Due date</span>
                    <span />
                  </div>
                  {editing.lineItems.map((item) => (
                  <div key={item.id} className="admin-fee-row admin-fee-row--items">
                    <div className="admin-fee-row__field">
                      <input
                        className="form-control form-control-sm"
                        value={item.label}
                        onChange={(e) => patchLineItem(editing.studentId, item.id, { label: e.target.value })}
                        placeholder="Fee name"
                        aria-label="Fee name"
                      />
                    </div>
                    <div className="admin-fee-row__field">
                      <select
                        className="form-select form-select-sm"
                        value={item.category}
                        onChange={(e) =>
                          patchLineItem(editing.studentId, item.id, {
                            category: e.target.value as FeeLineItem["category"],
                          })
                        }
                        aria-label="Fee category"
                      >
                        {FEE_CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="admin-fee-row__field admin-fee-row__field--amount">
                      <input
                        type="number"
                        min={0}
                        className="form-control form-control-sm"
                        value={item.amount || ""}
                        onChange={(e) => patchLineItem(editing.studentId, item.id, { amount: parseAmount(e.target.value) })}
                        placeholder="₹"
                        aria-label="Fee amount"
                      />
                    </div>
                    <div className="admin-fee-row__field admin-fee-row__field--date">
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={item.dueDate ?? ""}
                        onChange={(e) => patchLineItem(editing.studentId, item.id, { dueDate: e.target.value })}
                        aria-label="Due date"
                      />
                    </div>
                    <div className="admin-fee-row__actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger admin-fee-row__icon-btn"
                        onClick={() => removeLineItem(editing.studentId, item.id)}
                        aria-label="Remove fee item"
                      >
                        <i className="fas fa-trash" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  ))}
                </>
              )}
            </div>

            <div className="col-12">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h3 className="admin-subheading mb-0">Payments received</h3>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => addPayment(editing.studentId)}>
                  <i className="fas fa-plus me-1" aria-hidden="true" />
                  Add payment
                </button>
              </div>
              {editing.payments.length === 0 ? (
                <p className="small text-muted mb-0">Record cash, UPI, or bank payments here.</p>
              ) : (
                <>
                  <div className="admin-fee-row admin-fee-row--head admin-fee-row--payments" aria-hidden="true">
                    <span>Date</span>
                    <span>Amount</span>
                    <span>Mode</span>
                    <span>Reference</span>
                    <span />
                  </div>
                  {editing.payments.map((payment) => (
                  <div key={payment.id} className="admin-fee-row admin-fee-row--payments">
                    <div className="admin-fee-row__field admin-fee-row__field--date">
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={payment.date}
                        onChange={(e) => patchPayment(editing.studentId, payment.id, { date: e.target.value })}
                        aria-label="Payment date"
                      />
                    </div>
                    <div className="admin-fee-row__field admin-fee-row__field--amount">
                      <input
                        type="number"
                        min={0}
                        className="form-control form-control-sm"
                        value={payment.amount || ""}
                        onChange={(e) => patchPayment(editing.studentId, payment.id, { amount: parseAmount(e.target.value) })}
                        placeholder="₹"
                        aria-label="Payment amount"
                      />
                    </div>
                    <div className="admin-fee-row__field">
                      <select
                        className="form-select form-select-sm"
                        value={payment.mode}
                        onChange={(e) =>
                          patchPayment(editing.studentId, payment.id, {
                            mode: e.target.value as FeePayment["mode"],
                          })
                        }
                        aria-label="Payment mode"
                      >
                        {FEE_PAYMENT_MODES.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="admin-fee-row__field">
                      <input
                        className="form-control form-control-sm"
                        value={payment.reference ?? ""}
                        onChange={(e) => patchPayment(editing.studentId, payment.id, { reference: e.target.value })}
                        placeholder="Receipt / UPI ref"
                        aria-label="Payment reference"
                      />
                    </div>
                    <div className="admin-fee-row__actions">
                      {payment.amount > 0 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary admin-fee-row__receipt-btn"
                          onClick={() =>
                            openReceiptInNewTab(adminPaymentReceiptUrl(editing.studentId, payment.id))
                          }
                          title="Download payment receipt"
                        >
                          <i className="fas fa-file-pdf" aria-hidden="true" />
                          <span>Receipt</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger admin-fee-row__icon-btn"
                        onClick={() => removePayment(editing.studentId, payment.id)}
                        aria-label="Remove payment"
                      >
                        <i className="fas fa-trash" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  ))}
                </>
              )}
            </div>

            <div className="col-12">
              <Field label="Note for parents (shown in student app)">
                <textarea
                  className="form-control"
                  rows={3}
                  value={editing.notes ?? ""}
                  onChange={(e) => patchAccount(editing.studentId, { notes: e.target.value })}
                  placeholder="e.g. Pay balance by 15th of each month at the school office."
                />
              </Field>
            </div>
          </div>
        )}
      </AdminEditModal>
    </>
  );
}
