# Technical foundation research

Research date: 2026-08-05

This note separates documented facts from recommendations inferred for the Kartu Obrolan MVP.

## Web runtime and hosting

### React + TypeScript + Vite on Vercel

Facts:

- React's official guidance lists Vite as a supported way to build a React application from scratch, and Vite provides a React TypeScript template ([React documentation](https://react.dev/learn/build-a-react-app-from-scratch)).
- Vercel supports Vite static deployments and root-level API routes backed by Vercel Functions ([Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)).
- Vercel Functions scale automatically and scale to zero, and Vercel describes them as suitable for AI and other I/O-bound workloads ([Vercel Functions](https://vercel.com/docs/functions)).

Inference:

- This is the smallest suitable stack for a three-screen, client-side PWA. It avoids server-rendering complexity while keeping the AI credential in a server function.

### React + TypeScript + Vite on Cloudflare Workers

Facts:

- Cloudflare Workers Free includes 100,000 requests per day and static asset requests are free and unlimited ([Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)).
- The free plan limits CPU time to 10 ms per invocation, although waiting on upstream network requests is not billed as duration ([Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)).

Inference:

- Cloudflare is a viable low-cost alternative, but Vercel is a better first fit because the planned provider-neutral AI layer maps directly to AI SDK and AI Gateway. Cloudflare becomes more attractive if edge location or its no-egress pricing becomes a stronger requirement.

## Provider-neutral AI access

### Vercel AI SDK + AI Gateway

Facts:

- AI SDK exposes a unified TypeScript interface across providers and supports structured object generation ([AI SDK](https://vercel.com/ai-sdk)).
- AI Gateway provides one API key across many models, model switching, usage monitoring, and provider routing ([AI Gateway](https://vercel.com/docs/ai-gateway)).
- AI Gateway charges provider list prices without token markup and currently includes $5 monthly credit on its free tier ([AI Gateway pricing](https://vercel.com/docs/ai-gateway/pricing)).
- On Vercel, Gateway authentication can use an automatically available OIDC token; local development still needs an AI Gateway API key ([authentication documentation](https://vercel.com/docs/ai-gateway/authentication-and-byok)).

Inference:

- AI SDK should be the application boundary and AI Gateway should be the initial transport. This satisfies ADR-0002 while allowing the model to change through configuration rather than application rewrites.

## Candidate models

### OpenAI GPT-5.6 Luna

Facts:

- Vercel's live model catalog describes `openai/gpt-5.6-luna` as the fast, affordable GPT-5.6 tier and lists $0.20 per million input tokens and $1.20 per million output tokens ([AI Gateway model catalog](https://ai-gateway.vercel.sh/v1/models)).
- The catalog lists temperature and reasoning controls, with text output support ([AI Gateway model catalog](https://ai-gateway.vercel.sh/v1/models)).

Inference:

- This is the leading low-cost candidate, but natural Indonesian tone and willingness to produce explorative questions must be tested with the actual prompt before selection.

### Google Gemini 3.5 Flash-Lite

Facts:

- Google describes `gemini-3.5-flash-lite` as its most cost-efficient GA model, optimized for translation and simple data processing; its standard price is $0.30 per million input tokens and $2.50 per million output tokens, with a free tier ([Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing)).
- Google's Gemini model documentation explicitly includes Indonesian among supported languages ([Gemini models](https://ai.google.dev/gemini-api/docs/models/gemini)).
- Gemini supports structured JSON output suitable for application processing ([Gemini API documentation](https://ai.google.dev/gemini-api/docs)).

Inference:

- This is the strongest documented Indonesian-language candidate and should be tested against GPT-5.6 Luna for tone, variety, and explorative-mode compliance.

### Google Gemini 3.1 Flash-Lite

Facts:

- Google lists `gemini-3.1-flash-lite` at $0.25 per million input tokens and $1.50 per million output tokens, with a free tier ([Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing)).
- Vercel's live catalog exposes it through AI Gateway as `google/gemini-3.1-flash-lite` ([AI Gateway model catalog](https://ai-gateway.vercel.sh/v1/models)).

Inference:

- It is a cheaper fallback candidate if the 3.5 tier does not materially improve Indonesian question quality.

## Recommendation requiring approval

1. Use React + TypeScript + Vite for the mobile-first PWA.
2. Deploy the static app and its AI server function on Vercel.
3. Use AI SDK as the provider-neutral application boundary and Vercel AI Gateway as the initial transport.
4. Run the same prompt and schema against `openai/gpt-5.6-luna` and `google/gemini-3.5-flash-lite`; select the default only after comparing 10-question packages for natural Indonesian tone, variety, latency, and explorative-mode compliance.
5. Test the public `QuestionGenerator.generatePackage(category, depth)` seam. The contract must return exactly 10 non-empty, unique questions and reject malformed provider output.

Approved by the user on 2026-08-05. The default model remains pending a live comparison.

## Local constraint

The current environment has bundled Node.js and pnpm available, but no AI provider or AI Gateway credential is configured. A live comparison therefore requires an `AI_GATEWAY_API_KEY` or equivalent approved provider credential.

## Live comparison attempt

On 2026-08-05, an AI Gateway credential was configured and both approved model IDs were confirmed in the live model catalog. Requests to both models reached AI Gateway but were rejected before inference because Vercel requires a valid credit card on the team to unlock Gateway credits. No question package or model-quality comparison was produced.

The user subsequently approved using the Gemini Developer API free tier directly for the PoC. The public `QuestionGenerator` boundary remains provider-neutral; this is a temporary transport decision made to validate real Indonesian output without adding billing credentials to Vercel.

## Live Gemini validation

On 2026-08-05, a live request was sent directly to `gemini-3.5-flash-lite` through the Google provider for Vercel AI SDK with category `mixed` and depth `personal`. The request completed in 2,152 ms and returned exactly 10 non-empty, unique Indonesian questions. The package passed the same explicit schema and application-level validation used by the provider-neutral `QuestionGenerator` boundary.

The automated verification also passed four tests covering a valid 10-question package and rejection of too few, blank, and normalized-duplicate questions. TypeScript strict type checking completed successfully.

The direct Gemini transport and default model are recorded in ADR-0005. It supersedes only the initial transport portion of ADR-0004; the AI SDK application boundary remains provider-neutral.
