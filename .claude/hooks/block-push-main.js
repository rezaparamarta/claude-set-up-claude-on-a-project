// PreToolUse hook: block any `git push` that would update the main branch.
// Exit 2 cancels the command and sends the stderr message back to Claude.
const { execFileSync } = require("child_process");
const path = require("path");

const PROTECTED = "main";

// git options that take their value as the next argument.
const GIT_OPTS_WITH_VALUE = [
  "-C",
  "-c",
  "--git-dir",
  "--work-tree",
  "--namespace",
];
const PUSH_OPTS_WITH_VALUE = [
  "-o",
  "--push-option",
  "--repo",
  "--receive-pack",
  "--exec",
];

function tokenize(segment) {
  const tokens = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(segment))) tokens.push(m[1] ?? m[2] ?? m[3]);
  return tokens;
}

function currentBranch(cwd) {
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

// Returns why `git push <args>` would update main, or null if it wouldn't.
function pushHitsMain(args, cwd) {
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--all" || a === "--mirror" || a === "--branches") {
      return `${a} pushes every branch, including ${PROTECTED}`;
    }
    if (a === "--") {
      positional.push(...args.slice(i + 1));
      break;
    }
    if (PUSH_OPTS_WITH_VALUE.includes(a)) i++;
    else if (!a.startsWith("-")) positional.push(a);
  }

  const branch = currentBranch(cwd);
  const refspecs = positional.slice(1); // positional[0] is the remote
  if (refspecs.length === 0) {
    return branch === PROTECTED
      ? `no branch given and the current branch is ${PROTECTED}`
      : null;
  }
  for (const spec of refspecs) {
    let dst = spec.replace(/^\+/, "");
    if (dst.includes(":")) dst = dst.slice(dst.indexOf(":") + 1);
    else if (dst === "HEAD" || dst === "@") dst = branch || dst;
    dst = dst.replace(/^refs\/heads\//, "");
    if (dst === PROTECTED) return `"${spec}" updates ${PROTECTED}`;
  }
  return null;
}

function findViolation(command, startCwd) {
  let cwd = startCwd;
  for (const segment of command.split(/&&|\|\||[;|\n]/)) {
    const tokens = tokenize(segment);
    if (tokens[0] === "cd" && tokens[1]) {
      cwd = path.resolve(cwd, tokens[1]);
      continue;
    }
    // git must be the command itself, optionally after VAR=value assignments,
    // so `echo git push origin main` isn't mistaken for a push.
    let gitIdx = 0;
    while (/^\w+=/.test(tokens[gitIdx] || "")) gitIdx++;
    if (!/^git(\.exe)?$/i.test(path.basename(tokens[gitIdx] || ""))) continue;

    let gitCwd = cwd;
    let i = gitIdx + 1;
    while (i < tokens.length && tokens[i].startsWith("-")) {
      if (tokens[i] === "-C")
        gitCwd = path.resolve(gitCwd, tokens[i + 1] || "");
      i += GIT_OPTS_WITH_VALUE.includes(tokens[i]) ? 2 : 1;
    }
    if (tokens[i] !== "push") continue;

    const reason = pushHitsMain(tokens.slice(i + 1), gitCwd);
    if (reason) return { segment: segment.trim(), reason };
  }
  return null;
}

let raw = "";
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const command = input.tool_input && input.tool_input.command;
  if (typeof command !== "string") process.exit(0);

  const hit = findViolation(command, input.cwd || process.cwd());
  if (hit) {
    process.stderr.write(
      `Blocked: pushing to ${PROTECTED} is not allowed (${hit.reason}).\n` +
        `Command: ${hit.segment}\n` +
        `Push a feature branch instead and open a pull request into ${PROTECTED}.\n`,
    );
    process.exit(2);
  }
  process.exit(0);
});
