import type { ProfileDTO } from "@/lib/types/profile";
import type {
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignupInput,
} from "@/lib/validators/auth";

type ApiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorResponse;
    return data.error?.message ?? "Something went wrong";
  } catch {
    return "Something went wrong";
  }
}

export async function login(
  input: LoginInput,
): Promise<{ user: ProfileDTO }> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function signup(
  input: SignupInput,
): Promise<{ user: ProfileDTO }> {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export async function getSession(): Promise<{ user: ProfileDTO | null }> {
  const response = await fetch("/api/auth/session");
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<{ message: string }> {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function updatePassword(
  input: ResetPasswordInput,
): Promise<{ message: string }> {
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function validateInvite(
  code: string,
): Promise<{ valid: true; description?: string }> {
  const response = await fetch("/api/invites/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}
