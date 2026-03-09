---
name: ansible-scaffold-role
description: >-
  Scaffold a new Ansible role following all Red Hat CoP good practices.
  Use when the user wants to create a new role. Leverages ansible-creator
  when running inside a collection, then customizes the output to comply
  with all CLAUDE.md rules.
user-invocable: true
---

# Ansible Scaffold Role

Create a new Ansible role that fully complies with every rule in CLAUDE.md.

## Gather inputs

Ask the user for:
1. **Role name** (snake_case, no dashes) — required
2. **Target path** — where to create the role (default: `./roles/<role_name>`)
3. **Collection context** — is this role inside an existing collection? If a
   `galaxy.yml` exists in the project root or a parent directory, assume yes.
4. **Brief description** — what the role does (for README and argument_specs)
5. **Platform support needed** — which OS families/distributions (optional)
6. **Provider support** — does the role need a provider pattern? (optional)

## Scaffolding strategy

### If inside a collection
Use `ansible-creator add resource role <role_name> <collection_path>` to
generate the skeleton, then modify the generated files to comply with all
rules below.

### If standalone
Create the role directory structure manually with all required files.

## Required files and content

After scaffolding (or instead of it for standalone), ensure every file meets
these requirements:

### `defaults/main.yml`
- All user-facing variables with sensible defaults, prefixed with the role
  name: `<role_name>_variable_name`
- Variables without safe defaults: present but commented out with a
  description
- If provider pattern is used: `<role_name>_provider` variable

### `vars/main.yml`
- Internal constants and magic values only, prefixed with `__<role_name>_`
- NEVER user-facing defaults here
- Platform-specific variable files if requested (`RedHat.yml`, `Debian.yml`,
  etc.)

### `tasks/main.yml`
- Include the platform-specific variable loading pattern from CLAUDE.md
- Include the platform-specific task loading pattern if platform tasks needed
- Use `{{ role_path }}/vars/` and `{{ role_path }}/tasks/` absolute paths
- All tasks named in imperative form
- All modules use FQCN
- Use `loop:` not `with_*`

### `meta/argument_specs.yml`
- Define all role arguments with types, descriptions, required flags, and
  choices where applicable
- Match the variables defined in `defaults/main.yml`

### `meta/main.yml`
- Role metadata: author, description, license, min_ansible_version,
  platforms

### `handlers/main.yml`
- Placeholder with a commented example handler, role-name prefixed

### `templates/`
- If any templates are created, include `{{ ansible_managed | comment }}`
  header and use `backup: true` in the corresponding task

### `README.md`
- Role description
- Requirements
- Role variables (all from defaults/main.yml, documented)
- Example playbook
- Idempotency designation
- Check mode support statement
- Rollback capabilities
- License and author

## Post-scaffold validation

After creating all files, verify:
- No dashes in the role name
- All variables are role-name prefixed
- Internal variables use `__` prefix
- `argument_specs.yml` matches `defaults/main.yml`
- All task names are imperative
- All modules use FQCN
- YAML uses 2-space indent and `true`/`false` booleans
- `ansible_facts['...']` bracket notation is used everywhere

## Rules fallback

If the rules are not available locally (no CLAUDE.md with Ansible rules or
`redhat-cop-automation-good-practices-scrap.md`), fetch them from
https://github.com/redhat-cop/automation-good-practices as a fallback.
