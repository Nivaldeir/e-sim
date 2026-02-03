import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASS = process.env.GMAIL_APP_PASS;
const EMAIL_TO_RECEIVE = process.env.EMAIL_TO_RECEIVE;

if (!GMAIL_USER || !GMAIL_APP_PASS) {
  console.warn("Variáveis de ambiente de email não configuradas");
}


export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASS,
  },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions) {
  if (!GMAIL_USER || !GMAIL_APP_PASS) {
    throw new Error("Configuração de email não encontrada");
  }

  try {
    const info = await transporter.sendMail({
      from: options.from || GMAIL_USER,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html: options.html,
    });

    return info;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw error;
  }
}


