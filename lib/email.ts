import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 25,
  secure: false,
  tls: { rejectUnauthorized: false },
});

const FROM = `"${process.env.SMTP_FROM_NAME || "PV Território Animal"}" <${process.env.SMTP_FROM || "noreply@lino.app.br"}>`;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pets.lino.app.br";

export async function sendVerificationEmail(email: string, nome: string, token: string) {
  const url = `${BASE_URL}/verificar-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Confirme seu cadastro — PV Território Animal",
    html: `
      <p>Olá, ${nome}!</p>
      <p>Clique no link abaixo para confirmar seu e-mail:</p>
      <p><a href="${url}">${url}</a></p>
      <p>O link expira em 24 horas.</p>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, nome: string, token: string) {
  const url = `${BASE_URL}/redefinir-senha?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Redefinição de senha — PV Território Animal",
    html: `
      <p>Olá, ${nome}!</p>
      <p>Recebemos uma solicitação de redefinição de senha. Clique no link:</p>
      <p><a href="${url}">${url}</a></p>
      <p>O link expira em 1 hora. Se não foi você, ignore este e-mail.</p>
    `,
  });
}

export async function sendAdoptionRequestEmail(
  protectorEmail: string,
  protectorNome: string,
  animalNome: string,
  adotanteNome: string
) {
  await transporter.sendMail({
    from: FROM,
    to: protectorEmail,
    subject: `Nova solicitação de adoção — ${animalNome}`,
    html: `
      <p>Olá, ${protectorNome}!</p>
      <p><strong>${adotanteNome}</strong> demonstrou interesse em adotar <strong>${animalNome}</strong>.</p>
      <p>Acesse seu <a href="${BASE_URL}/painel/solicitacoes">painel</a> para ver os detalhes.</p>
    `,
  });
}

export async function sendAdoptionStatusEmail(
  adotanteEmail: string,
  adotanteNome: string,
  animalNome: string,
  status: "aprovada" | "rejeitada"
) {
  const msg = status === "aprovada"
    ? `Sua solicitação de adoção de <strong>${animalNome}</strong> foi <strong>aprovada</strong>! O protetor entrará em contato em breve.`
    : `Sua solicitação de adoção de <strong>${animalNome}</strong> não foi aprovada desta vez. Não desanime — há outros animais esperando por um lar!`;

  await transporter.sendMail({
    from: FROM,
    to: adotanteEmail,
    subject: `Atualização da sua solicitação — ${animalNome}`,
    html: `<p>Olá, ${adotanteNome}!</p><p>${msg}</p><p><a href="${BASE_URL}/animais">Ver mais animais</a></p>`,
  });
}
