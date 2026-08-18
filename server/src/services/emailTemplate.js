const FONT_URL = 'https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&display=swap';

/**
 * Builds a full HTML email document with the Urbanist font and Resumate branding.
 *
 * @param {{ preheader: string, title: string, body: string }} params
 * @returns {string} Complete HTML string ready for nodemailer
 */
export const buildEmailHtml = ({ preheader, title, body }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
  <link href="${FONT_URL}" rel="stylesheet" />
  <style>
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { margin: 0; padding: 0; width: 100% !important; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#0A0A0B;font-family:'Urbanist',Arial,Helvetica,sans-serif;">
  <span style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${preheader}
  </span>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#0A0A0B;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:440px;">

          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-family:'Urbanist',Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#FAFAFA;letter-spacing:-0.5px;">
                Resumate
              </span>
            </td>
          </tr>

          <tr>
            <td style="background-color:#141416;border-radius:12px;padding:36px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-family:'Urbanist',Arial,Helvetica,sans-serif;font-size:18px;font-weight:600;color:#FAFAFA;line-height:1.3;padding-bottom:20px;">
                    ${title}
                  </td>
                </tr>
                <tr>
                  <td style="font-family:'Urbanist',Arial,Helvetica,sans-serif;font-size:15px;font-weight:400;color:#A1A1AA;line-height:1.6;">
                    ${body}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-top:28px;">
              <span style="font-family:'Urbanist',Arial,Helvetica,sans-serif;font-size:12px;color:#5C5C61;">
                Resumate &mdash; Update resumes in seconds
              </span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * Styled code block for displaying a 6-digit code.
 * The code is passed as a pre-formatted HTML fragment.
 *
 * @param {string} code
 * @returns {string} HTML string
 */
export const codeBlock = (code) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
    <tr>
      <td style="background-color:#1C1C1F;border:1px solid #2A2A2E;border-radius:8px;padding:14px 28px;text-align:center;">
        <span style="font-family:'Urbanist',Arial,Helvetica,sans-serif;font-size:28px;font-weight:700;color:#FAFAFA;letter-spacing:6px;">
          ${code}
        </span>
      </td>
    </tr>
  </table>`;
