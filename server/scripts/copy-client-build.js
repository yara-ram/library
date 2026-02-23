import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, "..", "..");
const clientDist = path.resolve(repoRoot, "client", "dist");
const serverPublic = path.resolve(repoRoot, "server", "public");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

if (!fs.existsSync(clientDist)) {
  console.error(`client dist not found at ${clientDist}. Did you run client build?`);
  process.exit(1);
}

fs.rmSync(serverPublic, { recursive: true, force: true });
copyDir(clientDist, serverPublic);
console.log(`Copied client build to ${serverPublic}`);

