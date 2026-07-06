import type { RoleId } from "../../types";

export type MarketConfidence = "low" | "moderate" | "strong";

export interface OccupationSignal {
  roleId: RoleId;
  title: string;
  marketSignal: number;
  stabilitySignal: number;
  source: string;
  confidence: MarketConfidence;
  notes: string[];
  updatedAt: string;
}

export interface MarketAdapter {
  source: string;
  getOccupationSignal(roleId: RoleId): Promise<OccupationSignal>;
}

export function unavailableSignal(roleId: RoleId, title: string, source: string): OccupationSignal {
  return {
    roleId,
    title,
    marketSignal: 0,
    stabilitySignal: 0,
    source,
    confidence: "low",
    notes: [
      "Live market lookup requires a server-side adapter so credentials and series choices are not exposed to the browser.",
      "The app falls back to deterministic local simulation when live credentials are unavailable."
    ],
    updatedAt: new Date(0).toISOString()
  };
}
