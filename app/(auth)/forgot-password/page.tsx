import { Suspense } from "react";

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">Loading...</div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
