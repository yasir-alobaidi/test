/**
 * Users module – TypeScript interfaces & Adapter function.
 *
 * The Adapter pattern maps raw external API responses to strictly
 * typed internal interfaces so the UI never depends on API shape.
 */

// ---------------------------------------------------------------------------
// Internal (UI) types
// ---------------------------------------------------------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: string;
}

// ---------------------------------------------------------------------------
// External API shape (what the API actually returns)
// ---------------------------------------------------------------------------
export interface ExternalUserResponse {
  user_id: string;
  full_name: string;
  email_address: string;
  user_role: string;
  is_active: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Adapter – maps external → internal
// ---------------------------------------------------------------------------
export function adaptUser(raw: ExternalUserResponse): User {
  return {
    id: raw.user_id,
    name: raw.full_name,
    email: raw.email_address,
    role: raw.user_role,
    status: raw.is_active ? "active" : "inactive",
    createdAt: new Date(raw.created_at).toLocaleDateString(),
  };
}

export function adaptUsers(raw: ExternalUserResponse[]): User[] {
  return raw.map(adaptUser);
}
