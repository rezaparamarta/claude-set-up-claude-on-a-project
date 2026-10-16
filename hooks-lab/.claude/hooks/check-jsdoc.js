// PostToolUse hook: every top-level function in hooks-lab/*.js must have a JSDoc block.
// Exit 2 sends the stderr message back to Claude so it fixes the file.
const fs = require('fs');
const path = require('path');

const labDir = path.resolve(__dirname, '..', '..');

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
    let filePath;
    try {
        const input = JSON.parse(raw);
        filePath = (input.tool_response && input.tool_response.filePath) || input.tool_input.file_path;
    } catch {
        process.exit(0);
    }
    if (!filePath) process.exit(0);

    const abs = path.resolve(filePath);
    const rel = path.relative(labDir, abs);
    if (rel.startsWith('..') || path.isAbsolute(rel) || rel.startsWith('.claude') || !abs.endsWith('.js')) {
        process.exit(0);
    }

    const lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/);
    const declaration = /^(?:async\s+)?function\s*\*?\s*(\w+)|^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function\b|\([^)]*\)\s*=>|\w+\s*=>)/;
    const missing = [];

    lines.forEach((line, i) => {
        const m = declaration.exec(line);
        if (!m) return;
        let j = i - 1;
        while (j >= 0 && lines[j].trim() === '') j--;
        if (j >= 0 && lines[j].trim().endsWith('*/')) {
            let k = j;
            while (k >= 0 && !lines[k].includes('/*')) k--;
            if (k >= 0 && lines[k].trim().startsWith('/**')) return;
        }
        missing.push(`  - ${m[1] || m[2]} (line ${i + 1})`);
    });

    if (missing.length) {
        process.stderr.write(
            `JSDoc check failed in ${rel}: these top-level functions have no /** ... */ block directly above them:\n` +
                missing.join('\n') +
                '\nAdd a JSDoc comment (description, @param, @returns) to each one.\n'
        );
        process.exit(2);
    }
});
