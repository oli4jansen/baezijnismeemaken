import { Ticket } from "../models/tickets.ts";
import { generateTicketPdf } from "./pdf.ts";
import { sendMail } from "./sendgrid.ts";

export const sendTickets = async (tickets: Ticket[]) => {
  const sameOwner = tickets.every(t => t.owner_email === tickets[0].owner_email && t.owner_first_name === tickets[0].owner_first_name && t.owner_last_name === t.owner_last_name);

  if (!sameOwner) {
    throw new Error('sendTickets expects all tickets to have the same owner (will send one email at a time)');
  }

  const pdfs = await generateTicketPdf(tickets);
  return await sendMail(tickets[0].owner_first_name, tickets[0].owner_email, pdfs);
}
