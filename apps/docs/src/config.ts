import dotenv from "dotenv";
const envPath = [__dirname, "../.env.local"].join("/");
dotenv.config();
dotenv.config({ path: envPath, override: true });

/**
 * Mark an environment as required for the build.
 * This is mostly used for convenience of debugging, so that things break early
 * Note: this should only be used for environment variables prefixed with "NEXT_PUBLIC_".
 *  Client-side bundles will be missing other env variables by definition
 */
export const requireEnv = (value: string | undefined, identifier: string) => {
  if (!value) {
    throw new Error(`Required env var ${identifier} does not exist`);
  }
  return value;
};

export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const URL = requireEnv(process.env.DOCS_URL, "DOCS_URL");
export const ALGOLIA_APP_ID = requireEnv(
  process.env.DOCS_ALGOLIA_APP_ID,
  "DOCS_ALGOLIA_APP_ID",
);
export const ALGOLIA_API_KEY = requireEnv(
  process.env.DOCS_ALGOLIA_API_KEY,
  "DOCS_ALGOLIA_API_KEY",
);
export const ALGOLIA_INDEX = requireEnv(
  process.env.DOCS_ALGOLIA_INDEX,
  "DOCS_ALGOLIA_INDEX",
);
export const GOOGLE_ANALYTICS_KEY = requireEnv(
  process.env.DOCS_GOOGLE_ANALYTICS_KEY,
  "DOCS_GOOGLE_ANALYTICS_KEY",
);
