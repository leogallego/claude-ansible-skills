# Review: ansible-new-molecule (Issue #42)

**Date:** 2026-07-05
**Status:** All fixes applied, ready for PR

## Review Round 1 — All Fixed

### Critical (2 — fixed)

1. **`pre_build_image` is a dead concept in ansible-native mode** — `SKILL.md:157-158`
   Replaced with guidance on building custom images in create.yml. Also fixed in `molecule-patterns.md:383-384`.
   Commit: `5b85837`

2. **Contradictory text about UBI-init Docker command** — `SKILL.md:302-313`
   Reworded to explain `command` is set for safety, not because it's strictly required.
   Commit: `8a27021`

### Important (5 — 4 fixed, 1 deferred)

3. **References non-existent `ansible-migrate-molecule` skill** — `SKILL.md:14`, `plugin.json:3`, `marketplace.json:73`
   Changed to "migration skill planned for a future release."
   Commit: `e84f3f9`

4. **Docker create.yml lacks `changed_when: false`** — `SKILL.md:299`
   Added for consistency with Podman template.
   Commit: `9cc9378`

5. **No integration hook in ansible-new-role** — Deferred to follow-up PR.

6. **Incorrect claim about molecule-patterns.md format** — `SKILL.md:866-869`
   Updated description to match actual content (modern ansible-native format).
   Commit: `2146543`

7. **Old-format patterns in molecule-philosophy.md** — `molecule-philosophy.md:95-127`
   Consolidated under "Historical Reference" heading with technique summaries only.
   Commit: `1135a9c`

### Minor (6 — 4 fixed, 2 verified as non-issues)

- **privileged: true without comment** — Added inline comment. Commit: `6f42a57`
- **network vs networks undocumented** — Added full parameter mapping note. Commit: `7b09dbd`
- **Hardcoded podman in patterns destroy.yml** — Fixed to use `{{ podman_exec }}`. Commit: `44c5175`
- **pre_build_image in molecule-patterns.md** — Fixed to use build modules. Commit: `d99d8b1`
- **tox-ansible.ini filename** — Verified correct per [tox-ansible docs](https://docs.ansible.com/projects/tox-ansible/configuration/). Not an issue.
- **dependency key names** — Verified correct per [molecule docs](https://docs.ansible.com/projects/molecule/configuration/). Not an issue.

## Review Round 2 — All Fixed

### Important (1 — fixed)

1. **requirements.yml in wrong directory** — `SKILL.md:195`
   Molecule resolves requirements.yml from the scenario directory (`molecule/default/`), not from `molecule/` level. Confirmed from molecule source code: `dependency/ansible_galaxy/roles.py` line 40 uses `self._config.scenario.directory`.
   Moved requirements.yml into scenario directories in generated output tree and requirements.yml section.
   Commit: `ece4dd7`

### Minor (4 — 3 fixed, 1 needs follow-up)

- **Pattern 1 missing changed_when: false** — Fixed for consistency with Patterns 2-4. Commit: `583ccd6`
- **No Containerfile template** — Added minimal Debian systemd example. Commit: `5b557ea`
- **verify.yml assumes defaults/main.yml exists** — Added guidance for roles without it. Commit: `7982041`
- **molecule init description inaccurate** — Fixed. Commit: `762f0e4`. **TODO:** Investigate further whether molecule init output is or isn't "ansible-native" — see follow-up notes below.

## Verified Correct (from Round 2)

- Frontmatter format matches agentskills.io spec + Claude Code extensions
- plugin.json and marketplace.json match SKILL.md frontmatter
- CLAUDE.md skills list entry accurate
- Docker vs Podman parameter differentiation correct
- Container image names valid
- All code examples CoP-compliant (FQCNs, true/false, snake_case, imperative names)
- UBI-init configurations correct for both Docker and Podman
- tmpfs dict format consistent across all files
- molecule.yml template correctly excludes driver/provisioner/verifier/platforms

## Strengths

- Thorough archetype detection system (7 types)
- Smart verify.yml generation with `vars_files` + `MOLECULE_PROJECT_DIRECTORY`
- Clean inventory separation of concerns
- Consistent CoP compliance across all examples
- Graceful degradation when MCP is unavailable
- Correct frontmatter/plugin structure matching existing skills
- Progressive enhancement with MCP module doc enrichment

## Follow-up Items

1. Add molecule invocation hook to ansible-new-role and ansible-new-collection (deferred)
2. Investigate molecule init scenario template format — is it actually "ansible-native"? (TODO)
