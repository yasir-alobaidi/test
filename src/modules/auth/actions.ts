"use server";

/**
 * Auth Server Action – BFF layer for login.
 * Handles external API authentication and stores the token in a secure cookie.
 */

import { apiFetch } from "@/lib/api";
import { setSession, clearSession } from "@/lib/session";
import { redirect } from "next/navigation";

interface LoginPayload {
  email: string;
  password: string;
  tenantId: string;
}

interface ExternalLoginResponse {
  access_token: string;
  tenant_id: string;
}

export async function loginAction(formData: FormData) {
  const payload: LoginPayload = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    tenantId: formData.get("tenantId") as string,
  };

  const { data, error } = await apiFetch<ExternalLoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (error || !data) {
    return { error: error ?? "Login failed. Please try again." };
  }

  await setSession({
    token: data.access_token,
    tenantId: data.tenant_id,
  });

  redirect("/dashboard/findings");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
