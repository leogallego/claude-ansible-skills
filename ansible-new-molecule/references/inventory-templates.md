# Inventory Templates

Templates for `molecule/<scenario>/inventory/` directory. The inventory maps
container names (matching `instances` in create.yml) to their Ansible
connection type. Do NOT put container-creation attributes (image, systemd,
tmpfs) in the inventory — those belong in create.yml.

## Docker scenario

```yaml
# inventory/hosts.yml
---
all:
  hosts:
    instance:
      ansible_connection: community.docker.docker
```

## Podman scenario

```yaml
# inventory/hosts.yml
---
all:
  hosts:
    instance:
      ansible_connection: containers.podman.podman
```

## Multi-platform roles

Create one host per platform:

```yaml
# inventory/hosts.yml
---
all:
  children:
    el:
      hosts:
        el9-instance:
          ansible_connection: containers.podman.podman
    debian:
      hosts:
        debian12-instance:
          ansible_connection: containers.podman.podman
```

The host names here must match the `name` values in create.yml's `instances`
list. The skill generates both files together to ensure consistency.
