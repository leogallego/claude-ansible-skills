# claude-ansible-skills

A collection of [Claude Code](https://claude.ai/code) skills for Ansible automation development following [Red Hat Communities of Practice (CoP) good practices](https://github.com/redhat-cop/automation-good-practices).

## Skills

### ansible-good-practices

Review Ansible code against Red Hat CoP automation good practices loaded from per-section AsciiDoc references.

- Section-selective loading — loads only the reference sections relevant to the files being reviewed
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

### ansible-docs

Answer Ansible questions and review code against official Ansible ecosystem documentation.

- Covers 6 doc sources: ansible-core, ansible-lint, ansible-navigator, ansible-builder, ansible-creator, molecule
- Q&A mode — search docs, answer grounded in official documentation with URL citations
- Code review mode — identify directives/modules in code, review against official docs
- Requires the [`ansible-know` MCP server](https://github.com/leogallego/ansible-know-mcp) (v0.7.0+) — install with `uvx ansible-know-mcp`
- Complements ansible-good-practices (official docs vs CoP rules)

### ansible-zen

Display the Zen of Ansible and review code against its 20 principles.

- Display mode — prints the full Zen and explains a random principle with a practical example
- Review mode — evaluates Ansible code for simplicity, readability, and clarity
- Zen Score (1-10) rating with justification
- Principle-grouped findings with before/after code improvements
- Complements ansible-good-practices with philosophical guidance

## Project Structure

Each top-level `ansible-*` directory is a standalone Claude Code **plugin** with:

```
ansible-good-practices/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata (name, version, description)
└── skills/
    └── ansible-good-practices/
        └── SKILL.md          # Skill prompt definition
```

The root `.claude-plugin/marketplace.json` indexes all plugins for marketplace discovery.

## Installation

### Plugin install (recommended)

Register the marketplace and install skills as plugins:

```
/plugin marketplace add https://github.com/leogallego/claude-ansible-skills
/plugin install ansible-good-practices
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
ln -s ~/claude-ansible-skills/ansible-good-practices/skills/ansible-good-practices .claude/skills/ansible-good-practices
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
/ansible-good-practices
/ansible-scaffold-role
/ansible-scaffold-collection
/ansible-scaffold-ee
/ansible-zen
```

## Dependencies

- **ansible-creator** — used by scaffold skills to generate base skeletons (optional — skills fall back to manual creation)
- **ansible-lint** — used by the review skill for cross-referencing (optional)
- **CoP rules** — skills load rules from bundled `references/*.adoc` files (per-section AsciiDoc from [redhat-cop/automation-good-practices](https://github.com/redhat-cop/automation-good-practices)), with GitHub fetch as fallback and CLAUDE.md as last resort

## Contributing

We welcome contributions from the community. This project follows the
[Red Hat Communities of Practice contributing guidelines](https://redhat-cop.github.io/contrib/).

### Development workflow

1. **Fork** the repository
2. **Create a branch** for your work
3. **Open a pull request** following the guidelines below
4. **Address reviewer feedback**
5. A maintainer will merge once approved — do not merge your own PRs

### Adding a new skill

1. Create a directory named `ansible-<skill-name>/`
2. Add `.claude-plugin/plugin.json` with name, version, and description
3. Add `skills/<skill-name>/SKILL.md` with frontmatter and prompt body
4. Follow the [SKILL.md format](https://code.claude.com/docs/en/skills):
   - Description must include what the skill does, when to use it, and
     trigger phrases users would say
   - Add `argument-hint` if the skill accepts arguments
   - Add `disable-model-invocation: true` for skills with side effects
   - Keep SKILL.md under 500 lines; move detailed docs to `references/`
5. Skills should reference CLAUDE.md rules rather than duplicating them
6. Run `node scripts/gen-marketplace.js` to regenerate the marketplace index
7. Commit the updated `marketplace.json` alongside your changes

### Modifying existing skills

- Read the skill's SKILL.md before modifying — understand the full prompt
- After changes, run `node scripts/gen-marketplace.js` to update plugin metadata
- Squash commits whenever possible

### Best practices

- Write clear, descriptive PR titles and summaries
- Do not commit directly to the main branch
- Review existing skills to prevent duplication
- Test your skill by invoking it with `/skill-name` in Claude Code
- Use `snake_case` with hyphens for directory names (matching `ansible-*`)

### Reporting issues

Open an issue on GitHub for:
- Bug reports — describe the skill, the input, and the unexpected behavior
- Feature requests — describe the use case and the expected outcome
- Rule updates — if Red Hat CoP good practices change upstream

## License

GPL-3.0-or-later
