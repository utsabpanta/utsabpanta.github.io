---
title: "AWS re:Invent 2025: A Game-Changing Year for Serverless"
excerpt: "A deep dive into the most impactful announcements for Lambda, DynamoDB, and API Gateway from AWS re:Invent 2025, and how they'll transform the way engineers build modern applications."
date: "2025-12-15"
tags: ["aws", "serverless", "lambda", "dynamodb", "api-gateway", "reinvent"]
published: true
---

AWS re:Invent 2025, held November 30 - December 4 in Las Vegas, delivered some of the most significant serverless announcements in years. As someone who has spent considerable time building applications on AWS serverless technologies, I'm genuinely excited about these updates. Let's dive into the key announcements for Lambda, DynamoDB, and API Gateway, and explore how they'll impact your engineering work.

## AWS Lambda: Breaking New Ground

### Lambda Durable Functions

This is arguably the most significant Lambda announcement in years. **Durable Functions** fundamentally change how we build long-running, stateful workflows on Lambda.

#### What Problem Does It Solve?

Previously, orchestrating multi-step workflows required either:
- Step Functions (additional service, extra cost, different programming model)
- Custom checkpoint logic with DynamoDB or S3
- Breaking workflows into multiple Lambdas with complex event coordination

Durable Functions let you write workflows that can run for **up to one year** while only paying for actual compute time - not idle wait time.

#### How It Works

The magic behind Durable Functions is a **checkpoint-based replay system**. Think of it like a video game save point - when your function needs to pause (maybe waiting for human approval or an external event), it saves its progress. When execution resumes, Lambda replays your function from the beginning but fast-forwards through completed checkpoints, picking up exactly where it left off.

This replay happens automatically when:
- Your function hits its timeout limit mid-execution
- You explicitly pause with `context.wait()` to await an external event

#### Practical Example: Order Processing Workflow

```typescript
import { DurableContext, checkpoint, waitForEvent } from '@aws-lambda-durable/core';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'order-processor' });

interface OrderEvent {
  orderId: string;
  customerId: string;
}

interface WarehouseConfirmation {
  orderId: string;
  warehouseId: string;
}

export const handler = async (event: OrderEvent, context: DurableContext) => {
  const { orderId, customerId } = event;
  logger.info('Processing order', { orderId, customerId });

  const inventoryStatus = await checkpoint('validate_inventory', () =>
    validateInventory(orderId)
  );

  if (!inventoryStatus.available) {
    return { status: 'failed', reason: 'out_of_stock' };
  }

  const payment = await checkpoint('process_payment', () =>
    processPayment(orderId, customerId)
  );

  // Wait for warehouse confirmation - no compute cost during wait
  const warehouse = await waitForEvent<WarehouseConfirmation>({
    eventName: 'warehouse_confirmation',
    timeoutSeconds: 604800, // 7 days
  });

  const shipping = await checkpoint('ship_order', () =>
    shipOrder(orderId, warehouse.warehouseId, payment.transactionId)
  );

  return { status: 'completed', trackingId: shipping.trackingId };
};
```

#### Key Benefits for Engineers

1. **Automatic Retries**: Failed checkpoints are automatically retried without duplicating completed work
2. **Idempotency Built-In**: The replay mechanism ensures operations aren't duplicated
3. **Version Pinning**: During replay, your function uses the same code version that started the execution
4. **Familiar Tools**: Full support for VPC, layers, EventBridge, and other Lambda features

#### Infrastructure as Code with CDK

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class OrderProcessingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const orderProcessor = new nodejs.NodejsFunction(this, 'OrderProcessor', {
      entry: 'src/handlers/order-processor.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      durableExecution: {
        enabled: true,
        maxDuration: cdk.Duration.days(365),
      },
      timeout: cdk.Duration.minutes(15),
      memorySize: 1024,
    });
  }
}
```

CDK, CloudFormation, and Terraform all support Durable Functions out of the box.

### Lambda Managed Instances

This feature bridges the gap between Lambda's simplicity and EC2's flexibility.

#### The Problem It Solves

Some workloads need:
- Specialized hardware (GPU, high-memory instances)
- Consistent EC2 pricing models (Reserved Instances, Savings Plans)
- Extended execution beyond Lambda's 15-minute limit

Previously, these requirements forced you to manage EC2 infrastructure directly, losing Lambda's operational benefits.

#### How It Works

You keep the same Lambda programming model and event triggers, but your code runs on EC2 instances in your account instead of AWS's shared infrastructure. The key insight here is that **you get EC2's flexibility without the operational burden** - AWS handles all the undifferentiated heavy lifting:
- Security patches and OS updates happen automatically
- Traffic spikes trigger automatic scaling
- Load distribution across instances is handled for you

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';

const mlInference = new nodejs.NodejsFunction(this, 'MLInference', {
  entry: 'src/handlers/ml-inference.ts',
  handler: 'handler',
  managedInstance: {
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.G5, ec2.InstanceSize.XLARGE),
    computeSavingsPlan: true,
  },
  timeout: cdk.Duration.hours(1),
  memorySize: 10240,
});
```

#### Real-World Use Cases

1. **ML Inference**: Run models on GPU instances while keeping Lambda's event-driven model
2. **Cost Optimization**: Use Reserved Instance pricing for predictable Lambda workloads
3. **Extended Processing**: Jobs that need more than 15 minutes but don't warrant a full ECS setup

---

## Amazon DynamoDB: Cost Savings and Enhanced Capabilities

### Database Savings Plans (Up to 35% Off)

This announcement received one of the loudest cheers during the keynote. Database Savings Plans offer **up to 35% savings** across seven AWS database services in exchange for a one-year commitment.

#### What Makes This Different?

Previous reserved capacity models were rigid - you committed to specific tables and regions. The new savings plans offer:

- **Cross-Service Flexibility**: Your commitment applies across Aurora, RDS, DynamoDB, DocumentDB, Neptune, ElastiCache, and Timestream
- **Region Flexibility**: Move workloads between regions without losing your discount
- **Engine Flexibility**: Switch database engines (within the plan) without penalty

#### Example: Cost Calculation

```
Current DynamoDB Spend: $10,000/month
With 35% Savings Plan:  $6,500/month
Annual Savings:         $42,000
```

For teams running multiple database types across different projects, this flexibility is transformative.

### Multi-Attribute Composite Keys

This feature eliminates the need for synthetic sort keys - a common DynamoDB modeling pattern that always felt like a workaround.

#### The Old Way (Synthetic Keys)

```typescript
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Synthetic composite keys - verbose and error-prone
async function createTask(userId: string, status: string, priority: number) {
  await client.send(new PutCommand({
    TableName: 'Tasks',
    Item: {
      PK: `USER#${userId}`,
      SK: `${status}#${priority}#${Date.now()}`, // Manual key composition
      userId,
      status,
      priority,
    },
  }));
}
```

#### The New Way (Multi-Attribute Composite Keys)

```typescript
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

// CDK: Define table with multi-attribute composite key GSI
const tasksTable = new dynamodb.Table(this, 'TasksTable', {
  partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'taskId', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

// New: GSI with multi-attribute composite sort key
tasksTable.addGlobalSecondaryIndex({
  indexName: 'StatusPriorityIndex',
  partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
  sortKey: {
    compositeAttributes: ['status', 'priority', 'createdAt'], // No synthetic keys!
  },
});
```

```typescript
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Items stay clean - no synthetic key construction needed
await client.send(new PutCommand({
  TableName: 'Tasks',
  Item: {
    userId: 'user-123',
    taskId: 'task-456',
    status: 'pending',
    priority: 1,
    createdAt: '2025-12-15T10:00:00Z',
    title: 'Review PR',
  },
}));

// Query using composite key GSI
const { Items } = await client.send(new QueryCommand({
  TableName: 'Tasks',
  IndexName: 'StatusPriorityIndex',
  KeyConditionExpression: 'userId = :uid AND begins_with(#sk, :prefix)',
  ExpressionAttributeNames: { '#sk': 'status#priority#createdAt' },
  ExpressionAttributeValues: { ':uid': 'user-123', ':prefix': 'pending#1' },
}));
```

#### Benefits

1. **No Data Backfill**: Use existing attributes directly as key components
2. **Cleaner Data Model**: Items contain only business data, not synthetic keys
3. **Easier Queries**: Query patterns become more intuitive

### Zero-ETL Integration with Redshift and SageMaker

DynamoDB changes are now **automatically replicated** to Amazon Redshift and SageMaker Lakehouse.

```typescript
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as redshift from 'aws-cdk-lib/aws-redshift';

// Reference your existing Redshift cluster
const cluster = redshift.Cluster.fromClusterAttributes(this, 'Cluster', {
  clusterName: 'analytics-cluster',
  clusterEndpointAddress: 'analytics-cluster.xxx.region.redshift.amazonaws.com',
  clusterEndpointPort: 5439,
});

const ordersTable = new dynamodb.Table(this, 'OrdersTable', {
  tableName: 'orders',
  partitionKey: { name: 'orderId', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  zeroEtlIntegrations: [{
    target: cluster,
    targetDatabase: 'analytics',
    targetSchema: 'ddb_replica',
  }],
});

// Data automatically flows: DynamoDB -> Redshift
// Query: SELECT * FROM analytics.ddb_replica.orders
```

#### Use Case: Real-Time Analytics

```sql
-- Query DynamoDB data in Redshift (near real-time sync)
SELECT product_category, COUNT(*) as order_count, SUM(total_amount) as revenue
FROM analytics.ddb_replica.orders
WHERE order_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY product_category
ORDER BY revenue DESC;
```

### Multi-Region Strong Consistency

Previously, DynamoDB Global Tables offered only eventual consistency. Now you can achieve **strong consistency across regions**.

#### When You Need This

```typescript
import { DynamoDBClient, TransactWriteItemsCommand, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});

interface ReserveParams {
  productId: string;
  warehouseId: string;
  quantity: number;
}

type ReserveResult =
  | { success: true; reserved: number }
  | { success: false; reason: string };

async function reserveInventory(params: ReserveParams): Promise<ReserveResult> {
  const { productId, warehouseId, quantity } = params;

  try {
    await client.send(new TransactWriteItemsCommand({
      TransactItems: [{
        Update: {
          TableName: 'Inventory',
          Key: marshall({ productId, warehouseId }),
          UpdateExpression: 'SET available = available - :qty, reserved = reserved + :qty',
          ConditionExpression: 'available >= :qty',
          ExpressionAttributeValues: marshall({ ':qty': quantity }),
        },
      }],
      ConsistencyLevel: 'STRONG_GLOBAL', // Strong consistency across all regions
    }));
    return { success: true, reserved: quantity };
  } catch (err) {
    if (err instanceof TransactionCanceledException) {
      return { success: false, reason: 'insufficient_inventory' };
    }
    throw err;
  }
}
```

```typescript
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

const inventoryTable = new dynamodb.Table(this, 'InventoryTable', {
  partitionKey: { name: 'productId', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'warehouseId', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  replicationRegions: ['us-west-2', 'eu-west-1', 'ap-northeast-1'],
  globalConsistencyMode: dynamodb.GlobalConsistencyMode.STRONG,
});
```

This is critical for:
- Financial transactions
- Inventory management
- Any application requiring global ACID guarantees

---

## Amazon API Gateway: Modern API Capabilities

### Response Streaming for REST APIs

API Gateway previously had a hard **10 MB response limit** and no streaming support. This created problems for:
- Streaming AI agent responses
- Large report generation
- Real-time log streaming

#### Before: Chunked Workarounds

```typescript
// Old approach: Multiple requests for large responses - painful!
interface ReportChunk {
  data: Record<string, unknown>[];
  nextOffset: number | null;
  total: number;
}

async function getReportChunk(
  reportId: string,
  offset: number,
  limit: number
): Promise<ReportChunk> {
  // Client had to make multiple requests and stitch results together
  const data = await fetchReportData(reportId, offset, limit);
  return {
    data,
    nextOffset: data.length === limit ? offset + limit : null,
    total: await getReportTotal(reportId),
  };
}
```

#### After: Native Streaming

```typescript
import { APIGatewayProxyEventV2 } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEventV2) => {
  const reportId = event.pathParameters?.reportId;
  if (!reportId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing reportId' }) };
  }

  async function* streamReport(): AsyncGenerator<string> {
    yield '{"data":[';
    let first = true;
    for await (const record of fetchLargeDataset(reportId)) {
      yield first ? '' : ',';
      first = false;
      yield JSON.stringify(record);
    }
    yield ']}';
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: streamReport(),
    streamResponse: true,
  };
};
```

#### AI Agent Response Streaming

This is particularly valuable for LLM-powered applications:

```typescript
import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from '@aws-sdk/client-bedrock-runtime';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

const bedrock = new BedrockRuntimeClient({});

export const handler = async (event: APIGatewayProxyEventV2) => {
  const { prompt, maxTokens = 1000 } = JSON.parse(event.body || '{}');
  if (!prompt) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing prompt' }) };
  }

  async function* streamResponse(): AsyncGenerator<string> {
    const response = await bedrock.send(new InvokeModelWithResponseStreamCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    }));

    for await (const chunk of response.body || []) {
      if (chunk.chunk?.bytes) {
        const parsed = JSON.parse(new TextDecoder().decode(chunk.chunk.bytes));
        if (parsed.type === 'content_block_delta') {
          yield parsed.delta.text;
        }
      }
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/event-stream' },
    body: streamResponse(),
    streamResponse: true,
  };
};
```

No more Lambda Function URLs workarounds for streaming AI responses!

### Developer Portal Auto-Generation

API Gateway now **automatically generates a developer portal** for your APIs.

#### What It Does

1. **API Discovery**: Automatically catalogs all your APIs
2. **Documentation**: Generates and maintains docs automatically
3. **Testing**: Developers can test APIs directly in the portal
4. **Auto-Updates**: When APIs change, documentation updates automatically

```typescript
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';

const developerPool = new cognito.UserPool(this, 'DeveloperPool', {
  userPoolName: 'api-developers',
  selfSignUpEnabled: true,
  signInAliases: { email: true },
});

const api = new apigateway.RestApi(this, 'ProductApi', {
  restApiName: 'Product API',
  deployOptions: { stageName: 'prod' },
  developerPortal: {
    enabled: true,
    customDomain: 'api-docs.yourcompany.com',
    authentication: { cognitoUserPool: developerPool },
    autoDiscovery: true,
  },
});

// Add endpoints - portal docs update automatically
const products = api.root.addResource('products');
products.addMethod('GET', new apigateway.LambdaIntegration(listProductsFn), {
  operationName: 'ListProducts',
});
products.addMethod('POST', new apigateway.LambdaIntegration(createProductFn), {
  operationName: 'CreateProduct',
});
```

This eliminates the eternal problem of stale API documentation.

### Model Context Protocol (MCP) Proxy Support

API Gateway now supports **MCP proxy**, enabling standard REST APIs to function as tools for AI agents.

```typescript
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// Enable MCP proxy on your existing API
const api = new apigateway.RestApi(this, 'CustomerApi', {
  restApiName: 'Customer Service API',
  // New: Enable MCP proxy for AI agent consumption
  mcpProxy: {
    enabled: true,
    toolDefinitions: [
      {
        name: 'get_customer',
        description: 'Retrieve customer information by their unique ID',
        endpoint: '/customers/{id}',
        method: 'GET',
        parameters: {
          id: {
            type: 'string',
            description: 'The unique customer identifier',
            required: true,
          },
        },
      },
      {
        name: 'list_orders',
        description: 'List all orders for a customer with optional status filter',
        endpoint: '/customers/{customerId}/orders',
        method: 'GET',
        parameters: {
          customerId: { type: 'string', required: true },
          status: { type: 'string', enum: ['pending', 'shipped', 'delivered'] },
        },
      },
      {
        name: 'create_support_ticket',
        description: 'Create a new support ticket for a customer issue',
        endpoint: '/support/tickets',
        method: 'POST',
        requestBody: {
          customerId: { type: 'string', required: true },
          subject: { type: 'string', required: true },
          description: { type: 'string', required: true },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
      },
    ],
  },
});
```

This means your existing APIs can be instantly consumed by AI agents without modification.

### Direct ALB Integration

**Before**: API Gateway -> NLB -> ALB (unnecessary hop and extra cost)
**After**: API Gateway -> ALB (direct connection via VPC Link v2)

```typescript
import * as cdk from 'aws-cdk-lib';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

// Your existing VPC and ALB
const vpc = ec2.Vpc.fromLookup(this, 'Vpc', { vpcId: 'vpc-xxx' });
const alb = elbv2.ApplicationLoadBalancer.fromLookup(this, 'ALB', {
  loadBalancerArn: 'arn:aws:elasticloadbalancing:...',
});

// Create VPC Link for direct ALB access (no NLB needed!)
const vpcLink = new apigatewayv2.VpcLink(this, 'VpcLink', {
  vpc,
  subnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
});

// Create HTTP API with direct ALB integration
const httpApi = new apigatewayv2.HttpApi(this, 'HttpApi', {
  apiName: 'direct-alb-api',
});

// New: Direct ALB integration - no NLB middleman!
const albIntegration = new apigatewayv2_integrations.HttpAlbIntegration(
  'AlbIntegration',
  alb.listeners[0],
  {
    vpcLink,
    // Traffic goes directly to ALB, reducing latency
  }
);

httpApi.addRoutes({
  path: '/{proxy+}',
  methods: [apigatewayv2.HttpMethod.ANY],
  integration: albIntegration,
});

// Output the API endpoint
new cdk.CfnOutput(this, 'ApiEndpoint', {
  value: httpApi.apiEndpoint,
});
```

This reduces latency and eliminates the cost of an intermediate NLB.

---

## Putting It All Together: A Modern Serverless Architecture

Here's how these features combine for a modern application:

```
                                    ┌─────────────────────────┐
                                    │   Developer Portal      │
                                    │   (Auto-generated)      │
                                    └───────────┬─────────────┘
                                                │
┌─────────────┐     ┌───────────────────────────▼───────────────────────────┐
│   Clients   │────▶│            API Gateway (Streaming + MCP)              │
└─────────────┘     └───────────────────────────┬───────────────────────────┘
                                                │
                    ┌───────────────────────────┼───────────────────────────┐
                    │                           │                           │
                    ▼                           ▼                           ▼
        ┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
        │  Lambda Durable   │       │  Lambda Managed   │       │  Standard Lambda  │
        │   (Workflows)     │       │   (ML on GPU)     │       │   (Fast APIs)     │
        └─────────┬─────────┘       └─────────┬─────────┘       └─────────┬─────────┘
                  │                           │                           │
                  └───────────────────────────┼───────────────────────────┘
                                              │
                                              ▼
                              ┌───────────────────────────────┐
                              │         DynamoDB              │
                              │   (Multi-Region, Strong       │
                              │    Consistency, Zero-ETL)     │
                              └───────────────┬───────────────┘
                                              │
                                              ▼
                              ┌───────────────────────────────┐
                              │         Redshift              │
                              │    (Zero-ETL Analytics)       │
                              └───────────────────────────────┘
```

---

## Key Takeaways for Engineers

1. **Lambda Durable Functions** eliminate the need for Step Functions in many scenarios, simplifying your architecture and reducing costs for long-running workflows.

2. **Lambda Managed Instances** let you use specialized hardware while keeping Lambda's operational simplicity - particularly valuable for ML workloads.

3. **DynamoDB Savings Plans** provide significant cost reductions with unprecedented flexibility. Start planning your commitment strategy now.

4. **Multi-Attribute Composite Keys** clean up your DynamoDB data models. Consider migrating existing synthetic key patterns.

5. **API Gateway Streaming** finally enables proper LLM integration without workarounds. Update your AI-powered APIs to use native streaming.

6. **Zero-ETL** eliminates complex data pipelines. If you're running ETL from DynamoDB to Redshift, migrate to the native integration.

---

## Getting Started

All these features are available now. Here's my recommended approach:

1. **Start with Durable Functions** for your next workflow requirement - the learning curve is minimal if you already know Lambda
2. **Evaluate Savings Plans** immediately - the 35% savings add up quickly
3. **Enable Developer Portal** on your existing APIs - it's a quick win for documentation
4. **Prototype streaming responses** if you're building AI features

These announcements represent AWS's continued commitment to making serverless the default choice for modern applications. The gap between serverless and traditional infrastructure continues to narrow, with fewer reasons to choose the complexity of self-managed infrastructure.

---

## Sources

- [Top announcements of AWS re:Invent 2025 - AWS Blog](https://aws.amazon.com/blogs/aws/top-announcements-of-aws-reinvent-2025/)
- [The biggest re:Invent 2025 serverless announcements - The Burning Monk](https://theburningmonk.com/2025/12/the-biggest-reinvent-2025-serverless-announcements/)
- [AWS re:Invent 2025 - Deep Dive on Lambda Durable Functions](https://dev.to/kazuya_dev/aws-reinvent-2025-new-launch-deep-dive-on-aws-lambda-durable-functions-cns380-3edi)
- [AWS re:Invent 2025 biggest announcements - Refactored](https://www.refactored.pro/blog/2025/12/2/aws-reinvent-2025-biggest-announcements)
- [AWS re:Invent 2025 - Advanced DynamoDB Data Modeling](https://dev.to/kazuya_dev/aws-reinvent-2025-advanced-data-modeling-with-amazon-dynamodb-dat414-3g47)
- [The hot new thing at AWS re:Invent - GeekWire](https://www.geekwire.com/2025/the-hot-new-thing-at-aws-reinvent-a-database-pricing-update/)
- [AWS re:Invent 2025 - Serverless.com Newsletter](https://www.serverless.com/blog/use-new-aws-re-invent-features-today)
