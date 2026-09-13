/**
 * Per-node ping labels for this deployment.
 *
 * The backend still stores the standard carrier slots (CT/CU/CM).  Only the
 * presentation changes for explicitly listed nodes, so every other server
 * continues to use the site-wide carrier names.
 */
const NODE_PING_NAMES: Readonly<Record<string, Readonly<Record<number, string>>>> = {
  "e4ab883d-ef3a-46ff-8468-f5800e93f5b1": {
    1: "VMISS",
    2: "V.PS",
    3: "QQG",
  },
};

export function nodePingTaskName(
  uuid: string,
  taskId: number,
  fallback: string,
): string {
  return NODE_PING_NAMES[uuid]?.[taskId] ?? fallback;
}
