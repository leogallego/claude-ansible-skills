# CI and Requirements Templates

Templates for molecule requirements.yml and GitHub Actions CI workflow.

## requirements.yml

Generate a requirements file **inside each scenario directory** (e.g.,
`molecule/default/requirements.yml`). Molecule resolves `requirements.yml`
relative to the scenario directory, not the role root.

```yaml
---
collections:
  - name: community.docker     # or containers.podman for Podman
    version: ">=3.0.0"
  # Add any collections the role depends on
```

Scan the role's `collections/requirements.yml` or `meta/main.yml` dependencies
and include them.

If the `search_collections` MCP tool is available, use it to discover
test-relevant collections. For example, if the role uses `community.general`
modules, call `search_collections(query="community.general")` and suggest
adding it to the test requirements. Limit to collections actually used in
the role's tasks.

## GitHub Actions CI workflow

Generate `.github/workflows/molecule.yml`:

```yaml
---
name: Molecule
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  molecule:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        scenario:
          - default
          # Add additional scenarios here
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install molecule molecule-plugins[docker] ansible-lint

      - name: Run molecule
        run: molecule test -s ${{ matrix.scenario }}
        env:
          ANSIBLE_FORCE_COLOR: "true"
```

For Podman-based testing, replace `molecule-plugins[docker]` with
`molecule-plugins[podman]` and add Podman setup steps.

For collections, add the `MOLECULE_GLOB` environment variable to the CI
workflow so molecule discovers scenarios under `extensions/molecule/`:

```yaml
        env:
          ANSIBLE_FORCE_COLOR: "true"
          MOLECULE_GLOB: "extensions/molecule/**/molecule.yml"
```

Use `tox-ansible` if the user accepted tox integration.

## tox-ansible.ini (collections only)

If the user accepted tox integration:

```ini
[tox]
requires =
    tox>=4.2
    tox-ansible>=24.9.0

[testenv]
commands_pre =
    pip install molecule molecule-plugins[docker]
```
