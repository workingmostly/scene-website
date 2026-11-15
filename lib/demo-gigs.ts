import type { AvatarSpec } from "@/components/kit/AvatarStack";

/**
 * The one cast and the one set of gigs every mockup on the home page draws
 * from, so the page reads as a single story. Friends are initials only; the
 * gold W is the signed-in user, as the app draws it.
 */
export const FRIENDS: Record<"W" | "G" | "J" | "R", AvatarSpec> = {
  W: { initial: "W", gold: true },
  G: { initial: "G" },
  J: { initial: "J" },
  R: { initial: "R" },
};

export interface DemoGig {
  id: string;
  /** yyyymmdd, for sorting */
  sort: number;
  day: number;
  month: string; // "May"
  artist: string;
  venue: string;
  city: string;
  date: string; // "Thu 10 Sep 2026"
  doors: string; // "19:00"
  provider: string;
  friends: AvatarSpec[];
  serial?: string;
}

const { W, G, J, R } = FRIENDS;

export const GIGS: DemoGig[] = [
  { id: "toothache", sort: 20260523, day: 23, month: "May", artist: "Toothache + Support", venue: "The Croft", city: "Bristol", date: "Sat 23 May 2026", doors: "19:00", provider: "Headfirst", friends: [W, G], serial: "Nº 0231" },
  { id: "foe", sort: 20260606, day: 6, month: "Jun", artist: "FOE Fest 2026", venue: "Shredenhams", city: "Bristol", date: "Sat 6 Jun 2026", doors: "15:00", provider: "Headfirst", friends: [W, G, R], serial: "Nº 0232" },
  { id: "drugchurch", sort: 20260910, day: 10, month: "Sep", artist: "Drug Church", venue: "Trinity", city: "Bristol", date: "Thu 10 Sep 2026", doors: "19:00", provider: "SeeTickets", friends: [W, J], serial: "Nº 0233" },
  { id: "hotmulligan", sort: 20261014, day: 14, month: "Oct", artist: "Hot Mulligan", venue: "SWX", city: "Bristol", date: "Wed 14 Oct 2026", doors: "19:00", provider: "DICE", friends: [G], serial: "Nº 0234" },
  { id: "bodysnatcher", sort: 20261121, day: 21, month: "Nov", artist: "Bodysnatcher & Ingested", venue: "The Fleece", city: "Bristol", date: "Sat 21 Nov 2026", doors: "18:30", provider: "Ticketmaster", friends: [W, G, J], serial: "Nº 0235" },
];

export const gig = (id: string): DemoGig => {
  const g = GIGS.find((x) => x.id === id);
  if (!g) throw new Error(`Unknown demo gig: ${id}`);
  return g;
};
