import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || "onboarding@resend.dev";

if (!RESEND_API_KEY) {
  console.warn("Variável de ambiente RESEND_API_KEY não configurada");
}

export const resend = new Resend(RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions) {
  if (!RESEND_API_KEY) {
    throw new Error("Configuração de email não encontrada (RESEND_API_KEY)");
  }

  try {
    const { data, error } = await resend.emails.send({
      from: options.from || RESEND_FROM,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error("Erro ao enviar email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw error;
  }
}
