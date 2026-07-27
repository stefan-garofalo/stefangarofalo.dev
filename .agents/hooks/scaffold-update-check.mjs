#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scaffoldManifestFile = ".devpunks/scaffold-manifest.json";
const okMessage = "Harness scaffold check: OK.";
const maxOutputLength = 24000;

function readStdinJson() {
  try {
    return JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return {};
  }
}

function runGit(args, cwd) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  return result.status === 0 ? result.stdout.trim() : "";
}

function repoRoot(cwd) {
  return runGit(["rev-parse", "--show-toplevel"], cwd) || cwd;
}

function truncateOutput(output) {
  if (output.length <= maxOutputLength) {
    return output;
  }

  return `${output.slice(0, maxOutputLength)}\n\n[truncated scaffold check output]`;
}

function commandExists(command, cwd) {
  const result = spawnSync(command, ["--version"], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "ignore", "ignore"],
  });

  return result.status === 0;
}

function checkCommand(root) {
  if (!existsSync(path.join(root, scaffoldManifestFile))) {
    return null;
  }

  const command = commandExists("hi", root) ? "hi" : commandExists("hint", root) ? "hint" : null;
  return command === null ? null : [command, "check"];
}

function runUpdateCheck(root) {
  const command = checkCommand(root);
  if (command === null && !existsSync(path.join(root, scaffoldManifestFile))) {
    return { status: "skipped", message: "" };
  }

  if (command === null) {
    return {
      status: "skipped",
      message: "Harness scaffold check: skipped (hi command not found).",
    };
  }

  const [bin, ...args] = command;
  const commandLabel = command.join(" ");
  const result = spawnSync(bin, args, {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      CI: "1",
      NO_COLOR: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 60000,
  });
  const output = truncateOutput([result.stdout, result.stderr].filter(Boolean).join("\n").trim());

  if (result.error) {
    return {
      status: "error",
      message: [
        "Harness scaffold check failed to run.",
        "",
        `${commandLabel} error: ${result.error.message}`,
      ].join("\n"),
    };
  }

  if (result.status === 0) {
    return { status: "ok", message: okMessage };
  }

  return {
    status: "diverged",
    message: [
      "Harness scaffold divergence detected.",
      "",
      `Command: ${commandLabel}`,
      "",
      output || "(no command output)",
      "",
      "Hand accepted remediation to the assigned subagent before relying on scaffolded agents, skills, hooks, or root guidance.",
    ].join("\n"),
  };
}

function formatForHarness(message, harness) {
  if (!message) {
    return "";
  }

  if (harness === "cursor") {
    return JSON.stringify({
      continue: true,
      additional_context: message,
      agent_message: message,
      user_message: message === okMessage ? okMessage : "Harness scaffold divergence detected.",
    });
  }

  return message;
}

function rootFromInput(input) {
  const candidates = [
    input.cwd,
    input.workspace_root,
    process.env.CLAUDE_PROJECT_DIR,
    process.env.PWD,
    process.cwd(),
  ].filter((value) => typeof value === "string" && value.length > 0);

  return repoRoot(candidates[0] ?? process.cwd());
}

function main() {
  const harness = process.argv[2] ?? "plain";
  const input = readStdinJson();
  const root = rootFromInput(input);
  const result = runUpdateCheck(root);
  const output = formatForHarness(result.message, harness);

  if (output) {
    process.stdout.write(`${output}\n`);
  }
}

export const ScaffoldUpdateCheckPlugin = async ({ client, directory, worktree }) => ({
  event: async ({ event }) => {
    if (event.type !== "session.created") {
      return;
    }

    const result = runUpdateCheck(repoRoot(worktree || directory || process.cwd()));
    if (!result.message) {
      return;
    }

    await client.app.log({
      body: {
        service: "scaffold-update-check",
        level: result.status === "diverged" ? "warn" : "info",
        message: result.message,
      },
    });
  },
});

export const testHooks = {
  checkCommand,
  formatForHarness,
  okMessage,
  runUpdateCheck,
  truncateOutput,
};

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
const modulePath = fileURLToPath(import.meta.url);

if (invokedPath && path.basename(invokedPath) === path.basename(modulePath)) {
  main();
}
