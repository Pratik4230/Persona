"use client";

import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth/client";
import { profileSchema } from "@/lib/validations/auth";

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio: string;
  createdAt: string;
}

async function fetchProfile(): Promise<ProfileUser> {
  const response = await fetch("/api/user/profile");
  const data = (await response.json()) as { user?: ProfileUser; error?: string };
  if (!response.ok || !data.user) {
    throw new Error(data.error ?? "Failed to load profile");
  }
  return data.user;
}

export function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchProfile,
  });

  const form = useForm({
    defaultValues: {
      name: "",
      bio: "",
    },
    validators: { onSubmit: profileSchema },
    onSubmit: async ({ value }) => {
      setSaving(true);
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      setSaving(false);

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        toast.error(data.error ?? "Could not update profile");
        return;
      }

      toast.success("Profile updated");
      void queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  useEffect(() => {
    if (profile) {
      form.setFieldValue("name", profile.name);
      form.setFieldValue("bio", profile.bio);
    }
  }, [profile, form]);

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push("/")} variant="ghost">
            ← Back to chat
          </Button>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-lg space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Profile</h1>
          <p className="text-muted-foreground text-sm">
            Manage your account details.
          </p>
        </div>

        {isLoading || !profile ? (
          <p className="text-muted-foreground text-sm">Loading profile…</p>
        ) : (
          <>
            <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
              <Avatar className="size-14">
                <AvatarImage alt={profile.name} src={profile.image ?? undefined} />
                <AvatarFallback>
                  {profile.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{profile.name}</p>
                <p className="truncate text-muted-foreground text-sm">
                  {profile.email}
                </p>
              </div>
            </div>

            <form
              className="space-y-4 rounded-xl border bg-card p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void form.handleSubmit();
              }}
            >
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-1.5">
                    <label className="font-medium text-sm" htmlFor={field.name}>
                      Display name
                    </label>
                    <Input
                      id={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      value={field.state.value}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="bio">
                {(field) => (
                  <div className="space-y-1.5">
                    <label className="font-medium text-sm" htmlFor={field.name}>
                      Bio
                    </label>
                    <Textarea
                      id={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="A short bio (optional)"
                      rows={3}
                      value={field.state.value}
                    />
                  </div>
                )}
              </form.Field>

              <Button disabled={saving} type="submit">
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </form>

            <Button className="w-full" onClick={() => void signOut()} variant="outline">
              Sign out
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
