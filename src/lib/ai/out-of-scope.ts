import { getEmbedding } from '../embeddings';
import { cosineSimilarity } from '../utils';

/**
 * Example queries for services the platform does NOT offer.
 *
 * The classifier always finds the "nearest" real category, so without these
 * anchors an out-of-scope query (e.g. "sofa deep cleaning") gets pulled
 * towards the closest in-scope examples (e.g. "ac deep cleaning") and is
 * reported as a confident — but wrong — match.
 *
 * If a user query is closer to one of these anchors than to any real
 * category, we report "no match" instead.
 *
 * Keep entries phrased like real user queries. When the platform adds one of
 * these services as a category, remove the related anchors here.
 */
const OUT_OF_SCOPE_EXAMPLES: string[] = [
  // Cleaning services
  'deep cleaning service for home',
  'sofa and carpet deep cleaning service',
  'sofa cleaning service near me',
  'carpet shampoo and cleaning',
  'house cleaning maid service',
  'kitchen and bathroom deep cleaning',
  'mattress and curtain cleaning service',
  'office cleaning service',
  'water tank cleaning service',
  // Laundry / clothes
  'dry cleaning service for clothes',
  'laundry service pick and drop',
  'iron and press clothes service',
  'tailor for stitching clothes',
  // Home renovation / wood / paint
  'paint my house walls',
  'wall painting and whitewash service',
  'carpenter to make furniture',
  'wood work for doors and wardrobe',
  'false ceiling and interior work',
  'marble and tile fixing mason',
  // Garden / pests
  'gardener for lawn maintenance',
  'plant trimming and landscaping',
  'pest control fumigation for cockroaches',
  'termite treatment for home',
  // Personal care
  'beauty parlour services at home',
  'haircut and salon service',
  'massage therapist at home',
  'mehndi artist for event',
  // Food / events
  'cook for home food',
  'catering service for wedding',
  'birthday event decoration',
  'photographer for wedding shoot',
  // Family / education
  'babysitter for kids',
  'home tutor for maths',
  'caretaker for elderly person',
  // Moving / labor
  'packers and movers for house shifting',
  'truck for furniture shifting',
  'labour for loading and unloading',
  // Electronics not in catalog
  'mobile phone screen repair',
  'laptop and computer repair',
  'led tv screen repair',
  'microwave oven repair',
  'water dispenser repair',
  // Misc
  'car wash and detailing at home',
  'security guard for house',
  'cctv camera installation',
  'internet wifi connection installation',
];

let anchorsPromise: Promise<number[][]> | null = null;

function getAnchorEmbeddings(): Promise<number[][]> {
  if (!anchorsPromise) {
    anchorsPromise = Promise.all(OUT_OF_SCOPE_EXAMPLES.map((q) => getEmbedding(q)));
    // Allow a retry on the next request instead of caching a failure.
    anchorsPromise.catch((err) => {
      console.error('Failed to embed out-of-scope anchors:', err);
      anchorsPromise = null;
    });
  }
  return anchorsPromise;
}

/**
 * Returns the highest similarity between the query and any out-of-scope
 * anchor. Returns 0 if the anchors are unavailable so classification can
 * proceed without this guard.
 */
export async function getOutOfScopeScore(queryEmbedding: number[]): Promise<number> {
  let anchors: number[][];
  try {
    anchors = await getAnchorEmbeddings();
  } catch {
    return 0;
  }

  let best = 0;
  for (const anchor of anchors) {
    const sim = cosineSimilarity(queryEmbedding, anchor);
    if (sim > best) best = sim;
  }
  return best;
}
