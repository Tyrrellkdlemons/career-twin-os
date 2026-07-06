# Security

## Threat model summary

CareerTwin OS handles sensitive career data, draft resume text, public repository URLs, and optional AI prompts. The main risks are secret exposure, arbitrary URL fetching, unsafe uploaded content, over-trusting AI extraction, and displaying uncited or over-precise career claims.

## Secret-handling rules

- Never commit `.env`, `.env.local`, API keys, service-role keys, GitHub tokens, or Netlify tokens.
- Server secrets stay in Netlify environment variables.
- Browser-visible variables must not contain secrets.
- OpenAI, O*NET, and BLS credentials are used only from Netlify Functions.

## Supported data flows

- Demo profile and deterministic simulation run in the browser.
- Optional AI calls go through `/api/ai`, which maps to a Netlify Function.
- Optional market calls go through `/api/market`, which maps to a Netlify Function.
- GitHub evidence inspection accepts only `https://github.com/owner/repo` URL shapes.

## Controls implemented

- No `dangerouslySetInnerHTML`.
- React text rendering for user-provided fields.
- GitHub URL allowlisting.
- Prompt/input truncation in the AI function.
- No arbitrary server-side repository code execution.
- Netlify security headers.
- SPA fallback configured after function redirects.
- Local fallback when credentials are absent.

## Known limitations

- File upload buttons are prepared UI affordances; production file parsing should add MIME and size enforcement before accepting binary uploads.
- Supabase persistence is not enabled without credentials.
- BLS enrichment requires explicit series IDs; the app does not guess series mappings.
