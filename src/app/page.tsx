import { Stars } from "@/components/Stars";
import { WaitlistForm } from "@/components/WaitlistForm";

export default function Home() {
  return (
    <main className="relative z-10 min-h-screen overflow-hidden">
      <Stars />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 pt-10 sm:px-10 sm:pt-14">
        <header className="float-in float-in-1 flex items-center justify-between">
          <span className="font-display text-2xl italic tracking-tight text-cream">
            halostar
          </span>
          <span className="hidden text-xs uppercase tracking-[0.25em] text-cream-faint sm:block">
            est. mumbai
          </span>
        </header>

        <section className="flex flex-1 flex-col justify-center py-16 sm:py-24">
          <p className="float-in float-in-1 mb-6 text-xs uppercase tracking-[0.3em] text-cream-muted">
            <span className="text-saffron">✦</span>&nbsp; coming soon
          </p>

          <h1 className="float-in float-in-2 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            <span className="italic text-gradient-warm">vedic astrology</span>
            <br />
            <span className="text-cream">in your actual voice.</span>
          </h1>

          <p className="float-in float-in-3 mt-8 max-w-xl text-lg leading-relaxed text-cream-muted sm:text-xl">
            nakshatra, dasha, gochar — the whole cosmic group chat, decoded in
            the way you already talk. no aunty whatsapp forwards, no fluff.
            just real readings that hit.
          </p>

          <div className="float-in float-in-4">
            <WaitlistForm />
          </div>

          <p className="float-in float-in-5 mt-6 max-w-md text-sm text-cream-faint">
            first 1,000 inboxes get free access on launch day. mercury&rsquo;s
            keeping receipts.
          </p>
        </section>

        <footer className="float-in float-in-5 pb-8 text-xs text-cream-faint">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>© halostar — built in mumbai, written in the stars.</span>
            <span className="font-display italic text-cream-muted">
              &ldquo;the universe&rsquo;s in your group chat now.&rdquo;
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
