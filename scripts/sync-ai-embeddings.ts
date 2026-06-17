import { syncCatalogEmbeddings } from '../src/lib/ai/sync-catalog-embeddings';

/**
 * Sync embeddings from src/data/ai-categories.json into AiCategoryEmbedding.
 *
 * CLI flags (recommended):
 *   npm run ai:sync-embeddings:new     → --only-new --skip-labeled-data
 *   npm run ai:sync-embeddings -- --only-new
 *
 * Optional env vars (see .env.example): AI_SYNC_ONLY_NEW, AI_SYNC_SKIP_LABELED_DATA
 */
function parseOptions() {
  const args = process.argv.slice(2);

  return {
    onlyNew:
      args.includes('--only-new') || process.env.AI_SYNC_ONLY_NEW === 'true',
    skipLabeledData:
      args.includes('--skip-labeled-data') ||
      process.env.AI_SYNC_SKIP_LABELED_DATA === 'true',
  };
}

async function run() {
  const options = parseOptions();

  console.log('Syncing AI category embeddings from JSON catalog...');
  if (options.onlyNew) {
    console.log('Mode: incremental (skip embeddings already in DB).');
  }
  if (options.skipLabeledData) {
    console.log('Mode: skip labeled data array.');
  }

  const summary = await syncCatalogEmbeddings(options);

  console.log('AI embedding sync completed.');
  console.log(`Categories: ${summary.totalCategories}`);
  console.log(`Example queries scanned: ${summary.totalExampleQueries}`);
  console.log(`Embeddings stored/updated: ${summary.totalEmbeddingsStored}`);
  console.log(`Embeddings skipped (already in DB): ${summary.totalSkipped}`);
}

run().catch((error) => {
  console.error('AI embedding sync failed:', error);
  process.exit(1);
});
