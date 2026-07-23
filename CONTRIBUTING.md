# Contributing

`main` is the integration branch. Open a pull request; do not push directly to `main`.

## Branch names

```text
<JIRA-KEY|issue-ref|NO-TICKET>-<short-description>
# e.g.: WRS-1234-fix-navbar
# or: 42-fix-variable-panel
# or: NO-TICKET-update-agents-md
```

## Commit messages and PR titles

The **first commit message** is used as the **PR title** on merge.

Always include a type prefix so the change kind is clear:

```text
[Feat|Feature|Fix|Breaking][<JIRA-KEY>|#ISSUE|NO-TICKET] <imperative short description>
```

| Prefix                 | Use when                             |
| ---------------------- | ------------------------------------ |
| `[Feat]` / `[Feature]` | New feature or capability            |
| `[Fix]`                | Bug fix or small non-breaking change |
| `[Breaking]`           | Compatibility-breaking change        |

Examples:

```text
[Feat][WRS-XXX] Add layout switcher shortcut
[Fix][#42] Correct variable panel scroll
[Fix][NO-TICKET] Update contributing conventions
```

Follow-up commits may use `chore: …` without repeating the ticket reference.

**Versioning:** `Feat` / `Fix` / `Breaking` describe the change for humans. Merge to `main` deploys via CI; UAT (`rc`) and PRD (stable) releases are done by the release workflows.

## Pull requests

Reuse [`.github/pull_request_template.md`](.github/pull_request_template.md).

Related tickets may be a **JIRA** link and/or a **GitHub issue**. [`.github/workflows/check-description.yml`](.github/workflows/check-description.yml) is a **JIRA link check only**. When there is no JIRA ticket (GitHub-issue-only or truly none), apply the `No JIRA ticket` label so that check is skipped — the label does not mean there is no ticket of any kind.

Prefer matching the PR title to the first commit message. Do not hand-write CDN / preview URLs in the PR body when CI comments them.

## Checklist

- Use Yarn Classic for install and scripts.
- Run relevant checks locally (`yarn lint`, `yarn test`, `yarn build` as applicable).
- Keep PRs focused.
- Unlink any temporary `yarn link` setups before final verification against published package versions when the change is not about that local package.
- Watch bundle size and keep `@chili-publish/studio-sdk` / `@chili-publish/grafx-shared-components` pinned to valid semver (no ranges).

AI coding agents: see [AGENTS.md](AGENTS.md) for agent-specific workflow rules and coding conventions.
