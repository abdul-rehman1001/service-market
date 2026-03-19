/**
 * Training data for AI service classification.
 *
 * Structure:
 *   categoryKey → keywords[]     (keyword aliases used for fast matching)
 *   categoryKey → examples[]     (natural-language phrases for embedding similarity)
 *
 * `categoryKey` is matched to database categories via `categoryKeywords`.
 * Each key maps to a list of DB-compatible name patterns (case-insensitive contains match).
 */

// ---------------------------------------------------------------------------
// Keyword → DB category name mapping
// Keys here MUST match the keys in `trainingData`.
// Values are patterns matched against ServiceCategory.name (case-insensitive).
// ---------------------------------------------------------------------------
export const categoryKeywords: Record<string, string[]> = {
  plumber: ["plumb", "plumber", "plumbing"],
  electrician: ["electric", "electrician", "electrical"],
  carpenter: ["carpenter", "carpentry", "woodwork"],
  painter: ["paint", "painter", "painting"],
  mechanic: ["mechanic", "auto repair", "car repair", "vehicle"],
  cleaner: ["clean", "cleaner", "cleaning", "maid", "housekeeping", "janitor"],
  ac_technician: ["ac", "air condition", "hvac", "cooling", "heating"],
  pest_control: ["pest", "termite", "fumigat", "exterminator", "insect", "cockroach", "rat"],
  landscaper: ["landscap", "garden", "lawn", "yard"],
  mason: ["mason", "masonry", "bricklayer", "brick"],
  welder: ["weld", "welder", "welding"],
  roofer: ["roof", "roofer", "roofing"],
  tiler: ["tile", "tiler", "tiling", "flooring"],
  glass_worker: ["glass", "glazier", "window repair", "mirror"],
  locksmith: ["lock", "locksmith", "key", "door lock"],
  appliance_repair: ["appliance", "washing machine", "fridge", "refrigerator", "oven", "dryer", "dishwasher"],
  tailor: ["tailor", "sewing", "stitching", "alteration", "garment"],
  moving: ["mov", "mover", "moving", "relocation", "shifting", "packers"],
  handyman: ["handyman", "general repair", "odd job", "fix it"],
};

// ---------------------------------------------------------------------------
// Training examples per category – used for embedding-based similarity
// ---------------------------------------------------------------------------
export const trainingData: Record<string, string[]> = {
  plumber: [
    "fix leaking pipe", "repair broken pipe", "pipe is leaking",
    "water dripping from pipe", "burst pipe repair",
    "fix sink", "sink not draining", "clogged sink", "sink faucet broken",
    "install faucet", "replace tap", "faucet leaking", "tap installation",
    "unclog drain", "blocked drain", "slow drainage", "clean drain pipe",
    "fix toilet", "toilet not flushing", "running toilet", "toilet installation",
    "water heater repair", "geyser not working", "install water tank",
    "bathroom fitting", "shower head replacement", "water supply issue",
    "i need a plumber", "plumber near me", "plumbing service",
  ],
  electrician: [
    "fix wiring", "electrical wiring problem", "rewiring needed",
    "faulty wiring", "wire replacement", "electrician needed",
    "install light", "ceiling light fitting", "chandelier installation",
    "light fixture setup", "new lights needed", "LED installation",
    "repair socket", "outlet not working", "socket replacement",
    "plug point broken", "fix electrical outlet",
    "fix circuit breaker", "breaker keeps tripping", "fuse box repair",
    "install ceiling fan", "fan not working", "exhaust fan installation",
    "fan replacement", "inverter installation", "UPS repair",
    "i need an electrician", "electrical repair", "power outage fix",
  ],
  carpenter: [
    "build table", "custom furniture", "make cabinet",
    "construct bookshelf", "wooden furniture needed",
    "repair chair", "fix broken table", "cabinet door repair",
    "furniture restoration", "mend wooden items",
    "install door", "door replacement", "door frame installation",
    "build deck", "deck construction", "wooden deck installation",
    "install cabinets", "kitchen cabinet", "wardrobe installation",
    "built-in storage", "custom cabinetry", "shelf installation",
    "i need a carpenter", "woodworking service", "wood repair",
  ],
  painter: [
    "paint house", "wall painting", "interior painting",
    "exterior painting", "room painting", "ceiling painting",
    "paint job", "house painter needed", "repaint walls",
    "texture painting", "spray painting", "color consultation",
    "i need a painter", "painting service", "fresh coat of paint",
  ],
  mechanic: [
    "car repair", "engine problem", "brake repair",
    "oil change", "car not starting", "vehicle repair",
    "tire replacement", "car service", "auto repair",
    "bike repair", "motorcycle repair", "transmission problem",
    "i need a mechanic", "mechanic near me", "car mechanic",
  ],
  cleaner: [
    "house cleaning", "deep cleaning", "office cleaning",
    "carpet cleaning", "window cleaning", "maid service",
    "spring cleaning", "move out cleaning", "sanitization",
    "sofa cleaning", "bathroom cleaning", "kitchen cleaning",
    "i need a cleaner", "cleaning service", "home cleaning",
  ],
  ac_technician: [
    "ac not cooling", "air conditioner repair", "ac installation",
    "ac service", "ac gas refill", "split ac installation",
    "window ac repair", "hvac service", "ac maintenance",
    "ac leaking water", "ac making noise", "central air repair",
    "i need ac repair", "ac technician", "air conditioning service",
  ],
  pest_control: [
    "cockroach problem", "termite treatment", "pest spray",
    "rat infestation", "bed bug treatment", "ant problem",
    "mosquito control", "fumigation service", "pest extermination",
    "i need pest control", "insect problem", "rodent control",
  ],
  landscaper: [
    "lawn mowing", "garden maintenance", "tree trimming",
    "landscaping service", "hedge trimming", "plant care",
    "garden design", "sprinkler installation", "yard cleanup",
    "i need a gardener", "landscaping", "lawn care",
  ],
  mason: [
    "brick work", "wall construction", "masonry repair",
    "concrete work", "stone wall", "foundation repair",
    "plaster repair", "cement work", "build boundary wall",
    "i need a mason", "masonry service", "bricklayer",
  ],
  welder: [
    "welding work", "metal fabrication", "gate welding",
    "iron railing", "steel work", "grill installation",
    "welding repair", "metal gate", "iron work",
    "i need a welder", "welding service",
  ],
  roofer: [
    "roof repair", "roof leaking", "roof installation",
    "gutter repair", "roof waterproofing", "shingle replacement",
    "roof inspection", "ceiling leak", "roof maintenance",
    "i need a roofer", "roofing service",
  ],
  tiler: [
    "tile installation", "bathroom tiles", "kitchen tiles",
    "floor tiling", "wall tiling", "tile repair",
    "marble flooring", "ceramic tile", "mosaic tiles",
    "i need a tiler", "tiling service", "flooring installation",
  ],
  glass_worker: [
    "window glass replacement", "glass door repair", "mirror installation",
    "broken glass repair", "glass partition", "glass shower door",
    "i need a glass worker", "glazier service",
  ],
  locksmith: [
    "locked out", "change locks", "lock repair",
    "key cutting", "door lock installation", "padlock open",
    "smart lock installation", "lock replacement",
    "i need a locksmith", "locksmith service",
  ],
  appliance_repair: [
    "washing machine repair", "fridge not cooling", "oven repair",
    "dryer not working", "dishwasher repair", "microwave repair",
    "refrigerator repair", "appliance not working",
    "i need appliance repair", "home appliance service",
  ],
  tailor: [
    "stitch clothes", "dress alteration", "suit tailoring",
    "curtain stitching", "hem pants", "shirt fitting",
    "custom dress", "uniform stitching", "garment repair",
    "i need a tailor", "tailoring service",
  ],
  moving: [
    "house shifting", "office relocation", "moving service",
    "furniture moving", "packers and movers", "truck for moving",
    "need help moving", "shifting service", "relocation service",
    "i need movers", "moving company",
  ],
  handyman: [
    "general repair", "odd jobs", "fix things around house",
    "home repair", "small repairs", "maintenance work",
    "hang pictures", "assemble furniture", "mount tv",
    "i need a handyman", "handyman service", "home maintenance",
  ],
};