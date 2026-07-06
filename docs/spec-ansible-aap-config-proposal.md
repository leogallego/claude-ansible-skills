# Skill Proposal: ansible-aap-config

**Date:** 2026-07-03
**Status:** Early draft — needs research and design refinement
**Related:** CoP `aap_configuration.adoc` (bundled in ansible-good-practices)

## Purpose

Scaffold and review AAP Configuration as Code (CaC) repositories using the `infra.aap_configuration` collection. Helps users set up and maintain declarative AAP management through Git.

## Two operating modes

### Scaffold mode

Creates a complete CaC repository structure:
- `playbook.yml` using `infra.aap_configuration.dispatch` role
- `inventory.yml` with environment-specific groups (dev, qa, prod)
- `group_vars/all/` for shared resources (organizations, teams, credential types, labels)
- `group_vars/aap_<env>/` for environment-specific resources
- `collections/requirements.yml` with pinned `infra.aap_configuration` version
- Variable files organized by coupling: shared resources in type files, tightly coupled resources in JT bundle files
- GitHub Actions CI workflow for applying configuration
- README.md with usage instructions

Interactive flow: asks about environments, organizations, credential types, and generates the structure with realistic examples.

### Review mode

Analyzes an existing CaC repository for CoP violations:
- Unpinned collection version
- Plain-text secrets (not using vault or env lookups)
- Manual UI changes not tracked in Git
- Missing idempotency testing
- Incorrect variable organization (shared vs tightly coupled resources)
- Not using the dispatch role (calling individual roles in wrong order)
- Missing check mode / dry-run documentation

## Why it's needed

- AAP CaC is a growing practice but has a steep setup curve
- The CoP `aap_configuration.adoc` has detailed rules but no tooling to scaffold or validate
- Getting the variable organization right (type files vs JT bundles) is non-obvious
- Secret handling mistakes are common and dangerous

## Information sources

| Source | What it provides |
|---|---|
| CoP `aap_configuration.adoc` | All 8 rules with examples (already bundled in good-practices references) |
| `infra.aap_configuration` collection docs | Role names, variable naming conventions, dispatch role behavior |
| `ansible-know` MCP | Collection docs via `get_collection_docs` / `get_role_doc` |
| `ansible-know` MCP `search_collections` | Latest version of `infra.aap_configuration` (currently 4.7.0) |

## Integration with existing skills

- `ansible-good-practices` reviews AAP CaC as section 8 of 13 — this skill goes deep
- `ansible-new-collection` could suggest creating a CaC repo as a project type
- `ansible-inventory` (proposed) shares inventory scaffolding patterns

## Open questions

1. Which version of `infra.aap_configuration` to target? v4.x has significant changes from v2.x. The collection is at 4.7.0 currently.
2. Should the skill also scaffold `infra.aap_configuration_extended` integration?
3. How to handle the AAP version matrix — AAP 2.4 vs 2.5 vs 2.6 have different supported objects?
4. Should it generate example credential definitions (with vault-encrypted values) or just the structure?
5. How much of the JT bundle pattern (EE + Project + JT in one file) should be generated vs explained?
6. Should it integrate with a running AAP instance to export existing configuration? (Probably not — that's `awx export` territory, but worth considering.)

## Next steps

- Survey existing CaC repositories (redhat-cop/aap_configuration_template, community examples)
- Test `infra.aap_configuration` dispatch role to understand variable naming conventions
- Design the interactive scaffold flow for environments and resources
- Research AAP version-specific differences
