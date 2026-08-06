import { google } from "@ai-sdk/google";

import {
  categories,
  createQuestionGenerator,
  depths,
  type Category,
  type Depth,
  type GeneratePackageInput,
  type GenerateReplacementInput,
  type QuestionPackage,
  type QuestionReplacement,
} from "../question-generator.js";

const model = "gemini-3.5-flash-lite";

function isCategory(value: unknown): value is Category {
  return categories.some((category) => category === value);
}

function isDepth(value: unknown): value is Depth {
  return depths.some((depth) => depth === value);
}

export class InvalidGeneratePackageInput extends Error {}

export function parseGeneratePackageInput(
  value: unknown,
): GeneratePackageInput {
  if (typeof value !== "object" || value === null) {
    throw new InvalidGeneratePackageInput("Request body must be an object.");
  }

  const category = "category" in value ? value.category : undefined;
  const depth = "depth" in value ? value.depth : undefined;
  const explorative =
    "explorative" in value && typeof value.explorative === "boolean"
      ? value.explorative
      : true;

  if (!isCategory(category) || !isDepth(depth)) {
    throw new InvalidGeneratePackageInput(
      "Category and depth must use supported values.",
    );
  }

  return { category, depth, explorative };
}

export function parseGenerateReplacementInput(
  value: unknown,
): GenerateReplacementInput {
  const { category, depth, explorative } = parseGeneratePackageInput(value);
  const existingQuestions =
    typeof value === "object" && value !== null && "existingQuestions" in value
      ? value.existingQuestions
      : undefined;

  if (
    !Array.isArray(existingQuestions) ||
    existingQuestions.length !== 10 ||
    !existingQuestions.every(
      (question) => typeof question === "string" && question.trim().length > 0,
    )
  ) {
    throw new InvalidGeneratePackageInput(
      "Existing questions must contain exactly 10 non-empty strings.",
    );
  }

  const normalizedQuestions = existingQuestions.map((question) =>
    question.trim(),
  );
  const uniqueQuestions = new Set(
    normalizedQuestions.map((question) => question.toLocaleLowerCase("id-ID")),
  );

  if (uniqueQuestions.size !== normalizedQuestions.length) {
    throw new InvalidGeneratePackageInput(
      "Existing questions must not contain duplicates.",
    );
  }

  return { category, depth, explorative, existingQuestions: normalizedQuestions };
}

export async function generateQuestionPackage(
  input: GeneratePackageInput,
): Promise<QuestionPackage> {
  const generator = createQuestionGenerator({ model: google(model) });
  return generator.generatePackage(input);
}

export async function generateQuestionReplacement(
  input: GenerateReplacementInput,
): Promise<QuestionReplacement> {
  const generator = createQuestionGenerator({ model: google(model) });
  return generator.generateReplacement(input);
}
