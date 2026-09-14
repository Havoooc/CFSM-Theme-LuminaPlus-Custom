/**
 * 回程线路徽章的分级与文案。
 *
 * 值域由后端探针决定（见 CF-Server-Monitor 的 RETURN_ROUTE_ALLOWED_VALUES）：
 *  - 国际回程语义：CN2GIA / CN2GT / CN2 / 9929 / 10099 / 4837 / CMIN2 / CMI / CMNET / 普通国际
 *    只对境外节点成立。
 *  - 国内路径语义：国内电信 / 国内联通 / 国内移动
 *    用于探测路径全程落在境内的节点（如阿里云杭州）。这类节点不存在国际回程，
 *    用国际词表会得出「普通国际」这种字面错误的结论。
 */
export type ReturnRouteQuality = "excellent" | "good" | "standard";

export const RETURN_ROUTE_QUALITY_LABEL: Record<ReturnRouteQuality, string> = {
  excellent: "优质",
  good: "良好",
  standard: "一般",
};

export function classifyReturnRoute(label: string): ReturnRouteQuality {
  const normalized = label.trim().toUpperCase().replace(/\s+/g, "");
  // 国内路径：全程落在境内，实测 15~21ms 且零丢包，属于最优档。
  // 不能落到 standard，否则会被显示成「一般」，与真实质量相反。
  if (normalized.startsWith("国内")) {
    return "excellent";
  }
  if (
    normalized.includes("CN2GIA") ||
    normalized === "CN2" ||
    normalized.includes("9929") ||
    normalized.includes("CMIN2")
  ) {
    return "excellent";
  }
  if (normalized.includes("10099") || normalized === "CMI") {
    return "good";
  }
  return "standard";
}

/** 国内节点不存在「国际回程」，措辞上避免出现「回程线路：国内电信」这种自相矛盾。 */
export function returnRouteTitle(label: string, quality: ReturnRouteQuality): string {
  const prefix = label.trim().startsWith("国内") ? "线路" : "回程线路";
  return `${prefix}：${label}，${RETURN_ROUTE_QUALITY_LABEL[quality]}`;
}
