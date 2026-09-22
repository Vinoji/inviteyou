import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-semibold tracking-widest text-amber-700 uppercase">
        404
      </p>
      <h1 className="mt-3 font-serif text-3xl font-bold text-neutral-900">
        We couldn&apos;t find that invitation
      </h1>
      <p className="mt-3 max-w-md text-sm text-neutral-600">
        This link may be mistyped, or the invitation hasn&apos;t been
        published yet.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white"
      >
        Create your own invitation
      </Link>
    </main>
  );
}
