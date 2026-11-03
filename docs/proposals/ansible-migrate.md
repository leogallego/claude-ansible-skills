# Skill Proposal: ansible-migrate

**Date:** 2026-07-03
**Status:** Early draft — needs research and design refinement

## Purpose

Help migrate Ansible code from legacy patterns to current best practices. Focuses on mechanical transformations that are tedious to do by hand but straightforward to automate.

## Target migrations

| Migration | From | To |
|---|---|---|
| Bare module names → FQCNs | `copy:` | `ansible.builtin.copy:` |
| `with_*` → `loop:` | `with_items:`, `with_dict:` | `loop:` with appropriate filters |
| Boolean normalization | `yes`/`no`, `True`/`False` | `true`/`false` |
| Unnamed tasks | Tasks without `name:` | Named tasks in imperative form |
| `ansible_distribution` → bracket notation | `ansible_distribution` | `ansible_facts['distribution']` |
| Flat inventory → structured | Single file | Directory with group_vars/host_vars |
| Old role structure → collection-ready | Standalone role | Collection-packaged role |
| include → import (or vice versa) | Mixed usage | Consistent usage with rationale |

## Why it's needed

- These migrations are the most common ansible-lint findings in legacy codebases
- Each is mechanical but tedious across hundreds of files
- ansible-lint `--fix` handles some (FQCNs, booleans) but not all
- No tool handles the "explain why" aspect — users need to understand the migration, not just have it applied

## How it would work

1. **Scan** — analyze the codebase for legacy patterns, report findings with counts
2. **Explain** — for each migration type found, explain why the new pattern is better (link to CoP rules, ansible-lint rules, deprecation notices)
3. **Preview** — show before/after for a sample of changes
4. **Apply** — transform files with the user's approval, one migration type at a time
5. **Verify** — run ansible-lint after each migration to confirm improvement

## Information sources

| Source | What it provides |
|---|---|
| CoP references (bundled) | Rules and rationale for each pattern |
| `ansible-lint` rules | Detection and some auto-fix for FQCNs, booleans, unnamed tasks |
| `ansible-know` MCP | FQCN lookup for bare module names, deprecation info |
| ansible-core changelog | Deprecation timeline for specific patterns |

## Integration with existing skills

- `ansible-good-practices` identifies violations — this skill fixes them
- Could be invoked after a good-practices review: "want me to auto-fix the mechanical stuff?"
- `ansible-lint --fix` handles some transformations — this skill should detect what ansible-lint already fixed and skip those

## Open questions

1. How much overlap with `ansible-lint --fix`? Should this skill just be a wrapper around it with better UX, or does it add independent value?
2. Should it handle Python-level migrations (e.g., old module_utils patterns)?
3. Scope: single role, collection, or entire project?
4. Should it create a migration report (markdown) documenting what was changed and why?
5. How does this relate to `ansible-migrate-molecule` (issue #42)? Same skill family or independent?

## Next steps

- Survey what `ansible-lint --fix` actually handles in practice
- Identify the gap between what ansible-lint fixes and what users still need to do manually
- Design the scan/explain/preview/apply flow
- Determine if this is one skill or a family (ansible-migrate, ansible-migrate-molecule, etc.)
