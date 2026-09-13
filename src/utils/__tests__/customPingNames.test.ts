import { describe, expect, it } from "vitest";
import { nodePingTaskName } from "@/utils/customPingNames";

describe("nodePingTaskName", () => {
  it("renames the three Ganbeiyun routes", () => {
    const uuid = "e4ab883d-ef3a-46ff-8468-f5800e93f5b1";
    expect(nodePingTaskName(uuid, 1, "电信")).toBe("VMISS");
    expect(nodePingTaskName(uuid, 2, "联通")).toBe("V.PS");
    expect(nodePingTaskName(uuid, 3, "移动")).toBe("QQG");
  });

  it("does not rename another node or an unmapped task", () => {
    expect(nodePingTaskName("another-node", 1, "电信")).toBe("电信");
    expect(
      nodePingTaskName("e4ab883d-ef3a-46ff-8468-f5800e93f5b1", 4, "BD"),
    ).toBe("BD");
  });
});
