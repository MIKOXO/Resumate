/**
 * Sends email via Brevo HTTP API (Render blocks outbound SMTP).
 * Requires BREVO_API_KEY env var (Brevo → Settings → API Keys).
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * @param {{ to: string, subject: string, html: string }} params
 * @returns {Promise<void>}
 */
export const sendEmail = async ({ to, subject, html }) => {
  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: 'Resumate', email: process.env.EMAIL_USER },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }
};
