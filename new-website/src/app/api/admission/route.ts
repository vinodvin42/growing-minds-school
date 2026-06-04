import { NextResponse } from "next/server";
import { z } from "zod";
import { sendAdminEmail, sendAcknowledgmentEmail, getPublicEmailError } from "@/lib/email";
import { admissionAcknowledgment, admissionAdminNotification } from "@/lib/email-templates";

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

    const adminResult = await sendAdminEmail({
      subject: `New Admission Application — ${data.studentName} (${standardLabel})`,
      html: admissionAdminNotification({
        studentName: data.studentName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        standardLabel,
        parentEmail: data.parentEmail,
        fatherName: data.fatherName,
        motherName: data.motherName,
        fatherContact: data.fatherContact,
        motherContact: data.motherContact,
        currentAddress: data.currentAddress,
        permanentAddress: data.permanentAddress,
        siblingName: data.siblingName,
        siblingSchool: data.siblingSchool,
        siblingStandard: data.siblingStandard,
        files: data.files,
      }),
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
