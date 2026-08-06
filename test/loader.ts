import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Node ESM resolve hook that maps `.js` imports to `.ts` source files.
 *
 * Vercel serverless functions require `.js` extensions in import specifiers
 * because the runtime compiles TypeScript to JavaScript before execution.
 * Node's native type-stripping does not perform this mapping, so the
 * domain test runner needs this hook to locate the actual `.ts` sources.
 */
export async function resolve(
  specifier: string,
  context: { parentURL?: string; conditions: string[] },
  next: (specifier: string, context: unknown) => Promise<{ url: string }>,
): Promise<{ url: string }> {
  if (specifier.endsWith('.js') && context.parentURL) {
    const tsSpecifier = specifier.replace(/\.js$/, '.ts');
    try {
      const result = await next(tsSpecifier, context);
      const path = fileURLToPath(result.url);
      if (existsSync(path)) return result;
    } catch {
      // Fall through to default resolution.
    }
  }

  return next(specifier, context);
}
