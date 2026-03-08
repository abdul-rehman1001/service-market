import { Quote, Star } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      text: "I needed a plumber urgently, and I found one within an hour. Quick and reliable service!",
      name: "Farhan",
      role: "Homeowner",
      initials: "F",
      bg: "bg-emerald-100 text-emerald-700",
      metric: "Booked in under 30 min",
    },
    {
      text: "My car needed repair, and the mechanic I booked was professional and fast. Very satisfied!",
      name: "Umer",
      role: "Car Owner",
      initials: "U",
      bg: "bg-emerald-100 text-emerald-700",
      metric: "Fast response from provider",
    },
    {
      text: "Booking a house cleaner was quick and easy. He arrived on time and provided an excellent, reliable service.",
      name: "Ali",
      role: "Homeowner",
      initials: "A",
      bg: "bg-emerald-100 text-emerald-700",
      metric: "Smooth booking experience",
    },
  ];

  return (
    <section id="testimonials" className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Customer Reviews</div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              Trusted by customers across Pakistan
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
              Real experiences from people who found the right professionals for their needs. Fast, reliable, and verified.
            </p>
          </div>
          <div className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm sm:grid-cols-3">
            <div>
              <div className="text-2xl font-black text-slate-950">92%</div>
              <div className="text-sm text-slate-600">Users report faster discovery</div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-950">4.9</div>
              <div className="text-sm text-slate-600">Average satisfaction rating</div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-950">500+</div>
              <div className="text-sm text-slate-600">Verified providers listed</div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {reviews.map((review, i) => (
            <article
              key={i}
              className="group flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_24px_70px_-30px_rgba(16,185,129,0.35)]"
            >
              <Quote className="mb-6 h-9 w-9 text-emerald-200" />
              <div className="mb-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                ))}
              </div>
              <p className="flex-1 text-base leading-8 text-slate-600">&ldquo;{review.text}&rdquo;</p>
              <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">{review.metric}</div>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${review.bg}`}>
                  {review.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">{review.name}</h4>
                  <p className="text-xs text-slate-500">{review.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
