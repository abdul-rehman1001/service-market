
import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers';

let embedder: FeatureExtractionPipeline | null = null;

async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (!embedder) {
    console.log('Loading embedding model...');
    embedder = await pipeline(
      'feature-extraction',
      'Xenova/paraphrase-multilingual-MiniLM-L12-v2'
    );
    console.log('Model loaded successfully!');
  }
  return embedder;
}

export async function getEmbedding(text: string): Promise<number[]> {
  const model = await getEmbedder();
  const output = await model(text, { 
    pooling: 'mean', 
    normalize: true 
  });
  return Array.from(output.data);
}