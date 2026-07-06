import type { CareerProfile, CareerRoute, TwinAgentOutput } from "../../types";
import { roleCatalog } from "../../data/occupations";

export function validateAgentOutput(output: unknown): output is TwinAgentOutput {
  if (!output || typeof output !== "object") {
    return false;
  }

  const candidate = output as Partial<TwinAgentOutput>;
  const agents = ["THE STRATEGIST", "THE REALIST", "THE MARKET ANALYST", "THE BUILDER", "THE ORCHESTRATOR"];
  const confidence = ["low", "moderate", "strong"];

  return Boolean(
    candidate.agent &&
      agents.includes(candidate.agent) &&
      typeof candidate.recommendation === "string" &&
      Array.isArray(candidate.reasons) &&
      candidate.reasons.length > 0 &&
      Array.isArray(candidate.risks) &&
      Array.isArray(candidate.assumptions) &&
      Array.isArray(candidate.rejectedAlternatives) &&
      candidate.confidence &&
      confidence.includes(candidate.confidence)
  );
}

export function generateTwinCouncil(profile: CareerProfile, route: CareerRoute): TwinAgentOutput[] {
  const role = roleCatalog[route.targetRole];

  return [
    {
      agent: "THE STRATEGIST",
      recommendation: `${role.title} is attractive because it compounds ${profile.name}'s current support and automation background.`,
      reasons: [
        "The route preserves multiple adjacent options instead of forcing a single narrow bet.",
        "The strongest upside comes from converting support experience into infrastructure and automation proof."
      ],
      risks: ["The plan loses value if it produces private practice instead of public evidence."],
      assumptions: route.majorAssumptions,
      rejectedAlternatives: ["Resume rewrite as the main intervention"],
      confidence: "moderate"
    },
    {
      agent: "THE REALIST",
      recommendation: `Treat ${route.bottleneck.toLowerCase()} as the constraint to solve first.`,
      reasons: [
        "The gap is not general interest. It is credible proof under realistic time limits.",
        "Weekly workload must fit around current responsibilities or the route will drift."
      ],
      risks: route.riskFactors,
      assumptions: [`${profile.name} can sustain ${route.weeklyHours} hours per week.`],
      rejectedAlternatives: ["A degree-first route before validating employer signal"],
      confidence: "strong"
    },
    {
      agent: "THE MARKET ANALYST",
      recommendation: `Favor evidence that maps to ${role.family.toLowerCase()} requirements.`,
      reasons: [
        `The local model gives this target a market signal of ${route.score.marketSignal}/100.`,
        "Official O*NET and BLS adapters are prepared for live data when credentials and series choices are available."
      ],
      risks: ["Market conditions can change faster than a static model can represent."],
      assumptions: ["Market data is treated as context, not a hiring guarantee."],
      rejectedAlternatives: ["Untraceable salary or employment probability claims"],
      confidence: "moderate"
    },
    {
      agent: "THE BUILDER",
      recommendation: "Build one proof mission that employers can inspect before adding another certificate.",
      reasons: [
        "A deployable artifact closes the evidence gap faster than another generic course.",
        "The mission can be scoped to the route's weekly-hour budget."
      ],
      risks: ["Scope creep could delay visible progress."],
      assumptions: ["The project can be completed in public without exposing private data."],
      rejectedAlternatives: ["Private-only practice exercises"],
      confidence: "strong"
    },
    {
      agent: "THE ORCHESTRATOR",
      recommendation: `Recommend the ${route.title} route, with a check-in at month ${route.milestones[1]?.month ?? 6}.`,
      reasons: [
        "It balances readiness gain, evidence production, and constraint fit.",
        "The plan has explicit alternate route points if assumptions fail."
      ],
      risks: ["A hiring slowdown would require more resilient evidence and referral work."],
      assumptions: route.majorAssumptions,
      rejectedAlternatives: ["Picking the fastest route without a fallback"],
      confidence: route.uncertaintyBand.confidence
    }
  ];
}
