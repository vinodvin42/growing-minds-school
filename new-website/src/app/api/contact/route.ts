import { NextResponse } from "next/server";
import { z } from "zod";
import { sendAdminEmail, sendAcknowledgmentEmail, getPublicEmailError } from "@/lib/email";
import { contactAcknowledgment } from "@/lib/email-templates";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    const html = `
      <html><body style="font-family: Arial, sans-serif;">
        <h2 style="color: #FF8C00;">New Contact Form Submission</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Name:</strong></td><td style="padding:8px;border-bottom:1px solid #ddd;">${escapeHtml(data.name)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Email:</strong></td><td style="padding:8px;border-bottom:1px solid #ddd;">${escapeHtml(data.email)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Phone:</strong></td><td style="padding:8px;border-bottom:1px solid #ddd;">${escapeHtml(data.phone)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Subject:</strong></td><td style="padding:8px;border-bottom:1px solid #ddd;">${escapeHtml(data.subject)}</td></tr>
        </table>
        <div style="margin-top:20px;padding:15px;background:#f9f9f9;border-left:4px solid #AACC00;">
          <h3>Message:</h3>
          <p style="white-space:pre-wrap;">${escapeHtml(data.message)}</p>
        </div>
      </body></html>`;

    const adminResult = await sendAdminEmail({
      subject: `Contact Form: ${data.subject}`,
      html,
      replyTo: data.email,
    });

    if (!adminResult.success) {
      return NextResponse.json({ success: false, message: getPublicEmailError(adminResult.message) }, { status: 500 });
    }

    const ackResult = await sendAcknowledgmentEmail({
      to: data.email,
      subject: "We received your message — Growing Minds English School",
      html: contactAcknowledgment(data.name),
      replyTo: process.env.GMAIL_USER || process.env.ADMIN_EMAIL,
    });

    if (!ackResult.success) {
      console.warn("Acknowledgment email failed:", ackResult.message);
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your message has been sent. A confirmation email has been sent to your inbox.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Please fill all required fields correctly." }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to send message." }, { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
