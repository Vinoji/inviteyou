import type { CategoryId } from "./categories";

/**
 * Ready-made stories a couple can start from in the editor, per occasion.
 * The text lives in messages/{locale}.json under
 * `storyPresets.<category>.<id>` ({title, tag, text}); `text` takes {a} and
 * {b} for the two names ({a} only for single-person occasions). Once
 * applied it's plain editable text — nothing links back to the preset.
 */
export const STORY_PRESETS: Record<CategoryId, readonly string[]> = {
  wedding: [
    "collegeSweethearts",
    "childhoodFriends",
    "loveArranged",
    "matrimony",
    "colleagues",
    "longDistance",
    "friendsWedding",
    "traditionalBlessing",
  ],
  anniversary: ["firstYear", "silverJubilee", "goldenJubilee", "renewal"],
  valentine: ["simpleNote", "everyday", "adventure"],
  proposal: ["sunset", "sinceDayOne", "withFamily"],
  birthday: ["bestFriend", "firstBirthday", "manivizha", "milestone"],
  housewarming: ["grihaPravesam", "casualParty", "firstHome"],
  engagement: ["familiesMeet", "loveStory", "traditional"],
  baby: ["valaikaappu", "babyShower", "namingCeremony"],
  corporate: ["productLaunch", "annualDay", "conference"],
};
