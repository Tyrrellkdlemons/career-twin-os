import type { CareerProfile, Mission, SkillId } from "../../types";

const missionSkills: SkillId[] = ["cloudDeployment", "observability", "automation", "technicalCommunication"];

export function generateMission(targetGap: string, profile: CareerProfile): Mission {
  const missionTitle =
    targetGap === "cloud-deployment-evidence"
      ? "Deploy a fault-tolerant status monitoring application"
      : "Build a route-specific proof artifact";

  const deliverables = [
    "deployed app",
    "repository",
    "infrastructure configuration",
    "health endpoint",
    "monitoring dashboard",
    "documented failure scenario",
    "architecture explanation"
  ];

  const acceptanceCriteria = [
    "The app is reachable at a public URL.",
    "A health endpoint returns a clear status payload.",
    "The repository documents setup, deployment, and recovery steps.",
    "At least one simulated failure is documented with the observed behavior.",
    "No secrets are committed or exposed in screenshots."
  ];

  const codexBrief = [
    "ROLE",
    "You are Codex acting as a senior full-stack engineer building a proof mission for a career portfolio.",
    "",
    "MISSION",
    missionTitle,
    "",
    "REQUIRED FEATURES",
    "- Public status page with service cards and last-check timestamps",
    "- Health endpoint with JSON status",
    "- Simulated dependency failure state",
    "- Basic monitoring dashboard",
    "- Clear README with architecture and runbook",
    "",
    "TECH STACK",
    "- Vite or Next.js frontend",
    "- Serverless endpoint or lightweight API",
    "- Automated tests for health status and failure handling",
    "",
    "ACCEPTANCE CRITERIA",
    ...acceptanceCriteria.map((item) => `- ${item}`),
    "",
    "TESTING",
    "- Unit tests for status calculation",
    "- E2E test that loads the dashboard and checks the health endpoint",
    "- Production build must pass",
    "",
    "DEPLOYMENT",
    "- Deploy publicly",
    "- Store final URL in README",
    "- Do not commit secrets",
    "",
    "DOCUMENTATION",
    "- Include architecture diagram, operating assumptions, and failure scenario notes",
    "",
    "STOP CONDITIONS",
    "- Stop if deployment requires credentials you do not have",
    "- Stop if a command would expose a secret",
    "- Stop if the repository is not clean enough to distinguish new work"
  ].join("\n");

  return {
    id: `mission-${targetGap}`,
    title: missionTitle,
    targetGap: "Cloud deployment evidence",
    whyThisMatters: `${profile.name} already has support and automation signals. This mission turns those signals into inspectable deployment evidence.`,
    targetSkills: missionSkills,
    estimatedHours: "8-12 hours",
    difficulty: "intermediate",
    prerequisites: ["Basic JavaScript or TypeScript", "GitHub account", "A deployment target such as Netlify"],
    deliverables,
    acceptanceCriteria,
    rubric: [
      "Technical completion",
      "Architecture quality",
      "Reliability thinking",
      "Deployment quality",
      "Documentation",
      "Evidence strength"
    ],
    stretchChallenge: "Add incident history and a postmortem template for one simulated outage.",
    completionEvidence: ["Public URL", "Repository URL", "README architecture section", "Screenshots of healthy and degraded states"],
    reflectionPrompts: [
      "Which part most clearly proves cloud readiness?",
      "What would an interviewer still doubt after reviewing this?",
      "What should be improved before sharing it?"
    ],
    codexBrief
  };
}
