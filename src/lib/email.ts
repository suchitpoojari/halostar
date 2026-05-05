import { Resend } from "resend";

let client: Resend | null = null;
function resend(): Resend {
  if (client) return client;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");
  client = new Resend(apiKey);
  return client;
}

const FROM = process.env.RESEND_FROM ?? "halostar <hello@halostar.in>";

export async function sendPdfEmail(args: {
  to: string;
  subject: string;
  textBody: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
}): Promise<{ id: string }> {
  const result = await resend().emails.send({
    from: FROM,
    to: args.to,
    subject: args.subject,
    text: args.textBody,
    attachments: [
      {
        filename: args.pdfFilename,
        content: args.pdfBuffer,
      },
    ],
  });
  if (result.error) throw new Error(`resend: ${result.error.message}`);
  return { id: result.data?.id ?? "unknown" };
}
