import { afterEach, describe, expect, it, vi } from "vitest";
import { handler } from "../netlify/functions/ai.mjs";

function jsonResponse(body) {
  return {
    ok: true,
    status: 200,
    async json() {
      return body;
    }
  };
}

describe("AI Netlify function", () => {
  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
    vi.restoreAllMocks();
  });

  it("uses public-data assisted mode when OpenAI credentials are absent", async () => {
    delete process.env.OPENAI_API_KEY;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        const value = String(url);

        if (value.includes("api.github.com")) {
          return jsonResponse({ total_count: 1200, items: [] });
        }

        if (value.includes("api.openalex.org")) {
          return jsonResponse({ meta: { count: 737845 }, results: [] });
        }

        if (value.includes("worldbank.org")) {
          return jsonResponse([{}, [{ value: 4.198, date: "2025" }]]);
        }

        if (value.includes("api.gsa.gov")) {
          return jsonResponse({ success: true, result: { count: 9671, results: [] } });
        }

        throw new Error(`Unexpected URL: ${value}`);
      })
    );

    const result = await handler({
      httpMethod: "POST",
      body: JSON.stringify({
        route: {
          title: "Fastest credible cloud route",
          targetRole: "cloud-engineer"
        }
      })
    });
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(body.mode).toBe("PUBLIC_DATA_ASSISTED_MODE");
    expect(body.publicData.source).toBe("public-data-live");
    expect(body.structured.reasons.join(" ")).toContain("GitHub REST API");
    expect(body.text).not.toMatch(/Local simulation response/i);
  });
});
