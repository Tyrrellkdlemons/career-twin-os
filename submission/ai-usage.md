# AI Usage

AI is optional. The application now runs a public-data assisted path without private AI credentials: `/api/market` calls GitHub, OpenAlex, World Bank, and Data.gov through Netlify Functions, then the UI and `/api/ai` use those signals to ground route guidance.

When `OPENAI_API_KEY` is configured server-side, `/api/ai` can additionally use the OpenAI Responses API to enhance explanations. The client never receives the key. The prompt instructs the model to stay grounded in supplied profile, route, mission, decision, and assumption data.
