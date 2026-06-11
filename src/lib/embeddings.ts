
import { env, pipeline, FeatureExtractionPipeline } from '@xenova/transformers';

// Serverless environments need a writable cache directory
env.cacheDir = process.env.TRANSFORMERS_CACHE || '/tmp/transformers';
env.allowLocalModels = false;

// Force WASM backend to avoid native onnxruntime in serverless
const backends = env.backends as unknown as {
  onnx: {
    wasm: { numThreads: number; wasmPaths: string };
  };
};
backends.onnx = backends.onnx || ({} as any);
backends.onnx.wasm = backends.onnx.wasm || ({} as any);
backends.onnx.wasm.numThreads = 1;
backends.onnx.wasm.wasmPaths =
  process.env.ONNX_WASM_PATH || 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.1/dist/';

let embedderPromise: Promise<FeatureExtractionPipeline> | null = null;

async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  // Share one in-flight load across concurrent requests. Without this, several
  // simultaneous cold-start requests each download the model, exhausting
  // memory/time in serverless environments.
  if (!embedderPromise) {
    console.log('Loading embedding model...');
    embedderPromise = pipeline(
      'feature-extraction',
      'Xenova/paraphrase-multilingual-MiniLM-L12-v2'
    ).then((model) => {
      console.log('Embedding model loaded successfully!');
      return model;
    });

    // If the load fails (network hiccup, etc.) allow the next request to retry
    // instead of caching the rejected promise forever.
    embedderPromise.catch((err) => {
      console.error('Embedding model failed to load:', err);
      embedderPromise = null;
    });
  }
  return embedderPromise;
}

/**
 * Begins loading the model in the background without blocking the caller.
 * Useful to warm up a fresh serverless instance.
 */
export function warmUpEmbedder(): void {
  getEmbedder().catch(() => {
    // Errors are already logged in getEmbedder; warm-up is best-effort.
  });
}

export async function getEmbedding(text: string): Promise<number[]> {
  const model = await getEmbedder();
  const output = await model(text, { 
    pooling: 'mean', 
    normalize: true 
  });
  return Array.from(output.data);
}