# Testing Infrastructure in the Top 50 Ansible Collections

**Date:** 2026-07-02
**Method:** Galaxy search by download count + GitHub search for molecule-using collections. Each repo inspected via GitHub MCP tools for molecule, tox, nox, and pytest presence.

## Results — Top 50 by Popularity

| # | Collection | Downloads | Molecule | tox/nox | pytest | Notes |
|---|-----------|-----------|:--------:|:-------:|:------:|-------|
| 1 | **community.general** | 253M | No | No | Yes | conftest.py in tests/unit/plugins/ |
| 2 | **ansible.posix** | 131M | No | No | Yes | tests/unit/ with Python tests |
| 3 | **amazon.aws** | 86M | No | Yes tox | Yes | Comprehensive tox.ini (unit/lint/format/complexity). pytest in pyproject.toml with coverage |
| 4 | **ansible.utils** | 74M | No | No | Yes | pytest in pyproject.toml with xdist parallel execution |
| 5 | **ansible.windows** | 59M | No | No | Yes | conftest.py in tests/unit/ |
| 6 | **ansible.netcommon** | 58M | No | Yes tox-ansible | Yes | tox-ansible.ini at root |
| 7 | **community.docker** | 58M | No | Yes nox | Yes | noxfile.py instead of tox |
| 8 | **community.crypto** | 41M | No | Yes nox | Yes | noxfile.py instead of tox |
| 9 | **kubernetes.core** | 38M | No | Yes tox | Yes | tox.ini at root. conftest.py in tests/unit/ |
| 10 | **community.aws** | 35M | No | Yes tox | Yes | pytest in pyproject.toml with markers + coverage |
| 11 | **community.vmware** | 21M | No | Yes tox | Yes | tox.ini at root. conftest.py in tests/unit/ |
| 12 | **azure.azcollection** | 16M | No | No | No | Minimal testing infrastructure |
| 13 | **google.cloud** | 12M | **Yes** | No | No | molecule/ at repo root. pyproject.toml has linter configs |
| 14 | **oracle.oci** | 6M | No | No | No | No formal testing infrastructure |
| 15 | **ansible.scm** | 1.5M | No | Yes tox | Yes | tox.ini + tox-ansible.ini. Modern setup with ruff, black, pylint |
| 16 | **cisco.meraki** | 1.2M | No | No | No | Only ansible-test integration/sanity |
| 17 | **kubevirt.core** | 1.2M | No | Yes tox | Yes | tox.ini + tox-ansible.ini |
| 18 | **community.okd** | 813K | **Yes** | Yes tox | Yes | Full suite: molecule/default/, tox.ini, tests/unit/ |
| 19 | **community.google** | 707K | No | No | Yes | tests/unit/ only |
| 20 | **cloud.terraform** | 582K | No | Yes tox | Yes | tox.ini + pyproject.toml with mypy/black/isort |
| 21 | **community.windows** | — | No | No | No | |
| 22 | **community.mysql** | — | No | No | No | |
| 23 | **community.postgresql** | — | No | Yes tox + nox | No | Both tox.ini and noxfile.py |
| 24 | **community.dns** | — | No | Yes nox | No | |
| 25 | **community.hashi_vault** | — | No | No | No | |
| 26 | **community.routeros** | — | No | Yes nox | No | |
| 27 | **community.zabbix** | — | **Yes** | Yes tox | No | molecule/ + tox.ini |
| 28 | **community.libvirt** | — | No | No | No | |
| 29 | **community.rabbitmq** | — | No | No | No | |
| 30 | **community.grafana** | — | **Yes** | No | No | molecule/ only |
| 31 | **ansible.yang** | — | No | Yes tox | No | pyproject.toml with black config |
| 32 | **infra.aap_configuration** | — | No | No | No | redhat-cop/aap_configuration |
| 33 | **containers.podman** | — | No | No | No | setup.cfg with flake8 |
| 34 | **cisco.ios** | — | No | Yes tox-ansible | No | |
| 35 | **cisco.nxos** | — | No | Yes tox-ansible | No | |
| 36 | **arista.eos** | — | No | Yes tox-ansible | No | |
| 37 | **junipernetworks.junos** | — | No | Yes tox-ansible | No | |
| 38 | **vyos.vyos** | — | No | Yes tox-ansible | No | |
| 39 | **ansible.eda** | — | No | Yes tox | No | |
| 40 | **middleware_automation.wildfly** | — | **Yes** | No | No | ansible-middleware/wildfly |
| 41 | **middleware_automation.keycloak** | — | **Yes** | No | No | ansible-middleware/keycloak |
| 42 | **infra.ah_configuration** | — | No | No | No | |
| 43 | **infra.ee_utilities** | — | No | No | No | |
| 44 | **awx.awx** | — | No | Yes tox | Yes | pytest.ini present |
| 45 | **netbox.netbox** | — | No | Yes tox-ansible | Yes | pytest in pyproject.toml |
| 46 | **community.sops** | — | No | Yes nox | No | |
| 47 | **community.mongodb** | — | No | No | No | |
| 48 | **ansible.snmp** | — | No | No | No | |

## Molecule-Using Collections Found via Deep GitHub Search

These collections were found by deep-searching GitHub organizations (ansible-middleware, redhat-cop, ansible-collections, ansible, aristanetworks) for molecule usage. This is the most comprehensive inventory of molecule-in-collections available.

### ansible-middleware (9 collections, 60+ scenarios total)

The ansible-middleware org is the **single richest source** of molecule-in-collections examples. Every collection follows a consistent pattern: Docker with UBI9 images, collection-level `molecule/` directory, multiple scenarios testing feature variants.

| Collection | Stars | Scenarios | Notable Patterns |
|-----------|:-----:|:---------:|:-----------------|
| **middleware_automation.wildfly** | 15 | **18** | Cluster testing, migration scenarios, Prospero upgrade tool, uninstall, YAML config validation |
| **middleware_automation.keycloak** | 134 | **14** | HA scenarios, version-specific testing (26.4_below), upgrade testing, SSL reverse proxy, Quarkus devmode |
| **middleware_automation.amq** | 22 | **13** | Shared storage HA with named volumes, federation, mirroring for DC failover, SSL broker connections, fact caching |
| **middleware_automation.jws** | 8 | **6** | Selective idempotence testing (force_install skips idempotence), template overrides, pre-installed JDK |
| **middleware_automation.common** | — | **4** | Environment-specific API testing (stage vs prod), unified API validation |
| **middleware_automation.infinispan** | — | **3** | Vector search functionality, distributed cache |
| **middleware_automation.amq_streams** | 10 | **2** | Architecture comparison: ZooKeeper vs KRaft modes |
| **middleware_automation.cross-dc-rhsso-demo** | 7 | **2** | **Most complex**: 8 containers, 3-tier architecture (PostgreSQL + Datagrid + RHSSO) across 2 sites, cross-network linking |
| **middleware_automation.rhbk-ha-cluster** | — | **1** | Complete HA stack: 5 containers (2 RHBK, 2 Datagrid, 1 PostgreSQL) |

### aristanetworks (2 collections, 43+ scenarios total)

| Collection | Stars | Scenarios | Notable Patterns |
|-----------|:-----:|:---------:|:-----------------|
| **aristanetworks/avd** | 200+ | **30+** | Gold standard for collection-level testing. `extensions/molecule/` with per-topology scenarios (EVPN, L2LS, L3LS, MPLS, campus). Unit, negative, and deprecated-vars tests. |
| **arista.cvp** | 78 | **13** | CloudVision Portal automation. Delegated driver. DHCP provisioning, strict/loose configlet modes, v3 API scenarios. |

### dev-sec (1 collection, 8 scenarios)

| Collection | Stars | Scenarios | Notable Patterns |
|-----------|:-----:|:---------:|:-----------------|
| **dev-sec/ansible-collection-hardening** | **5,403** | 8 | Per-role testing (OS, SSH, MySQL, nginx). Dual driver (Docker + Vagrant). Shared molecule config. testinfra verification. |

### redhat-cop (5 collections)

| Collection | Stars | Scenarios | Notable Patterns |
|-----------|:-----:|:---------:|:-----------------|
| **redhat-cop/infra.support_assist** | 8 | 6 | Podman driver. Tests Red Hat support workflows. |
| **redhat-cop/infra.convert2rhel** | 8 | 2 | **Vagrant with libvirt** — full VM testing for OS conversion (containers insufficient). |
| **redhat-cop/openshift-applier** | — | 1 | **Delegated driver** — tests against external OpenShift cluster. Testinfra verifier. |
| **redhat-cop/ansible.mcp_builder** | 2 | 5 | Podman with workspace volume mounting. Performance profiling via profile_tasks callback. |
| **redhat-cop/cloud.vmware_ops** | 10 | E2E | JUnit XML output, vault password file usage. |

### ansible-collections upstream (10 collections)

| Collection | Scenarios | Notable Patterns |
|-----------|:---------:|:-----------------|
| **ansible.platform** | **20+** | Most sophisticated: mock-based integration testing with `_mock` suffix scenarios (organization, team, users, token, authenticator, route, service, etc.) |
| **ansible.scm** | 5 | `extensions/molecule/` pattern. Template-based molecule config. |
| **ansible.consul** | 15 | Per-distro testing (AlmaLinux, CentOS Stream, Debian, Fedora, OracleLinux, Rocky, Ubuntu). Docker with dokken images. |
| **community.mongodb** | 10+ | Per-role molecule tests. testinfra verifier. Kubernetes operator testing via kind scenario. |
| **community.cassandra** | 5 | Docker + Vagrant scenarios. testinfra verifier. Multi-platform. |
| **community.pacemaker** | 3 | Multi-node cluster testing (3-node CentOS 7). testinfra verifier. |
| **community.proxysql** | 1 | testinfra verifier. |
| **community.openwrt** | 4 | `extensions/molecule/` pattern. |
| **community.beszel** | 3 | Hub and agent deployment scenarios. |
| **community.fqcn_migration** | 1 | Docker with UBI9. |

### ansible org (Kubernetes operators, 7 repos)

All Kubernetes operator repos follow the same pattern: delegated driver, 2 scenarios (default + kind).

| Collection | Notable |
|-----------|:--------|
| **ansible/awx-operator** | AWX operator lifecycle testing |
| **ansible/awx-resource-operator** | AWX resource operator |
| **ansible/eda-server-operator** | Event-Driven Ansible operator |
| **ansible/galaxy-operator** | Galaxy operator |
| **ansible/ansible-ai-connect-operator** | AI Connect operator |
| **ansible/aap-azure-billing-operator** | AAP Azure billing |
| **ansible/aap-ui-operator** | AAP UI operator |
| **ansible/receptor-collection** | Mesh networking. Podman driver. |

### Other notable finds

| Collection | Scenarios | Notable Patterns |
|-----------|:---------:|:-----------------|
| **sysdig.agent** (sysdiglabs) | 5 | **EC2 driver** — real AWS cloud testing. Multiple agent modes (kmodule, legacy-ebpf, universal-ebpf). |
| **grafana/grafana-ansible-collection** | Per-role | Collection-aware role paths via MOLECULE_PROJECT_DIRECTORY. |
| **redhat-sap/molecule.driver** | — | A collection specifically FOR molecule drivers across cloud providers (Azure, AWS, IBM). |

## Adoption Summary (expanded)

### Among top-50 popular collections (by Galaxy downloads)

| Tool | Count | Percentage |
|------|:-----:|:----------:|
| **Molecule** | 6/48 | **12%** |
| **tox / tox-ansible** | 20/48 | **42%** |
| **nox** (tox alternative) | 5/48 | 10% |
| **pytest** | 18/48 | **38%** |
| **No testing infra** | 14/48 | 29% |

### Among ALL collections found with molecule (deep search)

| Organization | Collections with Molecule | Total Scenarios |
|-------------|:-------------------------:|:---------------:|
| ansible-middleware | **9** | **63+** |
| aristanetworks | 2 | 43+ |
| ansible-collections upstream | 10 | 67+ |
| ansible (operators) | 8 | 16 |
| redhat-cop | 5 | 16+ |
| dev-sec | 1 | 8 |
| Other (sysdig, grafana) | 3 | 8+ |
| **Total** | **38** | **220+** |

## Key Takeaways

### 1. Molecule in collections is niche but deep

Only ~12% of top-50 popular collections use molecule. But when you search specifically for molecule usage, 38+ collections across the ecosystem use it with 220+ total scenarios. The adoption is concentrated in specific organizations rather than spread across the ecosystem.

### 2. ansible-middleware is the gold standard

With 9 collections and 63+ scenarios, ansible-middleware demonstrates the most consistent and thorough molecule testing approach for collections. Their patterns include: multi-scenario feature testing, HA/clustering validation, upgrade testing, cross-DC architecture testing, and selective idempotence control.

### 3. Three collection-level molecule directory patterns

- **`molecule/`** at collection root (traditional, used by ansible-middleware, community.zabbix, community.grafana)
- **`extensions/molecule/`** (modern, used by aristanetworks/avd, ansible.scm, ansible.platform, community.openwrt, community.beszel)
- **Per-role `roles/*/molecule/`** (hybrid, used by community.mongodb, community.cassandra, dev-sec)

### 4. Kubernetes operators have a consistent pattern

All 7 ansible org operators use: delegated driver + 2 scenarios (default + kind). This is the canonical pattern for testing K8s operators with molecule.

### 5. tox dominates collection test orchestration (for non-molecule testing)

42% of top collections use tox or tox-ansible. Networking collections (cisco, arista, juniper, vyos) consistently use `tox-ansible.ini`. 10% have moved to nox.

### 6. Podman is emerging as the enterprise alternative

redhat-cop/infra.support_assist, redhat-cop/ansible.mcp_builder, and ansible/receptor-collection use Podman — more enterprise-friendly and rootless.

## Molecule Philosophy and Current Direction

Based on the [official Molecule testing philosophy](https://docs.ansible.com/projects/molecule/philosophy/), the project has a clear strategic direction that most repos in the wild have not yet adopted.

### Key principles from the official philosophy

1. **Ansible IS the driver.** Molecule now uses Ansible as its default driver — Ansible playbooks handle the entire test lifecycle (create/destroy). The old separate "driver" plugins (docker, vagrant, podman) are deprecated in favor of `molecule-plugins` which provides create/destroy playbooks that run through Ansible natively. Most repos in this survey still declare `driver: name: docker` — this is the legacy pattern.

2. **Ansible is both provisioner AND verifier.** The official philosophy positions Ansible as the unified tool for provisioning, convergence, and verification. The testinfra/InSpec verifier pattern found in some collections is the older approach; the modern recommendation is Ansible verify.yml playbooks using Ansible's own module ecosystem for assertions.

3. **Native inventory integration.** Molecule now integrates directly with Ansible's inventory system — static files, dynamic scripts, inventory plugins, constructed inventory. This replaces the old molecule-managed inventory generation, enabling single-source-of-truth patterns where test and production share the same inventory with `--limit` targeting.

4. **Collection testing is a first-class concern.** The roadmap prioritizes enhanced collection detection, automatic dependency resolution, and optimized testing patterns for how collections are developed and deployed.

5. **The test sequence is the core abstraction.** The canonical phases are: dependency → create → prepare → converge → idempotence → side_effect → verify → cleanup → destroy. Teams can configure custom sequences (rapid dev, integration, comprehensive).

### Gap between philosophy and ecosystem reality

| Aspect | Official Philosophy | What We Found in the Wild |
|--------|:-------------------:|:-------------------------:|
| Driver model | Ansible-native playbooks | 90%+ still declare `driver: name: docker` |
| Verifier | Ansible verify.yml | ~27% of roles use testinfra, ~2% use InSpec |
| Inventory | Native Ansible inventory integration | Most use molecule-generated inventory |
| Collection testing | First-class, `extensions/molecule/` | Only ~12% of collections use molecule at all |
| Version | CalVer 24.x+ | Most repos are unpinned or on old 3.x |

This gap means any molecule-aware tooling we build should target the CURRENT philosophy (Ansible-native everything) rather than codifying the legacy patterns still prevalent in the ecosystem.

## Outcomes

This research, combined with the [roles testing infrastructure report](report-top50-roles-testing-infra.md) and the [official Molecule testing philosophy](https://docs.ansible.com/projects/molecule/philosophy/), led to the following design decisions:

1. **Two new skills, not one.** The molecule testing space needs a creation skill and a migration skill — different users, different flows.

2. **ansible-new-molecule** — a standalone skill that scaffolds molecule testing following the current philosophy (Ansible-native driver, Ansible verify.yml, native inventory integration, configurable test sequences). Can be invoked standalone or called by `ansible-new-role` and `ansible-new-collection` as a shared sub-skill. Supports both role-level (`molecule/`) and collection-level (`extensions/molecule/`) patterns.

3. **ansible-migrate-molecule** — a separate skill that analyzes existing molecule setups, reports gaps against the current philosophy, and applies transformations (old driver declarations → Ansible-native, testinfra → verify.yml, molecule-generated inventory → native inventory, version upgrades).

4. **Shared foundation.** Both skills share a common understanding of what "correct modern molecule" looks like, sourced from the official philosophy doc. This is analogous to how `ansible-good-practices` loads rules from `references/*.adoc`.

See [spec-molecule-skills-design.md](spec-molecule-skills-design.md) for the full design specification.

## Methodology

- Top collections identified from Ansible Galaxy search API ranked by download count, plus targeted searches for specific collection namespaces.
- Additional collections found via GitHub MCP code search for molecule usage in ansible collection repos.
- Each repo inspected via GitHub MCP tools (get_file_contents, search_code) for molecule/, tox.ini, tox-ansible.ini, noxfile.py, conftest.py, pytest.ini, and pyproject.toml.
- Download counts marked "—" for collections not in the Galaxy top-20 results (Galaxy API does not expose download counts for collections outside ranked search results).
