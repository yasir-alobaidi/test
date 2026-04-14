/**
 * Findings module – TypeScript interfaces & Adapter function.
 */

// ---------------------------------------------------------------------------
// Internal (UI) types
// ---------------------------------------------------------------------------
export interface Finding {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignee: string;
  detectedAt: string;
}

// ---------------------------------------------------------------------------
// External API shape
// ---------------------------------------------------------------------------
export interface ExternalFindingResponse {
  finding_id: string;
  finding_title: string;
  severity_level: string;
  current_status: string;
  assigned_to: string;
  detected_at: string;
}

// ---------------------------------------------------------------------------
// Adapter – maps external → internal
// ---------------------------------------------------------------------------
function normalizeSeverity(raw: string): Finding["severity"] {
  const lower = raw.toLowerCase();
  if (lower === "critical" || lower === "high" || lower === "medium" || lower === "low") {
    return lower;
  }
  return "low";
}

function normalizeStatus(raw: string): Finding["status"] {
  const lower = raw.toLowerCase().replace(/\s+/g, "_");
  if (lower === "open" || lower === "in_progress" || lower === "resolved" || lower === "closed") {
    return lower;
  }
  return "open";
}

export function adaptFinding(raw: ExternalFindingResponse): Finding {
  return {
    id: raw.finding_id,
    title: raw.finding_title,
    severity: normalizeSeverity(raw.severity_level),
    status: normalizeStatus(raw.current_status),
    assignee: raw.assigned_to,
    detectedAt: new Date(raw.detected_at).toLocaleDateString(),
  };
}

export function adaptFindings(raw: ExternalFindingResponse[]): Finding[] {
  return raw.map(adaptFinding);
}
