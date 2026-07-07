const roleQueries = {
  "cloud-engineer": {
    title: "Cloud Engineer",
    query: "cloud engineering",
    githubQuery: "cloud engineering",
    openAlexQuery: "cloud engineering",
    dataGovQuery: "cloud computing",
    marketSignal: 74,
    stabilitySignal: 76
  },
  "ai-automation-engineer": {
    title: "AI Automation Engineer",
    query: "ai automation engineer",
    githubQuery: "workflow automation ai agents",
    openAlexQuery: "artificial intelligence workflow automation",
    dataGovQuery: "artificial intelligence automation workforce",
    marketSignal: 78,
    stabilitySignal: 62
  },
  "solutions-engineer": {
    title: "Solutions Engineer",
    query: "solutions engineer",
    githubQuery: "technical demo customer implementation",
    openAlexQuery: "technical sales solution engineering",
    dataGovQuery: "technology adoption customer support",
    marketSignal: 70,
    stabilitySignal: 70
  },
  "cybersecurity-analyst": {
    title: "Cybersecurity Analyst",
    query: "cybersecurity analyst",
    githubQuery: "security operations threat detection",
    openAlexQuery: "cybersecurity threat detection",
    dataGovQuery: "cybersecurity workforce",
    marketSignal: 73,
    stabilitySignal: 82
  },
  "technical-product-specialist": {
    title: "Technical Product Specialist",
    query: "technical product specialist",
    githubQuery: "product analytics support automation",
    openAlexQuery: "product analytics technical support",
    dataGovQuery: "productivity technology adoption",
    marketSignal: 66,
    stabilitySignal: 74
  }
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

function getRoleProfile(roleId) {
  return roleQueries[roleId] || roleQueries["cloud-engineer"];
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

async function fetchJson(url, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const upstream = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "CareerTwin-OS-public-data-router"
      }
    });

    if (!upstream.ok) {
      throw new Error(`HTTP ${upstream.status}`);
    }

    return await upstream.json();
  } finally {
    clearTimeout(timer);
  }
}

function unavailableSource(id, name, error) {
  return {
    id,
    name,
    status: "unavailable",
    metric: 0,
    signal: error instanceof Error ? error.message : "Public source did not return data.",
    examples: []
  };
}

async function githubSignal(profile) {
  const query = encodeURIComponent(`${profile.githubQuery} in:name,description`);
  const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=3`;
  try {
    const data = await fetchJson(url);
    const metric = Number(data.total_count ?? 0);
    const examples = Array.isArray(data.items)
      ? data.items.slice(0, 3).map((item) => ({
          label: item.full_name,
          url: item.html_url,
          detail: `${Number(item.stargazers_count ?? 0).toLocaleString()} stars`
        }))
      : [];

    return {
      id: "github-rest",
      name: "GitHub REST API",
      status: "live",
      metric,
      signal: `${metric.toLocaleString()} public repositories match portfolio/evidence terms.`,
      examples
    };
  } catch (error) {
    return unavailableSource("github-rest", "GitHub REST API", error);
  }
}

async function openAlexSignal(profile) {
  const query = encodeURIComponent(profile.openAlexQuery);
  const url = `https://api.openalex.org/works?search=${query}&per-page=1`;
  try {
    const data = await fetchJson(url);
    const metric = Number(data?.meta?.count ?? data?.total_count ?? 0);
    const first = Array.isArray(data.results) ? data.results[0] : undefined;

    return {
      id: "openalex",
      name: "OpenAlex API",
      status: "live",
      metric,
      signal: `${metric.toLocaleString()} scholarly works match the role-topic query.`,
      examples: first ? [{ label: first.display_name || first.title || "Top matching work", url: first.id || "", detail: "Research topic signal" }] : []
    };
  } catch (error) {
    return unavailableSource("openalex", "OpenAlex API", error);
  }
}

async function worldBankSignal() {
  const url = "https://api.worldbank.org/v2/country/USA/indicator/SL.UEM.TOTL.ZS?format=json&per_page=5&mrnev=1";
  try {
    const data = await fetchJson(url);
    const latest = Array.isArray(data?.[1]) ? data[1][0] : undefined;
    const value = Number(latest?.value ?? 0);
    const metric = Number.isFinite(value) ? value : 0;

    return {
      id: "world-bank-indicators",
      name: "World Bank Indicators API",
      status: "live",
      metric,
      signal: latest ? `Latest U.S. unemployment context: ${metric.toFixed(1)}% in ${latest.date}.` : "Macro labor indicator returned no latest value.",
      examples: latest ? [{ label: "U.S. unemployment rate", url, detail: `${metric.toFixed(1)}% in ${latest.date}` }] : []
    };
  } catch (error) {
    return unavailableSource("world-bank-indicators", "World Bank Indicators API", error);
  }
}

async function dataGovSignal(profile) {
  const query = encodeURIComponent(profile.dataGovQuery);
  const url = `https://api.gsa.gov/technology/datagov/v3/action/package_search?api_key=DEMO_KEY&q=${query}&rows=3`;
  try {
    const data = await fetchJson(url);
    const metric = Number(data?.result?.count ?? 0);
    const examples = Array.isArray(data?.result?.results)
      ? data.result.results.slice(0, 3).map((item) => ({
          label: item.title || item.name,
          url: item.url || "",
          detail: item.organization?.title || "Data.gov dataset metadata"
        }))
      : [];

    return {
      id: "datagov-ckan",
      name: "Data.gov CKAN API",
      status: "live",
      metric,
      signal: `${metric.toLocaleString()} Data.gov dataset records match the source-discovery query.`,
      examples
    };
  } catch (error) {
    return unavailableSource("datagov-ckan", "Data.gov CKAN API", error);
  }
}

export async function publicDataResponse(roleId) {
  const profile = getRoleProfile(roleId);
  const sources = await Promise.all([githubSignal(profile), openAlexSignal(profile), worldBankSignal(), dataGovSignal(profile)]);
  const liveSources = sources.filter((source) => source.status === "live");
  const totalPublicSignal = sources.reduce((total, source) => total + Math.min(10, Math.log10(Math.max(1, source.metric)) * 1.8), 0);
  const liveSourceBoost = liveSources.length * 2.5;
  const macroPenalty = sources.find((source) => source.id === "world-bank-indicators")?.metric > 5 ? 1.5 : 0;

  return {
    source: liveSources.length ? "public-data-live" : "public-data-degraded",
    mode: liveSources.length ? "PUBLIC_DATA_LIVE_MODE" : "PUBLIC_DATA_DEGRADED_MODE",
    roleId,
    title: profile.title,
    query: profile.query,
    marketSignal: clamp(profile.marketSignal + totalPublicSignal + liveSourceBoost - macroPenalty),
    stabilitySignal: clamp(profile.stabilitySignal + liveSources.length - macroPenalty),
    confidence: liveSources.length >= 3 ? "strong" : liveSources.length >= 1 ? "moderate" : "low",
    sources,
    notes: [
      "No private server credentials required; enrichment uses public/unauthenticated APIs or public sample-key access.",
      "Signals are context only, not salary promises, job guarantees, or proof of individual readiness.",
      "The deterministic simulation remains available as a fallback if a public source times out."
    ],
    updatedAt: new Date().toISOString()
  };
}

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return response(405, { error: "Use GET." });
  }

  const params = event.queryStringParameters || {};
  const roleId = params.roleId || "cloud-engineer";
  const source = params.source || "public";
  const profile = getRoleProfile(roleId);

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
      query: profile.query,
      notes: ["O*NET credentials are configured. Production enrichment should bind this query to a selected O*NET occupation code before displaying official details."]
    });
  }

  if (source === "bls") {
    return response(200, {
      source: "bls-series-required",
      roleId,
      query: profile.query,
      notes: ["BLS public API access requires explicit series IDs. CareerTwin OS does not guess series IDs or display unsourced salary precision."]
    });
  }

  if (source === "local") {
    return response(200, {
      source: "local-fallback",
      roleId,
      query: profile.query,
      notes: ["Local deterministic occupation signal is available as a backup."]
    });
  }

  if (source !== "public") {
    return response(400, { error: "Unknown source. Use public, local, onet, or bls." });
  }

  return response(200, await publicDataResponse(roleId));
}
