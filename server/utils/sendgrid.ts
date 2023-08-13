import { fromEnv } from "./env.ts";

const SENDGRID_ENDPOINT = `https://api.sendgrid.com/v3/mail/send`;

export interface SendgridResponse {
  id: string;
}

export const sendMail = async (name: string, to: string, pdfs: { filename: string; content: string; }[], repersonalized: boolean) => {
  const token = await fromEnv('SENDGRID_TOKEN');
  const body = await (repersonalized ? fromEnv('SENDGRID_REPERSONALIZED_BODY') : fromEnv('SENDGRID_BODY'));
  const goodbye = await fromEnv('SENDGRID_GOODBYE', '');
  const value = `${await fromEnv('SENDGRID_SALUTATION')} ${name},\n\n${body}\n\n${goodbye}`;
  return await fetch(SENDGRID_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }]
      }],
      from: {
        email: await fromEnv('SENDGRID_SENDER_EMAIL', "intro@orcaroeien.nl", true),
        name: await fromEnv('SENDGRID_SENDER_NAME', 'A.U.S.R. Orca', true)
      },
      subject: await fromEnv('SENDGRID_SUBJECT', 'Je bestelling', true),
      content: [{ type: "text/html", value }],
      attachments: pdfs.map(({ filename, content }) => ({ filename, content, type: "application/pdf" }))
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};

