"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { BuilderCredits } from "@/components/builder-credits";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";

export function LoginForm() {
  return (
    <AuthShell
      description="Sign in with Google or GitHub to chat with Hitesh and Piyush personas."
      footer={<BuilderCredits variant="login" />}
      title="Welcome back"
    >
      <SocialAuthButtons />
    </AuthShell>
  );
}
