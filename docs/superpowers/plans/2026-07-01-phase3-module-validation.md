# Phase 3: Module Usage Validation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional module parameter validation to ansible-good-practices using ansible-know MCP tools.

**Architecture:** A new section appended to the existing SKILL.md that runs after the CoP review + auto-fix cycle (step 9). It extracts module FQCNs from reviewed code, validates parameters against live module docs via `get_module_doc`, suggests better-fit modules via pattern matching and `search_modules`, and reports findings using the existing severity format.

**Tech Stack:** SKILL.md prompt (markdown), ansible-know MCP tools (`get_module_doc`, `search_modules`)

## Global Constraints

- Single file change: `ansible-good-practices/skills/ansible-good-practices/SKILL.md`
- Optional integration — skill must work identically to v2.1.0 without ansible-know MCP
- Gate pattern: `If get_module_doc and search_modules MCP tools are available`
- Module validation runs AFTER step 9 (CoP auto-fix), not before
- After editing SKILL.md, run `node scripts/gen-marketplace.js` to update marketplace.json and plugin.json
- Spec: `docs/superpowers/specs/2026-07-01-phase3-module-validation-design.md`

---

### Task 1: Update front matter and add module validation section

**Files:**
- Modify: `ansible-good-practices/skills/ansible-good-practices/SKILL.md`
- Auto-updated: `.claude-plugin/marketplace.json`, `ansible-good-practices/.claude-plugin/plugin.json`

- [ ] **Step 1: Update front matter**

In `ansible-good-practices/skills/ansible-good-practices/SKILL.md`, make three front matter changes:

1. Change `version: 2.1.0` to `version: 2.2.0`

2. Replace the `description` value with:
```yaml
description: >-
  Review Ansible code against Red Hat CoP automation good practices.
  Use when the user wants to audit, lint, review, check, or validate
  Ansible roles, playbooks, collections, or inventory for compliance
  with CoP rules. Optionally validates module parameters against
  official docs via ansible-know MCP. Use when user says "lint my
  role", "check my playbook", "review best practices", or "audit my
  Ansible code". Do NOT use for general Python or YAML linting
  unrelated to Ansible.
```

3. Add a `compatibility` field after `user-invocable: true`:
```yaml
compatibility: >-
  Optionally uses ansible-know MCP server for module parameter
  validation. Falls back to CoP-only review when MCP is unavailable.
```

- [ ] **Step 2: Add the "Optional: Module usage validation" section**

Insert the following new section at the **end of the file**, after the Auto-fix section (step 9, line 233). This goes after the closing of step 9's last bullet and before the final blank line:

```markdown
## Optional: Module usage validation

If the `get_module_doc` and `search_modules` MCP tools are available in
your tool list (provided by the `ansible-know` MCP server), perform the
following module validation pass on the reviewed files. If these tools
are not available, skip this section entirely.

This step runs after the CoP review and auto-fix (step 9) so that module
names are already corrected to FQCN where possible.

### Step 1 — Extract module names

Scan all tasks in the reviewed files and collect every module name used.
Group into:
- **FQCN modules** (e.g., `ansible.builtin.copy`) — validate in step 2
- **Non-FQCN modules** (e.g., `copy`) — flag for FQCN resolution in
  step 3

### Step 2 — Validate parameters

For each unique FQCN (limit: **15 modules** to cap MCP calls), call
`get_module_doc(module_name=<fqcn>)`.

If the response has `doc_source: "unavailable"` or empty `params`, flag
the module as `MODULE_PARAM_ERROR` ("module not found — possible typo in
FQCN") and skip parameter validation for it.

Otherwise, check each task using that module against the returned
parameter specification:
- **Required parameters present?** — every param with `required: true`
  must appear in the task
- **Parameter names valid?** — check against both primary `name` AND
  the `aliases` list (e.g., `dest` is a valid alias for `path` in
  `ansible.builtin.file`, `attr` is valid for `attributes` in
  `ansible.builtin.copy`)
- **Values match types/choices?** — if a param has a `choices` list,
  the task's value must be one of them (e.g., `state: folder` is
  invalid for `ansible.builtin.file` — valid choices are `absent`,
  `directory`, `file`, `hard`, `link`, `touch`)
- **Deprecated parameters?** — flag with migration guidance
- **Module deprecated?** — suggest the replacement module

### Step 3 — Suggest better-fit modules

Use heuristic pattern matching on `command:`/`shell:` task arguments to
detect common patterns that have dedicated modules:
- `systemctl`/`service` commands → `ansible.builtin.service` or
  `ansible.builtin.systemd_service`
- `useradd`/`usermod` commands → `ansible.builtin.user`
- `cp`/`mv`/`install` commands → `ansible.builtin.copy` or
  `ansible.builtin.file`
- `yum`/`dnf`/`apt` commands → `ansible.builtin.package` (or the
  specific package manager module)
- `firewall-cmd`/`ufw` commands → search for firewall modules

For non-FQCN module names that were not fixed in auto-fix, use
`search_modules(keyword=<short_name>)` to suggest the FQCN.

### Step 4 — Classify and report

Classify module validation findings using these categories:

| Category | Maps to severity | Examples |
|----------|-----------------|----------|
| `MODULE_PARAM_ERROR` | ERROR | Required param missing, invalid param name, module not found |
| `MODULE_PARAM_WARNING` | WARNING | Deprecated param, type/choices mismatch |
| `MODULE_SUGGESTION` | INFO | Better module available, non-FQCN usage |

Present module validation findings in the same format as CoP findings:
severity level, rule description, file path and line number, offending
code snippet, and corrected code.

Add a "Module Usage Validation" group to the summary table:

| Rule Category | Status | Severity | Files Affected | Count |
|---|---|---|---|---|
| Module parameter errors | PASS/FAIL | ERROR | file1, file2 | N |
| Module deprecations | PASS/FAIL | WARNING | file1 | N |
| Module suggestions | - | INFO | file1 | N |

Include module validation ERRORs in the overall verdict — they are as
critical as CoP ERRORs.

### Step 5 — Offer to fix

After presenting module validation findings, ask: "Would you like me to
fix these module usage issues?"
- If yes, apply fixes starting with ERRORs, then WARNINGs
- Do not auto-fix INFO-level (suggestions) unless explicitly asked
- After fixing, re-validate the affected tasks to confirm corrections
```

- [ ] **Step 3: Regenerate marketplace index**

Run:
```bash
node scripts/gen-marketplace.js
```

Expected: `Generated marketplace.json with 6 plugins` — the ansible-good-practices entry should show the updated description and version 2.2.0.

- [ ] **Step 4: Verify the final file**

Read the full SKILL.md and verify:
- Front matter version is `2.2.0`
- Front matter has `compatibility` field
- Description mentions ansible-know MCP
- The module validation section appears after step 9 (Auto-fix)
- The gate check references `get_module_doc` and `search_modules`
- Step 2 mentions alias checking and `doc_source: "unavailable"` handling
- Step 3 uses heuristic pattern matching (not `search_modules`) for command/shell suggestions
- Step 4 severity table has 3 categories mapping to ERROR/WARNING/INFO
- Step 5 offers auto-fix with the same pattern as CoP auto-fix
- No "Claude Code" specific references (should be agent-agnostic)

- [ ] **Step 5: Commit**

```bash
git add ansible-good-practices/skills/ansible-good-practices/SKILL.md \
       ansible-good-practices/.claude-plugin/plugin.json \
       .claude-plugin/marketplace.json
git commit -m "feat: add module usage validation to good-practices (#23)

Add optional ansible-know MCP integration to ansible-good-practices.
When the MCP server is available, validates module parameters against
live docs via get_module_doc, checks for required params, invalid
names, type/choices mismatches, and suggests better-fit modules for
command/shell tasks. Falls back to CoP-only review when MCP is
unavailable.

Assisted-by: Claude Opus 4.6 <noreply@anthropic.com>"
```
