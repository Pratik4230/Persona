import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      // Generated agent-guidance scripts dropped by the AI Elements CLI
      ".agents/**",
      // Generated component source (shadcn/ui + Vercel AI Elements)
      "src/components/ui/**",
      "src/components/ai-elements/**",
    ],
  },
  ...nextCoreWebVitals,
];

export default eslintConfig;
