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
      "This specific credentialed adapter is unavailable in the current environment.",
      "The default /api/market server-side path uses public data sources without exposing browser secrets."
    ],
    updatedAt: new Date(0).toISOString()
  };
}
