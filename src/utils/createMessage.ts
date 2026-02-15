import { AnswerSet } from './parseAnswers';

export function createMessage(answers: AnswerSet): string {
  const { loveNote, gratitude, encouragement } = answers;

  // Create a natural, affectionate message
  const messages = [
    `Good morning, beautiful! 💕\n\n${loveNote}\n\nToday I'm feeling especially grateful: ${gratitude}\n\nI want you to know: ${encouragement}\n\nHave an amazing day! I love you! ❤️`,

    `Hey love! ☀️\n\nJust wanted to tell you: ${loveNote}\n\nThis morning I'm grateful for: ${gratitude}\n\nRemember this: ${encouragement}\n\nYou're amazing! Love you lots! 💕`,

    `Good morning sunshine! 🌅\n\n${loveNote}\n\nI'm grateful today because: ${gratitude}\n\nI hope you remember: ${encouragement}\n\nHave the best day ever! Love you! ❤️`,
  ];

  // Use a simple deterministic selection based on day of year
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      1000 /
      60 /
      60 /
      24
  );
  const messageIndex = dayOfYear % messages.length;

  return messages[messageIndex];
}
