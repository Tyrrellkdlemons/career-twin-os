import type { CareerProfile } from "../types";

export const demoProfile: CareerProfile = {
  id: "demo-jordan-rivera",
  name: "Jordan Rivera",
  fictional: true,
  currentRole: "IT Support Specialist",
  background: [
    "Customer-facing technology support",
    "Basic web development",
    "Python fundamentals",
    "Automation experiments",
    "Several small deployed projects"
  ],
  education: ["Associate degree", "Self-directed cloud and Python coursework"],
  skills: {
    python: 62,
    automation: 65,
    webDevelopment: 58,
    cloudDeployment: 54,
    linux: 48,
    networking: 46,
    securityBasics: 38,
    technicalCommunication: 78,
    customerDiscovery: 66,
    aiWorkflow: 44,
    observability: 30,
    threatModeling: 22,
    logAnalysis: 28,
    productThinking: 56,
    dataAnalysis: 42
  },
  evidence: [
    {
      id: "ev-support-work",
      title: "Three years of IT support tickets and customer escalations",
      type: "work",
      description: "Repeatedly translated technical issues into user-facing fixes and documentation.",
      skills: ["technicalCommunication", "customerDiscovery", "securityBasics"],
      supportCount: 2
    },
    {
      id: "ev-status-app",
      title: "Small deployed uptime dashboard",
      type: "project",
      description: "Static dashboard and a health endpoint for personal projects.",
      skills: ["webDevelopment", "cloudDeployment", "automation"],
      supportCount: 2,
      url: "https://example.com/jordan-status"
    },
    {
      id: "ev-python-scripts",
      title: "Python ticket cleanup scripts",
      type: "project",
      description: "Scripts that normalized CSV exports and reduced repetitive ticket tagging.",
      skills: ["python", "automation", "dataAnalysis"],
      supportCount: 3
    },
    {
      id: "ev-aws-claim",
      title: "Self-reported AWS familiarity",
      type: "claim",
      description: "Jordan reports introductory AWS practice but has limited public infrastructure evidence.",
      skills: ["cloudDeployment", "networking"],
      supportCount: 0,
      needsEvidence: true
    }
  ],
  preferredRoles: [
    "cloud-engineer",
    "ai-automation-engineer",
    "solutions-engineer",
    "cybersecurity-analyst",
    "technical-product-specialist"
  ],
  constraints: {
    targetRoles: ["cloud-engineer", "ai-automation-engineer", "solutions-engineer"],
    desiredTimelineMonths: 12,
    hoursPerWeek: 14,
    monthlyBudget: 350,
    geographyFlexibility: "regional",
    workPreference: "hybrid",
    pursueDegree: false,
    pursueCertifications: true,
    riskTolerance: 58,
    salaryPriority: 70,
    speedPriority: 74,
    stabilityPriority: 62,
    interestAlignment: 82,
    currentResponsibilities: ["Full-time work", "Family obligations on weekends"]
  }
};
