/**
 * Test email delivery. Requires GMAIL_APP_PASSWORD or RESEND_API_KEY in env.
 *
 * Usage:
 *   GMAIL_USER=... GMAIL_APP_PASSWORD=... ADMIN_EMAIL=... npx tsx scripts/test-email.ts
 */
import { getEmailConfigStatus, sendAdminEmail } from "../src/lib/email";

async function main() {
  const status = getEmailConfigStatus();
  console.log("Email config:", status);

  if (status.provider === "dev") {
    console.error("\nNo email provider configured.");
    console.error("Set GMAIL_USER + GMAIL_APP_PASSWORD (Google App Password, not your login password).");
    console.error("See EMAIL-SETUP.md");
    process.exit(1);
  }

  const result = await sendAdminEmail({
    subject: "Growing Minds — test email",
    html: "<p>If you received this, contact and admission form emails are working.</p>",
  });

  if (result.success) {
    console.log(`\nSuccess: ${result.message}`);
    console.log(`Check inbox: ${status.adminEmail}`);
    return;
  }

  console.error(`\nFailed: ${result.message}`);
  if (result.message.includes("535") || result.message.includes("BadCredentials")) {
    console.error("\nYour GMAIL_APP_PASSWORD is wrong or missing.");
    console.error("Normal Gmail passwords (like your sign-in password) cannot be used.");
    console.error("Create an App Password: https://myaccount.google.com/apppasswords");
  }
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
