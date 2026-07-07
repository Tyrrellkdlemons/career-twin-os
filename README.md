# CareerTwin OS

CareerTwin OS is a career simulation operating system. It models a user's current skills, evidence, constraints, and preferences, then compares multiple possible futures instead of returning one generic recommendation.

## What it is

CareerTwin OS helps a user ask: what futures are realistically available, what changes if constraints change, and what should be done next to make the strongest future more likely?

## Why I built it

Most career tools optimize for static advice: resumes, job matches, generic courses, or interview practice. This app treats career planning as a scenario system with assumptions, evidence, shocks, route tradeoffs, and proof-building missions.

## What makes it different

- Counterfactual career simulation across distinct route strategies.
- Constraint-aware scoring for time, cost, geography, risk, and education choices.
- Future Shock Lab recalculations.
- Branching Career Time Machine graph.
- Path Race strategy comparison.
- Evidence Graph that distinguishes self-reported, supported, strong evidence, and needs evidence.
- Proof Missions with Codex build briefs.
- Twin Council structured agent debate.
- Future Self reflective simulation.
- Decision Journal and Career Replay.
- Open API Finder for official/open data source candidates.

## Core features

- Demo guest mode with fictional Jordan Rivera profile.
- Twin onboarding with resume-text draft extraction.
- Deterministic path generation and seeded uncertainty bands.
- Interactive Time Machine, Path Race, Evidence Map, API Finder, Missions, Future Self, Decisions, Profile, and Replay routes.
- Showcase mode at `?showcase=1`.

## How AI is used

The application is useful without AI credentials. Local Simulation Mode uses deterministic scoring, route planning, mission generation, Twin Council responses, and Future Self reflections. The Netlify AI function upgrades responses when `OPENAI_API_KEY` is configured server-side and uses the OpenAI Responses API.

## Simulation architecture

1. Structured occupation and skill data.
2. Deterministic readiness, constraint, and route scoring.
3. Seeded scenario simulation and shock recalculation.
4. Optional AI interpretation through a server-side Netlify function.

## Data sources

Official-source adapters are prepared for:

- O*NET Web Services: https://services.onetcenter.org/reference/
- BLS Public Data API: https://www.bls.gov/developers/
- GitHub REST API: https://docs.github.com/rest
- College Scorecard API: https://collegescorecard.ed.gov/data/api-documentation/
- OpenAlex API: https://developers.openalex.org/api-reference/introduction
- World Bank Indicators API: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation
- USAJOBS API: https://developer.usajobs.gov/api-reference/
- Data.gov CKAN API: https://catalog.data.gov/dataset/data-gov-ckan-api

Live enrichment is intentionally server-side. The browser never receives O*NET, BLS, or OpenAI secrets.

## Technical architecture

- Vite
- React
- TypeScript
- React Router
- Vitest
- Playwright
- Netlify Functions
- Netlify SPA hosting

## Local setup

```bash
npm install
npm run dev
```

## Environment variables

Optional server-side variables:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.4-mini
ONET_USERNAME=
ONET_PASSWORD=
BLS_API_KEY=
```

Do not prefix secrets with `VITE_`.

## Testing

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright test
```

## Deployment

The project is configured for Netlify:

```bash
netlify deploy --build --prod
```

Production URL: https://careertwin-os.netlify.app

## Privacy and security

Career data is sensitive. The app supports guest mode, data export, delete/reload demo profile, source and assumption panels, evidence labels, prompt length limits, sanitized React rendering, URL allowlisting for GitHub repository evidence, and server-only secret handling.

## Known limitations

- Market data enrichment is prepared but falls back locally unless server credentials and exact BLS series choices are configured.
- Future Self is a reflective simulation, not a prediction.
- Salary and employment outcomes are not guaranteed or represented with fake precision.

## Future improvements

- Persist user profiles with row-level security when Supabase credentials are available.
- Add official O*NET occupation-code binding UI.
- Add BLS series selection with cited source panels.
- Expand mission library and reviewer analytics.
