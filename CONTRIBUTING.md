# Contributing to Photobooth

Thank you for your interest in contributing! This guide covers everything you need to get started.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Branch Naming](#branch-naming)
- [Commit Format](#commit-format)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Architecture Notes](#architecture-notes)

---

## Development Setup

### Prerequisites

- Node.js 20.9 or later
- npm 10 or later
- A browser with camera support (Chrome, Firefox, Edge, or Safari 16.4+)

### Steps

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/photobooth.git
cd photobooth

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Camera access works on `localhost` without HTTPS.

### Verify your setup

```bash
npm run lint        # ESLint — should exit with 0 warnings
npm run typecheck   # TypeScript — should exit with 0 errors
npm run test        # Vitest — all tests should pass
npm run build       # Next.js build — should succeed
```

All four commands must pass before submitting a PR.

---

## Branch Naming

Use the following prefixes:

| Prefix | Use for |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code changes with no behaviour change |
| `test/` | Adding or updating tests |
| `chore/` | Tooling, dependencies, CI |

**Examples:**

```
feat/camera-device-picker
fix/stream-interrupted-error
docs/update-readme
refactor/composition-engine
test/filter-utilities
chore/upgrade-vitest
```

Branch names should be lowercase and use hyphens, not underscores.

---

## Commit Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Formatting, whitespace (no logic change) |
| `refactor` | Code restructuring (no feature/fix) |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, tooling |
| `perf` | Performance improvements |
| `ci` | CI/CD configuration changes |

### Scopes (optional but recommended)

`camera`, `filters`, `composition`, `export`, `store`, `ui`, `a11y`, `ci`, `docs`

### Examples

```
feat(camera): add device picker with auto-refresh on devicechange
fix(filters): correct sepia pixel values in canvas export
docs: update README with DSLR webcam setup guide
test(composition): add slot geometry bounds tests
chore(ci): add build job to GitHub Actions workflow
```

### Breaking changes

Add `!` after the type/scope and a `BREAKING CHANGE:` footer:

```
feat(store)!: rename capturedFrames to frames

BREAKING CHANGE: sessionStore.capturedFrames is now sessionStore.frames
```

---

## Pull Request Process

1. **Create a branch** from `main` using the naming convention above
2. **Make your changes** — keep PRs focused on a single concern
3. **Write or update tests** for any logic changes
4. **Run all checks locally** before pushing:
   ```bash
   npm run lint && npm run typecheck && npm run test && npm run build
   ```
5. **Push your branch** and open a PR against `main`
6. **Fill in the PR template** — describe what changed, why, and how to test it
7. **Wait for CI** — all four jobs (lint, typecheck, test, build) must pass
8. **Request a review** — at least one approval is required before merging
9. **Squash and merge** — keep the commit history clean

### PR title format

Follow the same Conventional Commits format as commit messages:

```
feat(camera): add device picker with auto-refresh
fix(export): handle toBlob failure gracefully
```

### What makes a good PR

- Small and focused — one feature or fix per PR
- Includes tests for new logic
- Updates documentation if behaviour changes
- No unrelated formatting changes mixed in
- Passes all CI checks

---

## Code Style

### TypeScript

- Strict mode is enabled — no `any`, no `@ts-ignore` without a comment explaining why
- Prefer explicit return types on exported functions
- Use `interface` for object shapes, `type` for unions and aliases
- All public functions and complex logic must have JSDoc comments

### React

- Use function components only — no class components
- Keep components under 200 lines; split if larger
- Use `'use client'` directive only where necessary (interactive components)
- Manage side effects in custom hooks, not directly in components
- Never use `<div onClick>` — use `<button>` for interactive elements

### Naming

- Components: `PascalCase` (e.g., `CameraPreview`)
- Hooks: `camelCase` prefixed with `use` (e.g., `useCamera`)
- Utilities: `camelCase` (e.g., `getCssFilterString`)
- Types/interfaces: `PascalCase` (e.g., `CameraError`, `SessionState`)
- Constants: `SCREAMING_SNAKE_CASE` for module-level constants

### File structure

- One component per file, filename matches component name
- Co-locate tests with source or place in `tests/` mirroring `src/` structure
- Import order: external packages → internal `@/` aliases → relative imports

### Formatting

Prettier handles formatting automatically. Run `npm run lint` to check. The config is in `.prettierrc`:

- No semicolons
- Single quotes
- 2-space indent
- Trailing commas (ES5)
- 100-character print width

---

## Testing

### Running tests

```bash
npm run test              # Single run
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

### What to test

- **Unit tests** for all utility functions (`lib/filters/`, `lib/composition/`, `lib/export/`)
- **Component tests** for critical UI states (error screens, permission states, loading states)
- **Do not** test implementation details — test behaviour and outputs

### Coverage targets

- Utility modules: ≥ 70% line coverage
- UI components: no coverage requirement, but critical states should be tested

### Test file location

```
tests/
├── unit/
│   ├── filters/
│   ├── composition/
│   └── export/
└── components/
```

---

## Architecture Notes

Before making changes to core modules, read the relevant section of [design.md](.kiro/specs/photobooth/design.md).

Key constraints:

- **No backend** — all processing is client-side. Do not add server routes or API handlers for MVP features.
- **No persistent storage** — captured images must not be written to `localStorage`, `IndexedDB`, or any persistent store. In-memory only.
- **No DSLR SDK integration** — camera access is via `navigator.mediaDevices` only. Do not add vendor SDK dependencies.
- **Selective Zustand subscriptions** — always subscribe to specific state slices, never the whole store, to avoid re-rendering the video preview.
- **Stream cleanup** — always call `track.stop()` on all tracks when a stream is no longer needed.

---

## Questions?

Open a [GitHub Discussion](https://github.com/your-org/photobooth/discussions) or file an issue. We're happy to help.
