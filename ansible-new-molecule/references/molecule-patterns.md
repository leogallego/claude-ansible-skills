# Molecule Testing Patterns — Concept Reference

Extracted from 220+ real-world molecule scenarios across ansible-middleware and
redhat-cop GitHub organizations. This file documents **what** to test and
**when**, not **how** to format molecule configs. All output should use the
modern ansible-native format described in the SKILL.md.

Source repos: ansible-middleware (amq, jws, keycloak, wildfly, quarkus, common,
cross-dc-rhsso-demo, rhbk-ha-cluster, amq_broker_ha_replication, amq_streams,
common_criteria), redhat-cop (infra.convert2rhel, openshift-applier,
ansible.mcp_builder, agnosticd, cloud.vmware_ops)

---

## Architecture Patterns

| Pattern | When to use | Key technique | Example repos |
|---|---|---|---|
| Multi-node cluster | Role deploys clustered services (brokers, databases, caches) | Multiple instances in create.yml with shared network, per-instance host_vars in inventory | amq (federation, replication, static_cluster) |
| HA primary/backup | Role supports failover roles | Two instances with different group membership (`primary`, `backup`), shared volume for data | amq replication, rhbk-ha-cluster |
| Multi-tier application | Role is part of a stack (app + cache + DB) | Multiple instances across groups (`database`, `cache`, `app`), cross-group networking | cross-dc-rhsso-demo (8 containers, 3 tiers) |
| Cross-site replication | Role manages multi-DC topologies | Multiple container networks simulating sites, bidirectional connections between instances | amq mirroring, cross-dc-rhsso-demo |
| Architecture comparison | Role supports multiple backends | Separate scenarios per architecture, different group membership per scenario | amq_streams (ZooKeeper vs KRaft mode) |

## Network Patterns

| Pattern | When to use | Key technique |
|---|---|---|
| Named networks for isolation | Simulating network segments or sites | Create separate container networks per segment in create.yml |
| Cross-network linking | Instances need selective cross-segment communication | Attach instances to multiple networks |
| Port publishing | Tests need host-accessible services (browser testing, external tools) | Map container ports to host ports in create.yml |

## Data and Storage Patterns

| Pattern | When to use | Key technique |
|---|---|---|
| Named volume sharing | HA scenarios with shared storage (shared-nothing → shared-disk) | Create a named volume, mount in multiple instances |
| Bind-mounted config | Test with external config files (e.g., PostgreSQL custom config) | Bind-mount from scenario directory into container |
| tmpfs for systemd | Containers running systemd need writable /run and /tmp | Add tmpfs mounts for /run and /tmp in create.yml |

## Inventory Patterns

| Pattern | When to use | Key technique |
|---|---|---|
| Per-instance host_vars | Each node has a distinct role (primary, backup, broker A, broker B) | Define host_vars in inventory/host_vars/ or inline in hosts.yml |
| Overlapping group membership | Nodes participate in multiple service groups | Assign multiple groups per host in inventory |
| Shared group_vars across scenarios | Multiple scenarios share common configuration | Point inventory to a shared group_vars directory |
| Environment-based configuration | Tests need credentials or endpoints from CI environment | Use `${ENV_VAR:-default}` syntax in inventory or molecule.yml |

## Scenario Strategy Patterns

| Pattern | When to use | Key technique |
|---|---|---|
| Feature toggles per scenario | Role has optional features (e.g., AJP + HTTPS) | Each scenario sets different variables in inventory group_vars |
| Selective idempotence skip | Force-install or upgrade scenarios that are intentionally non-idempotent | Remove `idempotence` from test_sequence, add YAML comment explaining why |
| Environment-specific scenarios | Role needs different credentials per environment (prod, stage) | Separate scenarios with different env vars, same converge logic |
| Application-specific scenarios | Role deploys configurable applications | Each scenario deploys a different app variant via inventory variables |
| Shared prepare playbook | Multiple scenarios share identical pre-convergence setup | Point prepare to a shared file (e.g., `../prepare.yml`) |

## Configuration Patterns

| Pattern | When to use | Key technique |
|---|---|---|
| Shared base config | Collection with many scenarios sharing common ansible settings | `extensions/molecule/config.yml` with common ansible.cfg and env settings, scenario-specific overrides |
| Minimal scenario overrides | Scenarios differ only in variables or env vars | Scenario molecule.yml inherits base config, only adds the delta |
| Fact caching | Multi-run scenarios where re-gathering facts is expensive | Configure `fact_caching: jsonfile` in ansible.cfg section |
| Performance profiling | Need task-level timing data | Enable `ansible.posix.profile_tasks` callback |

## Credential and Security Patterns

| Pattern | When to use | Key technique |
|---|---|---|
| API credential injection | Tests download commercial products or call external APIs | Pass credentials via env vars from CI (`${PROD_API_KEY}`) |
| Vault password file | Tests use ansible-vault encrypted variables | Set `vault_password_file` in ansible.cfg section |
| Environment-based secrets | Cluster connection details with sensible defaults | Use `${VAR:-default}` for optional values, require-env for mandatory ones |

## Infrastructure Type Patterns

| Pattern | When to use | Key technique |
|---|---|---|
| Container with systemd | Role manages services — most common for infrastructure roles | UBI-init images (EL) or custom Containerfiles (multi-platform) |
| Full VM (Vagrant) | Role does OS-level changes that containers can't simulate (kernel modules, OS conversion, real networking) | Vagrant with libvirt provider in create.yml |
| Delegated (external) | Role manages cloud resources, K8s operators, or existing infrastructure | create.yml provisions external resources, inventory points to them |
| Workspace volume mounting | Testing a collection's own modules from within the container | Mount project directory into container as a volume |

## Complexity Scale

When suggesting scenarios to users, use this complexity scale to set expectations:

| Complexity | Instances | Features | Example |
|---|---|---|---|
| Basic | 1 | Single role, package+service+config | geerlingguy roles |
| Moderate | 1-2 | Feature toggles, platform variants | jws scenarios |
| Complex | 2-4 | Multi-node, shared storage, HA | amq replication |
| Advanced | 5-8 | Multi-tier, cross-DC, mixed images | cross-dc-rhsso-demo, rhbk-ha-cluster |

Most roles need **Basic**. Suggest higher complexity only when the role's
purpose demands it (clustering, replication, multi-tier deployment).

---

## Reference Implementations (ansible-native format)

These are the most commonly needed patterns rewritten in modern ansible-native
format. Use these as starting points when generating scenarios.

### Pattern 1: Single instance, no systemd (most common)

```yaml
# molecule.yml
---
ansible:
  executor:
    args:
      ansible_playbook:
        - --inventory=${MOLECULE_SCENARIO_DIRECTORY}/inventory/
  cfg:
    defaults:
      host_key_checking: false
      roles_path: ${MOLECULE_PROJECT_DIRECTORY}/..:${MOLECULE_PROJECT_DIRECTORY}/roles
  env:
    ANSIBLE_FORCE_COLOR: "true"

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

```yaml
# create.yml
---
- name: Create
  hosts: localhost
  connection: local
  gather_facts: false
  tags:
    - always
  vars:
    instances:
      - name: instance
        image: quay.io/fedora/fedora:latest
  tasks:
    - name: Create molecule instance(s)
      community.docker.docker_container:
        name: "{{ item.name }}"
        hostname: "{{ item.name }}"
        image: "{{ item.image }}"
        command: 'bash -c "while true; do sleep 10000; done"'
        tty: true
        labels:
          owner: molecule
        state: started
      loop: "{{ instances }}"
      loop_control:
        label: "{{ item.name }}"
```

```yaml
# inventory/hosts.yml
---
all:
  hosts:
    instance:
      ansible_connection: community.docker.docker
```

### Pattern 2: Single instance with systemd (UBI-init + Podman)

```yaml
# create.yml
---
- name: Create
  hosts: localhost
  connection: local
  gather_facts: false
  tags:
    - always
  vars:
    instances:
      - name: instance
        image: registry.access.redhat.com/ubi9/ubi-init
        systemd: always
        tmpfs:
          /run: rw
          /tmp: rw
  tasks:
    - name: Create molecule instance(s)
      containers.podman.podman_container:
        name: "{{ item.name }}"
        hostname: "{{ item.name }}"
        image: "{{ item.image }}"
        systemd: "{{ item.systemd | default(omit) }}"
        tmpfs: "{{ item.tmpfs | default(omit) }}"
        tty: true
        label:
          owner: molecule
        state: started
      loop: "{{ instances }}"
      loop_control:
        label: "{{ item.name }}"
      changed_when: false
```

```yaml
# inventory/hosts.yml
---
all:
  hosts:
    instance:
      ansible_connection: containers.podman.podman
```

### Pattern 3: Multi-node HA cluster (primary + backup)

Useful for roles that manage clustered services (message brokers, databases,
caches) where nodes have different roles.

```yaml
# create.yml
---
- name: Create
  hosts: localhost
  connection: local
  gather_facts: false
  tags:
    - always
  vars:
    instances:
      - name: node1
        image: registry.access.redhat.com/ubi9/ubi-init
        systemd: always
        tmpfs:
          /run: rw
          /tmp: rw
      - name: node2
        image: registry.access.redhat.com/ubi9/ubi-init
        systemd: always
        tmpfs:
          /run: rw
          /tmp: rw
  tasks:
    - name: Create podman network
      containers.podman.podman_network:
        name: molecule-cluster
        state: present

    - name: Create molecule instance(s)
      containers.podman.podman_container:
        name: "{{ item.name }}"
        hostname: "{{ item.name }}"
        image: "{{ item.image }}"
        systemd: "{{ item.systemd | default(omit) }}"
        tmpfs: "{{ item.tmpfs | default(omit) }}"
        network: molecule-cluster
        tty: true
        label:
          owner: molecule
        state: started
      loop: "{{ instances }}"
      loop_control:
        label: "{{ item.name }}"
      changed_when: false
```

```yaml
# destroy.yml
---
- name: Destroy
  hosts: localhost
  connection: local
  gather_facts: false
  tags:
    - always
  vars:
    podman_exec: >-
      {{ lookup('env', 'MOLECULE_PODMAN_EXECUTABLE') | default('podman', true) }}
    instances:
      - name: node1
      - name: node2
  tasks:
    - name: Destroy molecule instance(s)
      ansible.builtin.shell: >-
        {{ podman_exec }} container exists {{ item.name }} &&
        {{ podman_exec }} rm -f {{ item.name }} || true
      loop: "{{ instances }}"
      loop_control:
        label: "{{ item.name }}"
      changed_when: true

    - name: Delete podman network
      containers.podman.podman_network:
        name: molecule-cluster
        state: absent
```

```yaml
# inventory/hosts.yml
---
all:
  children:
    cluster:
      children:
        primary:
          hosts:
            node1:
              ansible_connection: containers.podman.podman
              ha_role: primary
        backup:
          hosts:
            node2:
              ansible_connection: containers.podman.podman
              ha_role: backup
```

### Pattern 4: Multi-platform OS matrix

Useful for roles that must work across EL and Debian families.

```yaml
# create.yml
---
- name: Create
  hosts: localhost
  connection: local
  gather_facts: false
  tags:
    - always
  vars:
    instances:
      - name: el9
        image: registry.access.redhat.com/ubi9/ubi-init
        systemd: always
        tmpfs:
          /run: rw
          /tmp: rw
      - name: debian12
        image: debian:12
  tasks:
    - name: Create molecule instance(s)
      containers.podman.podman_container:
        name: "{{ item.name }}"
        hostname: "{{ item.name }}"
        image: "{{ item.image }}"
        systemd: "{{ item.systemd | default(omit) }}"
        tmpfs: "{{ item.tmpfs | default(omit) }}"
        command: >-
          {{ item.command | default('bash -c "while true; do sleep 10000; done"') }}
        tty: true
        label:
          owner: molecule
        state: started
      loop: "{{ instances }}"
      loop_control:
        label: "{{ item.name }}"
      changed_when: false
```

```yaml
# inventory/hosts.yml
---
all:
  children:
    el:
      hosts:
        el9:
          ansible_connection: containers.podman.podman
    debian:
      hosts:
        debian12:
          ansible_connection: containers.podman.podman
```

Note: debian:12 base image uses the default sleep command since it has no
systemd. For Debian roles that need systemd, build a custom image from a
Containerfile using `containers.podman.podman_image` or
`community.docker.docker_image_build` in create.yml before creating the
container.
