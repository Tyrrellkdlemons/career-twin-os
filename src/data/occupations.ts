import type { CareerRole, RoleId, SkillId } from "../types";

export const skillLabels: Record<SkillId, string> = {
  python: "Python fundamentals",
  automation: "Automation design",
  webDevelopment: "Web development",
  cloudDeployment: "Cloud deployment",
  linux: "Linux operations",
  networking: "Networking fundamentals",
  securityBasics: "Security basics",
  technicalCommunication: "Technical communication",
  customerDiscovery: "Customer discovery",
  aiWorkflow: "AI workflow design",
  observability: "Observability",
  threatModeling: "Threat modeling",
  logAnalysis: "Log analysis",
  productThinking: "Product thinking",
  dataAnalysis: "Data analysis"
};

export const roleCatalog: Record<RoleId, CareerRole> = {
  "cloud-engineer": {
    id: "cloud-engineer",
    title: "Cloud Engineer",
    family: "Infrastructure and platform operations",
    summary: "Builds and operates deployable systems with infrastructure, monitoring, and reliability evidence.",
    requiredSkills: {
      cloudDeployment: 85,
      linux: 70,
      networking: 68,
      automation: 72,
      securityBasics: 58,
      observability: 64,
      technicalCommunication: 50
    },
    keyEvidence: ["deployed app", "infrastructure configuration", "health endpoint", "monitoring dashboard"],
    marketSignal: 74,
    stabilitySignal: 76,
    upsideSignal: 72,
    degreeSensitivity: 35,
    remoteSensitivity: 46
  },
  "ai-automation-engineer": {
    id: "ai-automation-engineer",
    title: "AI Automation Engineer",
    family: "Applied AI systems",
    summary: "Connects business workflows, model-powered tools, evaluation loops, and production automation.",
    requiredSkills: {
      python: 78,
      automation: 86,
      aiWorkflow: 82,
      webDevelopment: 58,
      cloudDeployment: 62,
      observability: 60,
      technicalCommunication: 54
    },
    keyEvidence: ["workflow automation", "deployed AI helper", "evaluation notes", "operations documentation"],
    marketSignal: 78,
    stabilitySignal: 62,
    upsideSignal: 88,
    degreeSensitivity: 28,
    remoteSensitivity: 58
  },
  "solutions-engineer": {
    id: "solutions-engineer",
    title: "Solutions Engineer",
    family: "Customer-facing technology",
    summary: "Translates customer problems into technical demos, implementation plans, and trusted buying guidance.",
    requiredSkills: {
      technicalCommunication: 85,
      customerDiscovery: 76,
      webDevelopment: 56,
      automation: 55,
      productThinking: 62,
      dataAnalysis: 46,
      cloudDeployment: 45
    },
    keyEvidence: ["technical demo", "customer problem framing", "implementation guide", "case-study style write-up"],
    marketSignal: 70,
    stabilitySignal: 70,
    upsideSignal: 76,
    degreeSensitivity: 24,
    remoteSensitivity: 52
  },
  "cybersecurity-analyst": {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    family: "Security operations",
    summary: "Analyzes risks, events, alerts, and controls with traceable security reasoning.",
    requiredSkills: {
      securityBasics: 86,
      networking: 76,
      logAnalysis: 74,
      threatModeling: 66,
      linux: 56,
      technicalCommunication: 52,
      automation: 42
    },
    keyEvidence: ["threat model", "log investigation", "control mapping", "security lab notes"],
    marketSignal: 73,
    stabilitySignal: 82,
    upsideSignal: 68,
    degreeSensitivity: 42,
    remoteSensitivity: 34
  },
  "technical-product-specialist": {
    id: "technical-product-specialist",
    title: "Technical Product Specialist",
    family: "Product enablement and technical support",
    summary: "Uses product judgment, support patterns, and technical fluency to improve adoption and support quality.",
    requiredSkills: {
      productThinking: 80,
      technicalCommunication: 82,
      customerDiscovery: 72,
      dataAnalysis: 58,
      webDevelopment: 42,
      automation: 48,
      securityBasics: 35
    },
    keyEvidence: ["support analytics", "product workflow map", "customer enablement artifact", "automation improvement"],
    marketSignal: 66,
    stabilitySignal: 74,
    upsideSignal: 62,
    degreeSensitivity: 18,
    remoteSensitivity: 50
  }
};

export const roleList = Object.values(roleCatalog);
