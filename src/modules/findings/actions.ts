"use server";

/**
 * Findings module – Server Actions (BFF layer).
 *
 * Every function here runs exclusively on the server.
 * External API tokens are never exposed to the client.
 */

import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import {
  adaptFindings,
  type ExternalFindingResponse,
  type Finding,
} from "./types";

// ---------------------------------------------------------------------------
// Fetch all findings
// ---------------------------------------------------------------------------
export async function fetchFindings(): Promise<{
  findings: Finding[];
  error: string | null;
}> {
  const session = await getSession();
  if (!session) {
    return { findings: [], error: "Unauthorized – please log in." };
  }

  const { data, error } = await apiFetch<ExternalFindingResponse[]>(
    "/findings",
    {
      token: session.token,
      tenantId: session.tenantId,
    }
  );

  if (error || !data) {
    return { findings: [], error: error ?? "Failed to fetch findings." };
  }

  return { findings: adaptFindings(data), error: null };
}

// ---------------------------------------------------------------------------
// Update finding status
// ---------------------------------------------------------------------------
export async function updateFindingStatus(
  findingId: string,
  status: string
): Promise<{ success: boolean; error: string | null }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized – please log in." };
  }

  const { error } = await apiFetch(
    `/findings/${encodeURIComponent(findingId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
      token: session.token,
      tenantId: session.tenantId,
    }
  );

  if (error) {
    return { success: false, error };
  }

  return { success: true, error: null };
}
