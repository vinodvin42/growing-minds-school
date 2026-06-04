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

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || "growingminds2025@gmail.com";
}

function getFromName() {
  return process.env.EMAIL_FROM_NAME || "Growing Minds English School";
}

function getGmailPassword() {
  const raw = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD;
  return raw?.replace(/\s/g, "");
}

function useGmail() {
  return Boolean(process.env.GMAIL_USER?.trim() && getGmailPassword());
}

function getGmailTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER?.trim(),
      pass: getGmailPassword(),
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
    return "We could not send email from the website right now. Please email growingminds2025@gmail.com or call +91 97685 32431.";
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
  // Resend first — Gmail App Passwords are unavailable on many accounts.
  const attempts: Array<() => Promise<SendResult>> = [];
  if (resend) attempts.push(() => sendViaResend(options));
  if (useGmail()) attempts.push(() => sendViaGmail(options));

  let lastError = "No email provider configured";
  for (const attempt of attempts) {
    const result = await attempt();
    if (result.success) return result;
    lastError = result.message;
  }

  if (attempts.length === 0) {
    console.log("[Email - dev mode]", { to: options.to, subject: options.subject });
    return {
      success: true,
      message: "Email logged (configure RESEND_API_KEY or Gmail for production)",
    };
  }

  return { success: false, message: lastError };
}

/** Notify school admin (inbox: growingminds2025@gmail.com) */
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
  if (resend) return "resend";
  if (useGmail()) return "gmail";
  return "dev";
}
