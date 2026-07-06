import { describe, expect, it } from "vitest";
import { demoProfile } from "../src/data/demoProfile";
import {
  applyShockScenario,
  calculateReadiness,
  generateMission,
  rankCareerRoutes,
  runCareerSimulation
} from "../src/services/simulation";
import { classifyEvidence, parseGitHubRepositoryUrl } from "../src/services/simulation/evidence";
import { validateAgentOutput } from "../src/services/simulation/twinCouncil";

describe("CareerTwin simulation engine", () => {
  it("calculates stronger readiness for roles covered by skills and evidence", () => {
    const cloud = calculateReadiness(demoProfile, "cloud-engineer");
    const cyber = calculateReadiness(demoProfile, "cybersecurity-analyst");

    expect(cloud.overall).toBeGreaterThan(cyber.overall);
    expect(cloud.evidenceCoverage).toBeGreaterThanOrEqual(45);
    expect(cloud.explanations).toContain("Existing deployments and automation projects support the target role.");
  });

  it("scores constraints so reduced time and budget change route ranking", () => {
    const normal = rankCareerRoutes(demoProfile, demoProfile.constraints);
    const constrained = rankCareerRoutes(demoProfile, {
      ...demoProfile.constraints,
      hoursPerWeek: 6,
      monthlyBudget: 0,
      riskTolerance: 35
    });

    expect(normal[0].id).not.toEqual(constrained[0].id);
    expect(constrained[0].weeklyHours).toBeLessThanOrEqual(8);
    expect(constrained[0].costBand.max).toBeLessThanOrEqual(600);
  });

  it("generates distinct route strategies rather than cosmetic variants", () => {
    const routes = rankCareerRoutes(demoProfile, demoProfile.constraints);
    const strategyTypes = new Set(routes.map((route) => route.strategy));

    expect(routes).toHaveLength(4);
    expect(strategyTypes.size).toBeGreaterThanOrEqual(3);
    expect(routes.map((route) => route.milestones[0].title)).not.toEqual([
      routes[0].milestones[0].title,
      routes[0].milestones[0].title,
      routes[0].milestones[0].title,
      routes[0].milestones[0].title
    ]);
  });

  it("recalculates when Future Shock variables are applied", () => {
    const baseline = rankCareerRoutes(demoProfile, demoProfile.constraints);
    const shocked = applyShockScenario(demoProfile, demoProfile.constraints, {
      aiAdoptionAccelerates: true,
      hiringSlows: true,
      projectPortfolioStrengthened: true
    });

    expect(shocked.routes[0].score.overall).not.toEqual(baseline[0].score.overall);
    expect(shocked.assumptions).toContain("AI adoption accelerates: automation-heavy roles gain market signal and require stronger production evidence.");
  });

  it("uses seeded simulation so uncertainty bands are reproducible", () => {
    const first = runCareerSimulation(demoProfile, { seed: "jordan-showcase" });
    const second = runCareerSimulation(demoProfile, { seed: "jordan-showcase" });

    expect(first.routes.map((route) => route.uncertaintyBand)).toEqual(
      second.routes.map((route) => route.uncertaintyBand)
    );
    expect(first.scenarioLabel).toBe("Scenario simulation, not a guarantee or prediction.");
  });

  it("generates meaningful fallback missions and Codex briefs", () => {
    const mission = generateMission("cloud-deployment-evidence", demoProfile);

    expect(mission.title).toMatch(/status monitoring/i);
    expect(mission.deliverables).toContain("deployed app");
    expect(mission.codexBrief).toContain("STOP CONDITIONS");
  });

  it("classifies evidence labels without claiming verification", () => {
    expect(classifyEvidence({ type: "claim", supportCount: 0 })).toBe("SELF-REPORTED");
    expect(classifyEvidence({ type: "project", supportCount: 1 })).toBe("SUPPORTED");
    expect(classifyEvidence({ type: "project", supportCount: 3 })).toBe("STRONG EVIDENCE");
    expect(classifyEvidence({ type: "claim", supportCount: 1, needsEvidence: true })).toBe("NEEDS EVIDENCE");
  });

  it("validates public GitHub repository URLs safely", () => {
    expect(parseGitHubRepositoryUrl("https://github.com/Tyrrellkdlemons/career-twin-os")).toEqual({
      owner: "Tyrrellkdlemons",
      repo: "career-twin-os",
      normalizedUrl: "https://github.com/Tyrrellkdlemons/career-twin-os"
    });
    expect(parseGitHubRepositoryUrl("https://evil.example.com/a/b")).toBeNull();
    expect(parseGitHubRepositoryUrl("https://github.com/a/b/issues/1")).toBeNull();
  });

  it("validates Twin Council structured output", () => {
    expect(
      validateAgentOutput({
        agent: "THE BUILDER",
        recommendation: "Build deployment evidence first.",
        reasons: ["It closes the largest credibility gap."],
        risks: ["Scope creep could delay completion."],
        assumptions: ["The user can spend 8 hours this week."],
        rejectedAlternatives: ["Generic certificate-first plan"],
        confidence: "moderate"
      })
    ).toBe(true);
  });
});
