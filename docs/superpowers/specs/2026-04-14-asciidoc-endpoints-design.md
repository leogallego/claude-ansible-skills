# Design: AsciiDoc Endpoints for Ansible Good Practices Skills

## Goal

Replace the monolithic ~35K-token scraped markdown file
(`redhat-cop-automation-good-practices-scrap-2026-03.md`) with per-section
AsciiDoc reference files loaded selectively. Rename the plugin from
`ansible-cop-review` to `ansible-good-practices`. Distribute relevant
sections to all other skills as bundled references.

All work happens on the `ascii-endpoints` feature branch for testing before
merging to `main`.

## Decisions

| Question | Decision |
|---|---|
| Caching | Cache fetched `.adoc` files in `tmp/` for the session |
| Version pinning | Fetch from `main` by default, allow override via `--ref` argument |
| CLAUDE.md overlap | Always load AsciiDoc sections as baseline; CLAUDE.md rules take precedence when present |
| Primary source | Bundled local files (kept fresh by CI); GitHub fetch is fallback |
| Fallback if unreachable | Bundled files > GitHub fetch > CLAUDE.md only > warn and stop |
| Plugin rename | `ansible-cop-review` -> `ansible-good-practices` |
| Other skills | Each gets its own copy of relevant sections in `references/` |
| Branch strategy | Feature branch `ascii-endpoints`, merge to `main` after testing |

## Source Endpoints

All files live in `redhat-cop/automation-good-practices` on GitHub. Each
section is a single `README.adoc`:

| Section | File | ~Tokens | Content |
|---|---|---:|---|
| structures | `structures/README.adoc` | 300 | Landscape/Type/Function/Component hierarchy |
| roles | `roles/README.adoc` | 1,850 | Role design, naming, variables, idempotency, check mode, argument validation, templates, platform support, providers |
| collections | `collections/README.adoc` | 230 | Collection structure, implicit variables, versioning |
| playbooks | `playbooks/README.adoc` | 330 | Keeping playbooks simple, tags, debug verbosity |
| inventories | `inventories/README.adoc` | 1,230 | SSOT, As-Is vs To-Be, structured directories, host looping |
| plugins | `plugins/README.adoc` | 480 | Python plugin guidelines, testing, documentation |
| coding_style | `coding_style/README.adoc` | 1,280 | YAML/Jinja2 syntax, naming conventions, FQCN, module usage |
| **Total** | | **~5,700** | |

Raw URL template:
```
https://raw.githubusercontent.com/redhat-cop/automation-good-practices/{ref}/{section}/README.adoc
```
`{ref}` defaults to `main`, overridable via `/ansible-good-practices --ref <tag-or-sha>`.

## Loading Priority

```
1. Bundled references/*.adoc files in the plugin directory (primary)
   |
   v (if missing)
2. Fetch from GitHub raw URLs, cache in tmp/ for the session
   |
   v (if unreachable)
3. CLAUDE.md Ansible rules only (warn: review may be less thorough)
   |
   v (if no CLAUDE.md rules either)
4. Report inability to review and stop
```

CLAUDE.md Ansible rules (global or project), when present, always take
precedence over AsciiDoc for rule application and verdicts. AsciiDoc
provides full context, examples, and rationale.

## Section Selection Logic

Based on detected file types in the review scope, load only relevant
sections:

| Files detected | Sections to load | ~Tokens |
|---|---|---:|
| `tasks/` `defaults/` `vars/` `meta/` `handlers/` `templates/` | roles, coding_style | 3,100 |
| Playbooks (`.yml` with `hosts:`) | playbooks, coding_style | 1,600 |
| `inventory/` `group_vars/` `host_vars/` | inventories | 1,230 |
| `galaxy.yml` present | collections, roles, coding_style | 3,350 |
| `plugins/` `modules/` | plugins, coding_style | 1,760 |
| Unclear or full review | All 7 sections | 5,700 |

Multiple matches are unioned. When more than one group is needed,
`structures` is also loaded for architectural framing.

## Plugin Rename

`ansible-cop-review` -> `ansible-good-practices`:

- Directory: `ansible-cop-review/` -> `ansible-good-practices/`
- `plugin.json`: name field updated
- `SKILL.md`: frontmatter name updated
- `.claude-plugin/marketplace.json`: entry updated
- Invocation: `/ansible-cop-review` -> `/ansible-good-practices`
- Old directory removed
- Monolithic `.md` file dropped

## Per-Plugin Bundled References

Each plugin gets only the sections it needs:

```
ansible-good-practices/
  references/           -> all 7 sections

ansible-new-role/
  references/           -> roles.adoc, coding_style.adoc

ansible-new-collection/
  references/           -> collections.adoc, roles.adoc, coding_style.adoc

ansible-new-ee/
  references/           -> coding_style.adoc

ansible-zen/
  references/           -> structures.adoc
```

## Update Script

`scripts/update-cop-references.sh`:

- Fetches all 7 `README.adoc` files from upstream via raw GitHub URLs
- Accepts optional `--ref` argument (defaults to `main`)
- Renames to `{section}.adoc` (drops `README.adoc` nesting)
- Distributes each file to every plugin that needs it per the mapping above
- Idempotent: safe to run repeatedly

## GitHub Action

`.github/workflows/update-cop-references.yml`:

- Schedule: weekly (e.g., `cron: '0 8 * * 1'` — Monday 8am UTC)
- Steps: checkout, run update script, check for changes, open PR if changed
- PR title: "chore: update CoP reference files from upstream"
- Single PR with all changes across all plugins

## SKILL.md Changes

### New section: "Loading reference rules"

Replaces the current "Important" and "Rules fallback" sections:

1. Determine needed sections from the mapping table based on files being reviewed
2. Load from bundled `references/*.adoc` (primary)
3. If missing: fetch from GitHub, cache in `tmp/`, warn if using fallback
4. Layer CLAUDE.md rules on top (precedence override)
5. If no rules available at all: warn and stop

### New section: "AsciiDoc parsing notes"

Compact reference for interpreting AsciiDoc structure:
- `==` headings = individual guidelines
- `Explanations::` = actionable rule content
- `Examples::` = code samples
- Ignore `[%collapsible]`, `====` delimiters, `include::`, `image::`

### Removed

- All references to `redhat-cop-automation-good-practices-*.md`
- The "Rules fallback" section (merged into loading section)
- Glob-for-local-file logic

### Unchanged

- Review process steps 1-9
- Severity levels (ERROR/WARNING/INFO)
- Report format and summary table
- Auto-fix flow
- Easter egg

## Other Skills Updates

The 4 other skills' fallback sections updated to:
- Reference their own `references/*.adoc` files instead of the monolithic file
- Use the same loading priority (bundled > GitHub fetch > CLAUDE.md > stop)
- Remove all `redhat-cop-automation-good-practices-*.md` references

## Files Created

| File | Purpose |
|---|---|
| `scripts/update-cop-references.sh` | Fetches and distributes AsciiDoc sections |
| `.github/workflows/update-cop-references.yml` | Weekly CI to keep references fresh |
| `ansible-good-practices/references/*.adoc` (7 files) | Bundled reference sections |
| `ansible-new-role/references/*.adoc` (2 files) | Role-relevant sections |
| `ansible-new-collection/references/*.adoc` (3 files) | Collection-relevant sections |
| `ansible-new-ee/references/*.adoc` (1 file) | EE-relevant section |
| `ansible-zen/references/*.adoc` (1 file) | Zen-relevant section |

## Files Modified

| File | Change |
|---|---|
| `ansible-good-practices/skills/ansible-good-practices/SKILL.md` | Rewritten loading logic, AsciiDoc parsing notes, remove monolithic refs |
| `ansible-good-practices/.claude-plugin/plugin.json` | Rename |
| `ansible-new-role/skills/ansible-new-role/SKILL.md` | Update fallback section |
| `ansible-new-collection/skills/ansible-new-collection/SKILL.md` | Update fallback section |
| `ansible-new-ee/skills/ansible-new-ee/SKILL.md` | Update fallback section |
| `ansible-zen/skills/ansible-zen/SKILL.md` | Update fallback section |
| `.claude-plugin/marketplace.json` | Update plugin entry for rename |
| `CLAUDE.md` | Update skill list entry |

## Files Removed

| File | Reason |
|---|---|
| `ansible-cop-review/` (entire directory) | Renamed to `ansible-good-practices/` |
| `ansible-cop-review/redhat-cop-automation-good-practices-scrap-2026-03.md` | Replaced by per-section files |
