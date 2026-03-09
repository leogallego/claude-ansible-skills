---
name: ansible-cop-review
description: >-
  Review Ansible code against Red Hat CoP automation good practices.
  Use when the user wants to audit, lint, or review Ansible roles,
  playbooks, collections, or inventory for compliance with the rules
  defined in CLAUDE.md and redhat-cop-automation-good-practices-scrap.md.
user-invocable: true
---

# Ansible CoP Review

Review all Ansible code in the current project (or the path/files specified by
the user) against every rule in CLAUDE.md and
`redhat-cop-automation-good-practices-scrap.md`.

## Review process

1. **Determine review mode** — Check what the user requested:
   - **Full review** (default) — review all Ansible files in the project.
   - **Path/file review** — review only the files or path the user specified.
   - **Diff-aware review** — if the user asks to review "changed files",
     "my changes", or similar, run `git diff --name-only` (and
     `git diff --cached --name-only` for staged changes) to get the list of
     modified files. Only review those files. Mention which base you are
     diffing against (e.g., `HEAD`, `main`).
   - **Category filter** — if the user asks to check only specific rule
     categories (e.g., "just check naming", "skip documentation"), apply
     only those categories. List which categories are being checked and
     which are skipped at the start of the report.

2. **Discover scope** — Based on the review mode, identify files to review.
   For full reviews, scan for all `*.yml`/`*.yaml` files, `templates/`,
   `defaults/`, `vars/`, `meta/`, `tasks/`, `handlers/`, `inventory/`, and
   `README.md` files in the working directory tree.

3. **Run ansible-lint** — If `ansible-lint` is available on the system, run
   it against the discovered files and capture its output. Cross-reference
   ansible-lint findings with CoP rules in the report — map each
   ansible-lint rule ID to the corresponding CoP category where applicable.
   If `ansible-lint` is not available, note this and proceed with the
   manual review only.

4. **Parallel review for large projects** — If the project contains multiple
   roles or a large number of files (more than 3 roles or 30+ files), use
   the Agent tool with subagents to review roles/components in parallel.
   Each subagent reviews one role or logical group of files against all
   applicable rule categories. Merge subagent results into a single report.

5. **Check every applicable rule category** against the discovered files:

   - **Architecture** — Landscape / Type / Function / Component hierarchy
   - **Role naming** — role-prefixed variables, `__` internal prefix, no
     dashes, no special chars, tag prefixes
   - **Variable placement** — defaults vs vars, commented-out dangerous
     defaults, no user-facing vars in `vars/main.yml`
   - **Idempotency & check mode** — `changed_when:` on command/shell,
     idempotent module usage, re-run safety
   - **Argument validation** — `meta/argument_specs.yml` existence and
     completeness
   - **File references** — `{{ role_path }}` usage, no relative paths
   - **Templates** — `{{ ansible_managed | comment }}` header, `backup: true`,
     no timestamps
   - **Platform support** — `include_vars` loop pattern, `first_found`
     pattern, `ansible_facts['...']` bracket notation
   - **Fact gathering** — minimum subset, graceful handling of
     `gather_facts: false`
   - **Playbook structure** — no mixed `roles:` + `tasks:`, tag safety,
     `verbosity:` on debug tasks
   - **Inventory** — structured directories, no vars in hosts file, no manual
     host loops
   - **YAML style** — 2-space indent, `true`/`false` booleans, line length
     under 120, folded scalars
   - **Naming** — `snake_case` everywhere, imperative task names, sub-task
     prefixes
   - **Module usage** — FQCN, `loop:` over `with_*`, import/include patterns
   - **Collections** — semantic versioning, README, LICENSE
   - **Providers** — `$ROLENAME_provider` pattern, auto-detection
   - **Documentation** — README.md with examples, variable specs, idempotency
     designation, rollback info

## Severity levels

Classify every finding with one of these severity levels:

- **ERROR** — Must fix. Violates a MUST/NEVER/ALWAYS rule from CLAUDE.md.
  Examples: missing `changed_when:` on `command:` tasks, user-facing
  defaults in `vars/main.yml`, non-FQCN module names, `yes`/`no` booleans.
- **WARNING** — Should fix. Violates a best practice or SHOULD-level
  recommendation. Examples: missing `backup: true` on template tasks,
  missing README sections, no platform-specific variable loading.
- **INFO** — Suggestion. Opportunity to improve but not a rule violation.
  Examples: task could use a more descriptive name, variable could be
  documented better, a role could benefit from the provider pattern.

## Report format

6. **Report findings** — Group findings by file, then by severity. For each
   violation:
   - Severity level: `[ERROR]`, `[WARNING]`, or `[INFO]`
   - The rule being violated (quote the rule text briefly)
   - File path and line number
   - The offending code snippet
   - The corrected code
   - If from ansible-lint: include the ansible-lint rule ID

7. **Summary table** — End with a markdown table:

   | Rule Category | Status | Severity | Files Affected | Count |
   |---|---|---|---|---|
   | Role naming | PASS/FAIL | ERROR/WARNING/INFO | file1, file2 | N |
   | ... | ... | ... | ... | ... |

   Include totals row: total ERRORs, WARNINGs, and INFOs.

8. **Overall verdict** — State whether the code is compliant or not, and list
   the top 3 highest-priority fixes (always prioritize ERRORs first).

## Auto-fix

9. **Offer to fix** — After presenting the report, ask the user:
   "Would you like me to automatically fix these violations?"
   - If yes, apply fixes grouped by file, starting with ERRORs, then
     WARNINGs. Do not auto-fix INFO-level findings unless the user
     explicitly asks.
   - After applying fixes, re-run the review on the modified files to
     confirm all targeted violations are resolved.
   - Report what was fixed and what remains (if anything requires manual
     intervention, explain why).

## Important

- Do NOT skip any rule category — check all of them (unless the user
  requested a category filter).
- When a category does not apply (e.g., no templates exist), mark it N/A.
- Read `redhat-cop-automation-good-practices-scrap.md` for edge cases when a
  rule's applicability is unclear.
- Be precise about line numbers and file paths.
- If the rules are not available locally (no CLAUDE.md with Ansible rules or
  `redhat-cop-automation-good-practices-scrap.md`), fetch them from
  https://github.com/redhat-cop/automation-good-practices as a fallback.
