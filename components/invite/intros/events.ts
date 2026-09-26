/** Window events shared by the intro system. Kept in their own module so
 * buttons that fire them (Thank You, the editor) don't pull in any intro. */

/** Any "Replay intro" button fires this; IntroHost closes the intro again. */
export const REPLAY_INTRO_EVENT = "invite:replay-intro";

/** Fired by IntroHost when a guest opens the intro on the public page;
 * AudioToggle starts the couple's track on it. */
export const INTRO_OPENED_EVENT = "invite:intro-opened";

/** Fired by IntroHost when the intro is gone (finished, skipped this
 * session, or never shown), so the hero can play its reveal. */
export const INTRO_DONE_EVENT = "invite:intro-done";

/** Fired by RsvpForm after a successful submit; `detail.attending` says
 * whether the guest accepted. Templates can celebrate it (RsvpBurst). */
export const RSVP_SENT_EVENT = "invite:rsvp-sent";
