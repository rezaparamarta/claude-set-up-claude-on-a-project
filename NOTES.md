# Notes: setting up Claude Code on this project

## What's in CLAUDE.md, and what I left out

I kept `CLAUDE.md` to four short sections: a one-line description, the commands, the conventions and the architecture.

- **Commands:** `dev`, `test`, `lint`, plus how to run a single test file or a single test by name. Claude needs the single-test commands most, and they aren't in `package.json`. I also noted that CI runs lint before tests, so Claude knows both have to pass.
- **Conventions:** each rule is written as "do X, not Y", so Claude can follow it without asking. For example: use CommonJS, not ES modules; access data only through `db/store.js`; return errors as `{ error }` JSON.
- **Architecture:** only what you can't see from a single file. `server.js` exports `app` and only listens when run directly, which is why tests can import it. The tests also share the in-memory store's state.

I left out:

- The course instructions and submission steps from the README. They're one-off tasks, not guidance for working on the code.
- A file-by-file listing. Claude can discover that by reading the repo, and it would go stale.
- Generic advice like "write tests" or "handle errors". It costs context in every session and doesn't change what Claude does.
- Anything from `.env`, so no secrets end up in a committed file.

## Permission rules

`.claude/settings.json` is committed so everyone on the project gets the same rules:

- **Allow:** `npm test`, `npm run lint`, `npm run dev` and `node --test`. These are safe, local and run constantly, so prompting for them every time adds nothing.
- **Ask:** `git push`. It changes the shared remote, so I want to confirm each push.
- **Deny:** reading `./.env`, and `git push --force` / `-f`.

Without the deny rules, Claude could read `.env` while exploring the project. Any real secrets in it, such as a database URL with a password, would then be in the conversation and could leak into code, commits or logs. A force-push could overwrite commits other people have pushed, and that is hard to undo. The deny rules take priority over the `git push` ask rule, so a force-push is blocked outright instead of being one click away.

These rules are a guardrail, not a hard security boundary. `Read(./.env)` doesn't stop a shell command like `cat .env`. A force flag placed later in the command (`git push origin main --force`) is not matched by the deny rule, but it still hits the `git push` confirmation prompt.

## Verification

- `/memory`: confirmed, `CLAUDE.md` shows as loaded.
- `/permissions`: confirmed, the allow, ask and deny rules are listed.
- "How do I run the tests here?" in a fresh session: confirmed, Claude answers from `CLAUDE.md`.

## Update's Info:
- I have already run claude and type /memory and /permissions and all loads correctly works!
