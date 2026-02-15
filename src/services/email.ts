import config from '../config';

export async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<void> {
  // Check if SMTP configuration is available
  if (!config.email.host || !config.email.user || !config.email.pass) {
    console.log(`[STUB] Email would be sent to ${to}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    return;
  }

  // In production, implement actual SMTP sending using nodemailer or similar
  // For now, this is a stub that logs the email
  try {
    console.log(`Sending email to ${to} from ${config.email.from}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);

    // TODO: Implement actual SMTP sending
    // const transporter = nodemailer.createTransport({
    //   host: config.email.host,
    //   port: config.email.port,
    //   auth: {
    //     user: config.email.user,
    //     pass: config.email.pass,
    //   },
    // });
    //
    // await transporter.sendMail({
    //   from: config.email.from,
    //   to,
    //   subject,
    //   text: body,
    // });

    console.log('Email sent successfully (stub)');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
