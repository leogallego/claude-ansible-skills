# Molecule Skills Design Specification

**Date:** 2026-07-02
**Status:** Draft (open questions resolved 2026-07-02, pending template validation)
**Based on:** [Roles testing report](report-top50-roles-testing-infra.md), [Collections testing report](report-top50-collections-testing-infra.md), [Molecule testing philosophy](https://docs.ansible.com/projects/molecule/philosophy/)

## Research Summary

We surveyed 50 collections and 50 roles for testing infrastructure, plus deep-searched GitHub for molecule best practices. Key findings:

- **Roles**: 82% use molecule, but most follow legacy patterns (old driver model, molecule-generated inventory)
- **Collections**: Only ~12% of popular collections use molecule, but 38+ collections across the ecosystem use it (220+ scenarios), concentrated in ansible-middleware (63+ scenarios), aristanetworks (43+), and ansible-collections upstream (67+)
- **Gap**: The official molecule philosophy (Ansible-native everything) is far ahead of what's deployed in the wild. Most repos still use deprecated driver declarations, testinfra verifiers, and molecule-managed inventory.
- **Reference implementations**: ansible-middleware collections are the best real-world examples of molecule-in-collections; geerlingguy roles are the closest to current philosophy for roles (Ansible verify.yml) despite appearing "basic"

## Decision: Two Skills + Shared Foundation

### Why two skills

| Concern | ansible-new-molecule | ansible-migrate-molecule |
|---------|:--------------------:|:------------------------:|
| User | Starting fresh | Has existing molecule setup |
| Input | Role/collection without testing | Existing molecule config |
| Flow | Gather inputs → scaffold | Detect → analyze gaps → transform |
| Output | New molecule/ or extensions/molecule/ | Modified existing files |
| Complexity | Medium (template-driven) | High (detection + migration logic) |
| Invocation | Standalone or called by new-role/new-collection | Always standalone |

### Why not integrate into existing skills

`ansible-new-role` and `ansible-new-collection` already have complex flows. Adding molecule scaffolding inline would make them harder to maintain. A standalone `ansible-new-molecule` skill that they invoke keeps each skill focused and makes molecule testing independently accessible.

## Skill 1: ansible-new-molecule

### Purpose

Scaffold molecule testing for an Ansible role or collection, following the current molecule philosophy.

### Invocation patterns

- **Standalone**: User runs `/ansible-new-molecule` on an existing role or collection
- **Called by ansible-new-role**: At the end of role scaffolding, asks "Add molecule testing?" → invokes ansible-new-molecule
- **Called by ansible-new-collection**: Can add collection-level or per-role molecule testing

### Inputs to gather

1. **Target type**: Role or collection?
2. **Target path**: Where is the role/collection?
3. **Scenario strategy**:
   - Single default scenario (quick start)
   - Multi-scenario by feature (what the role manages)
   - Multi-scenario by platform (OS variants)
4. **Platform/infrastructure**:
   - Container-based (Docker/Podman via molecule-plugins)
   - VM-based (Vagrant/libvirt — for roles that need real VMs)
   - Delegated (external infrastructure — K8s operators, cloud resources)
5. **Verification approach**: Ansible verify.yml (recommended) or testinfra (legacy, with warning)
6. **CI integration**: GitHub Actions workflow? (default yes)
7. **Test sequence customization**: Use defaults or customize?

### Generated output

For a **role** (`molecule/` at role root):
```
molecule/
├── default/
│   ├── molecule.yml          # Modern Ansible-native config
│   ├── create.yml            # Ansible playbook for instance creation
│   ├── converge.yml          # Runs the role
│   ├── verify.yml            # Ansible assertions
│   ├── destroy.yml           # Ansible playbook for instance destruction
│   └── prepare.yml           # (optional) Pre-convergence setup
├── <scenario-2>/             # (if multi-scenario)
│   └── ...
└── requirements.yml          # Galaxy dependencies for testing
```

For a **collection** (`extensions/molecule/` — modern pattern):
```
extensions/
└── molecule/
    ├── default/
    │   ├── molecule.yml
    │   ├── create.yml
    │   ├── converge.yml
    │   ├── verify.yml
    │   └── destroy.yml
    ├── <scenario-2>/
    │   └── ...
    └── requirements.yml
```

Plus optionally:
```
.github/workflows/molecule.yml    # CI workflow
```

### molecule.yml template (validated against official config docs)

The official default `test_sequence` from the [configuration docs](https://docs.ansible.com/projects/molecule/configuration/) is:

```yaml
---
scenario:
  test_sequence:
    - dependency
    - cleanup
    - destroy
    - syntax
    - create
    - prepare
    - converge
    - idempotence
    - side_effect
    - verify
    - cleanup
    - destroy
```

For the ansible-native configuration, add executor args for inventory:

```yaml
ansible:
  executor:
    args:
      ansible_playbook:
        - --inventory=${MOLECULE_SCENARIO_DIRECTORY}/inventory/
```

**What NOT to include** (these are all "pre ansible-native" constructs per the docs):
- `driver:` block — Ansible-native is the default
- `verifier:` block — Ansible verify.yml is the default
- `provisioner:` block — replaced by `ansible:` block
- `platforms:` block — replaced by inventory in create.yml

Infrastructure lifecycle is managed by `create.yml` / `destroy.yml` playbooks in each scenario directory. The `molecule-plugins` package provides bundled playbooks for Docker/Podman that can be used directly or overridden.

### Collection-specific features

For collections using `extensions/molecule/`, two important features:

**Shared state** — scenarios share ephemeral state, so the `default` scenario handles create/destroy for all scenarios:
```yaml
shared_state: true
```

**Nested scenarios** — organize scenarios hierarchically:
```
extensions/molecule/
├── config.yml
├── default/
│   └── molecule.yml
├── module_a/
│   ├── merged/
│   │   └── molecule.yml
│   └── deleted/
│       └── molecule.yml
```
Target with: `molecule test -s module_a/merged` or `molecule test -s "module_a/*"`

Discover with: `MOLECULE_GLOB="extensions/molecule/**/molecule.yml"`

### Key design principles

- **Follow the philosophy, not the wild.** Generate configs that match the official molecule testing philosophy, not the legacy patterns found in most repos.
- **Ansible-native everything.** No testinfra, no old driver declarations, no molecule-managed inventory. No `driver:`, `provisioner:`, `verifier:`, or `platforms:` blocks.
- **Smart defaults, easy overrides.** Default to single scenario with Docker via molecule-plugins. Make multi-scenario and alternative platforms easy to opt into.
- **Idempotence by default.** Include idempotence step in the default test sequence. This is molecule's killer feature over raw ansible-test.
- **Use the real default sequence.** Don't simplify the official default — it includes cleanup+destroy at the start (ensures clean slate) and syntax check before create.

## Skill 2: ansible-migrate-molecule

### Purpose

Analyze an existing molecule setup, report gaps against the current philosophy, and apply transformations.

### Detection phase

Scan for:
- `molecule/` or `extensions/molecule/` directories
- `molecule.yml` files — parse for driver, verifier, provisioner declarations
- `tox.ini` / `tox-ansible.ini` with molecule references
- testinfra test files (`test_*.py`, `conftest.py` in molecule directories)
- molecule version in requirements.txt / CI workflows
- CI workflows that run molecule

### Analysis output (gap report)

For each finding, classify as:

| Gap | Severity | Migration Path |
|-----|:--------:|:---------------|
| `driver: name: docker` declared | WARNING | Remove driver block, add create.yml/destroy.yml using molecule-plugins playbooks |
| `verifier: name: testinfra` | INFO | Rewrite as Ansible verify.yml (offer to convert assertions) |
| `verifier: name: inspec` | INFO | Rewrite as Ansible verify.yml |
| Molecule version < 24.x | WARNING | Update version pin, review breaking changes |
| No `test_sequence` configured | INFO | Add explicit sequence matching testing needs |
| Molecule-generated inventory | INFO | Migrate to native inventory integration |
| `provisioner:` block present | WARNING | Deprecated — migrate to `ansible:` block |
| No idempotence step | WARNING | Add to test sequence |

### Transformation phase

After user reviews the gap report, offer to apply fixes:
- Rewrite `molecule.yml` to current format
- Generate `create.yml`/`destroy.yml` from old driver config
- Convert testinfra assertions to Ansible verify.yml (best-effort)
- Update version pins
- Add idempotence step to test sequence

### Scope boundaries

- Does NOT create molecule from scratch (that's ansible-new-molecule)
- Does NOT change what the tests cover, only how they're structured
- Preserves existing scenario names and test coverage
- Warns but doesn't auto-convert complex testinfra suites (manual review needed)

## Shared Foundation

Both skills need a common reference for "what correct modern molecule looks like." Options:

1. **Bundled reference doc** (`references/molecule-philosophy.md`) — extracted key rules from the official philosophy, similar to how `ansible-good-practices` uses `references/*.adoc` files
2. **ansible-know MCP** — fetch the philosophy doc live via `search_docs` + `fetch_doc` (already works, we fetched it in this session)
3. **Both** — bundled reference as primary, MCP fetch as fallback for latest updates

Recommend option 3 (same pattern as ansible-good-practices).

## Resolved Questions

### Q1: Should ansible-new-molecule detect what a role manages and suggest scenarios?

**Answer: Yes, lightweight detection.** Scan the role for:
- `meta/main.yml` platforms → suggest per-platform scenarios (e.g., if it lists EL and Debian, offer an OS-matrix strategy)
- `handlers/main.yml` service restarts → include service verification assertions in verify.yml
- `defaults/main.yml` variable patterns → suggest feature-variant scenarios (e.g., if there's a `_provider` variable, suggest per-provider scenarios)
- `tasks/*.yml` componentized files → suggest per-component scenarios

This should be **suggestions presented to the user**, not automatic generation. Same interactive pattern as ansible-new-role's variable builder.

### Q2: How deep should testinfra → verify.yml conversion go?

**Answer: Convert simple patterns, flag complex ones.** The common testinfra assertions map directly to Ansible modules:

| testinfra | Ansible verify.yml equivalent |
|-----------|:------------------------------|
| `host.service("nginx").is_running` | `ansible.builtin.service_facts` + `assert` |
| `host.package("nginx").is_installed` | `ansible.builtin.package_facts` + `assert` |
| `host.file("/etc/foo").exists` | `ansible.builtin.stat` + `assert` |
| `host.socket("tcp://0.0.0.0:80").is_listening` | `ansible.builtin.wait_for` (port check) |
| `host.user("foo").exists` | `ansible.builtin.getent` + `assert` |

Complex Python logic (custom fixtures, parameterized tests, multi-step assertions with state) → flag for manual review with a comment explaining what the test was doing.

### Q3: Should the skills handle tox-ansible integration?

**Answer: Yes for collections, no for roles.**
- **ansible-new-molecule for collections**: offer to generate `tox-ansible.ini` alongside molecule config (42% of collections in our survey use tox-ansible)
- **ansible-new-molecule for roles**: skip tox (only 6% of roles use it)
- **ansible-migrate-molecule**: detect and preserve existing tox integration, update paths if molecule directory structure changes

### Q4: Container image and systemd strategy?

**Answer: Detect systemd need, choose approach accordingly.** This is more nuanced than just picking an image — systemd in containers is the #1 pain point for molecule testing.

**Findings from testing:**
- Base Fedora/CentOS Stream images don't include systemd — needs custom Containerfile or prepare step
- UBI-init images (`registry.access.redhat.com/ubi9/ubi-init`) have systemd built-in and are free to pull (no subscription needed)
- Rootless Podman + systemd is fragile (depends on host cgroup delegation, kernel version, systemd alignment). On Fedora 42 with cgroup v2 and rootless Podman 5.8.2, systemd containers fail to start
- Non-systemd testing (`sleep infinity` + exec pattern) works perfectly for roles that don't manage services

**Three patterns observed in the wild:**

| Pattern | Used By | Pros | Cons |
|---------|---------|------|------|
| Pre-built systemd images | geerlingguy (custom `geerlingguy/docker-*-ansible` images), sensu | Simple config, fast (no build step) | External dependency, may lag behind distro releases |
| UBI-init | ansible-middleware (wildfly, keycloak, amq, jws, infinispan) | Official, free, systemd built-in, no build step | EL-only (no Debian/Ubuntu equivalent) |
| Custom Containerfile per scenario | cloudalchemy, nginxinc, dev-sec | Full control, any distro | Slower (build step), more files to maintain |

**Skill strategy:**

| Role Type | Container Approach | Image |
|-----------|:------------------:|:------|
| No services (config, packages, users) | `sleep infinity` command, no systemd | `quay.io/fedora/fedora:latest` or `quay.io/centos/centos:stream9` |
| Manages services (systemd required), EL only | UBI-init (no build step) | `registry.access.redhat.com/ubi9/ubi-init` |
| Manages services, multi-platform | Custom Containerfile per platform | Skill generates Containerfiles with `pre_build_image: false` |

**Detection:** Scan role for `ansible.builtin.systemd`, `ansible.builtin.service`, and handlers with `service:` to determine if systemd is needed.

**Runtime detection:** Check for `podman` then `docker`. Rootless Podman + systemd in containers can be fragile depending on host kernel, cgroup version, and Podman version — the skill should warn users if systemd containers fail to start and suggest rootful Podman or Docker as alternatives. This needs further testing across distros before we can give specific guidance (initial testing on Fedora 42 with Podman 5.8.2 showed failures, but that's one data point on an EOL release).

### Q5: CI template variants?

**Answer: GitHub Actions only for MVP.** 100% of the surveyed roles with CI use GitHub Actions. Add GitLab CI / Zuul support later as a follow-up if requested.

## Validated: molecule init generates the new pattern

Tested with molecule 26.6.0. Running `molecule init scenario` generates:

- **No `driver:` block** — ansible-native by default
- **No `provisioner:` block** — uses the new `ansible:` block with `executor`, `cfg`, `env`
- **No `verifier:` block** — Ansible verify.yml by default
- **No `platforms:` block** — uses `create.yml`/`destroy.yml` playbooks
- **Full default test sequence** including idempotence
- **Stub `create.yml`/`destroy.yml`** with TODO comments for the developer to fill in

**Implication for ansible-new-molecule:** The skill should use `molecule init scenario` as the baseline (if molecule is installed), then enhance the output:
- Fill in `create.yml`/`destroy.yml` stubs with working playbooks (Docker/Podman via molecule-plugins, or UBI-init for systemd roles)
- Replace the generic `converge.yml` with one that uses actual role variables from `defaults/main.yml`
- Replace the placeholder `verify.yml` with assertions generated from role introspection (see verify template strategy below)
- Adjust `molecule.yml` inventory path and ansible config for the target role/collection
- Fall back to manual generation if `molecule init` is not available

## Verify task generation: hybrid template + adaptation

The skill generates verify.yml tasks using a two-step approach: match the role to an archetype template, then adapt with real values from the role.

### Step 1: Detect role archetype

Scan `defaults/main.yml` variable names and `tasks/` module usage to classify:

| Archetype | Detection signals |
|---|---|
| `package_service` | `*_packages` vars + `ansible.builtin.dnf/apt/package` + `ansible.builtin.systemd/service` in tasks or handlers |
| `config_only` | `ansible.builtin.template`/`copy` tasks, no package/service tasks |
| `user_group` | `ansible.builtin.user`/`group` in tasks, `*_user`/`*_group` vars |
| `mount_storage` | `ansible.posix.mount`, `*_mount` vars |
| `firewall` | `ansible.posix.firewalld`/`community.general.ufw` in tasks |
| `container` | `containers.podman.*`/`community.docker.*` in tasks |
| `cloud_resource` | `amazon.aws.*`/`google.cloud.*`/`azure.*` in tasks |

A role can match multiple archetypes (e.g., a webserver role is `package_service` + `config_only` + `firewall`).

### Step 2: Load and adapt templates

Each archetype has a template with proven assertion patterns. For example, `package_service` generates:

```yaml
- name: Verify packages are installed
  ansible.builtin.package:
    name: "{{ item }}"
    state: present
  check_mode: true
  register: __verify_pkg
  failed_when: __verify_pkg.changed
  loop: "{{ PACKAGES_VAR }}"

- name: Verify service is running and enabled
  ansible.builtin.systemd:
    name: "{{ SERVICE_VAR }}"
    state: started
    enabled: true
  check_mode: true
  register: __verify_svc
  failed_when: __verify_svc.changed
```

Smart adaptation replaces placeholders with real values:
- **Variable substitution** — `PACKAGES_VAR` → actual variable name from `defaults/main.yml` (CoP naming convention with role prefix makes this scannable)
- **Path extraction** — scan `template`/`copy` tasks for `dest:` values
- **Additive** — if role does things beyond matched templates, pull in extra assertions
- **Subtractive** — remove assertions for things the template covers but the role doesn't do
- **Fallback** — for `command:`/`shell:` tasks or unrecognized modules, generate a TODO comment

### Limitations

- Roles heavy on `command:`/`shell:` tasks — can't infer what to verify, generates TODOs
- Complex conditional logic — won't cover all branches, suggests additional scenarios
- Cloud/API modules — can generate assertions but warns about credential requirements

## ansible-know MCP integration

The skill can optionally use the `ansible-know` MCP server (same dependency as `ansible-docs`) for smarter output:

- **`get_module_doc`** — when generating verify tasks, look up module return values to know exactly what to assert on (e.g., `ansible.builtin.stat` returns `.stat.exists`, `.stat.mode`, `.stat.size`)
- **`search_docs`** — fetch latest Molecule configuration docs to validate generated `molecule.yml` against current schema
- **`search_collections`** — discover test-relevant collections (e.g., if the role uses `community.general` modules, suggest adding it to test `requirements.yml`)

This is optional — the skill works without MCP using the bundled reference and archetype templates. MCP enriches the output but is not required.

## Reference patterns from ansible-middleware

The file `tmp/molecule-patterns-documentation.md` contains detailed molecule.yml examples from ansible-middleware and redhat-cop collections, including multi-node cluster testing, HA replication with shared volumes, cross-DC architecture, and selective idempotence control. These patterns should be promoted to a bundled reference file (`references/molecule-patterns.md`) that the skill can load when generating multi-node or advanced scenarios.

## Remaining Work

1. ~~Resolve open questions~~ (done)
2. ~~Validate molecule.yml template against actual molecule release~~ (done — molecule 26.6.0 confirmed, see above)
3. Fetch and review actual create.yml/destroy.yml from molecule-plugins for Docker/Podman to use as templates
4. Promote `tmp/molecule-patterns-documentation.md` to `references/molecule-patterns.md`
5. Write `ansible-new-molecule` SKILL.md
6. Integrate call points into `ansible-new-role` and `ansible-new-collection`
7. Write `ansible-migrate-molecule` SKILL.md
8. Create bundled `references/molecule-philosophy.md`
9. Test against real roles/collections from the survey
10. Further test rootless Podman + systemd across distros (RHEL 9, Fedora 43, Ubuntu)
