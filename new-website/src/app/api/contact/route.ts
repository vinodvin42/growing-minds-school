import { NextResponse } from "next/server";
import { z } from "zod";
import { sendAdminEmail, sendAcknowledgmentEmail, getPublicEmailError } from "@/lib/email";
import { contactAcknowledgment, contactAdminNotification } from "@/lib/email-templates";

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

    const adminResult = await sendAdminEmail({
      subject: `Contact Form: ${data.subject}`,
      html: contactAdminNotification(data),
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
