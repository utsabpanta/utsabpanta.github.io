---
title: "Code Review When the Author Is an AI Agent"
excerpt: "When writing code is cheap, reviewing it is where all the value goes. Most teams are still running a review process built for a world that no longer exists. Here's what changes when a machine wrote the diff."
date: "2026-06-14"
tags: ["code-review", "artificial-intelligence", "agentic-engineering", "engineering-culture", "developer-tools", "claude"]
published: true
---

Picture a pull request that's clean, well-structured, fully tested, and wrong. Not obviously wrong. The kind of wrong that looks right. The kind you only catch on the second pass when you stop reading the code and start asking what it's actually doing.

An AI agent wrote it. A person submitted it. And the moment that should worry you is this one: it sails through every check a typical team has. The tests pass because the agent wrote tests that matched its own incorrect assumptions. The style is perfect because a formatter made it perfect. The PR is small and readable. By every signal most review processes are tuned to catch, it's a great PR.

We built our review culture for a world where writing code was the expensive part. That world is gone. And most teams haven't updated the way they review to match.

---

## The One Thing That Changed

For decades, code review rested on a quiet assumption: the person who wrote the code understood it. They sat with the problem and made a hundred small decisions you never see in the diff. Ask "why did you do it this way" and you got a real answer rooted in real reasoning.

That assumption is now optional. When an agent writes the code, the person submitting it may have read it carefully, skimmed it, or barely looked. The understanding that used to be baked into authorship is no longer guaranteed.

And that points at something sharper than "review matters more now." Review was never designed to create understanding. It was a *second opinion* on understanding that already existed: the author did the hard thinking, the reviewer checked it. We are now asking review to do a job it was never built for, to be the *first* time any human actually comprehends the code at all.

So here's the shift, and it's the whole point of this post: **when writing code is cheap, reviewing it is where all the value concentrates.** Review stops being a checkpoint near the end of the process. It becomes the main event, the place where human judgment first enters the system rather than where it gets confirmed. If your team still treats it as the thing you do with a spare twenty minutes, you're underinvesting in the exact moment that now matters most.

---

## What Breaks

Before fixing anything, you have to see which of your old assumptions just stopped being true.

### "The author can explain the code"

This used to be the strongest signal in review. Ask a clarifying question, listen to the answer, and you learned a lot about whether the code was trustworthy. A confident, specific answer meant the author had thought it through. A vague one was a red flag.

Now the author might be relaying. They asked an agent, the agent produced code, and the explanation you get back is the agent's explanation, possibly re-summarized. The signal still exists, but it's gone quiet. "I'm not sure, let me check" used to be rare and slightly alarming. Now it's a normal Tuesday.

### "Small PR means small change"

We taught everyone that small PRs are good, and they are. But we relied on a hidden correlate: writing is slow, so a small diff usually meant a small, well-scoped piece of thinking.

Agents break that link. They can generate four hundred lines across nine files in the time it takes to get coffee. The PR might still be small, or it might be large and look small because it's tidy. Volume is no longer a proxy for effort, and effort is no longer a proxy for care.

### "Passing tests mean it works"

Tests written by the same agent that wrote the code are tests written against the agent's own understanding of the problem. If that understanding is subtly wrong, the tests don't catch it. They lock it in. Green checkmarks now carry a little asterisk: they confirm the code does what its author thought it should, and the author might have been a model that confidently misunderstood the requirement.

### "Bad code feels bad"

This is the subtle one. Human-written code that's wrong often looks wrong. There's a smell. Awkward naming, a function that's clearly fighting itself, a comment that admits confusion. Those tells are how experienced reviewers catch problems fast.

Agent-written code rarely smells. It's fluent. It uses the right idioms, names things reasonably, and reads like someone competent wrote it. The fluency is real and the correctness is separate, and your gut has spent a whole career learning to treat them as the same thing. They aren't anymore.

---

## But My Repo Has a CLAUDE.md

Fair objection. A lot of teams now hand the agent real context: a CLAUDE.md documenting the conventions, skills that encode how the tests and workflows run, custom agents tuned to the stack. Set this up well and some of what I just called broken genuinely shrinks. The agent stops reaching for the library version you dropped a year ago. The code matches your house style because you told it your house style. That's real, and it's worth doing.

But notice what it actually buys you. It makes the agent more consistent. It does not make the human more informed, and those are two different things. Worse, a well-configured repo makes the wrong code blend in even more cleanly, because you just taught the agent to match your conventions and removed the last visual tell you had. The better your setup, the more invisible a subtly wrong PR becomes.

The context also shifts the failures rather than deleting them. The agent follows every rule you wrote down and fills every gap you didn't with a confident default, so the bug moves to wherever your CLAUDE.md is silent, which is most of your system. And that file is a human-authored artifact that drifts. A stale convention in it is now followed faithfully, confidently, in every PR. Your guardrails became one more thing that needs reviewing.

So set the repo up well. It makes the agent better at being an agent. It still doesn't put a human's understanding into the loop, and that part is your job.

---

## What Stays Exactly the Same

One reassuring note before the tactics. The questions at the heart of review have not moved an inch. Is this the right approach? Will an engineer understand it in eighteen months? What happens when this dependency is down, this input is malformed, this list is empty? Does this match how the rest of the system thinks? AI authorship doesn't change the questions. It changes how much of your attention they deserve and how much it costs to get them wrong.

---

## How to Actually Review AI-Authored Code

Practical tactics. This is the part to steal.

### Make a human own the PR, fully

The single most important rule. Whoever opens the pull request is the author, period. Not "the agent wrote it." They own every line. They are accountable for it in production at 2am. An agent will never feel embarrassed about shipping a bug, never get paged, never learn from the postmortem. That social accountability is load-bearing for code quality, and it only works if it lands on a person.

Make this explicit on your team. "I generated this" is not a disclaimer that transfers responsibility. It's just context.

### Hunt for plausible-but-wrong

Reorder your review. With human code you start at the surface and work down. With agent code, invert it: assume the surface is fine and go straight for the reasoning. The dangerous failure mode is no longer the typo or the sloppy loop. It's code that is articulate and confidently incorrect. A function that handles the case the agent imagined, not the case you actually have. Logic that's right for the general problem and wrong for your specific one. Agents are brilliant at solving the problem as stated and blind to the problem as it really exists in your messy system.

So here's a technique you can use on Monday. Before you read a line of the diff, write down in your own words what this PR is supposed to do. Then check the code against *your* statement, not the PR description. The description was probably written by the same agent that wrote the code, and it will steer you toward the agent's framing of the problem, which is exactly the framing you're trying to verify. If the agent misunderstood the task, its description misunderstands it too, with total confidence. Read the intent from the ticket first. Then check whether the code does that, ignoring how nice it looks while you do.

### Look hard at what's missing

Agents over-index on the happy path. They produce the feature and skip the parts that don't show up in a quick demo: the error handling, the empty state, the retry logic, the thing that happens when the network blips. The bug isn't in the code that's there. It's in the code that isn't.

Ask the old questions with new urgency. Where are the failure cases? What's the behavior when this is unavailable? Did anyone test the unhappy path, or just assert that the happy path is happy?

### Treat security as guilty until proven innocent

Picture an authorization check that confirms the user is logged in and owns the resource. It's clean, it's tested, and it's correct for the two roles the agent imagined. It just never considered that your system has an "org admin" who can act on resources they don't personally own, and a "support" role that can read but never write. The check isn't sloppy. It's complete and confident for a permission model that isn't yours. That's the shape of an AI security bug: not a missing check, a check built for a simpler world than the one you actually run. Anything touching auth, input handling, money, or user data deserves a slow, suspicious read against your real rules, not the plausible default ones.

### Watch for stale and invented

Two specific tells worth training yourself on. **Stale patterns:** the agent confidently uses a library version, API, or convention that your codebase moved off of a year ago. It's not wrong in general, it's wrong for you. **Invented APIs:** occasionally a function or option that looks completely real but doesn't exist, or doesn't do what the name implies. Both read as authoritative, and both are caught only by knowing your actual stack.

### Don't waste review on what agents do well

The flip side. Agents are genuinely good at formatting, boilerplate, idiomatic syntax, and following an established pattern. Stop spending review attention there. Every minute admiring clean formatting is a minute not spent on the logic that's quietly wrong.

---

## Using AI to Review AI

The obvious move is to put an agent on the other side of the table too, and you should. An AI reviewer is tireless, fast, and genuinely useful for the first pass: catching the obvious bug, flagging the missing null check, noticing the test that doesn't assert anything. Run it. It will make your human reviews start from a better place.

But understand what it can't do. An AI reviewer doesn't know that this module is fragile because of an incident two years ago. It doesn't know your team decided to stop using that pattern, that this service has a quiet handshake with another team's system, that "correct" here means something specific to your business that lives in nobody's documentation. You can feed a custom review agent some of that context, and you should. It's still an agent, though, and that matters more than it looks.

And there's a trap waiting here that almost nobody admits to. The agent wrote the PR. Then the reviewer, busy and trusting, pastes the same diff into the same model and asks "anything wrong with this?" The model says it looks good, because of course it does. Now look at what actually happened. No human ever understood the code. Two agents had a polite conversation and two humans nodded along at the ends of it. It feels like the work was reviewed. Nothing was reviewed. You have two agents in a trench coat pretending to be a software process.

Guard against this above all, because it's invisible and it feels productive. The whole value of review is a human mind entering the loop. If the human's only move is forwarding the diff to a model and relaying the answer, the loop never closed. So the layers have to do genuinely different jobs. Let an agent do the tireless mechanical pass, the null checks and the obvious bugs. Then a human does the part no model can do for them: hold the code against the real system, the real history, the real intent, and actually decide. The agent's review is an input to that judgment, not a substitute for it. We spent this whole post learning not to trust fluent confidence. That applies to the reviewer too.

---

## What This Does to Your Process

A few team-level consequences fall out of all this.

**Small PRs stopped being optional.** When code is generated fast, the temptation is to ship it in big batches. Resist hard. Review is now the bottleneck and the value, and giant PRs make good review impossible. If it can't be carefully reviewed in thirty minutes it's too big, and "an AI wrote it quickly" is not a reason to make it bigger.

**Review capacity is now the bottleneck.** Generate code much faster while reviewing at the same speed and you haven't removed the bottleneck, you've moved it onto the reviewers and walked away. Reviewing is core work now, not overhead. It belongs in capacity planning and in how you evaluate engineers. The best reviewer on your team may be worth more than the fastest generator, and your org chart probably doesn't reflect that yet.

**The reciprocity that held review together is gone.** This one is quiet and matters more than it looks. Review ran on an unspoken deal: the author spent three days writing the code, so the reviewer felt obligated to spend an hour reading it carefully. That rough reciprocity is what made thorough review feel fair. Now the author spends ninety seconds prompting and the reviewer still spends the hour, doing more work than the author did, on code the author may not fully understand. That resentment is real and new, and if you ignore it your best reviewers will quietly start rubber-stamping in self-defense. The fix isn't guilt. It's making the author do the understanding first, so the work that reaches review is work a human already stands behind.

**Provenance norms help.** It's fair to expect a quick note on how hard the author actually checked the code. Not as blame, as aim: "read it closely, unsure about the concurrency bit" tells a reviewer exactly where to look.

**Rubber-stamping is now actively dangerous.** "LGTM" on human code was lazy. "LGTM" on a fluent, confident, well-formatted agent PR is how subtly wrong code walks straight into production wearing a nice suit. The cost of a shallow review went up, because the code got better at looking finished before it is.

---

## The Case Against Reviewing Harder

I should be honest about the limits of my own argument. If agents generate code faster than humans can review it, then scaling up human review is rearranging deck chairs. You can't out-read a machine that writes faster than you read. At some point "just review more carefully" stops being a strategy and becomes a wish. The people making that case point in two directions, and they're both right.

Push the rigor *upstream*, before the code exists. Tighter specs the agent has to satisfy. Strong types that make whole categories of wrong code impossible to write. Property and acceptance tests that *you* wrote, not the agent, so passing them actually means something. The earlier you pin down what "correct" means, the less you depend on a human to spot its absence later.

Push the safety *downstream*, after the merge. Feature flags, progressive rollouts, fast and boring rollback, observability sharp enough that a bad change pages you in minutes instead of surfacing in a customer complaint next week. If reverting a mistake is cheap, a missed bug in review is a smaller catastrophe.

So why still argue that review is where the value concentrated? Because upstream and downstream both narrow the problem and neither closes it. Specs and types catch the mechanical wrong, not the subtly-wrong-for-your-business wrong. Rollback limits the blast radius but never makes the bug not exist. Review remains the one place where human judgment about *your specific system* enters a process that increasingly runs without it. It matters most. It just can't be the only thing you do. Bet everything on heroic human review and nothing on specs, types, and rollback, and you've picked the local optimum and missed the global one.

---

## You Can't Review What You Couldn't Author

Here's the question that keeps me up, and it's a leadership question, not a technical one.

Where does reviewing judgment actually come from? It comes from doing the hard work yourself. From writing the tricky thing, debugging it without help, reading code closely enough that it teaches you something. From having made the off-by-one error, shipped it, gotten paged, and felt it. You don't learn to spot fragile code from a checklist. You learn it by being burned by your own, for years.

Aviation already learned this one the hard way. Pilots who lean on the autopilot lose the hand-flying skill that saves the plane when the automation quits, and in the worst cases they couldn't recover when it did. So the industry now pushes pilots to switch the automation off and hand-fly on a regular basis, on purpose, even though it could fly itself, purely to keep the skill alive. Software is heading for its own version of that.

In the old world, juniors authored and seniors reviewed, and that was a ladder. You wrote the simple code, someone senior caught your mistakes, and you slowly absorbed the judgment to eventually catch them yourself. Now the agent authors and the human reviews from day one. We're asking people to review code they could not yet have written, to exercise judgment they haven't had the chance to build, on a ladder we just removed the bottom rungs from.

I don't have a clean answer. But I know it isn't "let the juniors rubber-stamp agent output until they're magically senior," because that path produces reviewers who never developed the thing review depends on. If you lead a team, this is the part to actually worry about. Make people do the hard work by hand sometimes, write the tricky thing, debug it cold, read the diff before asking the model, even when the agent could do it faster. That's where reviewers come from. The short-term cost is a slower PR. The long-term cost of skipping it is a team that can no longer tell when the machine is wrong.

---

## Where to Start

You don't need to overhaul everything, and a five-point program would be its own kind of slop. So just two things, this week.

First, say out loud who owns a PR. Whoever opens it owns every line, and "the agent wrote it" transfers exactly none of that. Second, on your next agent-authored PR, run the inversion from earlier: state the intent in your own words first, then read against that. That one habit catches more than any checklist. Everything else in this post is elaboration on those two moves.

The fundamentals of good review didn't change. Be thorough, be kind, talk about the code and not the person, catch what the machines can't. What changed is who's in the loop. For as long as we've written software, a human understood the code before it shipped, and review just confirmed it. That's no longer guaranteed, and review is now the place where a human understands the code for the first time, or the place where nobody does. The job didn't get easier and it didn't get smaller. It got handed the one thing the machines still can't do, and the whole system now leans on whether you actually do it or only look like you did.

---

## References

- [Google Engineering Practices: Code Review](https://google.github.io/eng-practices/review/)
- [Conventional Comments](https://conventionalcomments.org/)
- [Agentic Engineering: A Practical Guide](/blog/agentic-engineering-practical-guide)
- [Code Review Culture: Building Constructive Feedback Loops](/blog/code-review-culture)
