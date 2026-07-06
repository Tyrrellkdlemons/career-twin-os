import { demoProfile } from "../../data/demoProfile";
import { roleCatalog } from "../../data/occupations";
import type {
  CareerConstraints,
  CareerMilestone,
  CareerProfile,
  CareerRoute,
  ReadinessBreakdown,
  RoleId,
  RouteStrategy,
  ScoreBreakdown,
  ShockScenario,
  SimulationResult
} from "../../types";
import { clamp, seededRandom } from "./random";

export { generateMission } from "./missionGenerator";
export { classifyEvidence, parseGitHubRepositoryUrl } from "./evidence";
export { generateTwinCouncil, validateAgentOutput } from "./twinCouncil";

const routeBlueprints: Array<{
  id: string;
  title: string;
  strategy: RouteStrategy;
  targetRole: RoleId;
  baseMonths: number;
  baseHours: number;
  costBand: { min: number; max: number };
  bottleneck: string;
  riskFactors: string[];
  milestones: Omit<CareerMilestone, "id">[];
}> = [
  {
    id: "fastest-cloud",
    title: "Fastest Credible Cloud Route",
    strategy: "fastest",
    targetRole: "cloud-engineer",
    baseMonths: 9,
    baseHours: 16,
    costBand: { min: 450, max: 1400 },
    bottleneck: "Production-grade deployment evidence",
    riskFactors: ["High weekly load", "Certification cost may not convert without a portfolio artifact"],
    milestones: [
      {
        title: "Ship a monitored cloud status application",
        month: 2,
        skills: ["cloudDeployment", "observability"],
        evidence: ["deployed app", "health endpoint"]
      },
      {
        title: "Document infrastructure and failure recovery",
        month: 4,
        skills: ["linux", "automation"],
        evidence: ["runbook", "failure scenario"]
      },
      {
        title: "Practice cloud interviews with project walkthroughs",
        month: 7,
        skills: ["technicalCommunication", "networking"],
        evidence: ["architecture explanation"]
      }
    ]
  },
  {
    id: "lowest-cost-solutions",
    title: "Lowest-Cost Solutions Route",
    strategy: "lowest-cost",
    targetRole: "solutions-engineer",
    baseMonths: 14,
    baseHours: 7,
    costBand: { min: 0, max: 500 },
    bottleneck: "Customer-facing technical demo evidence",
    riskFactors: ["May improve optionality more than immediate cloud readiness"],
    milestones: [
      {
        title: "Create a customer problem map from support history",
        month: 1,
        skills: ["customerDiscovery", "technicalCommunication"],
        evidence: ["problem framing"]
      },
      {
        title: "Build a product-style technical demo",
        month: 5,
        skills: ["webDevelopment", "automation"],
        evidence: ["technical demo"]
      },
      {
        title: "Publish an implementation guide and outreach narrative",
        month: 10,
        skills: ["productThinking", "technicalCommunication"],
        evidence: ["case-study style write-up"]
      }
    ]
  },
  {
    id: "highest-upside-ai",
    title: "Highest-Upside AI Automation Route",
    strategy: "highest-upside",
    targetRole: "ai-automation-engineer",
    baseMonths: 12,
    baseHours: 14,
    costBand: { min: 250, max: 1800 },
    bottleneck: "Reliable AI workflow proof",
    riskFactors: ["Fast-changing market expectations", "Model output quality needs evaluation, not demos only"],
    milestones: [
      {
        title: "Automate one support workflow with measurable before and after",
        month: 2,
        skills: ["automation", "python"],
        evidence: ["workflow automation"]
      },
      {
        title: "Add evaluation and observability to the workflow",
        month: 6,
        skills: ["aiWorkflow", "observability"],
        evidence: ["evaluation notes"]
      },
      {
        title: "Package the workflow as a deployable internal tool",
        month: 11,
        skills: ["cloudDeployment", "technicalCommunication"],
        evidence: ["deployed AI helper"]
      }
    ]
  },
  {
    id: "balanced-ai-cloud",
    title: "Balanced AI-to-Cloud Automation Route",
    strategy: "balanced",
    targetRole: "cloud-engineer",
    baseMonths: 11,
    baseHours: 12,
    costBand: { min: 150, max: 900 },
    bottleneck: "Evidence that connects automation to operations",
    riskFactors: ["Balanced routes can become unfocused without strict proof milestones"],
    milestones: [
      {
        title: "Turn a support automation into a deployed service",
        month: 2,
        skills: ["automation", "cloudDeployment"],
        evidence: ["deployed service"]
      },
      {
        title: "Add monitoring, logging, and a recovery runbook",
        month: 5,
        skills: ["observability", "linux"],
        evidence: ["monitoring dashboard"]
      },
      {
        title: "Create a route narrative for cloud and AI-adjacent interviews",
        month: 9,
        skills: ["technicalCommunication", "aiWorkflow"],
        evidence: ["architecture explanation"]
      }
    ]
  }
];

export function calculateReadiness(profile: CareerProfile, roleId: RoleId): ReadinessBreakdown {
  const role = roleCatalog[roleId];
  const required = Object.entries(role.requiredSkills);
  const weighted = required.reduce(
    (acc, [skill, requiredLevel]) => {
      const current = profile.skills[skill as keyof typeof profile.skills] ?? 0;
      acc.earned += Math.min(current, requiredLevel ?? 0);
      acc.required += requiredLevel ?? 0;
      return acc;
    },
    { earned: 0, required: 0 }
  );
  const skillCoverage = clamp((weighted.earned / weighted.required) * 100);
  const relevantEvidence = profile.evidence.filter((evidence) =>
    evidence.skills.some((skill) => Object.keys(role.requiredSkills).includes(skill))
  );
  const evidenceStrength = relevantEvidence.reduce((sum, evidence) => sum + Math.min(3, evidence.supportCount), 0);
  const evidenceCoverage = clamp((evidenceStrength / Math.max(6, role.keyEvidence.length * 2)) * 100);
  const educationFit = profile.education.some((item) => item.toLowerCase().includes("degree")) ? 72 : 50;
  const experienceFit = profile.background.some((item) => item.toLowerCase().includes("customer")) ? 74 : 58;
  const missingSkills = required
    .filter(([skill, requiredLevel]) => (profile.skills[skill as keyof typeof profile.skills] ?? 0) + 8 < (requiredLevel ?? 0))
    .map(([skill]) => skill as keyof typeof profile.skills);

  const explanations = [
    `${role.title} readiness is strongest where current work already overlaps target evidence.`,
    evidenceCoverage >= 45
      ? "Existing deployments and automation projects support the target role."
      : "Evidence is still mostly self-reported for this target role.",
    missingSkills.length > 0
      ? `Primary skill gaps: ${missingSkills.join(", ")}.`
      : "No major skill gap dominates the route."
  ];

  return {
    roleId,
    skillCoverage,
    evidenceCoverage,
    educationFit,
    experienceFit,
    missingSkills,
    explanations,
    overall: clamp(skillCoverage * 0.42 + evidenceCoverage * 0.34 + educationFit * 0.1 + experienceFit * 0.14)
  };
}

function scoreRoute(
  profile: CareerProfile,
  constraints: CareerConstraints,
  route: Omit<CareerRoute, "score" | "uncertaintyBand">,
  shocks: ShockScenario = {}
): ScoreBreakdown {
  const readiness = calculateReadiness(profile, route.targetRole);
  const role = roleCatalog[route.targetRole];
  const speedWeight = constraints.speedPriority / 100;
  const stabilityWeight = constraints.stabilityPriority / 100;
  const salaryWeight = constraints.salaryPriority / 100;
  const interestWeight = constraints.interestAlignment / 100;
  const timeFeasibility = clamp(100 - Math.max(0, route.weeklyHours - constraints.hoursPerWeek) * 7);
  const costFeasibility = clamp(100 - Math.max(0, route.costBand.max - constraints.monthlyBudget * 3) / 16);
  const riskPenalty = clamp((100 - constraints.riskTolerance) * (route.strategy === "highest-upside" ? 0.7 : 0.38));
  const remotePenalty = constraints.workPreference === "remote" ? role.remoteSensitivity * 0.18 : 0;
  const degreePenalty = !constraints.pursueDegree ? role.degreeSensitivity * 0.14 : 0;
  const shockMarketDelta = shocks.aiAdoptionAccelerates && route.targetRole === "ai-automation-engineer" ? 8 : 0;
  const hiringPenalty = shocks.hiringSlows ? 8 : 0;
  const portfolioBoost = shocks.projectPortfolioStrengthened ? 9 : 0;
  const referralBoost = shocks.professionalReferralGained ? 6 : 0;
  const lowResourceMode = constraints.hoursPerWeek <= 8 || constraints.monthlyBudget <= 100;
  const strategyAdjustment =
    route.strategy === "lowest-cost"
      ? lowResourceMode
        ? 12
        : -12
      : route.strategy === "fastest"
        ? speedWeight * 9
        : route.strategy === "highest-upside"
          ? salaryWeight * 8 - (constraints.riskTolerance < 50 ? 7 : 0)
          : 7;
  const alignmentScore = clamp(
    readiness.overall * 0.45 +
      (profile.preferredRoles.includes(route.targetRole) ? 24 : 10) +
      interestWeight * 24 +
      portfolioBoost
  );
  const marketSignal = clamp(role.marketSignal + shockMarketDelta - hiringPenalty + referralBoost);
  const optionality = clamp(
    (route.strategy === "balanced" ? 82 : route.strategy === "highest-upside" ? 72 : 68) +
      (constraints.geographyFlexibility === "relocation-open" ? 8 : 0)
  );
  const constraintFit = clamp((timeFeasibility + costFeasibility) / 2 - remotePenalty - degreePenalty);
  const scenarioVolatilityPenalty = Object.values(shocks).some(Boolean) ? 4 + (shocks.hiringSlows ? 5 : 0) : 0;
  const uncertaintyPenalty = clamp(
    (route.strategy === "highest-upside" ? 22 : 12) +
      (shocks.hiringSlows ? 9 : 0) +
      scenarioVolatilityPenalty -
      (shocks.internshipGained ? 5 : 0)
  );

  const overall = clamp(
    alignmentScore * 0.18 +
      readiness.evidenceCoverage * 0.12 +
      readiness.skillCoverage * 0.13 +
      constraintFit * 0.15 +
      timeFeasibility * (0.08 + speedWeight * 0.08) +
      costFeasibility * 0.08 +
      marketSignal * (0.1 + salaryWeight * 0.04) +
      optionality * 0.08 +
      role.stabilitySignal * (0.04 + stabilityWeight * 0.03) -
      riskPenalty * 0.1 -
      uncertaintyPenalty * 0.08 +
      strategyAdjustment -
      scenarioVolatilityPenalty
  );

  return {
    alignmentScore,
    evidenceCoverage: clamp(readiness.evidenceCoverage + portfolioBoost),
    skillCoverage: readiness.skillCoverage,
    constraintFit,
    timeFeasibility,
    costFeasibility,
    marketSignal,
    optionality,
    riskPenalty,
    uncertaintyPenalty,
    overall
  };
}

function adjustRouteForConstraints(
  blueprint: (typeof routeBlueprints)[number],
  constraints: CareerConstraints,
  shocks: ShockScenario
): Omit<CareerRoute, "score" | "uncertaintyBand"> {
  const hoursMultiplier = constraints.hoursPerWeek < blueprint.baseHours ? constraints.hoursPerWeek / blueprint.baseHours : 1;
  const learningHours = shocks.learningHoursDouble ? Math.min(24, constraints.hoursPerWeek * 2) : constraints.hoursPerWeek;
  const budgetReduced = shocks.learningBudgetReduced ? constraints.monthlyBudget * 0.45 : constraints.monthlyBudget;
  const weeklyHours =
    blueprint.strategy === "lowest-cost"
      ? Math.min(8, Math.max(5, learningHours))
      : Math.min(18, Math.max(8, Math.round((blueprint.baseHours + learningHours) / 2)));
  const timePenalty = hoursMultiplier < 1 ? Math.round((1 - hoursMultiplier) * 8) : 0;
  const budgetPenalty = budgetReduced * 3 < blueprint.costBand.max ? 2 : 0;
  const shockPenalty = shocks.hiringSlows ? 2 : 0;
  const shockAcceleration = shocks.certificationCompleted || shocks.projectPortfolioStrengthened ? -1 : 0;
  const timeHorizonMonths = Math.max(6, blueprint.baseMonths + timePenalty + budgetPenalty + shockPenalty + shockAcceleration);
  const costCap =
    blueprint.strategy === "lowest-cost"
      ? Math.min(500, blueprint.costBand.max)
      : Math.max(blueprint.costBand.min + 200, Math.min(blueprint.costBand.max, budgetReduced * 4 + 250));

  return {
    id: blueprint.id,
    title: blueprint.title,
    strategy: blueprint.strategy,
    targetRole: blueprint.targetRole,
    timeHorizonMonths,
    weeklyHours,
    costBand: { min: blueprint.costBand.min, max: Math.round(costCap) },
    readinessChange: blueprint.strategy === "lowest-cost" ? 22 : blueprint.strategy === "highest-upside" ? 34 : 29,
    majorAssumptions: [
      "Scenario simulation, not a guarantee or prediction.",
      `Sustained weekly effort averages ${weeklyHours} hours.`,
      "Evidence quality matters more than activity volume.",
      "Market data is advisory and confidence-limited."
    ],
    riskFactors: blueprint.riskFactors,
    reversibleDecisions: ["Change target role emphasis", "Swap certification for project evidence", "Reduce weekly load"],
    expensiveDecisions: ["Paid certificate track", "Relocation", "Degree program"],
    alternateRoutePoints: ["Month 3 evidence review", "Month 6 route comparison", "First interview signal"],
    milestones: blueprint.milestones.map((milestone, index) => ({
      ...milestone,
      id: `${blueprint.id}-m${index + 1}`,
      month: Math.min(timeHorizonMonths, milestone.month + Math.max(0, timePenalty - 1))
    })),
    bottleneck: blueprint.bottleneck
  };
}

function addUncertainty(route: Omit<CareerRoute, "uncertaintyBand">, seed: string): CareerRoute {
  const random = seededRandom(`${seed}:${route.id}`);
  const spread = Math.max(2, Math.round(2 + random() * 5 + route.score.uncertaintyPenalty / 10));
  const confidence = route.score.uncertaintyPenalty < 14 ? "strong" : route.score.uncertaintyPenalty < 24 ? "moderate" : "low";

  return {
    ...route,
    uncertaintyBand: {
      lowMonths: Math.max(3, route.timeHorizonMonths - Math.round(spread / 2)),
      expectedMonths: route.timeHorizonMonths,
      highMonths: route.timeHorizonMonths + spread,
      confidence
    }
  };
}

export function rankCareerRoutes(
  profile: CareerProfile = demoProfile,
  constraints: CareerConstraints = profile.constraints,
  shocks: ShockScenario = {},
  seed = "default"
): CareerRoute[] {
  const routes = routeBlueprints.map((blueprint) => {
    const adjusted = adjustRouteForConstraints(blueprint, constraints, shocks);
    const score = scoreRoute(profile, constraints, adjusted, shocks);
    return addUncertainty({ ...adjusted, score }, seed);
  });

  return routes.sort((a, b) => b.score.overall - a.score.overall);
}

export function applyShockScenario(
  profile: CareerProfile,
  constraints: CareerConstraints,
  shocks: ShockScenario
): SimulationResult {
  const adjustedConstraints = {
    ...constraints,
    hoursPerWeek: shocks.learningHoursDouble ? Math.min(28, constraints.hoursPerWeek * 2) : constraints.hoursPerWeek,
    monthlyBudget: shocks.learningBudgetReduced ? Math.round(constraints.monthlyBudget * 0.45) : constraints.monthlyBudget,
    geographyFlexibility: shocks.relocationPossible ? "relocation-open" : constraints.geographyFlexibility,
    pursueDegree: shocks.degreeCompleted ? true : constraints.pursueDegree
  } satisfies CareerConstraints;

  const assumptions = buildShockAssumptions(shocks);
  return {
    routes: rankCareerRoutes(profile, adjustedConstraints, shocks, JSON.stringify(shocks)),
    assumptions,
    scenarioLabel: "Scenario simulation, not a guarantee or prediction.",
    generatedAt: new Date(0).toISOString()
  };
}

export function runCareerSimulation(
  profile: CareerProfile = demoProfile,
  options: { seed?: string; shocks?: ShockScenario; constraints?: CareerConstraints } = {}
): SimulationResult {
  const constraints = options.constraints ?? profile.constraints;
  const shocks = options.shocks ?? {};
  return {
    routes: rankCareerRoutes(profile, constraints, shocks, options.seed ?? profile.id),
    assumptions: [
      "Scenario simulation, not a guarantee or prediction.",
      "Scores are normalized estimates based on stated constraints, evidence, and local occupation assumptions.",
      "Use O*NET and BLS live adapters when credentials and exact series choices are available."
    ],
    scenarioLabel: "Scenario simulation, not a guarantee or prediction.",
    generatedAt: new Date(0).toISOString()
  };
}

export function buildShockAssumptions(shocks: ShockScenario): string[] {
  const assumptions: string[] = [];
  if (shocks.aiAdoptionAccelerates) {
    assumptions.push("AI adoption accelerates: automation-heavy roles gain market signal and require stronger production evidence.");
  }
  if (shocks.hiringSlows) {
    assumptions.push("Hiring slows: timelines widen and referral or portfolio strength matters more.");
  }
  if (shocks.remoteWorkDecreases) {
    assumptions.push("Remote availability decreases: remote-only plans receive a constraint penalty.");
  }
  if (shocks.relocationPossible) {
    assumptions.push("Relocation becomes possible: geography-sensitive options regain optionality.");
  }
  if (shocks.learningHoursDouble) {
    assumptions.push("Learning hours double: milestone delay risk decreases if the pace is sustainable.");
  }
  if (shocks.learningBudgetReduced) {
    assumptions.push("Learning budget is reduced: free resources and public proof become more important.");
  }
  if (shocks.certificationCompleted) {
    assumptions.push("Certification completed: signal improves only where it supports evidence.");
  }
  if (shocks.degreeCompleted) {
    assumptions.push("Degree completed: degree-sensitive routes receive less penalty.");
  }
  if (shocks.projectPortfolioStrengthened) {
    assumptions.push("Project portfolio strengthened: evidence coverage improves across technical routes.");
  }
  if (shocks.professionalReferralGained) {
    assumptions.push("Professional referral gained: market access and optionality improve.");
  }
  if (shocks.internshipGained) {
    assumptions.push("Internship gained: uncertainty decreases through direct experience evidence.");
  }

  return assumptions.length ? assumptions : ["Baseline scenario: no external shock toggles are active."];
}

export function explainScore(route: CareerRoute): Array<{ label: keyof ScoreBreakdown; value: number; explanation: string }> {
  return [
    {
      label: "alignmentScore",
      value: route.score.alignmentScore,
      explanation: "How closely the route matches the profile, preferences, and target-role overlap."
    },
    {
      label: "evidenceCoverage",
      value: route.score.evidenceCoverage,
      explanation: "How much inspectable evidence supports the claims needed for this route."
    },
    {
      label: "constraintFit",
      value: route.score.constraintFit,
      explanation: "How well the plan fits available time, budget, geography, and education limits."
    },
    {
      label: "marketSignal",
      value: route.score.marketSignal,
      explanation: "Local market assumption informed by role family and prepared official-data adapters."
    },
    {
      label: "uncertaintyPenalty",
      value: route.score.uncertaintyPenalty,
      explanation: "Penalty for volatile assumptions, weak signals, and route sensitivity."
    }
  ];
}
