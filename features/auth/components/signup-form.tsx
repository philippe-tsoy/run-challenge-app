"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup, validateInvite } from "@/features/auth/lib/api";
import { signupSchema, type SignupInput } from "@/lib/validators/auth";

export function SignupForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>();

  async function handleInviteCheck() {
    setInviteStatus(null);
    setFormError(null);

    const code = getValues("inviteCode")?.trim();
    if (!code) {
      setInviteStatus("Enter an invite code first");
      return;
    }

    try {
      const result = await validateInvite(code);
      setInviteStatus(result.description ?? "Invite code is valid");
    } catch (error) {
      setInviteStatus(
        error instanceof Error ? error.message : "Invalid invite code",
      );
    }
  }

  async function onSubmit(values: SignupInput) {
    setFormError(null);

    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string") {
          setError(field as keyof SignupInput, { message: issue.message });
        }
      });
      return;
    }

    try {
      await signup(parsed.data);
      router.push("/app");
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to create account",
      );
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Join the fellowship</CardTitle>
        <CardDescription>
          Create your account with a valid invite code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite code</Label>
            <div className="flex gap-2">
              <Input
                id="inviteCode"
                autoComplete="off"
                {...register("inviteCode")}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleInviteCheck}
              >
                Check
              </Button>
            </div>
            {errors.inviteCode ? (
              <p className="text-destructive text-sm">
                {errors.inviteCode.message}
              </p>
            ) : null}
            {inviteStatus ? (
              <p className="text-muted-foreground text-sm">{inviteStatus}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              {...register("username")}
            />
            {errors.username ? (
              <p className="text-destructive text-sm">
                {errors.username.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-destructive text-sm">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {formError ? (
            <p className="text-destructive text-sm">{formError}</p>
          ) : null}

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            className="text-foreground underline-offset-4 hover:underline"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
