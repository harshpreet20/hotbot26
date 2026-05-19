#!/usr/bin/env node
/**
 * First-time password setup for the Backdrop admin.
 * Run via:  npm run setup:password
 *
 * - Checks if BLOG_ADMIN_PASSWORD_HASH is already set in .env.local
 * - If unset (or you choose to override), prompts for a new password
 * - Hashes it with bcrypt (cost 12) and writes it back to .env.local
 */

const fs      = require("fs");
const path    = require("path");
const bcrypt  = require("bcryptjs");
const readline = require("readline");

const ENV_PATH = path.resolve(__dirname, "../.env.local");
const HASH_KEY = "BLOG_ADMIN_PASSWORD_HASH";

// ── helpers ──────────────────────────────────────────────────────────────────

function readEnv() {
  if (!fs.existsSync(ENV_PATH)) return "";
  return fs.readFileSync(ENV_PATH, "utf8");
}

function getExistingHash(envContent) {
  // Matches: BLOG_ADMIN_PASSWORD_HASH='...' or BLOG_ADMIN_PASSWORD_HASH="..." or BLOG_ADMIN_PASSWORD_HASH=...
  const match = envContent.match(
    /^BLOG_ADMIN_PASSWORD_HASH\s*=\s*['"]?([^'"\r\n]*)['"]?/m
  );
  return match ? match[1].trim() : "";
}

function updateEnv(envContent, newHash) {
  // Wrap in single quotes so the $ in bcrypt hashes isn't shell-expanded
  const line = `BLOG_ADMIN_PASSWORD_HASH='${newHash}'`;
  if (/^BLOG_ADMIN_PASSWORD_HASH\s*=/m.test(envContent)) {
    return envContent.replace(/^BLOG_ADMIN_PASSWORD_HASH\s*=.*/m, line);
  }
  // Append if not present
  return envContent.trimEnd() + "\n" + line + "\n";
}

// Hidden password prompt (no echo)
function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    process.stdout.write(question);

    const isRaw = process.stdin.isTTY;
    if (isRaw) process.stdin.setRawMode(true);

    let input = "";

    const onData = (char) => {
      char = char.toString();
      if (char === "\r" || char === "\n") {
        process.stdout.write("\n");
        if (isRaw) process.stdin.setRawMode(false);
        process.stdin.removeListener("data", onData);
        process.stdin.pause();
        rl.close();
        resolve(input);
      } else if (char === "\u0003") {
        // Ctrl+C
        process.stdout.write("\n");
        process.exit(1);
      } else if (char === "\u007f" || char === "\b") {
        // Backspace
        if (input.length > 0) input = input.slice(0, -1);
      } else {
        input += char;
      }
    };

    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", onData);
  });
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans.trim()); }));
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n=== Backdrop Admin — Password Setup ===\n");

  const envContent   = readEnv();
  const existingHash = getExistingHash(envContent);

  if (existingHash) {
    console.log("A password hash is already set in .env.local.");
    const override = await prompt("Do you want to set a new password? (y/N): ");
    if (!override.toLowerCase().startsWith("y")) {
      console.log("Aborted. Existing password unchanged.\n");
      process.exit(0);
    }
    console.log("");
  } else {
    console.log("No password found. Let's create one.\n");
  }

  // Collect & validate password
  let password;
  while (true) {
    password = await promptHidden("Enter new password: ");

    if (password.length < 8) {
      console.log("Password must be at least 8 characters. Try again.\n");
      continue;
    }

    const confirm = await promptHidden("Confirm password:   ");

    if (password !== confirm) {
      console.log("Passwords do not match. Try again.\n");
      continue;
    }

    break;
  }

  // Hash & save
  console.log("\nHashing password (bcrypt cost 12) ...");
  const hash       = await bcrypt.hash(password, 12);
  const newContent = updateEnv(envContent, hash);
  fs.writeFileSync(ENV_PATH, newContent, "utf8");

  console.log(`\nDone! ${HASH_KEY} updated in .env.local`);
  console.log("Restart your dev server for the change to take effect.\n");
}

main().catch((err) => { console.error(err); process.exit(1); });
