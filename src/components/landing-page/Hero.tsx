import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="text-center py-20 bg-[#f5f7f8]">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
        The Smart Way to Find and Offer Services
      </h1>

      <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
        Connect with quality services effortlessly. Whether you are looking for an expert or growing your business, we make it simple.
      </p>

      <div className="flex justify-center gap-4 mt-8">
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          Find a Service
        </Button>

        <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
          Offer a Service
        </Button>
      </div>
    </section>
  );
}
