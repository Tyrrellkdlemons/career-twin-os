import { describe, expect, it, vi, afterEach } from "vitest";
import { getPublicMarketSignal, summarizePublicSignal } from "../src/services/market/publicMarketClient";

describe("public market client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads public-data enrichment through the server function", async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        mode: "PUBLIC_DATA_LIVE_MODE",
        source: "public-data-live",
        roleId: "cloud-engineer",
        title: "Cloud Engineer",
        query: "cloud engineering",
        marketSignal: 86,
        stabilitySignal: 80,
        confidence: "strong",
        sources: [
          { id: "github-rest", name: "GitHub REST API", status: "live", metric: 1200, signal: "repo signal", examples: [] },
          { id: "openalex", name: "OpenAlex API", status: "live", metric: 737845, signal: "research signal", examples: [] }
        ],
        notes: ["No private server credentials required."],
        updatedAt: "2026-07-07T00:00:00.000Z"
      })
    })) as unknown as typeof fetch;

    const signal = await getPublicMarketSignal("cloud-engineer", fetcher);

    expect(fetcher).toHaveBeenCalledWith("/api/market?roleId=cloud-engineer&source=public", { headers: { accept: "application/json" } });
    expect(signal.mode).toBe("PUBLIC_DATA_LIVE_MODE");
    expect(signal.marketSignal).toBe(86);
    expect(summarizePublicSignal(signal)).toBe("2 public resources connected: GitHub REST API, OpenAlex API.");
  });

  it("returns an offline status instead of pretending local simulation is live", async () => {
    const fetcher = vi.fn(async () => ({
      ok: false,
      status: 502,
      json: async () => ({})
    })) as unknown as typeof fetch;

    const signal = await getPublicMarketSignal("solutions-engineer", fetcher);

    expect(signal.mode).toBe("PUBLIC_DATA_OFFLINE_MODE");
    expect(signal.source).toBe("public-data-offline");
    expect(signal.notes.join(" ")).toMatch(/public-data endpoint/i);
  });
});
