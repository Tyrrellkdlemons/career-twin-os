import { roleCatalog } from "../../data/occupations";
import type { RoleId } from "../../types";
import type { MarketAdapter, OccupationSignal } from "./marketAdapter";

export const localOccupationAdapter: MarketAdapter = {
  source: "local-fallback",
  async getOccupationSignal(roleId: RoleId): Promise<OccupationSignal> {
    const role = roleCatalog[roleId];
    return {
      roleId,
      title: role.title,
      marketSignal: role.marketSignal,
      stabilitySignal: role.stabilitySignal,
      source: "local-fallback",
      confidence: "moderate",
      notes: [
        "Deterministic local fallback derived from the product role catalog.",
        "Use O*NET and BLS adapters for official data enrichment when server credentials and series choices are configured."
      ],
      updatedAt: new Date(0).toISOString()
    };
  }
};
