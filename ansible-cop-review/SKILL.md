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

1. **Discover scope** — If the user specified files or a path, review those.
   Otherwise scan for all `*.yml`/`*.yaml` files, `templates/`, `defaults/`,
   `vars/`, `meta/`, `tasks/`, `handlers/`, `inventory/`, and `README.md`
   files in the working directory tree.

2. **Check every applicable rule category** against the discovered files:

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

3. **Report findings** — For each violation:
   - State the rule being violated (quote the rule text briefly)
   - Show the file path and line number
   - Show the offending code snippet
   - Provide the corrected code

4. **Summary table** — End with a markdown table:

   | Rule Category | Status | Files Affected | Count |
   |---|---|---|---|
   | Role naming | PASS/FAIL | file1, file2 | N |
   | ... | ... | ... | ... |

5. **Overall verdict** — State whether the code is compliant or not, and list
   the top 3 highest-priority fixes.

## Important

- Do NOT skip any rule category — check all of them.
- When a category does not apply (e.g., no templates exist), mark it N/A.
- Read `redhat-cop-automation-good-practices-scrap.md` for edge cases when a
  rule's applicability is unclear.
- Be precise about line numbers and file paths.
- If the rules are not available locally (no CLAUDE.md with Ansible rules or
  `redhat-cop-automation-good-practices-scrap.md`), fetch them from
  https://github.com/redhat-cop/automation-good-practices as a fallback.
