const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: jsonHeaders,
    body: JSON.stringify(body)
  };
}

function truncate(value, limit = 6000) {
  return String(value ?? "").slice(0, limit);
}

function fallback(payload) {
  const route = payload?.route?.title ?? "selected route";
  return {
    mode: "LOCAL_SIMULATION_MODE",
    text: `Local simulation response: focus this week on one proof artifact for ${route}. Keep claims tied to evidence, write assumptions down, and review the path after the next milestone.`,
    structured: {
      recommendation: "Build inspectable evidence before adding another generic credential.",
      reasons: ["Fallback mode uses deterministic product rules.", "No server-side OpenAI key is available."],
      risks: ["Advice is less personalized than AI-enhanced mode."],
      assumptions: ["Profile and route data were supplied by the client."],
      confidence: "moderate"
    }
  };
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return response(405, { error: "Use POST." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return response(400, { error: "Invalid JSON body." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return response(200, fallback(payload));
  }

  const input = [
    {
      role: "system",
      content:
        "You are CareerTwin OS. Return concise, grounded career simulation guidance. Do not claim certainty. Do not invent accomplishments. Tie advice to supplied profile, route, mission, decisions, and assumptions."
    },
    {
      role: "user",
      content: truncate(
        JSON.stringify({
          mode: payload.mode,
          profile: payload.profile,
          route: payload.route,
          mission: payload.mission,
          decisions: payload.decisions,
          question: payload.question
        })
      )
    }
  ];

  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
        input,
        reasoning: { effort: "low" },
        max_output_tokens: 900,
        store: false
      })
    });

    if (!upstream.ok) {
      return response(200, {
        ...fallback(payload),
        upstreamStatus: upstream.status,
        mode: "LOCAL_SIMULATION_MODE"
      });
    }

    const data = await upstream.json();
    return response(200, {
      mode: "AI_ENHANCED_MODE",
      text: data.output_text || "AI-enhanced response returned no text.",
      responseId: data.id
    });
  } catch (error) {
    return response(200, {
      ...fallback(payload),
      error: error instanceof Error ? error.message : "Unknown AI error"
    });
  }
}
