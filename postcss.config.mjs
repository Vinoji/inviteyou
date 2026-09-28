import { fileURLToPath } from "node:url";

// Local plugin, referenced by absolute path (Next resolves plugin names
// with require, which doesn't see paths relative to this file).
const cqFallback = fileURLToPath(new URL("./postcss-cq-fallback.cjs", import.meta.url));

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    // Viewport fallbacks for container-query units, for older phones.
    [cqFallback]: {},
  },
};

export default config;
