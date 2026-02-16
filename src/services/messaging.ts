import twilio from 'twilio';
import config from '../config';
import { UserProfile } from '../config/questions';

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

export async function sendWhatsApp(to: string, body: string, mediaUrl?: string): Promise<void> {
  try {
    const messageOptions: any = {
      from: config.twilio.whatsappFrom,
      to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
      body,
    };

    if (mediaUrl) {
      messageOptions.mediaUrl = [mediaUrl];
    }

    const message = await client.messages.create(messageOptions);
    console.log(`WhatsApp message sent: ${message.sid}`);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

export async function sendSMS(to: string, body: string, mediaUrl?: string): Promise<void> {
  try {
    const messageOptions: any = {
      from: config.twilio.smsFrom,
      to,
      body,
    };

    if (mediaUrl) {
      messageOptions.mediaUrl = [mediaUrl];
    }

    const message = await client.messages.create(messageOptions);
    console.log(`SMS message sent: ${message.sid}`);
  } catch (error) {
    console.error('Error sending SMS message:', error);
    throw error;
  }
}

export async function sendToChannels(
  profile: UserProfile,
  body: string,
  mediaUrl?: string
): Promise<void> {
  const promises: Promise<void>[] = [];

  for (const channel of profile.preferredChannels) {
    if (channel === 'whatsapp') {
      promises.push(sendWhatsApp(profile.phoneNumber, body, mediaUrl));
    } else if (channel === 'sms') {
      promises.push(sendSMS(profile.phoneNumber, body, mediaUrl));
    }
    // email handled separately via email service
  }

  await Promise.allSettled(promises);
}

export async function sendVoiceMessage(to: string, message: string, voiceMessageId: string): Promise<void> {
  try {
    const call = await client.calls.create({
      from: config.twilio.smsFrom,
      to,
      url: `${config.baseUrl}/twiml/voice/${voiceMessageId}`,
    });
    console.log(`Voice call initiated: ${call.sid}`);
  } catch (error) {
    console.error('Error sending voice message:', error);
    throw error;
  }
}
