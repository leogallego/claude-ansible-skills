---
name: ansible-docs
description: >-
  Answer Ansible questions and review Ansible code using official
  documentation. Use when the user asks about Ansible concepts, syntax,
  best practices, deprecations, or wants Ansible code reviewed against
  official docs. Use when user says "check my playbook against docs",
  "what does Ansible say about X", "how do I use module Y", or
  "review my role". Do NOT use for CoP good practices review (use
  ansible-good-practices instead). Do NOT use for general Python
  or YAML questions unrelated to Ansible.
argument-hint: "[question or code path]"
user-invocable: true
metadata:
  author: Leonardo Gallego
  version: 1.0.0
---

# Ansible Documentation Skill

Answer Ansible questions and review Ansible code grounded in official
Ansible documentation. This skill is complementary to `ansible-good-practices`
which reviews code against Red Hat CoP automation good practices.
This skill focuses on **official Ansible documentation** — module usage,
playbook syntax, inventory patterns, plugin development, deprecations,
and porting guides.

## Content sources

This skill uses a manifest-driven approach to serve documentation:

- **Bundled core files** (~18 files, ~6K lines) — the most commonly needed
  topics, available locally for zero-latency access.
- **On-demand fetch** (~450+ files) — the full documentation set, fetched
  from GitHub when needed.

## How to load content

### Step 1: Load the manifest

Read `manifest.json` from this plugin's root directory. The manifest
contains metadata for every available documentation file:

```json
{
  "path": "playbook_guide/playbooks_intro.md",
  "topic": "playbook_guide",
  "title": "Ansible playbooks",
  "audience": "author",
  "lines": 123,
  "core": true,
  "summary": "Playbooks are automation blueprints..."
}
```

### Step 2: Extract keywords from the user's prompt

Parse the user's message to identify what documentation is needed:

**For questions:**
- Extract topic keywords: "loops", "handlers", "variables", "inventory",
  "vault", "roles", "conditionals", "facts", "templates", etc.
- Identify specific module or plugin names (FQCNs like
  `ansible.builtin.copy`, `ansible.builtin.template`)
- Note if asking about deprecations or porting (→ porting_guides topic)

**For code review:**
- Scan the code for Ansible directives: `roles:`, `vars:`, `loop:`,
  `handlers:`, `when:`, `register:`, `notify:`, `block:`, `rescue:`,
  `become:`, `delegate_to:`, etc.
- Extract module FQCNs used in tasks
- Note any `with_*` patterns (may need migration guidance from loops doc)
- Check for deprecated syntax patterns

### Step 3: Score manifest entries

For each entry in the manifest, compute a relevance score by matching
extracted keywords against:
- `title` field
- `summary` field
- `topic` field (directory name)
- `path` field (filename often contains the keyword)

Prioritize entries where multiple fields match. Rank results by score
descending.

### Step 4: Load documentation files

Select the top-scoring entries, respecting the context budget
(see below). For each selected file:

- If `"core": true` — Read from this plugin's `core/` directory:
  `core/{path}` (e.g., `core/playbook_guide/playbooks_loops.md`)
- If `"core": false` — Fetch from GitHub using WebFetch:
  `{base_url}/{path}` where `base_url` is from the manifest
  (e.g., `https://raw.githubusercontent.com/leogallego/ansible-documentation/ai-docs/vault_guide/vault.md`)

### Context budget

Never load more than **5,000 lines** total in a single invocation.
Prefer fewer, more relevant files over many marginally relevant ones.

When the budget is tight:
- Prioritize core files (already local, no fetch latency)
- Prefer files with higher keyword overlap
- For code review, prioritize files matching the directives found in code
- Use the `lines` field from the manifest to plan loading

If a single highly relevant file exceeds 1,000 lines, load it but
reduce the number of additional files.

## Response modes

### Q&A mode

When the user asks a question about Ansible (triggered by `$ARGUMENTS`
containing a question, or no code path):

1. Load the most relevant documentation files
2. Answer the question grounded in the loaded docs
3. **Cite sources** — for every claim, reference the source file and
   section heading. Format: `(source: {path}, section: "{heading}")`
4. If the docs don't cover the topic, say so explicitly:
   "The available Ansible documentation does not cover this topic."
5. Provide code examples from the docs when they exist
6. If the question relates to a specific Ansible version, check
   porting guides for version-specific changes

### Code review mode

When the user provides a code path or asks to review Ansible code
(triggered by `$ARGUMENTS` containing a file/directory path):

1. Read the Ansible code to review
2. Identify which documentation topics are relevant based on the
   directives, modules, and patterns used in the code
3. Load the relevant documentation files
4. Review the code against the official documentation:
   - Flag usage that contradicts documentation
   - Flag deprecated syntax with migration guidance from porting guides
   - Flag modules used incorrectly (wrong parameters, missing required
     params)
   - Suggest documented alternatives where applicable
5. **Cite sources** for every finding — reference the doc file and
   section that supports the finding
6. Present findings grouped by file, with:
   - The issue found
   - The relevant doc excerpt or guidance
   - The suggested fix
   - Source citation

## Boundaries

- This skill covers **official Ansible documentation only** — not
  third-party collection docs, community blog posts, or Stack Overflow
- If the user's question is about a specific collection module not
  covered in the bundled docs, say so and suggest checking the
  collection's own documentation
- Do not guess or fabricate documentation content — if the docs
  don't address something, state that clearly
- For CoP / organizational best practices review, direct the user to
  the `ansible-good-practices` skill instead
- For general Python, YAML, or Jinja2 questions unrelated to Ansible,
  decline and suggest appropriate resources

## Relationship to ansible-good-practices

These two skills are complementary:

| Aspect | ansible-docs | ansible-good-practices |
|--------|-------------|----------------------|
| Source | Official Ansible docs | Red Hat CoP rules |
| Focus | Correctness, syntax, features | Best practices, conventions |
| Scope | Module usage, playbook structure, deprecations | Naming, idempotency, architecture |
| When to use | "How do I...", "What does X do", "Is this syntax right" | "Review my code", "Check best practices" |

Both skills can be used together for a comprehensive review.
