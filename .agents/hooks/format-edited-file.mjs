#!/usr/bin/env node

import { createHash } from "node:crypto";
import { accessSync, constants, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const javascriptFormattableSuffixes = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
]);
const javascriptLintableSuffixes = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const pythonFormattableSuffixes = new Set([".py"]);
const formattableSuffixes = new Set([
  ...javascriptFormattableSuffixes,
  ...pythonFormattableSuffixes,
]);
const ignoredParts = new Set([".git", "node_modules", ".next", "dist"]);
const scaffoldOwnedAgentDirectories = new Set(["hooks", "scripts", "skills"]);
const scaffoldOwnedMirrorDirectories = new Set([".claude", ".codex", ".cursor"]);
const productRoots = new Set(["apps", "packages"]);
const packageManagers = new Set(["bun", "pnpm", "npm", "yarn"]);
const backendWorkspaceSegments = new Set(["api", "backend", "server", "services"]);

function readStdinJson() {
  try {
    return JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return {};
  }
}

function runGit(args, cwd) {
  const result = spawnSync("git", ["-C", cwd, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  return result.status === 0 ? result.stdout : null;
}

function repoRoot(cwd) {
  return runGit(["rev-parse", "--show-toplevel"], cwd)?.trim() ?? "";
}

function normalizeRelativePath(root, filePath) {
  if (!filePath) {
    return null;
  }

  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
  const relativePath = path.relative(root, absolutePath);

  if (!relativePath || relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  const normalizedPath = relativePath.split(path.sep).join("/");
  const extension = path.extname(normalizedPath);

  if (!formattableSuffixes.has(extension)) {
    return null;
  }

  if (normalizedPath.split("/").some((part) => ignoredParts.has(part))) {
    return null;
  }

  if (isScaffoldOwnedPath(normalizedPath)) {
    return null;
  }

  if (!existsSync(path.join(root, normalizedPath))) {
    return null;
  }

  return normalizedPath;
}

function isScaffoldOwnedPath(relativePath) {
  const parts = relativePath.split("/");
  if (parts[0] !== ".agents") {
    return (
      (scaffoldOwnedMirrorDirectories.has(parts[0]) && parts[1] === "hooks") ||
      (parts[0] === ".claude" && parts[1] === "skills") ||
      (parts[0] === ".opencode" && parts[1] === "plugins")
    );
  }

  return scaffoldOwnedAgentDirectories.has(parts[1]);
}

function isLintablePath(relativePath) {
  const parts = relativePath.split("/");
  return (
    parts.length > 0 &&
    productRoots.has(parts[0]) &&
    javascriptLintableSuffixes.has(path.extname(relativePath))
  );
}

function isPythonPath(relativePath) {
  return pythonFormattableSuffixes.has(path.extname(relativePath));
}

function runCommand(root, args, stdio = "ignore") {
  const result = spawnSync(args[0], args.slice(1), {
    cwd: root,
    stdio,
    encoding: stdio === "ignore" ? undefined : "utf8",
  });

  return {
    ok: result.status === 0,
    stdout: result.stdout ?? "",
  };
}

function commandExists(command) {
  const pathValue = process.env.PATH ?? process.env.Path;
  if (!pathValue) {
    return false;
  }

  const isWindows = os.platform() === "win32";
  const pathEntries = pathValue.split(isWindows ? ";" : ":").filter(Boolean);
  const pathExtensions = isWindows
    ? (process.env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD").split(";").filter(Boolean)
    : [""];
  const commandExtensions = isWindows && path.extname(command) === "" ? pathExtensions : [""];
  const hasPathSegment = command.includes("/") || command.includes("\\");
  const candidates = (hasPathSegment ? [""] : pathEntries).flatMap((entry) =>
    commandExtensions.map((extension) =>
      hasPathSegment ? `${command}${extension}` : path.join(entry, `${command}${extension}`),
    ),
  );

  return candidates.some((candidate) => {
    try {
      accessSync(candidate, isWindows ? constants.F_OK : constants.X_OK);
      return true;
    } catch {
      return false;
    }
  });
}

function packageManagerFromPackageJson(root) {
  const packageManager = loadJson(path.join(root, "package.json"))?.packageManager;

  if (typeof packageManager !== "string") {
    return null;
  }

  const name = packageManager.split("@")[0];
  return packageManagers.has(name) ? name : null;
}

function packageManagerFromLockfile(root) {
  if (existsSync(path.join(root, "bun.lock")) || existsSync(path.join(root, "bun.lockb"))) {
    return "bun";
  }

  if (
    existsSync(path.join(root, "pnpm-lock.yaml")) ||
    existsSync(path.join(root, "pnpm-workspace.yaml"))
  ) {
    return "pnpm";
  }

  if (existsSync(path.join(root, "yarn.lock"))) {
    return "yarn";
  }

  if (existsSync(path.join(root, "package-lock.json"))) {
    return "npm";
  }

  return null;
}

function toolCommand(root, tool, args) {
  switch (packageManagerFromPackageJson(root) ?? packageManagerFromLockfile(root)) {
    case "bun":
      return ["bunx", tool, ...args];
    case "pnpm":
      return ["pnpm", "exec", tool, ...args];
    case "yarn":
      return ["yarn", "exec", tool, ...args];
    case "npm":
      return ["npm", "exec", "--", tool, ...args];
    default:
      break;
  }

  if (commandExists("bunx")) {
    return ["bunx", tool, ...args];
  }

  if (commandExists("pnpm")) {
    return ["pnpm", "exec", tool, ...args];
  }

  return ["npx", tool, ...args];
}

function nearestPythonProject(root, relativePath) {
  const parts = relativePath.split("/");

  for (let index = parts.length - 1; index > 0; index -= 1) {
    const projectPath = parts.slice(0, index).join("/");
    if (existsSync(path.join(root, projectPath, "pyproject.toml"))) {
      return projectPath;
    }
  }

  if (parts.length >= 2 && productRoots.has(parts[0]) && backendWorkspaceSegments.has(parts[1])) {
    return `${parts[0]}/${parts[1]}`;
  }

  return ".";
}

function formatCommandForPath(root, relativePath) {
  if (isPythonPath(relativePath)) {
    return [
      "uv",
      "run",
      "--project",
      nearestPythonProject(root, relativePath),
      "ruff",
      "format",
      relativePath,
    ];
  }

  return toolCommand(root, "oxfmt", ["--write", relativePath]);
}

function lintCommandForPath(root, relativePath) {
  if (isPythonPath(relativePath)) {
    return [
      "uv",
      "run",
      "--project",
      nearestPythonProject(root, relativePath),
      "ruff",
      "check",
      "--fix",
      relativePath,
    ];
  }

  if (!isLintablePath(relativePath)) {
    return null;
  }

  return toolCommand(root, "oxlint", [relativePath]);
}

function formatAndLintFiles(root, filePaths) {
  const normalizedFiles = [];

  for (const filePath of filePaths) {
    const normalizedPath = normalizeRelativePath(root, filePath);
    if (normalizedPath && !normalizedFiles.includes(normalizedPath)) {
      normalizedFiles.push(normalizedPath);
    }
  }

  const formatted = [];
  const formatFailed = [];
  const lintFailed = [];

  for (const relativePath of normalizedFiles) {
    const formattedOk = runCommand(root, formatCommandForPath(root, relativePath)).ok;

    if (!formattedOk) {
      formatFailed.push(relativePath);
      continue;
    }

    formatted.push(relativePath);

    const lintCommand = lintCommandForPath(root, relativePath);
    if (lintCommand !== null && !runCommand(root, lintCommand).ok) {
      lintFailed.push(relativePath);
    }
  }

  return {
    format_failed: formatFailed,
    formatted,
    lint_failed: lintFailed,
  };
}

function extractSingleFilePath(payload) {
  return (
    payload.filePath ??
    payload.file_path ??
    payload.tool_input?.filePath ??
    payload.tool_input?.file_path ??
    payload.tool_response?.filePath ??
    payload.tool_response?.file_path ??
    ""
  );
}

function emitClaudeFailure(message) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: message,
      },
    }),
  );
}

function emitCursorFailure(message) {
  process.stdout.write(
    JSON.stringify({
      user_message: message,
    }),
  );
}

function runSingleFileMode(style) {
  const payload = readStdinJson();
  const root = repoRoot(process.cwd());

  if (!root) {
    return;
  }

  const filePath = extractSingleFilePath(payload);
  if (!filePath) {
    return;
  }

  const summary = formatAndLintFiles(root, [filePath]);
  const formatFailed = summary.format_failed[0] ?? "";
  const lintFailed = summary.lint_failed[0] ?? "";

  if (formatFailed) {
    const message = `Auto-format failed for ${filePath}. Review the file and format it manually if needed.`;

    if (style === "claude") {
      emitClaudeFailure(message);
    } else {
      emitCursorFailure(message);
    }

    return;
  }

  if (lintFailed) {
    const message = `Auto-lint failed for ${filePath}. Review the file and fix lint errors manually if needed.`;

    if (style === "claude") {
      emitClaudeFailure(message);
    } else {
      emitCursorFailure(message);
    }
  }
}

function dirtyFiles(root) {
  const output = runGit(["ls-files", "-m", "-o", "--exclude-standard"], root);
  if (!output) {
    return [];
  }

  return [
    ...new Set(
      output
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((filePath) => formattableSuffixes.has(path.extname(filePath)))
        .filter((filePath) => !filePath.split("/").some((part) => ignoredParts.has(part))),
    ),
  ].sort();
}

function fileHash(filePath) {
  const hash = createHash("sha256");
  hash.update(readFileSync(filePath));
  return hash.digest("hex");
}

function codexStateFilePath(root, sessionId) {
  const repoName = path.basename(root) || "repo";
  const safeSessionId = sessionId.replaceAll("/", "_");
  const stateDir = path.join(os.tmpdir(), "codex-hooks", repoName, safeSessionId);
  mkdirSync(stateDir, { recursive: true });
  return path.join(stateDir, "format-state.json");
}

function fingerprints(root) {
  const entries = {};

  for (const relativePath of dirtyFiles(root)) {
    const absolutePath = path.join(root, relativePath);
    if (existsSync(absolutePath)) {
      entries[relativePath] = fileHash(absolutePath);
    }
  }

  return entries;
}

function loadJson(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function isFingerprintRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function readFingerprintRecord(value) {
  if (!isFingerprintRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      ([filePath, hash]) => typeof filePath === "string" && typeof hash === "string",
    ),
  );
}

function loadCodexState(filePath) {
  const raw = loadJson(filePath);
  return {
    baseline: readFingerprintRecord(raw?.baseline),
    lastToolUseId: typeof raw?.lastToolUseId === "string" ? raw.lastToolUseId : "",
    processed: readFingerprintRecord(raw?.processed),
  };
}

function saveCodexState(filePath, state) {
  writeFileSync(
    filePath,
    JSON.stringify({
      baseline: state.baseline,
      lastToolUseId: state.lastToolUseId,
      processed: state.processed,
    }),
  );
}

function updateProcessedFingerprints(root, state, filePaths) {
  for (const relativePath of filePaths) {
    const absolutePath = path.join(root, relativePath);

    if (existsSync(absolutePath)) {
      state.processed[relativePath] = fileHash(absolutePath);
      continue;
    }

    delete state.processed[relativePath];
  }
}

function pendingCodexFiles(state, current) {
  return Object.entries(current)
    .filter(
      ([relativePath, digest]) =>
        state.baseline[relativePath] !== digest && state.processed[relativePath] !== digest,
    )
    .map(([relativePath]) => relativePath);
}

function pruneProcessedFingerprints(state, current) {
  for (const relativePath of Object.keys(state.processed)) {
    if (current[relativePath] !== state.processed[relativePath]) {
      delete state.processed[relativePath];
    }
  }
}

function emitCodexFailure(kind, files) {
  const message =
    kind === "lint"
      ? `Auto-lint failed for ${files.join(", ")}. Review the file and fix lint errors manually if needed.`
      : `Auto-format failed for ${files.join(", ")}. Review the file and format it manually if needed.`;

  process.stdout.write(JSON.stringify({ systemMessage: message }));
}

function runCodexSnapshotMode(mode) {
  const payload = readStdinJson();
  const cwd = String(payload.cwd ?? process.cwd());
  const sessionId = String(payload.session_id ?? "");
  const root = repoRoot(cwd);

  if (!root || !sessionId) {
    return;
  }

  const stateFile = codexStateFilePath(root, sessionId);

  if (mode === "session-start") {
    saveCodexState(stateFile, {
      baseline: fingerprints(root),
      lastToolUseId: "",
      processed: {},
    });
    return;
  }

  if (mode !== "post") {
    return;
  }

  const state = loadCodexState(stateFile);
  const toolUseId = typeof payload.tool_use_id === "string" ? payload.tool_use_id : "";

  if (toolUseId && state.lastToolUseId === toolUseId) {
    return;
  }

  const current = fingerprints(root);
  pruneProcessedFingerprints(state, current);
  const touched = pendingCodexFiles(state, current);

  if (toolUseId) {
    state.lastToolUseId = toolUseId;
  }

  if (touched.length === 0) {
    saveCodexState(stateFile, state);
    return;
  }

  const summary = formatAndLintFiles(root, touched);
  updateProcessedFingerprints(root, state, summary.formatted);
  saveCodexState(stateFile, state);

  if (summary.format_failed.length > 0) {
    emitCodexFailure("format", summary.format_failed);
  }

  if (summary.lint_failed.length > 0) {
    emitCodexFailure("lint", summary.lint_failed);
  }
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function normalizeEditedPath(filePath, worktree) {
  if (!filePath) {
    return null;
  }

  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(worktree, filePath);
  const relativePath = path.relative(worktree, absolutePath);

  if (!relativePath || relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return toPosixPath(relativePath);
}

function extractPatchedPaths(patchText, worktree) {
  if (!patchText) {
    return [];
  }

  const paths = [];

  for (const line of patchText.split("\n")) {
    let relativePath = null;

    if (line.startsWith("*** Add File: ")) {
      relativePath = line.slice("*** Add File: ".length).trim();
    } else if (line.startsWith("*** Update File: ")) {
      relativePath = line.slice("*** Update File: ".length).trim();
    } else if (line.startsWith("*** Move to: ")) {
      relativePath = line.slice("*** Move to: ".length).trim();
    }

    const normalizedPath = normalizeEditedPath(relativePath, worktree);
    if (normalizedPath) {
      paths.push(normalizedPath);
    }
  }

  return paths;
}

function editedPathsForTool(input, output, worktree) {
  const toolName = input?.tool;
  const args = output?.args ?? {};

  if (toolName === "apply_patch") {
    return extractPatchedPaths(args.patchText, worktree);
  }

  const filePath = args.filePath;
  const normalizedPath = normalizeEditedPath(filePath, worktree);
  return normalizedPath ? [normalizedPath] : [];
}

function parseSummary(stdout) {
  try {
    return JSON.parse(stdout || "{}");
  } catch {
    return {};
  }
}

export const FormatAndLintPlugin = async ({ client, worktree }) => {
  return {
    "tool.execute.after": async (input, output) => {
      if (!["edit", "write", "multiedit", "apply_patch"].includes(input.tool)) {
        return;
      }

      const editedPaths = [...new Set(editedPathsForTool(input, output, worktree))].filter(Boolean);

      if (editedPaths.length === 0) {
        return;
      }

      const result = runCommand(
        worktree,
        ["node", ".agents/hooks/format-edited-file.mjs", "files", ...editedPaths],
        ["ignore", "pipe", "ignore"],
      );

      const summary = result.ok ? parseSummary(result.stdout) : {};
      const formatFailed = Array.isArray(summary?.format_failed) ? summary.format_failed : [];
      const lintFailed = Array.isArray(summary?.lint_failed) ? summary.lint_failed : [];

      for (const relativePath of formatFailed) {
        await client.app.log({
          body: {
            service: "format-and-lint",
            level: "warn",
            message: "Auto-format failed after edit.",
            extra: {
              filePath: relativePath,
            },
          },
        });
      }

      for (const relativePath of lintFailed) {
        await client.app.log({
          body: {
            service: "format-and-lint",
            level: "warn",
            message: "Auto-lint failed after edit.",
            extra: {
              filePath: relativePath,
            },
          },
        });
      }
    },
  };
};

export const testHooks = {
  formatCommandForPath,
  lintCommandForPath,
  normalizeRelativePath,
  toolCommand,
};

function main() {
  const mode = process.argv[2] ?? "";

  if (mode === "session-start" || mode === "post") {
    runCodexSnapshotMode(mode);
    return;
  }

  if (mode === "claude" || mode === "cursor") {
    runSingleFileMode(mode);
    return;
  }

  if (mode === "files") {
    const root = repoRoot(process.cwd());
    const summary = root
      ? formatAndLintFiles(root, process.argv.slice(3))
      : { format_failed: [], formatted: [], lint_failed: [] };
    process.stdout.write(JSON.stringify(summary));
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
const modulePath = fileURLToPath(import.meta.url);

if (invokedPath && path.basename(invokedPath) === path.basename(modulePath)) {
  main();
}
