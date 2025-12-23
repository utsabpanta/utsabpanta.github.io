---
title: "RAG Architecture Patterns: Design Decisions That Actually Matter"
excerpt: "A practical guide to building retrieval-augmented generation systems - the architectural trade-offs, common pitfalls, and when RAG isn't the answer."
date: "2025-12-18"
tags: ["ai", "llm", "rag", "architecture", "embeddings", "aws", "bedrock", "claude"]
published: true
---

There's a pattern I've noticed with teams building LLM-powered applications: they rush to implement RAG (Retrieval-Augmented Generation) without understanding the architectural decisions that determine success or failure. The result is systems that are slow, expensive, and return irrelevant results.

RAG isn't complicated in concept - retrieve relevant context, augment your prompt, generate a response. But the devil is in the details. This post covers the design decisions that actually matter.

## What RAG Solves (And What It Doesn't)

Before diving into architecture, let's be clear about what RAG is for.

**RAG solves:**
- Knowledge cutoff limitations (your LLM doesn't know about your internal docs)
- Hallucination reduction (grounding responses in actual documents)
- Domain-specific accuracy (legal, medical, proprietary information)
- Dynamic knowledge (information that changes frequently)

**RAG doesn't solve:**
- Poor data quality (garbage in, garbage out)
- Reasoning limitations of the underlying model
- Tasks requiring real-time computation or actions
- Problems better solved by fine-tuning or traditional search

If your documents are poorly written or contradictory, RAG will faithfully retrieve and amplify that confusion. Start with data quality.

## The Core Architecture

A RAG system has two phases: **indexing** (offline) and **retrieval + generation** (runtime).

```
INDEXING PIPELINE
─────────────────────────────────────────────────────────
Documents → Chunking → Embedding → Vector Database
                ↓           ↓
           Metadata    Embedding Model
           Extraction  (OpenAI, Cohere, etc.)


QUERY PIPELINE
─────────────────────────────────────────────────────────
Query → Embedding → Vector Search → Reranking → LLM
                         ↓              ↓
                    Top-K Results   Filtered Context
                                        ↓
                                   Generated Response
```

Each component involves trade-offs. Let's examine them.

## Decision 1: Chunking Strategy

Chunking is where most RAG implementations go wrong first. Your chunking strategy directly impacts retrieval quality.

### The Trade-off

| Chunk Size | Pros | Cons |
|------------|------|------|
| Small (100-200 tokens) | Precise retrieval, less noise | Loses context, more chunks to search |
| Large (1000+ tokens) | Preserves context, relationships | Dilutes relevance signal, slower |
| Medium (300-500 tokens) | Balanced | May still miss optimal boundaries |

### Beyond Fixed-Size Chunking

Fixed-size chunking ignores document structure. Consider these alternatives:

**Semantic chunking**: Split on topic boundaries rather than token counts. Use an LLM or topic model to identify natural breakpoints.

**Recursive chunking**: Start with large chunks, recursively split only when they exceed your threshold. Preserves structure better than fixed-size.

**Document-aware chunking**: Respect document structure - don't split mid-paragraph, keep headers with their content, preserve code blocks.

**Hierarchical chunking**: Store both large and small chunks. Retrieve small chunks for precision, expand to parent chunks for context.

### My Recommendation

Start with recursive chunking at 400-600 tokens with 50-100 token overlap. Use document-aware splitting to respect natural boundaries. Then measure retrieval quality and adjust. There's no universal optimal size - it depends on your content and query patterns.

## Decision 2: Embedding Model Selection

Your embedding model determines how well semantic similarity maps to actual relevance.

### Key Considerations

**Dimensionality**: Higher dimensions (1536 for OpenAI, 1024 for Cohere) capture more nuance but increase storage and search costs. For most applications, 768-1536 dimensions is sufficient.

**Domain alignment**: General-purpose embeddings (OpenAI, Cohere) work well for broad content. For specialized domains (legal, medical, code), consider domain-specific models or fine-tuning.

**Multilingual needs**: If your content spans languages, choose models trained for multilingual understanding. Don't assume English-optimized models transfer well.

**Cost vs. quality**: OpenAI's embeddings are convenient but add up at scale. Open-source models (sentence-transformers, Instructor) can match quality at a fraction of the cost for self-hosted deployments.

### AWS Bedrock Embeddings

If you're already in the AWS ecosystem, Bedrock provides solid embedding options without managing infrastructure:

```typescript
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });

async function getEmbedding(text: string): Promise<number[]> {
  const response = await bedrock.send(new InvokeModelCommand({
    modelId: 'amazon.titan-embed-text-v2:0',
    body: JSON.stringify({
      inputText: text,
      dimensions: 1024,  // Titan v2 supports 256, 512, or 1024
      normalize: true,
    }),
  }));

  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.embedding;
}
```

**Amazon Titan Embeddings v2** offers configurable dimensions (256/512/1024) - useful for trading off precision vs. storage costs. For multilingual content, **Cohere Embed on Bedrock** handles 100+ languages well.

The advantage of Bedrock: unified billing, no API key management, and integration with other AWS services. The trade-off: slightly higher latency than direct API calls and regional availability constraints.

### The Asymmetric Retrieval Problem

Here's a subtle issue: queries and documents are fundamentally different. Queries are short and intent-driven; documents are long and information-dense. Some embedding models handle this asymmetry poorly.

Models like Instructor and E5 allow you to prefix inputs differently for queries vs. documents, improving retrieval quality. If you're seeing semantically relevant documents not surfacing, this might be why.

## Decision 3: Vector Database Selection

Vector databases are the hot new category, but your choice matters less than you think - at least initially.

### When Simple Is Enough

For prototypes and smaller datasets (<100K vectors), you don't need a dedicated vector database:

- **pgvector**: If you're already on PostgreSQL, add vector search without new infrastructure
- **SQLite with extensions**: Great for local development and embedded applications
- **In-memory (FAISS, Annoy)**: Fastest for small datasets, no persistence overhead

### When to Scale Up

Dedicated vector databases (Pinecone, Weaviate, Qdrant, Milvus) become necessary when:

- Dataset exceeds what fits in memory
- You need distributed search across multiple nodes
- Filtering on metadata is as important as vector similarity
- You need real-time index updates at scale

### Hybrid Search: The Underrated Pattern

Pure vector search has a weakness: it misses exact keyword matches that matter. "Error code E-4012" might not surface if the embedding doesn't capture that specific identifier.

**Hybrid search** combines vector similarity with traditional keyword search (BM25). Most production RAG systems benefit from this approach:

```
Final Score = α × Vector Score + (1 - α) × BM25 Score
```

Databases like Weaviate and Elasticsearch support this natively. If yours doesn't, implement it at the application layer.

## Decision 4: Retrieval Strategy

Retrieval is where architectural decisions compound. A poor strategy wastes good embeddings.

### Beyond Naive Top-K

Simple top-K retrieval has problems:

1. **Redundancy**: Top results often contain overlapping information
2. **Diversity loss**: Clustering around one interpretation of the query
3. **Recency blindness**: No awareness of document freshness

**MMR (Maximal Marginal Relevance)** addresses redundancy by penalizing chunks similar to already-selected ones. It's a simple win for most applications.

**Reranking** with a cross-encoder model (like Cohere Rerank or a local model) dramatically improves precision. The pattern: retrieve top-50 with fast vector search, rerank to top-5 with a more expensive model.

**Query expansion** generates multiple query variants to improve recall. An LLM can rephrase your query into 3-5 alternative formulations, each retrieving candidates that get merged.

### Metadata Filtering

Don't overlook metadata. User permissions, document dates, categories, and source systems are powerful filters that should apply *before* or *during* vector search, not after.

```
Query: "vacation policy"
Metadata filters:
  - document_type: "policy"
  - department: user.department
  - status: "current"
```

Without filtering, you'll retrieve outdated policies from irrelevant departments.

## Decision 5: Context Window Management

You've retrieved relevant chunks. Now what? How you construct the prompt matters enormously.

### The Context Window Trade-off

More context gives the LLM more information but:
- Increases cost (tokens aren't free)
- Increases latency
- Risks "lost in the middle" - LLMs pay less attention to middle context
- Can introduce contradictory information

### Strategies

**Position matters**: Put the most relevant information at the beginning and end of your context. LLMs attend to these positions more reliably.

**Summarization**: For large document sets, summarize before including. Trade some fidelity for token efficiency.

**Source attribution**: Include source identifiers so the LLM can cite specific documents. This helps users verify answers and improves trust.

**Explicit instructions**: Tell the LLM how to handle conflicts, missing information, and uncertainty. "If the documents don't contain the answer, say so clearly."

### Generation with Claude on Bedrock

Here's a practical example using Claude for the generation step:

```typescript
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });

interface RetrievedChunk {
  content: string;
  source: string;
  score: number;
}

async function generateAnswer(
  query: string,
  chunks: RetrievedChunk[]
): Promise<string> {
  // Format chunks with source attribution
  const context = chunks
    .map((chunk, i) => `[Source ${i + 1}: ${chunk.source}]\n${chunk.content}`)
    .join('\n\n---\n\n');

  const systemPrompt = `You are a helpful assistant that answers questions based on the provided context.

Rules:
- Only use information from the provided context
- Cite sources using [Source N] notation
- If the context doesn't contain enough information, say so clearly
- Never make up information not present in the context`;

  const response = await bedrock.send(new InvokeModelCommand({
    modelId: 'anthropic.claude-sonnet-4-20250514',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Context:\n${context}\n\n---\n\nQuestion: ${query}`,
      }],
    }),
  }));

  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.content[0].text;
}
```

Claude's 200K context window is particularly useful for RAG - you can include more chunks when relevance scores are close, reducing the risk of missing important information. The trade-off is cost: more input tokens means higher per-request costs.

## When RAG Is The Wrong Choice

RAG isn't always the answer. Consider alternatives:

**Fine-tuning** is better when:
- You need to change the model's behavior or style
- Your knowledge is relatively static
- You want facts baked into the model weights
- Query latency is critical (no retrieval step)

**Long context windows** (Claude's 200K, GPT-4's 128K) are better when:
- Your entire knowledge base fits in context
- Documents are highly interrelated
- Retrieval precision is hard to achieve

**Traditional search** is better when:
- Users need to browse results, not get a single answer
- Exact matching matters more than semantic similarity
- You need explainable ranking

**Structured queries** are better when:
- Your data is already in databases
- Questions map to SQL/GraphQL queries
- Accuracy requires deterministic retrieval

## The Managed Alternative: Bedrock Knowledge Bases

Before building custom RAG infrastructure, consider whether a managed solution fits your needs. **Amazon Bedrock Knowledge Bases** handles the entire RAG pipeline:

```
Documents (S3) → Automatic Chunking → Titan Embeddings → OpenSearch Serverless
                                                              ↓
                              Query → Retrieval → Claude → Response
```

### When Managed Makes Sense

Bedrock Knowledge Bases is worth considering when:

- **Time-to-market matters**: Skip weeks of infrastructure work
- **Your team lacks RAG expertise**: Sensible defaults out of the box
- **Documents are in S3**: Native integration, automatic syncing
- **You need guardrails**: Built-in content filtering and PII redaction

### When to Build Custom

Build your own when:

- **You need fine-grained control**: Custom chunking, hybrid search, specific reranking
- **Cost optimization is critical**: Managed services have overhead
- **You have specialized requirements**: Domain-specific embeddings, complex metadata filtering
- **Multi-cloud or vendor independence matters**

### Quick Setup with CDK

```typescript
import * as cdk from 'aws-cdk-lib';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';
import * as s3 from 'aws-cdk-lib/aws-s3';

const documentBucket = new s3.Bucket(this, 'DocumentBucket');

const knowledgeBase = new bedrock.CfnKnowledgeBase(this, 'KnowledgeBase', {
  name: 'company-docs-kb',
  roleArn: kbRole.roleArn,
  knowledgeBaseConfiguration: {
    type: 'VECTOR',
    vectorKnowledgeBaseConfiguration: {
      embeddingModelArn: `arn:aws:bedrock:${region}::foundation-model/amazon.titan-embed-text-v2:0`,
    },
  },
  storageConfiguration: {
    type: 'OPENSEARCH_SERVERLESS',
    opensearchServerlessConfiguration: {
      collectionArn: collection.attrArn,
      vectorIndexName: 'docs-index',
      fieldMapping: {
        vectorField: 'embedding',
        textField: 'text',
        metadataField: 'metadata',
      },
    },
  },
});

// Data source syncs automatically when documents change
new bedrock.CfnDataSource(this, 'DocsDataSource', {
  knowledgeBaseId: knowledgeBase.attrKnowledgeBaseId,
  name: 'company-documents',
  dataSourceConfiguration: {
    type: 'S3',
    s3Configuration: {
      bucketArn: documentBucket.bucketArn,
    },
  },
});
```

The honest assessment: Bedrock Knowledge Bases gets you 80% of the way with 20% of the effort. For many use cases, that's the right trade-off. You can always migrate to custom infrastructure later when requirements demand it.

## Common Failure Modes

After seeing many RAG implementations, these patterns emerge:

### 1. Ignoring Evaluation

Teams ship without measuring retrieval quality. Build evaluation sets early:
- Curate 50-100 realistic queries with expected relevant documents
- Measure recall@k and precision@k for retrieval
- Use LLM-as-judge for answer quality (with human spot-checking)

Without measurement, you're optimizing blindly.

### 2. One-Size-Fits-All Chunking

Different document types need different chunking. Code documentation, legal contracts, and support tickets have different structures. A chunking strategy that works for one may fail on others.

### 3. Neglecting the Query Side

All optimization effort goes into indexing. But query understanding matters equally:
- Query classification (is this a factual lookup, comparison, or synthesis?)
- Query rewriting for retrieval optimization
- Handling conversational context in multi-turn interactions

### 4. Over-Engineering Early

Teams add reranking, query expansion, hybrid search, and hierarchical retrieval before validating that basic retrieval works. Start simple, measure, then add complexity where it helps.

## A Practical Starting Point

If I were building a RAG system today, here's where I'd start:

### Option A: Custom Build

1. **Chunking**: Recursive with 500 token target, document-aware boundaries
2. **Embedding**: Titan Embed v2 on Bedrock (or OpenAI `text-embedding-3-small`)
3. **Vector store**: pgvector if on Postgres, OpenSearch Serverless on AWS
4. **Retrieval**: Top-20 vector search → Cohere rerank to top-5
5. **Generation**: Claude Sonnet on Bedrock with explicit citation instructions
6. **Evaluation**: 50 golden queries, measure weekly

### Option B: Managed (Faster Start)

1. **Platform**: Bedrock Knowledge Bases
2. **Storage**: S3 for documents, OpenSearch Serverless for vectors
3. **Model**: Claude for generation, Titan for embeddings
4. **Customization**: Add guardrails, configure chunking parameters
5. **Evaluation**: Still build your golden query set - managed doesn't mean unmeasured

Start with Option B if speed matters and your requirements are standard. Move to Option A when you hit limitations.

Then iterate based on observed failures. The right architecture depends on your specific data, queries, and quality requirements.

## Conclusion

RAG architecture is about trade-offs, not best practices. The optimal chunking strategy, embedding model, and retrieval approach depend on your specific content, query patterns, and accuracy requirements.

Start simple, measure rigorously, and add complexity only when measurements show it helps. The teams that succeed with RAG are the ones that treat it as an iterative engineering problem, not a one-time implementation.

The most sophisticated RAG architecture is worthless if your source documents are poorly written or your evaluation is nonexistent. Focus on fundamentals first.
