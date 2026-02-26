# 🤖 AI Architecture & Integration Guide

## Overview

This document provides a comprehensive guide to the AI/ML integration in the Service Market platform. The system uses **semantic similarity-based classification** powered by local embeddings to automatically categorize service requests.

---

## 📁 AI Feature File Structure

```
src/
├── lib/
│   ├── embeddings.ts           # Core embedding model (Xenova Transformers)
│   ├── classifier.ts           # Classification logic (semantic matching)
│   ├── training-data.ts        # Training dataset (hardcoded examples)
│   └── utils.ts                # Utility functions (cosine similarity)
│
├── components/
│   └── ServiceClassifier.tsx    # UI Component for classification demo
│
└── app/api/
    └── classify/
        └── route.ts            # API endpoint for classification requests
```

### File Dependencies

```
classify/route.ts
    ↓
classifier.ts ←→ embeddings.ts
    ↓
training-data.ts + utils.ts (cosineSimilarity)
```

---

## 🧠 AI Model Details

### **Which AI Model is Integrated?**

**Name:** Xenova Transformers - Paraphrase Multilingual MiniLM-L12-v2

**Type:** Pre-trained Transformer Model (HuggingFace)

**Purpose:** Convert text into semantic embeddings (dense vector representations)

**Key Specifications:**
- **Model Architecture:** Multilingual BERT-style transformer
- **Embedding Dimension:** 384-dimensional vectors
- **Input:** Any text (queries, service descriptions, examples)
- **Output:** 384-dimensional numerical vector
- **Language Support:** 50+ languages (multilingual)
- **Size:** ~80MB (downloaded on first use)
- **Execution:** Client-side (browser) or server-side (Node.js)

**URL:** `Xenova/paraphrase-multilingual-MiniLM-L12-v2`

```typescript
// Model loading configuration
pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2')
```

---

## 🔄 How It Works Internally

### **Request → Processing → Response Flow**

```
┌─────────────────────────────────────┐
│  USER ENTERS QUERY                   │
│  e.g., "pipe is leaking"            │
└─────────────────┬───────────────────┘
                  │
                  ↓
┌─────────────────────────────────────┐
│  STEP 1: LOAD EMBEDDING MODEL        │
│  - First use: Download from HF       │
│  - Cache it in memory                │
│  - Return cached version on reuse    │
└─────────────────┬───────────────────┘
                  │
                  ↓
┌─────────────────────────────────────┐
│  STEP 2: EMBED USER QUERY            │
│  queryEmbedding = model(query)       │
│  Result: [0.23, -0.45, 0.12, ...]   │
│  (384 dimensions)                    │
└─────────────────┬───────────────────┘
                  │
                  ↓
┌─────────────────────────────────────┐
│  STEP 3: LOOP THROUGH TRAINING DATA │
│  For each example in trainingData:   │
│  - Load training example text        │
│  - Embed it: exampleEmbedding        │
│  - Calculate similarity score        │
│  - Store: {category, score}          │
└─────────────────┬───────────────────┘
                  │
                  ↓
┌─────────────────────────────────────┐
│  STEP 4: CALCULATE SIMILARITY        │
│  similarity = cosineSimilarity(      │
│    queryEmbedding,                   │
│    exampleEmbedding                  │
│  )                                   │
│  Range: [0.0, 1.0] (higher = better) │
└─────────────────┬───────────────────┘
                  │
                  ↓
┌─────────────────────────────────────┐
│  STEP 5: RANK MATCHES                │
│  Sort all matches by similarity      │
│  Highest first                       │
└─────────────────┬───────────────────┘
                  │
                  ↓
┌─────────────────────────────────────┐
│  STEP 6: RETURN RESULTS              │
│  - Best match (category/subcategory) │
│  - Confidence score (0.0-1.0)        │
│  - Top 5 alternative matches         │
└─────────────────────────────────────┘
```

### **Example Walkthrough**

**Input:** `"pipe is leaking"`

**Step 1:** Embed the query
```
queryEmbedding = [0.12, -0.34, 0.56, ..., 0.89] (384 values)
```

**Step 2:** Loop through training data
```
trainingData = {
  "plumber": {
    "pipe_repair": [
      "fix leaking pipe",
      "repair broken pipe",
      "pipe is leaking",  ← Match!
      ...
    ]
  },
  "carpenter": {...},
  "electrician": {...}
}
```

**Step 3:** Embed training examples and compare
```
"fix leaking pipe" → [0.11, -0.35, 0.57, ..., 0.88]
  Similarity: 0.98 ✓

"repair broken pipe" → [0.10, -0.33, 0.54, ..., 0.86]
  Similarity: 0.95 ✓

"pipe is leaking" → [0.12, -0.34, 0.56, ..., 0.89]
  Similarity: 0.99 ✓ BEST MATCH

"unclog drain" → [0.05, -0.20, 0.42, ..., 0.71]
  Similarity: 0.72  ✓

"install light" → [-0.05, 0.10, 0.20, ..., 0.15]
  Similarity: 0.35  ✓
```

**Step 4:** Return results
```json
{
  "category": "plumber",
  "subcategory": "pipe_repair",
  "confidence": 0.99,
  "allMatches": [
    { "category": "plumber", "subcategory": "pipe_repair", "similarity": 0.99 },
    { "category": "plumber", "subcategory": "pipe_repair", "similarity": 0.98 },
    { "category": "plumber", "subcategory": "sink_issues", "similarity": 0.72 },
    ...
  ]
}
```

---

## 🏗️ AI Architecture: Rule-Based vs Machine Learning

### **Current Implementation: Hybrid Approach**

| Aspect | Details |
|--------|---------|
| **Primary Method** | Semantic Similarity (ML-based) |
| **Secondary Method** | Rule-based matching (exact matches) |
| **Classification Type** | **Unsupervised** (no labels needed) |
| **Training Phase** | Not traditional ML training |
| **Model Type** | Pre-trained Encoder (Transfer Learning) |

### **Why Semantic Similarity?**

Unlike strict rule-based systems:
- ✅ Handles variations: "pipe leaking", "leaky pipe", "water from pipes"
- ✅ Understands context and meaning
- ✅ No regex patterns needed
- ✅ Works across languages

Unlike supervised ML:
- ✅ No labeled dataset required
- ✅ No training phase needed
- ✅ Immediate deployment ready
- ✅ No ground truth annotations

---

## 📚 Training & Fine-Tuning Support

### **Current Training Approach**

**Method:** Manual Example Curation (Hardcoded)

The system uses a **training data set** (not neural network training):

```typescript
// src/lib/training-data.ts
export const trainingData = {
  plumber: {
    pipe_repair: [
      "fix leaking pipe",
      "repair broken pipe",
      "pipe is leaking",
      "water dripping from pipe",
      "burst pipe repair"
    ],
    sink_issues: [...],
    ...
  },
  carpenter: {...},
  electrician: {...}
}
```

### **How Training Data Works**

The system:
1. **Does NOT train/adjust** the embedding model
2. **Stores example phrases** for each category
3. **Uses examples as references** to compare against
4. **Ranks matches by similarity** to these examples

### **Adding New Categories/Examples**

**Without Model Retraining:**

1. Open `src/lib/training-data.ts`
2. Add new category:
```typescript
export const trainingData = {
  // ... existing categories
  painter: {
    "wall_painting": [
      "paint my walls",
      "interior painting",
      "exterior paint job",
      "wall color change"
    ],
    "cabinet_painting": [
      "paint kitchen cabinets",
      "cabinet refinish",
      "repaint cabinets"
    ]
  }
}
```
3. Test via API/UI immediately
4. No redeployment necessary (in development)

### **Fine-Tuning the Embedding Model**

**Advanced Option (Future Enhancement):**

To achieve better results, you could:

1. **Collect classified queries** from real users
2. **Create a labeled dataset** of queries with correct categories
3. **Fine-tune the embedding model:**
   ```python
   # Pseudocode for fine-tuning
   from transformers import AutoModel, AutoTokenizer
   from sentence_transformers import SentenceTransformer, losses
   
   model = SentenceTransformer(
     'Xenova/paraphrase-multilingual-MiniLM-L12-v2'
   )
   
   # Train on your domain-specific data
   model.fit(
     train_objectives=[(train_dataloader, train_loss)],
     epochs=10,
     warmup_steps=100
   )
   
   # Save fine-tuned model
   model.save('path/to/finetuned-model')
   ```

4. **Replace model in code:**
   ```typescript
   embedder = await pipeline(
     'feature-extraction',
     'path/to/finetuned-model'  // Custom model
   );
   ```

---

## 📈 Scaling with Large Datasets

### **Current Bottleneck**

With **100+ training examples**, the system loops through all of them:

```typescript
// For each query:
for (const category in trainingData) {
  for (const subcategory in category) {
    for (const example in subcategory) {  // ← BOTTLENECK
      similarity = cosineSimilarity(queryEmbedding, exampleEmbedding)
    }
  }
}
// Time complexity: O(n) where n = total examples
```

**Current Performance:**
- 100 examples: ~100-200ms
- 1000 examples: ~1-2 seconds
- 10,000 examples: ~10-20 seconds ⚠️

### **Scaling Solution 1: Pre-Compute Embeddings** (Recommended)

Instead of computing embeddings at request time, store them:

```typescript
// Pre-compute once:
const trainingEmbeddings = {
  plumber: {
    pipe_repair: [
      {
        text: "fix leaking pipe",
        embedding: [0.12, -0.34, ...] // Pre-computed!
      },
      ...
    ]
  }
}

// At runtime:
for (const example of trainingEmbeddings[category][subcategory]) {
  // No embedding computation needed!
  similarity = cosineSimilarity(
    queryEmbedding,
    example.embedding  // Already computed
  );
}
```

**Improvement:**
- 100 examples: ~10-50ms (10x faster)
- 1000 examples: ~100-500ms
- 10,000 examples: ~1-5 seconds ✅

**Implementation:**
```typescript
// Store in JSON file or database
// Load once at server startup
const precomputedEmbeddings = require('./embeddings-cache.json');
```

### **Scaling Solution 2: Vector Database**

For production with **millions of examples**:

```typescript
// Use specialized vector DB (e.g., Pinecone, Weaviate, Qdrant)
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const index = pinecone.Index('service-classifications');

// Index training examples (one-time)
await index.upsert([
  {
    id: 'plumber-pipe-repair-1',
    values: [0.12, -0.34, ...],  // Embedding
    metadata: {
      category: 'plumber',
      subcategory: 'pipe_repair',
      text: 'fix leaking pipe'
    }
  },
  // ... millions more
]);

// Query at runtime (sub-100ms even with 1M examples)
const results = await index.query({
  vector: queryEmbedding,
  topK: 5,  // Get top 5 matches
  filter: { category: { $eq: 'plumber' } }  // Optional filtering
});
```

**Performance:**
- 1M examples: <100ms ✅
- 10M examples: <100ms ✅
- Cost: ~$0.01-0.10 per query

### **Scaling Solution 3: Hybrid Approach** (Best)

Combine local caching + vector database:

```
┌─────────────────────────────┐
│  User Query                  │
└────────────┬────────────────┘
             │
             ↓
┌─────────────────────────────┐
│  Embed Query (cached model)  │
└────────────┬────────────────┘
             │
             ├─ Check Local Cache First (Fast)
             │   • Popular categories
             │   • Frequently matched examples
             │
             └─ Fallback to Vector DB (Complete)
                • Full dataset
                • Scalable to millions
```

### **Recommended Scaling Path**

| Stage | Approach | Cost | Speed | Examples |
|-------|----------|------|-------|----------|
| MVP | In-memory (current) | Free | 100-200ms | <1000 |
| Scaling | Pre-computed cache | Free | 10-50ms | <10k |
| Production | Vector DB | ~$100/mo | <50ms | 1M+ |

---

## 📊 Similarity Scoring Details

### **Cosine Similarity Formula**

```
similarity(A, B) = (A · B) / (||A|| × ||B||)

Where:
- A · B = dot product (sum of element-wise multiplication)
- ||A|| = magnitude (sqrt of sum of squares)
- Result = [-1, 1] (typically [0, 1] for normalized embeddings)
```

### **Implementation**

```typescript
export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  
  return dotProduct / (magA * magB);
}
```

### **Interpretation**

- **1.0** = Identical vectors (perfect match)
- **0.7-0.99** = Very similar (good match)
- **0.5-0.7** = Similar (acceptable match)
- **0.3-0.5** = Somewhat similar
- **0.0-0.3** = Dissimilar
- **0.0** = Orthogonal (completely unrelated)

---

## 🔧 Integration Points

### **API Endpoint**

**Endpoint:** `POST /api/classify`

**Request:**
```json
{
  "query": "pipe is leaking"
}
```

**Response:**
```json
{
  "success": true,
  "query": "pipe is leaking",
  "category": "plumber",
  "subcategory": "pipe_repair",
  "confidence": 0.99,
  "allMatches": [
    {
      "category": "plumber",
      "subcategory": "pipe_repair",
      "similarity": 0.99
    },
    {
      "category": "plumber",
      "subcategory": "pipe_repair",
      "similarity": 0.98
    }
  ]
}
```

### **UI Component**

Location: `src/components/ServiceClassifier.tsx`

- Text input for user query
- Loading state during classification
- Results display with confidence score
- Alternative matches shown

### **Database Integration**

The classification results are saved in:

**Model:** `ProblemQuery`

```prisma
model ProblemQuery {
  id                  String            @id @default(cuid())
  userId              String
  user                User              @relation(fields: [userId], references: [id])
  
  rawText             String            // Original user input
  detectedCategoryId  String?
  detectedCategory    ServiceCategory?  @relation(...)
  confidenceScore     Float?            // 0.0 - 1.0
  
  createdAt           DateTime @default(now())
}
```

---

## 🎯 Best Practices

### ✅ Do:
- ✓ Add diverse examples to training data
- ✓ Test with typos and variations
- ✓ Monitor confidence scores
- ✓ Log queries for analysis
- ✓ Update training data based on user feedback
- ✓ Use pre-computed embeddings in production

### ❌ Don't:
- ✗ Use confidence < 0.5 without review
- ✗ Modify Xpath without caching
- ✗ Ignore multilingual queries (model supports them!)
- ✗ Store embeddings in session (reload model is cheap)
- ✗ Create too many examples per category (diminishing returns after 10-15)

---

## 🚀 Future Enhancements

1. **Active Learning:** Collect user feedback and improve predictions
2. **Custom Fine-Tuning:** Train on domain-specific data
3. **Multi-Label Classification:** Allow multiple categories per query
4. **Confidence Thresholding:** Reject low-confidence predictions
5. **A/B Testing:** Compare different embedding models
6. **Fallback Mechanism:** Human review for low-confidence queries
7. **Batch Processing:** Process multiple queries in one request
8. **Caching:** Redis cache for repeated queries

---

## 📚 References

- **Xenova Transformers:** https://xenova.github.io/transformers.js/
- **HuggingFace Models:** https://huggingface.co/models
- **Sentence Transformers:** https://www.sbert.net/
- **Cosine Similarity:** https://en.wikipedia.org/wiki/Cosine_similarity
- **Vector Databases:** https://pinecone.io/, https://weaviate.io/

---

**Last Updated:** February 26, 2026  
**Version:** 1.0  
**Status:** Production Ready
