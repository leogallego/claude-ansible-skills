# Skill Proposal: ansible-troubleshoot

**Date:** 2026-07-03
**Status:** Early draft — needs research and design refinement

## Purpose

Systematic debugging of Ansible playbook and role failures. Parses error output, identifies root causes, suggests fixes, and guides users through common troubleshooting patterns.

## How it would work

### Input

User provides one or more of:
- Error output (pasted or from a file)
- A failing playbook/role path
- A description of unexpected behavior

### Analysis flow

1. **Parse error** — identify the error type (module failure, connection error, variable undefined, template error, permission denied, timeout, etc.)
2. **Classify** — map to a known error category with common causes
3. **Investigate** — read the relevant code (playbook, role, templates, variables) to find the root cause
4. **Suggest fixes** — propose specific changes with rationale
5. **Verify** — if possible, suggest a verification command to confirm the fix

### Common error categories

| Category | Examples | Investigation approach |
|---|---|---|
| Connection failures | SSH timeout, unreachable host, auth failure | Check inventory, ansible.cfg, SSH config |
| Module errors | Wrong parameters, missing dependencies | Look up module docs via ansible-know MCP, check parameter types |
| Variable errors | Undefined variable, wrong type, precedence conflict | Trace variable through defaults → inventory → vars → registered |
| Template errors | Jinja2 syntax, undefined filter, type mismatch | Parse template, check variable types |
| Idempotency failures | Changed on every run, check mode failures | Analyze task for missing changed_when, creates, etc. |
| Permission errors | Become failures, file permission denied | Check become config, file ownership |
| Collection/module not found | Missing FQCN, collection not installed | Check collections/requirements.yml, suggest FQCN |

## Why it's needed

- Ansible error messages can be cryptic (especially Jinja2 errors and module failures)
- Variable precedence debugging is one of the hardest things in Ansible
- Most debugging involves the same patterns repeated — a skill can encode these patterns
- The `ansible-know` MCP can look up module docs to check if parameters are valid

## Information sources

| Source | What it provides |
|---|---|
| `ansible-know` MCP `get_module_doc` | Module parameters, types, required fields — to validate usage |
| `ansible-know` MCP `search_docs` | Error-specific documentation, troubleshooting guides |
| CoP references (bundled) | Variable precedence rules, common anti-patterns |
| The failing code itself | Playbooks, roles, templates, inventory to analyze |

## Integration with existing skills

- Could be invoked when `ansible-good-practices` finds issues — "want to debug this?"
- Complements `ansible-docs` — docs answers "how do I use X?", troubleshoot answers "why is X failing?"
- Could work with `ansible-molecule` — "my molecule test fails, help me debug it"

## Open questions

1. How interactive should this be? Step-by-step guided debugging vs one-shot analysis?
2. Should it actually run ansible commands (e.g., `ansible-playbook --syntax-check`, `ansible-inventory --list`) or just analyze code?
3. How does it handle environment-specific issues (e.g., "works on my machine but fails in CI")?
4. Should it maintain a knowledge base of common error patterns, or rely on MCP docs each time?
5. Is this too broad? Would it be better as a set of focused skills (ansible-debug-vars, ansible-debug-connection, etc.)?
6. How does this differ from just asking Claude to debug? The value-add needs to be in structured investigation, not just "read the error."

## Feasibility concerns

This is the hardest skill to build well because:
- Debugging is inherently open-ended — hard to encode in a fixed flow
- Error context matters enormously (inventory, variables, environment)
- The skill needs to be better than "just ask Claude" to justify its existence
- May need to actually run commands to gather diagnostic info, which is more invasive than other skills

## Next steps

- Catalog the most common Ansible error patterns (from StackOverflow, GitHub issues, community forums)
- Determine if a structured debugging flow adds value over Claude's natural debugging ability
- Prototype with a few common error types to test feasibility
- Decide on scope — broad troubleshooter vs focused debug helpers
