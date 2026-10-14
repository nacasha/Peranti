import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center flex-1 px-4 py-16 text-center">
      <img src="/logo.svg" alt="Peranti logo" width={96} height={96} className="mb-6" />
      <h1 className="text-4xl font-bold mb-3">Peranti</h1>
      <p className="text-lg text-fd-muted-foreground max-w-xl mb-8">
        Next generation developer toolbox. Format JSON, convert timestamps, encode text, hash, and much more:
        fully offline, free and open source.
      </p>
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        <Link
          href="/docs"
          className="rounded-lg bg-fd-primary px-5 py-2.5 font-medium text-fd-primary-foreground"
        >
          Read the docs
        </Link>
        <a
          href="https://github.com/nacasha/Peranti/releases"
          className="rounded-lg border px-5 py-2.5 font-medium"
        >
          Download
        </a>
      </div>
      <img
        src="/screenshots/peranti.png"
        alt="Peranti screenshot"
        className="w-full max-w-5xl rounded-xl border shadow-lg"
      />
    </main>
  );
}
