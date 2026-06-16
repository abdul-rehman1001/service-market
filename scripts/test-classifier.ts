import { classifyQuery } from '../src/lib/classifier';

const queries = [
  'deep cleaning service near me for sofa and carpets', // out of scope → no match
  'sofa cleaning', // out of scope → no match
  'need a babysitter for tonight', // out of scope → no match
  'my car is not starting', // auto mechanic
  'ac not cooling', // keyword fast path → AC technician
  'sink is clogged', // plumber
  'facing problem with my fridge', // fridge ("facing" must not trigger "ac")
  
];

async function main() {
  for (const q of queries) {
    const start = Date.now();
    const r = await classifyQuery(q);
    console.log(
      `${JSON.stringify(q)} -> matched=${r.matched} category=${r.category} ` +
        `confidence=${r.confidence.toFixed(3)} (${Date.now() - start}ms)`
    );
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
