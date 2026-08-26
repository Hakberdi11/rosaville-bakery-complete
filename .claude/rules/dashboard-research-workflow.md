# Dashboard research → implementation workflow

A two-agent pipeline for growing `rosaville-admin-dashboard`'s feature set based on real bakery-industry research, plus the rules for how the resulting work gets implemented safely. This is a durable process doc — it describes *how this kind of work happens*, not a one-time list of tasks (the actual task list lives in `.claude/research/dashboard-gap-analysis.md`, which is disposable/regenerable output, not this file).

## The two agents

- **`bakery-crm-researcher`** (`.claude/agents/bakery-crm-researcher.md`) — starts with zero prior context every run, researches what CRM/POS/back-office systems real bakeries and dessert businesses use, what's genuinely good/bad about them, sourced where possible. Writes to `.claude/research/bakery-crm-research.md`, overwriting the previous pass (this is "latest research," not an accumulating log).
- **`dashboard-gap-analyst`** (`.claude/agents/dashboard-gap-analyst.md`) — reads that research file plus Rosaville's *actual current code* (Django models, admin-dashboard pages, `.claude/rules/*.md`), and produces a prioritized (impact × effort) list of what's actually missing. Writes to `.claude/research/dashboard-gap-analysis.md`. Requires the researcher's output to already exist — it will refuse to run from assumptions alone.

Invoke by name: "Use the bakery-crm-researcher subagent to refresh the research" / "Use the dashboard-gap-analyst subagent to compare it against our dashboard." Run the researcher first; the analyst depends on its output file.

Re-run this pipeline whenever it's been a while since the last pass, or the dashboard has changed enough that the gap list might be stale — don't assume `.claude/research/*.md` stays accurate indefinitely.

## The ops pipeline (inventory & day-to-day management)

A second, parallel two-agent pipeline covers ground the pipeline above doesn't: inventory-management practice and general day-to-day operations (staff/task scheduling, loyalty program design, feedback handling) — as opposed to pricing methodology (owned by `bakery-pricing-researcher`/`bakery-pricing-systems-researcher`) or CRM/POS tooling (owned by `bakery-crm-researcher`).

- **`bakery-ops-researcher`** (`.claude/agents/bakery-ops-researcher.md`, sonnet) — researches inventory best practices and general bakery operations/management practice, sourced where possible. Writes to `.claude/research/bakery-ops-research.md`, overwriting each pass.
- **`bakery-ops-implementer`** (`.claude/agents/bakery-ops-implementer.md`, opus) — reads that research plus the pricing research files, the existing gap analysis (flagging anything in it that's now stale), and Rosaville's actual current code, then writes a prioritized, code-grounded plan to `.claude/research/bakery-ops-implementation-plan.md`. It stops after the plan for a check-in, then implements approved items one at a time.

Invoke by name: "Use the bakery-ops-researcher subagent to refresh the research" / "Use the bakery-ops-implementer subagent to brainstorm a plan" (Phase 1 only) / "Use the bakery-ops-implementer subagent to implement item N" (Phase 2, once you've reviewed the plan).

This pipeline shares the same `dashboard-research` branch and the same **Branching** and **Implementation pacing** rules below as the gap-analysis pipeline — one item at a time, verified, committed, tracked inline in `bakery-ops-implementation-plan.md`, never merged to `main` without asking.

## Branching

This work happens on the **`dashboard-research`** branch, not `main`. Rules:
- Never force-push.
- Never touch `main` directly from this workflow — `main` is the known-safe fallback.
- If `main` moves (e.g. a hotfix lands there), merge/rebase `dashboard-research` on top of it periodically so the branch doesn't drift far, but do this deliberately, not as a side effect of another command.
- When the gap-list implementation reaches a good stopping point (a real milestone, not just "ran out of budget"), that's the point to consider merging back to `main` — ask the user first, don't merge unilaterally.

## Implementation pacing (why this matters)

The gap list can be large. Token budget for any given session is *not* guaranteed to last through the whole list. The rule, non-negotiable:

1. Implement **one gap-list item at a time.**
2. After each item, verify it actually works — a real functional check (run it, click through it, hit the API), not just "the code compiles" or "the file was written."
3. Commit after each verified item, with a message naming the specific feature (not "progress" or "wip").
4. Only then move to the next item.
5. If a session looks like it's running low on budget, **stop between items, not mid-item.** The branch must always be left in a working, demoable state — every commit on `dashboard-research` should be something you could hand to the user right now and have it actually run, even if the full gap list isn't done yet.

This means "finished implementing the gap list" and "stopped partway through the gap list" should look identical in terms of code health — the only difference is how many items are checked off. Track progress against `.claude/research/dashboard-gap-analysis.md` (e.g. mark items done inline, or keep a running note of what's shipped) so resuming later doesn't require re-deriving what's already built.
