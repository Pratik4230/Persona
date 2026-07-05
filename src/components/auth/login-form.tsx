"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";

export function LoginForm() {
  return (
    <AuthShell
      description="Sign in with Google or GitHub to chat with Hitesh and Piyush personas."
      title="Welcome back"
    >
      <SocialAuthButtons />
    </AuthShell>
  );
}
