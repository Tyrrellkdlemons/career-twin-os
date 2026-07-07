import { describe, expect, it } from "vitest";
import { findOpenApis, getApisByCareerUse, openApiCatalog } from "../src/data/openApis";

describe("open API discovery catalog", () => {
  it("finds official labor and occupation APIs without scraping job boards", () => {
    const results = findOpenApis("labor occupation skills");
    const names = results.map((api) => api.name);

    expect(names).toContain("BLS Public Data API");
    expect(names).toContain("O*NET Web Services");
    expect(results.every((api) => api.disallowedUseCases.includes("Scrape private job platforms"))).toBe(true);
    expect(names).not.toContain("LinkedIn");
    expect(names).not.toContain("Indeed");
  });

  it("maps public APIs to CareerTwin use cases and credential expectations", () => {
    const evidenceApis = getApisByCareerUse("evidence");
    const marketApis = getApisByCareerUse("market");

    expect(evidenceApis.map((api) => api.name)).toContain("GitHub REST API");
    expect(marketApis.some((api) => api.name === "World Bank Indicators API")).toBe(true);
    expect(openApiCatalog.every((api) => api.docsUrl.startsWith("https://"))).toBe(true);
    expect(openApiCatalog.some((api) => api.auth === "none")).toBe(true);
    expect(openApiCatalog.some((api) => api.auth === "free-key")).toBe(true);
  });

  it("prioritizes no-key APIs when requested", () => {
    const results = findOpenApis("education research", { auth: "none" });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((api) => api.auth === "none")).toBe(true);
    expect(results.map((api) => api.name)).toContain("OpenAlex API");
  });
});
