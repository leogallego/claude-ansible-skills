---
name: ansible-scaffold-collection
description: >-
  Scaffold a new Ansible content collection following all Red Hat CoP good
  practices. Uses ansible-creator to generate the base structure, then
  customizes it for full compliance with CLAUDE.md rules.
user-invocable: true
---

# Ansible Scaffold Collection

Create a new Ansible content collection that fully complies with every rule
in CLAUDE.md.

## Gather inputs

Ask the user for:
1. **Namespace** — the collection namespace (snake_case) — required
2. **Collection name** — the collection name (snake_case, no dashes) —
   required
3. **Target path** — where to create the collection (default: current
   directory)
4. **Description** — brief description of the collection's purpose
5. **Author** — author name and email
6. **License** — license type (default: GPL-3.0-or-later)
7. **Initial roles** — list of role names to include (optional)
8. **Repository URL** — source repository URL (optional)

## Scaffolding strategy

1. Run `ansible-creator init collection <namespace>.<name> <path>` to
   generate the base skeleton.
2. Customize the generated files for full compliance with CLAUDE.md rules.
3. If initial roles were requested, use
   `ansible-creator add resource role <role_name> <collection_path>` for each
   role, then customize each role per the ansible-scaffold-role skill rules.

## Post-scaffold customizations

### `galaxy.yml`
- Verify namespace and name are snake_case with no dashes
- Set version to `1.0.0` (semantic versioning)
- Fill in description, authors, license, repository
- Add any required dependencies

### `README.md`
- Collection overview and purpose
- Installation instructions (`ansible-galaxy collection install`)
- List of included roles with brief descriptions
- List of included plugins (if any)
- Requirements (Ansible version, Python version, dependencies)
- License and author info
- Link to full documentation

### `LICENSE`
- Ensure the license file matches the license specified in galaxy.yml

### `meta/runtime.yml`
- Set `requires_ansible` to a sensible minimum version (e.g., `>=2.15.0`)

### Collection-wide variables
- If roles share common configuration, create implicit collection-wide
  variables referenced in each role's `defaults/main.yml`
- Document these in the collection README

### Roles
- For each role, apply all rules from the ansible-scaffold-role skill:
  - Role-prefixed variables in `defaults/main.yml`
  - `__` prefixed internal variables in `vars/main.yml`
  - `meta/argument_specs.yml` for input validation
  - Platform-specific variable/task loading patterns
  - Imperative task names, FQCN modules, `loop:` over `with_*`
  - `{{ role_path }}` absolute paths
  - README.md with examples, variable docs, idempotency info

### Cleanup sample/placeholder content
- Remove or replace the sample plugins (`sample_action.py`,
  `sample_filter.py`, `sample_lookup.py`, `sample_module.py`,
  `sample_test.py`) — keep only the `__init__.py` files in plugin
  directories unless the user requested specific plugins
- Remove the sample `run` role if the user specified their own initial roles
- Update molecule scenarios to reference actual roles
- Update integration test targets to match actual roles

### Testing infrastructure
- Keep the generated molecule, tox, and CI workflows
- Update test references to match the actual collection content
- Ensure `.pre-commit-config.yaml` is configured appropriately

## Post-scaffold validation

After creating all files, verify:
- `galaxy.yml` has valid semantic version
- All role names are snake_case with no dashes
- All roles have `meta/argument_specs.yml`
- All roles have compliant `defaults/main.yml` and `vars/main.yml`
- README and LICENSE exist at collection root
- No sample/placeholder content remains unless intentional
- YAML uses 2-space indent and `true`/`false` booleans throughout

## Output

Report what was created:
- Collection path
- List of generated files (grouped by category)
- Any manual steps the user should take next (e.g., adding real plugins,
  configuring CI secrets)

## Rules fallback

If the rules are not available locally (no CLAUDE.md with Ansible rules or
`redhat-cop-automation-good-practices-*.md`), fetch them from
https://github.com/redhat-cop/automation-good-practices as a fallback.
