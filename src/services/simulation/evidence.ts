import type { CareerEvidence, EvidenceLabel } from "../../types";

export function classifyEvidence(evidence: Pick<CareerEvidence, "type" | "supportCount" | "needsEvidence">): EvidenceLabel {
  if (evidence.needsEvidence) {
    return "NEEDS EVIDENCE";
  }

  if (evidence.type === "claim" && evidence.supportCount === 0) {
    return "SELF-REPORTED";
  }

  if (evidence.supportCount >= 3) {
    return "STRONG EVIDENCE";
  }

  return "SUPPORTED";
}

export interface ParsedGitHubRepository {
  owner: string;
  repo: string;
  normalizedUrl: string;
}

export function parseGitHubRepositoryUrl(value: string): ParsedGitHubRepository | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com") {
      return null;
    }

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 2) {
      return null;
    }

    const [owner, repo] = parts;
    const safeSegment = /^[A-Za-z0-9_.-]+$/;
    if (!safeSegment.test(owner) || !safeSegment.test(repo)) {
      return null;
    }

    return {
      owner,
      repo,
      normalizedUrl: `https://github.com/${owner}/${repo.replace(/\.git$/i, "")}`
    };
  } catch {
    return null;
  }
}
