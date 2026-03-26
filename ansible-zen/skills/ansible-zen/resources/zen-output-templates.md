# Zen of Ansible — Output Templates

Follow these templates exactly. Do not add sections, reorder, or deviate.

## Display Mode Template

~~~markdown
# The Zen of Ansible

1. {Principle 1}
2. {Principle 2}
...
20. {Principle 20}

---

## Deep-Dive: "{chosen principle}"

{2-3 sentences: why this principle matters. Be precise about what it buys you
 (idempotency, changed/ok accuracy, maintainability) — not vague appeals.}

### Before

```yaml
{5-10 lines of a realistic anti-pattern someone would actually write}
```

### After

```yaml
{5-10 lines of improved code}
```

### Why This Matters

{2-3 sentences: what the improvement concretely buys you. Every sentence
 should add decision criteria a reviewer could apply to other code.}

---

> For strict rule compliance, run `ansible-cop-review`.
~~~

## Review Mode Template

~~~markdown
# Zen of Ansible Review: {scope}

**Files reviewed:** `{file1}`, `{file2}`, ...

---

## Findings

### {Principle name}

**`{file_path}:{line}`** — {POSITIVE|IMPROVEMENT|OPTIONAL|VIOLATION}

```yaml
{offending or exemplary snippet, max 6 lines}
```

{1 sentence: why this maps to the principle.}

**Suggested fix:**

```yaml
{improved snippet, max 8 lines — or "Remove this task entirely"
 or "Move to a handler" when subtraction is the right fix}
```

<!-- Repeat ### block per principle. Group multiple findings under
     the same principle heading. Omit "Suggested fix" for POSITIVE.
     For file-wide issues (e.g. missing FQCNs), use "throughout"
     instead of a line number. Keep POSITIVE findings terse. -->

---

## Zen Score: {N} / 10

{2-3 sentence justification referencing the rubric.}

---

## Top Recommendations

<!-- Up to 3. Each must follow from a finding above. Omit if fewer are warranted. -->

1. **{Short title}.** {1-2 sentences.}
2. **{Short title}.** {1-2 sentences.}
3. **{Short title}.** {1-2 sentences.}

---

> For complementary rule compliance analysis, run `ansible-cop-review`.
~~~
