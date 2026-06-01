import { Suspense } from "react";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">Loading...</div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
