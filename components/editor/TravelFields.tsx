"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Train, TravelInfo } from "@/lib/types";
import { Field, inputClass } from "./FormFields";

const MAX_AIRPORTS = 3;
const MAX_ROUTES = 2;
const MAX_TRAINS = 3;

const EMPTY_TRAIN: Train = {
  number: "",
  name: "",
  fromStation: "",
  departs: "",
  toStation: "",
  arrives: "",
  frequency: "",
};

const smallInput = `${inputClass} !px-2 !py-1.5 !text-xs`;
const addButton =
  "inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100";
const removeButton =
  "text-neutral-400 hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-400";

/** Editor inputs for the royal layout's Travel Guide section. */
export default function TravelFields({
  value,
  onChange,
}: {
  value: TravelInfo;
  onChange: (next: TravelInfo) => void;
}) {
  const t = useTranslations("editor");
  const set = (patch: Partial<TravelInfo>) => onChange({ ...value, ...patch });

  const updateRoute = (ri: number, patch: Partial<TravelInfo["routes"][number]>) =>
    set({ routes: value.routes.map((r, i) => (i === ri ? { ...r, ...patch } : r)) });
  const updateTrain = (ri: number, ti: number, field: keyof Train, v: string) =>
    updateRoute(ri, {
      trains: value.routes[ri].trains.map((tr, i) => (i === ti ? { ...tr, [field]: v } : tr)),
    });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_7rem] gap-2">
        <Field label={t("cityLabel")}>
          <input className={inputClass} value={value.city} onChange={(e) => set({ city: e.target.value })} />
        </Field>
        <Field label={t("cityCodeLabel")}>
          <input
            className={inputClass}
            value={value.cityCode}
            onChange={(e) => set({ cityCode: e.target.value })}
          />
        </Field>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t("airportsLabel")}</p>
        <div className="space-y-2">
          {value.airports.map((a, i) => (
            <div key={i} className="grid grid-cols-[4rem_1fr_5rem_auto] items-center gap-2">
              <input
                className={smallInput}
                aria-label={t("airportCode")}
                placeholder={t("airportCode")}
                value={a.code}
                onChange={(e) =>
                  set({ airports: value.airports.map((x, j) => (j === i ? { ...x, code: e.target.value } : x)) })
                }
              />
              <input
                className={smallInput}
                aria-label={t("airportName")}
                placeholder={t("airportName")}
                value={a.name}
                onChange={(e) =>
                  set({ airports: value.airports.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })
                }
              />
              <input
                className={smallInput}
                aria-label={t("airportDistance")}
                placeholder={t("airportDistance")}
                value={a.distance}
                onChange={(e) =>
                  set({
                    airports: value.airports.map((x, j) => (j === i ? { ...x, distance: e.target.value } : x)),
                  })
                }
              />
              <button
                type="button"
                className={removeButton}
                aria-label={t("removeItem")}
                onClick={() => set({ airports: value.airports.filter((_, j) => j !== i) })}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        {value.airports.length < MAX_AIRPORTS && (
          <button
            type="button"
            className={`${addButton} mt-2`}
            onClick={() => set({ airports: [...value.airports, { code: "", name: "", distance: "" }] })}
          >
            <Plus size={14} />
            {t("addAirport", { count: value.airports.length })}
          </button>
        )}
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t("trainRoutesLabel")}</p>
        <div className="space-y-3">
          {value.routes.map((route, ri) => (
            <div key={ri} className="space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Field label={t("routeFromLabel")}>
                    <input
                      className={inputClass}
                      value={route.from}
                      placeholder={t("routeFromPlaceholder")}
                      onChange={(e) => updateRoute(ri, { from: e.target.value })}
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  className={`${removeButton} mb-2.5`}
                  aria-label={t("removeRoute")}
                  onClick={() => set({ routes: value.routes.filter((_, j) => j !== ri) })}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {route.trains.map((tr, ti) => (
                <div key={ti} className="space-y-1.5 border-t border-dashed border-neutral-200 pt-2 dark:border-neutral-800">
                  <div className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-2">
                    <input
                      className={smallInput}
                      aria-label={t("trainNumber")}
                      placeholder={t("trainNumber")}
                      value={tr.number}
                      onChange={(e) => updateTrain(ri, ti, "number", e.target.value)}
                    />
                    <input
                      className={smallInput}
                      aria-label={t("trainName")}
                      placeholder={t("trainName")}
                      value={tr.name}
                      onChange={(e) => updateTrain(ri, ti, "name", e.target.value)}
                    />
                    <button
                      type="button"
                      className={removeButton}
                      aria-label={t("removeItem")}
                      onClick={() => updateRoute(ri, { trains: route.trains.filter((_, j) => j !== ti) })}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["fromStation", "departs", "toStation", "arrives"] as const).map((field) => (
                      <input
                        key={field}
                        className={smallInput}
                        aria-label={t(field)}
                        placeholder={t(field)}
                        value={tr[field]}
                        onChange={(e) => updateTrain(ri, ti, field, e.target.value)}
                      />
                    ))}
                  </div>
                  <input
                    className={smallInput}
                    aria-label={t("frequency")}
                    placeholder={t("frequency")}
                    value={tr.frequency}
                    onChange={(e) => updateTrain(ri, ti, "frequency", e.target.value)}
                  />
                </div>
              ))}
              {route.trains.length < MAX_TRAINS && (
                <button
                  type="button"
                  className={addButton}
                  onClick={() => updateRoute(ri, { trains: [...route.trains, { ...EMPTY_TRAIN }] })}
                >
                  <Plus size={14} />
                  {t("addTrain", { count: route.trains.length })}
                </button>
              )}
            </div>
          ))}
        </div>
        {value.routes.length < MAX_ROUTES && (
          <button
            type="button"
            className={`${addButton} mt-2`}
            onClick={() => set({ routes: [...value.routes, { from: "", trains: [{ ...EMPTY_TRAIN }] }] })}
          >
            <Plus size={14} />
            {t("addRoute", { count: value.routes.length })}
          </button>
        )}
      </div>
    </div>
  );
}
