import { morningQuestions, myProfile, girlfriendProfile } from '../config/questions';
import { sendToChannels } from './messaging';
import { sendEmail } from './email';
import { parseAnswers, AnswerSet } from '../utils/parseAnswers';
import { createMessage } from '../utils/createMessage';

// Store the last prompt timestamp to validate incoming replies
let lastPromptTimestamp: Date | null = null;

// Store pending answers to be sent at scheduled time
let pendingAnswers: AnswerSet | null = null;

export async function sendMorningQuestions(): Promise<void> {
  const questionText = morningQuestions
    .map((q) => `${q.number}. ${q.text}`)
    .join('\n');

  const fullMessage = `Good morning! 💕\n\nPlease answer these questions:\n\n${questionText}\n\nReply with your answers (one per line or numbered).`;

  lastPromptTimestamp = new Date();

  await sendToChannels(myProfile, fullMessage);
  console.log('Morning questions sent to user');
}

export async function handleUserReply(from: string, body: string): Promise<void> {
  // Validate this is from the expected user
  const normalizedFrom = from.replace('whatsapp:', '');
  const normalizedMyNumber = myProfile.phoneNumber.replace('whatsapp:', '');

  if (normalizedFrom !== normalizedMyNumber) {
    console.log(`Ignoring message from unknown number: ${from}`);
    return;
  }

  // Parse the answers
  const answers: AnswerSet | null = parseAnswers(body, morningQuestions.length);

  if (!answers) {
    console.log('Failed to parse answers from reply');
    await sendToChannels(
      myProfile,
      "Sorry, I couldn't understand your reply. Please answer all three questions, one per line or numbered (1., 2., 3.)."
    );
    return;
  }

  // Store the answers to be sent at scheduled time
  pendingAnswers = answers;
  console.log('Answers saved, will be sent at scheduled time');

  // Send confirmation to user
  await sendToChannels(
    myProfile,
    'Your answers have been saved! Your message will be sent to your girlfriend at 8:30 AM.'
  );
}

export async function sendGirlfriendMessage(answers: AnswerSet): Promise<void> {
  const message = createMessage(answers);

  // Send via messaging channels
  await sendToChannels(girlfriendProfile, message);

  // Send via email if configured
  if (girlfriendProfile.preferredChannels.includes('email') && girlfriendProfile.email) {
    await sendEmail(
      girlfriendProfile.email,
      'Good Morning Love 💕',
      message
    );
  }

  console.log('Girlfriend message sent successfully');
}

export function getLastPromptTimestamp(): Date | null {
  return lastPromptTimestamp;
}

export async function sendPendingGirlfriendMessage(): Promise<void> {
  if (!pendingAnswers) {
    console.log('No pending answers to send');
    return;
  }

  // Send the girlfriend message
  await sendGirlfriendMessage(pendingAnswers);

  // Reset pending answers
  pendingAnswers = null;

  // Send confirmation to user
  await sendToChannels(
    myProfile,
    'Your love message has been delivered!'
  );

  console.log('Pending girlfriend message sent successfully');
}
