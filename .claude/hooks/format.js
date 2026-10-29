// PostToolUse hook: run Prettier on the file Claude just edited or wrote.
// Formatting is best-effort, so this never blocks Claude; it always exits 0.
const { execFileSync } = require("child_process");
const path = require("path");

const projectDir = path.resolve(__dirname, "..", "..");
const prettierBin = require.resolve("prettier/bin/prettier.cjs", {
  paths: [projectDir],
});

let raw = "";
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let filePath;
  try {
    const input = JSON.parse(raw);
    filePath =
      (input.tool_response && input.tool_response.filePath) ||
      input.tool_input.file_path;
  } catch {
    process.exit(0);
  }
  if (!filePath) process.exit(0);

  const rel = path.relative(projectDir, path.resolve(filePath));
  if (rel.startsWith("..") || path.isAbsolute(rel)) process.exit(0);

  try {
    // --ignore-unknown skips file types Prettier can't format;
    // .prettierignore is honoured because cwd is the project root.
    execFileSync(
      process.execPath,
      [prettierBin, "--write", "--ignore-unknown", "--log-level", "warn", rel],
      { cwd: projectDir, stdio: ["ignore", "ignore", "pipe"] },
    );
  } catch (err) {
    process.stderr.write(`Prettier failed on ${rel}:\n${err.stderr || err}\n`);
  }
  process.exit(0);
});
