import { NextResponse } from "next/server";
import { z } from "zod";
import { sendAdminEmail, sendAcknowledgmentEmail, getPublicEmailError } from "@/lib/email";
import { admissionAcknowledgment } from "@/lib/email-templates";

const admissionSchema = z.object({
  studentName: z.string().min(1),
  dateOfBirth: z.string().min(1),
  gender: z.string().min(1),
  applyingForStandard: z.string().min(1),
  parentEmail: z.string().email(),
  fatherName: z.string().min(1),
  motherName: z.string().min(1),
  fatherContact: z.string().min(10),
  motherContact: z.string().min(10),
  currentAddress: z.string().min(1),
  permanentAddress: z.string().min(1),
  siblingName: z.string().optional(),
  siblingSchool: z.string().optional(),
  siblingStandard: z.string().optional(),
  files: z.record(z.string(), z.string()),
});

const REQUIRED_FILES = [
  "birthCertificate", "studentPhoto", "studentAadhaar",
  "fatherAadhaar", "fatherPhoto", "motherAadhaar",
  "motherPhoto", "electricityBill",
];

const STANDARD_LABELS: Record<string, string> = {
  nursery: "Nursery", lkg: "LKG", ukg: "UKG",
  "1st": "1st Standard", "2nd": "2nd Standard", "3rd": "3rd Standard",
  "4th": "4th Standard", "5th": "5th Standard", "6th": "6th Standard",
  "7th": "7th Standard", "8th": "8th Standard",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = admissionSchema.parse(body);

    for (const field of REQUIRED_FILES) {
      if (!data.files[field]) {
        return NextResponse.json({ success: false, message: `File ${field} is required` }, { status: 400 });
      }
    }

    const needsTC = ["2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].includes(data.applyingForStandard);
    if (needsTC && !data.files.previousTC) {
      return NextResponse.json(
        { success: false, message: "Previous School TC/LC is required for 2nd-8th Standard" },
        { status: 400 }
      );
    }

    const standardLabel = STANDARD_LABELS[data.applyingForStandard] || data.applyingForStandard;

    const fileLinksHtml = Object.entries(data.files)
      .map(([k, url]) => `<li><strong>${k}:</strong> <a href="${esc(url)}">${esc(url)}</a></li>`)
      .join("");

    const html = `
      <html><body style="font-family: Arial, sans-serif;">
        <h2 style="color: #FF8C00; border-bottom: 3px solid #AACC00; padding-bottom: 10px;">
          New Admission Application
        </h2>
        <h3>Student Details</h3>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Name:</strong></td><td>${esc(data.studentName)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>DOB:</strong></td><td>${esc(data.dateOfBirth)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Gender:</strong></td><td>${esc(data.gender)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Standard:</strong></td><td>${esc(standardLabel)}</td></tr>
        </table>
        <h3>Parent Details</h3>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Email:</strong></td><td>${esc(data.parentEmail)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Father:</strong></td><td>${esc(data.fatherName)} (${esc(data.fatherContact)})</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Mother:</strong></td><td>${esc(data.motherName)} (${esc(data.motherContact)})</td></tr>
        </table>
        <h3>Address</h3>
        <p><strong>Current:</strong> ${esc(data.currentAddress)}</p>
        <p><strong>Permanent:</strong> ${esc(data.permanentAddress)}</p>
        ${data.siblingName ? `<p><strong>Sibling:</strong> ${esc(data.siblingName)} - ${esc(data.siblingSchool || "")} (${esc(data.siblingStandard || "")})</p>` : ""}
        <h3>Uploaded Documents</h3>
        <ul>${fileLinksHtml}</ul>
      </body></html>`;

    const adminResult = await sendAdminEmail({
      subject: `New Admission Application - ${data.studentName}`,
      html,
      replyTo: data.parentEmail,
    });

    if (!adminResult.success) {
      return NextResponse.json({ success: false, message: getPublicEmailError(adminResult.message) }, { status: 500 });
    }

    const ackResult = await sendAcknowledgmentEmail({
      to: data.parentEmail,
      subject: "Admission Application Received — Growing Minds English School",
      html: admissionAcknowledgment(data.studentName, standardLabel, data.fatherName),
      replyTo: process.env.GMAIL_USER || process.env.ADMIN_EMAIL,
    });

    if (!ackResult.success) {
      console.warn("Admission acknowledgment failed:", ackResult.message);
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully! A confirmation email has been sent to your email address.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Please fill all required fields correctly." }, { status: 400 });
    }
    console.error("Admission error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to process application. Please try again." },
      { status: 500 }
    );
  }
}

function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
