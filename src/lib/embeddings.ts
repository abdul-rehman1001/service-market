
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