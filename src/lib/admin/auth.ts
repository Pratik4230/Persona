export function getAdminEmail(): string | null {
  const email = process.env.ADMIN_EMAIL?.trim();
  return email ? email.toLowerCase() : null;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const adminEmail = getAdminEmail();
  if (!adminEmail || !email) {
    return false;
  }
  return email.toLowerCase() === adminEmail;
}
