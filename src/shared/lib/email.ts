import { Resend } from "resend";

const RESEND_FROM = process.env.RESEND_FROM || "onboarding@resend.dev";

let resendClient: Resend | null = null;

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Configuração de email não encontrada (RESEND_API_KEY)");
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const { data, error } = await getResend().emails.send({
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
