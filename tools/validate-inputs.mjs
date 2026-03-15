#!/usr/bin/env node
// tools/validate-inputs.mjs — Validates inputs.yml against inputs.schema.json
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import yaml from "js-yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const schema = JSON.parse(readFileSync(resolve(root, "inputs.schema.json"), "utf8"));
const inputs = yaml.load(readFileSync(resolve(root, "inputs.yml"), "utf8"));

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const valid = validate(inputs);

if (!valid) {
  console.error("❌ inputs.yml validation failed:");
  for (const err of validate.errors ?? []) {
    console.error(`  ${err.instancePath} ${err.message}`);
  }
  process.exit(1);
}

console.log("✅ inputs.yml is valid");
