import {
  generateText,
  jsonSchema,
  Output,
  type LanguageModel,
} from 'ai';

export const categories = [
  'light',
  'funny',
  'experience',
  'reflective',
  'mixed',
] as const;

export const depths = ['casual', 'personal', 'deep'] as const;

export const minPlayerCount = 2;
export const maxPlayerCount = 12;

export type Category = (typeof categories)[number];
export type Depth = (typeof depths)[number];

export interface QuestionPackage {
  questions: string[];
}

export interface GeneratePackageInput {
  category: Category;
  depth: Depth;
  playerCount: number;
  explorative?: boolean;
}

export interface QuestionReplacement {
  question: string;
}

export interface GenerateReplacementInput extends GeneratePackageInput {
  existingQuestions: string[];
}

export interface QuestionGenerator {
  generatePackage(input: GeneratePackageInput): Promise<QuestionPackage>;
  generateReplacement(
    input: GenerateReplacementInput,
  ): Promise<QuestionReplacement>;
}

const facilitatorPatterns = [
  /\b(?:mem)?bacakan(?:lah|nya)?\b/i,
  /\btanyakan(?:lah)?\b/i,
  /\bpilih(?:lah)?\s+(?:tiga|3)\s+(?:orang|teman|pemain)\b/i,
  /\btunjuk(?:lah)?\s+teman\b/i,
  /\b(?:jadilah|menjadi|sebagai|tunjuk(?:lah)?|pilih(?:lah)?)\s+(?:seorang\s+)?(?:pembaca|host|fasilitator)\b/i,
] as const;

const quotedSegmentPattern = /"[^"]*"|“[^”]*”|'[^']*'|‘[^’]*’/g;
const cardNarratorPatterns = [
  /^\s*(?:gue|aku|saya|kami)\b/i,
  /\bmenurut(?:ku|kami)\b/i,
  /\b(?:pada|kepada)(?:ku|kami)\b/i,
  /\b(?:dari|tentang|menurut|kepada|buat)\s+(?:gue|aku|saya|kami)\b/i,
] as const;
const currentGroupSubject =
  String.raw`(?:kalian|kelompok\s+(?:ini|kalian)|sesi\s+ini|para\s+pemain|semua\s+pemain)`;

function currentGroupCountPattern(countForm: string): RegExp {
  return new RegExp(
    String.raw`(?:\b${currentGroupSubject}(?:\s+\w+){0,2}\s+(?:${countForm})\b|\b(?:${countForm})(?:\s+\w+){0,2}\s+(?:dari|di|dalam)\s+${currentGroupSubject}\b)`,
    'i',
  );
}

const explicitPlayerCountPatterns = [
  { count: 2, pattern: currentGroupCountPattern(String.raw`berdua(?!\s+belas)|(?:dua|2)\s*(?:orang|teman|pemain)`) },
  { count: 3, pattern: currentGroupCountPattern(String.raw`bertiga|(?:tiga|3)\s*(?:orang|teman|pemain)`) },
  { count: 4, pattern: currentGroupCountPattern(String.raw`berempat|(?:empat|4)\s*(?:orang|teman|pemain)`) },
  { count: 5, pattern: currentGroupCountPattern(String.raw`berlima|(?:lima|5)\s*(?:orang|teman|pemain)`) },
  { count: 6, pattern: currentGroupCountPattern(String.raw`berenam|(?:enam|6)\s*(?:orang|teman|pemain)`) },
  { count: 7, pattern: currentGroupCountPattern(String.raw`bertujuh|(?:tujuh|7)\s*(?:orang|teman|pemain)`) },
  { count: 8, pattern: currentGroupCountPattern(String.raw`berdelapan|(?:delapan|8)\s*(?:orang|teman|pemain)`) },
  { count: 9, pattern: currentGroupCountPattern(String.raw`bersembilan|(?:sembilan|9)\s*(?:orang|teman|pemain)`) },
  { count: 10, pattern: currentGroupCountPattern(String.raw`bersepuluh|(?:sepuluh|10)\s*(?:orang|teman|pemain)`) },
  { count: 11, pattern: currentGroupCountPattern(String.raw`bersebelas|(?:sebelas|11)\s*(?:orang|teman|pemain)`) },
  { count: 12, pattern: currentGroupCountPattern(String.raw`berdua\s+belas|(?:dua belas|12)\s*(?:orang|teman|pemain)`) },
] as const;

function playerSuitabilityError(
  question: string,
  playerCount: number,
): Error | null {
  if (facilitatorPatterns.some(pattern => pattern.test(question))) {
    return new Error('Questions must not create a reader or facilitator role.');
  }

  const questionWithoutQuotes = question.replace(quotedSegmentPattern, '');
  if (cardNarratorPatterns.some(pattern => pattern.test(questionWithoutQuotes))) {
    return new Error('Questions must not use a first-person card narrator.');
  }

  const mismatchedCount = explicitPlayerCountPatterns.find(
    reference =>
      reference.count !== playerCount && reference.pattern.test(question),
  );
  if (mismatchedCount) {
    return new Error('Question group size must match the selected player count.');
  }

  return null;
}

function createQuestionPackageSchema(playerCount: number) {
  return jsonSchema<QuestionPackage>(
  {
    type: 'object',
    additionalProperties: false,
    properties: {
      questions: {
        type: 'array',
        minItems: 10,
        maxItems: 10,
        uniqueItems: true,
        items: { type: 'string', minLength: 1 },
      },
    },
    required: ['questions'],
  },
  {
      validate(value: unknown) {
      if (
        typeof value !== 'object' ||
        value === null ||
        !('questions' in value) ||
        !Array.isArray(value.questions) ||
        value.questions.length !== 10
      ) {
        return {
          success: false,
          error: new Error('Question package must contain exactly 10 questions.'),
        };
      }

      const questions = value.questions as string[];

      if (
        !questions.every(
          question => typeof question === 'string' && question.trim().length > 0,
        )
      ) {
        return {
          success: false,
          error: new Error('Every question must be a non-empty string.'),
        };
      }

      const normalizedQuestions = questions.map(question =>
        question.trim().toLocaleLowerCase('id-ID'),
      );
      if (new Set(normalizedQuestions).size !== normalizedQuestions.length) {
        return {
          success: false,
          error: new Error('Every question in the package must be unique.'),
        };
      }

      const suitabilityError = questions
        .map(question => playerSuitabilityError(question, playerCount))
        .find((error): error is Error => error !== null);
      if (suitabilityError) {
        return { success: false, error: suitabilityError };
      }

      return { success: true, value: value as QuestionPackage };
    },
  },
  );
}

function createQuestionReplacementSchema(
  existingQuestions: string[],
  playerCount: number,
) {
  const normalizedExistingQuestions = new Set(
    existingQuestions.map(question =>
      question.trim().toLocaleLowerCase('id-ID'),
    ),
  );

  return jsonSchema<QuestionReplacement>(
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        question: { type: 'string', minLength: 1 },
      },
      required: ['question'],
    },
    {
      validate(value: unknown) {
        if (
          typeof value !== 'object' ||
          value === null ||
          !('question' in value) ||
          typeof value.question !== 'string' ||
          value.question.trim().length === 0
        ) {
          return {
            success: false,
            error: new Error('Replacement question must be a non-empty string.'),
          };
        }

        const question = value.question.trim();
        if (
          normalizedExistingQuestions.has(
            question.toLocaleLowerCase('id-ID'),
          )
        ) {
          return {
            success: false,
            error: new Error('Replacement question must be unique.'),
          };
        }

        const suitabilityError = playerSuitabilityError(question, playerCount);
        if (suitabilityError) {
          return { success: false, error: suitabilityError };
        }

        return { success: true, value: { question } };
      },
    },
  );
}

function sharedAudienceInstructions(playerCount: number): string[] {
  return [
    `Sesi ini dimainkan tepat ${playerCount} pemain dewasa yang sedang nongkrong.`,
    `Tulis setiap kartu sebagai pertanyaan langsung kepada seluruh pemain secara kolektif—tepat ${playerCount} orang—dan dapat dijawab oleh siapa pun.`,
    `Pastikan setiap pertanyaan cocok untuk tepat ${playerCount} pemain tanpa menambah orang di luar kelompok atau membagi pemain ke dalam kelompok yang lebih kecil.`,
    ...(playerCount === 2
      ? [
          'Karena sesi ini hanya berdua, jangan membuat instruksi atau asumsi yang membutuhkan tiga orang atau lebih.',
        ]
      : []),
    'Jangan membuat peran pembaca, host, atau fasilitator. Hindari instruksi seperti bacakan, tanyakan, pilih tiga orang, atau tunjuk teman.',
    'Kartu tidak memiliki suara atau identitas sendiri: jangan gunakan sudut pandang orang pertama seperti gue, aku, saya, atau kami untuk merujuk pada si penanya.',
    'Contoh salah: "Apa hal dari gue yang kalian nggak suka?" Contoh benar: "Apa kebiasaan orang lain di sini yang kurang kamu sukai?"',
  ];
}

function buildPrompt({
  category,
  depth,
  playerCount,
  explorative = true,
}: GeneratePackageInput): string {
  const explorativeInstruction = explorative
    ? 'Mode eksploratif aktif: topik dewasa, sensitif, atau kontroversial boleh muncul jika relevan.'
    : 'Mode eksploratif nonaktif: jaga pertanyaan tetap aman, umum, dan bebas dari topik dewasa, sensitif, atau kontroversial.';

  return [
    'Buat tepat 10 pertanyaan kartu obrolan dalam Bahasa Indonesia yang santai dan natural.',
    `Kategori: ${category}.`,
    `Kedalaman: ${depth}.`,
    ...sharedAudienceInstructions(playerCount),
    'Pertanyaan harus bervariasi dan tidak berulang.',
    explorativeInstruction,
  ].join('\n');
}

function buildReplacementPrompt({
  category,
  depth,
  playerCount,
  explorative = true,
  existingQuestions,
}: GenerateReplacementInput): string {
  const explorativeInstruction = explorative
    ? 'Mode eksploratif aktif: topik dewasa, sensitif, atau kontroversial boleh muncul jika relevan.'
    : 'Mode eksploratif nonaktif: jaga pertanyaan tetap aman, umum, dan bebas dari topik dewasa, sensitif, atau kontroversial.';

  return [
    'Buat tepat satu pertanyaan pengganti dalam Bahasa Indonesia yang santai dan natural.',
    `Kategori: ${category}.`,
    `Kedalaman: ${depth}.`,
    ...sharedAudienceInstructions(playerCount),
    'Pertanyaan harus berbeda dari seluruh pertanyaan aktif berikut:',
    ...existingQuestions.map((question, index) => `${index + 1}. ${question}`),
    explorativeInstruction,
  ].join('\n');
}

export function createQuestionGenerator({
  model,
}: {
  model: LanguageModel;
}): QuestionGenerator {
  return {
    async generatePackage(input) {
      const result = await generateText({
        model,
        abortSignal: AbortSignal.timeout(90_000),
        output: Output.object({
          name: 'QuestionPackage',
          description: 'Sepuluh pertanyaan unik untuk satu sesi Kartu Obrolan.',
          schema: createQuestionPackageSchema(input.playerCount),
        }),
        prompt: buildPrompt(input),
      });

      return result.output as QuestionPackage;
    },
    async generateReplacement(input) {
      const result = await generateText({
        model,
        abortSignal: AbortSignal.timeout(90_000),
        output: Output.object({
          name: 'QuestionReplacement',
          description: 'Satu pertanyaan pengganti untuk paket aktif.',
          schema: createQuestionReplacementSchema(
            input.existingQuestions,
            input.playerCount,
          ),
        }),
        prompt: buildReplacementPrompt(input),
      });

      return result.output as QuestionReplacement;
    },
  };
}
