export type FeeItemCategory =
  | "tuition"
  | "transport"
  | "activity"
  | "uniform"
  | "books"
  | "exam"
  | "other";

export type FeePaymentMode = "cash" | "upi" | "bank" | "cheque" | "other";

export type FeeAccountStatus = "paid" | "partial" | "pending" | "overdue";

export interface FeeLineItem {
  id: string;
  label: string;
  category: FeeItemCategory;
  amount: number;
  dueDate?: string;
  notes?: string;
}

export interface FeePayment {
  id: string;
  date: string;
  amount: number;
  mode: FeePaymentMode;
  reference?: string;
  notes?: string;
}

export interface StudentFeeAccount {
  studentId: string;
  academicYear: string;
  lineItems: FeeLineItem[];
  payments: FeePayment[];
  notes?: string;
  updatedAt: string;
}

export interface StudentFeeSummary extends StudentFeeAccount {
  totalDue: number;
  totalPaid: number;
  balance: number;
  status: FeeAccountStatus;
}

export const FEE_CATEGORIES: { value: FeeItemCategory; label: string }[] = [
  { value: "tuition", label: "Tuition" },
  { value: "transport", label: "Transport" },
  { value: "activity", label: "Activity / Events" },
  { value: "uniform", label: "Uniform" },
  { value: "books", label: "Books & Stationery" },
  { value: "exam", label: "Exam / Lab" },
  { value: "other", label: "Other" },
];

export const FEE_PAYMENT_MODES: { value: FeePaymentMode; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

export function feeUid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

export function sumFeeLineItems(items: FeeLineItem[]): number {
  return items.reduce((sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0), 0);
}

export function sumFeePayments(payments: FeePayment[]): number {
  return payments.reduce((sum, p) => sum + (Number.isFinite(p.amount) ? p.amount : 0), 0);
}

export function feeAccountBalance(account: Pick<StudentFeeAccount, "lineItems" | "payments">): number {
  return Math.max(0, sumFeeLineItems(account.lineItems) - sumFeePayments(account.payments));
}

export function feeAccountStatus(
  account: Pick<StudentFeeAccount, "lineItems" | "payments">
): FeeAccountStatus {
  const totalDue = sumFeeLineItems(account.lineItems);
  const totalPaid = sumFeePayments(account.payments);
  const balance = totalDue - totalPaid;

  if (totalDue <= 0) return "pending";
  if (balance <= 0) return "paid";
  if (totalPaid > 0) {
    const hasOverdue = account.lineItems.some((item) => {
      if (!item.dueDate) return false;
      const due = new Date(`${item.dueDate}T23:59:59`);
      return !Number.isNaN(due.getTime()) && due < new Date();
    });
    return hasOverdue ? "overdue" : "partial";
  }

  const anyOverdue = account.lineItems.some((item) => {
    if (!item.dueDate) return false;
    const due = new Date(`${item.dueDate}T23:59:59`);
    return !Number.isNaN(due.getTime()) && due < new Date();
  });
  return anyOverdue ? "overdue" : "pending";
}

export function toFeeSummary(account: StudentFeeAccount): StudentFeeSummary {
  const totalDue = sumFeeLineItems(account.lineItems);
  const totalPaid = sumFeePayments(account.payments);
  return {
    ...account,
    totalDue,
    totalPaid,
    balance: Math.max(0, totalDue - totalPaid),
    status: feeAccountStatus(account),
  };
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function feeStatusLabel(status: FeeAccountStatus): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "partial":
      return "Partially paid";
    case "overdue":
      return "Overdue";
    default:
      return "Pending";
  }
}

export function emptyFeeAccount(studentId: string, academicYear: string): StudentFeeAccount {
  return {
    studentId,
    academicYear,
    lineItems: [],
    payments: [],
    notes: "",
    updatedAt: new Date().toISOString(),
  };
}
