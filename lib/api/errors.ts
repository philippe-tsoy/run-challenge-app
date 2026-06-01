import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "BUSINESS_RULE_VIOLATION"
  | "INTERNAL_ERROR";

type ErrorOptions = {
  code: ApiErrorCode;
  message: string;
  status: number;
  details?: Record<string, unknown>;
};

export function apiError({
  code,
  message,
  status,
  details,
}: ErrorOptions): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details: details ?? {},
      },
    },
    { status },
  );
}

export function validationError(
  message: string,
  details?: Record<string, unknown>,
): NextResponse {
  return apiError({
    code: "VALIDATION_ERROR",
    message,
    status: 400,
    details,
  });
}

export function unauthorizedError(
  message = "Not authenticated",
): NextResponse {
  return apiError({ code: "UNAUTHORIZED", message, status: 401 });
}

export function forbiddenError(message = "Forbidden"): NextResponse {
  return apiError({ code: "FORBIDDEN", message, status: 403 });
}

export function notFoundError(message = "Not found"): NextResponse {
  return apiError({ code: "NOT_FOUND", message, status: 404 });
}

export function conflictError(message: string): NextResponse {
  return apiError({ code: "CONFLICT", message, status: 409 });
}

export function businessRuleError(message: string): NextResponse {
  return apiError({
    code: "BUSINESS_RULE_VIOLATION",
    message,
    status: 422,
  });
}
