export type SessionType =
  | 'main_stage'
  | 'workshop'
  | 'talk'
  | 'breakout'
  | 'product_booth'
  | 'na';

export type ParsedSession = {
  /** data-session-id, unique per card */
  id: string;
  /** "1" | "2" | "both" */
  day: string;
  type: SessionType;
  title: string;
  location: string;
  /** minutes since midnight; 0/0 for all-day sessions */
  startMin: number;
  endMin: number;
  /** raw time text as shown on the site, e.g. "10:15am - 10:45am" or "All day" */
  timeText: string;
  /** true for sessions without a time range (product booths) or very long spans */
  allDay: boolean;
  featured: boolean;
  /** true when the session is currently on the visitor's My List */
  wishlisted: boolean;
  /** the original card element, used for the detail overlay and native anchors */
  element: HTMLElement;
};

export type PositionedSession = ParsedSession & {
  /** 0-based lane index within its overlap cluster */
  lane: number;
  /** number of lanes in the cluster this session belongs to */
  laneCount: number;
  /** true when this session overlaps another wishlisted session (clash) */
  clashing: boolean;
};
