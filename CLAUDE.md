# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

A collection of **Claude Code skills** (SKILL.md files) for Ansible automation development. Each skill is a self-contained prompt that Claude Code can invoke to scaffold or review Ansible code following Red Hat Communities of Practice (CoP) good practices.

This repo contains no executable code — only skill definitions and documentation. There are no build, lint, or test commands.

## Repository Structure

Each subdirectory contains a single `SKILL.md` file defining one skill:

- **ansible-cop-review/** — Reviews Ansible code against all Red Hat CoP rules. Supports severity classification (ERROR/WARNING/INFO), diff-aware reviews, category filtering, ansible-lint integration, parallel review with subagents, and auto-fix.
- **ansible-scaffold-role/** — Scaffolds a new Ansible role with an interactive variable builder that generates realistic content based on what the role manages (packages, services, configs, etc.). Supports task componentization, smart handler generation, and falls back to manual creation when `ansible-creator` is unavailable.
- **ansible-scaffold-collection/** — Scaffolds a new Ansible content collection using `ansible-creator`, then customizes for CoP compliance.
- **ansible-scaffold-ee/** — Scaffolds a new Ansible execution environment project using `ansible-creator`.

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

## Contributing New Skills

- One directory per skill, containing a single `SKILL.md`
- Use `snake_case` with hyphens for directory names (matching existing convention: `ansible-*`)
- Skills should reference CLAUDE.md rules rather than duplicating them
- Scaffold skills follow a gather-inputs → generate → customize → validate pattern
- License: GPL-3.0-or-later
