/** Lets any page ask the header's music player to start (e.g. the slideshow). */
export const AMBIENT_PLAY_EVENT = "memorial:ambient-play";

export function requestAmbientPlay() {
  window.dispatchEvent(new Event(AMBIENT_PLAY_EVENT));
}
