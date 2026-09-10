import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: an unrelated lockfile sits in the home directory
  // and Turbopack would otherwise walk up to it.
  turbopack: { root: path.resolve(process.cwd()) },
  devIndicators: false,
  // Next regenerates AGENTS.md/CLAUDE.md on dev, which would overwrite the
  // repository's own CLAUDE.md. Next 16 guidance lives in
  // node_modules/next/dist/docs/ if you need it.
  agentRules: false,
};

export default nextConfig;
