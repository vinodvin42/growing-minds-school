const SCHOOL_NAME = "Growing Minds English School";
const ORANGE = "#FF8C00";
const LIME = "#AACC00";

function layout(title: string, body: string) {
  return `
    <html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
      <div style="border-bottom: 3px solid ${LIME}; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="color: ${ORANGE}; margin: 0;">${SCHOOL_NAME}</h2>
        <p style="margin: 4px 0 0; color: #666;">${title}</p>
      </div>
      ${body}
      <div style="margin-top: 30px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 13px; color: #888;">
        <p>Shop No. D1, Plot No. 17, Malwani, Malad West, Mumbai - 400095</p>
        <p>Phone: +91 97685 32431 | Email: growingmindsenglishschool@gmail.com</p>
        <p>&copy; 2026 ${SCHOOL_NAME}. All rights reserved.</p>
      </div>
    </body></html>`;
}

export function contactAcknowledgment(name: string) {
  return layout(
    "Message Received",
    `
      <p>Dear ${name},</p>
      <p>Thank you for contacting <strong>${SCHOOL_NAME}</strong>.</p>
      <p>We have received your message and our team will get back to you within 1–2 working days.</p>
      <p>For urgent enquiries, please call us at <strong>+91 97685 32431</strong>.</p>
      <p>Warm regards,<br><strong>Admissions Team</strong><br>${SCHOOL_NAME}</p>
    `
  );
}

export function admissionAcknowledgment(studentName: string, standard: string, parentName: string) {
  return layout(
    "Admission Application Received",
    `
      <p>Dear ${parentName},</p>
      <p>Thank you for applying to <strong>${SCHOOL_NAME}</strong>.</p>
      <p>We have successfully received the admission application for:</p>
      <ul>
        <li><strong>Student:</strong> ${studentName}</li>
        <li><strong>Applying for:</strong> ${standard}</li>
      </ul>
      <p>Our admission team will review your application and documents. We will contact you on the phone number provided within 3–5 working days.</p>
      <p>If you have any questions, call us at <strong>+91 97685 32431</strong> or reply to this email.</p>
      <p>Warm regards,<br><strong>Admissions Team</strong><br>${SCHOOL_NAME}</p>
    `
  );
}
