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
  // ── Cleaning ──────────────────────────────────────────────────────────────
  'deep cleaning service for home',
  'sofa and carpet deep cleaning',
  'sofa cleaning service near me',
  'carpet shampoo and steam cleaning',
  'house cleaning maid service',
  'kitchen and bathroom deep cleaning',
  'mattress and curtain cleaning',
  'office cleaning service',
  'water tank cleaning service',
  'home cleaning service needed',
  'room cleaning service at home',
  'bathroom deep cleaning',
  'I need home cleaning service',
  'ghar ki safai chahiye',
  'maid for house cleaning needed',
  'weekly cleaning maid service',
  'spring cleaning full house',
  'post renovation cleaning service',
  'window cleaning service',
  'roof cleaning service',

  // ── Laundry / clothes ────────────────────────────────────────────────────
  'dry cleaning for clothes',
  'laundry service pick and drop',
  'iron and press clothes service',
  'tailor for stitching clothes',
  'clothes washing and ironing',
  'suit stitching tailor needed',
  'dress alteration service',
  'curtain stitching tailor',

  // ── Education / tutoring ─────────────────────────────────────────────────
  'I need a teacher',
  'home tutor for maths',
  'online tuition service',
  'private tutor for my child',
  'academy for o level tuition',
  'home teacher needed for class 8',
  'maths teacher at home',
  'english tutor near me',
  'tuition center for matric',
  'I need a teacher for my kids',
  'science tutor at home',
  'Quran teacher at home',

  // ── Electronics not in catalog ───────────────────────────────────────────
  'mobile phone screen repair',
  'iPhone screen broken need repair',
  'phone not charging repair',
  'smartphone screen cracked service',
  'laptop and computer repair',
  'laptop screen broken repair',
  'laptop not turning on repair',
  'computer repair at home',
  'laptop battery replacement needed',
  'laptop overheating repair',
  'I want to repair my laptop',
  'my laptop is not working',
  'laptop slow and freezing repair',
  'led tv screen repair',
  'TV screen damaged need repair',
  'I need tv repair',
  'smart tv not working repair',
  'tv screen broken fix',
  'LED tv panel replacement',
  'tv remote not working',
  'OLED tv repair service',
  'oven repair service',
  'I need oven repair',
  'gas oven not heating properly',
  'electric oven not baking repair',
  'oven temperature not reaching',
  'microwave oven repair',
  'microwave not heating food',
  'microwave sparking inside repair',
  'water dispenser repair',
  'water cooler not cooling repair',
  'water dispenser hot tap not working',
  'electric iron not working',
  'iron not heating up repair',
  'steam iron leaking water',
  'electric kettle not boiling',
  'room heater not working',
  'gas heater repair service',
  'electric room heater element broken',
  'hair dryer not working repair',
  'juicer blender not working',
  'food processor repair',
  'electric stove not heating repair',
  'induction cooker not working',
  'rice cooker repair service',
  'bread toaster repair',
  'electric pressure cooker fault',
  'electric geyser repair service',
  'gas geyser burner not igniting',
  'geyser not giving hot water repair',
  'UPS battery replacement',
  'inverter battery dead replacement',
  'solar inverter repair service',
  'CCTV DVR not recording repair',
  'router modem repair service',

  // ── Home renovation / carpentry ──────────────────────────────────────────
  'paint my house walls',
  'wall painting and whitewash',
  'house interior painting service',
  'carpenter to make furniture',
  'wood work for doors and wardrobe',
  'false ceiling and gypsum work',
  'marble and tile fixing mason',
  'floor tiles repair and fixing',
  'kitchen renovation work',
  'kitchen cabinet making carpenter',
  'wooden door frame repair',
  'wardrobe installation carpenter',
  'wooden flooring installation',
  'bathroom tiles replacement',
  'kitchen granite countertop installation',
  'home renovation civil work',
  'wall plastering and POP service',

  // ── Garden / pests ───────────────────────────────────────────────────────
  'gardener for lawn maintenance',
  'plant trimming and landscaping',
  'pest control fumigation for cockroaches',
  'termite treatment for home',
  'rodent rat extermination',
  'dengue spray fumigation service',
  'mosquito spray service',
  'bed bugs treatment service',
  'ant infestation control service',

  // ── Personal care / beauty ───────────────────────────────────────────────
  'beauty parlour at home',
  'haircut salon service at home',
  'massage therapist at home',
  'mehndi artist for event',
  'waxing threading at home',
  'facial service at home',
  'makeup artist for wedding',
  'bridal makeup service',

  // ── Food / catering / events ─────────────────────────────────────────────
  'cook for home food',
  'catering service for wedding',
  'birthday event decoration',
  'photographer for wedding',
  'event management service',
  'wedding hall decoration',
  'videographer needed for event',
  'food delivery service',
  'chef at home for dinner',

  // ── Moving / shifting / labor ────────────────────────────────────────────
  'packers and movers house shifting',
  'truck for furniture shifting',
  'labour for loading unloading',
  'house shifting service',
  'cargo transport service',
  'furniture moving help needed',

  // ── Security / CCTV / internet ───────────────────────────────────────────
  'security guard for house',
  'CCTV camera installation',
  'internet wifi connection installation',
  'cable tv connection problem',
  'PTCL broadband connection',
  'wifi router installation',
  'intercom installation home',
  'electric fence installation',
  'door access control system',
  'alarm system installation home',

  // ── Automotive — not in catalog ──────────────────────────────────────────
  'car wash and detailing at home',
  'car interior cleaning service',
  'car tinting service',
  'car seat cover stitching',
  'car audio system installation',
  'car dashboard wrapping',

  // ── Medical / health ─────────────────────────────────────────────────────
  'doctor visit at home',
  'nurse for patient care',
  'physiotherapy at home',
  'blood test at home',
  'ambulance service needed',

  // ── Solar / energy ───────────────────────────────────────────────────────
  'solar panel installation at home',
  'solar system setup for house',
  'net metering solar installation',

  // ── Miscellaneous ─────────────────────────────────────────────────────────
  'locksmith to open door lock',
  'key cutting duplicate key',
  'safe cracking locksmith',
  'pool swimming pool cleaning',
  'water feature pond cleaning',
  'generator repair service',
  'genset maintenance service',
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
