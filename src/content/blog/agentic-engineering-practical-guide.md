---
title: "Agentic Engineering: A Practical Guide to Working With AI Agents"
excerpt: "Agentic engineering is how software gets built now. Here's what it actually means, how it works under the hood, and how to set up your projects to get the most out of it."
date: "2026-04-11"
tags: ["artificial-intelligence", "developer-tools", "agentic-engineering", "claude", "engineering"]
published: true
---

I've been using Claude Code for some of my personal fun projects recently, and the workflow feels genuinely different from what I'm used to. Instead of writing every line myself, I describe what I want, the agent figures out the steps, and I review the result. The human is still very much in the loop - making architectural decisions, reviewing changes, catching edge cases - but the mechanics of how code gets written are shifting.

This shift has a name now: agentic engineering. You've probably seen "agentic AI" in the news - Gartner says 40% of enterprise apps will use AI agents by the end of 2026, and every major AI lab has shipped an agent framework. But "agentic AI" is the broad term that covers everything from customer service bots to supply chain automation. Agentic engineering is the more specific idea that matters to us as software engineers: AI handles more of the implementation, while engineers focus on architecture, quality, and correctness. It's the evolution past "vibe coding" into something more disciplined and deliberate.

There's a gap between the hype and the practical understanding, though. Most content either stays at a high level - "agents will transform everything" - or jumps straight into framework-specific code that assumes you already know the fundamentals. Not a lot of material explains what's actually happening, why it matters, and how to get good at working this way.

That's what this post is for. We'll start with what "agentic" actually means under the hood, and then get into the practical setup that makes the difference between inconsistent results and reliably good ones.

I'll use Claude Code for the examples throughout because it's what I've been reaching for in my own projects and it makes the concepts concrete. But the ideas - how to frame tasks, how to structure your project for agents, the difference between skills and custom agents - apply broadly. Whether you're using Cursor, Copilot, Windsurf, or something else, the fundamentals of agentic engineering are the same.

## What "Agentic" Actually Means

Most AI interactions are one-shot. You ask a question, you get an answer. A chatbot works this way. You type "what does this error mean?" and it responds.

An agentic tool is different. Instead of answering a question, it completes a task. And completing a task usually requires multiple steps that the AI figures out on its own.

Here's the difference:

**Chatbot (one-shot):**

```
You: "What does this error mean?"
AI: "That error means your database connection timed out because..."
Done.
```

**Agent (multi-step):**

```
You: "Fix the database timeout errors in the checkout flow."
AI: 
  → searches codebase for checkout-related files
  → reads the database connection config
  → finds the timeout is set to 5 seconds
  → checks the query that's timing out
  → notices it's missing an index
  → reads the migration files to understand the schema
  → creates a new migration adding the index
  → updates the timeout to a more reasonable value
  → runs the tests to make sure nothing broke
Done.
```

Nobody told the AI to do those specific steps. It figured out the sequence by looking at the code, reasoning about the problem, and deciding what to do next. That "figure out what to do, do it, check the result, decide what's next" loop is what makes it agentic.

## The Loop Behind the Scenes

When you give Claude Code a task, here's what's actually happening:

```
Your prompt
    ↓
Claude reads it and thinks: "What do I need to do first?"
    ↓
Calls a tool (read a file, search the codebase, run a command)
    ↓
Sees the result
    ↓
Thinks: "Based on what I just learned, what should I do next?"
    ↓
Calls another tool (maybe several in parallel)
    ↓
... repeats until the task is done ...
    ↓
Gives you the final result
```

The tools Claude Code has access to include reading files, editing files, searching for patterns, running shell commands, and browsing the web. It picks which ones to use and in what order based on the task. It can also call multiple tools at the same time when steps are independent - like reading three different files in parallel rather than one at a time.

This is the same loop that every "AI agent" framework is built on. The difference is that Claude Code handles all of it for you. You don't write the loop. You don't define the tools. You don't manage the state. You just describe what you want.

## You Don't Need Code to Use Agents

This is the part that trips people up. There's so much content about "building AI agents" with SDKs and frameworks that people assume they need to write code to get agentic behavior. If you're using Claude Code, you don't.

Want an agent that finds all the TODO comments in your codebase and addresses them? You don't write a script for that. You just say:

> "Find all TODO and FIXME comments in the codebase. For each one, either fix the issue described or create a clear plan for what needs to be done."

Claude Code will search for the comments, read the surrounding code for context, figure out what each TODO is asking for, and start working through them. It's running an agentic loop under the hood - searching, reading, reasoning, editing - but from your perspective, you just described what you wanted.

Here are more examples of agentic tasks you can do right now without writing any agent code:

**Code review:**
> "Review the changes on this branch compared to main. Flag any bugs, security issues, or missing tests."

It will run git diff, read the changed files, analyze them, and give you a structured review.

**Refactoring:**
> "The user authentication logic is scattered across three files. Consolidate it into a single auth module with clear interfaces."

It will find the relevant files, understand the current structure, plan the refactoring, make the changes, and update the imports everywhere.

**Debugging:**
> "The /api/orders endpoint returns a 500 error when the cart is empty. Find and fix the bug."

It will trace through the code, find the handler, identify the null check that's missing, fix it, and add a test.

**Documentation:**
> "Generate API documentation for all the public endpoints in the routes directory."

It will find the route files, read each one, understand the request/response shapes, and produce documentation.

In every case, Claude Code is running dozens of tool calls behind the scenes. It's reading files, searching, editing, running commands, checking results. You just see the outcome.

## What's Happening Under the Hood

Let's take the TODO example and look at what Claude Code is actually doing when you type that prompt. Under the hood, the system is running a loop against the Claude API that looks something like this:

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Simplified versions of Claude Code's built-in tools.
// You never write this yourself - it's just what's running behind the scenes.
const tools: Anthropic.Tool[] = [
  {
    name: "Grep",
    description: "Search file contents using regex patterns.",
    input_schema: {
      type: "object",
      properties: {
        pattern: { type: "string" },
        path: { type: "string" },
      },
      required: ["pattern"],
    },
  },
  {
    name: "Read",
    description: "Read a file's contents.",
    input_schema: {
      type: "object",
      properties: {
        file_path: { type: "string" },
      },
      required: ["file_path"],
    },
  },
  {
    name: "Edit",
    description: "Replace text in a file.",
    input_schema: {
      type: "object",
      properties: {
        file_path: { type: "string" },
        old_string: { type: "string" },
        new_string: { type: "string" },
      },
      required: ["file_path", "old_string", "new_string"],
    },
  },
];

const messages: Anthropic.MessageParam[] = [
  {
    role: "user",
    content: "Find all TODO and FIXME comments. Fix each one or create a plan.",
  },
];

let response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 4096,
  tools,
  messages,
});

// The agentic loop. Keeps running until Claude decides it's done.
while (response.stop_reason === "tool_use") {
  const toolResults: Anthropic.ToolResultBlockParam[] = [];

  // Claude may call multiple tools in a single turn
  for (const block of response.content) {
    if (block.type === "tool_use") {
      const result = executeTool(block.name, block.input);
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: result,
      });
    }
  }

  messages.push({ role: "assistant", content: response.content });
  messages.push({ role: "user", content: toolResults });

  response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    tools,
    messages,
  });
}
```

And here's what the actual execution looks like for the TODO task:

```
Turn 1:  Claude calls Grep({ pattern: "TODO|FIXME" })
         → gets back a list of matches with file paths and line numbers

Turn 2:  Claude calls Read({ file_path: "src/api/orders.ts" })
         and Read({ file_path: "src/utils/cache.ts" }) in parallel
         → sees both files to understand context around each TODO

Turn 3:  Claude calls Edit({ file_path: "src/api/orders.ts", ... })
         → fixes the issue the first TODO was describing

Turn 4:  Claude calls Edit({ file_path: "src/utils/cache.ts", ... })
         → addresses the second TODO

... continues until all TODOs are handled ...

Final:   stop_reason switches to "end_turn"
         Claude returns a summary of everything it did
```

Each turn is an API call where Claude sees the full conversation history - the original prompt, every tool call it's made, every result it's seen - and decides what to do next.

You never write this code when using Claude Code. But understanding the loop helps you work with it more effectively. When the agent seems stuck or takes an unexpected path, it's because of what happened in this loop - the model saw something in a tool result that changed its plan, or it didn't have enough context to make the right call. That's when you step in with more context or a course correction.

## How to Get Better Results

Agentic engineering is powerful, but the quality of the output depends a lot on how you frame the task. Here's what I've picked up so far.

### Be Specific About the Goal, Not the Steps

Tell the agent what you want to achieve, not how to achieve it. It's better at figuring out the steps than you might expect, and being too prescriptive can actually make things worse.

**Less effective:**
> "Open src/utils/auth.ts, find the validateToken function, check if it handles expired tokens, if not add a check on line 47."

**More effective:**
> "The app doesn't handle expired auth tokens gracefully. Users get a generic error instead of being redirected to login. Fix this."

The second prompt lets the agent explore the codebase and find the right approach. The first one assumes you already know exactly where the problem is and what the fix looks like - and if you're wrong about either, the agent is stuck following bad instructions.

### Give Context About Why

The agent makes better decisions when it understands the purpose, not just the task.

**Without context:**
> "Add error handling to the payment module."

**With context:**
> "We've been getting intermittent failures from the payment provider's API. Add retry logic with exponential backoff for transient errors, and make sure we're not double-charging customers if a timeout happens mid-transaction."

The second version tells the agent what problem you're solving and what constraints matter. It'll make much better design decisions as a result.

### Break Big Tasks Down

Agents handle focused tasks better than sprawling ones. If you ask for "refactor the entire backend to use the new database schema," you'll get inconsistent results. If you break it into pieces, each one gets proper attention.

Instead of one massive prompt, try:
1. "Update the user model to match the new schema."
2. "Update all queries in the user service to work with the new model."
3. "Update the tests to reflect the schema changes."
4. "Check for any other references to the old field names across the codebase."

Each task is focused enough that the agent can do a thorough job. And you can review the output at each step before moving on.

### Course-Correct When Needed

The agent won't always take the path you expected. That's fine. You can interrupt it at any point - press Escape to cancel a tool call in progress, then give it feedback.

> "That's not the right approach. The auth check should happen in the middleware, not in each handler. Try again."

Claude Code will adjust its plan based on your feedback and continue from there. Think of it like pairing with a colleague. You don't need to let them finish a wrong approach before saying something.

### Review the Work

This might be obvious, but it's worth saying. The human in the loop matters. Agents can do impressive work, but they don't have your full context about the business, the team's priorities, or the subtle reasons behind certain design choices.

Treat agent output the way you'd treat a pull request from a capable colleague who's new to the codebase. Review the changes, run the tests, check the edge cases. The agent handles a lot of the implementation work, but the engineering judgment is still yours.

## Setting Up Your Project for Agentic Engineering

This is where most people stop short. They use Claude Code interactively and get decent results, but they don't set up the configuration files that make the agent consistently good. It's the difference between onboarding a contractor with a Slack message and onboarding them with proper documentation.

Claude Code reads a set of markdown files to understand your project, your conventions, and your preferences. Setting these up properly is the single biggest thing you can do to improve your results.

### CLAUDE.md: Your Project's Onboarding Doc

This is the main one. Put a `CLAUDE.md` file in your project root (or at `.claude/CLAUDE.md` if you prefer keeping things in one directory), and Claude Code reads it automatically at the start of every session. Think of it as the document you'd write for a new engineer joining the team.

```markdown
# Build and Test

- `npm run build` to compile the project
- `npm test` runs the full test suite
- `npm run test:unit` for unit tests only
- `npm run lint` before committing

# Project Structure

- API handlers: src/api/handlers/
- Business logic: src/services/
- Database layer: src/repositories/
- React components: src/components/
- Tests mirror the src/ structure under __tests__/

# Conventions

- Use the Winston logger from src/lib/logger.ts, never console.log
- API routes follow: /api/v2/{resource}/{action}
- All new functions need tests in the corresponding __tests__ directory
- Database queries go through the repository layer, not directly in handlers
- Error responses use the ApiError class from src/lib/errors.ts
- Use snake_case for database columns, camelCase everywhere else

# Architecture Decisions

- We use the repository pattern to abstract database access
- Auth uses JWT tokens with refresh rotation
- Background jobs go through the Bull queue, not setTimeout
- We're migrating from Express to Fastify - new routes should use Fastify
```

**When to add something to CLAUDE.md:** If Claude makes the same mistake twice, put the correction here. If a code review catches something Claude should have known, add it. If you keep typing the same clarification at the start of sessions, that belongs in the file.

**Keep it focused.** Aim for under 200 lines. Everything in this file goes into the agent's context on every request, so bloated files waste tokens and dilute the important stuff. If your CLAUDE.md is getting long, move topic-specific content into rules files (covered below).

**Quick start:** Run `/init` in Claude Code. It analyzes your codebase and generates a starting CLAUDE.md with build commands, project structure, and common patterns. Then add what it can't discover on its own - architecture decisions, team conventions, the "why" behind unusual patterns.

### CLAUDE.local.md: Your Personal Preferences

This file lives next to CLAUDE.md in the project root, but it's for personal preferences you don't want to commit to git. You'll need to add it to your `.gitignore` manually.

```markdown
# My Preferences

- I prefer verbose git commit messages with bullet points
- When refactoring, show me the plan before making changes
- I'm not familiar with the payments module - explain changes there in detail
- Run tests after every code change
```

This is useful when multiple people on the team use Claude Code but have different working styles. The shared conventions go in `CLAUDE.md`, your personal preferences go in `CLAUDE.local.md`.

### .claude/rules/: Organized, Topic-Specific Guidelines

As your project grows, cramming everything into a single CLAUDE.md gets unwieldy. The `.claude/rules/` directory lets you split guidelines into focused files organized by topic.

```
your-project/
├── CLAUDE.md                  # Core project info: build commands, structure
├── CLAUDE.local.md            # Your personal preferences (gitignored)
└── .claude/
    └── rules/
        ├── code-style.md      # Naming, formatting, patterns
        ├── testing.md          # Testing conventions and requirements
        ├── api-design.md       # API patterns and endpoint conventions
        ├── security.md         # Security requirements
        └── frontend/
            ├── react.md        # React-specific rules
            └── styling.md      # CSS/styling conventions
```

Each file is a focused document on one topic:

```markdown
# testing.md

- Every new function needs at least one unit test
- Use describe/it blocks, not test() directly
- Mock external services, never real API calls in unit tests
- Integration tests go in __tests__/integration/ and can hit the test database
- Name test files as {module}.test.ts
- Test the happy path, one error case, and one edge case at minimum
```

```markdown
# api-design.md

- All endpoints return { data, error, meta } envelope
- Use HTTP status codes correctly: 201 for creation, 204 for deletion
- Pagination uses cursor-based pagination, not offset
- Rate limiting is handled at the gateway, don't implement it in handlers
- Validate request bodies with Zod schemas in src/api/schemas/
```

Rules without path scoping load at the start of every session, just like CLAUDE.md.

### Path-Scoped Rules: Load Only When Relevant

You can scope rules to specific file paths using YAML frontmatter. These rules only load when Claude is working on matching files, keeping context lean for unrelated tasks.

```markdown
---
paths:
  - "src/components/**/*.tsx"
  - "src/components/**/*.ts"
---

# React Component Guidelines

- Use functional components with hooks, never class components
- Component files use PascalCase: UserProfile.tsx
- Co-locate styles: UserProfile.module.css next to UserProfile.tsx
- Props interfaces are named {Component}Props: UserProfileProps
- Extract hooks into use{Name}.ts when logic is reusable
- Always include a data-testid attribute on interactive elements
```

```markdown
---
paths:
  - "src/repositories/**/*.ts"
  - "src/migrations/**/*.ts"
---

# Database Guidelines

- All queries use parameterized inputs, never string concatenation
- New tables need a created_at and updated_at timestamp
- Migrations must be reversible - always include a down() function
- Use transactions for multi-table writes
- Index any column used in WHERE clauses or JOINs
```

When you're working on a React component, Claude sees the React rules. When you're working on a database migration, it sees the database rules. When you're working on something unrelated, neither set loads and the context stays focused.

### ~/.claude/CLAUDE.md: Your Cross-Project Preferences

This file lives in your home directory and applies to every project you work on. Good for personal defaults that aren't project-specific.

```markdown
# My Defaults

- I prefer TypeScript over JavaScript
- Use 2-space indentation
- I like concise commit messages on a single line
- When suggesting terminal commands, use zsh syntax
- I'm experienced with AWS and distributed systems - no need to over-explain those
- I'm less familiar with frontend testing - be more detailed there
```

This loads alongside whatever project-level files exist. Your project's CLAUDE.md handles the "how does this codebase work" part. Your personal file handles the "how do I like to work" part.

### How It All Fits Together

Here's the loading order when you start a Claude Code session:

```
Session starts
    ↓
~/.claude/CLAUDE.md                  ← your personal cross-project defaults
    ↓
./CLAUDE.md                          ← project conventions (shared with team)
    ↓
./CLAUDE.local.md                    ← your personal project preferences (gitignored)
    ↓
./.claude/rules/*.md                 ← all rule files without path scoping
    ↓
Session is ready. You start working.
    ↓
./.claude/rules/react.md             ← path-scoped rules load on-demand
(only when Claude touches matching files)
    ↓
./src/components/CLAUDE.md           ← subdirectory CLAUDE.md files load on-demand
(only when Claude reads files in that directory)
```

All of these files are additive. They don't override each other. Claude sees everything and uses its judgment when instructions overlap.

## Skills: Reusable Playbooks

CLAUDE.md and rules files are about persistent context - things Claude should always know. Skills are different. They're reusable procedures that load only when invoked, so they don't eat up context until you need them.

Think of the difference this way: CLAUDE.md is like a team wiki that's always open on your desk. A skill is like a runbook you pull off the shelf when you need it.

### When to Use Skills

If you find yourself pasting the same multi-step instructions into Claude Code - "run the deploy checklist," "do a security audit on this module," "set up a new microservice" - that's a skill.

Skills are great for:
- Multi-step procedures (deploy checklists, migration playbooks)
- Templates with detailed instructions (PR review standards, incident response)
- Reference material that's too long for CLAUDE.md (API specs, style guides)
- Team workflows that need consistency (onboarding scripts, release processes)

### Creating a Skill

Skills live in `.claude/skills/` (project-level, shared with team) or `~/.claude/skills/` (personal, all projects). Each skill is a directory with a `SKILL.md` file:

```
.claude/skills/
├── deploy/
│   └── SKILL.md
├── security-audit/
│   └── SKILL.md
└── new-service/
    ├── SKILL.md
    └── template/
        ├── Dockerfile
        └── src/
            └── index.ts
```

Here's what a skill looks like:

```markdown
---
name: deploy
description: "Run the production deployment checklist"
allowed-tools: "Bash(npm *) Bash(git *) Bash(aws *)"
---

# Production Deploy Checklist

Run through these steps in order. Stop and report if any step fails.

1. Verify the current branch is main: `git branch --show-current`
2. Pull latest: `git pull origin main`
3. Run the full test suite: `npm test`
4. Run the linter: `npm run lint`
5. Build the production bundle: `npm run build`
6. Check for security vulnerabilities: `npm audit --production`
7. Tag the release: `git tag -a v$(node -p "require('./package.json').version") -m "Release"`
8. Deploy: `npm run deploy:prod`
9. Run smoke tests against production: `npm run test:smoke`
10. Report the results with the version number and any issues found.
```

### Invoking Skills

Once you've created the skill directory and SKILL.md file, it becomes available as a slash command. Type `/deploy` in Claude Code, and it loads the skill into context and executes it. You can also pass arguments:

```
/deploy staging
```

If you get "Unknown skill," double-check that the file exists at `.claude/skills/deploy/SKILL.md` and that the directory name matches what you're typing after the slash.

The frontmatter controls behavior:

| Field | What it does |
|---|---|
| `name` | Display name (defaults to directory name) |
| `description` | Helps Claude decide when to auto-invoke the skill |
| `allowed-tools` | Pre-approves specific tools so Claude doesn't ask permission |
| `disable-model-invocation` | If `true`, only you can invoke it (Claude won't use it automatically) |
| `paths` | Glob patterns - skill auto-activates when Claude works on matching files |
| `model` | Override the model for this skill (e.g., use Opus for complex analysis) |

Skills can include supporting files alongside SKILL.md - templates, reference docs, scripts. Reference them from your instructions and Claude will read them when needed.

## Custom Agents: Specialized Workers

Skills add instructions to your current conversation. Custom agents are different - they run in a completely separate context window with their own tools and permissions.

Use agents when:
- A side task would flood your main conversation with search results or log output
- You want specialized workers that focus on one thing (research, code review, testing)
- You need parallel work that doesn't interfere with what you're currently doing

### Skills vs. Agents: When to Use Which

| | Skills | Agents |
|---|---|---|
| **Context** | Loads into your current conversation | Runs in its own isolated context |
| **Token cost** | Shares your context budget | Has its own context budget |
| **Best for** | Procedures, templates, playbooks | Research, parallel work, focused analysis |
| **Output** | Full results in your conversation | Returns a summary, keeps details internal |
| **Invocation** | You type `/skill-name` | Claude delegates automatically when the task fits |

A simple way to decide: if the task is a procedure you want to follow step by step, use a skill. If it's work you want to hand off and get a summary back, use an agent.

### Creating a Custom Agent

Agents live in `.claude/agents/` (project, shared with team) or `~/.claude/agents/` (personal). Each agent is a single markdown file:

```markdown
# .claude/agents/code-reviewer.md

---
name: code-reviewer
description: "Reviews code changes for bugs, security issues, and style."
model: claude-sonnet-4-20250514
tools: Read, Glob, Grep, Bash
---

You are a senior code reviewer. When given a review task:

1. Read the changed files and understand the context
2. Check for:
   - Bugs and logic errors
   - Security vulnerabilities (injection, auth gaps, data exposure)
   - Missing error handling at system boundaries
   - Missing or inadequate tests
   - Performance concerns
3. Produce a structured review with severity levels (critical, warning, nit)
4. Keep your review focused and actionable - no vague feedback
```

```markdown
# .claude/agents/test-writer.md

---
name: test-writer
description: "Generates comprehensive test suites for code changes."
tools: Read, Glob, Grep, Edit, Write, Bash
---

You write thorough test suites. When given code to test:

1. Read the code and understand what it does
2. Identify the key behaviors and edge cases
3. Write tests covering: happy path, error cases, boundary conditions
4. Follow the project's existing test patterns and conventions
5. Run the tests to make sure they pass
```

Once defined, Claude Code delegates to these agents automatically when it encounters a task that matches the agent's description. If you ask "review the code changes on this branch," and your code-reviewer agent's description matches that intent, Claude will spin it up and delegate the work.

The agent works independently in its own context, then sends a summary back to your main conversation. You don't see the dozens of file reads and grep calls it made - just the final review.

## Hooks: Automated Guardrails

Hooks let you run shell commands automatically at specific points in Claude Code's lifecycle. They're not instructions for Claude - they're deterministic automation that always runs, regardless of what the model decides.

Hooks are configured in your settings file (`.claude/settings.json` for the project, `~/.claude/settings.json` for personal):

### Auto-Format After Edits

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ]
  }
}
```

Every time Claude edits or creates a file, Prettier runs automatically. No relying on Claude to remember to format. No adding "always run prettier" to your CLAUDE.md.

### Block Dangerous Commands

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/check-command.sh"
          }
        ]
      }
    ]
  }
}
```

The hook script checks every bash command before it runs. If it returns exit code 2, the command is blocked. You can use this to prevent `rm -rf`, block access to production databases, or enforce any rule that should never be violated.

### Useful Hook Events

| Event | When it fires | Good for |
|---|---|---|
| `PreToolUse` | Before a tool call executes | Blocking dangerous actions, validation |
| `PostToolUse` | After a tool call succeeds | Auto-formatting, logging, notifications |
| `Stop` | When Claude finishes a response | Validation, sending notifications |
| `UserPromptSubmit` | Before Claude processes your input | Injecting context, preprocessing |

Hooks are powerful because they're deterministic. CLAUDE.md says "please format the code." A hook says "the code will be formatted, every time, automatically."

## MCP Servers: Connecting External Tools

Claude Code's built-in tools cover files, search, and shell commands. For everything else - databases, APIs, browsers, internal services - you connect MCP (Model Context Protocol) servers.

MCP servers work directly with Claude Code. You don't need the Agent SDK for this. Configure them in `.mcp.json` at your project root:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

Once configured, Claude Code can query your database, interact with GitHub issues and PRs, or use any other MCP-compatible tool - all from natural language prompts.

You can also add MCP servers from the command line:

```bash
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres
```

Some useful MCP servers to know about:

- **@modelcontextprotocol/server-postgres** - query Postgres databases
- **@modelcontextprotocol/server-github** - interact with GitHub repos, issues, PRs
- **@playwright/mcp** - browser automation and testing
- **@modelcontextprotocol/server-slack** - read and send Slack messages

The ecosystem is growing fast. Check [modelcontextprotocol.io](https://modelcontextprotocol.io/) for the full list.

## The Full Picture

Here's what a well-configured project looks like with everything in place:

```
your-project/
├── CLAUDE.md                          # Project context (build, structure, conventions)
├── CLAUDE.local.md                    # Your personal preferences (gitignored)
├── .mcp.json                          # MCP server connections
│
└── .claude/
    ├── settings.json                  # Hooks, permissions (shared with team)
    ├── settings.local.json            # Personal settings overrides (gitignored)
    │
    ├── rules/                         # Topic-specific guidelines
    │   ├── testing.md
    │   ├── api-design.md
    │   ├── security.md
    │   └── frontend/
    │       └── react.md               # Path-scoped to src/components/**
    │
    ├── skills/                        # Reusable procedures
    │   ├── deploy/
    │   │   └── SKILL.md
    │   ├── security-audit/
    │   │   └── SKILL.md
    │   └── new-service/
    │       ├── SKILL.md
    │       └── template/
    │
    ├── agents/                        # Specialized workers
    │   ├── code-reviewer.md
    │   └── test-writer.md
    │
    └── hooks/                         # Hook scripts
        └── check-command.sh
```

You don't need all of this on day one. Start with CLAUDE.md. Add rules when you notice repeated mistakes. Create skills when you catch yourself pasting the same instructions. Define agents when you need specialized workers. Add hooks when you need guarantees, not suggestions.

## Getting Started: Your First 10 Minutes

If you're new to Claude Code, here's what I'd do:

1. **Run `/init`.** It generates a starting CLAUDE.md by analyzing your codebase. Review it and add anything it missed - especially architecture decisions and team conventions.

2. **Try a real task.** Something small and familiar. A bug fix, a code review, a refactoring. Watch how Claude breaks it down and works through it.

3. **Course-correct.** When it does something you don't like, tell it. "Don't use console.log, use our logger." Then add that to CLAUDE.md so it sticks.

4. **Add one rule file.** Whatever Claude gets wrong most often. Testing conventions, API patterns, code style. Put it in `.claude/rules/`.

5. **Try a skill.** If there's a procedure you run regularly (deploy, setup, review), create a skill for it and use `/skill-name` to invoke it.

Build from there based on what you actually need. The best configurations grow from real usage, not upfront planning.

---

## References

- [Claude Code Documentation](https://code.claude.com/docs) - Full documentation for Claude Code.
- [CLAUDE.md Guide](https://code.claude.com/docs/en/memory.md) - How CLAUDE.md files work, loading order, and best practices.
- [Skills](https://code.claude.com/docs/en/skills.md) - Creating and using skills.
- [Sub-agents](https://code.claude.com/docs/en/sub-agents.md) - Custom agent definitions.
- [Hooks Guide](https://code.claude.com/docs/en/hooks-guide.md) - Lifecycle hooks for automation.
- [MCP Servers](https://code.claude.com/docs/en/mcp.md) - Connecting external tools.
- [Model Context Protocol](https://modelcontextprotocol.io/) - The open standard for AI tool integration.
- [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) - Anthropic's guide to agent architecture patterns.
