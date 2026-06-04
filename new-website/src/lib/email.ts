import nodemailer from "nodemailer";
import { Resend } from "resend";

type SendOptions = {
  subject: string;
  html: string;
  replyTo?: string;
};

type SendToOptions = SendOptions & {
  to: string | string[];
};

type SendResult = { success: boolean; message: string };

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const DEFAULT_ADMIN_EMAIL = "growingmindsenglishschool@gmail.com";

function getAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL;
}

function getFromName() {
  return process.env.EMAIL_FROM_NAME || "Growing Minds English School";
}

function getGmailAppPassword() {
  return process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
}

function useGmail() {
  return Boolean(process.env.GMAIL_USER?.trim() && getGmailAppPassword());
}

function getGmailTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER?.trim(),
      pass: getGmailAppPassword(),
    },
  });
}

function getResendFromAddress() {
  return process.env.FROM_EMAIL || `${getFromName()} <onboarding@resend.dev>`;
}

/** Hide SMTP/auth details from visitors — show a helpful message instead. */
export function getPublicEmailError(internal?: string): string {
  if (
    internal?.includes("535") ||
    internal?.includes("Invalid login") ||
    internal?.includes("BadCredentials")
  ) {
    return `We could not send email from the website right now. Please email ${getAdminEmail()} or call +91 97685 32431.`;
  }
  if (internal?.includes("No email provider configured")) {
    return `We could not send email from the website right now. Please email ${getAdminEmail()} or call +91 97685 32431.`;
  }
  return "We could not send your message right now. Please try again or contact us by phone or email.";
}

async function sendViaResend(options: SendToOptions): Promise<SendResult> {
  if (!resend) {
    return { success: false, message: "Resend not configured" };
  }

  const to = Array.isArray(options.to) ? options.to : [options.to];

  try {
    const { error } = await resend.emails.send({
      from: getResendFromAddress(),
      to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });
    if (error) {
      console.error("Resend error:", error);
      return { success: false, message: error.message };
    }
    return { success: true, message: "Email sent via Resend" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Resend send failed";
    return { success: false, message };
  }
}

async function sendViaGmail(options: SendToOptions): Promise<SendResult> {
  const to = Array.isArray(options.to) ? options.to : [options.to];

  try {
    const transporter = getGmailTransporter();
    await transporter.sendMail({
      from: `"${getFromName()}" <${process.env.GMAIL_USER?.trim()}>`,
      to: to.join(", "),
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo || process.env.GMAIL_USER?.trim(),
    });
    return { success: true, message: "Email sent via Gmail" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gmail send failed";
    console.error("Gmail error:", message);
    return { success: false, message };
  }
}

async function deliver(options: SendToOptions): Promise<SendResult> {
  const attempts: Array<() => Promise<SendResult>> = [];
  const prefer = process.env.EMAIL_PREFER?.trim().toLowerCase();

  if (prefer === "resend") {
    if (resend) attempts.push(() => sendViaResend(options));
    if (useGmail()) attempts.push(() => sendViaGmail(options));
  } else if (prefer === "gmail") {
    if (useGmail()) attempts.push(() => sendViaGmail(options));
    if (resend) attempts.push(() => sendViaResend(options));
  } else {
    // Default: Gmail first (school inbox), then Resend fallback
    if (useGmail()) attempts.push(() => sendViaGmail(options));
    if (resend) attempts.push(() => sendViaResend(options));
  }

  let lastError = "No email provider configured";
  for (const attempt of attempts) {
    const result = await attempt();
    if (result.success) return result;
    lastError = result.message;
  }

  if (attempts.length === 0) {
    console.error("[Email] No provider configured — set GMAIL_APP_PASSWORD or RESEND_API_KEY");
    if (process.env.NODE_ENV === "development") {
      console.log("[Email - dev mode]", { to: options.to, subject: options.subject });
      return {
        success: true,
        message: "Email logged (configure GMAIL_APP_PASSWORD or RESEND_API_KEY for production)",
      };
    }
    return { success: false, message: lastError };
  }

  return { success: false, message: lastError };
}

/** Notify school admin inbox */
export async function sendAdminEmail(options: SendOptions) {
  return deliver({
    ...options,
    to: getAdminEmail(),
    replyTo: options.replyTo,
  });
}

/** Send acknowledgment to parent / visitor */
export async function sendAcknowledgmentEmail(options: SendToOptions) {
  return deliver(options);
}

/** @deprecated Use sendAdminEmail */
export async function sendEmail(options: SendOptions) {
  return sendAdminEmail(options);
}

export function getEmailProvider(): "resend" | "gmail" | "dev" {
  if (useGmail()) return "gmail";
  if (resend) return "resend";
  return "dev";
}

export function getEmailConfigStatus() {
  return {
    provider: getEmailProvider(),
    prefer: process.env.EMAIL_PREFER?.trim() || "gmail",
    adminEmail: getAdminEmail(),
    gmailUser: process.env.GMAIL_USER?.trim() || null,
    gmailConfigured: useGmail(),
    resendConfigured: Boolean(resend),
  };
}
