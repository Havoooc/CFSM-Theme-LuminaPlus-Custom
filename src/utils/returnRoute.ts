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

export function formatRelativeTime(value: string | number | null | undefined): string | null {
  if (!value) return null;
  const time = typeof value === "string" ? new Date(value).getTime() : value;
  if (!Number.isFinite(time) || time <= 0) return null;
  const diffSec = Math.floor((Date.now() - time) / 1000);
  if (diffSec < 60) return "刚刚";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}小时前`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}天前`;
}

export interface ReturnRouteMeta {
  carrierKey?: "telecom" | "unicom" | "mobile";
  confidence?: string;
  reason?: string;
  probedAt?: string;
}

/** 国内节点不存在「国际回程」，措辞上避免出现「回程线路：国内电信」这种自相矛盾。 */
export function returnRouteTitle(
  label: string,
  quality: ReturnRouteQuality,
  meta?: ReturnRouteMeta
): string {
  const prefix = label.trim().startsWith("国内") ? "线路" : "回程线路";
  const parts: string[] = [`${prefix}：${label}，${RETURN_ROUTE_QUALITY_LABEL[quality]}`];

  if (meta?.confidence === "stale") {
    parts.push("（陈旧缓存/本次无结论）");
  }

  if (meta?.probedAt) {
    const rel = formatRelativeTime(meta.probedAt);
    if (rel) {
      parts.push(`检测于 ${rel}`);
    }
  }

  if (meta?.reason) {
    parts.push(`依据：${meta.reason}`);
  }

  return parts.join(" · ");
}
