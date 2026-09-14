import { describe, expect, it } from "vitest";
import { nodePingTaskName } from "@/utils/customPingNames";

describe("nodePingTaskName", () => {
  it("keeps the site-wide carrier names for Ganbeiyun", () => {
    const uuid = "e4ab883d-ef3a-46ff-8468-f5800e93f5b1";
    expect(nodePingTaskName(uuid, 1, "电信")).toBe("电信");
    expect(nodePingTaskName(uuid, 2, "联通")).toBe("联通");
    expect(nodePingTaskName(uuid, 3, "移动")).toBe("移动");
  });

  it("does not rename another node or an unmapped task", () => {
    expect(nodePingTaskName("another-node", 1, "电信")).toBe("电信");
    expect(
      nodePingTaskName("e4ab883d-ef3a-46ff-8468-f5800e93f5b1", 4, "BD"),
    ).toBe("BD");
  });
});
