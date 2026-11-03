---
name: migrate-off-pytest-ansible-plugin
description: Use when migrating off, removing, deprecating, or auditing the pytest-ansible plugin in an Ansible collection repository. Identify real plugin use before editing dependencies or test commands. Plain pytest and ansible-test are retained; only the pytest-ansible plugin is removed.
---

# Migrate off the pytest-ansible plugin

Use this workflow to migrate an Ansible collection off the `pytest-ansible` plugin — replacing real plugin use and removing the dependency — without mistaking ordinary Ansible variables or module mocks for plugin use.

This removes the `pytest-ansible` plugin only. You keep testing with pytest and `ansible-test`; the goal is to stop depending on this one plugin, not to stop running pytest against Ansible content.

## Establish Usage

1. Search dependency files and test configuration for the package and plugin name. The lookahead excludes the unrelated `pytest-ansible-units` package:

   ```bash
   rg -n -iP 'pytest[-_]ansible(?!-units)\b' test-requirements.txt requirements*.txt tox.ini pyproject.toml setup.cfg noxfile.py Pipfile .github tests
   ```

2. Search test code for the plugin-only fixtures and options:

   ```bash
   rg -n 'ansible_adhoc|ansible_module|ansible_facts|ansible_host\b|ansible_group\b|molecule_scenario|--ansible-' tests tox.ini .github pyproject.toml
   ```

3. Classify every hit before changing anything:

   - Plugin use: `pytest-ansible` dependency, `pytest_ansible` import, plugin-specific fixture request, or `--ansible-*` pytest option.
   - Not plugin use: an Ansible inventory variable such as `ansible_host`, a module return value such as `ansible_facts`, a locally defined fixture called `ansible_module`, a commented-out line such as `# pytest-ansible`, or a dependency on `pytest-ansible-units` (a different package, not this plugin).

`pytest-ansible` provides fixtures including `ansible_adhoc`, `ansible_module`, `ansible_facts`, `ansible_host`, `ansible_group`, `localhost`, and `molecule_scenario`. Do not grep for `localhost` as a bare string — it is far too common; rely on checking the fixture definition instead. Verify the fixture definition before treating a same-named local fixture as plugin use.

## Make The Smallest Change

1. If the repository only installs the package, remove `pytest-ansible` from every active test dependency list. Check both `test-requirements.txt` and generated or environment-specific lists in `tox.ini`.

2. Not every `--ansible-*` option is a no-op — check what each one does before deleting it:

   - `--ansible-host-pattern localhost`, when no test requests `ansible_host` or `ansible_group`, has no effect. It is registered by the plugin, so remove it.
   - Functional options must be replaced, not just deleted. In particular, `--ansible-unit-inject-only` drives unit-test collection-path injection; removing it breaks the unit-test run. Replace it with a working equivalent (for example `ansible-test units` or native collection-path injection) before dropping the dependency.

3. If tests use plugin fixtures, migrate only those tests before removing the dependency. Do not remove the package until the replacement is established and the affected tests pass. For the `molecule_scenario` fixture specifically, the replacement is running Molecule directly — `molecule test --all`, and tox-ansible's molecule test type for collection CI — and then deleting the glue test file, rather than porting the fixture.

4. Preserve `ansible-test` configuration that deliberately excludes `pytest-ansible`. A comment warning that `pytest-ansible` overrides `ANSIBLE_COLLECTIONS_PATH` is evidence that the ansible-test path should remain plugin-free, not evidence that the plugin is needed.

## Validate

1. Re-run the two searches above and confirm no dependency, import, fixture request, or `--ansible-*` option remains unintentionally.

2. Run the repository's normal unit-test entry point. Prefer the documented CI command or tox environment over inventing a bare pytest command.

3. For collection repositories, also run the relevant `ansible-test units` command when it is part of CI. Run the narrowest affected test target first, then the full unit suite when practical.

4. Report separately:

   - dependencies removed;
   - test-command options removed or changed;
   - any fixture migration performed;
   - tests run and tests not run.

## Safety Rules

- Do not remove `ansible_host` or `ansible_facts` from playbooks, inventories, module code, or documentation solely because of this migration.
- Do not add an alternative pytest plugin unless a concrete test depends on its API.
- Do not modify lockfiles or generated artifacts unless the repository tracks them as part of dependency updates.
