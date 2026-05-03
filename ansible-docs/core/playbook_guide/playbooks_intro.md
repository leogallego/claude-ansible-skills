# Ansible playbooks

Ansible Playbooks provide a repeatable, reusable, simple configuration management and multimachine deployment system that is well suited to deploying complex applications. If you need to execute a task with Ansible more than once, you can write a playbook and put the playbook under source control. You can then use the playbook to push new configurations or confirm the configuration of remote systems.

Playbooks allow you to perform the following actions:

- Declare configurations.
- Orchestrate steps of any manual ordered process on multiple sets of machines in a defined order.
- Launch tasks synchronously or asynchronously.

## Playbook syntax

You express playbooks in YAML format with a minimum of syntax. If you are not familiar with YAML, review the yaml_syntax overview and consider installing an add-on for your text editor (see other_tools_and_programs) to help you write clean YAML syntax in your playbooks.

A playbook consists of one or more 'plays' in an ordered list. The terms 'playbook' and 'play' are sports analogies. Each play executes part of the overall goal of the playbook, running one or more tasks. Each task calls an Ansible module.

## Playbook execution

A playbook runs in order from top to bottom. Within each play, tasks also run in order from top to bottom. Playbooks with multiple plays can orchestrate multimachine deployments, running one play on your webservers, another play on your database servers, and a third play on your network infrastructure. At a minimum, each play defines two things:

- The managed nodes to target, using a pattern.
- At least one task to execute.

For Ansible 2.10 and later, you should use the fully-qualified collection name (FQCN) in your playbooks. Using the FQCN ensures that you have selected the correct module, because multiple collections can contain modules with the same name. For example, `user`. See collections_using_playbook.

In the following example, the first play targets the web servers and the second play targets the database servers.

``` yaml
---
- name: Update web servers
  hosts: webservers
  remote_user: root

  tasks:
  - name: Ensure apache is at the latest version
    ansible.builtin.yum:
      name: httpd
      state: latest

  - name: Write the apache config file
    ansible.builtin.template:
      src: /srv/httpd.j2
      dest: /etc/httpd.conf

- name: Update db servers
  hosts: databases
  remote_user: root

  tasks:
  - name: Ensure postgresql is at the latest version
    ansible.builtin.yum:
      name: postgresql
      state: latest

  - name: Ensure that postgresql is started
    ansible.builtin.service:
      name: postgresql
      state: started
```

Your playbook can include more than just a hosts line and tasks. For example, the playbook above sets a `remote_user` for each play. The `remote_user` is the user account for the SSH connection. You can add other playbook_keywords at the playbook, play, or task level to influence how Ansible behaves. Playbook keywords can control the connection plugin, whether to use privilege escalation, how to handle errors, and more. To support a variety of environments, you can set many of these parameters as command-line flags in your Ansible configuration, or in your inventory. Learning the precedence rules for these sources of data helps you as you expand your Ansible ecosystem.

### Task execution

By default, Ansible executes each task in order, one at a time, against all machines matched by the host pattern. Each task executes a module with specific arguments. After a task has executed on all target machines, Ansible moves to the next task. You can use strategies to change this default behavior. Within each play, Ansible applies the same task directives to all hosts. If a task fails on a host, Ansible removes that host from the rotation for the rest of the playbook.

When you run a playbook, Ansible returns information about connections, the `name` lines of all your plays and tasks, whether each task has succeeded or failed on each machine, and whether each task has made a change on each machine. At the bottom of the playbook execution, Ansible provides a summary of the nodes that were targeted and how they performed. General failures and fatal "unreachable" communication attempts are kept separate in the counts.

### Desired state and idempotency

Most Ansible modules check whether the desired final state has already been achieved and exit without performing any actions if that state has been achieved. Repeating the task does not change the final state. Modules that behave this way are 'idempotent'. Whether you run a playbook once or multiple times, the outcome should be the same. However, not all playbooks and not all modules behave this way. If you are unsure, test your playbooks in a sandbox environment before running them multiple times in production.

### Running playbooks

To run your playbook, use the ansible-playbook command.

``` bash
ansible-playbook playbook.yml -f 10
```

Use the `--verbose` flag when running your playbook to see detailed output from successful and unsuccessful tasks.

### Running playbooks in check mode

The Ansible check mode allows you to execute a playbook without applying any alterations to your systems. You can use check mode to test playbooks before you implement them in a production environment.

To run a playbook in check mode, pass the `-C` or `--check` flag to the `ansible-playbook` command:

``` bash
ansible-playbook --check playbook.yaml
```

Executing this command runs the playbook normally. Instead of implementing any modifications, Ansible provides a report on the changes it would have made. This report includes details such as file modifications, command execution, and module calls.

Check mode offers a safe and practical approach to examine the functionality of your playbooks without risking unintended changes to your systems. Check mode is also a valuable tool for troubleshooting playbooks that are not functioning as expected.

## Ansible-Pull

You can invert the Ansible architecture so that nodes check in to a central location instead of you pushing configuration out to them.

The `ansible-pull` command is a small script that checks out a repo of configuration instructions from git and then runs `ansible-playbook` against that content.

If you load balance your checkout location, `ansible-pull` scales infinitely.

Run `ansible-pull --help` for details.

## Verifying playbooks

You may want to verify your playbooks to catch syntax errors and other problems before you run them. The ansible-playbook command offers several options for verification, including `--check`, `--diff`, `--list-hosts`, `--list-tasks`, and `--syntax-check`. The validate-playbook-tools topic describes other tools for validating and testing playbooks.

### ansible-lint

You can use [ansible-lint](https://ansible.readthedocs.io/projects/lint/) for detailed, Ansible-specific feedback on your playbooks before you execute them. For example, if you run `ansible-lint` on the playbook called `verify-apache.yml` near the top of this page, you should get the following results:

``` bash
$ ansible-lint verify-apache.yml
[403] Package installs should not use latest
verify-apache.yml:8
Task/Handler: ensure apache is at the latest version
```

The [ansible-lint default rules](https://ansible.readthedocs.io/projects/lint/rules/) page describes each error.
