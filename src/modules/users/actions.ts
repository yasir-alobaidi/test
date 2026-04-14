"use server";

/**
 * Users module – Server Actions (BFF layer).
 *
 * Every function here runs exclusively on the server.
 * External API tokens are never exposed to the client.
 */

import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import {
  adaptUsers,
  type ExternalUserResponse,
  type CreateUserPayload,
  type User,
} from "./types";

// ---------------------------------------------------------------------------
// Fetch all users
// ---------------------------------------------------------------------------
export async function fetchUsers(): Promise<{
  users: User[];
  error: string | null;
}> {
  const session = await getSession();
  if (!session) {
    return { users: [], error: "Unauthorized – please log in." };
  }

  const { data, error } = await apiFetch<ExternalUserResponse[]>("/users", {
    token: session.token,
    tenantId: session.tenantId,
  });

  if (error || !data) {
    return { users: [], error: error ?? "Failed to fetch users." };
  }

  return { users: adaptUsers(data), error: null };
}

// ---------------------------------------------------------------------------
// Create user
// ---------------------------------------------------------------------------
export async function createUser(
  payload: CreateUserPayload
): Promise<{ success: boolean; error: string | null }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized – please log in." };
  }

  const { error } = await apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(payload),
    token: session.token,
    tenantId: session.tenantId,
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true, error: null };
}

// ---------------------------------------------------------------------------
// Delete user
// ---------------------------------------------------------------------------
export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized – please log in." };
  }

  const { error } = await apiFetch(`/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    token: session.token,
    tenantId: session.tenantId,
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true, error: null };
}
