import { publicDataResponse } from "./market.mjs";

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

async function fallback(payload) {
  const route = payload?.route?.title ?? "selected route";
  const roleId = payload?.route?.targetRole ?? "cloud-engineer";
  const publicData = await publicDataResponse(roleId);
  const liveSources = publicData.sources.filter((source) => source.status === "live").map((source) => source.name);
  const sourceSummary = liveSources.length ? liveSources.join(", ") : "the public-data router";

  return {
    mode: "PUBLIC_DATA_ASSISTED_MODE",
    text: `Public-data assisted response: focus this week on one proof artifact for ${route}. Ground the next decision against ${sourceSummary}, keep claims tied to evidence, and review the path after the next milestone.`,
    structured: {
      recommendation: "Build inspectable evidence before adding another generic credential.",
      reasons: [
        `Public data router connected: ${sourceSummary}.`,
        `Current public-data market signal is ${publicData.marketSignal}/100 with ${publicData.confidence} confidence.`,
        "No private OpenAI credential is required for this response path."
      ],
      risks: ["Public source counts are context signals, not hiring guarantees or salary promises."],
      assumptions: ["Profile and route data were supplied by the client.", ...publicData.notes],
      confidence: publicData.confidence
    },
    publicData
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
    return response(200, await fallback(payload));
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
        ...(await fallback(payload)),
        upstreamStatus: upstream.status
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
      ...(await fallback(payload)),
      error: error instanceof Error ? error.message : "Unknown AI error"
    });
  }
}
