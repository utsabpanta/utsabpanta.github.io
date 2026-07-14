---
title: "Spec-Driven Development, Without the Hype"
excerpt: "Everyone is suddenly talking about spec-driven development. GitHub built a toolkit for it, AWS built an IDE around it, and half the takes say it's the future while the other half say it's waterfall in a trench coat. Here's what it actually is and when it earns its keep."
date: "2026-07-13"
tags: ["agentic-engineering", "spec-driven-development", "artificial-intelligence", "developer-tools", "engineering"]
published: true
---

There's a specific failure mode that anyone who works with coding agents has hit. You describe a feature in a couple of sentences, the agent goes off and works for ten minutes, and what comes back is complete, tested, and not what you meant. Not broken. Just built on a slightly different idea of the problem than the one in your head. The agent filled every gap in your description with a confident default, and some of those defaults were wrong.

I wrote about the review side of this problem in [my last post](/blog/code-review-when-the-author-is-ai) - what to do once plausible-but-wrong code shows up in a pull request. Near the end of that post I mentioned that one real answer is to push the rigor upstream, before the code exists. Spec-driven development is the industry's current attempt to do exactly that, and right now it's everywhere. GitHub's [Spec Kit](https://github.com/github/spec-kit) has grown past 120,000 stars. AWS built an entire IDE, [Kiro](https://kiro.dev/), around the idea. And the discourse has split into two camps: people who say specs are the new source code, and people who say we just reinvented waterfall and gave it a CLI.

I think both camps are overclaiming. So this post is my attempt at the boring middle: what spec-driven development actually is, why it exists, where the waterfall criticism lands and where it misses, and a lightweight way to get the benefits without adopting anyone's toolkit.

## What It Actually Is

The core idea is simple. Instead of prompting an agent with a description and letting it jump straight to code, you make it produce written artifacts first - a specification of what you're building, a technical plan for how, and a task breakdown - and you review each one before the next step happens. The code comes last, generated against documents you've already approved.

The pitch goes further than that, though, and this is the part worth being skeptical about. In the strong version, the spec isn't a stepping stone to the code. It's the source of truth. Code becomes a build artifact, regenerated when the spec changes, the way compiled binaries are regenerated when source changes. You review specs, you version specs, you maintain specs. The code is downstream.

The tooling makes this concrete. Spec Kit works inside your existing agent - Claude Code, Copilot, and a few dozen others - through a set of slash commands that walk you through the phases:

```
/speckit.constitution   → project principles the agent must respect
/speckit.specify        → what you're building: user stories,
                          acceptance criteria, no tech stack talk
/speckit.plan           → how: architecture, data model, contracts
/speckit.tasks          → an ordered, reviewable task breakdown
/speckit.implement      → the agent executes the tasks
```

Each phase writes markdown files into a `specs/` directory in your repo. You read them, correct them, and only then move on.

Kiro takes the same shape and builds an IDE around it. Every feature gets three files - `requirements.md`, `design.md`, `tasks.md` - and the requirements are written in EARS notation, a structured format from the systems engineering world where every requirement reads like "WHEN a user submits an empty cart, THE SYSTEM SHALL return a validation error." It sounds bureaucratic. The point is that requirements written this way are individually testable, which matters a lot when the thing checking them is a machine.

Different tools, same bet: **the gap between what you meant and what the agent built is the biggest source of wasted work in agentic engineering, and the cheapest place to close that gap is in a document, before any code exists.**

## Why This Exists

It helps to be precise about the problems this is trying to solve, because they're real even if you never adopt the methodology. Agent-driven development has three recurring failure modes.

**Intent drift.** Your two-sentence prompt underdetermines the feature. The agent picks defaults for everything you didn't say - error behavior, edge cases, data shapes, what happens on retry. Multiply that across a feature and the result can be internally consistent and wrong for you.

**Context decay.** On anything bigger than a single session, the agent forgets. Decisions made on Tuesday aren't in the context window on Thursday. Without a written record, every session re-derives the architecture from the code, and each re-derivation drifts a little.

**Unverifiable output.** This was the core of my code review post. If nobody wrote down what "correct" means, then review is just vibes with extra steps. Tests written by the same agent that wrote the code verify the agent's understanding, not yours.

Notice what these have in common: none of them are code problems. They're all specification problems that used to be invisible because a human held the spec in their head while writing the code by hand. Agents made the missing document visible. Spec-driven development is, at its most defensible, just the observation that if the spec is going to exist implicitly anyway, you might as well write it down where you can review it.

## The Waterfall Objection

Now the criticism, because it's the most common response and it deserves a straight answer rather than an eye roll.

The objection: we tried "write the complete specification, then implement it" for decades. It was called waterfall, it failed for well-understood reasons, and the entire agile movement was a correction to it. Specs were always wrong because you don't understand a problem until you've built part of the solution. Why would that be different now?

Here's where I think the objection misses. Waterfall failed because of the cost of the loop, not the existence of the phases. When a spec took a committee three months to produce and the implementation took a year, discovering a wrong assumption at the end was a catastrophe, so wrong assumptions accumulated silently. With an agent, the spec takes an afternoon and the implementation takes hours. When building reveals that the spec was wrong - and it will - you update the spec and regenerate. The loop that took eighteen months now takes a day. Iteration didn't go away. It moved up a level of abstraction. That's genuinely not waterfall; waterfall's defining sin was that the feedback never made it back upstream, and here the trip upstream is cheap.

But the objection lands somewhere else, and the SDD evangelists mostly don't want to talk about it. Three places, in my experience:

**Spec drift is real and nobody is immune.** The strong version of SDD requires the spec to stay the source of truth forever. In practice, the first hotfix at 11pm goes straight into the code, and now your spec is a lie. A stale spec is worse than no spec, because an agent will faithfully treat it as true. We couldn't keep README files accurate. The idea that we'll keep full behavioral specifications accurate deserves more suspicion than it gets.

**The overhead is real for small work.** Running a five-phase workflow to fix an off-by-one error is absurd, and the methodology's own advocates admit it. Something like a third of Spec Kit's early feedback was that it's too heavy for bug fixes and small features. The tools are adapting - Kiro added a lighter bugfix flow - but the honest framing is that SDD has a minimum task size below which it's pure ceremony.

**The spec is usually written by the same model that writes the code.** This is the quiet one. In every one of these tools, the agent drafts the spec and you review it. Sound familiar? It's the same fluent, confident, plausible-looking artifact problem I described for code review, moved up a layer. If you skim-approve a generated spec, you haven't pushed rigor upstream. You've pushed rubber-stamping upstream. The entire value of the methodology lives in whether a human actually thinks hard at the spec review step, and the methodology can't force you to.

## Where It Earns Its Keep

So when is it worth the ceremony? My rule of thumb after playing with this: **the value of a spec scales with how many context windows the work spans.**

One session, one developer, a task you can hold in your head - skip it. Describe the task well, review the diff, done. This is most tasks, and pretending otherwise is how methodologies get a bad name.

The math changes when the work outlives a single context window. A feature that takes days of agent sessions. A codebase where multiple people, or multiple agents, work in parallel. A greenfield module where there's no existing code for the agent to infer conventions from. In those cases, the spec isn't ceremony - it's the only persistent memory the project has. Every new session reads the same requirements and plan instead of re-deriving them from the code, and two agents working on adjacent features are at least drifting from the same document.

The other case is when correctness genuinely matters more than speed. If you're touching auth, money, or data retention, "the agent picked a reasonable default" is exactly what you don't want. Acceptance criteria written down before implementation - by you, not the agent - are the cheapest correctness tool available, because they're also the review checklist and the test plan.

## The Lightweight Version

You don't need Spec Kit or Kiro to get most of the benefit. The methodology is markdown files and discipline. Here's the version I'd actually start with.

Before pointing an agent at any feature that will take more than a session, write a short spec by hand. Not a document - a page. Something like:

```markdown
# Feature: Saved searches

## What
Users can save a search (query + filters) and re-run it
from a "Saved" list. Max 20 per user.

## Acceptance criteria
- Saving a duplicate search updates the existing entry,
  no error
- Deleting a saved search is immediate, no confirmation,
  but undoable for 10 seconds
- Saved searches survive schema changes to filters:
  unknown filter keys are dropped silently on load
- Empty state shows a hint, not a blank panel

## Out of scope
- Sharing saved searches
- Notifications when results change

## Open questions
- Do saved searches sync across devices now or later?
```

That took five minutes, and every line is doing work. The acceptance criteria are the things the agent would have guessed at - and two of them (the undo window, the unknown-key behavior) it would almost certainly have guessed differently. The "out of scope" section prevents helpful over-building. The open question flags a decision I haven't made, so the agent asks instead of assuming.

Then, before the agent writes code, have it produce a plan and read the plan like you'd read a design doc from a new team member. It's the best-spent ten minutes of review you'll do all day, because a wrong assumption caught here costs a sentence to fix. In the code, it costs a re-review of everything built on top of it. Claude Code's plan mode does this natively; every serious agent has an equivalent.

Finally, when the work is merged, either update the spec or delete it. Both are fine. A deleted spec was scaffolding that did its job. A stale spec left in the repo is a trap for the next agent that reads it.

If that habit sticks and you're working on something bigger - multi-week, multi-person, agents running in parallel - then graduate to the real tooling. `specify init` in an existing project is a reasonable afternoon experiment, and you'll know within one feature whether the structure is paying for itself or just producing documents nobody reads.

## The Actual Shift

Strip away the tooling and star counts and I think what's happening is simpler than the discourse suggests. For decades, the specification lived in the programmer's head, and typing the code was how it got externalized. Agents broke that arrangement. The typing is now delegated, but the spec still has to live somewhere - and "scattered across a prompt history" is somewhere, just a bad somewhere.

Spec-driven development is one answer to where it should live instead. The methodology will keep evolving and the current tools may not be the ones that stick. But the underlying skill - being able to say precisely what you want built, what correct means, and what's out of scope, in writing, before the building starts - that one isn't going anywhere. It was always the hard part of software. The machines just called our bluff on it.

---

## References

- [Spec Kit](https://github.com/github/spec-kit) - GitHub's open-source spec-driven development toolkit
- [Kiro](https://kiro.dev/) - AWS's IDE built around spec-driven workflows
- [EARS: The Easy Approach to Requirements Syntax](https://alistairmavin.com/ears/) - the requirements notation Kiro uses
- [Code Review When the Author Is an AI Agent](/blog/code-review-when-the-author-is-ai) - the downstream half of this argument
- [Agentic Engineering: A Practical Guide](/blog/agentic-engineering-practical-guide) - fundamentals of working with coding agents
