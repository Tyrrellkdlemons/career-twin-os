import type { RoleId } from "../../types";

export type PublicMarketMode = "PUBLIC_DATA_LIVE_MODE" | "PUBLIC_DATA_DEGRADED_MODE" | "PUBLIC_DATA_OFFLINE_MODE";
export type PublicMarketSourceStatus = "live" | "unavailable";

export interface PublicMarketSource {
  id: string;
  name: string;
  status: PublicMarketSourceStatus;
  metric: number;
  signal: string;
  examples: Array<{
    label: string;
    url: string;
    detail: string;
  }>;
}

export interface PublicMarketSignal {
  mode: PublicMarketMode;
  source: string;
  roleId: RoleId;
  title: string;
  query: string;
  marketSignal: number;
  stabilitySignal: number;
  confidence: "low" | "moderate" | "strong";
  sources: PublicMarketSource[];
  notes: string[];
  updatedAt: string;
}

export async function getPublicMarketSignal(roleId: RoleId, fetcher: typeof fetch = fetch): Promise<PublicMarketSignal> {
  try {
    const response = await fetcher(`/api/market?roleId=${encodeURIComponent(roleId)}&source=public`, {
      headers: { accept: "application/json" }
    });

    if (!response.ok) {
      return offlineSignal(roleId, `The public-data endpoint returned HTTP ${response.status}.`);
    }

    const data = (await response.json()) as Partial<PublicMarketSignal>;
    return normalizeSignal(roleId, data);
  } catch (error) {
    return offlineSignal(roleId, error instanceof Error ? error.message : "The public-data endpoint could not be reached.");
  }
}

export function summarizePublicSignal(signal: PublicMarketSignal): string {
  const liveSources = signal.sources.filter((source) => source.status === "live");

  if (signal.mode === "PUBLIC_DATA_OFFLINE_MODE" || liveSources.length === 0) {
    return "Public-data endpoint offline; live enrichment is unavailable right now.";
  }

  return `${liveSources.length} public resources connected: ${liveSources.map((source) => source.name).join(", ")}.`;
}

function normalizeSignal(roleId: RoleId, data: Partial<PublicMarketSignal>): PublicMarketSignal {
  const sources = Array.isArray(data.sources) ? data.sources.map(normalizeSource) : [];
  const mode = data.mode === "PUBLIC_DATA_LIVE_MODE" || data.mode === "PUBLIC_DATA_DEGRADED_MODE" ? data.mode : "PUBLIC_DATA_OFFLINE_MODE";

  return {
    mode,
    source: data.source || (mode === "PUBLIC_DATA_OFFLINE_MODE" ? "public-data-offline" : "public-data-live"),
    roleId,
    title: data.title || "Selected role",
    query: data.query || roleId,
    marketSignal: numberOr(data.marketSignal, 0),
    stabilitySignal: numberOr(data.stabilitySignal, 0),
    confidence: data.confidence === "strong" || data.confidence === "moderate" ? data.confidence : "low",
    sources,
    notes: Array.isArray(data.notes) ? data.notes.filter((note): note is string => typeof note === "string") : [],
    updatedAt: data.updatedAt || new Date(0).toISOString()
  };
}

function normalizeSource(source: PublicMarketSource): PublicMarketSource {
  return {
    id: String(source.id || "unknown"),
    name: String(source.name || "Public source"),
    status: source.status === "live" ? "live" : "unavailable",
    metric: numberOr(source.metric, 0),
    signal: String(source.signal || ""),
    examples: Array.isArray(source.examples) ? source.examples : []
  };
}

function offlineSignal(roleId: RoleId, note: string): PublicMarketSignal {
  return {
    mode: "PUBLIC_DATA_OFFLINE_MODE",
    source: "public-data-offline",
    roleId,
    title: "Selected role",
    query: roleId,
    marketSignal: 0,
    stabilitySignal: 0,
    confidence: "low",
    sources: [],
    notes: [`The public-data endpoint is unavailable: ${note}`],
    updatedAt: new Date(0).toISOString()
  };
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
