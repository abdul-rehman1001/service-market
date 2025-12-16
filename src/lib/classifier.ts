
import { getEmbedding } from './embeddings';
import { trainingData } from './training-data';
import { cosineSimilarity } from './utils';

interface ClassificationResult {
  category: string;
  subcategory: string;
  confidence: number;
  allMatches: Array<{
    category: string;
    subcategory: string;
    similarity: number;
  }>;
}

export async function classifyQuery(query: string): Promise<ClassificationResult> {
  const queryEmbedding = await getEmbedding(query);
  
  const matches: Array<{
    category: string;
    subcategory: string;
    similarity: number;
  }> = [];

  for (const [category, subcategories] of Object.entries(trainingData)) {
    for (const [subcategory, examples] of Object.entries(subcategories)) {
      for (const example of examples) {
        const exampleEmbedding = await getEmbedding(example);
        const similarity = cosineSimilarity(queryEmbedding, exampleEmbedding);
        
        matches.push({
          category,
          subcategory,
          similarity
        });
      }
    }
  }

  matches.sort((a, b) => b.similarity - a.similarity);


  const bestMatch = matches[0];

  return {
    category: bestMatch.category,
    subcategory: bestMatch.subcategory,
    confidence: bestMatch.similarity,
    allMatches: matches.slice(0, 5) 
  };
}
