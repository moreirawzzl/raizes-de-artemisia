import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const password = process.env.GMAIL_APP_PASSWORD;

  if (!user || !password) {
    console.error("GMAIL_USER ou GMAIL_APP_PASSWORD não configurado.");
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass: password,
      },
    });
  }

  return transporter;
}

export async function sendResetCodeEmail(
  to: string,
  code: string
): Promise<boolean> {
  const t = getTransporter();

  if (!t) return false;

  try {
    await t.sendMail({
      from: `"Raízes de Artemísia" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Código para redefinir sua senha — Raízes de Artemísia",
      text: `Seu código de verificação é: ${code}

Válido por 10 minutos. Se você não pediu isso, ignore este e-mail.`,

      html: `
        <div style="font-family: Georgia, serif; padding: 32px; background: #F8F6F1; color: #556B4F;">
          <h2 style="font-weight: 500;">
            Raízes de Artemísia
          </h2>

          <p style="font-family: Arial, sans-serif; font-size: 14px;">
            Seu código de verificação é:
          </p>

          <p style="font-size: 32px; letter-spacing: 8px; font-weight: bold; margin: 16px 0;">
            ${code}
          </p>

          <p style="font-family: Arial, sans-serif; font-size: 11px; color: #8A9A7B;">
            Válido por 10 minutos. Se você não pediu isso, ignore este e-mail.
          </p>
        </div>
      `,
    });

    console.log(`E-mail de recuperação enviado para: ${to}`);

    return true;
  } catch (error) {
    console.error("Erro ao enviar e-mail de recuperação:", error);
    return false;
  }
}