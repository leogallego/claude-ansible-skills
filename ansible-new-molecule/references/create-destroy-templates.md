# Create and Destroy Playbook Templates

Templates for molecule create.yml and destroy.yml playbooks. Select the
appropriate template based on detected container runtime (Docker or Podman)
and systemd requirements.

## create.yml — Docker

In the ansible-native approach, create.yml is a self-contained playbook.
Instance definitions live in the playbook's `vars:` section — NOT in a
`platforms:` block in molecule.yml. The skill populates the `instances`
list from role introspection (detected image, systemd needs, etc.).

```yaml
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
        command: >-
          {{ item.command | default('bash -c "while true; do sleep 10000; done"') }}
        privileged: "{{ item.privileged | default(omit) }}"
        volumes: "{{ item.volumes | default(omit) }}"
        tmpfs: "{{ item.tmpfs | default(omit) }}"
        capabilities: "{{ item.capabilities | default(omit) }}"
        published_ports: "{{ item.published_ports | default(omit) }}"
        networks: "{{ item.networks | default(omit) }}"
        env: "{{ item.env | default(omit) }}"
        tty: true
        labels:
          owner: molecule
        state: started
      loop: "{{ instances }}"
      loop_control:
        label: "{{ item.name }}"
      changed_when: false
```

For **systemd roles using UBI-init** with Docker, adjust the instances list.
UBI-init has `/sbin/init` as its default entrypoint, but the explicit
`command` ensures systemd starts regardless of image entrypoint configuration:

```yaml
    instances:
      - name: instance
        image: registry.access.redhat.com/ubi9/ubi-init
        command: /sbin/init
        tmpfs:
          /run: rw
          /tmp: rw
        privileged: true  # Docker requires privileged for systemd cgroup access
```

## create.yml — Podman

```yaml
---
- name: Create
  hosts: localhost
  connection: local
  gather_facts: false
  tags:
    - always
  vars:
    podman_exec: >-
      {{ lookup('env', 'MOLECULE_PODMAN_EXECUTABLE') | default('podman', true) }}
    instances:
      - name: instance
        image: quay.io/fedora/fedora:latest
  tasks:
    - name: Create molecule instance(s)
      containers.podman.podman_container:
        name: "{{ item.name }}"
        hostname: "{{ item.name }}"
        image: "{{ item.image }}"
        command: >-
          {{ item.command | default('bash -c "while true; do sleep 10000; done"') }}
        privileged: "{{ item.privileged | default(omit) }}"
        volume: "{{ item.volumes | default(omit) }}"
        tmpfs: "{{ item.tmpfs | default(omit) }}"
        cap_add: "{{ item.capabilities | default(omit) }}"
        publish: "{{ item.published_ports | default(omit) }}"
        network: "{{ item.network | default(omit) }}"
        env: "{{ item.env | default(omit) }}"
        systemd: "{{ item.systemd | default(omit) }}"
        tty: true
        label:
          owner: molecule
        executable: "{{ podman_exec }}"
        state: started
      loop: "{{ instances }}"
      loop_control:
        label: "{{ item.name }}"
      changed_when: false
```

For **systemd roles using UBI-init** with Podman, use the `systemd` parameter
instead of a manual `/sbin/init` command:

```yaml
    instances:
      - name: instance
        image: registry.access.redhat.com/ubi9/ubi-init
        systemd: always
        tmpfs:
          /run: rw
          /tmp: rw
```

## destroy.yml — Docker

```yaml
---
- name: Destroy
  hosts: localhost
  connection: local
  gather_facts: false
  tags:
    - always
  vars:
    instances:
      - name: instance
  tasks:
    - name: Destroy molecule instance(s)
      community.docker.docker_container:
        name: "{{ item.name }}"
        state: absent
        force_kill: true
      loop: "{{ instances }}"
      loop_control:
        label: "{{ item.name }}"
```

## destroy.yml — Podman

```yaml
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
      - name: instance
  tasks:
    - name: Destroy molecule instance(s)
      ansible.builtin.shell: >-
        {{ podman_exec }} container exists {{ item.name }} &&
        {{ podman_exec }} rm -f {{ item.name }} || true
      loop: "{{ instances }}"
      loop_control:
        label: "{{ item.name }}"
      changed_when: true
```

## Important notes

The `instances` list in create.yml and destroy.yml must have matching `name`
values. The skill generates both files together, so they are always in sync.
When adding instances later, update both files.

**Parameter differences:** Docker and Podman modules use different parameter
names for the same concepts. Key differences: `networks` (Docker) vs `network`
(Podman), `volumes` vs `volume`, `capabilities` vs `cap_add`, `published_ports`
vs `publish`, `labels` vs `label`. Instance definitions in create.yml are NOT
interchangeable between runtimes — the skill generates the correct parameters
for the detected runtime.
