import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-10 text-center sm:pt-24">
        <p className="text-sm font-semibold tracking-[0.2em] text-amber-700 uppercase">
          Namma Vivaham
        </p>
        <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
          A beautiful wedding invitation, live in minutes
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg">
          Pick a template, add your story and photos, and share one link with
          every guest — with RSVPs, a countdown, directions, and a QR code
          built in.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <Link
              key={t.id}
              href={`/create/${t.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`relative flex h-44 items-end bg-gradient-to-br p-5 ${t.cardGradient}`}
              >
                <div className={`${t.cardTextClass}`}>
                  <p className="text-xs font-semibold tracking-widest uppercase opacity-80">
                    {t.tagline}
                  </p>
                  <p className="mt-1 font-serif text-2xl font-bold">
                    {t.name}
                  </p>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-5">
                <p className="text-sm text-neutral-600">{t.description}</p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-amber-700 group-hover:underline">
                  Use this template
                  <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-100 bg-neutral-50">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 py-16 sm:grid-cols-3">
          <Feature
            title="Live preview"
            body="See your invitation update as you type — names, dates, photos, colors, all in real time."
          />
          <Feature
            title="One link, one QR code"
            body="Share a single page with every guest, with directions, RSVPs and a live countdown."
          />
          <Feature
            title="₹199, pay once"
            body="Publish for a flat one-time fee. Editing afterwards is always free."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-serif text-lg font-semibold text-neutral-900">
        {title}
      </h3>
      <p className="mt-2 text-sm text-neutral-600">{body}</p>
    </div>
  );
}
