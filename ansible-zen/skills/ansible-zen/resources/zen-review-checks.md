# Zen of Ansible — Review Checks

Map each Zen principle to concrete code patterns when reviewing Ansible code.

| Principle | What to look for |
|---|---|
| Ansible is not Python | Jinja2 abuse: complex filters, nested conditionals, inline Python logic in templates |
| YAML sucks for coding | Overly clever YAML tricks, deep nesting, complex data transformations in vars |
| Playbooks are not for programming | Control flow abuse: excessive `when` chains, recursive includes, loop-within-loop patterns |
| Clear is better than cluttered | Noisy tasks: too many parameters on one task, unclear variable names, mixed concerns |
| Concise is better than verbose | Unnecessary repetition, copy-pasted tasks that should be loops, overly wordy task names |
| Simple is better than complex | Over-engineered roles, unnecessary abstractions, premature generalization |
| Readability counts | Poor formatting, missing task names, cryptic variable names, inconsistent style |
| Helping users get things done | Missing docs, unclear defaults, no examples, hard-to-use interface |
| User experience beats ideological purity | Overly strict validation that blocks users, rigid patterns that don't adapt |
| "Magic" conquers the manual | Manual steps that could be automated, missing handlers, no default values |
| Convention over configuration | Too many knobs, unnecessary options, no sensible defaults |
| Declarative is better than imperative | `command:`/`shell:` used where a module exists, procedural task chains. When suggesting `service_facts` as a replacement, filter on running state with `selectattr('value.state', 'equalto', 'running')` — checking existence alone is not equivalent to checking state |
| Focus avoids complexity | Roles that do too many things, mixed responsibilities, scope creep |
| Complexity kills productivity | Hard-to-understand logic, deep variable indirection, over-abstracted patterns |
| Hard to explain = bad idea | Code that requires extensive comments to understand, non-obvious behavior |
| Opportunity to automate | Manual steps documented but not automated, TODO comments for automation |
| Can always be improved | Stale patterns, deprecated module usage, known better alternatives |
| Eliminate friction | Unnecessary prerequisites, manual setup steps, poor error messages |

## Severity Levels

Classify each finding with one of these levels:

- **POSITIVE** — Correct pattern, no action needed
- **IMPROVEMENT** — Could be better, but not wrong
- **OPTIONAL** — Worth considering, genuinely discretionary — the role works
  fine either way
- **VIOLATION** — Clearly wrong, will break, or directly contradicts the principle

Reserve VIOLATION for things that are unambiguously bad. Hardcoded values
or unused variables are IMPROVEMENT unless actively misleading.

## Finding Guidelines

- Group findings by principle, not by file
- Include one sentence explaining *why* it maps to that principle (enables generalization)
- Valid fix types: code substitutions, "remove this entirely", "move to a handler" — subtraction is valid
- Include file-wide issues (e.g., missing FQCNs throughout) with "throughout" instead of a line number
- Keep snippets to relevant lines only (max 6 original, max 8 fix)
- Keep POSITIVE findings terse — state what is correct, no filler
- Every review must include at least one POSITIVE finding

### Completeness

- Check for **interface inconsistencies**: variables defined in defaults but not
  referenced in tasks, parameterized names alongside hardcoded equivalents
- Check for **unverifiable references**: if a task uses `notify:` but the handler
  file is not in the reviewed files, flag as IMPROVEMENT — a missing handler is
  a runtime failure, not optional. Prompt: "Verify that handlers/main.yml
  defines this handler — the role will fail without it."
- Completeness matters more than brevity — a missed finding is worse than an
  extra sentence

### Cross-Finding Consistency

- When multiple findings reference the same code, their suggested fixes must
  not contradict each other
- If one finding says "remove this task entirely," other findings on the same
  task should defer to that recommendation rather than suggesting improvements
  to code that should not exist
- If the correct fix is a handler pattern, do not suggest an alternative
  imperative fix (e.g., replacing one shell command with another) in a
  different finding — point to the handler approach instead

## Zen Score Rubric

- **9-10**: Exemplary — clean, simple, readable, well-documented
- **7-8**: Good — follows most principles, minor improvements possible
- **5-6**: Acceptable — works but has notable complexity or readability issues
- **3-4**: Needs work — significant violations of simplicity and clarity
- **1-2**: Anti-Zen — over-engineered, unreadable, or fundamentally complex

Score reflects overall code quality, not finding count. A role with several
minor IMPROVEMENT findings (unused variables, missing parameterization) but
no VIOLATION findings is still in the 7-8 range. Only VIOLATION findings
should meaningfully pull the score down.
