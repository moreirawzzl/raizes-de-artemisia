import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  // Preferência explícita de SMTP via variáveis de ambiente (ex.: MailHog,
  // ethereal.email, ou provedor próprio). Se SMTP_HOST estiver definido, ele
  // sobrescreve o Gmail. Caso contrário, usa o padrão de produção (Gmail).
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSecure = process.env.SMTP_SECURE === "true";

  const user = smtpUser || process.env.GMAIL_USER;
  const password = smtpPass || process.env.GMAIL_APP_PASSWORD;

  if (!user || !password) {
    console.error(
      "Credenciais de e-mail ausentes. Configure GMAIL_USER/GMAIL_APP_PASSWORD (Gmail) ou SMTP_HOST/SMTP_USER/SMTP_PASS (SMTP genérico)."
    );
    return null;
  }

  if (!transporter) {
    if (smtpHost) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user,
          pass: password,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user,
          pass: password,
        },
      });
    }
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

export async function sendAbandonedCartEmail(to: string): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;

  try {
    await t.sendMail({
      from: `"Raízes de Artemísia" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Você esqueceu algo no seu carrinho! — Raízes de Artemísia",
      text: "Notamos que você deixou alguns itens especiais no carrinho. Finalize sua compra antes que acabem os estoques!",
      html: `
        <div style="font-family: Georgia, serif; padding: 32px; background: #F8F6F1; color: #556B4F;">
          <h2 style="font-weight: 500;">Raízes de Artemísia</h2>
          <p style="font-family: Arial, sans-serif; font-size: 14px;">
            Notamos que você deixou alguns itens especiais no carrinho.
          </p>
          <p style="font-family: Arial, sans-serif; font-size: 14px; margin-top: 24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://raizes-de-artemisia.com.br'}/carrinho" style="background: #556B4F; color: #F8F6F1; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Voltar ao Carrinho
            </a>
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Erro ao enviar e-mail de carrinho abandonado:", error);
    return false;
  }
}

export async function sendReengagementEmail(to: string): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;

  try {
    await t.sendMail({
      from: `"Raízes de Artemísia" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Sentimos sua falta! — Raízes de Artemísia",
      text: "Faz um tempo que não vemos você por aqui. Venha conferir as novidades da loja!",
      html: `
        <div style="font-family: Georgia, serif; padding: 32px; background: #F8F6F1; color: #556B4F;">
          <h2 style="font-weight: 500;">Raízes de Artemísia</h2>
          <p style="font-family: Arial, sans-serif; font-size: 14px;">
            Faz um tempo que não vemos você por aqui. Venha conferir as novidades que preparamos para você!
          </p>
          <p style="font-family: Arial, sans-serif; font-size: 14px; margin-top: 24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://raizes-de-artemisia.com.br'}/loja" style="background: #556B4F; color: #F8F6F1; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Visitar a Loja
            </a>
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Erro ao enviar e-mail de reengajamento:", error);
    return false;
  }
}

export async function sendBanNoticeEmail(
  to: string,
  reason?: string
): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;

  try {
    const info = await t.sendMail({
      from: `"Raízes de Artemísia" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Aviso de Suspensão de Conta — Raízes de Artemísia",
      text: `Sua conta foi suspensa.${reason ? " Motivo: " + reason : ""} Entre em contato para mais informações.`,
      html: `
        <div style="font-family: Georgia, serif; padding: 32px; background: #F8F6F1; color: #556B4F;">
          <h2 style="font-weight: 500; color: #A00;">Aviso de Suspensão</h2>
          <p style="font-family: Arial, sans-serif; font-size: 14px;">
            Informamos que o seu acesso à Raízes de Artemísia foi suspenso.
          </p>
          ${
            reason
              ? `<p style="font-family: Arial, sans-serif; font-size: 14px; font-style: italic;">Motivo: ${reason}</p>`
              : ""
          }
          <p style="font-family: Arial, sans-serif; font-size: 14px;">
            Caso tenha dúvidas, por favor, entre em contato com nosso suporte.
          </p>
        </div>
      `,
    });

    console.log(
      `E-mail de aviso de suspensão enviado para: ${to} (messageId: ${info.messageId}, response: ${info.response})`
    );

    return true;
  } catch (error) {
    console.error("Erro ao enviar aviso de banimento:", error);
    return false;
  }
}

export async function sendBroadcastEmail(
  to: string,
  title: string,
  body: string
): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;

  try {
    const info = await t.sendMail({
      from: `"Raízes de Artemísia" <${process.env.GMAIL_USER}>`,
      to,
      subject: `${title} — Raízes de Artemísia`,
      text: body,
      html: `
        <div style="font-family: Georgia, serif; padding: 32px; background: #F8F6F1; color: #556B4F;">
          <h2 style="font-weight: 500;">${title}</h2>
          <div style="font-family: Arial, sans-serif; font-size: 14px; white-space: pre-wrap;">
            ${body}
          </div>
        </div>
      `,
    });

    console.log(
      `E-mail de aviso (broadcast) enviado para: ${to} (messageId: ${info.messageId}, response: ${info.response})`
    );

    return true;
  } catch (error) {
    console.error("Erro ao enviar e-mail de broadcast:", error);
    return false;
  }
}
