import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import fulbito from "@fulbito/eslint-config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const scriptFiles = ["**/*.{js,jsx,mjs,cjs,ts,tsx}"];

const withScriptFiles = (configs) => configs.map((config) => ({ ...config, files: scriptFiles }));

const eslintConfig = [
  ...withScriptFiles(compat.extends("next/core-web-vitals", "next/typescript")),
  ...withScriptFiles(fulbito.configs.recommended),
  ...fulbito.configs.css,
  {
    files: ["scripts/**/*.mjs"],
    rules: {
      "fulbito/no-comments": "off",
    },
  },
  {
    files: ["src/app/api/**/*.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
