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
        "Deterministic baseline derived from the product role catalog.",
        "The deployed public-data router enriches this baseline with GitHub, OpenAlex, World Bank, and Data.gov signals."
      ],
      updatedAt: new Date(0).toISOString()
    };
  }
};
