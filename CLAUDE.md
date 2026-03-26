# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

A collection of **Claude Code skills** (SKILL.md files) for Ansible automation development. Each skill is a self-contained prompt that Claude Code can invoke to scaffold or review Ansible code following Red Hat Communities of Practice (CoP) good practices.

This repo contains skill definitions, documentation, and a marketplace index for plugin installation. The only build command is the marketplace generator (see below).

## Repository Structure

Each top-level `ansible-*` directory is a standalone Claude Code **plugin**. Plugins follow this layout:

```
ansible-<name>/
├── .claude-plugin/
│   └── plugin.json              # Plugin metadata (name, version, description)
└── skills/
    └── ansible-<name>/
        └── SKILL.md             # Skill prompt definition
```

The root `.claude-plugin/marketplace.json` indexes all plugins for marketplace discovery.

### Skills

- **ansible-cop-review** — Reviews Ansible code against all Red Hat CoP rules. Supports severity classification (ERROR/WARNING/INFO), diff-aware reviews, category filtering, ansible-lint integration, parallel review with subagents, and auto-fix.
- **ansible-scaffold-role** — Scaffolds a new Ansible role with an interactive variable builder that generates realistic content based on what the role manages (packages, services, configs, etc.). Supports task componentization, smart handler generation, and falls back to manual creation when `ansible-creator` is unavailable.
- **ansible-scaffold-collection** — Scaffolds a new Ansible content collection with plugin scaffolding (modules, filters, lookup, action), CI/CD pipeline generation, `antsibull-changelog` setup, and collection-level CLAUDE.md. Delegates role creation to the full ansible-scaffold-role process.
- **ansible-scaffold-ee** — Scaffolds a new Ansible execution environment with dependency introspection from existing project files, external dependency files (`requirements.yml`, `requirements.txt`, `bindep.txt`), and CI/CD pipeline generation.
- **ansible-zen** — Displays the Zen of Ansible principles and reviews Ansible code against them for simplicity, readability, and clarity. Provides a Zen Score (1-10) and actionable recommendations. Complements ansible-cop-review with philosophical guidance.

## Skill Design Principles

Follow these principles when creating or improving skills:

### Core Philosophy

- **Lean > complex** — Remove anything that doesn't directly contribute to the skill's goal
- **Modular > monolithic** — Break skills into discrete, reusable steps with clear boundaries
- **Test-driven > guess-driven** — Every skill must have evaluation criteria and be testable
- **Systems > one-off prompts** — Skills are reusable systems, not single-use instructions

### Context Architecture

Context must be **fresh, minimal, and modular**:

- Keep the SKILL.md lean — high-level steps only, not exhaustive instructions
- Use reference files (in `resources/` or skill-local files) for deeper knowledge (50-100 lines max each)
- Load context **only at the step where it is needed** — do not carry all context through the entire process
- Summarize outputs before passing to the next step to avoid context bloat
- Each reference file should be focused, reusable, and loaded only when needed

### Skill Structure (Required Sections)

Every SKILL.md must follow this internal structure:

1. **Name & Trigger** — Skill name and explicit trigger description (when this skill should activate)
2. **Goal** — Measurable desired outcome (what success looks like)
3. **Dependencies** — Tools (CLI tools, linters) and connectors (other skills this skill delegates to or accepts input from)
4. **Context** — Reference files and domain knowledge needed, loaded per-step
5. **Process** — Step-by-step phases with human-checkpoint markers where user approval/input is required
6. **Output** — Format specification, save location, and final deliverable definition

### Process Design

Break every skill into clear, sequential phases:

1. **Input understanding** — Parse arguments, determine mode, validate inputs
2. **Context loading** — Pull only the references needed for this phase
3. **Processing / transformation** — The core work of the skill
4. **Output generation** — Produce structured, clean results
5. **Refinement** (optional) — Offer improvements, auto-fix, or iteration

Each step must be explicit, modular, and avoid unnecessary context carryover between phases.

### Human-in-the-Loop Checkpoints

Define where human input is required:

- **Approval checkpoints** — Before destructive or irreversible actions (e.g., auto-fix, file generation)
- **Input checkpoints** — Where the user must provide choices or configuration
- **Feedback injection** — Where the user can redirect or refine the skill's output

Mark these in the Process section with clear checkpoint indicators.

### Skill Collaboration

Design every skill to:

- Accept structured inputs from previous skills (via `$ARGUMENTS` or piped context)
- Output clean, structured data that downstream skills can consume
- Never assume the skill runs in isolation — document input/output contracts

### Evaluation Requirements

Every skill must define:

- **1-3 evaluation criteria** (not more) — e.g., "applies CoP rules correctly", "generates valid YAML", "maintains naming conventions"
- **Pass/fail conditions** for each criterion
- **Quality metrics** that can be checked across multiple test runs

### Self-Improvement

After each significant run or iteration:

- Capture what worked, what failed, what should change
- Store learnings in a skill-local learnings file when patterns emerge
- Future runs should reference past learnings to avoid repeating mistakes

## Skill File Format

Each `SKILL.md` uses YAML front matter followed by a structured markdown body:

```yaml
---
name: skill-name
description: >-
  Multi-line description used for skill discovery and matching.
  Include explicit trigger phrases (when to activate).
  Include explicit exclusions (when NOT to activate).
argument-hint: "[expected arguments]"
user-invocable: true
metadata:
  author: Author Name
  version: X.Y.Z
---
```

The body follows the required sections defined in Skill Design Principles above:
Name & Trigger, Goal, Dependencies, Context, Process (with human-checkpoints), and Output.

## Key Dependencies

The scaffold skills depend on the `ansible-creator` CLI tool for generating base skeletons (with manual fallback if not installed). The review skill can optionally use `ansible-lint` for cross-referencing. All skills depend on the Ansible CoP rules defined in the user's global `CLAUDE.md` and `redhat-cop-automation-good-practices-*.md`, with a fallback to https://github.com/redhat-cop/automation-good-practices when rules are not available locally.

## Marketplace Plugin

This repo is a Claude Code plugin marketplace. The index lives at `.claude-plugin/marketplace.json` and is generated from SKILL.md frontmatter.

After adding or modifying any skill, regenerate the index:

```bash
node scripts/gen-marketplace.js
```

Always commit the updated `marketplace.json` alongside SKILL.md changes.

## Contributing New Skills

- One plugin directory per skill, following the `ansible-<name>/` convention
- Each plugin must contain `.claude-plugin/plugin.json` and `skills/<skill-name>/SKILL.md`
- SKILL.md must follow the structured format: Name & Trigger, Goal, Dependencies, Context, Process (with human-checkpoints), Output
- Skills should reference CLAUDE.md rules and `resources/` files rather than duplicating knowledge inline
- Keep SKILL.md lean — use reference files for domain-specific knowledge (50-100 lines max per reference file)
- Define 1-3 evaluation criteria per skill for testability
- Design skills to accept inputs from and produce outputs for other skills (skill collaboration)
- Scaffold skills follow a gather-inputs → generate → customize → validate pattern
- After creating a new skill, run `node scripts/gen-marketplace.js` to update the marketplace index
- License: GPL-3.0-or-later
