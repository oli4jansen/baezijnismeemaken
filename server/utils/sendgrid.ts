import { fromEnv } from "./env.ts";

const SENDGRID_ENDPOINT = `https://api.sendgrid.com/v3/mail/send`;

export interface SendgridResponse {
  id: string;
}

export const sendMail = async (name: string, to: string, pdfs: { filename: string; content: string; }[]) => {
  const token = await fromEnv('SENDGRID_TOKEN');
  const value = `${await fromEnv('SENDGRID_SALUTATION')} ${name},\n\n${await fromEnv('SENDGRID_BODY')}`;
  console.log(`Sending mail to ${to}`);
  return await fetch(SENDGRID_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }]
      }],
      from: {
        email: await fromEnv('SENDGRID_SENDER_EMAIL', "openluchtcantus@orcaroeien.nl", true),
        name: await fromEnv('SENDGRID_SENDER_NAME', 'BAE Openluchtcantus', true)
      },
      subject: await fromEnv('SENDGRID_SUBJECT', 'Je bestelling', true),
      content: [{ type: "text/plain", value }],
      attachments: pdfs.map(({ filename, content }) => ({ filename, content, type: "application/pdf" }))
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};

