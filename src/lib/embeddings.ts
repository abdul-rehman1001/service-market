
import { env, pipeline, FeatureExtractionPipeline } from '@xenova/transformers';

// Serverless environments need a writable cache directory
env.cacheDir = process.env.TRANSFORMERS_CACHE || '/tmp/transformers';
env.allowLocalModels = false;

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