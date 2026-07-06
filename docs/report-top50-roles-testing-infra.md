# Testing Infrastructure in the Top 50 Ansible Roles

**Date:** 2026-07-02
**Method:** Galaxy API ranked by download count (`/api/v1/search/roles/?order_by=-download_count`), cross-matched with GitHub stars for community significance. Each repo inspected via GitHub MCP tools for molecule, tox, pytest/testinfra, and CI configuration. Supplemented with GitHub search for niche roles with advanced molecule setups.

## Results — Top 50 by Galaxy Downloads

| # | Role | Downloads | Molecule | Scenarios | Driver | tox | pytest/testinfra | Verifier | CI |
|---|------|:---------:|:--------:|:---------:|:------:|:---:|:----------------:|:--------:|:--:|
| 1 | **geerlingguy.docker** | 28.2M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 2 | **geerlingguy.java** | 22.8M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 3 | **datadog.datadog** | 19.7M | No | — | — | No | No | — | GHA (custom) |
| 4 | **geerlingguy.nginx** | 15.1M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 5 | **geerlingguy.pip** | 14.6M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 6 | **geerlingguy.php** | 12.9M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 7 | **geerlingguy.apache** | 12.1M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 8 | **0x0I.systemd** | 11.5M | Yes | 3 | Docker | No | **Yes testinfra** | testinfra | — |
| 9 | **geerlingguy.composer** | 11.0M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 10 | **geerlingguy.nfs** | 9.3M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 11 | **geerlingguy.memcached** | 8.2M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 12 | **geerlingguy.ntp** | 7.4M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 13 | **andrewrothstein.kubectl** | 6.8M | No | — | — | No | No | — | — |
| 14 | **dj-wasabi.zabbix-agent** | 5.5M | Yes | 3 | Docker | No | **Yes testinfra** | testinfra | — |
| 15 | **geerlingguy.mysql** | 5.3M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 16 | **geerlingguy.repo-epel** | 5.2M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 17 | **robertdebock.bootstrap** | 4.7M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 18 | **nginxinc.nginx** | 4.6M | Yes | **15** | Docker | No | No | Ansible | GHA+molecule |
| 19 | **elastic.elasticsearch** | 4.5M | No | — | — | No | No | — | Test Kitchen |
| 20 | **dev-sec.ssh-hardening** | 4.2M | No | — | — | No | No | — | GHA (release) |
| 21 | **geerlingguy.postgresql** | 4.1M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 22 | **dev-sec.os-hardening** | 3.7M | Yes | 4 | Docker | No | **Yes testinfra** | testinfra | GHA+molecule |
| 23 | **geerlingguy.nodejs** | 3.8M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 24 | **cloudalchemy.node_exporter** | 3.5M | Yes | 3 | Docker | No | **Yes testinfra** | testinfra | — |
| 25 | **jdauphant.ssl-certs** | 3.3M | No | — | — | No | No | — | — |
| 26 | **geerlingguy.jenkins** | 3.2M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 27 | **ansistrano.deploy** | 3.1M | No | — | — | No | No | — | GHA (syntax) |
| 28 | **ansiblebit.oracle-java** | 2.9M | No | — | Vagrant | **Yes** | No | — | tox+Vagrant |
| 29 | **jnv.unattended-upgrades** | 2.9M | No | — | — | No | No | — | — |
| 30 | **geerlingguy.filebeat** | 2.8M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 31 | **geerlingguy.git** | 2.5M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 32 | **nginxinc.nginx_config** | 2.3M | Yes | **11** | Docker | No | No | Ansible | GHA+molecule |
| 33 | **geerlingguy.certbot** | 2.2M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 34 | **cloudalchemy.grafana** | 2.1M | Yes | 2 | Docker | No | **Yes testinfra** | testinfra | — |
| 35 | **cloudalchemy.prometheus** | 1.9M | Yes | 3 | Docker | No | **Yes testinfra** | testinfra | — |
| 36 | **cloudalchemy.alertmanager** | 1.9M | Yes | 3 | Docker | No | **Yes testinfra** | testinfra | — |
| 37 | **geerlingguy.security** | 1.8M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 38 | **evrardjp.keepalived** | 1.7M | Yes | 3 | **Vagrant** | **Yes** | No | Ansible | — |
| 39 | **riemers.gitlab-runner** | 1.5M | Yes | 2 | Docker | No | **Yes testinfra** | testinfra | — |
| 40 | **xanmanning.k3s** | 1.4M | Yes | 5+ | Docker | No | **Yes testinfra** | testinfra | GHA+molecule |
| 41 | **mrlesmithjr.kvm** | 1.4M | Yes | 1 | **Vagrant** | No | **Yes testinfra** | testinfra | — |
| 42 | **geerlingguy.firewall** | 1.4M | Yes | 1 | Docker | No | No | Ansible | GHA+molecule |
| 43 | **arillso.logrotate** | 1.3M | Yes | 1 | Docker | No | No | Ansible | — |
| 44 | **sensu.sensu-ansible** | 1.3M | Yes | **7** | Docker | No | No | **InSpec** | — |
| 45 | **mrlesmithjr.netplan** | 1.2M | Yes | 2 | **Vagrant** | No | No | Ansible | — |
| 46 | **ansible-ThoTeam.nexus3-oss** | 1.1M | Yes | **6** | Docker | No | **Yes testinfra** | testinfra | — |
| 47 | **DavidWittman.redis** | 1.1M | No | — | — | No | No | — | — |
| 48 | **lablabs.rke2** | 983K | Yes | 4 | Docker | No | No | Ansible | GHA+molecule |
| 49 | **diodonfrost.amazon-ssm** | 881K | Yes | 4 | Docker | No | No | Ansible | — |
| 50 | **hifis-net.unattended-upgrades** | 847K | Yes | 1 | **Podman** | No | No | Ansible | — |

### Additional High-Star Roles (from GitHub search)

| Role | Stars | Molecule | Scenarios | Driver | tox | testinfra | Notes |
|------|:-----:|:--------:|:---------:|:------:|:---:|:---------:|-------|
| **konstruktoid.hardening** | 639 | Yes | 2+ | Docker + **Vagrant** | **Yes** | No | tox orchestrates molecule across devel/docker/upstream envs. Most sophisticated tox+molecule setup. |
| **githubixx.wireguard** | 683 | Yes | 5 | **Vagrant** | No | No | default, netplan, spoke-hub, etc. No testing CI. |
| **linux-system-roles/timesync** | — | No | — | — | **Yes** | No | Uses tox-lsr framework (see Advanced Frameworks section). |

## Molecule Version Survey

| Role | Molecule Version | Installation |
|------|:----------------:|:-------------|
| dev-sec.os-hardening | **26.4.0** (current CalVer) | Pinned in requirements.txt |
| cloudalchemy.node_exporter | >=3.0.0 | Floor constraint in test-requirements.txt |
| dj-wasabi.zabbix-agent | 3.0.8 | Pinned (old, Travis CI era) |
| geerlingguy roles | unpinned | Inline `pip install molecule molecule-plugins[docker]` |
| konstruktoid.hardening | unpinned | Via uv pip + molecule/requirements.txt |
| PyratLabs.k3s | unpinned | molecule-plugins[docker] without version |
| githubixx.wireguard | unpinned (v3+ format) | Not explicitly installed |

## Advanced Molecule Frameworks and Tools

These are not roles themselves but frameworks/tools that enable advanced molecule testing. Discovered via GitHub search for best-in-class molecule setups.

| Project | Stars | What It Does |
|---------|:-----:|:-------------|
| **linux-system-roles/tox-lsr** | — | Full tox integration orchestrating molecule across multiple Ansible versions. QEMU testing via custom runqemu.py. Podman/Docker containers. Parallel execution, batch mode, snapshot support, Ansible 2.9 through 2.20+. The most comprehensive molecule framework found. |
| **ansible/pytest-ansible** | 223 | Exposes molecule scenarios as pytest fixtures. Enables pytest as collection unit test runner. Bridge between pytest and molecule worlds. |
| **ansible-community/molecule-plugins** | — | Official source for podman, vagrant, ec2, azure, gce, docker drivers. Container labeling, network isolation, privileged mode handling. |
| **jonashackt/molecule-ansible-docker-aws** | 91 | Educational: demonstrates Docker, Vagrant, AND AWS EC2 in same repo with shared testinfra tests. Good reference for multi-driver setups. |
| **freedomofpress/securedrop** | 3,800+ | Multi-node staging with Vagrant+libvirt. Custom create/destroy playbooks. Testinfra with parallel execution and junit output. Production security testing. |
| **Comcast/ansible-sdkman** | 195 | 5 OS-specific scenarios with shared tests. Parameterized Dockerfile.j2. tox orchestration. Good DRY pattern for multi-OS molecule testing. |

## Adoption Summary (50 roles)

| Tool | Count | Percentage |
|------|:-----:|:----------:|
| **Molecule** | 41/50 | **82%** |
| **tox** | 3/50 | 6% |
| **pytest/testinfra** | 11/50 | **22%** |
| **InSpec verifier** | 1/50 | 2% |
| **No testing infra** | 8/50 | 16% |

### Molecule Driver Distribution (41 roles with molecule)

| Driver | Count | Percentage |
|--------|:-----:|:----------:|
| Docker | 35 | 85% |
| Vagrant (libvirt/virtualbox) | 5 | 12% |
| Podman | 1 | 2% |

### Molecule Verifier Distribution (41 roles with molecule)

| Verifier | Count | Percentage |
|----------|:-----:|:----------:|
| Ansible (verify.yml) | 29 | 71% |
| testinfra (pytest) | 11 | 27% |
| InSpec | 1 | 2% |

### Molecule Scenario Count Distribution (41 roles with molecule)

| Scenarios | Count | Examples |
|:---------:|:-----:|:---------|
| 1 | 24 | All geerlingguy roles, robertdebock.bootstrap |
| 2 | 4 | riemers.gitlab-runner, mrlesmithjr.netplan |
| 3 | 7 | cloudalchemy roles, dj-wasabi.zabbix-agent, evrardjp.keepalived |
| 4 | 3 | dev-sec.os-hardening, lablabs.rke2, diodonfrost.amazon-ssm |
| 5+ | 3 | xanmanning.k3s (5+), nexus3-oss (6), sensu (7) |
| 11+ | 2 | nginxinc.nginx_config (11), nginxinc.nginx (15) |

## Key Takeaways

### 1. Molecule is the standard for role testing (82%)

41 of 50 roles use molecule. This is the inverse of collections where only ~12% use it. Molecule was designed for roles and the ecosystem reflects that.

### 2. Three tiers of molecule sophistication

**Tier 1 — Basic (58% of molecule users):** Single scenario, Docker driver, Ansible verify.yml, GH Actions CI. The "geerlingguy pattern" — clean, minimal, reproducible. 24 roles follow this exactly.

**Tier 2 — Intermediate (32%):** Multiple scenarios, Docker driver, testinfra or InSpec verification. cloudalchemy roles, dj-wasabi, sensu, nginxinc, nexus3-oss. More expressive assertions and broader coverage.

**Tier 3 — Advanced (10%):** tox orchestration, multiple drivers (Docker + Vagrant), complex scenario matrices. konstruktoid.hardening, evrardjp.keepalived, PyratLabs.k3s. The best reference implementations.

### 3. testinfra is the advanced verification layer (22%)

11 roles use pytest-testinfra instead of Ansible verify tasks:
- **cloudalchemy** roles (grafana, prometheus, alertmanager, node_exporter) — consistent testinfra pattern
- **dj-wasabi.zabbix-agent** — multiple scenarios with testinfra
- **0x0I.systemd** — testinfra 10.1.1 (modern)
- **riemers.gitlab-runner** — complete pytest.ini + testinfra setup
- **mrlesmithjr.kvm** — Vagrant + testinfra
- **ansible-ThoTeam.nexus3-oss** — most comprehensive testinfra test suite (multiple test files)
- **xanmanning.k3s** — testinfra for k3s cluster verification

### 4. nginxinc roles have the most scenarios

nginxinc/ansible-role-nginx (15 scenarios) and nginxinc/ansible-role-nginx-config (11 scenarios) are the scenario count leaders. They test every configuration variant but use Ansible verify rather than testinfra.

### 5. sensu-ansible is the only InSpec user

sensu/sensu-ansible uses InSpec as the verifier with 7 OS-specific scenarios (amazonlinux, centos, debian, fedora, oraclelinux, ubuntu, default). Unique in the top 50.

### 6. Vagrant appears for VM-dependent testing

5 roles use Vagrant: evrardjp.keepalived (HA/VRRP), mrlesmithjr.kvm (KVM virtualization), mrlesmithjr.netplan (networking), githubixx.wireguard (VPN), konstruktoid.hardening (security). These are roles where Docker containers can't simulate the target environment.

### 7. Podman is emerging

hifis-net/ansible-role-unattended-upgrades uses Podman as the molecule driver. Combined with redhat-cop collections using Podman on the collections side, this is a small but growing trend.

### 8. Most roles leave molecule unpinned

Only dev-sec.os-hardening pins to the current CalVer (26.4.0). Most roles use `pip install molecule molecule-plugins[docker]` without version constraints, meaning they track latest.

## Comparison: Collections vs Roles (expanded)

| Metric | Collections (top 48) | Roles (top 50) |
|--------|:--------------------:|:--------------:|
| Molecule adoption | 12% (6/48) | **82%** (41/50) |
| tox/nox adoption | **52%** (25/48) | 6% (3/50) |
| pytest adoption | **38%** (18/48) | 22% (11/50) |
| No testing infra | 29% (14/48) | 16% (8/50) |

The testing culture remains inverted: **collections use pytest + tox; roles use molecule**. The overlap (molecule + testinfra + tox) is small but represents the most thorough approach.

## Best Reference Implementations for a Molecule Skill

If building a molecule-aware skill, these are the best examples to model:

### For basic role testing
- **geerlingguy/ansible-role-docker** — the canonical minimal pattern (molecule + Docker + Ansible verify + GH Actions)

### For multi-scenario role testing
- **nginxinc/ansible-role-nginx** — 15 scenarios covering every config variant
- **sensu/sensu-ansible** — 7 OS-specific scenarios with InSpec

### For testinfra verification
- **ansible-ThoTeam/nexus3-oss** — most comprehensive testinfra suite with multiple test files
- **cloudalchemy/ansible-prometheus** — clean testinfra pattern replicated across 4 roles

### For tox + molecule orchestration
- **konstruktoid/ansible-role-hardening** — tox orchestrates molecule across Vagrant/Docker environments

### For collection-level molecule testing
- **aristanetworks/avd** — 30+ scenarios, the gold standard for collections
- **dev-sec/ansible-collection-hardening** — 8 scenarios, dual driver, shared config

### For advanced frameworks
- **linux-system-roles/tox-lsr** — QEMU/podman/docker, parallel execution, batch mode
- **ansible/pytest-ansible** — bridge between pytest fixtures and molecule scenarios

## Molecule Philosophy and Current Direction

Based on the [official Molecule testing philosophy](https://docs.ansible.com/projects/molecule/philosophy/), the project has a clear strategic direction that most repos in the wild have not yet adopted.

### Key principles from the official philosophy

1. **Ansible IS the driver.** Molecule now uses Ansible as its default driver — Ansible playbooks handle the entire test lifecycle (create/destroy). The old separate "driver" plugins (docker, vagrant, podman) are deprecated in favor of `molecule-plugins` which provides create/destroy playbooks that run through Ansible natively. Most repos in this survey still declare `driver: name: docker` — this is the legacy pattern.

2. **Ansible is both provisioner AND verifier.** The official philosophy positions Ansible as the unified tool for provisioning, convergence, and verification. The testinfra/InSpec verifier pattern (found in 22% of the surveyed roles) is the older approach; the modern recommendation is Ansible verify.yml playbooks using Ansible's own module ecosystem for assertions. Notably, geerlingguy roles already follow this pattern (Ansible verify.yml), making them more aligned with current best practices than the testinfra-using roles.

3. **Native inventory integration.** Molecule now integrates directly with Ansible's inventory system — static files, dynamic scripts, inventory plugins, constructed inventory. This replaces the old molecule-managed inventory generation, enabling single-source-of-truth patterns where test and production share the same inventory with `--limit` targeting.

4. **The test sequence is the core abstraction.** The canonical phases are: dependency → create → prepare → converge → idempotence → side_effect → verify → cleanup → destroy. Teams can configure custom sequences (rapid dev, integration, comprehensive). Configurable sequences are committed as code and shared across teams.

5. **Collection testing is a first-class concern.** The roadmap prioritizes enhanced collection detection, automatic dependency resolution, and the `extensions/molecule/` directory pattern for collection-level testing.

### Gap between philosophy and ecosystem reality

| Aspect | Official Philosophy | What We Found in the Wild |
|--------|:-------------------:|:-------------------------:|
| Driver model | Ansible-native playbooks | 85% still declare `driver: name: docker` |
| Verifier | Ansible verify.yml | 22% use testinfra, 2% use InSpec |
| Inventory | Native Ansible inventory integration | Most use molecule-generated inventory |
| Molecule version | CalVer 24.x+ (current: 26.x) | Most unpinned; one on 3.0.8 |
| Test sequences | Configurable per-scenario | Most use defaults unchanged |

### Implications for tooling

The geerlingguy "basic" pattern (Ansible verify.yml, single scenario, Docker) is actually **closer to the official philosophy** than the "advanced" testinfra-based setups, despite appearing less sophisticated. The main areas where even geerlingguy roles lag behind the philosophy are:

- Still using `driver: name: docker` instead of Ansible-native create/destroy
- Not leveraging native inventory integration
- Not using configurable test sequences
- Single scenario rather than multi-scenario coverage

Any molecule-aware tooling we build should target the CURRENT philosophy (Ansible-native everything) rather than codifying the legacy patterns still prevalent in the ecosystem.

## Outcomes

This research, combined with the [collections testing infrastructure report](report-top50-collections-testing-infra.md) and the [official Molecule testing philosophy](https://docs.ansible.com/projects/molecule/philosophy/), led to the following design decisions:

1. **Two new skills, not one.** The molecule testing space needs a creation skill and a migration skill — different users, different flows.

2. **ansible-new-molecule** — a standalone skill that scaffolds molecule testing following the current philosophy (Ansible-native driver, Ansible verify.yml, native inventory integration, configurable test sequences). Can be invoked standalone or called by `ansible-new-role` and `ansible-new-collection` as a shared sub-skill. Supports both role-level (`molecule/`) and collection-level (`extensions/molecule/`) patterns.

3. **ansible-migrate-molecule** — a separate skill that analyzes existing molecule setups, reports gaps against the current philosophy, and applies transformations (old driver declarations → Ansible-native, testinfra → verify.yml, molecule-generated inventory → native inventory, version upgrades).

4. **Shared foundation.** Both skills share a common understanding of what "correct modern molecule" looks like, sourced from the official philosophy doc. This is analogous to how `ansible-good-practices` loads rules from `references/*.adoc`.

See [spec-molecule-skills-design.md](spec-molecule-skills-design.md) for the full design specification.

## Methodology

- Top 50 roles identified from Galaxy API (`/api/v1/search/roles/?order_by=-download_count&page_size=50`), supplemented with GitHub search by stars for high-profile roles not in the Galaxy top 50.
- Additional roles found via GitHub MCP search for advanced molecule setups (multi-driver, testinfra, tox integration).
- Each repo inspected via GitHub MCP tools (get_file_contents, search_code) for `molecule/` directories, `tox.ini`, `conftest.py`, `pytest.ini`, `pyproject.toml`, `test-requirements.txt`, and `.github/workflows/`.
- Molecule versions checked via requirements.txt, CI workflow pip install commands, and molecule.yml config format.
