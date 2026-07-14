/**
 * Publishes workspace packages whose local version isn't yet on the npm registry, using npm
 * trusted publishing (OIDC) — see .github/workflows/publish.yml. Run from CI after
 * `npm run build:packages`. Adapted from jspsych/jspsych-multiplayer.
 *
 * Why not `changeset publish`? A brand-new package can't be published over OIDC: npm has no
 * trusted-publisher config for a package that doesn't exist yet, so `npm publish` falls back to
 * token auth and fails with ENEEDAUTH — which would red-X this workflow on every push until a
 * maintainer does the one-time bootstrap. This script instead SKIPS any package that isn't on the
 * registry yet, so onboarding a new package leaves `main` green. Once a package exists and has a
 * trusted publisher configured, its future version bumps publish here automatically over OIDC.
 *
 * Trade-off vs. `changeset publish`: this does not create git tags. Versioning is still handled by
 * changesets (the "Version Packages" PR); only the publish step differs.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

function pkgJsonPath(dir) {
  return fileURLToPath(new URL(`../packages/${dir}/package.json`, import.meta.url));
}

const packagesDir = fileURLToPath(new URL("../packages/", import.meta.url));

const packages = readdirSync(packagesDir)
  .filter((dir) => existsSync(pkgJsonPath(dir)))
  .map((dir) => JSON.parse(readFileSync(pkgJsonPath(dir), "utf8")))
  .filter((json) => !json.private && json.name && json.version);

let publishedAny = false;

for (const { name, version } of packages) {
  let publishedVersions = null;
  try {
    const out = execFileSync("npm", ["view", name, "versions", "--json"], {
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const parsed = JSON.parse(out);
    publishedVersions = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // `npm view` exits non-zero (E404) when the package doesn't exist on the registry yet.
    // npm supports pre-configuring a trusted publisher for a new package (`npm trust`), and a
    // trusted-publishing first publish can then create it — so attempt the publish, but don't
    // fail the whole job if this package's trust hasn't been bootstrapped yet.
  }

  if (publishedVersions?.includes(version)) {
    console.log(`skip ${name}@${version}: already published.`);
    continue;
  }

  const isNew = publishedVersions === null;
  console.log(`publishing ${name}@${version} via OIDC${isNew ? " (new package)" : ""}...`);
  try {
    execFileSync("npm", ["publish", "-w", name, "--access", "public"], { stdio: "inherit" });
    publishedAny = true;
  } catch (error) {
    if (!isNew) {
      throw error;
    }
    console.log(
      `skip ${name}: first publish failed — configure a trusted publisher for it ` +
        `(npm trust github ${name} --file publish.yml --repo <owner/repo> --allow-publish) ` +
        `or do a one-time manual npm publish.`
    );
  }
}

if (!publishedAny) {
  console.log("Nothing to publish.");
}
