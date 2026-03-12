import Link from "next/link";

const TOOLS = ["Zapier", "Make", "n8n", "Power Automate", "Pabbly", "Activepieces", "Airtable", "Shopify Flow"];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-flatline-deeper text-white overflow-x-hidden">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-purple-950/40 rounded-full blur-[140px]" />
        <div className="absolute top-40 -right-20 w-[500px] h-[500px] bg-rose-900/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-950/30 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 border-b border-white/5 glass sticky top-0">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight flex items-center gap-1.5">
            <span className="gradient-text-red">⚡</span>
            <span className="text-white">Flatline</span>
          </span>
          <div className="flex items-center gap-1">
            <Link href="/login" className="text-flatline-muted hover:text-white text-sm px-4 py-2 rounded-lg transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="bg-flatline-red hover:bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1">

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-32 pb-20">
          <div className="max-w-2xl">
            <p className="text-flatline-muted text-sm mb-6 tracking-wide">Silent monitoring for automations</p>

            <h1 className="text-5xl sm:text-6xl font-bold leading-[1.08] tracking-tight mb-7">
              <span className="text-white">Your workflows run.</span>
              <br />
              <span className="gradient-text-red">Until they don&apos;t.</span>
            </h1>

            <p className="text-flatline-muted text-lg leading-relaxed mb-10 max-w-md">
              We watch your automations and tell you the moment one goes quiet. One URL. Any tool. Two minutes to set up.
            </p>

            <div className="flex items-center gap-3">
              <Link href="/signup" className="group bg-flatline-red hover:bg-rose-500 text-white font-medium px-6 py-3 rounded-xl text-sm transition-all hover:shadow-glow-red">
                Start for free
                <span className="ml-1.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 inline-block transition-all">→</span>
              </Link>
              <span className="text-flatline-muted text-xs">No credit card · 3 monitors free</span>
            </div>
          </div>
        </section>

        {/* How it works — minimal, editorial */}
        <section className="max-w-5xl mx-auto px-6 pb-28">
          <div className="grid sm:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
            {[
              { n: "1", title: "Create a monitor", body: "Name it. Pick your silence threshold." },
              { n: "2", title: "Drop in one URL", body: "Paste it as the last step of any automation." },
              { n: "3", title: "Go on with your life", body: "We ping-watch it. You hear from us only when something's wrong." },
            ].map((item) => (
              <div key={item.n} className="bg-flatline-dark/80 p-8 group hover:bg-flatline-card transition-colors">
                <p className="text-flatline-red/50 font-mono text-sm mb-6">{item.n}.</p>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-flatline-muted text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Works with */}
        <section className="max-w-5xl mx-auto px-6 pb-28">
          <p className="text-flatline-muted text-xs uppercase tracking-widest mb-5">Works with</p>
          <div className="flex flex-wrap gap-2">
            {TOOLS.map((tool) => (
              <span key={tool} className="border border-white/8 bg-white/3 text-flatline-muted text-xs px-4 py-2 rounded-full hover:text-white hover:border-white/15 transition-colors cursor-default">
                {tool}
              </span>
            ))}
            <span className="border border-white/5 text-flatline-muted/50 text-xs px-4 py-2 rounded-full">
              + anything with a webhook
            </span>
          </div>
        </section>

        {/* Quote / story — single tight block */}
        <section className="max-w-5xl mx-auto px-6 pb-28">
          <div className="border-l-2 border-flatline-red/40 pl-8 py-2 max-w-xl">
            <p className="text-white text-xl font-medium leading-relaxed mb-4">
              &ldquo;The Zap broke on Tuesday. We found out Friday when a customer called.&rdquo;
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-5xl mx-auto px-6 pb-32">
          <div className="relative rounded-2xl overflow-hidden border border-white/8 p-12 sm:p-16" style={{background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255,45,85,0.08), transparent), linear-gradient(135deg, #0E0E1A 0%, #080810 100%)"}}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 max-w-sm">
              Know before your customers do.
            </h2>
            <p className="text-flatline-muted mb-8 max-w-sm">Free for up to 3 monitors. No card, no setup calls, no demos.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-flatline-red hover:bg-rose-500 text-white font-medium px-7 py-3.5 rounded-xl text-sm transition-all hover:shadow-glow-red">
              Get started free →
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-7">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <span className="text-flatline-muted text-xs">© {new Date().getFullYear()} Flatline</span>
          <span className="text-flatline-muted text-xs">The silent alarm for your automations</span>
        </div>
      </footer>
    </div>
  );
}
