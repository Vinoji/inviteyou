"use client";

import { useCallback, useEffect, useState } from "react";
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { app } from "@/lib/firebase";

interface Stats {
  admin: string;
  revenue: { all: number; d30: number; d7: number; today: number };
  sales: { all: number; d30: number; d7: number; tests: number; byPurpose: Record<string, { count: number; inr: number }> };
  invitations: { published: number; unpaidDrafts: number; guestOpens: number; rsvps: number };
  funnel: { freeCardMakers: number; paidAfterFreeCard: number; withCoupon: number };
  days: { day: string; sales: number; inr: number }[];
  designs: { id: string; sales: number; inr: number }[];
  latest: { at: number; purpose: string; slug: string; templateId?: string; inr: number; coupon: string | null }[];
}

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const card = "rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900";

function Tile({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className={card}>
      <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-neutral-500">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard({ posthogUrl }: { posthogUrl: string }) {
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async (u: User) => {
    const res = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${await u.getIdToken()}` }, cache: "no-store" });
    setError("");
    if (res.status === 403) return setError(`${u.email} isn't an admin.`);
    if (!res.ok) return setError("Couldn't load the numbers.");
    setStats(await res.json());
  }, []);

  // signed in (or out): load the numbers for an admin
  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (u) load(u);
      }),
    [auth, load]
  );

  if (user === undefined) return <main className="p-10 text-center text-sm text-neutral-500">Loading…</main>;
  if (!user)
    return (
      <main className="mx-auto max-w-sm px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-bold">Admin</h1>
        <p className="mt-2 text-sm text-neutral-500">Sign in with an admin Google account.</p>
        <button
          type="button"
          onClick={() => signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => setError(e.message))}
          className="mt-6 h-11 w-full rounded-full bg-neutral-900 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
        >
          Sign in with Google
        </button>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </main>
    );

  const max = Math.max(1, ...(stats?.days.map((d) => d.inr) ?? [1]));
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 text-neutral-900 dark:text-neutral-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-neutral-500">{user.email}</span>
          <button type="button" onClick={() => load(user)} className="rounded-full border px-3 py-1">
            Refresh
          </button>
          <button type="button" onClick={() => signOut(auth)} className="rounded-full border px-3 py-1">
            Sign out
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!stats && !error && <p className="text-sm text-neutral-500">Loading the numbers…</p>}

      {stats && (
        <>
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Tile label="Revenue today" value={rupees(stats.revenue.today)} />
            <Tile label="Last 7 days" value={rupees(stats.revenue.d7)} sub={`${stats.sales.d7} sales`} />
            <Tile label="Last 30 days" value={rupees(stats.revenue.d30)} sub={`${stats.sales.d30} sales`} />
            <Tile label="All time" value={rupees(stats.revenue.all)} sub={`${stats.sales.all} sales · ${stats.sales.tests} tests not counted`} />
          </section>

          <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Tile label="Invitations live" value={stats.sales.byPurpose.publish.count} sub={rupees(stats.sales.byPurpose.publish.inr)} />
            <Tile label="WhatsApp videos" value={stats.sales.byPurpose.video.count} sub={rupees(stats.sales.byPurpose.video.inr)} />
            <Tile label="Restores" value={stats.sales.byPurpose.restore.count} sub={rupees(stats.sales.byPurpose.restore.inr)} />
          </section>

          <section className={card}>
            <h2 className="font-semibold">Last 30 days</h2>
            <div className="mt-4 flex h-40 items-end gap-1">
              {stats.days.map((d) => (
                <div key={d.day} className="group relative flex-1" title={`${d.day}: ${d.sales} sales, ${rupees(d.inr)}`}>
                  <div className="w-full rounded-t bg-amber-500" style={{ height: `${Math.max(d.inr ? 4 : 1, (d.inr / max) * 150)}px`, opacity: d.inr ? 1 : 0.25 }} />
                </div>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-neutral-500">
              <span>{stats.days[0]?.day}</span>
              <span>today</span>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            <div className={card}>
              <h2 className="font-semibold">Funnel</h2>
              <table className="mt-2 w-full text-sm">
                <tbody className="[&_td]:py-1.5">
                  <tr><td>Free cards made (devices)</td><td className="text-right tabular-nums">{stats.funnel.freeCardMakers}</td></tr>
                  <tr><td>…then paid to go live</td><td className="text-right tabular-nums">{stats.funnel.paidAfterFreeCard}</td></tr>
                  <tr><td>Drafts left unpaid at checkout</td><td className="text-right tabular-nums">{stats.invitations.unpaidDrafts}</td></tr>
                  <tr><td>Invitations published</td><td className="text-right tabular-nums">{stats.invitations.published}</td></tr>
                  <tr><td>Sales with a coupon</td><td className="text-right tabular-nums">{stats.funnel.withCoupon}</td></tr>
                  <tr><td>Guest opens (all invitations)</td><td className="text-right tabular-nums">{stats.invitations.guestOpens}</td></tr>
                  <tr><td>RSVPs received</td><td className="text-right tabular-nums">{stats.invitations.rsvps}</td></tr>
                </tbody>
              </table>
            </div>
            <div className={card}>
              <h2 className="font-semibold">Best-selling designs</h2>
              <table className="mt-2 w-full text-sm">
                <tbody className="[&_td]:py-1.5">
                  {stats.designs.length === 0 && <tr><td className="text-neutral-500">No sales yet.</td></tr>}
                  {stats.designs.map((d) => (
                    <tr key={d.id}><td>{d.id}</td><td className="text-right tabular-nums">{d.sales}</td><td className="w-20 text-right tabular-nums">{rupees(d.inr)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={card}>
            <h2 className="font-semibold">Latest sales</h2>
            <table className="mt-2 w-full text-sm">
              <tbody className="[&_td]:py-1.5">
                {stats.latest.map((p, i) => (
                  <tr key={i} className="border-t border-neutral-100 dark:border-neutral-800">
                    <td className="text-neutral-500">{new Date(p.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}</td>
                    <td>{p.purpose}</td>
                    <td>
                      <a className="underline" href={`/invite/${p.slug}`} target="_blank" rel="noreferrer">{p.slug}</a>
                    </td>
                    <td>{p.templateId ?? ""}</td>
                    <td className="text-right tabular-nums">{rupees(p.inr)}{p.coupon ? ` · ${p.coupon}` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className={card}>
            <h2 className="font-semibold">Visitors &amp; behaviour</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Visits, screens, taps, funnels and recordings are in PostHog.
            </p>
            <a href={posthogUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900">
              Open PostHog
            </a>
          </section>
        </>
      )}
    </main>
  );
}
