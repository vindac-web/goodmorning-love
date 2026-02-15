export interface AnswerSet {
  loveNote: string;
  gratitude: string;
  encouragement: string;
}

export function parseAnswers(
  text: string,
  expectedCount: number = 3
): AnswerSet | null {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Try to parse numbered format first (e.g., "1. answer" or "1) answer")
  const numberedAnswers = parseNumberedFormat(lines);
  if (numberedAnswers && numberedAnswers.length === expectedCount) {
    return {
      loveNote: numberedAnswers[0],
      gratitude: numberedAnswers[1],
      encouragement: numberedAnswers[2],
    };
  }

  // Try to parse line-based format (first 3 non-empty lines)
  if (lines.length >= expectedCount) {
    return {
      loveNote: lines[0],
      gratitude: lines[1],
      encouragement: lines[2],
    };
  }

  return null;
}

function parseNumberedFormat(lines: string[]): string[] | null {
  const answers: string[] = [];
  const numberPattern = /^(\d+)[\.\)]\s*(.+)$/;

  for (const line of lines) {
    const match = line.match(numberPattern);
    if (match) {
      const number = parseInt(match[1], 10);
      const answer = match[2].trim();

      // Store answers in order
      if (number >= 1 && number <= 3) {
        answers[number - 1] = answer;
      }
    }
  }

  // Check if we have all 3 answers
  if (answers.length === 3 && answers.every((a) => a && a.length > 0)) {
    return answers;
  }

  return null;
}
