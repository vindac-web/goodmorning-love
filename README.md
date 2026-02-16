# GoodMorning Love 💕

A production-ready daily morning prompt app that sends personalized love messages via WhatsApp, SMS, and email.

## Overview

**GoodMorning Love** sends you a morning prompt with three questions about your relationship. You reply with your answers, and the app automatically crafts and sends a sweet, personalized message to your girlfriend.

### How It Works

1. **Morning Prompt** (7:30 AM by default): The app sends you three questions via WhatsApp/SMS
2. **Your Reply**: Answer all three questions in one message (line-based or numbered format)
3. **Auto-Parse**: The app extracts your answers into structured fields
4. **Queued for Delivery**: Your answers are saved and scheduled for delivery at 8:30 AM (configurable)
5. **Delayed Delivery**: At the configured time, the app generates a personalized, affectionate message
6. **Multi-Channel Delivery**: Sends to your girlfriend via WhatsApp, SMS, and/or email
7. **Confirmation**: You receive a confirmation that the message was delivered

## Features

- 📱 **Multi-Channel Support**: WhatsApp, SMS, and Email via Twilio
- ⏰ **Flexible Scheduling**: Configurable time and timezone using node-cron
- 🎯 **Smart Parsing**: Handles both line-based and numbered reply formats
- 💬 **Message Variations**: Rotates through different message templates
- ⚙️ **Easy Configuration**: Edit questions and settings in simple config files
- 🔒 **Type-Safe**: Full TypeScript implementation with proper types
- 🚀 **Production-Ready**: Error handling, logging, and structured codebase

## Tech Stack

- **Backend**: Node.js with TypeScript
- **Framework**: Express
- **Messaging**: Twilio (WhatsApp + SMS)
- **Email**: SMTP abstraction (SendGrid-compatible, can be stubbed)
- **Scheduler**: node-cron (easy to migrate to Railway/Fly.io scheduled jobs)
- **Configuration**: dotenv

## Installation

### Prerequisites

- Node.js 18+ and npm
- Twilio account with WhatsApp and SMS capabilities
- (Optional) SMTP/SendGrid credentials for email

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd goodmorning-love
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   PORT=3000

   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   TWILIO_SMS_FROM=+1XXXXXXXXXX

   MY_PHONE_NUMBER=+1XXXXXXXXXX
   GIRLFRIEND_PHONE_NUMBER=+1XXXXXXXXXX

   TIMEZONE=America/New_York
   MORNING_TIME=07:30
   GIRLFRIEND_SEND_TIME=08:30

   # Channel preferences (comma-separated)
   MY_CHANNELS=whatsapp,sms
   GIRLFRIEND_CHANNELS=sms

   # Optional email config
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your_sendgrid_api_key
   EMAIL_FROM=noreply@yourdomain.com
   GIRLFRIEND_EMAIL=girlfriend@example.com
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Run in development mode**
   ```bash
   npm run dev
   ```

   Or run in production mode:
   ```bash
   npm start
   ```

## Twilio Setup

### 1. WhatsApp Sandbox Setup

1. Go to [Twilio Console > Messaging > Try it out > Send a WhatsApp message](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
2. Follow instructions to connect your WhatsApp to the sandbox
3. Use the sandbox number as `TWILIO_WHATSAPP_FROM` (e.g., `whatsapp:+14155238886`)

### 2. SMS Setup

1. Purchase a phone number in [Twilio Console](https://console.twilio.com/us1/develop/phone-numbers/manage/search)
2. Use this number as `TWILIO_SMS_FROM`

### 3. Configure Webhook

The app needs to receive incoming messages from Twilio. You have two options:

#### Option A: Local Development (ngrok)

1. Install [ngrok](https://ngrok.com/): `npm install -g ngrok`
2. Start your app: `npm run dev`
3. In another terminal, run: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Go to Twilio Console > Phone Numbers > Active Numbers
6. Click your WhatsApp/SMS number
7. Under "Messaging Configuration":
   - Set "A MESSAGE COMES IN" webhook to: `https://abc123.ngrok.io/webhook/twilio`
   - Method: `POST`
8. Save

#### Option B: Production Deployment

1. Deploy to Railway, Fly.io, or any Node.js hosting platform
2. Use your production URL: `https://your-domain.com/webhook/twilio`
3. Configure Twilio webhook as above

## Configuration

### Customize Questions

Edit `src/config/questions.ts` to customize the morning questions:

```typescript
export const morningQuestions: Question[] = [
  {
    number: 1,
    text: "What's one thing you love about her today?",
  },
  {
    number: 2,
    text: 'What are you grateful for this morning?',
  },
  {
    number: 3,
    text: 'What do you want to encourage her about today?',
  },
];
```

### Adjust Schedule

Edit the schedule times in `.env`:
```env
MORNING_TIME=07:30          # When to send questions to you (24-hour format)
GIRLFRIEND_SEND_TIME=08:30  # When to send message to girlfriend (24-hour format)
TIMEZONE=America/New_York
```

### Configure Channels

Set preferred channels via environment variables in `.env`:

```env
MY_CHANNELS=whatsapp,sms           # Your preferred channels (comma-separated)
GIRLFRIEND_CHANNELS=sms            # Girlfriend's preferred channels
```

Available channels: `whatsapp`, `sms`, `email`

Example combinations:
- `whatsapp,sms` - Send via both WhatsApp and SMS
- `sms` - SMS only
- `whatsapp,sms,email` - All three channels

## Usage

### Automated Daily Prompt

The app will automatically send you the morning questions at the configured time.

### Reply Format

**Option 1: Line-based (easiest)**
```
Her smile brightens my entire day
The peaceful morning we had together
Keep believing in yourself, you're doing amazing
```

**Option 2: Numbered**
```
1. Her smile brightens my entire day
2. The peaceful morning we had together
3. Keep believing in yourself, you're doing amazing
```

or

```
1) Her smile brightens my entire day
2) The peaceful morning we had together
3) Keep believing in yourself, you're doing amazing
```

### Manual Testing

To test without waiting for the scheduled time, you can trigger the prompt manually by adding this to `src/index.ts`:

```typescript
import { triggerMorningQuestions } from './services/scheduler';

// After main() initialization
setTimeout(() => {
  triggerMorningQuestions();
}, 5000);  // Send after 5 seconds
```

## Project Structure

```
goodmorning-love/
├── src/
│   ├── config/
│   │   ├── index.ts              # Environment config loader
│   │   └── questions.ts          # Questions and user profiles
│   ├── routes/
│   │   └── webhook.ts            # Twilio webhook endpoint
│   ├── services/
│   │   ├── messaging.ts          # WhatsApp/SMS via Twilio
│   │   ├── email.ts              # Email sending abstraction
│   │   ├── scheduler.ts          # Cron scheduling
│   │   └── goodMorningService.ts # Core orchestration logic
│   ├── utils/
│   │   ├── parseAnswers.ts       # Answer parsing logic
│   │   └── createMessage.ts      # Message composition
│   ├── server.ts                 # Express app setup
│   └── index.ts                  # Application entry point
├── .env.example                  # Environment variable template
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## Deployment

### Railway

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add environment variables: `railway variables --set KEY=VALUE`
5. Deploy: `railway up`
6. Get your URL: `railway domain`
7. Configure Twilio webhook with your Railway URL

### Fly.io

1. Install flyctl: [https://fly.io/docs/hands-on/install-flyctl/](https://fly.io/docs/hands-on/install-flyctl/)
2. Login: `fly auth login`
3. Launch: `fly launch`
4. Set secrets: `fly secrets set TWILIO_ACCOUNT_SID=xxx ...`
5. Deploy: `fly deploy`
6. Configure Twilio webhook with your Fly.io URL

### Migrating to Platform Scheduled Jobs

The cron scheduling is currently handled by `node-cron` within the app. To migrate to platform-native scheduling:

**Railway Cron Jobs:**
```javascript
// railway.json
{
  "cron": [
    {
      "schedule": "30 7 * * *",
      "command": "node dist/scripts/sendMorningQuestions.js"
    }
  ]
}
```

**Fly.io Scheduled Tasks:**
```toml
# fly.toml
[processes]
  cron = "node dist/scripts/sendMorningQuestions.js"

[[services]]
  internal_port = 3000
  protocol = "tcp"
```

Create `src/scripts/sendMorningQuestions.ts` that imports and calls `sendMorningQuestions()`.

## Troubleshooting

### Common Issues

**1. "Missing required environment variable"**
- Ensure all required variables are set in `.env`
- Restart the app after updating `.env`

**2. WhatsApp messages not working**
- Verify you've joined the Twilio WhatsApp sandbox
- Check phone numbers include country code (e.g., `+1` for US)
- Verify webhook URL is publicly accessible

**3. Webhook not receiving messages**
- Check ngrok is running (for local development)
- Verify webhook URL in Twilio console matches your actual URL
- Check webhook URL ends with `/webhook/twilio`
- Review Twilio debugger: [https://console.twilio.com/us1/monitor/logs/debugger](https://console.twilio.com/us1/monitor/logs/debugger)

**4. Scheduled messages not sending**
- Check server logs for cron initialization
- Verify `MORNING_TIME` format is correct (HH:MM)
- Ensure timezone is valid (see [TZ database names](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones))

**5. Email not sending**
- Email is stubbed by default if SMTP credentials are missing
- Check console logs for "[STUB] Email would be sent"
- To enable actual email, provide all SMTP environment variables

## API Endpoints

### `GET /health`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-15T12:00:00.000Z"
}
```

### `POST /webhook/twilio`
Twilio webhook endpoint for incoming messages

**Request Body (from Twilio):**
```
From=whatsapp:+1XXXXXXXXXX
To=whatsapp:+14155238886
Body=Answer text here
```

**Response:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>
```

## Scripts

- `npm run dev` - Run in development mode with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript in production
- `npm run type-check` - Check TypeScript types without compiling

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port (default: 3000) | `3000` |
| `TWILIO_ACCOUNT_SID` | Yes | Twilio Account SID | `ACxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio Auth Token | `your_auth_token` |
| `TWILIO_WHATSAPP_FROM` | Yes | Twilio WhatsApp number | `whatsapp:+14155238886` |
| `TWILIO_SMS_FROM` | Yes | Twilio SMS number | `+1XXXXXXXXXX` |
| `MY_PHONE_NUMBER` | Yes | Your phone number | `+1XXXXXXXXXX` |
| `GIRLFRIEND_PHONE_NUMBER` | Yes | Girlfriend's phone | `+1XXXXXXXXXX` |
| `TIMEZONE` | Yes | Timezone for scheduling | `America/New_York` |
| `MORNING_TIME` | Yes | Daily prompt time (24h) | `07:30` |
| `GIRLFRIEND_SEND_TIME` | No | Girlfriend message time (24h, default: 08:30) | `08:30` |
| `MY_CHANNELS` | No | Your preferred channels (comma-separated, default: whatsapp,sms) | `whatsapp,sms` |
| `GIRLFRIEND_CHANNELS` | No | Girlfriend's preferred channels (comma-separated, default: sms) | `sms` |
| `SMTP_HOST` | No | SMTP server host | `smtp.sendgrid.net` |
| `SMTP_PORT` | No | SMTP server port | `587` |
| `SMTP_USER` | No | SMTP username | `apikey` |
| `SMTP_PASS` | No | SMTP password/API key | `SG.xxxxx` |
| `EMAIL_FROM` | No | Sender email address | `noreply@yourdomain.com` |
| `GIRLFRIEND_EMAIL` | No | Girlfriend's email | `girlfriend@example.com` |

## TypeScript Types

### Core Interfaces

```typescript
interface Question {
  number: number;
  text: string;
}

interface UserProfile {
  name: string;
  phoneNumber: string;
  email: string;
  preferredChannels: ('whatsapp' | 'sms' | 'email')[];
}

interface AnswerSet {
  loveNote: string;
  gratitude: string;
  encouragement: string;
}
```

## Contributing

Feel free to customize this app for your own use case! Some ideas:

- Add more questions
- Customize message templates in `src/utils/createMessage.ts`
- Add support for more messaging platforms
- Implement reply validation and retry logic
- Add a web dashboard for viewing message history
- Support multiple users with a database

## License

MIT

## Support

For issues, questions, or feature requests, please open an issue on the repository.

---

Made with ❤️ for expressing love daily
