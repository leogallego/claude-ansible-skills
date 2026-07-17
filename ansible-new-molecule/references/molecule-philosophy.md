# Molecule Testing Philosophy — Distilled Reference

Source: https://docs.ansible.com/projects/molecule/philosophy/
Source: https://docs.ansible.com/projects/molecule/configuration/
Molecule version: 26.6.0+ / molecule-plugins: 25.8.12+

## Core Principle: Ansible-Native Everything

Molecule uses Ansible as its default driver, provisioner, and verifier. The modern
("ansible-native") configuration eliminates legacy constructs in favor of Ansible
playbooks and native inventory.

### What NOT to include in molecule.yml

These are all "pre ansible-native" constructs per the official docs:

- `driver:` block — Ansible-native is the default driver
- `verifier:` block — Ansible verify.yml is the default verifier
- `provisioner:` block — replaced by the `ansible:` block
- `platforms:` block — replaced by inventory managed via create.yml/destroy.yml

### Modern molecule.yml structure

See the molecule.yml template in the SKILL.md file — it is the authoritative
reference for the modern ansible-native config format.

## Default Test Sequence

The official default `test_sequence` is designed to ensure a clean slate and
comprehensive validation:

```yaml
scenario:
  test_sequence:
    - dependency     # Install requirements (roles, collections)
    - cleanup        # Remove temp artifacts from prior runs
    - destroy        # Ensure clean slate — destroy any leftover instances
    - syntax         # Syntax check before creating infrastructure
    - create         # Provision test environment
    - prepare        # Configure environment before convergence
    - converge       # Execute the automation being tested
    - idempotence    # Re-run to verify no unintended changes
    - side_effect    # Test for unintended consequences
    - verify         # Functional verification (verify.yml)
    - cleanup        # Remove temp artifacts
    - destroy        # Clean up all resources
```

The cleanup+destroy at the start ensures a clean environment even if a prior run
failed mid-test. The syntax check before create catches YAML errors before
spending time on infrastructure provisioning.

## Infrastructure Lifecycle: create.yml / destroy.yml

Infrastructure is managed by Ansible playbooks in each scenario directory.
The molecule-plugins package provides bundled playbooks for Docker and Podman.

### Molecule-injected variables available in playbooks

- `molecule_no_log` — controls no_log across the play
- `molecule_scenario_directory` — path to the scenario directory
- `molecule_ephemeral_directory` — temp working directory for the run
- `molecule_yml.platforms` — legacy: the platforms list from molecule.yml.
  In ansible-native mode, do NOT use this. Define instances in create.yml's
  own vars instead.

### Historical Reference: molecule-plugins bundled playbook techniques

> **Do not use these patterns directly.** These describe the molecule-plugins
> bundled playbooks for historical context only. In ansible-native mode, write
> your own create/destroy playbooks using inline instance definitions. The
> useful techniques to extract are: async execution for parallel container
> creation, `{owner: molecule}` labels for cleanup safety, and retry patterns
> for image builds. See the SKILL.md templates for modern implementations.

Key techniques from bundled playbooks (extract and adapt, do not copy verbatim):

- **Docker:** async container creation (`async: 7200, poll: 0`), image build with retry (3 attempts), `{owner: molecule}` labels
- **Podman:** native `systemd:` parameter, rootless support via conditional `become`, network management via `containers.podman.podman_network`
- **Destroy (Podman):** shell-based removal (`podman container exists && podman rm -f || true`), network cleanup via module

## Verification: verify.yml

The default verifier is Ansible. Write verification as an Ansible playbook
(`verify.yml`) using standard modules and `assert`.

### Proven assertion patterns

| What to verify | Module approach |
|---|---|
| Package installed | `ansible.builtin.package: state: present` + `check_mode: true` + `failed_when: changed` |
| Service running | `ansible.builtin.systemd: state: started` + `check_mode: true` + `failed_when: changed` |
| File exists with mode | `ansible.builtin.stat` + `ansible.builtin.assert` on `.stat.exists`, `.stat.mode` |
| Port listening | `ansible.builtin.wait_for: port: <N> timeout: 5` |
| Config content | `ansible.builtin.slurp` + `ansible.builtin.assert` on decoded content |
| User exists | `ansible.builtin.getent: database: passwd key: <user>` + assert |

## Collection-Specific Features

See `collection-features.md` for full details on nested scenarios, shared
config, and shared state patterns.

## Container Image Strategy

### No systemd needed (config, packages, users)
Use base images with `sleep` command (the default `override_command` behavior):
- `quay.io/fedora/fedora:latest`
- `quay.io/centos/centos:stream9`

### Systemd needed, EL only
Use UBI-init images (free, no subscription required, systemd built-in):
- `registry.access.redhat.com/ubi9/ubi-init`

### Systemd needed, multi-platform
Generate custom Containerfiles with systemd installed per distro.

## Variable Substitution

molecule.yml supports `${ENV_VAR}` and `${VARIABLE:-default}` syntax.
The `MOLECULE_` namespace is reserved — do not prefix custom variables with it.

## Advanced Testing

Multiple `side_effect` and `verify` actions can take arguments:
```yaml
test_sequence:
  - converge
  - side_effect reboot.yaml
  - verify after_reboot/
  - side_effect alter_configs.yaml
  - converge
  - verify other_test1.py other_test2.py
```

## Dependencies

Galaxy is the default dependency manager. Dependencies install from
`requirements.yml` (roles) and `collections.yml` (collections) at the project root.

```yaml
dependency:
  name: galaxy
  options:
    role-file: requirements.yml
    requirements-file: collections.yml
```
