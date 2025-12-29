---
title: "API Design Principles: Building Interfaces Developers Love"
excerpt: "A practical guide to designing APIs that are intuitive, consistent, and resilient - covering REST conventions, error handling, versioning, and the decisions that separate good APIs from frustrating ones."
date: "2025-12-29"
tags: ["api", "rest", "architecture", "typescript", "backend", "design"]
published: true
---

APIs are contracts. They define how systems communicate, how developers interact with your platform, and how your architecture evolves over time. A well-designed API accelerates development and reduces support burden. A poorly designed one creates friction that compounds with every integration.

This post covers the principles that make APIs intuitive and maintainable - REST conventions, resource modeling, error handling, versioning strategies, and the subtle decisions that separate APIs developers love from ones they tolerate.

## The Foundation: Resource-Oriented Design

REST APIs are built around **resources** - the nouns of your system. Users, orders, products, payments. Not actions, not verbs, not RPC-style endpoints.

```
Good (resource-oriented):
GET    /users/123
POST   /users
PUT    /users/123
DELETE /users/123

Bad (action-oriented):
GET    /getUser?id=123
POST   /createUser
POST   /updateUser
POST   /deleteUser
```

The resource-oriented approach uses HTTP methods as verbs, making endpoints predictable. If I know your API has a `/products` resource, I can guess how to interact with it without reading documentation.

### Modeling Resources

Resources should map to your domain concepts, not your database tables. A `User` resource might aggregate data from `users`, `profiles`, and `preferences` tables. The API consumer doesn't care about your storage model.

```typescript
// Internal: multiple tables
interface UserRow {
  id: string;
  email: string;
  created_at: Date;
}

interface ProfileRow {
  user_id: string;
  display_name: string;
  avatar_url: string;
}

// External: unified resource
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  createdAt: string;
}
```

This separation lets you refactor internals without breaking the API contract.

### Sub-Resources and Relationships

When resources have clear parent-child relationships, nest them:

```
GET /users/123/orders          # Orders belonging to user 123
GET /users/123/orders/456      # Specific order for user 123
POST /users/123/orders         # Create order for user 123
```

But don't nest too deeply. More than two levels becomes unwieldy:

```
# Too deep - hard to construct and read
GET /companies/1/departments/2/teams/3/members/4/tasks/5

# Better - flatten when the child has its own identity
GET /tasks/5
GET /tasks?team_id=3
```

A good rule: if the child resource makes sense on its own (tasks exist independently of the URL path), give it a top-level endpoint. If it only exists in context of the parent (a user's profile settings), nest it.

## HTTP Methods: More Than CRUD

HTTP methods have specific semantics. Using them correctly makes your API predictable.

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Retrieve resource(s) | Yes | Yes |
| POST | Create resource / trigger action | No | No |
| PUT | Replace resource entirely | Yes | No |
| PATCH | Partial update | Yes* | No |
| DELETE | Remove resource | Yes | No |

**Idempotent** means calling it multiple times has the same effect as calling it once. `DELETE /users/123` three times still results in user 123 being deleted (or already gone). This matters for retries - clients can safely retry idempotent requests on network failures.

**Safe** means it doesn't modify state. GET requests should never have side effects. Don't create audit logs, increment counters, or trigger workflows from GET requests.

### PUT vs PATCH

This distinction trips up many teams:

```typescript
// Original resource
{
  "id": "123",
  "name": "Alice",
  "email": "alice@example.com",
  "role": "admin"
}

// PUT /users/123 - replaces entire resource
// Request body:
{
  "name": "Alice Smith",
  "email": "alice@example.com"
}
// Result: role is now undefined/null (field was omitted)

// PATCH /users/123 - updates only specified fields
// Request body:
{
  "name": "Alice Smith"
}
// Result: only name changes, email and role preserved
```

Use PUT when clients should send the complete resource. Use PATCH for partial updates. Most applications want PATCH semantics, but many incorrectly use PUT.

### POST for Actions

Sometimes you need to trigger an action that doesn't fit CRUD. Use POST with a verb-based sub-resource:

```
POST /orders/123/cancel
POST /users/123/verify-email
POST /reports/generate
```

This keeps resources noun-based while acknowledging that some operations are actions. The response can be the affected resource or an action-specific result.

## URL Design That Scales

### Use Plural Nouns

```
GET /users        # Collection
GET /users/123    # Single resource
POST /users       # Create in collection
```

Mixing singular and plural (`/user/123` vs `/users`) creates confusion. Pick plural and be consistent.

### Use Kebab-Case

URLs are case-insensitive in the spec but case-sensitive in practice on most servers. Kebab-case is the convention:

```
Good:
/user-profiles
/order-items
/payment-methods

Bad:
/userProfiles    # camelCase
/user_profiles   # snake_case
/UserProfiles    # PascalCase
```

### Keep URLs Stable

URLs are part of your API contract. Once published, treat them as immutable. If you need to restructure:

1. Keep old URLs working (redirect or proxy)
2. Add new URLs
3. Deprecate old URLs with timeline
4. Eventually remove (years later, if ever)

Breaking URLs breaks integrations, bookmarks, documentation, and trust.

## Query Parameters Done Right

### Filtering

Use query parameters for filtering collections:

```
GET /orders?status=pending
GET /orders?status=pending&customer_id=123
GET /orders?created_after=2025-01-01
```

For complex filtering, consider a structured approach:

```
GET /orders?filter[status]=pending&filter[total_gte]=100
```

Or accept a filter object (URL-encoded JSON) for advanced cases:

```
GET /orders?filter={"status":"pending","total":{"gte":100}}
```

### Pagination

Always paginate collections. Unbounded lists kill performance and overwhelm clients.

**Offset-based** (simple, but has problems):
```
GET /orders?limit=20&offset=40   # Page 3
```

Problem: If items are inserted/deleted while paginating, you'll skip or duplicate items.

**Cursor-based** (recommended for large datasets):
```
GET /orders?limit=20&cursor=eyJpZCI6MTAwfQ==
```

The cursor encodes position (often the last item's ID). This handles insertions/deletions gracefully and performs better on large tables (no OFFSET scan).

Response should include pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "total": 1000,
    "limit": 20,
    "next_cursor": "eyJpZCI6MTIwfQ==",
    "has_more": true
  }
}
```

### Sorting

```
GET /orders?sort=created_at        # Ascending (default)
GET /orders?sort=-created_at       # Descending (prefix with -)
GET /orders?sort=-created_at,id    # Multiple fields
```

The `-` prefix for descending is a common convention. Document your default sort order.

### Field Selection

Let clients request only the fields they need:

```
GET /users/123?fields=id,name,email
GET /orders?fields=id,status,total&expand=customer
```

This reduces payload size and can improve query performance. The `expand` parameter lets clients request related resources inline, avoiding N+1 request patterns.

## Response Design

### Consistent Structure

Every response should follow the same envelope:

```typescript
// Success response
interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: PaginationInfo;
    [key: string]: unknown;
  };
}

// Error response
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
    request_id: string;
  };
}
```

Clients can always check for `error` to know if the request failed, and always find the payload in `data`.

```json
// Success
{
  "data": {
    "id": "123",
    "name": "Alice"
  }
}

// Collection
{
  "data": [
    { "id": "123", "name": "Alice" },
    { "id": "124", "name": "Bob" }
  ],
  "meta": {
    "pagination": {
      "total": 100,
      "limit": 20,
      "offset": 0
    }
  }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": {
      "field": "email",
      "reason": "required"
    },
    "request_id": "req_abc123"
  }
}
```

### Use Consistent Naming

Pick a convention and stick to it:

```json
// camelCase (JavaScript convention)
{
  "userId": "123",
  "createdAt": "2025-01-01T00:00:00Z",
  "isActive": true
}

// snake_case (common in Ruby, Python APIs)
{
  "user_id": "123",
  "created_at": "2025-01-01T00:00:00Z",
  "is_active": true
}
```

Don't mix conventions. If your backend is Python and frontend is JavaScript, pick one for the API and transform at boundaries.

### Dates and Times

Always use ISO 8601 format with timezone:

```json
{
  "created_at": "2025-01-15T14:30:00Z",
  "scheduled_for": "2025-01-20T09:00:00-05:00"
}
```

Use UTC (`Z` suffix) unless the local timezone is meaningful. "Meeting at 9am Eastern" should preserve the timezone. "Order created" should be UTC.

### Null vs Absent

Be intentional about the difference:

```json
// Field is null - explicitly set to nothing
{ "middle_name": null }

// Field is absent - not requested or not applicable
{ "first_name": "Alice", "last_name": "Smith" }
```

For partial responses (field selection), omit unrequested fields. For full resources, include all fields with null for empty values.

## Error Handling That Helps

Errors should help developers fix problems, not just report them.

### Use Appropriate Status Codes

```
2xx - Success
  200 OK              - General success
  201 Created         - Resource created (POST)
  204 No Content      - Success with no body (DELETE)

4xx - Client Error
  400 Bad Request     - Malformed request / validation error
  401 Unauthorized    - Authentication required
  403 Forbidden       - Authenticated but not authorized
  404 Not Found       - Resource doesn't exist
  409 Conflict        - State conflict (duplicate, version mismatch)
  422 Unprocessable   - Valid syntax but semantic error
  429 Too Many Requests - Rate limited

5xx - Server Error
  500 Internal Error  - Unexpected server failure
  502 Bad Gateway     - Upstream service failed
  503 Unavailable     - Temporarily overloaded/maintenance
  504 Gateway Timeout - Upstream timeout
```

Don't use 200 for errors. Don't use 500 for validation failures. Status codes let clients handle errors programmatically without parsing the body.

### Provide Actionable Error Messages

```json
// Bad - what field? what format?
{
  "error": {
    "message": "Invalid input"
  }
}

// Good - developer knows exactly what to fix
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address",
        "received": "not-an-email"
      },
      {
        "field": "age",
        "message": "Must be at least 18",
        "received": 16
      }
    ],
    "request_id": "req_abc123"
  }
}
```

Include:
- **Machine-readable code** for programmatic handling
- **Human-readable message** for logging/display
- **Field-level details** for validation errors
- **Request ID** for support debugging

### Don't Leak Internal Details

```json
// Bad - exposes internals
{
  "error": {
    "message": "QueryFailedError: relation \"users\" does not exist",
    "stack": "at PostgresDriver.query..."
  }
}

// Good - safe for clients
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again.",
    "request_id": "req_abc123"
  }
}
```

Log the full error server-side. Return a safe message to clients. The request ID connects them.

## Versioning Strategy

APIs evolve. Versioning lets you make changes without breaking existing clients.

### When to Version

Not every change needs a version bump:

**Non-breaking (no version change):**
- Adding new endpoints
- Adding optional fields to responses
- Adding optional parameters
- Adding new enum values (if clients handle unknowns)

**Breaking (requires new version):**
- Removing or renaming fields
- Changing field types
- Removing endpoints
- Changing authentication
- Changing error formats

### Versioning Approaches

**URL path versioning** (most common):
```
GET /v1/users/123
GET /v2/users/123
```

Pros: Explicit, easy to route, cacheable
Cons: URL changes between versions

**Header versioning**:
```
GET /users/123
Accept: application/vnd.api+json; version=2
```

Pros: Clean URLs, content negotiation
Cons: Harder to test (can't just change URL), easy to forget

**Query parameter**:
```
GET /users/123?version=2
```

Pros: Explicit, easy to test
Cons: Pollutes query string, caching complications

**Recommendation**: URL path versioning. It's explicit, widely understood, and works well with tooling.

### Version Lifecycle

1. **Active**: Current recommended version
2. **Deprecated**: Still works, but clients should migrate
3. **Sunset**: Announced removal date
4. **Removed**: Returns 410 Gone

Communicate deprecation in responses:

```http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 01 Jan 2026 00:00:00 GMT
Link: </v2/users>; rel="successor-version"
```

Give clients 6-12 months minimum to migrate. Breaking integrations breaks trust.

## Authentication and Authorization

### Use Standard Mechanisms

**API Keys** - Simple, for server-to-server:
```http
Authorization: Bearer sk_live_abc123
```

**OAuth 2.0 / JWT** - For user context:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Don't invent custom auth schemes. Use standards that security libraries already handle.

### Separate Authentication from Authorization

- **Authentication (401)**: "Who are you?" - Invalid or missing credentials
- **Authorization (403)**: "Are you allowed?" - Valid credentials, insufficient permissions

```typescript
// Middleware order matters
app.use(authenticate);  // Sets req.user or returns 401
app.use(authorize);     // Checks req.user permissions or returns 403
```

A 401 means "try again with valid credentials." A 403 means "your credentials are fine, but you can't do this."

### Rate Limiting

Protect your API from abuse:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000

HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

Return rate limit headers on every response so clients can self-regulate. Include `Retry-After` when rate limited.

## Documentation as Product

Your API is only as good as its documentation.

### OpenAPI Specification

Define your API in OpenAPI (formerly Swagger):

```yaml
openapi: 3.0.0
info:
  title: Order API
  version: 1.0.0
paths:
  /orders:
    get:
      summary: List orders
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, shipped, delivered]
      responses:
        '200':
          description: List of orders
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrderList'
```

This gives you:
- Generated documentation (Swagger UI, Redoc)
- Client SDK generation
- Request/response validation
- Contract testing

### Include Examples

Abstract schemas aren't enough. Show real examples:

```yaml
components:
  schemas:
    Order:
      type: object
      properties:
        id:
          type: string
        status:
          type: string
      example:
        id: "ord_123abc"
        status: "pending"
        items:
          - product_id: "prod_456"
            quantity: 2
            unit_price: 29.99
        total: 59.98
        created_at: "2025-01-15T14:30:00Z"
```

Developers copy-paste examples. Make them realistic and complete.

### Document Errors

Every endpoint should document possible errors:

```yaml
responses:
  '400':
    description: Validation error
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Error'
        example:
          error:
            code: "VALIDATION_ERROR"
            message: "Invalid order data"
  '404':
    description: Order not found
  '409':
    description: Order already shipped
```

## Common Pitfalls

### Inconsistent Naming

```json
// Mixing conventions in the same API
{
  "user_id": "123",
  "userName": "alice",
  "EmailAddress": "alice@example.com"
}
```

Pick one convention. Enforce it in code review. Use linting.

### Chatty APIs

```typescript
// Client needs 10 requests to render a page
const user = await fetch('/users/123');
const orders = await fetch('/users/123/orders');
const addresses = await fetch('/users/123/addresses');
const preferences = await fetch('/users/123/preferences');
// ... more requests
```

Provide composite endpoints or support field expansion:

```typescript
// Single request with everything needed
const user = await fetch('/users/123?expand=orders,addresses,preferences');
```

### Ignoring Idempotency

```typescript
// Dangerous: network retry creates duplicate order
const response = await fetch('/orders', {
  method: 'POST',
  body: JSON.stringify(orderData)
});
```

Support idempotency keys for non-idempotent operations:

```typescript
const response = await fetch('/orders', {
  method: 'POST',
  headers: {
    'Idempotency-Key': 'unique-client-generated-key'
  },
  body: JSON.stringify(orderData)
});
```

Server stores the response for that key. Retries return the stored response instead of creating duplicates.

### Breaking Changes Without Warning

Removing a field with no notice breaks clients immediately. Always:

1. Announce deprecation
2. Provide migration path
3. Give adequate timeline (months, not days)
4. Support old and new simultaneously during transition

## Summary

Good APIs share common traits:

**Predictable**: If I understand one endpoint, I can guess how others work. Consistent naming, consistent structure, consistent behavior.

**Self-documenting**: Resource names, HTTP methods, and status codes convey meaning. Documentation enhances understanding, not creates it.

**Forgiving**: Handle edge cases gracefully. Accept flexible input formats. Return helpful errors. Support retries with idempotency.

**Evolvable**: Versioning strategy, deprecation process, and non-breaking change policies let the API grow without breaking clients.

**Observable**: Request IDs, rate limit headers, and detailed errors help clients and operators understand what's happening.

The best APIs disappear - developers use them without thinking about them. That's the goal: an interface so intuitive that integration is effortless and maintenance is minimal.

---

## References

- Fielding, Roy. [Architectural Styles and the Design of Network-based Software Architectures](https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm) - The original REST dissertation
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines) - Comprehensive enterprise API standards
- [Google API Design Guide](https://cloud.google.com/apis/design) - Resource-oriented design principles
- [JSON:API Specification](https://jsonapi.org/) - A specification for building APIs in JSON
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html) - The standard for describing REST APIs
- [HTTP Status Codes](https://httpstatuses.com/) - Complete reference for HTTP status codes
