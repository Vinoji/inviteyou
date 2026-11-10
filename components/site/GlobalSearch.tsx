"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { BookOpen, CircleHelp, Compass, LayoutTemplate, Loader2, PartyPopper, Search, X, type LucideIcon } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { searchItems, type SearchItem, type SearchKind } from "@/lib/search";

const GROUPS: { kind: SearchKind; icon: LucideIcon }[] = [
  { kind: "page", icon: Compass },
  { kind: "occasion", icon: PartyPopper },
  { kind: "design", icon: LayoutTemplate },
  { kind: "help", icon: CircleHelp },
  { kind: "guide", icon: BookOpen },
];

// One fetch per language per visit, shared by every open.
const cache = new Map<string, Promise<SearchItem[]>>();
function loadIndex(locale: string) {
  if (!cache.has(locale)) {
    cache.set(
      locale,
      fetch(`/api/search/${locale}`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => {
          cache.delete(locale);
          return [];
        })
    );
  }
  return cache.get(locale)!;
}

/** What shows before anything is typed: the pages people look for most. */
const SUGGESTED = ["/templates", "/templates#free", "/#pricing", "/invitations/wedding", "/invitations/baby-shower", "/demo", "/support#faq"];

/**
 * Site-wide search in the header: designs, occasions and traditions,
 * guides, pages and features, and the FAQ — in the site's language.
 * Opens from the button, Ctrl/⌘+K or "/". The index loads on first open.
 */
export default function GlobalSearch({ className = "" }: { className?: string }) {
  const t = useTranslations("site.search");
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    let live = true;
    loadIndex(locale).then((list) => live && setItems(list));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      live = false;
      document.body.style.overflow = prev;
    };
  }, [open, locale]);

  const results = useMemo(() => {
    if (!items) return [];
    if (!query.trim()) return SUGGESTED.map((href) => items.find((i) => i.href === href)).filter((i): i is SearchItem => !!i);
    return searchItems(items, query);
  }, [items, query]);

  // Grouped for display; `flat` keeps keyboard order the same as on screen.
  const grouped = useMemo(() => {
    const lists = GROUPS.map((g) => ({ ...g, list: results.filter((r) => r.kind === g.kind) })).filter((g) => g.list.length);
    // each group's first row number, so keyboard order matches the screen
    return lists.map((g, gi) => ({ ...g, start: lists.slice(0, gi).reduce((n, x) => n + x.list.length, 0) }));
  }, [results]);
  const flat = grouped.flatMap((g) => g.list);

  function close() {
    setOpen(false);
    setQuery("");
    setActive(0);
  }
  function go(item: SearchItem) {
    close();
    router.push(item.href);
  }
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") return close();
    if (!flat.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = (active + (e.key === "ArrowDown" ? 1 : -1) + flat.length) % flat.length;
      setActive(next);
      listRef.current?.querySelector(`[data-i="${next}"]`)?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[active] ?? flat[0]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex h-10 items-center gap-2 rounded-full border border-[#e8b04a]/50 px-3 text-sm text-[#ffe9b8] transition hover:bg-white/10 ${className}`}
        aria-label={t("open")}
        aria-haspopup="dialog"
      >
        <Search size={16} aria-hidden />
        <span className="hidden lg:inline">{t("open")}</span>
        <kbd className="hidden rounded border border-[#e8b04a]/40 px-1.5 text-[10px] text-[#ffe9b8]/70 lg:inline">⌘K</kbd>
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/50 px-3 pt-[8vh] backdrop-blur-sm" onMouseDown={close}>
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t("open")}
              className="flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#e8b04a]/40 bg-[#fffaf2] shadow-2xl dark:bg-[#1c1220]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-[#e8b04a]/30 px-4">
                <Search size={18} className="shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onKeyDown}
                  placeholder={t("placeholder")}
                  className="h-14 min-w-0 flex-1 bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-500 dark:text-neutral-50"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="site-search-list"
                  aria-activedescendant={flat.length ? `site-search-${active}` : undefined}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button type="button" onClick={close} className="rounded-full p-1.5 text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10" aria-label={t("close")}>
                  <X size={18} aria-hidden />
                </button>
              </div>

              <ul ref={listRef} id="site-search-list" role="listbox" className="flex-1 overflow-y-auto overscroll-contain p-2">
                {!items && (
                  <li className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-500">
                    <Loader2 size={16} className="animate-spin" aria-hidden /> {t("loading")}
                  </li>
                )}
                {items && query.trim() && !flat.length && (
                  <li className="py-10 text-center text-sm text-neutral-500">{t("empty", { q: query.trim() })}</li>
                )}
                {items && !query.trim() && flat.length > 0 && (
                  <li className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-amber-800 uppercase dark:text-amber-300">{t("suggested")}</li>
                )}
                {grouped.map(({ kind, icon: Icon, list, start }) => (
                  <li key={kind} role="presentation">
                    {query.trim() && (
                      <p className="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-amber-800 uppercase dark:text-amber-300">{t(`groups.${kind}`)}</p>
                    )}
                    <ul role="presentation">
                      {list.map((item, n) => {
                        const i = start + n;
                        return (
                          <li
                            key={`${item.kind}${item.href}${item.title}`}
                            id={`site-search-${i}`}
                            data-i={i}
                            role="option"
                            aria-selected={i === active}
                            onMouseMove={() => setActive(i)}
                            onClick={() => go(item)}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 ${i === active ? "bg-amber-100 dark:bg-amber-500/15" : ""}`}
                          >
                            <Icon size={17} className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-neutral-900 dark:text-neutral-50">{item.title}</span>
                              <span className="line-clamp-1 text-xs text-neutral-600 dark:text-neutral-400">{item.sub}</span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
              <p className="hidden border-t border-[#e8b04a]/30 px-4 py-2 text-[11px] text-neutral-500 sm:block">{t("keys")}</p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
