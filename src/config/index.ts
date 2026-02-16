import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  twilio: {
    accountSid: string;
    authToken: string;
    whatsappFrom: string;
    smsFrom: string;
  };
  phoneNumbers: {
    my: string;
    girlfriend: string;
  };
  schedule: {
    timezone: string;
    morningTime: string;
    girlfriendSendTime: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    girlfriendEmail: string;
  };
}

const requiredEnvVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_FROM',
  'TWILIO_SMS_FROM',
  'MY_PHONE_NUMBER',
  'GIRLFRIEND_PHONE_NUMBER',
  'TIMEZONE',
  'MORNING_TIME',
];

// Validate required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM!,
    smsFrom: process.env.TWILIO_SMS_FROM!,
  },
  phoneNumbers: {
    my: process.env.MY_PHONE_NUMBER!,
    girlfriend: process.env.GIRLFRIEND_PHONE_NUMBER!,
  },
  schedule: {
    timezone: process.env.TIMEZONE!,
    morningTime: process.env.MORNING_TIME!,
    girlfriendSendTime: process.env.GIRLFRIEND_SEND_TIME || '08:30',
  },
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || '',
    girlfriendEmail: process.env.GIRLFRIEND_EMAIL || '',
  },
};

export default config;
