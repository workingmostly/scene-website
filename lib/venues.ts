/**
 * Bristol venues that appear in the site's mockups, with real coordinates.
 *
 * `label: true` marks the five venues that carry a permanent caption on the
 * map (the venues in the page's calendar mockups). The rest only show their
 * name on hover. Crofters Rights shares The Croft's building and is left out.
 */
export type Venue = { name: string; lat: number; lng: number; label?: boolean };

export const VENUES: Venue[] = [
  { name: "The Fleece", lat: 51.4523, lng: -2.5895, label: true },
  { name: "Trinity", lat: 51.4581, lng: -2.576, label: true },
  { name: "Exchange", lat: 51.4555, lng: -2.5828 },
  { name: "The Croft", lat: 51.4638, lng: -2.5901, label: true },
  { name: "SWX", lat: 51.4566, lng: -2.5922, label: true },
  { name: "Marble Factory", lat: 51.4495, lng: -2.576 },
  { name: "The Prospect Building", lat: 51.4485, lng: -2.5738 },
  { name: "Shredenhams", lat: 51.4586, lng: -2.5902, label: true },
  { name: "Thekla", lat: 51.449, lng: -2.5942 },
  { name: "Rough Trade Bristol", lat: 51.4566, lng: -2.5937 },
  { name: "The Louisiana", lat: 51.4468, lng: -2.5964 },
  { name: "O2 Academy Bristol", lat: 51.4546, lng: -2.6004 },
  { name: "Strange Brew", lat: 51.4563, lng: -2.5923 },
  { name: "The Lanes", lat: 51.4564, lng: -2.5938 },
  { name: "Bristol Beacon", lat: 51.4547, lng: -2.5983 },
  { name: "Lost Horizon", lat: 51.4608, lng: -2.5806 },
];

const lats = VENUES.map((v) => v.lat);
const lngs = VENUES.map((v) => v.lng);
const south = Math.min(...lats);
const north = Math.max(...lats);
const west = Math.min(...lngs);
const east = Math.max(...lngs);

/** `[[west, south], [east, north]]` — the LngLatBoundsLike shape mapbox-gl takes. */
export const VENUE_BOUNDS: [[number, number], [number, number]] = [
  [west, south],
  [east, north],
];

/** Centre of the venue bounding box (what the live map and the fallback both frame). */
export const VENUE_CENTER = { lng: (west + east) / 2, lat: (south + north) / 2 };

export type FitPadding = { top: number; right: number; bottom: number; left: number };

/**
 * Where the venues sit inside a w×h box. On wide cards the card's copy and
 * phone run down the centre, so the city sits in the empty right flank (the
 * lower two thirds, right of centre). On compact cards it fills the lower
 * part of the card with small margins. Used for the live map's `fitBounds`
 * padding and for the fallback's projection, so both frame Bristol identically.
 */
export function fitPadding(w: number, h: number): FitPadding {
  const compact = w < 600;
  const wide = w >= 900;
  return {
    top: Math.round(h * (wide ? 0.34 : 0.4)),
    right: compact ? 24 : wide ? 72 : 80,
    bottom: compact ? 64 : wide ? 48 : 40,
    left: compact ? 24 : wide ? Math.round(w * 0.56) : 80,
  };
}

// Equirectangular projection around the centre: x east, y south, in degrees of
// latitude (longitude scaled by cos φ so distances stay true).
const COS_LAT = Math.cos((VENUE_CENTER.lat * Math.PI) / 180);
function project(v: Venue) {
  return { x: (v.lng - VENUE_CENTER.lng) * COS_LAT, y: -(v.lat - VENUE_CENTER.lat) };
}

/**
 * Switch-on delay per venue in ms: the pins light up from the centre outwards,
 * 40ms apart (nearest the centre first, 0 → 600ms across the sixteen venues).
 */
export const VENUE_DELAY: Record<string, number> = (() => {
  const byDistance = VENUES.map((v) => {
    const p = project(v);
    return { name: v.name, d: Math.hypot(p.x, p.y) };
  }).sort((a, b) => a.d - b.d);
  const out: Record<string, number> = {};
  byDistance.forEach((v, i) => {
    out[v.name] = i * 40;
  });
  return out;
})();

export type PlacedVenue = { venue: Venue; x: number; y: number; delay: number };

/**
 * Projects every venue into a w×h pixel box, fitting the venue bounds inside
 * `pad` and centring them there (the same framing mapbox's `fitBounds` gives
 * with that padding).
 */
export function layoutVenues(w: number, h: number, pad: FitPadding = fitPadding(w, h)): PlacedVenue[] {
  const pts = VENUES.map(project);
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);

  const availW = Math.max(1, w - pad.left - pad.right);
  const availH = Math.max(1, h - pad.top - pad.bottom);
  const scale = Math.min(availW / (x1 - x0), availH / (y1 - y0));
  const originX = pad.left + availW / 2;
  const originY = pad.top + availH / 2;
  const midX = (x0 + x1) / 2;
  const midY = (y0 + y1) / 2;

  return VENUES.map((venue, i) => ({
    venue,
    x: originX + (pts[i].x - midX) * scale,
    y: originY + (pts[i].y - midY) * scale,
    delay: VENUE_DELAY[venue.name],
  }));
}
