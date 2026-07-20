/**
 * Email provider for transactional emails (password reset, invitations, etc.)
 * Uses Resend.com — set RESEND_API_KEY in .env
 * Falls back to console.log if no key configured.
 */

const RESEND_API_URL = "https://api.resend.com/emails";

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

export async function sendEmail({ to, subject, html, from }: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const defaultFrom = process.env.EMAIL_FROM || "LocalRank CRM <noreply@localrank.com.co>";

  if (!apiKey) {
    // Dev mode: log to console
    console.log(`[Email] To: ${to} | Subject: ${subject}`);
    console.log(`[Email] Body preview: ${html.slice(0, 200)}...`);
    return true;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: from || defaultFrom,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Email] Error sending to ${to}: ${error}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[Email] Failed:`, err);
    return false;
  }
}

/** Password reset email template */
export function passwordResetEmail(resetUrl: string, userName?: string): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00288e; margin: 0; font-size: 24px;">LocalRank CRM</h1>
      </div>
      <h2 style="color: #191c1e; font-size: 18px;">Restablecer contraseña</h2>
      <p style="color: #505f76; font-size: 14px; line-height: 1.6;">
        Hola${userName ? ` ${userName}` : ""},<br><br>
        Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón para crear una nueva:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #00288e; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Restablecer contraseña
        </a>
      </div>
      <p style="color: #757684; font-size: 12px; line-height: 1.5;">
        Si no solicitaste esto, ignora este email. El enlace expira en 1 hora.<br>
        <br>— Equipo LocalRank CRM
      </p>
    </div>
  `;
}

/** Welcome email template */
export function welcomeEmail(userName: string, loginUrl: string): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00288e; margin: 0; font-size: 24px;">LocalRank CRM</h1>
      </div>
      <h2 style="color: #191c1e; font-size: 18px;">¡Bienvenido, ${userName}! 🎉</h2>
      <p style="color: #505f76; font-size: 14px; line-height: 1.6;">
        Tu cuenta ha sido creada exitosamente. Ya puedes acceder a tu CRM:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="background-color: #00288e; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Ir al CRM
        </a>
      </div>
      <p style="color: #757684; font-size: 12px;">— Equipo LocalRank CRM</p>
    </div>
  `;
}
