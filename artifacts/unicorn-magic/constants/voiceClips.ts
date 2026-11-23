/**
 * Recorded voiceovers for the Read tab.
 *
 * Every fact and story is read by a real person — Mark, except f8, f9 and f10
 * which are read by Mo. There is no synthetic fallback: if an id is missing
 * here the Listen control is hidden rather than handed to a robot voice, so
 * adding a fact or story means recording a clip for it too.
 *
 * The fact filenames do NOT all match the id they belong to, and that is
 * deliberate. From f11 up, each file was recorded against the fact one place
 * earlier in the list, so f11 plays fact_f12.mp3 and so on. Checked clip by
 * clip against the text; trust this table over the filenames. fact_f11.mp3 is
 * a second reading of f10 in Mark's voice and is left unused so that f8-f10
 * stay in Mo's. Re-record rather than renaming files: renaming would make the
 * table look tidy while silently reintroducing the same off-by-one.
 *
 * require() paths must be static literals for Metro to bundle them.
 */
const FACT_CLIPS: Record<string, number> = {
  f1:  require('../assets/audio/facts/fact_f1.mp3'),
  f2:  require('../assets/audio/facts/fact_f2.mp3'),
  f3:  require('../assets/audio/facts/fact_f3.mp3'),
  f4:  require('../assets/audio/facts/fact_f4.mp3'),
  f8:  require('../assets/audio/facts/fact_f8.mp3'),
  f9:  require('../assets/audio/facts/fact_f9.mp3'),
  f10: require('../assets/audio/facts/fact_f10.mp3'),
  f11: require('../assets/audio/facts/fact_f12.mp3'),
  f12: require('../assets/audio/facts/fact_f13.mp3'),
  f13: require('../assets/audio/facts/fact_f14.mp3'),
};

const STORY_CLIPS: Record<string, number> = {
  s1:  require('../assets/audio/stories/story_s1.mp3'),
  s2:  require('../assets/audio/stories/story_s2.mp3'),
  s3:  require('../assets/audio/stories/story_s3.mp3'),
  s4:  require('../assets/audio/stories/story_s4.mp3'),
  s5:  require('../assets/audio/stories/story_s5.mp3'),
  s6:  require('../assets/audio/stories/story_s6.mp3'),
  s7:  require('../assets/audio/stories/story_s7.mp3'),
  s8:  require('../assets/audio/stories/story_s8.mp3'),
  s9:  require('../assets/audio/stories/story_s9.mp3'),
  s10: require('../assets/audio/stories/story_s10.mp3'),
  s11: require('../assets/audio/stories/story_s11.mp3'),
  s12: require('../assets/audio/stories/story_s12.mp3'),
  s13: require('../assets/audio/stories/story_s13.mp3'),
  s14: require('../assets/audio/stories/story_s14.mp3'),
  s15: require('../assets/audio/stories/story_s15.mp3'),
};

export function factClip(id: string): number | null {
  return FACT_CLIPS[id] ?? null;
}

export function storyClip(id: string): number | null {
  return STORY_CLIPS[id] ?? null;
}
