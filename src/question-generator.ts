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

export type Category = (typeof categories)[number];
export type Depth = (typeof depths)[number];

export interface QuestionPackage {
  questions: string[];
}

export interface GeneratePackageInput {
  category: Category;
  depth: Depth;
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

const questionPackageSchema = jsonSchema<QuestionPackage>(
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
    validate(value) {
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

      if (
        !value.questions.every(
          question =>
            typeof question === 'string' && question.trim().length > 0,
        )
      ) {
        return {
          success: false,
          error: new Error('Every question must be a non-empty string.'),
        };
      }

      const normalizedQuestions = value.questions.map(question =>
        question.trim().toLocaleLowerCase('id-ID'),
      );
      if (new Set(normalizedQuestions).size !== normalizedQuestions.length) {
        return {
          success: false,
          error: new Error('Every question in the package must be unique.'),
        };
      }

      return { success: true, value: value as QuestionPackage };
    },
  },
);

function createQuestionReplacementSchema(existingQuestions: string[]) {
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
      validate(value) {
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

        return { success: true, value: { question } };
      },
    },
  );
}

function buildPrompt({ category, depth }: GeneratePackageInput): string {
  return [
    'Buat tepat 10 pertanyaan kartu obrolan dalam Bahasa Indonesia yang santai dan natural.',
    `Kategori: ${category}.`,
    `Kedalaman: ${depth}.`,
    'Pengguna adalah kelompok 3–8 teman usia 18–35 tahun yang sedang nongkrong.',
    'Pertanyaan harus bervariasi, tidak berulang, dan enak dibacakan dengan suara keras.',
    'Mode eksploratif aktif: topik dewasa, sensitif, atau kontroversial boleh muncul jika relevan.',
  ].join('\n');
}

function buildReplacementPrompt({
  category,
  depth,
  existingQuestions,
}: GenerateReplacementInput): string {
  return [
    'Buat tepat satu pertanyaan pengganti dalam Bahasa Indonesia yang santai dan natural.',
    `Kategori: ${category}.`,
    `Kedalaman: ${depth}.`,
    'Pertanyaan harus enak dibacakan dengan suara keras dan berbeda dari seluruh pertanyaan aktif berikut:',
    ...existingQuestions.map((question, index) => `${index + 1}. ${question}`),
    'Mode eksploratif aktif: topik dewasa, sensitif, atau kontroversial boleh muncul jika relevan.',
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
          schema: questionPackageSchema,
        }),
        prompt: buildPrompt(input),
      });

      return result.output;
    },
    async generateReplacement(input) {
      const result = await generateText({
        model,
        abortSignal: AbortSignal.timeout(90_000),
        output: Output.object({
          name: 'QuestionReplacement',
          description: 'Satu pertanyaan pengganti untuk paket aktif.',
          schema: createQuestionReplacementSchema(input.existingQuestions),
        }),
        prompt: buildReplacementPrompt(input),
      });

      return result.output;
    },
  };
}
