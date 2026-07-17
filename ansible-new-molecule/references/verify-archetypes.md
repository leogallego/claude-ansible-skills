# Verify Archetype Templates

Assertion patterns for verify.yml, organized by role archetype. The skill
detects archetypes during introspection and selects the matching templates.

Replace all `<PLACEHOLDERS>` with actual values from the role's
`defaults/main.yml` and task files.

## package_service archetype

```yaml
- name: Verify packages are installed
  ansible.builtin.package:
    name: "{{ item }}"
    state: present
  check_mode: true
  register: __verify_pkg
  failed_when: __verify_pkg.changed
  loop: "{{ <ROLE_NAME>_packages }}"

- name: Verify service is running and enabled
  ansible.builtin.systemd:
    name: "{{ <ROLE_NAME>_service_name }}"
    state: started
    enabled: true
  check_mode: true
  register: __verify_svc
  failed_when: __verify_svc.changed
```

## config_only archetype

```yaml
- name: Verify configuration file exists
  ansible.builtin.stat:
    path: <CONFIG_DEST_PATH>
  register: __verify_config

- name: Assert configuration file is deployed
  ansible.builtin.assert:
    that:
      - __verify_config.stat.exists
      - __verify_config.stat.mode == '<EXPECTED_MODE>'
    fail_msg: "Configuration file not found or wrong permissions"
```

## user_group archetype

```yaml
- name: Verify user exists
  ansible.builtin.getent:
    database: passwd
    key: "{{ <ROLE_NAME>_user }}"
  register: __verify_user

- name: Assert user is present
  ansible.builtin.assert:
    that:
      - __verify_user is not failed
    fail_msg: "User {{ <ROLE_NAME>_user }} does not exist"
```

## firewall archetype

```yaml
- name: Verify firewall ports are open
  ansible.builtin.wait_for:
    port: "{{ item }}"
    timeout: 5
  loop: "{{ <ROLE_NAME>_firewall_ports }}"
```

## mount_storage archetype

```yaml
- name: Verify mount point exists
  ansible.builtin.stat:
    path: <MOUNT_PATH>
  register: __verify_mount

- name: Assert mount is present
  ansible.builtin.assert:
    that:
      - __verify_mount.stat.exists
      - __verify_mount.stat.isdir
    fail_msg: "Mount point <MOUNT_PATH> does not exist"
```

## container archetype

```yaml
# TODO: Container verification depends heavily on the specific container
# runtime and orchestration. Add assertions for container state, image
# version, port bindings, and health checks based on your role's specifics.
```

## cloud_resource archetype

```yaml
# TODO: Cloud resource verification requires provider credentials and
# API access. Add assertions using the provider's info/facts modules
# (e.g., amazon.aws.ec2_instance_info) to verify resource state.
# Warn users about credential requirements in prepare.yml.
```
