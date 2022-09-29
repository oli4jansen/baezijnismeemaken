import { PageSizes, PDFDocument, rgb } from "../deps.ts";

import { encodeForQR, qrcodeSvgPath } from './qr.ts';
import { LOGO } from '../assets/logo.ts';
import { Ticket } from "../models/tickets.ts";
import { fromEnv } from "./env.ts";

interface PdfBase64 {
  filename: string;
  content: string;
}

/**
 * Takes the reservation + completions and generates a base64 encoded PDF with the tickets as QR codes.
 */
export const generateTicketPdf = async (tickets: Ticket[]): Promise<PdfBase64[]> => {
  const pdfs: PdfBase64[] = [];

  const subscript = await fromEnv('TICKET_SUBSCRIPT', 'Neem dit document mee naar de cantus. De QR-code op deze pagina \ndient als bewijs dat je een kaartje gekocht hebt.', true);

  for (const [i, t] of tickets.entries()) {
    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();

    // Load the BAE logo into the document
    const logo = await pdfDoc.embedPng(LOGO);
    const logoDimensions = logo.scale(0.09);

    // Add a page per ticket
    const page = pdfDoc.addPage(PageSizes.A4);

    // Draw the BAE logo
    page.drawImage(logo, {
      x: 75,
      y: 625,
      width: logoDimensions.width,
      height: logoDimensions.height
    });

    // Draw the ticket details
    page.drawText(`${t.ticket_name} (#${i + 1})`, { x: 75, y: 575, size: 22 });
    page.drawText(`Naam: ${t.owner_first_name} ${t.owner_last_name}`, { x: 75, y: 500, size: 14 });
    page.drawText(`E-mailadres: ${t.owner_email}`, { x: 75, y: 475, size: 14 });
    page.drawText(subscript, { x: 75, y: 115, size: 12, opacity: 0.5 });

    // Encode the ticket ID as a QR code, convert it to an SVG path and draw in on the page
    const qr = await encodeForQR(t.id);
    const qrPath = qrcodeSvgPath(qr);
    page.drawSvgPath(qrPath, {
      x: 350,
      y: 790,
      color: rgb(0, 0, 0)
    });

    pdfs.push({ filename: `ticket-${i + 1}.pdf`, content: await pdfDoc.saveAsBase64() });
  }

  // Export the PDF document as a base64 encoded string
  return pdfs;
};

