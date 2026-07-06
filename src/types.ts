export type RoleId =
  | "cloud-engineer"
  | "ai-automation-engineer"
  | "solutions-engineer"
  | "cybersecurity-analyst"
  | "technical-product-specialist";

export type SkillId =
  | "python"
  | "automation"
  | "webDevelopment"
  | "cloudDeployment"
  | "linux"
  | "networking"
  | "securityBasics"
  | "technicalCommunication"
  | "customerDiscovery"
  | "aiWorkflow"
  | "observability"
  | "threatModeling"
  | "logAnalysis"
  | "productThinking"
  | "dataAnalysis";

export type EvidenceLabel = "SELF-REPORTED" | "SUPPORTED" | "STRONG EVIDENCE" | "NEEDS EVIDENCE";

export interface CareerConstraints {
  targetRoles: RoleId[];
  desiredTimelineMonths: number;
  hoursPerWeek: number;
  monthlyBudget: number;
  geographyFlexibility: "local-only" | "regional" | "relocation-open";
  workPreference: "remote" | "hybrid" | "on-site" | "flexible";
  pursueDegree: boolean;
  pursueCertifications: boolean;
  riskTolerance: number;
  salaryPriority: number;
  speedPriority: number;
  stabilityPriority: number;
  interestAlignment: number;
  currentResponsibilities: string[];
}

export interface CareerEvidence {
  id: string;
  title: string;
  type: "claim" | "project" | "credential" | "work" | "repo";
  description: string;
  skills: SkillId[];
  supportCount: number;
  url?: string;
  needsEvidence?: boolean;
}

export interface CareerProfile {
  id: string;
  name: string;
  fictional: boolean;
  currentRole: string;
  background: string[];
  education: string[];
  skills: Record<SkillId, number>;
  evidence: CareerEvidence[];
  preferredRoles: RoleId[];
  constraints: CareerConstraints;
}

export interface CareerRole {
  id: RoleId;
  title: string;
  family: string;
  summary: string;
  requiredSkills: Partial<Record<SkillId, number>>;
  keyEvidence: string[];
  marketSignal: number;
  stabilitySignal: number;
  upsideSignal: number;
  degreeSensitivity: number;
  remoteSensitivity: number;
}

export interface ScoreBreakdown {
  alignmentScore: number;
  evidenceCoverage: number;
  skillCoverage: number;
  constraintFit: number;
  timeFeasibility: number;
  costFeasibility: number;
  marketSignal: number;
  optionality: number;
  riskPenalty: number;
  uncertaintyPenalty: number;
  overall: number;
}

export interface ReadinessBreakdown {
  roleId: RoleId;
  skillCoverage: number;
  evidenceCoverage: number;
  educationFit: number;
  experienceFit: number;
  overall: number;
  missingSkills: SkillId[];
  explanations: string[];
}

export interface CostBand {
  min: number;
  max: number;
}

export interface CareerMilestone {
  id: string;
  title: string;
  month: number;
  skills: SkillId[];
  evidence: string[];
  risk?: string;
}

export type RouteStrategy = "fastest" | "lowest-cost" | "highest-upside" | "balanced";

export interface CareerRoute {
  id: string;
  title: string;
  strategy: RouteStrategy;
  targetRole: RoleId;
  timeHorizonMonths: number;
  weeklyHours: number;
  costBand: CostBand;
  readinessChange: number;
  majorAssumptions: string[];
  riskFactors: string[];
  reversibleDecisions: string[];
  expensiveDecisions: string[];
  alternateRoutePoints: string[];
  milestones: CareerMilestone[];
  bottleneck: string;
  score: ScoreBreakdown;
  uncertaintyBand: {
    lowMonths: number;
    expectedMonths: number;
    highMonths: number;
    confidence: "low" | "moderate" | "strong";
  };
}

export interface ShockScenario {
  aiAdoptionAccelerates?: boolean;
  hiringSlows?: boolean;
  remoteWorkDecreases?: boolean;
  relocationPossible?: boolean;
  learningHoursDouble?: boolean;
  learningBudgetReduced?: boolean;
  certificationCompleted?: boolean;
  degreeCompleted?: boolean;
  projectPortfolioStrengthened?: boolean;
  professionalReferralGained?: boolean;
  internshipGained?: boolean;
}

export interface SimulationResult {
  routes: CareerRoute[];
  assumptions: string[];
  scenarioLabel: string;
  generatedAt: string;
}

export interface Mission {
  id: string;
  title: string;
  targetGap: string;
  whyThisMatters: string;
  targetSkills: SkillId[];
  estimatedHours: string;
  difficulty: "starter" | "intermediate" | "advanced";
  prerequisites: string[];
  deliverables: string[];
  acceptanceCriteria: string[];
  rubric: string[];
  stretchChallenge: string;
  completionEvidence: string[];
  reflectionPrompts: string[];
  codexBrief: string;
}

export interface DecisionRecord {
  id: string;
  decision: string;
  expectation: string;
  timeHorizonDays: number;
  successSignal: string;
  reviewDate: string;
  actualOutcome?: string;
}

export interface TwinAgentOutput {
  agent: "THE STRATEGIST" | "THE REALIST" | "THE MARKET ANALYST" | "THE BUILDER" | "THE ORCHESTRATOR";
  recommendation: string;
  reasons: string[];
  risks: string[];
  assumptions: string[];
  rejectedAlternatives: string[];
  confidence: "low" | "moderate" | "strong";
}
