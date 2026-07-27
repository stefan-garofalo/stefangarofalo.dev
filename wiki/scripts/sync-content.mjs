import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultWikiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export class SyncContentError extends Error {
  constructor(changes) {
    super("Synced wiki content is stale:\n" + changes.map((change) => "- " + change).join("\n"));
    this.name = "SyncContentError";
    this.changes = changes;
  }
}

export function syncWikiContent({
  wikiRoot = defaultWikiRoot,
  repoRoot = detectRepoRoot(wikiRoot),
  checkOnly = false,
} = {}) {
  const contentRoot = path.join(wikiRoot, "content", "docs");
  const changes = [];
  const topLevelPages = new Set(["project"]);

  if (existsSync(path.join(contentRoot, "wiki"))) topLevelPages.add("wiki");

  syncTree({
    sourceDirectory: path.join(wikiRoot, "specs"),
    targetDirectory: path.join(contentRoot, "project", "specs"),
    title: "Specs",
    contentRoot,
    topLevelPages,
    checkOnly,
    changes,
    wikiRoot,
  });

  if (repoRoot) {
    syncTree({
      sourceDirectory: path.join(repoRoot, "docs", "requirements"),
      targetDirectory: path.join(contentRoot, "project", "requirements"),
      title: "Requirements",
      contentRoot,
      topLevelPages,
      checkOnly,
      changes,
      wikiRoot,
    });
    syncTree({
      sourceDirectory: path.join(repoRoot, "docs", "reference"),
      targetDirectory: path.join(contentRoot, "project", "reference"),
      title: "Reference",
      contentRoot,
      topLevelPages,
      checkOnly,
      changes,
      wikiRoot,
    });
    syncTree({
      sourceDirectory: path.join(repoRoot, "docs", "runbooks"),
      targetDirectory: path.join(contentRoot, "project", "runbooks"),
      title: "Runbooks",
      contentRoot,
      topLevelPages,
      checkOnly,
      changes,
      wikiRoot,
    });
    syncFile({
      sourcePath: path.join(repoRoot, "docs", "tech-decisions.md"),
      targetPath: path.join(contentRoot, "project", "decisions", "tech-decisions.mdx"),
      checkOnly,
      changes,
      wikiRoot,
    });
  }

  mergeMeta(
    contentRoot,
    { title: "Project Docs", pages: orderRootPages(Array.from(topLevelPages)) },
    checkOnly,
    changes,
    wikiRoot,
  );

  mergeMeta(
    path.join(contentRoot, "project"),
    {
      title: "Project",
      description: "Internal project operations",
      pages: [
        "index",
        "grilling",
        "specs",
        "onboarding",
        "public-docs",
        "tech-debt",
        "maintenance",
        "runbooks",
        "decisions",
        "repo-guidance",
        ...(existsSync(path.join(contentRoot, "project", "requirements")) ? ["requirements"] : []),
        ...(existsSync(path.join(contentRoot, "project", "reference")) ? ["reference"] : []),
      ],
    },
    checkOnly,
    changes,
    wikiRoot,
  );

  if (checkOnly && changes.length > 0) throw new SyncContentError(changes);

  return { changes, repoRoot };
}

function detectRepoRoot(wikiRoot) {
  return [path.resolve(wikiRoot, "..", ".."), path.resolve(wikiRoot, "..")].find(
    (candidate) =>
      existsSync(path.join(candidate, "docs")) || existsSync(path.join(candidate, "package.json")),
  );
}

function syncTree({
  sourceDirectory,
  targetDirectory,
  title,
  contentRoot,
  topLevelPages,
  checkOnly,
  changes,
  wikiRoot,
}) {
  if (!existsSync(sourceDirectory)) return;

  copyMarkdownTree(sourceDirectory, targetDirectory, checkOnly, changes, wikiRoot);
  pruneStaleMarkdown(sourceDirectory, targetDirectory, checkOnly, changes, wikiRoot);
  writeMetaTree(targetDirectory, title, checkOnly, changes, wikiRoot);

  const topLevel = path.relative(contentRoot, targetDirectory).split(path.sep)[0];
  if (topLevel) topLevelPages.add(topLevel);
}

function copyMarkdownTree(sourceDirectory, targetDirectory, checkOnly, changes, wikiRoot) {
  for (const entry of readdirSync(sourceDirectory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;

    const sourcePath = path.join(sourceDirectory, entry.name);
    const targetPath = path.join(targetDirectory, entry.name);

    if (entry.isDirectory()) {
      copyMarkdownTree(sourcePath, targetPath, checkOnly, changes, wikiRoot);
      continue;
    }

    if (!entry.isFile() || !isMarkdown(entry.name)) continue;

    syncFile({ sourcePath, targetPath, checkOnly, changes, wikiRoot });
  }
}

function pruneStaleMarkdown(sourceDirectory, targetDirectory, checkOnly, changes, wikiRoot) {
  if (!existsSync(targetDirectory)) return;

  for (const entry of readdirSync(targetDirectory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    if (entry.name === "index.mdx" || entry.name === "meta.json") continue;

    const sourcePath = path.join(sourceDirectory, entry.name);
    const targetPath = path.join(targetDirectory, entry.name);

    if (entry.isDirectory()) {
      if (!existsSync(sourcePath)) {
        removePath(targetPath, checkOnly, changes, wikiRoot);
        continue;
      }
      pruneStaleMarkdown(sourcePath, targetPath, checkOnly, changes, wikiRoot);
      if (isEmptyDirectory(targetPath)) {
        removePath(targetPath, checkOnly, changes, wikiRoot);
      }
      continue;
    }

    if (entry.isFile() && isMarkdown(entry.name) && !existsSync(sourcePath)) {
      removePath(targetPath, checkOnly, changes, wikiRoot);
    }
  }
}

function syncFile({ sourcePath, targetPath, checkOnly, changes, wikiRoot }) {
  if (!existsSync(sourcePath)) return;

  const nextContent = sanitizeMdx(readFileSync(sourcePath, "utf8"), targetPath);
  const currentContent = existsSync(targetPath) ? readFileSync(targetPath, "utf8") : null;
  if (currentContent === nextContent) return;

  changes.push(
    (currentContent === null ? "create " : "update ") + path.relative(wikiRoot, targetPath),
  );
  if (checkOnly) return;

  mkdirSync(path.dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, nextContent);
}

function removePath(targetPath, checkOnly, changes, wikiRoot) {
  changes.push("remove " + path.relative(wikiRoot, targetPath));
  if (checkOnly) return;
  rmSync(targetPath, { recursive: true, force: true });
}

function writeMetaTree(directory, title, checkOnly, changes, wikiRoot) {
  if (!existsSync(directory)) return;

  const entries = readdirSync(directory, { withFileTypes: true }).filter(
    (entry) => !entry.name.startsWith("."),
  );
  const files = entries
    .filter((entry) => entry.isFile() && isMarkdown(entry.name))
    .map((entry) => stripMarkdownExtension(entry.name))
    .filter((name) => name !== "meta");
  const folders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const pages = orderPages([...files, ...folders]);

  if (pages.length > 0) mergeMeta(directory, { title, pages }, checkOnly, changes, wikiRoot);

  for (const folder of folders) {
    writeMetaTree(
      path.join(directory, folder),
      titleFromSegment(folder),
      checkOnly,
      changes,
      wikiRoot,
    );
  }
}

function mergeMeta(directory, nextMeta, checkOnly, changes, wikiRoot) {
  const metaPath = path.join(directory, "meta.json");
  const existing = readJson(metaPath);
  const next = { ...nextMeta, ...existing, pages: nextMeta.pages };
  const nextContent = formatMetaJson(next);
  const currentContent = existsSync(metaPath) ? readFileSync(metaPath, "utf8") : null;

  if (currentContent === nextContent || jsonMatches(currentContent, next)) return;

  changes.push(
    (currentContent === null ? "create " : "update ") + path.relative(wikiRoot, metaPath),
  );
  if (checkOnly) return;

  mkdirSync(directory, { recursive: true });
  writeFileSync(metaPath, nextContent);
}

function formatMetaJson(meta) {
  const lines = Object.entries(meta).map(
    ([key, value]) => '  "' + key + '": ' + formatMetaValue(value),
  );

  return "{\n" + lines.join(",\n") + "\n}\n";
}

function formatMetaValue(value) {
  if (!Array.isArray(value)) return JSON.stringify(value);
  return "[" + value.map((entry) => JSON.stringify(entry)).join(", ") + "]";
}

function readJson(filePath) {
  if (!existsSync(filePath)) return {};
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function jsonMatches(content, value) {
  if (content === null) return false;

  try {
    return JSON.stringify(JSON.parse(content)) === JSON.stringify(value);
  } catch {
    return false;
  }
}

function orderRootPages(pages) {
  return pages.sort((left, right) => {
    if (left === "wiki") return -1;
    if (right === "wiki") return 1;
    if (left === "project") return -1;
    if (right === "project") return 1;

    return left.localeCompare(right);
  });
}

function orderPages(pages) {
  return mergePages([], pages).sort((left, right) => {
    if (left === "index") return -1;
    if (right === "index") return 1;

    return left.localeCompare(right);
  });
}

function mergePages(existingPages, nextPages) {
  const existing = Array.isArray(existingPages) ? existingPages : [];
  const additions = nextPages.filter((page) => !existing.includes(page));
  const pages = [...existing, ...additions];

  if (!pages.includes("index")) return pages;

  return ["index", ...pages.filter((page) => page !== "index")];
}

function stripMarkdownExtension(fileName) {
  return fileName.replace(/\.mdx?$/, "");
}

function titleFromSegment(segment) {
  return segment
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sanitizeMdx(content, targetPath) {
  const sanitized = content.replace(/<([A-Z_][A-Z0-9_-]*)>/g, "\\<$1\\>");
  if (!hasFrontmatter(sanitized)) return withDefaultFrontmatter(sanitized, targetPath);
  if (frontmatterHasTitle(sanitized)) return sanitized;

  return sanitized.replace(
    /^---\r?\n/,
    '---\ntitle: "' + titleFromDocument(sanitized, targetPath) + '"\n',
  );
}

function withDefaultFrontmatter(content, targetPath) {
  return [
    "---",
    'title: "' + titleFromDocument(content, targetPath) + '"',
    "surface: project",
    "permission: project",
    "---",
    "",
    content,
  ].join("\n");
}

function hasFrontmatter(content) {
  return /^---\r?\n/.test(content);
}

function frontmatterHasTitle(content) {
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  if (!frontmatter) return false;

  return /^\s*title\s*:\s*(?:"[^"]+"|'[^']+'|[^\s#][^\n#]*)\s*(?:#.*)?$/m.test(frontmatter);
}

function titleFromDocument(content, targetPath) {
  const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (heading) return heading.replace(/"/g, '\\"');

  return titleFromSegment(stripMarkdownExtension(path.basename(targetPath))).replace(/"/g, '\\"');
}

function isMarkdown(fileName) {
  return fileName.endsWith(".md") || fileName.endsWith(".mdx");
}

function isEmptyDirectory(directory) {
  return existsSync(directory) && readdirSync(directory).length === 0;
}

function isEntrypoint() {
  const entrypoint = process.argv[1];
  if (!entrypoint) return false;
  if (process.env.DP_SYNC_CONTENT_IMPORT === "1") return false;
  if (new URL(import.meta.url).search.length > 0) return false;

  return realpathSync(entrypoint) === realpathSync(fileURLToPath(import.meta.url));
}

if (isEntrypoint()) {
  try {
    const checkOnly = process.argv.includes("--check");
    const result = syncWikiContent({ checkOnly });
    console.log(
      result.changes.length === 0
        ? "Wiki content is current."
        : "Synced wiki content:\n" + result.changes.join("\n"),
    );
  } catch (error) {
    if (!(error instanceof SyncContentError)) throw error;
    console.error(error.message);
    process.exitCode = 1;
  }
}
