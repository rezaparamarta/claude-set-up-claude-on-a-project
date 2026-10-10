# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A small Express REST API (users + health check) backed by an in-memory store, used as the starter project for the Claude Code course.

## Commands

- `npm run dev` — start the API on http://localhost:3000 with `node --watch` (override with `PORT`)
- `npm test` — run all tests with the built-in `node:test` runner
- `node --test tests/users.test.js` — run one test file; add `--test-name-pattern="404"` to run matching tests only
- `npm run lint` — ESLint (`eslint:recommended`); CI runs lint then tests on Node 22, so both must pass

## Conventions

- Use CommonJS (`require` / `module.exports`), not ES modules — ESLint is configured with `sourceType: "script"`.
- Routes never touch data directly; read and write users only through the functions exported by `db/store.js`.
- Add a new resource as its own `express.Router()` file in `routes/` and mount it in `server.js`; don't add handlers to `server.js` itself.
- Return errors as JSON `{ error: "<message>" }` with the matching status code (400 for bad input, 404 for missing records).
- Start each route handler with a comment in the form `// METHOD /path — what it does`.
- Test HTTP behaviour with `supertest` against the exported `app`; don't start a real server in tests.

## Architecture

- `server.js` builds the Express app, mounts the routers, and exports `app`. It only calls `listen()` when run directly (`require.main === module`), which is what lets tests import it.
- `routes/*.js` hold one router per resource (`/users`, `/health`).
- `db/store.js` is the only data layer: a module-level array that resets on every restart. All tests in a file share this state, so a test that creates users affects the ones that run after it.
- `.env` holds local config and is git-ignored; `.env.example` documents the variables.
