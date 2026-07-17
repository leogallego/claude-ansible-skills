# Plan: Skill Evaluation Framework

**Status:** In progress — immediate fixes applied, CI checks and trigger cases pending
**Issue:** TBD
**Date:** 2026-07-16 (updated 2026-07-17)
**Context:** Based on Phillip's talk (Google DeepMind) on skill evals, SkillsBench 1.1 findings, and project needs

---

## Problem

7 skills, zero evals. CI validates structure (frontmatter, references, marketplace) but not whether skills are well-formed for triggering or whether their content follows known good practices from SkillsBench research.

## Design Principle

Biggest wins, simplest implementation, zero CI cost. Every CI check must be a shell script — no LLM calls, no API keys, no token spend. LLM-based checks are development-time tools run locally, not CI gates.

This project is **harness-agnostic** — skills are packaged as a Claude Code plugin marketplace for convenience, but SKILL.md files work with any agent that supports the skills protocol. Evals should not depend on Claude Code internals.

## Key findings from the transcript (with ROI filter)

| Finding | Applies to us | ROI | Action |
|---------|--------------|-----|--------|
| Skills >500 lines degrade performance | `ansible-new-molecule` is 905 lines | High — free to check | CI gate: fail if any SKILL.md >500 lines |
| 50% of failures = bad trigger description | 3 model-invocable skills | High — free to check | CI gate: require negative guidance in descriptions |
| Write 5 positive + 5 negative prompts | All 7 skills have 0 | Medium — local dev tool | Local script: trigger accuracy check (LLM, not CI) |
| Remove no-ops from skills | Unknown | Medium | Audit during eval writing |
| AI-generated skills can hurt | Possible in some sections | Low — hard to detect | Manual audit |
| Run ablation (with/without skill) | Never done | Low — expensive, manual | Document process, do occasionally |

---

## Confirmed Findings and Applied Fixes

Ran all Tier 1 checks against the current skills on 2026-07-17. Results and actions:

### Checks that passed

- **Description word count** — all 7 skills in 70-106 word range (target 30-150)
- **YAML examples** — all 3 skills with embedded YAML blocks parse correctly
- **No-op detection** — zero no-ops found across all skills
- **Non-Ansible routing** — all skills correctly exclude Python, Terraform, Dockerfile, React prompts

### Issues found and fixed

| Issue | Skill | Fix applied |
|-------|-------|-------------|
| No negative guidance in description | `ansible-new-ee` | Added "Do NOT use for reviewing existing EEs (use ansible-good-practices instead)" |
| No docs boundary in description | `ansible-good-practices` | Added "Do NOT use for answering Ansible module usage questions or checking syntax against official Ansible documentation (use ansible-docs instead)" |
| No docs boundary in description | `ansible-zen` | Added "Do NOT use for Ansible module reference or documentation lookups (use ansible-docs instead)" |
| No scaffold boundary in description | `ansible-new-role` | Added "Do NOT use for creating collections (use ansible-new-collection) or adding molecule tests to existing roles (use ansible-new-molecule)" |
| No molecule delegation | `ansible-new-role` | Added "After scaffolding" section offering `/ansible-new-molecule` |
| No molecule delegation | `ansible-new-collection` | Added "After scaffolding" section offering `/ansible-new-molecule` |

### Issues found, not yet fixed

| Issue | Skill | Status |
|-------|-------|--------|
| 905 lines (>500 limit) | `ansible-new-molecule` | Separate task — move content to references/ |

### Boundary simulation results

Tested 30 prompts against proposed descriptions. 27/30 route correctly. 3 pre-existing ambiguities (not caused by changes, not worth over-specifying):

- "check if my module parameters are correct" — could match good-practices or docs. New clause helps route to docs for standalone param questions.
- "clean up my role" — could match zen or good-practices. Leans zen. Either gives useful output.
- "what's the best way to structure my playbook?" — could match zen or docs. Either gives useful output.

Caught one issue in simulation: `ansible-new-role` negative clause must say "to existing roles" to avoid blocking "create a role with molecule tests" — fixed before applying.

---

## Eval Tiers

### Tier 1: Structural checks (CI, zero cost)

Shell-script checks that run on every PR. No LLM, no API keys. Extend the existing `validate-skills.yml`.

| Check | Why (from transcript) | How | Status |
|-------|----------------------|-----|--------|
| SKILL.md line count ≤ 500 | SkillsBench: >500 lines degrades performance | `wc -l` | **To implement in CI** |
| Description has negative guidance | 50% of failures = wrong trigger | `grep -c "Do NOT"` in description block | **To implement in CI** (all skills now pass) |
| Description word count 30-150 | Too short = under-triggers, too long = context cost | `wc -w` on description field | **To implement in CI** (all skills pass) |
| No duplicate trigger phrases across skills | Overlapping descriptions confuse the model | Extract trigger phrases, check uniqueness | **To implement in CI** |
| References exist for paths in SKILL.md | Broken references = skill fails at runtime | `grep` reference paths, check files exist | Already covered by existing CI |
| YAML examples in SKILL.md parse correctly | Bad YAML examples teach bad patterns | Extract fenced YAML, `yaml.safe_load()` | **To implement in CI** |
| No-op detection (warning-only) | AI-generated skills include fluff | `grep` for known no-op patterns | **To implement in CI** (all skills pass currently) |

### Tier 2: Trigger accuracy (local development, costs money)

A local Python script developers run when writing or updating skill descriptions. NOT in CI.

**What it does:** Takes a skill description + test prompts, asks a cheap LLM "should this skill trigger?", reports accuracy.

```bash
python evals/check_triggers.py ansible-good-practices
```

The test cases are committed to the repo (they document expected behavior and serve as boundary specs between skills). The runner script is also committed. Neither runs in CI.

Cost: ~$0.001/case locally. Full sweep of 70 cases costs ~$0.07.

### Tier 3: Manual output review (no tooling needed)

When you change a skill, run it manually against a known input, eyeball the output. No framework, no fixtures, no judge.

For scaffold skills: does the generated role/collection/EE have the right files?
For review skills: does the review catch the known violations?

If we want to formalize later, save outputs as fixtures and write regex checks. Only if Tier 1 and 2 prove their value first.

---

## Directory Structure

```
evals/
├── README.md                  # How to run, how to add cases
├── check_triggers.py          # Tier 2: local trigger accuracy script
└── cases/                     # Test prompts per skill (committed)
    ├── ansible-good-practices.yaml
    ├── ansible-new-role.yaml
    ├── ansible-docs.yaml
    ├── ansible-zen.yaml
    ├── ansible-new-collection.yaml
    ├── ansible-new-ee.yaml
    └── ansible-new-molecule.yaml
```

Tier 1 checks live in `.github/workflows/validate-skills.yml` — they extend the existing workflow, not a separate system.

---

## Test Cases Per Skill

Each skill gets 10 test prompts (5 positive, 5 negative) committed in `evals/cases/`. These serve two purposes:

1. **Tier 2 input** — feed to `check_triggers.py` during development
2. **Boundary documentation** — make explicit where one skill ends and another begins

### Model-invocable skills (trigger accuracy most valuable)

**ansible-good-practices** — 5 positive (review, audit, lint, check, idempotency) + 5 negative (Python code, Terraform, Dockerfile, docs question → ansible-docs, simplify → ansible-zen)

**ansible-docs** — 5 positive (module usage, navigator syntax, docs review, deprecation, changelog) + 5 negative (CoP review → good-practices, create role → new-role, React, simplify → zen, molecule → new-molecule)

**ansible-zen** — 5 positive (show zen, too complex, simplify, clean review, ansible way) + 5 negative (lint violations → good-practices, module docs → docs, create role → new-role, Python code, YAML syntax check)

### User-invocable skills (description quality for future model-invocation)

**ansible-new-role** — 5 positive (create/scaffold/generate/bootstrap/new role) + 5 negative (review existing role, Python CLI, molecule test for existing role → new-molecule, create collection → new-collection, update/modify role)

**ansible-new-collection** — 5 positive (create/scaffold/generate/bootstrap/new collection) + 5 negative (review collection → good-practices, create role → new-role, create EE → new-ee, non-Ansible, modify existing collection)

**ansible-new-ee** — 5 positive (create/scaffold/generate/bootstrap/new EE) + 5 negative (build existing EE, create role → new-role, Dockerfile, manage containers, review EE → good-practices)

**ansible-new-molecule** — 5 positive (add molecule/scaffold testing/create scenario/test role/molecule init) + 5 negative (unit tests/pytest, create role → new-role, review tests → good-practices, non-Ansible testing, integration tests without molecule)

---

## Skill Routing Map

Summary of how skills delegate and exclude each other after fixes:

```
ansible-good-practices ──offers──► ansible-zen (end of review)
ansible-zen ──offers──► ansible-good-practices (end of review)
ansible-new-role ──offers──► ansible-new-molecule (after scaffolding)
ansible-new-collection ──delegates──► ansible-new-role (role creation)
ansible-new-collection ──offers──► ansible-new-molecule (after scaffolding)
ansible-docs ──excludes──► ansible-good-practices (CoP review)
ansible-good-practices ──excludes──► ansible-docs (module usage, syntax)
ansible-zen ──excludes──► ansible-good-practices (rule compliance)
ansible-zen ──excludes──► ansible-docs (module reference, lookups)
ansible-new-role ──excludes──► ansible-good-practices (review existing)
ansible-new-role ──excludes──► ansible-new-collection (create collection)
ansible-new-role ──excludes──► ansible-new-molecule (molecule for existing role)
ansible-new-ee ──excludes──► ansible-good-practices (review existing)
ansible-new-collection ──excludes──► ansible-good-practices (review existing)
```

---

## Trigger Discovery

4 of 7 skills have `disable-model-invocation: true`. Users must know the slash command.

**Negative guidance status after fixes:**

| Skill | "Do NOT" clauses | Status |
|-------|-----------------|--------|
| ansible-good-practices | 3 | Fixed (added docs boundary) |
| ansible-docs | 2 | Already good |
| ansible-zen | 2 | Fixed (added docs boundary) |
| ansible-new-role | 3 | Fixed (added collection + molecule boundaries) |
| ansible-new-collection | 1 | Already good |
| ansible-new-ee | 2 | Fixed (added review boundary) |
| ansible-new-molecule | 1 | Already good |

**Recommendation:** Keep `disable-model-invocation: true` for now. Use Tier 1 CI checks to enforce description quality. Use Tier 2 local testing to validate trigger accuracy when considering flipping the switch.

---

## Pre-requisite: Trim ansible-new-molecule

905 lines → needs to be under 500. Move detailed patterns to `references/` files. Once Tier 1 CI gate exists, this will fail the build and force the fix. Separate task.

---

## Implementation Phases

### Phase 0: Description fixes (DONE)

Applied negative guidance and delegation fixes to 4 skills. Simulated 30 prompts to verify routing.

### Phase 1: CI checks (Tier 1)

**Effort:** ~half a session
**Output:** Extended `validate-skills.yml` with new checks

1. Add line count check (fail >500, warn >400)
2. Add description quality checks (negative guidance present, word count in range)
3. Add YAML example validation (extract fenced YAML, parse with Python)
4. Add cross-skill description overlap detection (warning-only)
5. Fix `ansible-new-molecule` to pass the line count gate (separate PR)

### Phase 2: Trigger test cases + local runner (Tier 2)

**Effort:** ~1 session
**Output:** `evals/` directory with cases and `check_triggers.py`

1. Create `evals/cases/` YAML files for all 7 skills (70 cases total)
2. Write `check_triggers.py` — local script, calls cheap LLM, reports accuracy
3. Write `evals/README.md`
4. Run initial baseline, improve descriptions where accuracy is low

### Phase 3: Polish (as needed)

1. Expand cases from real usage
2. No-op audit
3. Ablation notes
4. Saved output fixtures if needed

---

## Cost Summary

| What | Cost | Where |
|------|------|-------|
| Phase 0: Description fixes | $0 | Done |
| Phase 1: CI checks | $0 | GitHub Actions (shell scripts) |
| Phase 2: Test cases (files) | $0 | Committed to repo |
| Phase 2: Trigger runner | ~$0.07/run | Local only |

**CI cost: zero.**

---

## Success Criteria

- Every SKILL.md under 500 lines (CI-enforced)
- Every description has negative guidance (CI-enforced)
- Every skill has 10 test cases committed (5 positive, 5 negative)
- Trigger accuracy >90% when tested locally
- All skills have clear routing boundaries (documented in routing map above)

---

## Open Questions

1. **No-op patterns list:** What specific patterns to grep for? Start with Matt's list, adapt for Ansible domain.
2. **Cross-skill overlap detection:** How strict? Start as warning, promote to error if it catches real problems.
3. **Trigger runner LLM choice:** Haiku is cheapest. Only matters for local runs.
