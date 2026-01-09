---
title: "The Art of Good Abstractions: When to Abstract, When to Duplicate"
excerpt: "Premature abstraction is the root of much suffering. Here's how to recognize when code wants to be unified versus when duplication is the right choice."
date: "2026-01-08"
tags: ["software-design", "architecture", "refactoring", "engineering"]
published: true
---

"Don't Repeat Yourself" is one of the first principles developers learn. It sounds obviously correct - why would you write the same code twice? Yet some of the worst codebases I've seen were created by developers religiously avoiding duplication.

The problem isn't DRY itself. It's applying DRY too early, too aggressively, or to the wrong things. The result is abstractions that don't fit, shared code that's harder to change than duplicated code, and complexity that serves the architecture instead of the product.

Good abstractions are powerful. They let you think at higher levels, change implementations without rippling effects, and express intent clearly. Bad abstractions are worse than no abstractions - they obscure intent, couple unrelated things, and make simple changes hard.

This post is about developing judgment for when to abstract and when to duplicate. It's a skill that takes years to develop, but understanding the principles accelerates the journey.

## The Cost of Wrong Abstractions

Before discussing when to abstract, let's understand what goes wrong when we abstract poorly.

### Coupling Unrelated Things

Two pieces of code look similar, so you extract a shared function. Later, one use case needs to change. But now you can't change it without affecting the other use case. So you add a parameter. Then another. Then a configuration object. Soon your "simple" abstraction has a dozen flags controlling its behavior.

```typescript
// Started as a simple helper
function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

// Six months later, after "reusing" it everywhere
function formatUserName(
  user: User,
  options: {
    includeMiddleName?: boolean;
    lastNameFirst?: boolean;
    includeTitle?: boolean;
    includeSuffix?: boolean;
    truncateAt?: number;
    placeholder?: string;
    format?: 'full' | 'abbreviated' | 'initials';
  } = {}
): string {
  // 50 lines of conditional logic
}
```

This function now serves many masters and serves none of them well. Each caller must understand options that don't apply to them. Changes for one use case risk breaking others. The "abstraction" has become a liability.

### Indirection Without Value

Every abstraction adds indirection. You're no longer looking at what the code does - you're looking at a reference to what it does. Good abstractions pay for this cost by providing a useful mental model. "This sends an email" is clearer than reading SMTP code.

But pointless abstractions just add navigation without clarity. A `StringUtils.isEmpty(str)` wrapper around `str.length === 0` adds more characters, requires understanding another file, and provides no insight. It's pure cost.

### Premature Generalization

You build something for one use case but design it to handle use cases you imagine might come later. You add extension points, configuration options, and plugin architectures for flexibility you don't need yet.

This is expensive in multiple ways:

1. **You build more than necessary** - Engineering time spent on imaginary requirements
2. **You build the wrong thing** - Future requirements rarely match what you imagined
3. **You complicate the present** - Current developers navigate complexity that serves no one
4. **You constrain the future** - Your guesses about future needs shape how the code evolves, often incorrectly

I've inherited codebases with elaborate plugin systems that had exactly one plugin. Configuration frameworks that had exactly one configuration. Abstract factories that created exactly one type. All that complexity, and the imagined flexibility was never used.

## When Duplication Is Right

Sometimes duplication is the right choice. Here's when to prefer it:

### When Things Are Only Superficially Similar

Two pieces of code look alike but represent different concepts. They happen to have the same implementation today, but they exist for different reasons and will evolve independently.

```typescript
// These look identical but represent different business concepts

function calculateShippingCost(weight: number): number {
  return weight * 0.5;
}

function calculateStorageCost(weight: number): number {
  return weight * 0.5;
}
```

Shipping cost and storage cost happen to use the same formula today. But they're driven by different factors - carrier rates versus warehouse costs. They'll change for different reasons at different times. Abstracting them into `calculateWeightBasedCost` couples unrelated business concepts.

The test: ask yourself "if I need to change one of these, should the other automatically change?" If the answer is no, they're not really duplicates - they're coincidentally similar.

### When You Don't Yet Understand the Pattern

You've written similar code twice and feel the urge to abstract. Resist it. Two instances isn't enough to understand the true pattern.

The "Rule of Three" suggests waiting until you have three instances before abstracting. By the third time, you understand what's actually common versus incidentally similar. You might find that only one small piece is truly shared, or that the similarities were superficial all along.

### When the Duplication Is Isolated

If duplicated code exists in one place or changes rarely, the cost of duplication is low. The cost of a bad abstraction is high. Do the math.

Two API handlers with the same three-line email validation? If they're in the same file, the duplication is obvious, easy to find, and easy to keep in sync. Extracting it adds indirection without much benefit. Save abstraction for when duplication actually causes problems.

### When Flexibility Matters More Than Consistency

Sometimes you want the freedom to change implementations independently. Shared code creates coupling - change it in one place, it changes everywhere. That's usually good, but not always.

Consider two teams with similar payment processing code. Team A wants to experiment with ML-based fraud detection. Team B needs stability. Forcing both through a shared abstraction means Team B inherits Team A's experimental risk, and Team A can't iterate without coordinating releases. Sometimes independence is more valuable than consistency.

## When to Abstract

Duplication isn't always right either. Here's when abstraction earns its keep:

### When the Abstraction Represents a Real Concept

Good abstractions map to concepts that exist in the problem domain. They have names people use. They represent things that matter.

```typescript
// This abstraction represents a real concept: a financial transaction
class Transaction {
  constructor(
    public readonly id: string,
    public readonly amount: Money,
    public readonly from: Account,
    public readonly to: Account,
    public readonly timestamp: Date
  ) {}

  reverse(): Transaction {
    return new Transaction(
      generateId(),
      this.amount,
      this.to,
      this.from,
      new Date()
    );
  }
}
```

"Transaction" isn't an arbitrary grouping of code - it's a concept that accountants, product managers, and developers all understand. The abstraction clarifies rather than obscures.

Contrast with abstractions like `DataProcessor` or `HelperUtils` - names that don't mean anything to anyone. If you can't explain the abstraction to a product manager, it probably doesn't represent a real concept.

### When You're Hiding Complexity

Good abstractions let you work at a higher level by hiding details you don't need to think about. The complexity still exists, but it's contained.

A repository that turns `userRepository.findById(userId)` into the right database calls hides connection management, query syntax, and error handling. Callers work with concepts they care about (users) instead of implementation details (connection pools, SQL, retries). And if you switch databases or add caching, callers don't need to change.

### When Changes Should Propagate

If you fix a bug, should the fix apply everywhere? When the answer is yes, abstraction makes sense.

Security validation is the classic example. If you find a new XSS vector, you want to fix it once and have every caller protected. Duplication here means hunting down every copy and hoping you find them all.

### When the Interface Is Stable but Implementation Varies

You know what you need (the interface) but how it's done might change (the implementation). A `PaymentProcessor` interface lets you swap between Stripe, PayPal, and test mocks without changing calling code. The interface is the stable contract; implementations are details.

## Principles for Good Abstractions

When you do abstract, these principles help create abstractions that age well:

### Name Things for What They Are, Not How They're Used

A `HomePageDataFetcher` couples the abstraction to a specific UI page. When the about page also needs that data, the name becomes misleading. A `ProductCatalog` describes what it is regardless of where it's used.

### Keep Abstractions Focused

Each abstraction should do one thing. If you struggle to name it, or the name includes "and," it's probably doing too much.

A `UserManager` that handles authentication, profile updates, loyalty points, and notifications is four things pretending to be one. Split it into `Authenticator`, `ProfileService`, `LoyaltyProgram`, and `NotificationService`. Focused abstractions are easier to understand, test, and change.

### Prefer Composition Over Inheritance

Inheritance is the tightest coupling in object-oriented code. Changing a parent class affects all children. Deep hierarchies become rigid and fragile.

The classic example: you have `Animal`, `Mammal`, `Dog`, and now you need `SwimmingDog`. But what if cats can swim too? With inheritance, you're stuck redesigning the hierarchy. With composition, you mix and match behaviors: a dog that has `SwimmingBehavior` and `RunningBehavior` can easily share swimming with a cat.

### Design for Deletion

The best abstractions are easy to remove. A `BaseEntity` class with 50 subclasses is nearly impossible to change - you're trapped. A `withTimestamps()` function that you can simply stop calling? Easy to delete, easy to replace.

Keep abstractions small. Minimize dependencies. Don't leak implementation details. Code that's easy to delete is easy to improve.

### Build Pipelines with Small Functions

Functional composition creates powerful abstractions from tiny pieces. Each function does one thing; the composition does something meaningful.

```typescript
// Small, focused functions
const trim = (s: string) => s.trim();
const lowercase = (s: string) => s.toLowerCase();
const removeSpecialChars = (s: string) => s.replace(/[^a-z0-9\s]/g, '');
const replaceSpaces = (s: string) => s.replace(/\s+/g, '-');

// Compose into a pipeline
const pipe = <T>(...fns: Array<(arg: T) => T>) =>
  (value: T) => fns.reduce((acc, fn) => fn(acc), value);

const slugify = pipe(trim, lowercase, removeSpecialChars, replaceSpaces);

slugify('  Hello World! ')  // 'hello-world'
```

Each function is trivial to understand and test. The composition creates something useful. Want to change how slugs work? Swap one function. Want a different pipeline? Compose different pieces.

This is the functional approach to abstraction: instead of hiding complexity inside a class, you build complexity from visible, composable parts.

## The Refactoring Mindset

The best approach to abstraction is iterative. Write concrete code first, then refactor when patterns emerge.

### Start Concrete

When building something new, write straightforward, specific code. Don't abstract preemptively - you don't know yet what varies and what's stable. Concrete code is simple, obvious, and easy to change because there's no abstraction constraining it.

### Watch for Friction

As the codebase evolves, pay attention to what's painful. Where do bugs cluster? What's hard to test? What requires changes in multiple places? Pain points indicate where abstraction would help. The pattern emerges from real usage, not imagination.

### Refactor When the Pattern Is Clear

Once you've seen the pattern three times, you understand what's truly common. And often, it's less than you expected.

After three similar API endpoints with a validate-save-notify-track pattern, you might think you need a generic `createEntity<T>` with hooks for every step. But look closer: maybe only the tracking is truly common. Validation differs by entity type. Notifications go to different recipients. Extract just the tracking. Keep the rest concrete.

The pattern reveals itself through use. Don't force more abstraction than the code is asking for.

### Keep Refactoring

Abstractions aren't permanent. As requirements change, today's good abstraction might become tomorrow's obstacle. Be willing to delete abstractions that no longer serve. The goal isn't a perfect architecture - it's a codebase that's easy to change.

## Summary

Good abstractions reduce complexity. Bad abstractions increase it. The difference lies in timing, judgment, and willingness to refactor.

**Prefer duplication when:**
- Similarities are superficial (same code, different concepts)
- You don't yet understand the pattern
- The duplication is isolated and stable
- Independence matters more than consistency

**Prefer abstraction when:**
- The abstraction represents a real concept
- You're hiding complexity that callers shouldn't see
- Changes should propagate everywhere
- The interface is stable but implementations vary

**Create good abstractions by:**
- Naming for what it is, not where it's used
- Keeping focus narrow
- Preferring composition over inheritance
- Building pipelines from small, focused functions
- Designing for easy deletion

The best developers I've worked with don't follow rules blindly. They've developed judgment through experience - writing code, watching it evolve, seeing what works and what doesn't. They duplicate when duplication is right and abstract when abstraction is right.

That judgment comes from writing a lot of code, maintaining a lot of code, and paying attention to what hurts. The principles help, but there's no substitute for experience.

When in doubt, start concrete. Abstraction can always come later. The reverse - removing a bad abstraction - is much harder.

---

## References

- Sandi Metz. [The Wrong Abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction) - The seminal article on why duplication is better than the wrong abstraction
- Martin Fowler. [Refactoring: Improving the Design of Existing Code](https://martinfowler.com/books/refactoring.html) - The classic guide to improving code structure incrementally
- Dan Abramov. [Goodbye, Clean Code](https://overreacted.io/goodbye-clean-code/) - A compelling story about the damage premature abstraction can cause
- Kent Beck. [Rule of Three](<https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming)>) - Wait for three instances before abstracting
- Rich Hickey. [Simple Made Easy](https://www.infoq.com/presentations/Simple-Made-Easy/) - The distinction between simple and easy, and why it matters for abstraction
