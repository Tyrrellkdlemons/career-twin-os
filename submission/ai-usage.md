# AI Usage

AI is optional. The application runs in Local Simulation Mode with deterministic route planning, mission generation, Twin Council responses, and Future Self reflections.

When `OPENAI_API_KEY` is configured server-side, `/api/ai` can use the OpenAI Responses API to enhance explanations. The client never receives the key. The prompt instructs the model to stay grounded in supplied profile, route, mission, decision, and assumption data.
