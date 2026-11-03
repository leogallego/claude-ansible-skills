# Skill Proposal: ansible-inventory

**Date:** 2026-07-03
**Status:** Early draft — needs research and design refinement
**Related:** CoP `inventories.adoc` (bundled in ansible-good-practices)

## Purpose

Scaffold and review Ansible inventory structures following CoP rules.

## Three operating modes

### Scaffold mode

Creates a structured inventory directory from scratch:
- `groups_and_hosts` file (INI format, no variables)
- `group_vars/` with per-group directories and variable files
- `host_vars/` with per-host directories
- Dynamic inventory plugin configs (if user has AWS/VMware/Satellite/etc.)

Interactive flow: asks about the environment (how many host groups, what platforms, any dynamic sources) and generates the full tree.

### Review mode

Analyzes an existing inventory for CoP violations:
- Flat file instead of directory structure
- Variables defined in hosts file
- Missing As-Is/To-Be separation
- Host lists instead of inventory groups (the anti-pattern from `inventories.adoc`)
- Too many variable precedence levels
- Extra vars used for desired state instead of inventory vars

### Migration mode

Converts a single-file inventory (INI or YAML) into a structured directory layout, preserving all hosts, groups, and variables in the correct locations.

## Why it's needed

- The CoP `inventories.adoc` has 6 detailed rules that are hard to check manually
- Nobody automates inventory review — `ansible-good-practices` covers inventories as one of 13 sections but doesn't go deep
- Inventory scaffolding is entirely manual today

## Information sources

| Source | What it provides |
|---|---|
| CoP `inventories.adoc` | All 6 rules with examples (already bundled in good-practices references) |
| `ansible-know` MCP `search_docs` | Inventory plugin docs, dynamic inventory configuration |
| `ansible-know` MCP `search_collections` | Discover relevant inventory plugins for user's platform |

## Integration with existing skills

- `ansible-good-practices` could delegate inventory-specific deep review to this skill
- `ansible-new-role` and `ansible-new-collection` could offer to scaffold a test inventory

## Open questions

1. Should the skill also handle dynamic inventory plugin configuration (e.g., generating `aws_ec2.yml` plugin configs)?
2. How much of the variable precedence review overlaps with what `ansible-good-practices` already does? Need to define the boundary.
3. Should migration mode handle YAML inventory format or just INI?
4. Should it integrate with `ansible-inventory --list` to validate the generated inventory works?

## Next steps

- Survey existing inventory structures in popular collections/roles to understand patterns
- Define the boundary between this skill and ansible-good-practices inventory review
- Design the interactive scaffold flow
- Research dynamic inventory plugin configuration patterns
