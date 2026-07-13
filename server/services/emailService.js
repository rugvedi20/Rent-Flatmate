const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Wraps content in a standardized, premium HTML layout template.
 */
function getHtmlLayout(title, content) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; color: #1f2937; margin: 0; padding: 30px; }
    .container { background-color: #ffffff; padding: 32px; border-radius: 16px; max-width: 550px; margin: 0 auto; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-top: 6px solid #3b82f6; }
    h2 { color: #1e3a8a; margin-top: 0; font-size: 22px; font-weight: 700; }
    p { line-height: 1.6; font-size: 15px; color: #4b5563; }
    .badge { display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 6px 16px; border-radius: 9999px; font-weight: 700; font-size: 14px; margin: 12px 0; }
    .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>${title}</h2>
    ${content}
  </div>
  <div class="footer">
    &copy; ${new Date().getFullYear()} Rent & Flatmate Finder. All rights reserved.
  </div>
</body>
</html>`;
}

/**
 * Base email dispatcher.
 */
async function sendEmail({ to, subject, html }) {
  try {
    if (!process.env.EMAIL_USER) {
      logger.info(`Email sending skipped: user not configured. (To: ${to}, Subject: ${subject})`);
      return;
    }
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Rent & Flatmate Finder" <noreply@rentflatmate.com>',
      to,
      subject,
      html,
    });
    logger.info(`Email successfully dispatched to ${to}`);
  } catch (err) {
    logger.error(`Email send failure to ${to}: ${err.message}`);
  }
}

/**
 * Dispatches notification to owner regarding high-compatibility tenant.
 */
async function sendHighCompatibilityInterestEmail({ ownerEmail, tenantName, listingTitle, score }) {
  const content = `
    <p>Good news! A high-compatibility tenant has expressed interest in your listing.</p>
    <div class="badge">${score}% Compatibility Match</div>
    <p><strong>${tenantName}</strong> is interested in your property "<strong>${listingTitle}</strong>".</p>
    <p>Log in to your dashboard to review details and begin chatting!</p>
  `;
  await sendEmail({
    to: ownerEmail,
    subject: `🔥 High Match Tenant Interested: ${listingTitle}`,
    html: getHtmlLayout("High Compatibility Match Expressed Interest", content),
  });
}

/**
 * Dispatches notification to tenant regarding accepted status.
 */
async function sendInterestAcceptedEmail({ tenantEmail, listingTitle }) {
  const content = `
    <p>Congratulations! Your interest request for "<strong>${listingTitle}</strong>" has been accepted by the owner.</p>
    <p>You can now open the dashboard and chat directly with the owner to coordinate the next steps.</p>
  `;
  await sendEmail({
    to: tenantEmail,
    subject: `🎉 Request Accepted: ${listingTitle}`,
    html: getHtmlLayout("Interest Request Accepted!", content),
  });
}

/**
 * Dispatches notification to tenant regarding rejected status.
 */
async function sendInterestRejectedEmail({ tenantEmail, listingTitle }) {
  const content = `
    <p>Thank you for expressing interest in "<strong>${listingTitle}</strong>".</p>
    <p>Unfortunately, the owner has chosen to decline the request at this time.</p>
    <p>Don't lose heart! Keep browsing our dashboard to find other listings matching your preferences.</p>
  `;
  await sendEmail({
    to: tenantEmail,
    subject: `Update on Your Request: ${listingTitle}`,
    html: getHtmlLayout("Interest Request Update", content),
  });
}

module.exports = {
  sendEmail,
  sendHighCompatibilityInterestEmail,
  sendInterestAcceptedEmail,
  sendInterestRejectedEmail,
};
