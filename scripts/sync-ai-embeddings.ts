import { syncCatalogEmbeddings } from '../src/lib/ai/sync-catalog-embeddings';

async function run() {
  console.log('Syncing AI category embeddings from JSON catalog...');

  const summary = await syncCatalogEmbeddings();

  console.log('AI embedding sync completed.');
  console.log(`Categories: ${summary.totalCategories}`);
  console.log(`Example queries: ${summary.totalExampleQueries}`);
  console.log(`Embeddings stored: ${summary.totalEmbeddingsStored}`);
}

run()
  .catch((error) => {
    console.error('AI embedding sync failed:', error);
    process.exit(1);
  });
