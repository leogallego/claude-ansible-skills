# Collection-Specific Features

Features and patterns specific to molecule testing for Ansible collections
(as opposed to standalone roles).

## Nested scenarios

For collections with many modules or roles, offer hierarchical scenario
organization:

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
├── role_webserver/
│   └── molecule.yml
```

Target with: `molecule test -s module_a/merged` or `molecule test -s "module_a/*"`

For discovery, set `MOLECULE_GLOB` in CI and local development:

```bash
export MOLECULE_GLOB="extensions/molecule/**/molecule.yml"
```

The scenario name is derived from the relative path under `extensions/molecule/`
(e.g., `module_a/merged`). Nested scenarios are only available in collection
mode — role-mode testing uses flat directories.

Only offer nested scenarios if the collection has 3+ modules or roles. For
simpler collections, flat scenarios are sufficient.

## Shared config

For collections with `extensions/molecule/`, generate a shared `config.yml`:

```yaml
---
ansible:
  cfg:
    defaults:
      host_key_checking: false
  env:
    ANSIBLE_FORCE_COLOR: "true"
```

Individual scenario `molecule.yml` files inherit from this and add
scenario-specific overrides only.

## Shared state

If the collection has multiple scenarios that share infrastructure, add
`shared_state: true` to `config.yml` and have the `default` scenario
handle create/destroy for all scenarios.
