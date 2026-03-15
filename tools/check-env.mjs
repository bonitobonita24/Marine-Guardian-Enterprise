#!/usr/bin/env node
// tools/check-env.mjs — Pre-flight environment variable check
const REQUIRED = [
  "DATABASE_URL",
  "DIRECT_DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "REDIS_HOST",
  "STORAGE_ENDPOINT",
  "STORAGE_ACCESS_KEY",
  "STORAGE_SECRET_KEY",
  "STORAGE_BUCKET",
];

const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error("❌ Missing required environment variables:");
  missing.forEach((k) => console.error(`  - ${k}`));
  process.exit(1);
}
console.log("✅ All required environment variables are set");
