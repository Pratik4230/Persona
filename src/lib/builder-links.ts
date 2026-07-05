export interface BuilderLink {
  label: string;
  href: string;
}

export const BUILDER = {
  name: "Pratik Jadhav",
  socials: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/pratikjadhav1438/",
    },
    { label: "X", href: "https://x.com/Pratik4230" },
  ] satisfies BuilderLink[],
  product: {
    name: "AiXpense",
    tagline: "AI expense tracker for India",
    links: [
      { label: "aixpense.in", href: "https://aixpense.in" },
      {
        label: "Play Store",
        href: "https://play.google.com/store/apps/details?id=com.aixpense.app",
      },
    ] satisfies BuilderLink[],
  },
} as const;
