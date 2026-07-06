import { describe, expect, it } from "vitest";
import { blsAdapter } from "../src/services/market/blsAdapter";
import { localOccupationAdapter } from "../src/services/market/localOccupationAdapter";
import { onetAdapter } from "../src/services/market/onetAdapter";

describe("market data adapters", () => {
  it("uses a common interface across local, O*NET, and BLS adapters", async () => {
    const adapters = [localOccupationAdapter, onetAdapter, blsAdapter];

    for (const adapter of adapters) {
      expect(typeof adapter.getOccupationSignal).toBe("function");
      expect(typeof adapter.source).toBe("string");
    }

    const local = await localOccupationAdapter.getOccupationSignal("cloud-engineer");
    expect(local.title).toBe("Cloud Engineer");
    expect(local.source).toBe("local-fallback");
    expect(local.confidence).toBe("moderate");
  });

  it("does not require browser-exposed secrets for live adapters", async () => {
    const onet = await onetAdapter.getOccupationSignal("cloud-engineer");
    const bls = await blsAdapter.getOccupationSignal("cloud-engineer");

    expect(onet.source).toBe("onet-unavailable");
    expect(bls.source).toBe("bls-unavailable");
    expect(onet.notes.join(" ")).toMatch(/server-side/i);
    expect(bls.notes.join(" ")).toMatch(/server-side/i);
  });
});
