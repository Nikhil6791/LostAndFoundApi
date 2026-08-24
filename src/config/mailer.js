const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// Render's free tier blocks outbound SMTP ports (25, 465, 587) entirely, so
// raw SMTP (nodemailer) can never connect from there. Brevo's transactional
// email API is a plain HTTPS call on port 443, which isn't blocked.
const sendViaBrevo = async ({ to, subject, html }) => {
  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: process.env.EMAIL_FROM },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Brevo API error (${response.status}): ${errorBody}`);
  }
};

export default sendViaBrevo;
