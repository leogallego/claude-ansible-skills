# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

A collection of **Claude Code skills** (SKILL.md files) for Ansible automation development. Each skill is a self-contained prompt that Claude Code can invoke to scaffold or review Ansible code following Red Hat Communities of Practice (CoP) good practices.

This repo contains skill definitions, documentation, and a marketplace index for plugin installation. The only build command is the marketplace generator (see below).

## Repository Structure

Each subdirectory contains a single `SKILL.md` file defining one skill:

- **ansible-cop-review/** — Reviews Ansible code against all Red Hat CoP rules. Supports severity classification (ERROR/WARNING/INFO), diff-aware reviews, category filtering, ansible-lint integration, parallel review with subagents, and auto-fix.
- **ansible-scaffold-role/** — Scaffolds a new Ansible role with an interactive variable builder that generates realistic content based on what the role manages (packages, services, configs, etc.). Supports task componentization, smart handler generation, and falls back to manual creation when `ansible-creator` is unavailable.
- **ansible-scaffold-collection/** — Scaffolds a new Ansible content collection with plugin scaffolding (modules, filters, lookup, action), CI/CD pipeline generation, `antsibull-changelog` setup, and collection-level CLAUDE.md. Delegates role creation to the full ansible-scaffold-role process.
- **ansible-scaffold-ee/** — Scaffolds a new Ansible execution environment with dependency introspection from existing project files, external dependency files (`requirements.yml`, `requirements.txt`, `bindep.txt`), and CI/CD pipeline generation.

## Skill File Format

Each `SKILL.md` uses YAML front matter with three required fields:
```yaml
---
name: skill-name
description: >-
  Multi-line description used for skill discovery and matching.
user-invocable: true
---
```

The body is a markdown prompt that Claude Code follows when the skill is invoked.

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

- One directory per skill, containing a single `SKILL.md`
- Use `snake_case` with hyphens for directory names (matching existing convention: `ansible-*`)
- Skills should reference CLAUDE.md rules rather than duplicating them
- Scaffold skills follow a gather-inputs → generate → customize → validate pattern
- After creating a new skill, run `node scripts/gen-marketplace.js` to update the marketplace index
- License: GPL-3.0-or-later
