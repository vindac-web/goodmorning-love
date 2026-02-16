import { AnswerSet } from './parseAnswers';
import { getTemplates } from '../services/dataStore';

export function createMessage(answers: AnswerSet): string {
  const { loveNote, gratitude, encouragement } = answers;

  // Default templates (fallback if data file doesn't exist)
  const defaultTemplates = [
    `Good morning, beautiful! 💕\n\n{loveNote}\n\nToday I'm feeling especially grateful: {gratitude}\n\nI want you to know: {encouragement}\n\nHave an amazing day! I love you! ❤️`,

    `Hey love! ☀️\n\nJust wanted to tell you: {loveNote}\n\nThis morning I'm grateful for: {gratitude}\n\nRemember this: {encouragement}\n\nYou're amazing! Love you lots! 💕`,

    `Good morning sunshine! 🌅\n\n{loveNote}\n\nI'm grateful today because: {gratitude}\n\nI hope you remember: {encouragement}\n\nHave the best day ever! Love you! ❤️`,
  ];

  // Get templates from data store (or use defaults)
  const templates = getTemplates(defaultTemplates);

  // Use a simple deterministic selection based on day of year
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      1000 /
      60 /
      60 /
      24
  );
  const messageIndex = dayOfYear % templates.length;

  // Replace placeholders with actual answers
  const message = templates[messageIndex]
    .replace('{loveNote}', loveNote)
    .replace('{gratitude}', gratitude)
    .replace('{encouragement}', encouragement);

  return message;
}
