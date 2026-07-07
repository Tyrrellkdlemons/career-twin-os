import { afterEach, describe, expect, it, vi } from "vitest";
import { handler } from "../netlify/functions/market.mjs";

function jsonResponse(body) {
  return {
    ok: true,
    status: 200,
    async json() {
      return body;
    }
  };
}

describe("market Netlify function", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns live public-data enrichment without private credentials", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        const value = String(url);

        if (value.includes("api.github.com")) {
          return jsonResponse({
            total_count: 1200,
            items: [
              {
                full_name: "example/cloud-career-lab",
                html_url: "https://github.com/example/cloud-career-lab",
                stargazers_count: 42
              }
            ]
          });
        }

        if (value.includes("api.openalex.org")) {
          return jsonResponse({
            meta: { count: 737845 },
            results: [{ display_name: "Cloud engineering" }]
          });
        }

        if (value.includes("worldbank.org")) {
          return jsonResponse([{}, [{ value: 4.198, date: "2025" }]]);
        }

        if (value.includes("api.gsa.gov")) {
          return jsonResponse({
            success: true,
            result: {
              count: 9671,
              results: [{ title: "Cloud computing public datasets" }]
            }
          });
        }

        throw new Error(`Unexpected URL: ${value}`);
      })
    );

    const result = await handler({
      httpMethod: "GET",
      queryStringParameters: { roleId: "cloud-engineer", source: "public" }
    });
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(body.source).toBe("public-data-live");
    expect(body.mode).toBe("PUBLIC_DATA_LIVE_MODE");
    expect(body.notes.join(" ")).toMatch(/No private server credentials required/i);
    expect(body.sources.map((source) => source.id)).toEqual([
      "github-rest",
      "openalex",
      "world-bank-indicators",
      "datagov-ckan"
    ]);
    expect(body.sources.every((source) => source.status === "live")).toBe(true);
    expect(body.marketSignal).toBeGreaterThan(74);
  });

  it("uses public-data mode as the default market response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          total_count: 50,
          items: []
        })
      )
    );

    const result = await handler({
      httpMethod: "GET",
      queryStringParameters: { roleId: "solutions-engineer" }
    });
    const body = JSON.parse(result.body);

    expect(body.source).not.toBe("local-fallback");
    expect(body.mode).toBe("PUBLIC_DATA_LIVE_MODE");
  });
});
