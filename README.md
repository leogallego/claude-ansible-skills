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

Scaffold a new Ansible content collection using `ansible-creator`, then customize for full CoP compliance.

- Plugin scaffolding — generates modules, filters, lookup, and action plugin skeletons with proper docstrings and FQCN examples
- Delegates role creation to the full ansible-scaffold-role skill process
- CI/CD pipeline generation for GitHub Actions or GitLab CI (lint, test, build, publish)
- Changelog setup with `antsibull-changelog`
- Generates collection-level CLAUDE.md for future Claude Code sessions
- Falls back to manual creation when `ansible-creator` is not installed

### ansible-scaffold-ee

Scaffold a new Ansible execution environment project using `ansible-creator`.

- Dependency introspection — auto-detects collections, roles, Python, and system deps from existing project files
- External dependency files — generates `requirements.yml`, `requirements.txt`, and `bindep.txt` for non-trivial EEs
- CI/CD pipeline generation for GitHub Actions or GitLab CI (build, test, push to registry)
- Falls back to manual creation when `ansible-creator` is not installed

### ansible-zen

Display the Zen of Ansible and review code against its 20 principles.

- Display mode — prints the full Zen and explains a random principle with a practical example
- Review mode — evaluates Ansible code for simplicity, readability, and clarity
- Zen Score (1-10) rating with justification
- Principle-grouped findings with before/after code improvements
- Complements ansible-cop-review with philosophical guidance

## Project Structure

Each top-level `ansible-*` directory is a standalone Claude Code **plugin** with:

```
ansible-cop-review/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata (name, version, description)
└── skills/
    └── ansible-cop-review/
        └── SKILL.md          # Skill prompt definition
```

The root `.claude-plugin/marketplace.json` indexes all plugins for marketplace discovery.

## Installation

### Plugin install (recommended)

Register the marketplace and install skills as plugins:

```
/plugin install marketplace https://github.com/leogallego/claude-ansible-skills
/plugin install ansible-cop-review
/plugin install ansible-scaffold-role
/plugin install ansible-scaffold-collection
/plugin install ansible-scaffold-ee
/plugin install ansible-zen
```

### Manual install (symlinks)

Alternatively, clone and symlink individual skill directories. Each skill lives inside `<plugin>/skills/<skill-name>/`.

**Project-level** (single project):

```bash
git clone https://github.com/leogallego/claude-ansible-skills.git
cd ~/my-ansible-project
mkdir -p .claude/skills
ln -s ~/claude-ansible-skills/ansible-cop-review/skills/ansible-cop-review .claude/skills/ansible-cop-review
```

**Profile-level** (all projects):

```bash
mkdir -p ~/.claude/skills
ln -s ~/claude-ansible-skills/ansible-scaffold-role/skills/ansible-scaffold-role ~/.claude/skills/ansible-scaffold-role
```

**All skills at once** at profile level:

```bash
mkdir -p ~/.claude/skills
for plugin in ~/claude-ansible-skills/ansible-*/; do
  skill=$(basename "$plugin")
  ln -s "$plugin/skills/$skill" ~/.claude/skills/"$skill"
done
```

### Usage

Once installed, invoke skills in Claude Code with their slash command:

```
/ansible-cop-review
/ansible-scaffold-role
/ansible-scaffold-collection
/ansible-scaffold-ee
/ansible-zen
```

## Dependencies

- **ansible-creator** — used by scaffold skills to generate base skeletons (optional — skills fall back to manual creation)
- **ansible-lint** — used by the review skill for cross-referencing (optional)
- **CoP rules** — skills reference rules from your CLAUDE.md and `redhat-cop-automation-good-practices-*.md`. If not available locally, they fetch from https://github.com/redhat-cop/automation-good-practices

## License

GPL-3.0-or-later
