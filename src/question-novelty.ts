export const QUESTION_SIMILARITY_THRESHOLD = 0.75;

export function normalizeQuestion(question: string): string {
  return question
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('id-ID')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

const stopWords = new Set([
  'apa',
  'apakah',
  'bagaimana',
  'buat',
  'dalam',
  'dan',
  'dari',
  'di',
  'hidup',
  'ini',
  'itu',
  'kalian',
  'kamu',
  'karena',
  'ke',
  'mana',
  'membuat',
  'paling',
  'pernah',
  'saat',
  'selalu',
  'siapa',
  'untuk',
  'yang',
]);

function stemIndonesianWord(word: string): string {
  let stem = word.replace(/(?:lah|kah|tah|pun|ku|mu|nya)$/u, '');

  if (stem.length > 5) {
    stem = stem.replace(/(?:kan|an|i)$/u, '');
  }

  if (/^meny/u.test(stem)) {
    return `s${stem.slice(4)}`;
  }

  return stem.replace(
    /^(?:meng|peng|men|pen|mem|pem|ber|bel|be|ter|te|per|pel|pe|me|ke|di)/u,
    '',
  );
}

function informativeTokens(question: string): Set<string> {
  return new Set(
    normalizeQuestion(question)
      .split(' ')
      .filter(Boolean)
      .filter(word => !stopWords.has(word))
      .map(stemIndonesianWord)
      .filter(word => word.length > 1 && !stopWords.has(word)),
  );
}

export function calculateQuestionSimilarity(
  firstQuestion: string,
  secondQuestion: string,
): number {
  const firstNormalized = normalizeQuestion(firstQuestion);
  const secondNormalized = normalizeQuestion(secondQuestion);
  if (firstNormalized === secondNormalized) return 1;

  const firstTokens = informativeTokens(firstQuestion);
  const secondTokens = informativeTokens(secondQuestion);
  if (firstTokens.size === 0 || secondTokens.size === 0) return 0;

  const sharedTokenCount = [...firstTokens].filter(token =>
    secondTokens.has(token),
  ).length;

  return (2 * sharedTokenCount) / (firstTokens.size + secondTokens.size);
}

export function isQuestionTooSimilar(
  question: string,
  comparisonQuestions: readonly string[],
  threshold = QUESTION_SIMILARITY_THRESHOLD,
): boolean {
  return comparisonQuestions.some(
    comparison => calculateQuestionSimilarity(question, comparison) >= threshold,
  );
}
