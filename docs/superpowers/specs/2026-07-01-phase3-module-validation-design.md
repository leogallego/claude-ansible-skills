# Design: Phase 3 — Module usage validation for ansible-good-practices

## Context

The `ansible-good-practices` skill (v2.1.0) reviews Ansible code against Red
Hat CoP rules loaded from AsciiDoc references. It checks naming, structure,
idempotency, style, and other categories, classifying findings as
ERROR/WARNING/INFO. It can optionally run `ansible-lint` and supports
diff-aware reviews, category filtering, parallel review with subagents, and
auto-fix.

The skill currently checks module usage at the CoP level only — FQCN,
`loop:` over `with_*`, import/include patterns. It does not validate whether
tasks use correct module parameters, because it has no access to module
documentation at review time.

The `ansible-know` MCP server provides `get_module_doc` (structured parameter
docs) and `search_modules` (module discovery by keyword). These can be used
to validate task parameters against actual module specifications.

**Issue:** [#23](https://github.com/leogallego/claude-ansible-skills/issues/23)
**Parent:** [#20](https://github.com/leogallego/claude-ansible-skills/issues/20)
**Spec:** `docs/spec-skills-know-mcp-integration.md` (Phase 3 section)

## Design decisions

### Separate pass, not inline

Module validation runs as a **separate pass after the CoP review and
auto-fix cycle**, not woven into the CoP review steps. This keeps the
optional MCP logic cleanly separated from the core review flow and matches
the pattern used in Phase 2 (ansible-scaffold-role).

### Runs after auto-fix

The module validation step runs **after** the CoP auto-fix (step 9), not
before. This means:
- If the user accepted auto-fix, modules already have FQCNs, making
  parameter lookup straightforward
- If the user declined auto-fix, module validation still works and may
  redundantly flag non-FQCN usage — this is fine, it reinforces the point

### Optional integration

Same gate pattern as Phase 2:
```
If `get_module_doc` and `search_modules` MCP tools are available,
perform the following. If not, skip entirely.
```

Without the MCP server, the skill behaves identically to v2.1.0.

## File to change

**Single file:** `ansible-good-practices/skills/ansible-good-practices/SKILL.md`

No new files. No deletions.

## Changes to SKILL.md

### Change 1: Add "Optional: Module usage validation" section

Insert after step 9 (Auto-fix) and before the end of the skill. This section
contains four steps:

**Step 1 — Extract module FQCNs.** Scan all tasks in the reviewed files and
collect every module name used. Group by FQCN vs non-FQCN (short names).

**Step 2 — Validate parameters.** For each unique FQCN (limit: 15 modules
to cap MCP calls), call `get_module_doc(module_name=<fqcn>)`. If the
response has `doc_source: "unavailable"` or empty `params`, flag the module
as unresolvable (MODULE_PARAM_ERROR — "module not found, possible typo in
FQCN") and skip parameter validation for it. Otherwise, check each task
against the returned parameter specification:
- Required parameters present?
- Parameter names valid? Check against both primary names AND aliases from
  the `aliases` field (e.g., `dest` is a valid alias for `path` in
  `ansible.builtin.file`, `attr` is a valid alias for `attributes` in
  `ansible.builtin.copy`)
- Values match expected types/choices?
- Deprecated parameters? (flag with migration path)
- Module itself deprecated? (suggest replacement)

**Step 3 — Suggest better-fit modules.** Use heuristic pattern matching on
`command:`/`shell:` task arguments to detect common patterns that have
dedicated modules, then confirm with `search_modules` if needed:
- `systemctl`/`service` commands → `ansible.builtin.service` or
  `ansible.builtin.systemd_service`
- `useradd`/`usermod` commands → `ansible.builtin.user`
- `cp`/`mv`/`install` commands → `ansible.builtin.copy` or
  `ansible.builtin.file`
- `yum`/`dnf`/`apt` commands → `ansible.builtin.package` (or specific)
- `firewall-cmd`/`ufw` commands → search for firewall modules
- Non-FQCN module names that weren't fixed in auto-fix → use
  `search_modules(keyword=<short_name>)` to suggest the FQCN

**Step 4 — Classify and report.** Three new finding categories that merge
into the existing report format:

| Category | Maps to severity | Examples |
|----------|-----------------|----------|
| `MODULE_PARAM_ERROR` | ERROR | Required param missing, invalid param name |
| `MODULE_PARAM_WARNING` | WARNING | Deprecated param, type/choices mismatch |
| `MODULE_SUGGESTION` | INFO | Better module available, non-FQCN usage |

Findings use the same format as CoP findings: severity, rule description,
file path, line number, offending snippet, corrected code.

After presenting module validation findings, offer auto-fix with the same
pattern as the CoP auto-fix: "Would you like me to fix these module usage
issues?" Fix ERROR and WARNING by default, INFO only if requested.

### Change 2: Update report format sections

Add a "Module Usage Validation" group to the summary table (step 7) when
module validation ran:

```
| Module parameter errors | FAIL | ERROR | tasks/main.yml | 2 |
| Module suggestions | - | INFO | tasks/install.yml | 1 |
```

The overall verdict (step 8) should incorporate module validation findings
when present — ERRORs from module validation are as critical as CoP ERRORs.

### Change 3: Update front matter

- Version: 2.1.0 → 2.2.0
- Description: add "Optionally validates module parameters against official
  docs via ansible-know MCP"
- Add compatibility note about optional ansible-know dependency

## Updated flow

```
1.    Determine review mode
2.    Discover scope
3.    Run ansible-lint (if available)
4.    Parallel review for large projects
5.    Check every applicable rule category (CoP review)
6.    Report findings
7.    Summary table
8.    Overall verdict
9.    Auto-fix offer (CoP findings)
10.   [NEW] Module usage validation (if ansible-know available)
11.   [NEW] Module validation report + auto-fix offer
```

## What this does NOT change

- The 13 CoP rule categories — all stay identical
- The AsciiDoc loading and parsing logic
- The section selection table
- The token optimization two-pass approach
- The diff-aware and category filter modes
- The ansible-lint integration
- The parallel subagent review
- Behavior without ansible-know MCP — identical to v2.1.0

## Verification plan

### Test 1: With ansible-know MCP connected

1. Create a test role with intentional module parameter errors:
   - `ansible.builtin.copy` with an invalid parameter name like
     `sourcefile` (not a real param or alias)
   - `ansible.builtin.service` missing required `name` parameter
   - `ansible.builtin.file` with `state: folder` (invalid — valid
     choices are absent, directory, file, hard, link, touch)
   - `ansible.builtin.file` with `dest:` (valid — it's an alias for
     `path`, should NOT be flagged)
   - `command: systemctl enable nginx` (should suggest
     `ansible.builtin.service` via pattern matching)
2. Run `/ansible-good-practices` against the test role
3. Verify:
   - CoP review runs first and reports its findings
   - Module validation runs after and reports parameter issues
   - Severity categories are correct (ERROR for missing required,
     WARNING for deprecated, INFO for suggestions)
   - Auto-fix offer appears for module findings

### Test 2: Without ansible-know MCP

1. Disconnect ansible-know MCP server
2. Run `/ansible-good-practices` against the same test role
3. Verify:
   - CoP review runs normally
   - No module validation step appears
   - No error messages about missing MCP
   - Output is identical to v2.1.0 behavior

### Test 3: After CoP auto-fix

1. Run `/ansible-good-practices` on a role with both CoP violations and
   module parameter errors
2. Accept CoP auto-fix
3. Verify module validation runs on the fixed code (FQCNs should be
   resolved, so parameter lookup works cleanly)
