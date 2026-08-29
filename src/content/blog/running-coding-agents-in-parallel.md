---
title: "Running Coding Agents in Parallel: The Bottleneck Moved"
excerpt: "Git worktrees made it trivial to run five agents at once, and every tool now ships a fleet mode. But the numbers say parallel agents make teams slower, not faster. Here's what actually breaks at N > 1, and how to size a fleet to the only limit that matters."
date: "2026-08-29"
tags: ["agentic-engineering", "artificial-intelligence", "developer-tools", "git", "engineering", "claude"]
published: true
---

A few weeks ago I had three coding agents going at once. Three git worktrees, three terminal tabs, three features that had nothing to do with each other: saved searches, a retry path in billing, and a CSV export that nobody had asked for in two years but kept showing up in support tickets. I'd start one, switch tabs, start the next, and by the time I came back around the first one had something working.

For about two hours it was the most productive I have ever felt at a keyboard.

Then I tried to merge it, and the afternoon went sideways. All three branches had been cut from the same commit. Each one, read on its own, was fine. Read together, they were three different opinions about how the same module should be organized. Two had invented their own error-handling wrapper. The third had moved a file the other two were importing from. Git merged all of it without complaint, which was exactly the problem.

I've been thinking about that afternoon a lot, because the industry has spent this year building tooling for precisely the thing that bit me. Git worktrees went from a git feature almost nobody used to the standard way to isolate parallel agents in about eighteen months. GitHub shipped `/fleet` in Copilot CLI in April. Open GitHub Trending on a random day this month and the board is mostly orchestrators. The framing that comes with all of it is roughly the same: agents are good enough now that a single engineer can keep five, ten, a hundred of them busy, so the interesting problem is running the fleet.

I don't think running the fleet is the problem. I think the bottleneck moved somewhere much less interesting to build tooling for, and we happen to have unusually good data about where it went.

## The pattern, minus the branding

Underneath the various orchestrators, the shape is the same everywhere.

Each agent gets its own working directory so two of them can't overwrite the same file. `git worktree` does this natively: multiple branches from one repository, checked out into separate directories at the same time, all sharing a single `.git`.

```bash
git worktree add -b agent/saved-search ../wt-saved-search main
git worktree add -b agent/billing-retry ../wt-billing-retry main
git worktree add -b agent/csv-export   ../wt-csv-export   main
```

Three directories, three branches, three agents that can't step on each other. That's the primitive, and essentially every tool in this space is built on it.

Then something decomposes the work into items, figures out which ones are independent, and hands each to an agent. It watches for failures and decides whether one dead track stops everything or the rest keep going. That's the orchestration layer, and it's genuinely useful.

And then every track produces a branch, and the branches have to become one thing.

```
                    main @ abc123
                          |
        +-----------------+-----------------+
        |                 |                 |
   wt-saved-search    wt-billing      wt-csv-export
      agent A           agent B          agent C
        |                 |                 |
      PR #41            PR #42           PR #43
        |                 |                 |
        +-----------------+-----------------+
                          |
                      ???
```

Steps one and two got a lot of engineering attention this year. Step three got a merge queue and some optimism.

## What the data says

I want to be careful here, because "actually, AI makes you slower" is a genre of take I have very little patience for. The tools work. I use them every day and I'm not giving them up. But the measurements on agentic and parallel workflows are consistent enough across independent sources that they're worth sitting with.

LinearB's 2026 benchmarks covered 8.1 million pull requests across 4,800 engineering teams. The number everyone quotes is that agentic pull requests waited 5.3x longer to get picked up for review than unassisted ones, 1,055 minutes against 201. The number I find more revealing is buried further down: reviewers accepted bot-authored code 32.7% of the time, compared to 84.4% for human-authored code. Put those together with the finding that AI-assisted PRs ran about 2.6x larger, and you don't have a statistic so much as a description of reviewer behavior. People are looking at a queue full of big diffs where the odds of the diff being good are roughly a third of what they're used to. Of course they open those last.

Faros AI's 2026 telemetry across 22,000 developers found the same thing from a different direction. Median code review time up 441.5%, while task throughput rose 33.7%. Throughput did go up. It did not go up 441%. The number in that dataset I keep coming back to is that 31% more pull requests merged with no review at all, which is what a saturated queue looks like from the inside.

Then there's METR's randomized trial, which is the study people either love or dismiss depending on what they already believed. Sixteen experienced developers, 246 issues on their own repositories, randomly assigned to allow or forbid AI tools. They took 19% longer with the tools. Afterward they estimated they'd been about 20% faster. It's a small study and it's from 2025, so I wouldn't hang an argument on it alone. But that gap between felt speed and measured speed matches my Friday afternoon closely enough that I've stopped waving it away.

Anthropic's own trends report this year adds a boundary that I think is the most useful number of the lot: developers use AI in roughly 60% of their work, but report being able to fully delegate only 0 to 20% of tasks. If four out of five agent outputs still need a person to close the loop, then the number of agents you can usefully run is set by how fast that person closes loops. Orchestration doesn't touch that.

## What actually breaks

Worktrees eliminate file collisions on disk. They do nothing about the semantic kind. Three agents branched from the same commit are each working against a codebase that stops existing the moment the first one merges. Agent A adds a caching layer, agent B adds a write path that the cache doesn't know to invalidate, and both pull requests are correct in isolation. Git merges them cleanly. A clean merge tells you the text reconciled. It says nothing about whether the behavior did, and that's the failure mode I hit and the one I've seen catch other people since.

The review math is the bigger issue and it's not complicated. If you can review 400 lines an hour with real attention, and each agent produces 400 lines in twenty minutes, three agents are generating work about nine times faster than you can absorb it. You can respond by reviewing faster, which means reviewing worse, and that's how a team ends up in the 31% merged-without-review bucket. Or the queue grows until you stop launching agents. I haven't found a third option where the fleet gets bigger.

Then there's the category that costs everyone an afternoon exactly once. Worktrees isolate tracked files and nothing else. Your `.env` is gitignored, so it doesn't come along. Neither does `node_modules`. Three agents each starting a dev server will all try to bind port 3000. The one that actually got me was migrations: three agents running against the same local Postgres, cheerfully destroying each other's schema, and the failure surfaced as test failures in a worktree that hadn't done anything wrong. I spent longer than I want to admit debugging the innocent one.

Cost is the quiet fourth thing. Each parallel agent carries its own context window and burns tokens independently, and they're all re-deriving the same understanding of your codebase from scratch. Three agents on one task family is roughly 3x the spend. Sometimes that's a fine trade. It's better as a decision than as a surprise.

## Sorting by task shape

The useful question isn't how many agents you can run, it's whether the work actually fans out. What I've found matters most is whether the tracks share a definition of correctness.

Things that parallelize well:

- **Breadth-first research.** Investigating four modules to understand how something fits together. Nothing gets written, so nothing collides, and the results merge in your head rather than in git.
- **Mechanical changes across a lot of files.** A rename, a lint rule rollout, a dependency bump with call-site fixes. The shape of the change is known before it starts.
- **Genuinely separate surfaces.** Features touching disjoint modules with no shared schema, config, or types. My three-worktree afternoon failed this test and I didn't check.
- **Multi-repo work.** Separate repositories are the cleanest isolation boundary that exists, and there's no merge step at the end.

Things that don't, regardless of what the orchestrator claims:

- **Anything sharing a schema or a migration.** Two agents writing migrations against the same table means manual reconciliation, guaranteed. Serialize it.
- **Features in the same module.** They'll each invent conventions, and you'll keep one and rewrite the other.
- **Exploratory work.** If you don't yet know what correct looks like, three parallel attempts give you three things to evaluate before you have any basis for evaluating them.

There's a related distinction that gets blurred constantly, and it's worth keeping straight because the tools are precise about it even when the blog posts aren't. Subagents and parallel sessions do different jobs. A subagent runs inside your session with fresh isolated context - it doesn't see your conversation history or the files you've already read - does some verbose work, and hands back a summary. That's a context management tool, and it's ideal for research fan-out where you want findings without the transcript. Claude Code caps these at 20 concurrent by default, adjustable through an environment variable:

```json
{
  "env": {
    "CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS": "30"
  }
}
```

Separate sessions in separate worktrees are the other thing entirely: independent context windows doing independent work that somebody has to integrate later. That's the fleet. The reason to keep them separate in your head is that "20 concurrent subagents" reads like the tooling supports twenty parallel features. It supports twenty parallel investigations, which asks nothing of your review capacity. Twenty parallel features would ask for everything.

## What I'd actually set up

Script the worktree creation, including all the parts git doesn't handle for you. The gitignored files are the whole gotcha.

```bash
# wt <name> - create a worktree an agent can actually run in
wt() {
  local name="$1"
  local dir="../wt-$name"

  git worktree add -b "agent/$name" "$dir" main || return 1

  cp .env "$dir/.env"                          # gitignored, doesn't follow
  echo "PORT=$((3000 + RANDOM % 1000))" >> "$dir/.env"
  echo "DATABASE_URL=postgres://localhost/app_$name" >> "$dir/.env"

  createdb "app_$name" 2>/dev/null
  (cd "$dir" && npm ci --prefer-offline --silent)

  echo "ready: $dir"
}
```

Four lines of that exist because of bugs that cost me real time. The per-worktree port and the per-worktree database are the difference between three agents working and three agents quietly corrupting each other in ways that look like flaky tests.

Write the shared decisions down before the fleet starts. This is where the [spec habit](/blog/spec-driven-development-without-the-hype) stops being optional for me. One agent can infer conventions from whatever code it happens to read. Three agents in three worktrees will each infer slightly different conventions from slightly different corners of the codebase, and you find out at merge time. A single page naming which track owns the migration, what the types look like at the boundaries, and which module owns what costs five minutes and heads off the exact class of conflict git can't see.

Merge into an integration branch rather than straight to main.

```
main
 └── integrate/saved-search
       ├── agent/api        → PR into integrate
       ├── agent/ui         → PR into integrate
       └── agent/migration  → PR into integrate
```

Each track rebases onto `integrate` before its PR, so the third one lands on a base that includes the first two instead of on the stale commit it was cut from. Then one review of the assembled thing goes to main. Merge in dependency order while you're at it, schema before the code that uses it before the UI. Obvious written down, easy to forget when three tracks all report "done" within the same minute.

The last piece is an integration pass. Once the tracks are assembled, point one agent at the combined diff with a narrow brief: find the places where these changes are individually correct but collectively inconsistent. Duplicated helpers, two competing error-handling conventions, a cache that doesn't know about a new write path. It's one of the few review tasks I'm comfortable delegating, because it's pattern-matching across a diff rather than judgment about intent, and it's the only part of the fan-in that gets easier rather than harder as the fleet grows.

## Sizing it

The rule I've settled on is that fleet size is review throughput divided by per-agent output rate. It isn't a property of your machine, your subscription tier, or your orchestrator.

In practice that puts most people somewhere between two and four concurrent writing agents, which lines up with what teams generally report: four to eight worktrees is where individuals top out, and past that the constraint is review, not the model. Research fan-out is a completely different budget and can go much wider, because reading five summaries is cheap and merging five branches is not.

There's a quicker test, and it's a slightly uncomfortable one. Look at your open agent-authored pull requests right now. If any of them has been sitting for more than a day, the fleet is already too big, and adding another agent adds inventory rather than throughput. That's not a new insight, it's just the oldest lesson in operations showing up again with better tooling. Work that's finished but undelivered isn't finished.

If you want to genuinely raise the ceiling, the lever isn't the orchestrator. It's everything that makes review cheaper: smaller tracks, tighter scope, acceptance criteria written before the fan-out so you're checking against something instead of forming an opinion from scratch, and CI that catches the mechanical problems so your attention goes to intent. I wrote most of that up in [the review post](/blog/code-review-when-the-author-is-ai), and the fleet pattern is what happens when you skip it and scale anyway.

## Where I've landed

There's a version of this post that concludes parallel agents are hype, and I don't believe that. The isolation primitives are real and good. Worktrees solve something that genuinely used to make parallel work miserable, mechanical migrations across a large codebase are meaningfully better than they were a year ago, and research fan-out has changed how I explore code I don't know.

But "one engineer, a hundred agents" is measuring how much code gets produced, and production was never the constraint. The constraint is the point where a person takes responsibility for what's about to run in front of customers, and that has a throughput no orchestrator improves.

Every wave of tooling finds a bottleneck, moves it, and gets celebrated for the move. This one moved it from typing to judgment, which I'd take again without hesitating. It just means the question worth asking in 2026 isn't how many agents you can run at once. It's how quickly you can be confident about what they did.

Personally, I run three. And I try to clear the queue before I start a fourth, which I'd like to say I manage every time.

---

## References

- [git worktree](https://git-scm.com/docs/git-worktree) - the official docs for the isolation primitive everything else is built on
- [Claude Code subagents](https://code.claude.com/docs/en/sub-agents) - concurrency limits, context isolation, and when to use a subagent versus a separate session
- [LinearB 2026 Software Engineering Benchmarks](https://linearb.io/resources/engineering-benchmarks) - 8.1M pull requests on pickup time, PR size, and bot-authored acceptance rates
- [Faros AI research](https://www.faros.ai/research) - 2026 telemetry on review duration and unreviewed merges
- [METR: Measuring the impact of AI on experienced open-source developer productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) - the randomized trial behind the 19% figure
- [Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report) - on delegation ceilings and the shift to agent teams
- [Spec-Driven Development, Without the Hype](/blog/spec-driven-development-without-the-hype) - the upstream half of the fan-in problem
- [Code Review When the Author Is an AI Agent](/blog/code-review-when-the-author-is-ai) - why review throughput is the constraint
