const roleQueries = {
  "cloud-engineer": "cloud engineer",
  "ai-automation-engineer": "automation engineer",
  "solutions-engineer": "solutions engineer",
  "cybersecurity-analyst": "cybersecurity analyst",
  "technical-product-specialist": "technical product specialist"
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    },
    body: JSON.stringify(body)
  };
}

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return response(405, { error: "Use GET." });
  }

  const params = event.queryStringParameters || {};
  const roleId = params.roleId || "cloud-engineer";
  const source = params.source || "local";
  const query = roleQueries[roleId] || roleQueries["cloud-engineer"];

  if (source === "onet") {
    if (!process.env.ONET_USERNAME || !process.env.ONET_PASSWORD) {
      return response(200, {
        source: "onet-unavailable",
        roleId,
        notes: ["O*NET lookup requires ONET_USERNAME and ONET_PASSWORD configured as server-side Netlify environment variables."]
      });
    }

    return response(200, {
      source: "onet-configured",
      roleId,
      query,
      notes: ["O*NET credentials are present. Production enrichment should bind this query to a selected O*NET occupation code before displaying official details."]
    });
  }

  if (source === "bls") {
    return response(200, {
      source: "bls-series-required",
      roleId,
      query,
      notes: ["BLS public API access requires explicit series IDs. CareerTwin OS does not guess series IDs or display unsourced salary precision."]
    });
  }

  return response(200, {
    source: "local-fallback",
    roleId,
    query,
    notes: ["Local deterministic occupation signal is active."]
  });
}
