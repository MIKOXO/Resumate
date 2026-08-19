import nodemailer from 'nodemailer';

// secure stays false: EMAIL_PORT is expected to be 587 (STARTTLS), where
// `secure: true` would break the connection. SMTP-over-SSL (465) is not used.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @param {{ to: string, subject: string, html: string }} params
 * @returns {Promise<void>}
 */
export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html,
  });
};
