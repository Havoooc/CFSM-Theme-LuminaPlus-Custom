import { describe, expect, it } from "vitest";
import {
  RETURN_ROUTE_QUALITY_LABEL,
  classifyReturnRoute,
  returnRouteTitle,
} from "@/utils/returnRoute";

describe("classifyReturnRoute", () => {
  it("grades premium international return routes as excellent", () => {
    for (const label of ["CN2GIA", "CN2", "9929", "CMIN2"]) {
      expect(classifyReturnRoute(label)).toBe("excellent");
    }
  });

  it("grades 10099 and CMI as good", () => {
    for (const label of ["10099", "CMI"]) {
      expect(classifyReturnRoute(label)).toBe("good");
    }
  });

  it("grades 4837 / CMNET / 普通国际 as standard", () => {
    for (const label of ["4837", "CMNET", "普通国际"]) {
      expect(classifyReturnRoute(label)).toBe("standard");
    }
  });

  it("grades domestic paths as excellent, not standard", () => {
    // 国内直连实测 15~21ms、零丢包；落到 standard 会显示成「一般」，
    // 与真实质量相反。
    for (const label of ["国内电信", "国内联通", "国内移动"]) {
      expect(classifyReturnRoute(label)).toBe("excellent");
    }
  });

  it("tolerates surrounding whitespace and case", () => {
    expect(classifyReturnRoute("  cn2gia  ")).toBe("excellent");
    expect(classifyReturnRoute(" 国内电信 ")).toBe("excellent");
  });

  it("does not treat 未知 or empty values as excellent", () => {
    expect(classifyReturnRoute("未知")).toBe("standard");
    expect(classifyReturnRoute("")).toBe("standard");
  });
});

describe("returnRouteTitle", () => {
  it("says 回程线路 for international routes", () => {
    expect(returnRouteTitle("CN2GIA", "excellent")).toBe("回程线路：CN2GIA，优质");
  });

  it("drops the 回程 prefix for domestic routes", () => {
    // 国内节点不存在国际回程，「回程线路：国内电信」自相矛盾。
    expect(returnRouteTitle("国内电信", "excellent")).toBe("线路：国内电信，优质");
  });

  it("uses the same quality labels as the badge", () => {
    expect(RETURN_ROUTE_QUALITY_LABEL.excellent).toBe("优质");
    expect(RETURN_ROUTE_QUALITY_LABEL.good).toBe("良好");
    expect(RETURN_ROUTE_QUALITY_LABEL.standard).toBe("一般");
  });

  it("appends stale warning, relative time, and reason when meta is provided", () => {
    const title = returnRouteTitle("CMI", "good", {
      confidence: "stale",
      reason: "保留旧值（本次无结论）",
      probedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    });
    expect(title).toContain("回程线路：CMI，良好");
    expect(title).toContain("（陈旧缓存/本次无结论）");
    expect(title).toContain("检测于 1小时前");
    expect(title).toContain("依据：保留旧值（本次无结论）");
  });
});
