import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }
  return transporter;
}

export async function sendResetCodeEmail(to: string, code: string): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;

  await t.sendMail({
    from: `"Raízes de Artemísia" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Código para redefinir sua senha — Raízes de Artemísia",
    text: `Seu código de verificação é: ${code}\n\nVálido por 10 minutos. Se você não pediu isso, ignore este e-mail.`,
    html: `
      <div style="font-family:Georgia,serif;padding:32px;background:#F8F6F1;color:#556B4F;">
        <h2 style="font-weight:500;">Raízes de Artemísia</h2>
        <p style="font-family:Arial,sans-serif;font-size:14px;">Seu código de verificação é:</p>
        <p style="font-size:32px;letter-spacing:8px;font-weight:bold;margin:16px 0;">${code}</p>
        <p style="font-family:Arial,sans-serif;font-size:11px;color:#8A9A7B;">Válido por 10 minutos. Se você não pediu isso, ignore este e-mail.</p>
      </div>`
  });
  return true;
}
