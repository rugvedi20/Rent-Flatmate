const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Email failures should never crash the request that triggered them
    console.error(`Email send failed to ${to}: ${err.message}`);
  }
}

async function sendHighCompatibilityInterestEmail({ ownerEmail, tenantName, listingTitle, score }) {
  await sendEmail({
    to: ownerEmail,
    subject: "High Compatibility Tenant Interested",
    html: `<p>Good news! <strong>${tenantName}</strong> has expressed interest in your listing
      "<strong>${listingTitle}</strong>" with a compatibility score of <strong>${score}%</strong>.</p>
      <p>Log in to your dashboard to review and respond.</p>`,
  });
}

async function sendInterestAcceptedEmail({ tenantEmail, listingTitle }) {
  await sendEmail({
    to: tenantEmail,
    subject: "Your Interest Request Was Accepted",
    html: `<p>Congratulations! Your request for "<strong>${listingTitle}</strong>" has been accepted.</p>
      <p>You can now chat with the owner directly on the platform.</p>`,
  });
}

async function sendInterestRejectedEmail({ tenantEmail, listingTitle }) {
  await sendEmail({
    to: tenantEmail,
    subject: "Update on Your Interest Request",
    html: `<p>Sorry, your request for "<strong>${listingTitle}</strong>" was declined by the owner.</p>
      <p>Keep browsing — there are more listings that may match your preferences.</p>`,
  });
}

module.exports = {
  sendEmail,
  sendHighCompatibilityInterestEmail,
  sendInterestAcceptedEmail,
  sendInterestRejectedEmail,
};
