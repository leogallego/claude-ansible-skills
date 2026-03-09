# claude-ansible-skills

A collection of [Claude Code](https://claude.ai/code) skills for Ansible automation development following [Red Hat Communities of Practice (CoP) good practices](https://github.com/redhat-cop/automation-good-practices).

## Skills

### ansible-cop-review

Review Ansible code against all Red Hat CoP automation good practices.

- Severity classification: ERROR, WARNING, INFO
- Diff-aware mode — review only changed files
- Category filtering — focus on specific rule categories
- ansible-lint integration with CoP rule cross-referencing
- Parallel review with subagents for large projects
- Auto-fix offer after reporting

### ansible-scaffold-role

Scaffold a new Ansible role fully compliant with CoP rules.

- Interactive variable builder — asks what the role manages (packages, services, configs, users, firewall, storage) and generates realistic defaults, tasks, handlers, and templates
- Task componentization — splits complex roles into `install.yml`, `configure.yml`, `service.yml` with sub-task name prefixes
- Smart handler generation — creates real handlers (restart, reload, validate) based on role purpose
- Collection-aware — uses `ansible-creator` inside collections, manual creation otherwise
- Falls back to manual creation when `ansible-creator` is not installed

### ansible-scaffold-collection

Scaffold a new Ansible content collection using `ansible-creator`, then customize for full CoP compliance. Generates `galaxy.yml`, `meta/runtime.yml`, README, LICENSE, and optionally scaffolds initial roles.

### ansible-scaffold-ee

Scaffold a new Ansible execution environment project using `ansible-creator`. Generates `execution-environment.yml` with user-specified base image, collections, Python/system packages, and build steps.

## Installation

Copy or symlink the skill directories into your Claude Code skills path. Each skill is a single `SKILL.md` file in its own directory.

## Dependencies

- **ansible-creator** — used by scaffold skills to generate base skeletons (optional — skills fall back to manual creation)
- **ansible-lint** — used by the review skill for cross-referencing (optional)
- **CoP rules** — skills reference rules from your CLAUDE.md and `redhat-cop-automation-good-practices-*.md`. If not available locally, they fetch from https://github.com/redhat-cop/automation-good-practices

## License

GPL-3.0-or-later
