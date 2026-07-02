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

- **ansible-good-practices** — Reviews Ansible code against all 13 Red Hat CoP rule sections loaded from per-section AsciiDoc references (roles, playbooks, inventories, collections, plugins, coding_style, structures, aap_configuration, cicd_and_promotion, git_workflow, naming_conventions, security, testing). Supports section-selective loading, severity classification (ERROR/WARNING/INFO), diff-aware reviews, category filtering, ansible-lint integration, parallel review with subagents, and auto-fix.
- **ansible-new-role** — Creates a new Ansible role with an interactive variable builder that generates realistic content based on what the role manages (packages, services, configs, etc.). Supports task componentization, smart handler generation, and falls back to manual creation when `ansible-creator` is unavailable.
- **ansible-new-collection** — Creates a new Ansible content collection with plugin scaffolding (modules, filters, lookup, action), CI/CD pipeline generation, `antsibull-changelog` setup, and collection-level CLAUDE.md. Delegates role creation to the full ansible-new-role process.
- **ansible-new-ee** — Creates a new Ansible execution environment with dependency introspection from existing project files, external dependency files (`requirements.yml`, `requirements.txt`, `bindep.txt`), and CI/CD pipeline generation.
- **ansible-docs** — Answers Ansible questions and reviews code against official documentation from the Ansible ecosystem (ansible-core, ansible-lint, ansible-navigator, ansible-builder, ansible-creator, molecule). Requires the `ansible-know` MCP server for documentation discovery and retrieval via `search_docs` and `fetch_doc` tools. Supports Q&A and code review response modes with source citations.
- **ansible-zen** — Displays the Zen of Ansible principles and reviews Ansible code against them for simplicity, readability, and clarity. Provides a Zen Score (1-10) and actionable recommendations. Complements ansible-good-practices with philosophical guidance.

## Skill File Format

Skills follow the [agentskills.io specification](https://agentskills.io/specification) with Claude Code-specific extensions. Each `SKILL.md` uses YAML front matter:

```yaml
---
# --- agentskills.io spec fields ---
name: skill-name                     # Required. Must match parent directory name.
description: >-                      # Required. Max 1024 chars.
  Multi-line description used for skill discovery and matching.
license: GPL-3.0-or-later            # Optional. SPDX identifier.
compatibility: >-                    # Optional. Max 500 chars.
  Environment requirements (CLIs, MCP servers, etc.).
metadata:                            # Optional. Arbitrary key-value pairs.
  author: leogallego
  version: "1.0.0"

# --- Claude Code extensions (not in agentskills.io spec) ---
user-invocable: true                 # Controls slash-command visibility.
argument-hint: "[args]"              # Placeholder shown in skill picker.
disable-model-invocation: true       # Prevents auto-invocation without explicit user request.
---
```

The Claude Code extensions (`user-invocable`, `argument-hint`, `disable-model-invocation`) must remain as top-level frontmatter fields — Claude Code's skill loader reads them there. These cause warnings with the agentskills.io `skills-ref validate` tool but cannot be moved to `metadata:` without breaking Claude Code.

The body is a markdown prompt that Claude Code follows when the skill is invoked.

## Key Dependencies

The new-* skills depend on the `ansible-creator` CLI tool for generating base skeletons (with manual fallback if not installed). The review skill can optionally use `ansible-lint` for cross-referencing. All skills load CoP rules from bundled `references/*.adoc` files (per-section AsciiDoc from [redhat-cop/automation-good-practices](https://github.com/redhat-cop/automation-good-practices)), with GitHub fetch as fallback and CLAUDE.md as last resort. The `ansible-docs` skill requires the [`ansible-know` MCP server](https://github.com/leogallego/ansible-know-mcp) (v0.7.0+) for documentation discovery and retrieval — it has no standalone fallback.

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
- SKILL.md frontmatter must include all agentskills.io required fields (`name`, `description`) plus Claude Code fields (`user-invocable`). See [Skill File Format](#skill-file-format) for the full schema.
- The `name` field must match the parent directory name, use only lowercase letters/numbers/hyphens, and be max 64 characters
- Skills should reference CLAUDE.md rules rather than duplicating them
- Scaffold skills follow a gather-inputs → generate → customize → validate pattern
- After creating a new skill, run `node scripts/gen-marketplace.js` to update the marketplace index
- License: GPL-3.0-or-later
