"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { PLACE_SCENES, type Place, type PlaceScene } from "@/lib/types";
import { inputClass } from "./FormFields";

const MAX_PLACES = 6;

const SCENE_KEYS: Record<PlaceScene, string> = {
  temple: "sceneTemple",
  palace: "scenePalace",
  nature: "sceneNature",
  heritage: "sceneHeritage",
  beach: "sceneBeach",
};

/** Editor inputs for the royal layout's Places to Explore section. */
export default function PlacesFields({
  value,
  onChange,
}: {
  value: Place[];
  onChange: (next: Place[]) => void;
}) {
  const t = useTranslations("editor");
  const update = (i: number, patch: Partial<Place>) =>
    onChange(value.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  return (
    <div className="space-y-4">
      {value.map((place, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
              {t("placeLabel", { n: i + 1 })}
            </span>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="text-neutral-400 hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-400"
              aria-label={t("removeItem")}
            >
              <Trash2 size={14} />
            </button>
          </div>
          <input
            className={inputClass}
            aria-label={t("placeTitle")}
            placeholder={t("placeTitle")}
            value={place.title}
            onChange={(e) => update(i, { title: e.target.value })}
          />
          <textarea
            className={inputClass}
            rows={2}
            aria-label={t("placeDescription")}
            placeholder={t("placeDescription")}
            value={place.description}
            onChange={(e) => update(i, { description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className={inputClass}
              aria-label={t("placeDistance")}
              placeholder={t("placeDistance")}
              value={place.distance}
              onChange={(e) => update(i, { distance: e.target.value })}
            />
            <select
              className={inputClass}
              aria-label={t("placeScene")}
              value={place.scene}
              onChange={(e) => update(i, { scene: e.target.value as PlaceScene })}
            >
              {PLACE_SCENES.map((scene) => (
                <option key={scene} value={scene}>
                  {t(SCENE_KEYS[scene])}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
      {value.length < MAX_PLACES && (
        <button
          type="button"
          onClick={() =>
            onChange([...value, { title: "", description: "", distance: "", scene: "heritage" }])
          }
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <Plus size={14} />
          {t("addPlace", { count: value.length })}
        </button>
      )}
    </div>
  );
}
