# AGENTS.md — Studio UI

This file documents workflows and guidelines for **AI coding agents** working in this repository.
Human contribution rules (branching, commits, PR checklist) live in [CONTRIBUTING.md](CONTRIBUTING.md).

---

- [AGENTS.md — Studio UI](#agentsmd--studio-ui)
    - [General](#general)
    - [Working with AI Agents](#working-with-ai-agents)
        - [Branch before commit (never commit on `main`)](#branch-before-commit-never-commit-on-main)
        - [First commit / PR title](#first-commit--pr-title)
        - [Follow-up commits](#follow-up-commits)
        - [Creating pull requests](#creating-pull-requests)
    - [Project Structure](#project-structure)
    - [Coding conventions](#coding-conventions)
    - [Package Manager](#package-manager)
    - [Workflows](#workflows)
        - [Install and run](#install-and-run)
        - [Link local shared packages (`yarn link`)](#link-local-shared-packages-yarn-link)

---

## General

This repository is the embeddable **Studio UI** for CHILI GraFx — used for (My) Projects and Run Mode: a Vite + React + TypeScript app that loads into a host `<div>` and ships as CDN IIFE + ES module bundles. It depends on `@chili-publish/studio-sdk` and `@chili-publish/grafx-shared-components`.

The GitHub repository is public; the npm package is `"private": true` (delivery is via CDN, not a public npm publish).

`main` is the long-lived integration branch. Changes go through pull requests. Releases and CDN deploys are **owned by CI/CD workflows** — see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Working with AI Agents

**Before making any code changes, an AI agent MUST ask the user for a ticket reference if one has not been provided.**
Do not proceed with any file edits, commits, or pull requests until a ticket is confirmed (or an explicit `NO-TICKET` decision).

Accepted ticket references:

- A **JIRA** key (e.g. `WRS-1234`, `GRAFX-…`)
- A **GitHub issue** (e.g. `#42` or a full issue URL)
- Explicit **`NO-TICKET`** (no tracker item at all)

If the branch that is being used already contains a JIRA key, GitHub issue number, or `NO-TICKET`, use that for the change.

If the task description includes neither a ticket reference nor an explicit `NO-TICKET` decision, stop and ask: _"What is the ticket reference for this task (JIRA key, GitHub issue, or NO-TICKET)?"_ Do not ask that question when a valid no-ticket decision is already provided.

[`check-description.yml`](.github/workflows/check-description.yml) is a **JIRA link check only**. The `No JIRA ticket` label means this PR has **no JIRA ticket** (skip that check). It does **not** mean there is no ticket of any kind — you may still link a GitHub issue under Related tickets.

When creating a PR, keep the title and description concise.

Follow [CONTRIBUTING.md](CONTRIBUTING.md) for branch names, commit/PR title format, and the PR checklist.

### Branch before commit (never commit on `main`)

`main` is protected integration history. **AI agents MUST NOT commit, amend, or push directly on `main`.**

Required order before the first commit of a change:

1. Confirm the ticket reference, or an explicit `NO-TICKET` decision.
2. If not already on a correctly named feature branch, create and check it out from up-to-date `main` using the naming in [CONTRIBUTING.md](CONTRIBUTING.md).
3. Make changes and commit **only on that branch**.
4. Open a pull request into `main` (do not merge locally into `main`).

If work was accidentally committed on `main`, move it onto a correctly named branch and reset local `main` to `origin/main` before continuing. Never push those commits to `origin/main`.

### First commit / PR title

Use the format from [CONTRIBUTING.md](CONTRIBUTING.md). The first commit message becomes the PR title.

`Feat` / `Fix` / `Breaking` describe the change for humans; release versioning is owned by CI/CD workflows.

Prefer putting those prefixes only on the first commit / PR title, not on follow-up commits.

### Follow-up commits

After the first commit, follow-up commits **may** use a short `chore:` (or similar) message without repeating the ticket reference:

```text
chore: fix linting
chore: update tests
```

### Creating pull requests

**Reuse the repo PR template.** Do not invent a custom body (e.g. Summary / Test plan).

Source of truth:

- [`.github/pull_request_template.md`](.github/pull_request_template.md)

When creating a PR (including via `gh pr create`), base the description on that template and fill it in:

```markdown
This PR
<one short sentence or bullet list of what changed>

## Related tickets

- [WRS-NUMBER](https://chilipublishintranet.atlassian.net/browse/WRS-NUMBER)

## Screenshots
```

Rules:

- Prefer a **JIRA** browse link when a JIRA ticket exists (required by [`check-description.yml`](.github/workflows/check-description.yml)).
- For **GitHub-issue-only** or **`NO-TICKET`** work, still keep the template structure; link the GitHub issue under Related tickets when applicable; apply the `No JIRA ticket` label so the JIRA check is skipped.
- Keep the title concise and aligned with the first commit message (see [CONTRIBUTING.md](CONTRIBUTING.md)).
- Do not hand-write CDN / preview URLs in the PR body when CI comments them.
- Do **not** include Cursor attribution in the PR body (e.g. "Made with Cursor", "Generated by Cursor", or similar footers).

---

## Project Structure

```text
src/
  main.tsx             # Public StudioUI loader APIs
  index.ts             # IIFE entry → window.StudioUI
  es-index.ts          # ES module default export
  App.tsx, Canvas.tsx, MainContent.tsx, …
  components/          # Feature UI (variables, navbar, layouts, …)
  contexts/
  store/               # Redux Toolkit
  services/
  hooks/, editor/, core/
  types/, utils/, styles/
  _dev-execution/      # Local/dev harness
  tests/
automation-tests/      # Playwright E2E
documentation/         # Advanced integration guides
.github/               # Actions workflows and reusable actions
```

Standard local files (not committed secrets):

- `.env` — Auth0 / template values for local runs (see [README.md](README.md))
- `.npmrc` — private registry auth for `@chili-publish` and `@fortawesome`

---

## Coding conventions

- Treat `StudioUI` loader APIs in `src/main.tsx` as the stable public embed contract (`studioUILoaderConfig`, etc.).
- Use **Redux Toolkit** for app state; prefer SDK / environment work in hooks, services, or the store — not ad-hoc in render trees.
- Reuse `@chili-publish/grafx-shared-components` for shared UI; use `@chili-publish/studio-sdk` through existing patterns.
- React functional components + TypeScript; style with **styled-components** and the existing theme.
- Respect ESLint `boundaries`: do not cross-import `src/**` and `automation-tests/**`.
- Prefer path aliases already configured (`src/*`, `@mocks/*`, `@tests/*`, …).
- Tests: Jest + React Testing Library; Playwright under `automation-tests/`. Aim for solid coverage on new code (`yarn cover`).
- Keep `@chili-publish/studio-sdk` and `@chili-publish/grafx-shared-components` pinned (valid semver, no ranges). Watch bundle-size gates on PRs.
- Follow ESLint + Prettier; resolve TypeScript errors before opening a PR.

---

## Package Manager

Use **Yarn Classic (v1)** — not npm, not pnpm, not Yarn Berry.

| Requirement | Value                          |
| ----------- | ------------------------------ |
| Yarn        | `1.22.x` (lockfile is Yarn v1) |
| Node        | CI uses `22.x`                 |

```bash
yarn install
```

Do not mix package managers. Prefer `yarn <script>` over `npm run <script>`.

Private packages require a configured `.npmrc` (GitHub Packages for `@chili-publish`, Font Awesome for `@fortawesome`). See [README.md](README.md).

---

## Workflows

### Install and run

```bash
# create .env first when using real templates (ask a teammate for values)
yarn install
yarn dev
```

App: [http://localhost:3002](http://localhost:3002)

Useful scripts: `yarn test`, `yarn testw`, `yarn cover`, `yarn lint`, `yarn ci-lint`, `yarn build`, `yarn playwright-test`.

### Link local shared packages (`yarn link`)

From the package repo (e.g. shared-components or studio-sdk):

```bash
yarn build
yarn link
```

From **this** repo:

```bash
yarn link @chili-publish/grafx-shared-components
# and/or
yarn link @chili-publish/studio-sdk
```

Rebuild the linked package after local changes. Do not commit lockfile/dependency churn that only exists because of a temporary link. See [README.md](README.md) for further detail.
