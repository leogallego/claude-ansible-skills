# Plan: Phase 2 — Module-aware task generation for ansible-new-role

## Context

The `ansible-new-role` skill currently generates tasks using template
patterns inferred from the user's answers to "What does the role manage?"
(packages, services, config files, etc.). The LLM guesses module parameters
from training data, which can produce incorrect parameter names, miss required
params, or overlook specialized modules.

The `ansible-know` MCP server (v0.7.0+) provides `search_modules` and
`get_module_doc` tools that return structured, accurate module documentation.
This plan adds an **optional** module discovery step to the scaffold workflow
so generated tasks use verified parameter names, types, and defaults — while
preserving full functionality without the MCP server.

**Spec reference:** `docs/spec-skills-know-mcp-integration.md`, Phase 2 section.
**Issue:** [#22](https://github.com/leogallego/claude-ansible-skills/issues/22)

## Design decisions

### Optional vs required (differs from Phase 1)

Phase 1 (ansible-docs) made ansible-know a **hard** dependency — the skill
refuses to proceed without it. Phase 2 is **optional** — the current
template-based generation is the fallback. This is the correct choice because:
- The scaffold skill existed before ansible-know and works fine without it
- MCP enrichment improves accuracy but isn't essential to produce a usable role
- Users who don't have ansible-know installed shouldn't lose scaffold functionality

### Where the MCP step fits

```
Current flow:                         New flow:
─────────────                         ─────────
1. Gather inputs                      1. Gather inputs (unchanged)
2. Scaffolding strategy               2. [NEW] Module discovery (optional)
3. Required files and content         3. Scaffolding strategy (unchanged)
4. Post-creation validation           4. Required files and content (ENHANCED)
5. Loading reference rules            5. Post-creation validation (unchanged)
                                      6. [NEW] Companion skill offer (optional)
                                      7. Loading reference rules (unchanged, appendix)
```

Module discovery goes **after** gathering inputs (needs to know what the role
manages) and **before** generating files (needs to inform task content).
Companion skill goes **after** validation (only offer once the role is valid).

### Two-level module search strategy

1. **By managed concern** — the template patterns already identify module
   categories (packages → `ansible.builtin.package`, services →
   `ansible.builtin.service`). The MCP step looks up the actual docs for
   these known modules to get correct parameters.

2. **By software/technology name** — if the user's description mentions
   specific software (nginx, PostgreSQL, HAProxy), search for specialized
   collection modules (e.g., `community.nginx.*`, `community.postgresql.*`).
   Present discoveries to the user and let them choose whether to use
   specialized modules or stick with generic builtins.

### What stays unchanged

- The 7 gather-inputs questions (no changes to the interactive flow)
- The scaffolding strategy (ansible-creator vs manual)
- The directory structure and file list
- All CLAUDE.md rules enforcement
- The post-creation validation checklist
- The loading reference rules section

## File to change

**Single file:** `ansible-new-role/skills/ansible-new-role/SKILL.md`

No new files needed. No files deleted. No plugin.json changes (version bump
is optional — this is an additive enhancement, not a breaking change).

## Changes to SKILL.md

### Change 1: Add "Optional: Module discovery" section

Insert a new `## Optional: Module discovery` section **after** "Gather inputs"
and **before** "Scaffolding strategy". This section is structured as:

**Detection:** Same pattern as the spec's implementation notes:

```markdown
If the `search_modules` and `get_module_doc` MCP tools are available in
your tool list, perform the following module discovery step. If these
tools are not available, skip this section entirely and use the template
patterns from "What does the role manage?" to generate tasks.
```

**Step 1 — Search by managed concern (builtins).** For each pattern the user
selected in "What does the role manage?", look up the canonical
`ansible.builtin` modules by passing the `namespace` filter:

| Pattern selected | search_modules call |
|------------------|---------------------|
| Packages | `search_modules(keyword="package", namespace="ansible.builtin")` |
| Services | `search_modules(keyword="service", namespace="ansible.builtin")` |
| Configuration files | `search_modules(keyword="template", namespace="ansible.builtin")` |
| Users/groups | `search_modules(keyword="user", namespace="ansible.builtin")` |
| Firewall rules | `search_modules(keyword="firewall")` (no namespace — community modules) |
| Storage/mounts | `search_modules(keyword="mount", namespace="ansible.builtin")` |
| Custom | `search_modules(keyword=<extracted keywords from description>)` |

For the **Custom** pattern: extract 1-3 keywords from the user's free-text
description and search without namespace filter to cast a wide net. Example:
"manages DNS zones" → `search_modules(keyword="dns zone")`.

**Step 2 — Search by software name.** If the user's description or role name
mentions specific software/technology (nginx, PostgreSQL, HAProxy, etc.), run
an additional `search_modules(keyword=<software_name>)` **without** the
namespace filter to discover specialized collection modules (e.g.,
`community.nginx.*`, `community.postgresql.*`).

Present any specialized modules to the user: "I found these specialized
modules for [software]. Would you like to use them alongside the generic
builtins, or stick with builtins only?" The user decides. This is where the
real value of MCP discovery shows — surfacing modules the user didn't know
existed.

**Step 3 — Get module docs.** For each selected module (builtins from step 1
+ any user-approved specialized ones from step 2), call
`get_module_doc(module_name=<fqcn>)`. Extract and retain:
- Parameter list (name, type, required, default, choices, aliases)
- Example YAML from the module docs
- Whether the module is API-based (affects idempotency notes)

Limit: fetch docs for at most **10 modules** to avoid excessive MCP calls.
Prioritize: required builtins first (package, service, template), then
user-approved specialized modules, then optional builtins (file, lineinfile).

**Step 4 — Inform task generation.** Store the collected module docs as
context for the "Required files and content" section. When generating:
- Tasks: use correct parameter names, include all required params, respect
  choices/enums
- `defaults/main.yml`: align variable types with module parameter types
- `meta/argument_specs.yml`: use discovered types and choices for validation
- `handlers/main.yml`: use correct module syntax for service restart/reload

### Change 2: Enhance "Required files and content" section

Add a brief note to the `tasks/main.yml` subsection:

```markdown
If module documentation was discovered in the previous step, use the
structured parameter information to generate tasks with verified parameter
names, types, and defaults. Prefer module example patterns from the docs
over generic templates.
```

This is a small addition — the heavy lifting is in the module discovery
section. The existing subsections (defaults, vars, tasks, handlers, etc.)
stay as-is; they just benefit from richer context.

### Change 3: Add "Optional: Companion skill generation" section

Insert a new `## Optional: Companion skill generation` section **after**
"Post-creation validation" and **before** "Loading reference rules"
(which is an appendix-style section, not a workflow step).

The `generate_role_skill` MCP tool already exists in ansible-know — this
section simply offers to call it as a convenience at the end of scaffolding,
not a new capability.

```markdown
If the `generate_role_skill` MCP tool is available AND the role is inside
a collection (collection context was confirmed in "Gather inputs"):

1. Offer: "Would you like me to generate a Claude Code skill package for
   this role? It creates a SKILL.md with usage examples and documentation
   that Claude Code can use when working with your role."
2. If accepted, call generate_role_skill(role_name=<namespace.collection.role_name>)
3. Report the generated SKILL.md and assets/playbook.yml locations

If the role is standalone (not in a collection), skip this — generate_role_skill
requires a fully-qualified role name (namespace.collection.role).

Note: For generating skills for ALL roles in a collection at once, the user
can call generate_collection_skills directly — this offer is specifically
for the single role just scaffolded.
```

### Change 4: Update front matter

Bump `version` from `1.0.0` to `1.1.0` (minor version — additive feature,
no breaking changes). Update `description` to mention module-aware generation:

```yaml
description: >-
  Create a new Ansible role following all Red Hat CoP good practices.
  Use when the user wants to create, generate, or bootstrap a new Ansible
  role. Optionally uses ansible-know MCP tools for module-aware task
  generation with verified parameters. Falls back to template-based
  generation when MCP is unavailable.
```

Update `compatibility` to mention the optional MCP dependency:

```yaml
compatibility: >-
  Requires ansible-creator CLI (optional, falls back to manual creation).
  Optionally uses ansible-know MCP server for module-aware task generation.
```

## What this does NOT change

- **No new files** — all changes are in SKILL.md
- **No gather-inputs changes** — the 7 questions stay identical
- **No scaffold structure changes** — same directories, same files
- **No CLAUDE.md rule changes** — still enforced identically
- **No breaking changes** — without MCP, behavior is identical to v1.0.0

## Verification plan

### Test 1: With ansible-know MCP connected

1. Invoke `/ansible-new-role test_nginx`
2. Answer "What does the role manage?" with: packages, services, config files
3. Verify:
   - MCP tools are called (search_modules, get_module_doc)
   - Generated tasks use correct `ansible.builtin.package` params (name, state)
   - Generated tasks use correct `ansible.builtin.service` params (name, state, enabled)
   - Generated template tasks use correct `ansible.builtin.template` params
   - `argument_specs.yml` reflects discovered parameter types
   - The user is asked about any specialized nginx modules found
4. Verify companion skill offer appears (if inside a collection)

### Test 2: Without ansible-know MCP

1. Temporarily disconnect ansible-know MCP server
2. Invoke `/ansible-new-role test_basic`
3. Answer same questions as Test 1
4. Verify:
   - No MCP calls attempted
   - Generated output is identical to current v1.0.0 behavior
   - No error messages about missing MCP
   - No mention of module discovery or companion skills

### Test 3: Edge case — Custom pattern

1. Invoke `/ansible-new-role test_custom`
2. Answer "What does the role manage?" with: Custom — "manages DNS zones"
3. Verify the module search uses the custom description as search keywords
