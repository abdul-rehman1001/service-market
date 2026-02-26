# 🤖 AI System Quick Reference Guide

**TL;DR:** This is a semantic similarity-based classification system using local embeddings. No API keys needed. Runs entirely on-device.

---

## 📋 Quick Facts

| What | Details |
|------|---------|
| **AI Type** | Semantic Similarity Classification |
| **Model** | Xenova/paraphrase-multilingual-MiniLM-L12-v2 |
| **Architecture** | Pre-trained Transformer (384-dim embeddings) |
| **Training Method** | No training needed (pre-trained) |
| **Learning Capability** | Manual via training-data.ts updates |
| **API Keys Required** | None ❌ |
| **Cloud Dependencies** | None ❌ (runs locally) |
| **Languages Supported** | 50+ ✅ (multilingual) |
| **Execution Time** | 100-200ms per query |
| **Database Model** | ProblemQuery (stores results) |

---

## 🚀 Getting Started (Developers)

### Adding a New Service Category

**File:** `src/lib/training-data.ts`

1. Add category with examples:
```typescript
export const trainingData: Record<string, Record<string, string[]>> = {
  // ... existing categories
  
  plumber: { /* ... */ },
  electrician: { /* ... */ },
  carpenter: { /* ... */ },
  
  // NEW CATEGORY
  painter: {
    "wall_painting": [
      "paint my walls",
      "interior painting",
      "exterior paint",
      "wall color change",
      "repaint room"
    ],
    "cabinet_painting": [
      "paint cabinets",
      "cabinet refinish",
      "repaint kitchen"
    ]
  }
}
```

2. Test via API:
```bash
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"query": "paint my walls"}'
```

3. Matches return with category `"painter"` ✅

**That's it!** No model retraining needed.

---

## 🔍 Understanding Classification

### Basic Flow

```
User Query → Embed Query → Compare with Examples → Return Top Match
  ↓           ↓               ↓                    ↓
"fix pipe"  [0.12, -0.34]  Similarity: 0.99     plumber
```

### How Similarities Are Calculated

**Cosine Similarity** measures angle between vectors:

```
0.99 = Almost identical (very close)
0.70 = Fairly similar
0.50 = Somewhat similar
0.30 = Quite different
0.00 = Completely unrelated
```

### Confidence Score

**What it means:**
- `confidence >= 0.9` → Reliable prediction ✅
- `0.7-0.9` → Acceptable prediction ⚠️
- `< 0.7` → Consider manual review ❌

---

## 🛠️ Common Tasks

### Task 1: Test a Query
```bash
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"query": "my sink is clogged"}'
```

**Expected Output:**
```json
{
  "success": true,
  "query": "my sink is clogged",
  "category": "plumber",
  "subcategory": "sink_issues",
  "confidence": 0.95,
  "allMatches": [...]
}
```

---

### Task 2: Add More Examples to Existing Category

**File:** `src/lib/training-data.ts`

```typescript
plumber: {
  pipe_repair: [
    "fix leaking pipe",
    "repair broken pipe",
    // ... existing examples
    
    // ADD NEW EXAMPLES (optional line breaks for readability)
    "water leak fix",
    "leaking water line",
    "pipe rupture emergency"
  ]
}
```

**Why add examples?**
- Better match accuracy
- Handles more query variations
- Improves confidence scores

**How many examples?**
- Minimum: 3-5 per subcategory
- Recommended: 5-10 per subcategory
- Maximum: 15-20 (diminishing returns after)

---

### Task 3: Create New Subcategory
```typescript
plumber: {
  pipe_repair: [...],
  sink_issues: [...],
  
  // NEW SUBCATEGORY
  water_heater_repair: [
    "fix water heater",
    "water heater not working",
    "gas water heater repair",
    "electric water heater issue",
    "no hot water"
  ]
}
```

The classifier instantly recognizes it. No redeployment needed in development.

---

### Task 4: Monitor AI Performance
Check database for stored classifications:

```sql
SELECT 
  rawText,
  detectedCategory.name as category,
  confidenceScore,
  createdAt
FROM "ProblemQuery"
ORDER BY createdAt DESC
LIMIT 20;
```

**Analyze:**
- Do low-confidence scores correspond to ambiguous queries?
- Are similar queries getting same category?
- Which categories have lowest confidence?

---

### Task 5: Debug Misclassification
Query returns wrong category? Track it:

```typescript
// In classify/route.ts, enhance logging:
const result = await classifyQuery(query);

console.log('Query:', query);
console.log('Predicted:', result.category, result.subcategory);
console.log('Confidence:', result.confidence);
console.log('Top 5 matches:', result.allMatches.slice(0, 5));
```

Then:
1. Add better examples to correct category
2. Check if prediction makes sense (maybe it's right?)
3. Fine-tune if needed (future)

---

## 📊 File Quick Reference

| File | What | Edit? |
|------|------|-------|
| `embeddings.ts` | Model loading | ❌ Rarely |
| `classifier.ts` | Classification logic | ❌ No |
| **`training-data.ts`** | **Examples** | **✅ Often** |
| `utils.ts` | Utilities | ❌ No |
| `ServiceClassifier.tsx` | UI | ✅ Sometimes |
| `classify/route.ts` | API endpoint | ⚠️ Careful |

---

## 🐛 Troubleshooting

### Problem: Model takes 3+ seconds to load
**Cause:** First use, downloading model
**Solution:** Wait for download to complete, then it's cached
**Prevention:** Pre-load model at startup

### Problem: Classification is inaccurate
**Cause:** Insufficient or poor examples
**Solution:** Add 5-10 relevant examples to training data
**Prevention:** Collect real user queries and add to training set

### Problem: Confidence score is 0.45
**Cause:** Query doesn't match any category well
**Solution:** Add example queries matching this intent
**Prevention:** Monitor low-confidence queries, retrain regularly

### Problem: API returns 500 error
**Cause:** Model failed to load or corrupted
**Solution:** Check console logs, restart server
**Prevention:** Add error handling and model validation

---

## 🎯 Performance Tips

### Tip 1: Pre-Compute Training Embeddings
Instead of computing embeddings every request:

```typescript
// In embeddings.ts, add this function
export async function precomputeEmbeddings() {
  const model = await getEmbedder();
  const precomputed = {};
  
  for (const [category, subcategories] of Object.entries(trainingData)) {
    for (const [sub, examples] of Object.entries(subcategories)) {
      precomputed[`${category}-${sub}`] = await Promise.all(
        examples.map(ex => getEmbedding(ex))
      );
    }
  }
  
  return precomputed;
}
```

**Result:** 10x faster classification (100-200ms → 10-20ms)

### Tip 2: Cache Recent Classifications
```typescript
const classificationCache = new Map<string, ClassificationResult>();

export async function classifyQuery(query: string) {
  if (classificationCache.has(query)) {
    return classificationCache.get(query)!;
  }
  
  const result = await classifyQueryInternal(query);
  classificationCache.set(query, result);
  
  return result;
}
```

**Result:** 0ms for repeated queries

### Tip 3: Use Vector Database for Scale
For 10,000+ examples, use Pinecone or Weaviate:
```typescript
const index = pinecone.Index('service-classifications');
const results = await index.query({
  vector: queryEmbedding,
  topK: 5  // Get top 5 matches (sub-100ms)
});
```

---

## 📚 Code Examples

### Example 1: Use Classifier in Your Code
```typescript
import { classifyQuery } from '@/lib/classifier';

const result = await classifyQuery("pipe is leaking");
console.log(result.category);        // "plumber"
console.log(result.subcategory);     // "pipe_repair"
console.log(result.confidence);      // 0.99
```

### Example 2: Use in API Route
```typescript
import { classifyQuery } from '@/lib/classifier';

export async function POST(req: NextRequest) {
  const { userQuery } = await req.json();
  
  const classification = await classifyQuery(userQuery);
  
  // Save to database
  await prisma.problemQuery.create({
    data: {
      userId: user.id,
      rawText: userQuery,
      detectedCategoryId: getCategory(classification.category),
      confidenceScore: classification.confidence
    }
  });
  
  return NextResponse.json(classification);
}
```

### Example 3: Handle Low Confidence
```typescript
const result = await classifyQuery(userQuery);

if (result.confidence < 0.7) {
  // Ask user to clarify
  return {
    message: "I'm not sure about this service. Can you clarify?",
    suggestions: result.allMatches.slice(0, 3)
  };
} else {
  // Proceed with classification
  return result;
}
```

---

## 🔐 Security Notes

✅ **Safe:**
- Model runs locally (no data sent to cloud)
- No API keys exposed
- No external dependencies

⚠️ **Consider:**
- Model takes ~80MB disk space
- First load is slow (3-5s for download)
- Embedding computation uses CPU

---

## 📖 Learning Resources

| Resource | Topic |
|----------|-------|
| [Xenova Docs](https://xenova.github.io/transformers.js/) | Using transformers.js |
| [HuggingFace Models](https://huggingface.co/models) | Available pre-trained models |
| [Embeddings 101](https://www.sbert.net/) | Understanding embeddings |
| [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity) | Math behind similarity |

---

## ✅ Checklist Before Production

- [ ] Test with real user queries
- [ ] Monitor confidence scores
- [ ] Set up classification logging
- [ ] Validate predictions against ground truth
- [ ] Add error handling
- [ ] Consider pre-computed embeddings
- [ ] Document custom categories
- [ ] Train team on adding examples
- [ ] Set up monitoring dashboard
- [ ] Create feedback loop for improvement

---

## 🆘 Who to Ask

| Question | Where |
|----------|-------|
| How to add category? | Check AI_FILE_STRUCTURE.md |
| Why low confidence? | Add more examples to training-data.ts |
| Model performance? | Check AI_ARCHITECTURE.md scaling section |
| Custom fine-tuning? | See AI_ARCHITECTURE.md training section |
| API details? | Check API endpoint docs |

---

**Version:** 1.0  
**Last Updated:** February 26, 2026  
**Status:** Ready to Use ✅
