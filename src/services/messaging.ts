import twilio from 'twilio';
import config from '../config';
import { UserProfile } from '../config/questions';

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  try {
    const message = await client.messages.create({
      from: config.twilio.whatsappFrom,
      to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
      body,
    });
    console.log(`WhatsApp message sent: ${message.sid}`);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

export async function sendSMS(to: string, body: string): Promise<void> {
  try {
    const message = await client.messages.create({
      from: config.twilio.smsFrom,
      to,
      body,
    });
    console.log(`SMS message sent: ${message.sid}`);
  } catch (error) {
    console.error('Error sending SMS message:', error);
    throw error;
  }
}

export async function sendToChannels(
  profile: UserProfile,
  body: string
): Promise<void> {
  const promises: Promise<void>[] = [];

  for (const channel of profile.preferredChannels) {
    if (channel === 'whatsapp') {
      promises.push(sendWhatsApp(profile.phoneNumber, body));
    } else if (channel === 'sms') {
      promises.push(sendSMS(profile.phoneNumber, body));
    }
    // email handled separately via email service
  }

  await Promise.allSettled(promises);
}
