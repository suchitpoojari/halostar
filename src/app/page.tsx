import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pt-10 sm:pt-14">
      <header className="float-in float-in-1 flex items-center justify-between">
        <span className="text-sm tracking-tight text-paper">halostar</span>
        <span className="label-meta">mumbai</span>
      </header>

      <section className="flex flex-1 flex-col justify-center py-24">
        <h1 className="float-in float-in-2 serif-italic text-[44px] leading-[1.02] tracking-[-0.025em] text-paper sm:text-[60px]">
          vedic astrology,
          <br />
          in your voice.
        </h1>

        <p className="float-in float-in-3 mt-10 max-w-sm text-base leading-[1.55] text-paper-muted">
          real nakshatras, real dashas, real gochar. delivered the way you
          actually talk.
        </p>

        <div className="float-in float-in-4 mt-14">
          <Link
            href="/vibe"
            className="
              group inline-flex items-center gap-2 text-base text-paper
              transition hover:text-paper/80
            "
          >
            <span>read today&rsquo;s horoscope</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      <footer className="float-in float-in-5 py-8">
        <span className="label-meta">© halostar</span>
      </footer>
    </main>
  );
}
