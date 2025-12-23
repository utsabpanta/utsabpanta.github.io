---
title: "Event-Driven Architecture: Patterns, Practices, and Pitfalls"
excerpt: "A practical guide to building event-driven systems - when to use events, core patterns, AWS implementation, and the mistakes that derail teams."
date: "2025-12-22"
tags: ["architecture", "event-driven", "aws", "cdk", "typescript", "distributed-systems", "serverless"]
published: true
---

Event-driven architecture (EDA) has become a go-to choice for building scalable, loosely coupled systems. But the pattern is often misunderstood and misapplied. Teams adopt events without clear reasoning, leading to systems that are harder to debug, not easier to scale.

This post covers when event-driven architecture actually makes sense, the core patterns you need to know, practical AWS implementations, and the pitfalls that catch most teams.

## What Is Event-Driven Architecture?

In traditional request/response systems, services call each other directly. Service A needs something from Service B, so it makes an HTTP request and waits for a response. This creates tight coupling - Service A must know about Service B, handle its failures, and wait for it to respond.

In event-driven systems, components communicate by producing and consuming **events** - immutable records of something that happened. Instead of Service A calling Service B directly, Service A publishes an event ("Order Created"), and any interested service can react to it independently.

```
Traditional (Request/Response):
┌─────────┐  POST /orders   ┌─────────┐  POST /reserve   ┌─────────┐
│  Order  │ ──────────────▶ │Inventory│ ────────────────▶│Shipping │
│ Service │ ◀────────────── │ Service │ ◀────────────────│ Service │
└─────────┘    response     └─────────┘     response     └─────────┘

Event-Driven:
┌─────────┐                    ┌─────────────┐
│  Order  │ ── OrderCreated ──▶│  Event Bus  │
│ Service │                    └──────┬──────┘
└─────────┘                           │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
              ┌─────────┐       ┌─────────┐       ┌─────────┐
              │Inventory│       │Shipping │       │Analytics│
              │ Service │       │ Service │       │ Service │
              └─────────┘       └─────────┘       └─────────┘
```

The key difference: the Order Service doesn't know or care who consumes its events. This decoupling enables independent scaling, deployment, and evolution of services. Want to add a fraud detection service? Subscribe it to `OrderCreated` events - no changes needed to the Order Service.

## When to Use Event-Driven Architecture

EDA isn't universally better than request/response. The additional complexity is only worth it when you have clear benefits. Here's how to decide:

### Good Candidates for EDA

**Multiple consumers need the same data.** When an order is placed, inventory needs to reserve stock, shipping needs to prepare fulfillment, notifications need to email the customer, and analytics needs to track the sale. With request/response, Order Service would call each of these sequentially or manage parallel calls. With events, it publishes once and each consumer handles its own logic. Adding a new consumer (say, a loyalty points service) requires zero changes to the Order Service.

**Temporal decoupling matters.** The producer doesn't need an immediate response. When a customer places an order, they need instant confirmation - but they don't need to wait for analytics processing, recommendation engine updates, or warehouse notifications. Events let time-insensitive work happen asynchronously.

**Services should evolve independently.** In large organizations, different teams own different services. Events create clear boundaries - as long as the event schema is stable, teams can deploy independently without coordinating releases.

**You need audit trails.** Events are immutable records of what happened. They're natural audit logs, and with event sourcing, you can reconstruct the state of your system at any point in time.

**Workloads are spiky.** Flash sales, viral content, seasonal traffic - events and queues absorb spikes, letting consumers process at sustainable rates rather than getting overwhelmed.

### Poor Candidates for EDA

**You need synchronous responses.** User login, payment authorization, real-time validation - these need immediate answers. You can't tell a user "we'll let you know if your password was correct."

**Simple CRUD operations.** If you're building a basic todo app, adding events to create/read/update/delete operations adds complexity without benefit. Not every database write needs to be an event.

**Strong consistency is required.** If you need guaranteed ordering or transactions across services, events make this significantly harder. Bank transfers where the debit and credit must happen atomically are poor fits for eventual consistency.

**Small teams, simple domains.** The infrastructure overhead (event bus, dead letter queues, monitoring) may not pay off. A monolith might serve you better until you hit clear scaling or organizational boundaries.

## Core Patterns

Before diving into implementation, understand the fundamental patterns that underpin event-driven systems. Martin Fowler's [influential article on event-driven architecture](https://martinfowler.com/articles/201701-event-driven.html) defines these patterns clearly - I'll summarize the key ones here.

### Pattern 1: Event Notification

The simplest pattern - notify interested parties that something happened. Events are **thin**, containing just enough information to identify what changed.

```typescript
// Thin event - consumers fetch details if needed
interface OrderCreatedEvent {
  eventType: 'OrderCreated';
  orderId: string;
  customerId: string;
  occurredAt: string;
}
```

The consumer receives the notification and calls back to the Order Service if it needs more details (items, shipping address, etc.).

**Use when:** The full payload is large, consumers might not need all details, or you want to avoid duplicating data across events.

**Trade-off:** Consumers must call back to get details, which creates runtime coupling. If Order Service is down, consumers can't get the data they need. This partially defeats the decoupling benefit.

### Pattern 2: Event-Carried State Transfer

Events carry the **full state** needed by consumers, eliminating callbacks entirely.

```typescript
// Fat event - contains everything consumers need
interface OrderCreatedEvent {
  eventType: 'OrderCreated';
  orderId: string;
  customerId: string;
  customerEmail: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress: Address;
  totalAmount: number;
  occurredAt: string;
}
```

Consumers have everything they need in the event itself. The Notification Service can email the customer without calling Order Service. The Inventory Service can reserve stock for each item without any additional lookups.

**Use when:** Consumers need the data immediately, you want true runtime decoupling, or the producing service might be unavailable when consumers process events.

**Trade-off:** Larger payloads increase storage and transfer costs. If consumers cache this data, they might work with stale information if the source changes.

### Pattern 3: Event Sourcing

Instead of storing current state, store the **sequence of events** that led to current state. The current state is derived by replaying events.

```typescript
// Account balance derived from event history
const events = [
  { type: 'AccountOpened', accountId: '123', initialBalance: 0, at: '2025-01-01' },
  { type: 'MoneyDeposited', accountId: '123', amount: 1000, at: '2025-01-15' },
  { type: 'MoneyWithdrawn', accountId: '123', amount: 200, at: '2025-02-01' },
  { type: 'MoneyDeposited', accountId: '123', amount: 500, at: '2025-02-15' },
];

// Current balance: 0 + 1000 - 200 + 500 = 1300
// Balance on Feb 1: 0 + 1000 - 200 = 800
```

This gives you complete audit history, the ability to answer temporal queries ("what was the balance on February 1st?"), and the power to rebuild state from scratch if needed.

**Use when:** Audit requirements are strict (financial systems), you need temporal queries, or you want the ability to replay events to fix bugs or rebuild projections.

**Trade-off:** Significant complexity. Event schema evolution is tricky - you can't just change old events. Replaying millions of events to get current state is slow (solve with snapshots). Most teams don't need this.

### Pattern 4: CQRS (Command Query Responsibility Segregation)

Separate your read and write models. Commands modify state (often producing events), while queries read from optimized views built from those events.

```
Commands (writes)              Queries (reads)
      │                              ▲
      ▼                              │
┌──────────┐    Events     ┌────────────────┐
│  Write   │ ────────────▶ │   Read Model   │
│  Model   │               │  (Projections) │
└──────────┘               └────────────────┘
```

Your write model is optimized for consistency and business rule validation. Your read models (you can have many) are optimized for specific query patterns - denormalized, pre-aggregated, indexed exactly how your UI needs them.

**Use when:** Read and write patterns differ significantly. You have complex queries that are expensive to compute on the fly. You need multiple "views" of the same data for different use cases.

**Trade-off:** Eventual consistency between write and read models - after a write, reads might briefly return stale data. More infrastructure to maintain. Overkill for simple applications.

## Building an Event-Driven System on AWS

Let's build a practical order processing system that demonstrates these patterns. We'll use EventBridge as our event bus, Lambda for processing, and DynamoDB for storage.

### Architecture Overview

```
┌────────────┐     ┌──────────────┐     ┌─────────────────┐
│ API Gateway│────▶│Order Service │────▶│  EventBridge    │
└────────────┘     └──────────────┘     └────────┬────────┘
                                                 │
                   ┌─────────────────────────────┼─────────────────────────────┐
                   │                             │                             │
                   ▼                             ▼                             ▼
            ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
            │  Inventory  │              │ Notification│              │  Analytics  │
            │   Service   │              │   Service   │              │   Service   │
            └──────┬──────┘              └─────────────┘              └─────────────┘
                   │
                   ▼
            ┌─────────────┐
            │  DynamoDB   │
            └─────────────┘
```

The Order Service receives HTTP requests, stores orders, and publishes events. Each downstream service subscribes to relevant events and processes them independently. If Inventory Service is slow or down, it doesn't affect order creation - events queue up and process when the service recovers.

### Defining Your Event Schema

Before writing any infrastructure, define your event schemas. These are contracts between your services - treat them with the same rigor as APIs.

A well-designed event includes:
- **Version**: For schema evolution
- **Event ID**: Unique identifier for idempotency
- **Event type**: What happened (use past tense - something already occurred)
- **Aggregate ID**: The entity this event relates to
- **Timestamp**: When it occurred
- **Metadata**: Correlation IDs for tracing, user context
- **Data**: The actual payload

```typescript
// src/events/order-events.ts

// Base event structure - all events follow this pattern
export interface BaseEvent {
  version: '1.0';
  eventId: string;
  eventType: string;
  aggregateId: string;
  occurredAt: string;
  metadata: {
    correlationId: string;    // Traces a user action across services
    causationId?: string;     // The event that caused this event
    userId?: string;
  };
}

export interface OrderCreatedEvent extends BaseEvent {
  eventType: 'order.created';
  data: {
    customerId: string;
    customerEmail: string;
    items: OrderItem[];
    shippingAddress: Address;
    totalAmount: number;
    currency: string;
  };
}

export interface OrderShippedEvent extends BaseEvent {
  eventType: 'order.shipped';
  data: {
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string;
  };
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
```

Notice we're using **Event-Carried State Transfer** - events contain everything consumers need. The `OrderCreatedEvent` includes customer email, full item details, and shipping address. The Notification Service can send a confirmation email without calling any other service.

### Infrastructure with CDK

Now let's set up the AWS infrastructure. We need:
- An EventBridge event bus for routing events
- Lambda functions for each service
- DynamoDB tables for persistence
- Dead letter queues for failed events
- Event archive for replay capability

```typescript
// lib/event-driven-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class EventDrivenOrderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========================================
    // Event Bus - Central nervous system
    // ========================================
    const orderEventBus = new events.EventBus(this, 'OrderEventBus', {
      eventBusName: 'orders',
    });

    // Archive all order events for 1 year - enables replay and debugging
    new events.Archive(this, 'OrderEventArchive', {
      sourceEventBus: orderEventBus,
      archiveName: 'order-events-archive',
      retention: cdk.Duration.days(365),
      eventPattern: { source: ['order-service'] },
    });

    // ========================================
    // Dead Letter Queue - Catch failed events
    // ========================================
    const dlq = new sqs.Queue(this, 'EventProcessingDLQ', {
      queueName: 'order-events-dlq',
      retentionPeriod: cdk.Duration.days(14),
      encryption: sqs.QueueEncryption.KMS_MANAGED,
    });

    // ========================================
    // Data Stores
    // ========================================
    const ordersTable = new dynamodb.Table(this, 'OrdersTable', {
      tableName: 'orders',
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
    });

    const inventoryTable = new dynamodb.Table(this, 'InventoryTable', {
      tableName: 'inventory',
      partitionKey: { name: 'productId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // ========================================
    // Lambda Functions
    // ========================================
    const orderService = new nodejs.NodejsFunction(this, 'OrderService', {
      entry: 'src/handlers/order-service.ts',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      environment: {
        ORDERS_TABLE: ordersTable.tableName,
        EVENT_BUS_NAME: orderEventBus.eventBusName,
      },
    });

    const inventoryService = new nodejs.NodejsFunction(this, 'InventoryService', {
      entry: 'src/handlers/inventory-service.ts',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      reservedConcurrentExecutions: 50, // Bulkhead: limit concurrent executions
      environment: {
        INVENTORY_TABLE: inventoryTable.tableName,
        EVENT_BUS_NAME: orderEventBus.eventBusName,
      },
    });

    const notificationService = new nodejs.NodejsFunction(this, 'NotificationService', {
      entry: 'src/handlers/notification-service.ts',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(10),
      reservedConcurrentExecutions: 20,
    });

    // Grant permissions
    ordersTable.grantReadWriteData(orderService);
    orderEventBus.grantPutEventsTo(orderService);
    inventoryTable.grantReadWriteData(inventoryService);
    orderEventBus.grantPutEventsTo(inventoryService);

    // ========================================
    // Event Routing Rules
    // ========================================
    // Route order.created events to inventory service
    new events.Rule(this, 'OrderCreatedToInventory', {
      eventBus: orderEventBus,
      ruleName: 'order-created-to-inventory',
      eventPattern: {
        source: ['order-service'],
        detailType: ['order.created'],
      },
      targets: [
        new targets.LambdaFunction(inventoryService, {
          deadLetterQueue: dlq,
          retryAttempts: 3,
        }),
      ],
    });

    // Route order.created events to notification service
    new events.Rule(this, 'OrderCreatedToNotification', {
      eventBus: orderEventBus,
      ruleName: 'order-created-to-notification',
      eventPattern: {
        source: ['order-service'],
        detailType: ['order.created'],
      },
      targets: [
        new targets.LambdaFunction(notificationService, {
          deadLetterQueue: dlq,
          retryAttempts: 3,
        }),
      ],
    });

    // ========================================
    // API Gateway
    // ========================================
    const api = new apigateway.RestApi(this, 'OrderApi', {
      restApiName: 'Order Service',
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 1000,
        throttlingBurstLimit: 2000,
      },
    });

    api.root.addResource('orders')
      .addMethod('POST', new apigateway.LambdaIntegration(orderService));
  }
}
```

Key design decisions here:

1. **Event Archive**: We archive events for a year. This lets us replay events if we need to rebuild a projection, debug issues, or recover from bugs.

2. **Dead Letter Queue**: Failed events go to a DLQ instead of being lost. We can investigate failures and replay them when fixed.

3. **Reserved Concurrency**: Each service has a concurrency limit, acting as a bulkhead. If inventory processing goes haywire, it won't consume all Lambda capacity and starve notifications.

4. **Separate Rules per Consumer**: Each consumer gets its own EventBridge rule. This lets us configure different retry policies, add/remove consumers without affecting others.

### Event Producer: Order Service

The Order Service handles incoming orders, persists them, and publishes events. Notice how it generates correlation IDs for tracing requests across services.

```typescript
// src/handlers/order-service.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { randomUUID } from 'crypto';
import { OrderCreatedEvent } from '../events/order-events';

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const eventBridge = new EventBridgeClient({});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Use existing correlation ID or generate new one
  const correlationId = event.headers['x-correlation-id'] || randomUUID();
  const body = JSON.parse(event.body || '{}');

  const orderId = randomUUID();
  const now = new Date().toISOString();

  // 1. Persist the order
  const order = {
    pk: `ORDER#${orderId}`,
    sk: 'METADATA',
    orderId,
    customerId: body.customerId,
    customerEmail: body.customerEmail,
    items: body.items,
    shippingAddress: body.shippingAddress,
    totalAmount: body.totalAmount,
    currency: body.currency || 'USD',
    status: 'CREATED',
    createdAt: now,
  };

  await dynamodb.send(new PutCommand({
    TableName: process.env.ORDERS_TABLE,
    Item: order,
  }));

  // 2. Publish event with full state (Event-Carried State Transfer)
  const orderCreatedEvent: OrderCreatedEvent = {
    version: '1.0',
    eventId: randomUUID(),
    eventType: 'order.created',
    aggregateId: orderId,
    occurredAt: now,
    metadata: {
      correlationId,
      userId: body.customerId,
    },
    data: {
      customerId: body.customerId,
      customerEmail: body.customerEmail,
      items: body.items,
      shippingAddress: body.shippingAddress,
      totalAmount: body.totalAmount,
      currency: body.currency || 'USD',
    },
  };

  await eventBridge.send(new PutEventsCommand({
    Entries: [{
      EventBusName: process.env.EVENT_BUS_NAME,
      Source: 'order-service',
      DetailType: 'order.created',
      Detail: JSON.stringify(orderCreatedEvent),
    }],
  }));

  console.log('Order created', { orderId, correlationId });

  return {
    statusCode: 201,
    headers: { 'x-correlation-id': correlationId },
    body: JSON.stringify({ orderId, status: 'CREATED' }),
  };
};
```

The customer gets an immediate response with their order ID. They don't wait for inventory checks, email sending, or analytics processing - those happen asynchronously via events.

### Event Consumer: Inventory Service

The Inventory Service subscribes to `order.created` events and reserves stock. It's a good example of reacting to events and publishing new events to continue the workflow.

```typescript
// src/handlers/inventory-service.ts
import { EventBridgeEvent } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { randomUUID } from 'crypto';
import { OrderCreatedEvent } from '../events/order-events';

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const eventBridge = new EventBridgeClient({});

export const handler = async (
  event: EventBridgeEvent<'order.created', OrderCreatedEvent>
): Promise<void> => {
  const orderEvent = event.detail;
  const { correlationId } = orderEvent.metadata;
  const orderId = orderEvent.aggregateId;

  console.log('Reserving inventory', { orderId, correlationId });

  // Attempt to reserve inventory for each item
  const results = await Promise.allSettled(
    orderEvent.data.items.map(item =>
      dynamodb.send(new UpdateCommand({
        TableName: process.env.INVENTORY_TABLE,
        Key: { productId: item.productId },
        UpdateExpression: 'SET reserved = reserved + :qty, available = available - :qty',
        ConditionExpression: 'available >= :qty',
        ExpressionAttributeValues: { ':qty': item.quantity },
      }))
    )
  );

  const failed = results.some(r => r.status === 'rejected');

  if (failed) {
    // Publish failure event - other services can react
    // (e.g., Order Service marks order as failed, Notification sends apology)
    await publishEvent('inventory.reservation.failed', orderId, correlationId, {
      orderId,
      reason: 'Insufficient inventory',
    });
    console.error('Inventory reservation failed', { orderId });
    return;
  }

  // Publish success event - workflow continues
  await publishEvent('inventory.reserved', orderId, correlationId, {
    orderId,
    items: orderEvent.data.items,
  });
  console.log('Inventory reserved', { orderId });
};

async function publishEvent(
  eventType: string,
  aggregateId: string,
  correlationId: string,
  data: Record<string, unknown>
): Promise<void> {
  await eventBridge.send(new PutEventsCommand({
    Entries: [{
      EventBusName: process.env.EVENT_BUS_NAME,
      Source: 'inventory-service',
      DetailType: eventType,
      Detail: JSON.stringify({
        version: '1.0',
        eventId: randomUUID(),
        eventType,
        aggregateId,
        occurredAt: new Date().toISOString(),
        metadata: { correlationId },
        data,
      }),
    }],
  }));
}
```

Notice the pattern: consume an event, do work, publish new events. This creates an event chain that other services can extend. The Shipping Service might listen for `inventory.reserved` to start preparing the shipment. The Order Service might listen for `inventory.reservation.failed` to update the order status.

## Best Practices

After building many event-driven systems, these practices consistently prevent problems:

### 1. Design Events as Versioned Contracts

Events are APIs. Once published, consumers depend on them. Add a version field from day one and never make breaking changes to existing versions.

```typescript
// Good: semantic naming, past tense, versioned
interface OrderCreatedEventV1 {
  version: '1.0';
  eventType: 'order.created';
  // ...
}

// Bad: vague naming, imperative, no version
interface ProcessOrderEvent {
  type: 'processOrder';
  data: any;
}
```

When you need to change the schema, publish a new version and support both during migration.

### 2. Include Correlation IDs for Tracing

A single user action (placing an order) might trigger dozens of events across many services. Correlation IDs let you trace the entire flow.

```typescript
metadata: {
  correlationId: string;  // Same across all events from one user action
  causationId?: string;   // The specific event that triggered this one
}
```

When debugging "why didn't the customer get their confirmation email?", you can search logs for the correlation ID and see every step.

### 3. Make Consumers Idempotent

Events can be delivered more than once (network retries, Lambda retries, replays). Your consumers must handle duplicates gracefully.

```typescript
async function handleEvent(event: OrderCreatedEvent): Promise<void> {
  // Check if we've already processed this exact event
  const processed = await isEventProcessed(event.eventId);
  if (processed) {
    console.log('Duplicate event, skipping', { eventId: event.eventId });
    return;
  }

  await reserveInventory(event);
  await markEventProcessed(event.eventId);
}
```

Alternatively, use DynamoDB conditional writes or database transactions to make the operation itself idempotent.

### 4. Always Use Dead Letter Queues

Events will fail to process. Maybe the handler has a bug. Maybe a downstream dependency is down. DLQs capture these failures so you can investigate and replay.

```typescript
new events.Rule(this, 'OrderCreatedRule', {
  targets: [
    new targets.LambdaFunction(inventoryService, {
      deadLetterQueue: dlq,
      retryAttempts: 3,
      maxEventAge: cdk.Duration.hours(1),
    }),
  ],
});
```

Set up CloudWatch alarms on your DLQ - messages there mean something is broken.

### 5. Archive Events for Replay

EventBridge archives let you replay past events. This is invaluable for:
- Rebuilding a read model after fixing a bug
- Populating a new service with historical data
- Testing how your system handles past scenarios

```typescript
new events.Archive(this, 'OrderEventArchive', {
  sourceEventBus: orderEventBus,
  retention: cdk.Duration.days(365),
  eventPattern: { source: ['order-service'] },
});
```

### 6. Handle Ordering When It Matters

EventBridge doesn't guarantee ordering. Usually this is fine - events are independent. But sometimes order matters (processing withdrawal before deposit = overdraft).

For ordered processing, route events through SQS FIFO queues:

```typescript
const orderedQueue = new sqs.Queue(this, 'OrderedQueue', {
  fifo: true,
  contentBasedDeduplication: true,
});

new events.Rule(this, 'OrderEventsOrdered', {
  eventBus: orderEventBus,
  eventPattern: { source: ['account-service'] },
  targets: [
    new targets.SqsQueue(orderedQueue, {
      messageGroupId: '$.detail.aggregateId', // Group by account ID
    }),
  ],
});
```

## Common Pitfalls

### The Distributed Monolith

**Problem:** Services are separated but still tightly coupled. Each event triggers synchronous processing that must complete before the next step.

```
Order → (wait) → Inventory → (wait) → Payment → (wait) → Shipping
```

This has all the complexity of distributed systems with none of the benefits. If any step is slow, the whole flow is slow.

**Solution:** Design for eventual consistency. If you truly need synchronous orchestration, consider Step Functions or just use request/response.

### Schema Coupling

**Problem:** Changing an event schema breaks all consumers. You're afraid to evolve your events.

**Solution:** Version your schemas. Support old versions during migration. Use schema registry to document and validate. Add fields, don't remove or rename them.

### No Observability

**Problem:** Events flow through the system but you can't see what's happening. Debugging is guesswork.

**Solution:** Structured logging with correlation IDs, CloudWatch dashboards showing event flow, X-Ray tracing across services.

```typescript
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'inventory-service' });

export const handler = async (event) => {
  logger.appendKeys({
    correlationId: event.detail.metadata.correlationId,
    orderId: event.detail.aggregateId,
  });
  logger.info('Processing order event');
  // Now all logs include correlation context
};
```

### Unbounded Queues

**Problem:** Consumers can't keep up. Queues grow until you hit limits or run out of money.

**Solution:** Monitor queue depth, set retention limits, alert before problems become critical.

```typescript
new cloudwatch.Alarm(this, 'QueueDepthAlarm', {
  metric: queue.metricApproximateNumberOfMessagesVisible(),
  threshold: 1000,
  evaluationPeriods: 3,
  alarmDescription: 'Queue depth too high - consumers may be failing',
});
```

## Summary

Event-driven architecture enables loose coupling, independent scaling, and resilient systems - but only when applied thoughtfully.

**Use events when:**
- Multiple services need the same data
- Temporal decoupling benefits your use case
- You need audit trails or event replay
- Services should evolve independently

**Key practices:**
- Design events as versioned contracts
- Include correlation IDs for traceability
- Make consumers idempotent
- Use DLQs and archives
- Monitor queue depths and processing latency

**Avoid:**
- Using events when you need synchronous responses
- Ignoring schema evolution
- Skipping observability
- Assuming exactly-once delivery

Start simple. Add event-driven patterns where they solve real problems, not because they're architecturally fashionable. A well-designed monolith beats a poorly designed distributed system every time.

---

## References

- Fowler, Martin. [What do you mean by "Event-Driven"?](https://martinfowler.com/articles/201701-event-driven.html) - The canonical article defining Event Notification, Event-Carried State Transfer, Event Sourcing, and CQRS patterns.
- [What Is Amazon EventBridge?](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html) - Official AWS documentation for EventBridge.
- [Serverless Applications Lens - AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/welcome.html) - Best practices for serverless event-driven architectures.
- [Event Sourcing pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing) - Microsoft's explanation of event sourcing with trade-offs.
- [Best practices for working with AWS Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html) - Includes guidance on writing idempotent code.
