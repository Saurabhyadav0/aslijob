---
name: engineering-workflow
description: The default end-to-end development loop for this project — delegate investigation to subagents, design with SOLID, build test-first, and gate on security and production readiness before calling anything done. Use at the start of ANY coding task, feature, bug fix, or refactor unless the user explicitly asks for a quick throwaway answer.
---

# Engineering Workflow

The house rules for how work gets done here. This skill sequences the others — read it
first, then invoke each stage's skill when you reach that stage.

## Principles

1. **Delegate investigation.** Research and cross-file analysis go to subagents; decisions
   and edits stay in the main thread.
2. **Design before typing.** Know the seam before writing the code that sits on it.
3. **Test-first for logic.** Behaviour that matters gets a failing test first.
4. **Security is not a phase.** It is a constraint on every line.
5. **Done means shippable.** Not "it runs on my machine".

## The loop

### Stage 0 — Orient
Read the repo's `AGENTS.md` / instruction files and any session state before touching
code. Confirm which feature you are on and that the baseline verification passes. Do not
stack new work on a broken starting state.

### Stage 1 — Investigate (subagents)
→ **`subagent-first`**

Spawn subagents to answer *where*, *what calls*, *what breaks*, *how does the current
implementation work*. Launch independent investigations in parallel in one batch. Verify
any file a subagent names before editing it. Summarise findings back to the user —
subagent output is invisible to them.

### Stage 2 — Design
→ **`solid-engineering`**, plus **`codebase-design`** and **`domain-modeling`** if available

Decide the seam, the interface, and what stays hidden. Prefer a deep module with a small
surface. Confirm the design lets the next variant be added without editing existing files.

For a genuinely uncertain design, stress-test it first with **`grilling`**, or spike it
with **`prototype`** before committing.

### Stage 3 — Specify
→ **`to-spec`** if available

For anything beyond a small change, write down the requirements and acceptance criteria
before implementing. Ambiguity resolved now is cheaper than a rewrite later.

### Stage 4 — Build test-first
→ **`tdd`** / **`unit-testing`**

Red → green → refactor. Cover the failure paths, not only the happy path. Tests must be
deterministic — no wall-clock, no network, no ordering dependence.

While implementing, hold to `solid-engineering`:
- change only what the task requires
- no abstraction for a single call site
- domain logic free of framework and vendor imports
- dependencies injected, not imported inside the logic

### Stage 5 — Security gate
→ **`secure-by-default`**

Apply the non-negotiables while writing, then run the audit skills against the **diff**:
`secure-code-review` always; plus `api-security`, `owasp-top-10-web`,
`dependency-scanning`, `secrets-management`, `pipeline-security`, `threat-modeling`,
`llm-top-10`, `prompt-injection`, or `agent-security` depending on what the change touched.

Report findings. Do not silently change authn/authz, crypto, or validation semantics —
propose and confirm.

### Stage 6 — Production readiness gate
→ **`production-readiness`**

Walk the checklist: error handling, structured logging with correlation ids, metrics for
new failure modes, config validated at startup, timeouts and bounded retries, bounded and
indexed queries, backward-compatible migration, graceful shutdown, real rollback path.

### Stage 7 — Review
→ **`code-review`**, or delegate the diff to a reviewer subagent

Review the diff against both the repo's standards and the original spec. Fix what the
review surfaces before declaring done.

### Stage 8 — Close out
Update the repo's session/feature state artifacts. Record evidence that verification
actually ran, plus any unresolved risk. Leave the repo restartable from the standard
startup path. Commit with a descriptive message — use **`caveman-commit`** if available.

## Debugging deviation

When something is broken rather than missing, skip to **`diagnosing-bugs`**. Reproduce
first, form a hypothesis, prove it with evidence, *then* fix. Do not retry the same
approach hoping for a different result. Once fixed, re-enter at Stage 4 with a regression
test.

## Definition of done

A change is done only when all of these are true:

- [ ] Target behaviour implemented and scoped to the task
- [ ] Design holds up against SOLID — one reason to change, extension without modification,
      dependencies inverted
- [ ] Tests exist for happy path *and* failure paths, and they pass
- [ ] `secure-by-default` gate run against the diff; findings resolved or explicitly accepted
- [ ] `production-readiness` checklist satisfied or each gap waived with a reason
- [ ] Verification actually ran — with recorded evidence, not an assumption
- [ ] Repo left clean and restartable

## Anti-patterns

- Hand-grepping across ten files instead of spawning one subagent
- Writing the implementation first and "adding tests later"
- Treating the security review as a post-merge activity
- Marking a feature complete because code was added, without running verification
- Opportunistic refactors bundled into a feature diff
- Building an abstraction for a variant that does not exist yet
