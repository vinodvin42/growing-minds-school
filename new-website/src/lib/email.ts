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

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || "growingminds2025@gmail.com";
}

function getFromName() {
  return process.env.EMAIL_FROM_NAME || "Growing Minds English School";
}

function useGmail() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function getGmailTransporter() {
  const user = process.env.GMAIL_USER?.trim();
  // Google displays app passwords in groups of 4 — strip spaces if pasted that way.
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

async function deliver(options: SendToOptions): Promise<{ success: boolean; message: string }> {
  const to = Array.isArray(options.to) ? options.to : [options.to];

  if (useGmail()) {
    try {
      const transporter = getGmailTransporter();
      await transporter.sendMail({
        from: `"${getFromName()}" <${process.env.GMAIL_USER}>`,
        to: to.join(", "),
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo || process.env.GMAIL_USER,
      });
      return { success: true, message: "Email sent via Gmail" };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gmail send failed";
      console.error("Gmail error:", message);
      return { success: false, message };
    }
  }

  if (resend) {
    try {
      const from =
        process.env.FROM_EMAIL || `${getFromName()} <onboarding@resend.dev>`;
      const { error } = await resend.emails.send({
        from,
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

  console.log("[Email - dev mode]", { to, subject: options.subject });
  return {
    success: true,
    message: "Email logged (configure GMAIL_USER + GMAIL_APP_PASSWORD for production)",
  };
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

export function getEmailProvider(): "gmail" | "resend" | "dev" {
  if (useGmail()) return "gmail";
  if (resend) return "resend";
  return "dev";
}
