import { roleCatalog } from "../../data/occupations";
import type { RoleId } from "../../types";
import type { MarketAdapter, OccupationSignal } from "./marketAdapter";
import { unavailableSignal } from "./marketAdapter";

export const onetAdapter: MarketAdapter = {
  source: "onet",
  async getOccupationSignal(roleId: RoleId): Promise<OccupationSignal> {
    const role = roleCatalog[roleId];
    return unavailableSignal(roleId, role.title, "onet-unavailable");
  }
};
